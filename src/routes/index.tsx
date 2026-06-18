import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/docs/Sidebar";
import { Editor } from "@/components/docs/Editor";
import { useDocsStore } from "@/lib/docs/store";
import logo from "@/assets/rvops-logo.png";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const store = useDocsStore();

  if (!store.hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm font-mono tracking-widest">CARREGANDO…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        docs={store.docs}
        activeId={store.activeId}
        setActiveId={store.setActiveId}
        createDoc={store.createDoc}
        deleteDoc={store.deleteDoc}
        duplicateDoc={store.duplicateDoc}
      />
      {store.active ? (
        <Editor doc={store.active} update={store.updateActive} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <img src={logo} alt="RVops" className="h-8 w-auto opacity-60 mb-6" />
      <h2 className="font-display text-4xl mb-2">Nenhum documento ainda</h2>
      <p className="text-muted-foreground text-sm max-w-sm">
        Use o botão <span className="text-primary">Novo documento</span> ao lado para escolher um template e começar.
      </p>
    </div>
  );
}
