export type BlockType =
  | "heading"
  | "paragraph"
  | "callout"
  | "keyvalue"
  | "table"
  | "endpoints"
  | "mapping"
  | "code"
  | "signature";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  text: string;
  level: 2 | 3;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  text: string;
}

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  variant: "warning" | "info" | "success";
  text: string;
}

export interface KeyValueBlock extends BaseBlock {
  type: "keyvalue";
  title?: string;
  items: { id: string; key: string; value: string }[];
}

export interface TableBlock extends BaseBlock {
  type: "table";
  columns: string[];
  rows: { id: string; cells: string[] }[];
}

export interface EndpointItem {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  request: string;
  response: string;
}

export interface EndpointsBlock extends BaseBlock {
  type: "endpoints";
  items: EndpointItem[];
}

export interface MappingItem {
  id: string;
  platform: string;
  action: string;
  status: "Concluído" | "Em andamento" | "Pendente";
  notes: string;
}

export interface MappingBlock extends BaseBlock {
  type: "mapping";
  items: MappingItem[];
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  language: string;
  code: string;
}

export interface SignatureBlock extends BaseBlock {
  type: "signature";
  items: { id: string; name: string; role: string }[];
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | CalloutBlock
  | KeyValueBlock
  | TableBlock
  | EndpointsBlock
  | MappingBlock
  | CodeBlock
  | SignatureBlock;

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface DocMeta {
  projectName: string;
  client: string;
  squad: string;
  owner: string;
  date: string;
  tag: string;
}

export interface DocFile {
  id: string;
  name: string;
  updatedAt: number;
  meta: DocMeta;
  title: string;
  subtitle: string;
  sections: Section[];
}
