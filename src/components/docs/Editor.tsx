import { useMemo, useRef, useState } from "react";
import { Download, FileDown, Eye, Edit3, Plus, Trash2, ChevronUp, ChevronDown, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Editable } from "./Editable";
import { BlockView, BLOCK_PALETTE, newBlock } from "./BlockView";
import { newSection } from "@/lib/docs/templates";
import { exportDocx } from "@/lib/docs/export-docx";
import { importDocument } from "@/lib/docs/import-doc";
import { exportPdf } from "@/lib/docs/export-pdf";
import type { DocFile, Section } from "@/lib/docs/types";
import { cn } from "@/lib/utils";
import logo from "@/assets/rvops-logo.png";

interface Props {
  doc: DocFile;
  update: (updater: (d: DocFile) => DocFile) => void;
}

export function Editor({ doc, update }: Props) {
  const [preview, setPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(doc.sections[0]?.id ?? null);
  const printRef = useRef<HTMLDivElement>(null);

  const updateSection = (id: string, updater: (s: Section) => Section) => {
    update((d) => ({ ...d, sections: d.sections.map((s) => (s.id === id ? updater(s) : s)) }));
  };

  const tocItems = doc.sections;

  return (
    <div className="flex-1 min-h-screen flex">
      {/* Table of contents */}
      <nav className="no-print hidden lg:block w-60 shrink-0 border-r border-border py-12 px-6 sticky top-0 self-start h-screen overflow-y-auto scrollbar-thin">
        <div className="text-[10px] font-mono tracking-[0.25em] text-muted-foreground mb-4">SEÇÕES</div>
        <ul className="space-y-1">
          <li>
            <a
              href="#identificacao"
              onClick={() => setActiveSection("identificacao")}
              className={cn(
                "flex items-center gap-3 text-sm py-1.5 px-2 rounded-md transition-colors",
                activeSection === "identificacao" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-[10px] font-mono opacity-60">—</span>
              Identificação
            </a>
          </li>
          {tocItems.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#section-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-3 text-sm py-1.5 px-2 rounded-md transition-colors",
                  activeSection === s.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="text-[10px] font-mono opacity-60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{s.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="no-print sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
          <div className="max-w-3xl mx-auto px-8 py-3 flex items-center justify-between gap-3">
            <input
              value={doc.name}
              onChange={(e) => update((d) => ({ ...d, name: e.target.value }))}
              className="bg-transparent text-sm font-medium focus:outline-none flex-1 max-w-xs"
              placeholder="Nome do documento"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreview((p) => !p)}
                className="gap-1.5"
              >
                {preview ? <Edit3 className="size-3.5" /> : <Eye className="size-3.5" />}
                {preview ? "Editar" : "Preview"}
              </Button>
              
              {/* Input oculto para importar arquivo */}
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.docx,.pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImporting(true);
                  try {
                    const newDoc = await importDocument(file, doc);
                    update(() => newDoc);
                  } catch (err) {
                    alert(`Erro ao importar: ${err instanceof Error ? err.message : "Tente novamente."}`);
                  } finally {
                    setImporting(false);
                    if (fileRef.current) fileRef.current.value = "";
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                title="Importe uma transcrição, assessment ou qualquer doc — a IA vai mapear os campos automaticamente"
                className="gap-1.5 border-border hover:border-primary/60"
              >
                {importing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                {importing ? "Importando…" : "Importar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportDocx(doc)}
                className="gap-1.5 border-border hover:border-primary/60"
              >
                <FileDown className="size-3.5" />
                DOCX
              </Button>
              <Button
                size="sm"
                onClick={() => exportPdf(doc)}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="size-3.5" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Document canvas */}
        <div className={cn("max-w-3xl mx-auto px-8 py-14", preview && "pointer-events-none select-none")}>
          <div ref={printRef}>
            {/* TAG */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 text-primary text-[11px] font-mono tracking-[0.2em] uppercase mb-8">
              <span className="size-1.5 rounded-full bg-primary" />
              <Editable value={doc.meta.tag} onChange={(tag) => update((d) => ({ ...d, meta: { ...d.meta, tag } }))} />
            </div>

            {/* TITLE */}
            <h1 className="font-display text-6xl md:text-7xl leading-[0.95] tracking-tight mb-6">
              <Editable
                multiline
                as="span"
                value={doc.title}
                onChange={(title) => update((d) => ({ ...d, title }))}
                placeholder="Título do documento"
              />
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-12">
              <Editable
                multiline
                value={doc.subtitle}
                onChange={(subtitle) => update((d) => ({ ...d, subtitle }))}
                placeholder="Subtítulo / descrição curta"
              />
            </p>

            {/* IDENTIFICATION CARD */}
            <div id="identificacao" className="surface-card rounded-2xl p-7 mb-16 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-[var(--gradient-iridescent)] opacity-60" />
              <div className="flex items-center gap-2 mb-6">
                <div className="size-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
                  identificação do projeto
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                {[
                  { k: "Cliente", f: "client" as const },
                  { k: "Nome do projeto", f: "projectName" as const },
                  { k: "Responsável técnico", f: "owner" as const },
                  { k: "Squad responsável", f: "squad" as const },
                  { k: "Data", f: "date" as const },
                ].map(({ k, f }) => (
                  <div key={f}>
                    <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground uppercase mb-1.5">{k}</div>
                    <Editable
                      value={doc.meta[f]}
                      onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, [f]: v } }))}
                      placeholder={k}
                      className="text-[15px] italic text-foreground/70 min-h-[1.5em]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTIONS */}
            {doc.sections.map((section, si) => (
              <section key={section.id} id={`section-${section.id}`} className="mb-16 group/section">
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="inline-flex items-center justify-center min-w-[42px] h-[28px] px-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-mono text-xs tabular-nums">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-4xl leading-tight flex-1">
                    <Editable
                      as="span"
                      value={section.title}
                      onChange={(title) => updateSection(section.id, (s) => ({ ...s, title }))}
                      placeholder="Título da seção"
                    />
                  </h2>
                  <div className="opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (si === 0) return;
                        update((d) => {
                          const arr = [...d.sections];
                          [arr[si - 1], arr[si]] = [arr[si], arr[si - 1]];
                          return { ...d, sections: arr };
                        });
                      }}
                      className="p-1.5 rounded hover:bg-surface-2 text-muted-foreground"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (si === doc.sections.length - 1) return;
                        update((d) => {
                          const arr = [...d.sections];
                          [arr[si + 1], arr[si]] = [arr[si], arr[si + 1]];
                          return { ...d, sections: arr };
                        });
                      }}
                      className="p-1.5 rounded hover:bg-surface-2 text-muted-foreground"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir seção "${section.title}"?`))
                          update((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== section.id) }));
                      }}
                      className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="pl-0 md:pl-[58px]">
                  {section.blocks.map((block, bi) => (
                    <BlockView
                      key={block.id}
                      block={block}
                      onChange={(nb) =>
                        updateSection(section.id, (s) => ({
                          ...s,
                          blocks: s.blocks.map((b) => (b.id === block.id ? nb : b)),
                        }))
                      }
                      onDelete={() =>
                        updateSection(section.id, (s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== block.id) }))
                      }
                      onMoveUp={() => {
                        if (bi === 0) return;
                        updateSection(section.id, (s) => {
                          const arr = [...s.blocks];
                          [arr[bi - 1], arr[bi]] = [arr[bi], arr[bi - 1]];
                          return { ...s, blocks: arr };
                        });
                      }}
                      onMoveDown={() => {
                        if (bi === section.blocks.length - 1) return;
                        updateSection(section.id, (s) => {
                          const arr = [...s.blocks];
                          [arr[bi + 1], arr[bi]] = [arr[bi], arr[bi + 1]];
                          return { ...s, blocks: arr };
                        });
                      }}
                    />
                  ))}

                  <AddBlockButton
                    onAdd={(type) =>
                      updateSection(section.id, (s) => ({ ...s, blocks: [...s.blocks, newBlock(type)] }))
                    }
                  />
                </div>
              </section>
            ))}

            {/* Add section */}
            <div className="no-print mt-10 mb-24">
              <button
                onClick={() => update((d) => ({ ...d, sections: [...d.sections, newSection()] }))}
                className="w-full py-5 rounded-xl border border-dashed border-border hover:border-primary/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm inline-flex items-center justify-center gap-2"
              >
                <Plus className="size-4" />
                Adicionar nova seção
              </button>
            </div>

            {/* Footer brand */}
            <div className="flex items-center justify-between pt-8 mt-12 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <img src={logo} alt="RVops" className="h-4 w-auto opacity-60" />
                <span className="font-mono tracking-wider">DOCS · STUDIO</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBlockButton({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="no-print group/add my-3 w-full py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-[12px] text-muted-foreground hover:text-primary transition-all inline-flex items-center justify-center gap-1.5">
          <Plus className="size-3" />
          adicionar bloco
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-popover border-border p-1" align="center">
        {BLOCK_PALETTE.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => { onAdd(type); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-2 text-sm text-foreground/90 transition-colors"
          >
            <Icon className="size-4 text-primary" />
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
