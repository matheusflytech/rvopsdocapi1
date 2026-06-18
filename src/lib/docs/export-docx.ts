import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  LevelFormat,
} from "docx";
import { saveAs } from "file-saver";
import type { Block, DocFile, Section } from "./types";

const BRAND = "C75A1E"; // orange
const SUBTLE = "6B6B72";
const TEXT = "1A1A1F";

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "D6D6DA" };
const borders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

function p(text: string, opts: { bold?: boolean; size?: number; color?: string; italics?: boolean } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color ?? TEXT, italics: opts.italics })],
    spacing: { after: 120 },
  });
}

function buildBlock(block: Block): (Paragraph | Table)[] {
  switch (block.type) {
    case "heading":
      return [
        new Paragraph({
          heading: block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          children: [new TextRun({ text: block.text, bold: true, color: TEXT })],
          spacing: { before: 240, after: 120 },
        }),
      ];
    case "paragraph":
      return [p(block.text || " ")];
    case "callout":
      return [
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [9360],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 9360, type: WidthType.DXA },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 8, color: BRAND },
                    bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND },
                    left: { style: BorderStyle.SINGLE, size: 16, color: BRAND },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "EAD6C2" },
                  },
                  shading: { fill: "FFF4EA", type: ShadingType.CLEAR, color: "auto" },
                  margins: { top: 160, bottom: 160, left: 200, right: 200 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "⚠  ", bold: true, color: BRAND }),
                        new TextRun({ text: block.text, color: TEXT }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "" }),
      ];
    case "keyvalue": {
      const cols = Math.min(block.items.length, 3) || 1;
      const total = 9360;
      const w = Math.floor(total / cols);
      // chunk into rows of `cols`
      const rows: TableRow[] = [];
      for (let i = 0; i < block.items.length; i += cols) {
        const chunk = block.items.slice(i, i + cols);
        while (chunk.length < cols) chunk.push({ id: "_", key: "", value: "" });
        rows.push(
          new TableRow({
            children: chunk.map(
              (it) =>
                new TableCell({
                  width: { size: w, type: WidthType.DXA },
                  borders,
                  margins: { top: 140, bottom: 140, left: 180, right: 180 },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: (it.key || "").toUpperCase(), bold: true, size: 16, color: SUBTLE })],
                      spacing: { after: 60 },
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: it.value || "—", size: 22, color: TEXT })],
                    }),
                  ],
                }),
            ),
          }),
        );
      }
      return [
        ...(block.title
          ? [new Paragraph({ children: [new TextRun({ text: block.title.toUpperCase(), bold: true, size: 18, color: BRAND })], spacing: { after: 120 } })]
          : []),
        new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: new Array(cols).fill(w), rows }),
        new Paragraph({ text: "" }),
      ];
    }
    case "table": {
      const total = 9360;
      const w = Math.floor(total / block.columns.length);
      const headerRow = new TableRow({
        tableHeader: true,
        children: block.columns.map(
          (c) =>
            new TableCell({
              width: { size: w, type: WidthType.DXA },
              borders,
              shading: { fill: "F2F2F4", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, size: 18, color: SUBTLE })] })],
            }),
        ),
      });
      const dataRows = block.rows.map(
        (r) =>
          new TableRow({
            children: r.cells.map(
              (cell, i) =>
                new TableCell({
                  width: { size: w, type: WidthType.DXA },
                  borders,
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: cell || " ", size: 20, color: TEXT })] })],
                }),
            ),
          }),
      );
      return [
        new Table({
          width: { size: total, type: WidthType.DXA },
          columnWidths: new Array(block.columns.length).fill(w),
          rows: [headerRow, ...dataRows],
        }),
        new Paragraph({ text: "" }),
      ];
    }
    case "endpoints": {
      const out: (Paragraph | Table)[] = [];
      block.items.forEach((e) => {
        out.push(
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [9360],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 9360, type: WidthType.DXA },
                    borders,
                    shading: { fill: "FAFAFB", type: ShadingType.CLEAR, color: "auto" },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: e.method, bold: true, color: "FFFFFF", size: 18 }),
                          new TextRun({ text: "   " + e.path, bold: true, color: TEXT, size: 22 }),
                        ],
                        shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
                      }),
                      new Paragraph({ children: [new TextRun({ text: e.description || " ", color: TEXT, size: 20 })], spacing: { before: 120, after: 120 } }),
                      new Paragraph({ children: [new TextRun({ text: "REQUEST", bold: true, size: 16, color: SUBTLE })] }),
                      new Paragraph({ children: [new TextRun({ text: e.request || " ", font: "Consolas", size: 18, color: TEXT })] }),
                      new Paragraph({ children: [new TextRun({ text: "RESPONSE", bold: true, size: 16, color: SUBTLE })], spacing: { before: 120 } }),
                      new Paragraph({ children: [new TextRun({ text: e.response || " ", font: "Consolas", size: 18, color: TEXT })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
        );
      });
      return out;
    }
    case "mapping": {
      const cols = ["Plataforma", "Ação", "Status", "Observações"];
      const fakeTable: Block = {
        id: block.id,
        type: "table",
        columns: cols,
        rows: block.items.map((it) => ({ id: it.id, cells: [it.platform, it.action, it.status, it.notes] })),
      };
      return buildBlock(fakeTable);
    }
    case "code":
      return [
        new Paragraph({
          children: [new TextRun({ text: block.code || " ", font: "Consolas", size: 18, color: TEXT })],
          shading: { fill: "F2F2F4", type: ShadingType.CLEAR, color: "auto" },
          spacing: { after: 120 },
        }),
      ];
    case "signature": {
      const total = 9360;
      const w = Math.floor(total / Math.max(block.items.length, 1));
      return [
        new Paragraph({ text: "" }),
        new Table({
          width: { size: total, type: WidthType.DXA },
          columnWidths: block.items.map(() => w),
          rows: [
            new TableRow({
              children: block.items.map(
                (s) =>
                  new TableCell({
                    width: { size: w, type: WidthType.DXA },
                    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: TEXT }, bottom: cellBorder, left: cellBorder, right: cellBorder },
                    margins: { top: 200, bottom: 140, left: 160, right: 160 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: s.name || " ", bold: true, size: 22, color: TEXT })] }),
                      new Paragraph({ children: [new TextRun({ text: s.role || " ", size: 18, color: SUBTLE })] }),
                    ],
                  }),
              ),
            }),
          ],
        }),
      ];
    }
  }
  return [];
}

