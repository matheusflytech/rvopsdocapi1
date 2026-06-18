import { useCallback, useEffect, useState } from "react";
import type { DocFile } from "./types";
import { apiDocsTemplate } from "./templates";

const KEY = "rvops.docs.v1";
const ACTIVE_KEY = "rvops.docs.activeId";

function read(): DocFile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DocFile[];
  } catch {
    return [];
  }
}

function write(docs: DocFile[]) {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export function useDocsStore() {
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = read();
    if (existing.length === 0) {
      const seed = apiDocsTemplate();
      seed.name = "Exemplo — Documentação de API";
      write([seed]);
      setDocs([seed]);
      setActiveId(seed.id);
      localStorage.setItem(ACTIVE_KEY, seed.id);
    } else {
      setDocs(existing);
      const saved = localStorage.getItem(ACTIVE_KEY);
      setActiveId(saved && existing.find((d) => d.id === saved) ? saved : existing[0].id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(docs);
  }, [docs, hydrated]);

  useEffect(() => {
    if (hydrated && activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId, hydrated]);

  const updateActive = useCallback(
    (updater: (d: DocFile) => DocFile) => {
      setDocs((prev) =>
        prev.map((d) => (d.id === activeId ? { ...updater(d), updatedAt: Date.now() } : d)),
      );
    },
    [activeId],
  );

  const createDoc = useCallback((doc: DocFile) => {
    setDocs((prev) => [doc, ...prev]);
    setActiveId(doc.id);
  }, []);

  const deleteDoc = useCallback(
    (id: string) => {
      setDocs((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (id === activeId) setActiveId(next[0]?.id ?? null);
        return next;
      });
    },
    [activeId],
  );

  const duplicateDoc = useCallback((id: string) => {
    setDocs((prev) => {
      const original = prev.find((d) => d.id === id);
      if (!original) return prev;
      const copy: DocFile = {
        ...JSON.parse(JSON.stringify(original)),
        id: Math.random().toString(36).slice(2, 10),
        name: `${original.name} (cópia)`,
        updatedAt: Date.now(),
      };
      setActiveId(copy.id);
      return [copy, ...prev];
    });
  }, []);

  const active = docs.find((d) => d.id === activeId) ?? null;

  return {
    hydrated,
    docs,
    active,
    activeId,
    setActiveId,
    updateActive,
    createDoc,
    deleteDoc,
    duplicateDoc,
  };
}
