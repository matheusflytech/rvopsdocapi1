import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Type,
  AlignLeft,
  AlertCircle,
  ListTree,
  Table as TableIcon,
  Network,
  Code2,
  PenLine,
  Layers,
} from "lucide-react";
import { Editable } from "./Editable";
import { newBlock, uidGen } from "@/lib/docs/templates";
import type { Block } from "@/lib/docs/types";
import { cn } from "@/lib/utils";

interface Props {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function BlockView({ block, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
  return (
    <div className="group relative">
      <div className="absolute -left-12 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-0.5">
        <button onClick={onMoveUp} className="p-1 rounded hover:bg-surface-2 text-muted-foreground" title="Mover cima">
          <ChevronUp className="size-3.5" />
        </button>
        <button onClick={onMoveDown} className="p-1 rounded hover:bg-surface-2 text-muted-foreground" title="Mover baixo">
          <ChevronDown className="size-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive" title="Excluir">
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="mb-5">{renderBlock(block, onChange)}</div>
    </div>
  );
}

function renderBlock(block: Block, onChange: (b: Block) => void) {
  switch (block.type) {
    case "heading":
      return (
        <Editable
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Subtítulo da seção"
          className={cn(
            "font-display font-normal tracking-tight",
            block.level === 2 ? "text-3xl" : "text-2xl",
          )}
        />
      );

    case "paragraph":
      return (
        <Editable
          multiline
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Escreva um parágrafo..."
          className="text-[15px] leading-[1.75] text-foreground/85"
        />
      );

    case "callout": {
      const variants = {
        warning: { icon: AlertTriangle, color: "text-[oklch(0.78_0.15_75)]", bg: "bg-[oklch(0.78_0.15_75/0.08)]", border: "border-[oklch(0.78_0.15_75/0.35)]" },
        info: { icon: Info, color: "text-[oklch(0.72_0.16_220)]", bg: "bg-[oklch(0.72_0.16_220/0.08)]", border: "border-[oklch(0.72_0.16_220/0.35)]" },
        success: { icon: CheckCircle2, color: "text-success", bg: "bg-[oklch(0.72_0.16_155/0.08)]", border: "border-[oklch(0.72_0.16_155/0.35)]" },
      };
      const v = variants[block.variant];
      const Icon = v.icon;
      return (
        <div className={cn("relative rounded-xl border p-4 pl-5 flex gap-3", v.bg, v.border)}>
          <select
            value={block.variant}
            onChange={(e) => onChange({ ...block, variant: e.target.value as any })}
            className="absolute right-2 top-2 text-[10px] font-mono bg-transparent border border-border rounded px-1 py-0.5 opacity-0 group-hover:opacity-100"
          >
            <option value="warning">warning</option>
            <option value="info">info</option>
            <option value="success">success</option>
          </select>
          <Icon className={cn("size-4 mt-0.5 shrink-0", v.color)} />
          <Editable
            multiline
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Mensagem do aviso..."
            className="text-sm leading-relaxed flex-1"
          />
        </div>
      );
    }

    case "keyvalue": {
      return (
        <div className="surface-card rounded-xl p-5">
          {block.title !== undefined && (
            <div className="flex items-center gap-2 mb-4">
              <div className="size-1.5 rounded-full bg-primary" />
              <Editable
                value={block.title || ""}
                onChange={(title) => onChange({ ...block, title })}
                placeholder="título do bloco"
                className="text-[11px] font-mono tracking-[0.2em] text-muted-foreground uppercase"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            {block.items.map((it, i) => (
              <div key={it.id} className="group/kv relative">
                <Editable
                  value={it.key}
                  onChange={(key) => {
                    const items = [...block.items];
                    items[i] = { ...it, key };
                    onChange({ ...block, items });
                  }}
                  placeholder="LABEL"
                  className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground uppercase mb-1.5"
                />
                <Editable
                  value={it.value}
                  onChange={(value) => {
                    const items = [...block.items];
                    items[i] = { ...it, value };
                    onChange({ ...block, items });
                  }}
                  placeholder="Valor"
                  className="text-[15px] italic text-foreground/70 min-h-[1.5em]"
                />
                <button
                  onClick={() => {
                    const items = block.items.filter((_, j) => j !== i);
                    onChange({ ...block, items });
                  }}
                  className="absolute -top-1 -right-1 opacity-0 group-hover/kv:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => onChange({ ...block, items: [...block.items, { id: uidGen(), key: "Nova chave", value: "" }] })}
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="size-3" /> adicionar campo
          </button>
        </div>
      );
    }

    case "table": {
      return (
        <div className="surface-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/40">
                {block.columns.map((c, i) => (
                  <th key={i} className="text-left px-4 py-3 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                    <Editable
                      value={c}
                      onChange={(text) => {
                        const columns = [...block.columns];
                        columns[i] = text;
                        onChange({ ...block, columns });
                      }}
                      placeholder="Coluna"
                    />
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={r.id} className="group/row border-b border-border last:border-0 hover:bg-surface/40">
                  {r.cells.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-foreground/85 align-top">
                      <Editable
                        multiline
                        value={cell}
                        onChange={(text) => {
                          const rows = [...block.rows];
                          const cells = [...rows[ri].cells];
                          cells[ci] = text;
                          rows[ri] = { ...rows[ri], cells };
                          onChange({ ...block, rows });
                        }}
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="text-right px-2">
                    <button
                      onClick={() => onChange({ ...block, rows: block.rows.filter((_, i) => i !== ri) })}
                      className="opacity-0 group-hover/row:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-2/30 border-t border-border">
            <button
              onClick={() => onChange({ ...block, rows: [...block.rows, { id: uidGen(), cells: block.columns.map(() => "") }] })}
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <Plus className="size-3" /> linha
            </button>
            <button
              onClick={() => onChange({ ...block, columns: [...block.columns, "Coluna"], rows: block.rows.map((r) => ({ ...r, cells: [...r.cells, ""] })) })}
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <Plus className="size-3" /> coluna
            </button>
            {block.columns.length > 1 && (
              <button
                onClick={() => onChange({ ...block, columns: block.columns.slice(0, -1), rows: block.rows.map((r) => ({ ...r, cells: r.cells.slice(0, -1) })) })}
                className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 ml-auto"
              >
                remover última coluna
              </button>
            )}
          </div>
        </div>
      );
    }

    case "endpoints": {
      const methodColor: Record<string, string> = {
        GET: "bg-[oklch(0.72_0.16_220)] text-white",
        POST: "bg-success text-black",
        PUT: "bg-warning text-black",
        PATCH: "bg-[oklch(0.68_0.2_310)] text-white",
        DELETE: "bg-destructive text-white",
      };
      return (
        <div className="space-y-3">
          {block.items.map((e, i) => (
            <div key={e.id} className="surface-card rounded-xl overflow-hidden group/ep">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-2/40">
                <select
                  value={e.method}
                  onChange={(ev) => {
                    const items = [...block.items];
                    items[i] = { ...e, method: ev.target.value as any };
                    onChange({ ...block, items });
                  }}
                  className={cn("font-mono text-[11px] font-bold px-2 py-1 rounded border-0 cursor-pointer", methodColor[e.method])}
                >
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <Editable
                  value={e.path}
                  onChange={(path) => {
                    const items = [...block.items];
                    items[i] = { ...e, path };
                    onChange({ ...block, items });
                  }}
                  placeholder="/v1/recurso"
                  className="font-mono text-sm text-foreground flex-1"
                />
                <button
                  onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                  className="opacity-0 group-hover/ep:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <Editable
                  multiline
                  value={e.description}
                  onChange={(description) => {
                    const items = [...block.items];
                    items[i] = { ...e, description };
                    onChange({ ...block, items });
                  }}
                  placeholder="Descrição do endpoint..."
                  className="text-sm text-foreground/80 leading-relaxed"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <CodeField
                    label="Request"
                    value={e.request}
                    onChange={(request) => {
                      const items = [...block.items];
                      items[i] = { ...e, request };
                      onChange({ ...block, items });
                    }}
                  />
                  <CodeField
                    label="Response"
                    value={e.response}
                    onChange={(response) => {
                      const items = [...block.items];
                      items[i] = { ...e, response };
                      onChange({ ...block, items });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...block, items: [...block.items, { id: uidGen(), method: "GET", path: "/", description: "", request: "", response: "" }] })}
            className="w-full py-2.5 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
          >
            <Plus className="size-3 inline mr-1" /> Adicionar endpoint
          </button>
        </div>
      );
    }

    case "mapping": {
      const statusColors: Record<string, string> = {
        "Concluído": "bg-success/20 text-success border-success/30",
        "Em andamento": "bg-warning/20 text-warning border-warning/30",
        "Pendente": "bg-muted-foreground/20 text-muted-foreground border-border-strong",
      };
      return (
        <div className="surface-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Plataforma</th>
                <th className="text-left px-4 py-3">Ação realizada</th>
                <th className="text-left px-4 py-3 w-40">Status</th>
                <th className="text-left px-4 py-3">Observações</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {block.items.map((it, i) => (
                <tr key={it.id} className="group/m border-b border-border last:border-0 hover:bg-surface/40 align-top">
                  <td className="px-4 py-3 font-medium">
                    <Editable value={it.platform} onChange={(platform) => {
                      const items = [...block.items]; items[i] = { ...it, platform }; onChange({ ...block, items });
                    }} placeholder="ex: Blip" />
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
                    <Editable multiline value={it.action} onChange={(action) => {
                      const items = [...block.items]; items[i] = { ...it, action }; onChange({ ...block, items });
                    }} placeholder="o que foi feito" />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={it.status}
                      onChange={(e) => {
                        const items = [...block.items]; items[i] = { ...it, status: e.target.value as any }; onChange({ ...block, items });
                      }}
                      className={cn("text-[11px] font-mono px-2 py-1 rounded-full border cursor-pointer bg-transparent", statusColors[it.status])}
                    >
                      <option value="Concluído">Concluído</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-foreground/70 text-[13px]">
                    <Editable multiline value={it.notes} onChange={(notes) => {
                      const items = [...block.items]; items[i] = { ...it, notes }; onChange({ ...block, items });
                    }} placeholder="—" />
                  </td>
                  <td>
                    <button
                      onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                      className="opacity-0 group-hover/m:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => onChange({ ...block, items: [...block.items, { id: uidGen(), platform: "", action: "", status: "Concluído", notes: "" }] })}
            className="w-full py-2.5 text-xs text-muted-foreground hover:text-primary bg-surface-2/30 border-t border-border"
          >
            <Plus className="size-3 inline mr-1" /> linha
          </button>
        </div>
      );
    }

    case "code":
      return (
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-2/40 border-b border-border">
            <input
              value={block.language}
              onChange={(e) => onChange({ ...block, language: e.target.value })}
              className="bg-transparent text-[11px] font-mono text-muted-foreground tracking-wider uppercase w-20 focus:outline-none"
            />
          </div>
          <Editable
            multiline
            value={block.code}
            onChange={(code) => onChange({ ...block, code })}
            placeholder="cole o snippet aqui..."
            className="font-mono text-[13px] text-foreground/90 p-4 whitespace-pre-wrap"
          />
        </div>
      );

    case "signature":
      return (
        <div className="grid md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-border">
          {block.items.map((s, i) => (
            <div key={s.id} className="group/s relative pt-8 border-t-2 border-foreground/40">
              <Editable
                value={s.name}
                onChange={(name) => {
                  const items = [...block.items]; items[i] = { ...s, name }; onChange({ ...block, items });
                }}
                placeholder="Nome do responsável"
                className="font-medium text-foreground"
              />
              <Editable
                value={s.role}
                onChange={(role) => {
                  const items = [...block.items]; items[i] = { ...s, role }; onChange({ ...block, items });
                }}
                placeholder="Cargo / Papel"
                className="text-[13px] text-muted-foreground mt-1"
              />
              <button
                onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                className="absolute top-0 right-0 opacity-0 group-hover/s:opacity-100 p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      );
  }
}

function CodeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-surface-2/40 rounded-lg overflow-hidden border border-border">
      <div className="px-3 py-1.5 text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase border-b border-border">{label}</div>
      <Editable
        multiline
        value={value}
        onChange={onChange}
        placeholder='{ "exemplo": "valor" }'
        className="font-mono text-[12px] text-foreground/90 p-3 whitespace-pre-wrap min-h-[80px]"
      />
    </div>
  );
}

export const BLOCK_PALETTE: { type: string; label: string; icon: any }[] = [
  { type: "heading", label: "Subtítulo", icon: Type },
  { type: "paragraph", label: "Parágrafo", icon: AlignLeft },
  { type: "callout", label: "Aviso / Callout", icon: AlertCircle },
  { type: "keyvalue", label: "Campos chave-valor", icon: ListTree },
  { type: "table", label: "Tabela", icon: TableIcon },
  { type: "endpoints", label: "Endpoints de API", icon: Network },
  { type: "mapping", label: "Mapeamento de plataformas", icon: Layers },
  { type: "code", label: "Bloco de código", icon: Code2 },
  { type: "signature", label: "Assinaturas", icon: PenLine },
];

export { newBlock };