function buildSection(section: Section, index: number): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  out.push(
    new Paragraph({
      children: [
        new TextRun({ text: String(index + 1).padStart(2, "0") + "   ", color: BRAND, bold: true, size: 22 }),
        new TextRun({ text: section.title, bold: true, color: TEXT, size: 32 }),
      ],
      spacing: { before: 360, after: 200 },
    }),
  );
  section.blocks.forEach((b) => out.push(...buildBlock(b)));
  return out;
}

export async function exportDocx(doc: DocFile) {
  const cover: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: doc.meta.tag || "RVOPS", color: BRAND, bold: true, size: 18 })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: doc.title || "Documento", bold: true, color: TEXT, size: 72 })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: doc.subtitle || " ", color: SUBTLE, size: 24, italics: true })],
      spacing: { after: 400 },
    }),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3120, 3120, 3120],
      rows: [
        new TableRow({
          children: [
            ["CLIENTE", doc.meta.client],
            ["PROJETO", doc.meta.projectName],
            ["RESPONSÁVEL", doc.meta.owner],
          ].map(
            ([k, v]) =>
              new TableCell({
                width: { size: 3120, type: WidthType.DXA },
                borders,
                margins: { top: 160, bottom: 160, left: 180, right: 180 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: k, bold: true, color: SUBTLE, size: 16 })], spacing: { after: 60 } }),
                  new Paragraph({ children: [new TextRun({ text: v || "—", color: TEXT, size: 22 })] }),
                ],
              }),
          ),
        }),
        new TableRow({
          children: [
            ["SQUAD", doc.meta.squad],
            ["DATA", doc.meta.date],
            ["VERSÃO", "1.0"],
          ].map(
            ([k, v]) =>
              new TableCell({
                width: { size: 3120, type: WidthType.DXA },
                borders,
                margins: { top: 160, bottom: 160, left: 180, right: 180 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: k, bold: true, color: SUBTLE, size: 16 })], spacing: { after: 60 } }),
                  new Paragraph({ children: [new TextRun({ text: v || "—", color: TEXT, size: 22 })] }),
                ],
              }),
          ),
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  const body = doc.sections.flatMap((s, i) => buildSection(s, i));

  const wordDoc = new Document({
    creator: "RVops",
    title: doc.title,
    styles: {
      default: { document: { run: { font: "Inter", size: 22, color: TEXT } } },
      paragraphStyles: [
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: TEXT, font: "Inter" }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: TEXT, font: "Inter" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: [...cover, ...body],
      },
    ],
  });

  const blob = await Packer.toBlob(wordDoc);
  saveAs(blob, `${slug(doc.name || "documento")}.docx`);
}

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
