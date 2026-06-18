import { useState } from "react";
import { Plus, FileText, Trash2, Copy, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { TEMPLATES } from "@/lib/docs/templates";
import type { DocFile } from "@/lib/docs/types";
import logo from "@/assets/rvops-logo.png";
import { cn } from "@/lib/utils";

interface Props {
  docs: DocFile[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  createDoc: (doc: DocFile) => void;
  deleteDoc: (id: string) => void;
  duplicateDoc: (id: string) => void;
}

export function Sidebar({ docs, activeId, setActiveId, createDoc, deleteDoc, duplicateDoc }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = docs.filter((d) =>
    [d.name, d.meta.client, d.meta.projectName].join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-surface/50 flex flex-col h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logo} alt="RVops" className="h-6 w-auto" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-muted-foreground mt-1">
            DOCS · STUDIO
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              <Plus className="size-4" />
              Novo documento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">Escolha um template</DialogTitle>
              <DialogDescription>
                Cada template é editável depois — adicione, remova ou reordene seções como quiser.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    createDoc(t.build());
                    setOpen(false);
                  }}
                  className="group relative text-left rounded-xl border border-border bg-surface hover:border-primary/60 transition-all p-4 overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--gradient-iridescent)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <FileText className="size-5 text-primary mb-3" />
                  <div className="font-semibold mb-1">{t.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{t.description}</div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar documento..."
            className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin mt-4 px-2 pb-4">
        <div className="px-3 py-2 text-[10px] font-mono tracking-[0.2em] text-muted-foreground">
          DOCUMENTOS · {filtered.length}
        </div>
        {filtered.map((d) => (
          <div
            key={d.id}
            onClick={() => setActiveId(d.id)}
            className={cn(
              "group relative rounded-lg px-3 py-2.5 mb-1 cursor-pointer transition-all",
              d.id === activeId
                ? "bg-surface-2 border border-border-strong"
                : "hover:bg-surface/70 border border-transparent",
            )}
          >
            {d.id === activeId && (
              <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[var(--gradient-iridescent)]" />
            )}
            <div className="text-sm font-medium truncate pl-2">{d.name}</div>
            <div className="text-[11px] text-muted-foreground truncate pl-2 mt-0.5">
              {d.meta.client || d.meta.projectName || "Sem cliente"}
            </div>
            <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateDoc(d.id); }}
                className="p-1 rounded hover:bg-surface-3 text-muted-foreground hover:text-foreground"
                title="Duplicar"
              >
                <Copy className="size-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Excluir "${d.name}"?`)) deleteDoc(d.id);
                }}
                className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-border text-[11px] text-muted-foreground flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-success" />
        Salvo automaticamente no navegador
      </div>
    </aside>
  );
}
