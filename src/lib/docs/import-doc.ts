import type { DocFile, Section, Block } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);
const N8N_ENDPOINT = "https://integrations-hook.beeno.ai/webhook/agenteiarvopsdocapi";

// ── Extrai texto do arquivo ──────────────────────────────────────────────────
async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // Texto plano / markdown
  if (
    file.type.includes("text") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return await file.text();
  }

  // DOCX — extrai XML do Word e limpa as tags
  if (name.endsWith(".docx")) {
    try {
      const { default: JSZip } = await import("jszip");
      const zip = await JSZip.loadAsync(file);
      const xml = await zip.file("word/document.xml")?.async("text");
      if (xml) {
        return xml
          .replace(/<w:p[ >]/g, "\n<w:p>")
          .replace(/<[^>]+>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\s{2,}/g, " ")
          .trim();
      }
    } catch {
      // fallback
    }
    return await file.text().catch(() => "");
  }

  // PDF — extrai strings legíveis do binário
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder("latin1");
    const raw = decoder.decode(bytes);
    // Extrai texto entre parênteses (formato PDF)
    const matches = raw.match(/\(([^\)]{3,300})\)/g) || [];
    const extracted = matches
      .map((m) => m.slice(1, -1))
      .filter((s) => /[\w\s]{5,}/.test(s) && !/^\s*$/.test(s))
      .join(" ");
    return extracted || raw.slice(0, 6000);
  }

  // Fallback genérico
  return await file.text().catch(() => "");
}

// ── Converte resposta do Groq para DocFile ───────────────────────────────────
function mapToDocFile(
  groqDoc: any,
  existingDoc: DocFile
): DocFile {
  const meta = groqDoc.meta || {};

  const sections: Section[] = (groqDoc.sections || []).map((s: any) => {
    const blocks: Block[] = (s.blocks || []).map((b: any): Block => {
      const id = uid();

      // kv / keyvalue
      if (b.type === "kv" || b.type === "keyvalue") {
        const pairs = b.pairs || b.items || [];
        return {
          id,
          type: "keyvalue",
          title: b.title || "",
          items: pairs.map((p: any) => ({
            id: uid(),
            key: p.key || p.label || "",
            value: p.value || "",
          })),
        };
      }

      // table
      if (b.type === "table") {
        const headers = b.headers || b.columns || [];
        const rows = b.rows || [];
        return {
          id,
          type: "table",
          columns: headers,
          rows: rows.map((r: any) => ({
            id: uid(),
            cells: Array.isArray(r) ? r : r.cells || Object.values(r),
          })),
        };
      }

      // checklist / pendências → mapping block
      if (b.type === "checklist" || b.type === "pending") {
        const items = b.items || [];
        return {
          id,
          type: "mapping",
          items: items.map((item: any) => ({
            id: uid(),
            platform: "",
            action: typeof item === "string" ? item : item.text || item.label || "",
            status: item.done ? "Concluído" : "Pendente",
            notes: "",
          })),
        };
      }

      // alert / callout
      if (b.type === "alert" || b.type === "callout") {
        return {
          id,
          type: "callout",
          variant: b.variant || "warning",
          text: b.content || b.text || "",
        };
      }

      // code
      if (b.type === "code") {
        return {
          id,
          type: "code",
          language: b.language || "json",
          code: b.content || b.code || "",
        };
      }

      // paragraph / text (default)
      return {
        id,
        type: "paragraph",
        text: b.content || b.text || JSON.stringify(b),
      };
    });

    return {
      id: uid(),
      title: s.title || "Seção",
      blocks: blocks.length > 0 ? blocks : [
        { id: uid(), type: "paragraph", text: "" },
      ],
    };
  });

  return {
    ...existingDoc,
    updatedAt: Date.now(),
    title: groqDoc.title || existingDoc.title,
    subtitle: groqDoc.subtitle || existingDoc.subtitle,
    meta: {
      ...existingDoc.meta,
      client: meta.client || existingDoc.meta.client,
      projectName: meta.projectName || existingDoc.meta.projectName,
      owner: meta.owner || existingDoc.meta.owner,
      squad: meta.squad || existingDoc.meta.squad,
    },
    sections: sections.length > 0 ? sections : existingDoc.sections,
  };
}

// ── Função principal exportada ───────────────────────────────────────────────
export async function importDocument(
  file: File,
  existingDoc: DocFile
): Promise<DocFile> {
  // 1. Extrai texto
  const text = await extractText(file);
  if (!text || text.length < 20) {
    throw new Error("Não foi possível extrair texto do arquivo. Tente um formato .txt, .md ou .docx.");
  }

  // 2. Envia para o n8n / Groq
  const response = await fetch(N8N_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text.slice(0, 12000) }),
  });

  if (!response.ok) {
    throw new Error(`Erro no servidor: ${response.status}. Verifique se o workflow n8n está ativo.`);
  }

  const groqDoc = await response.json();

  if (groqDoc.error) {
    throw new Error(groqDoc.message || "Erro ao processar documento.");
  }

  // 3. Mapeia para DocFile e retorna
  return mapToDocFile(groqDoc, existingDoc);
}
