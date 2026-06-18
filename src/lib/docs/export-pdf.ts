import type { DocFile } from "./types";

export async function exportPdf(doc: DocFile, _element: HTMLElement) {
  const filename = slug(doc.name || "documento");
  // Set document title temporarily so the print dialog suggests the right filename
  const prev = document.title;
  document.title = filename;
  window.print();
  // Restore title after a tick
  setTimeout(() => { document.title = prev; }, 500);
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
