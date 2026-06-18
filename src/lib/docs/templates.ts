import type { DocFile, Section } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyMeta = () => ({
  projectName: "",
  client: "",
  squad: "",
  owner: "",
  date: new Date().toLocaleDateString("pt-BR"),
  tag: "RVOPS · TEMPLATE",
});

export const apiDocsTemplate = (): DocFile => ({
  id: uid(),
  name: "Documentação de API",
  updatedAt: Date.now(),
  meta: emptyMeta(),
  title: "Documentação de API",
  subtitle:
    "Especificação técnica para integração de APIs consumidas pelo contato inteligente.",
  sections: [
    {
      id: uid(),
      title: "Identificação do projeto",
      blocks: [
        {
          id: uid(),
          type: "callout",
          variant: "warning",
          text: "Sempre realize uma cópia desta documentação e adicione na pasta do seu cliente antes de começar.",
        },
        {
          id: uid(),
          type: "keyvalue",
          title: "identificação do projeto",
          items: [
            { id: uid(), key: "Nome do projeto", value: "" },
            { id: uid(), key: "Squad responsável", value: "" },
            { id: uid(), key: "Responsável técnico", value: "" },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Visão Geral",
      blocks: [
        {
          id: uid(),
          type: "paragraph",
          text: "Esta documentação descreve os requisitos para a criação da API que será consumida pelo contato inteligente na plataforma.",
        },
        {
          id: uid(),
          type: "table",
          columns: ["Parâmetro", "Valor"],
          rows: [
            { id: uid(), cells: ["Protocolo", "HTTP/S"] },
            { id: uid(), cells: ["Formato de Dados", "JSON (UTF-8)"] },
            { id: uid(), cells: ["Autenticação Sugerida", "API Key ou Bearer Token"] },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Rede",
      blocks: [
        {
          id: uid(),
          type: "keyvalue",
          items: [
            { id: uid(), key: "URL Base (Produção)", value: "" },
            { id: uid(), key: "URL Base (Homologação)", value: "" },
            { id: uid(), key: "Whitelist de IPs", value: "" },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Endpoints",
      blocks: [
        {
          id: uid(),
          type: "endpoints",
          items: [
            {
              id: uid(),
              method: "GET",
              path: "/v1/recurso",
              description: "Descreva o que este endpoint faz.",
              request: '{\n  "exemplo": "valor"\n}',
              response: '{\n  "status": "ok"\n}',
            },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Mapeamento de campos",
      blocks: [
        {
          id: uid(),
          type: "table",
          columns: ["Campo na API", "Campo no Bot", "Tipo", "Obrigatório"],
          rows: [
            { id: uid(), cells: ["", "", "string", "Sim"] },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Segurança",
      blocks: [
        {
          id: uid(),
          type: "keyvalue",
          items: [
            { id: uid(), key: "Tipo de autenticação", value: "" },
            { id: uid(), key: "Local da credencial", value: "Header / Query / Body" },
            { id: uid(), key: "Política de rotação", value: "" },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Assinatura",
      blocks: [
        {
          id: uid(),
          type: "signature",
          items: [
            { id: uid(), name: "", role: "Responsável técnico — RVops" },
            { id: uid(), name: "", role: "Aprovação do cliente" },
          ],
        },
      ],
    },
  ],
});

export const mappingTemplate = (): DocFile => ({
  id: uid(),
  name: "Mapeamento do Cliente",
  updatedAt: Date.now(),
  meta: { ...emptyMeta(), tag: "RVOPS · MAPEAMENTO INTERNO" },
  title: "Mapeamento de Entregas",
  subtitle:
    "Registro interno do que foi implementado para o cliente nas plataformas envolvidas.",
  sections: [
    {
      id: uid(),
      title: "Identificação",
      blocks: [
        {
          id: uid(),
          type: "keyvalue",
          items: [
            { id: uid(), key: "Cliente", value: "" },
            { id: uid(), key: "Projeto", value: "" },
            { id: uid(), key: "Período", value: "" },
            { id: uid(), key: "Responsável RVops", value: "" },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Contexto",
      blocks: [
        {
          id: uid(),
          type: "paragraph",
          text: "Descreva brevemente o objetivo do projeto, o problema resolvido e o escopo geral entregue.",
        },
      ],
    },
    {
      id: uid(),
      title: "Entregas por plataforma",
      blocks: [
        {
          id: uid(),
          type: "mapping",
          items: [
            {
              id: uid(),
              platform: "Plataforma",
              action: "Configuração realizada",
              status: "Concluído",
              notes: "Detalhes / observações",
            },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Acessos e credenciais",
      blocks: [
        {
          id: uid(),
          type: "callout",
          variant: "warning",
          text: "Não inclua senhas em texto puro. Referencie o cofre/credencial usado.",
        },
        {
          id: uid(),
          type: "keyvalue",
          items: [
            { id: uid(), key: "Cofre utilizado", value: "" },
            { id: uid(), key: "Responsável pelos acessos", value: "" },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Pontos de atenção",
      blocks: [
        { id: uid(), type: "paragraph", text: "" },
      ],
    },
  ],
});

export const blankTemplate = (): DocFile => ({
  id: uid(),
  name: "Documento em branco",
  updatedAt: Date.now(),
  meta: emptyMeta(),
  title: "Novo documento",
  subtitle: "Adicione uma descrição curta para este documento.",
  sections: [
    {
      id: uid(),
      title: "Nova seção",
      blocks: [{ id: uid(), type: "paragraph", text: "" }],
    },
  ],
});

export const TEMPLATES: { id: string; label: string; description: string; build: () => DocFile }[] = [
  { id: "api", label: "Documentação de API", description: "Endpoints, autenticação, mapeamento de campos.", build: apiDocsTemplate },
  { id: "mapping", label: "Mapeamento do Cliente", description: "Registro interno do que foi entregue por plataforma.", build: mappingTemplate },
  { id: "blank", label: "Em branco", description: "Comece do zero com uma seção vazia.", build: blankTemplate },
];

export const newBlock = (type: string): any => {
  const id = uid();
  switch (type) {
    case "heading": return { id, type, text: "Novo título", level: 2 };
    case "paragraph": return { id, type, text: "" };
    case "callout": return { id, type, variant: "info", text: "Texto do aviso." };
    case "keyvalue": return { id, type, items: [{ id: uid(), key: "Chave", value: "Valor" }] };
    case "table": return { id, type, columns: ["Coluna 1", "Coluna 2"], rows: [{ id: uid(), cells: ["", ""] }] };
    case "endpoints": return { id, type, items: [{ id: uid(), method: "GET", path: "/", description: "", request: "", response: "" }] };
    case "mapping": return { id, type, items: [{ id: uid(), platform: "", action: "", status: "Concluído", notes: "" }] };
    case "code": return { id, type, language: "json", code: "" };
    case "signature": return { id, type, items: [{ id: uid(), name: "", role: "" }] };
  }
};

export const newSection = (): Section => ({
  id: uid(),
  title: "Nova seção",
  blocks: [{ id: uid(), type: "paragraph", text: "" }],
});

export const uidGen = uid;
