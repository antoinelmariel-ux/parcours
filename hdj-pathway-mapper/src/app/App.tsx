import { useEffect, useMemo } from "react";
import { FlowCanvas } from "../components/FlowCanvas";
import { StepLibrary } from "../components/StepLibrary";
import { Inspector } from "../components/Inspector";
import { useProjectStore } from "../state/projectStore";
import { saveProject } from "../services/storage";
import { saveToFile, importFromFile } from "../services/fileSystem";
import { exportCanvasAsPng } from "../services/export";
import { projectTemplates } from "../models/templates";

const views: { id: ReturnType<typeof useProjectStore.getState>["view"]; label: string }[] = [
  { id: "flow", label: "Flow" },
  { id: "gantt", label: "Gantt" },
  { id: "table", label: "Table" },
  { id: "heatmap", label: "Heatmap" }
];

const useKeyboardShortcuts = () => {
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const updateView = useProjectStore((state) => state.updateView);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
      if (["1", "2", "3", "4"].includes(event.key)) {
        const index = Number(event.key) - 1;
        const view = views[index];
        if (view) {
          event.preventDefault();
          updateView(view.id);
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [redo, undo, updateView]);
};

const TimelinePlaceholder = () => (
  <div
    aria-label="Timeline Gantt"
    style={{
      borderTop: "1px solid rgba(148,163,184,0.4)",
      padding: "0.75rem 1rem",
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      overflowX: "auto"
    }}
  >
    <span style={{ opacity: 0.65 }}>Timeline (prototype)</span>
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          style={{
            minWidth: 80,
            padding: "0.25rem 0.5rem",
            borderRadius: 6,
            background: "rgba(148,163,184,0.15)",
            textAlign: "center"
          }}
        >
          {String(8 + index).padStart(2, "0")}:00
        </div>
      ))}
    </div>
  </div>
);

const TemplateSelector = () => {
  const loadTemplate = useProjectStore((state) => state.loadTemplate);
  const templateOptions = useMemo(
    () => projectTemplates.map((template, index) => ({ index, name: template.meta.name })),
    []
  );

  return (
    <select
      aria-label="Charger un template"
      onChange={(event) => loadTemplate(Number(event.target.value))}
      style={{
        background: "rgba(15,23,42,0.5)",
        color: "inherit",
        borderRadius: 8,
        border: "1px solid rgba(148,163,184,0.4)",
        padding: "0.35rem 0.75rem"
      }}
    >
      {templateOptions.map((option) => (
        <option key={option.index} value={option.index}>
          {option.name}
        </option>
      ))}
    </select>
  );
};

const App = () => {
  const project = useProjectStore((state) => state.project);
  const addNode = useProjectStore((state) => state.addNode);
  const view = useProjectStore((state) => state.view);
  useKeyboardShortcuts();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // fail silently; offline fallback will rely on HTTP cache
      });
    }
  }, []);

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateRows: "auto 1fr auto", background: "var(--app-surface)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(148,163,184,0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <strong>{project.meta.name}</strong>
          <TemplateSelector />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => saveProject(project)}
            style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.4)", background: "rgba(15,23,42,0.5)", color: "inherit" }}
          >
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={() => saveToFile(project)}
            style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.4)", background: "rgba(15,23,42,0.5)", color: "inherit" }}
          >
            Export .hdjpm.json
          </button>
          <button
            type="button"
            onClick={async () => {
              const imported = await importFromFile();
              useProjectStore.getState().loadProject(imported);
            }}
            style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.4)", background: "rgba(15,23,42,0.5)", color: "inherit" }}
          >
            Importer
          </button>
          <button
            type="button"
            onClick={() => {
              const canvas = document.getElementById("flow-canvas");
              if (canvas instanceof HTMLElement) {
                exportCanvasAsPng(canvas, project.meta.name.replace(/\s+/g, "-") + "-flow");
              }
            }}
            style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.4)", background: "rgba(15,23,42,0.5)", color: "inherit" }}
          >
            Export PNG
          </button>
        </div>
      </header>
      <main style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", overflow: "hidden" }}>
        <aside style={{ padding: "1rem", borderRight: "1px solid rgba(148,163,184,0.4)", overflowY: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Bibliothèque</h2>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Glissez une étape sur le canvas central.</p>
          <StepLibrary onDrop={(step, position) => addNode(step.id, position)} />
        </aside>
        <section style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <nav style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", borderBottom: "1px solid rgba(148,163,184,0.4)" }}>
            {views.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => useProjectStore.getState().updateView(item.id)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: 999,
                  border: view === item.id ? "1px solid #38bdf8" : "1px solid rgba(148,163,184,0.4)",
                  background: view === item.id ? "rgba(56,189,248,0.15)" : "transparent",
                  color: "inherit"
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ flex: 1, display: "flex" }}>
            {view === "flow" ? (
              <FlowCanvas />
            ) : (
              <div style={{ padding: "2rem", opacity: 0.6 }}>
                Vue {view} en cours de construction.
              </div>
            )}
          </div>
        </section>
        <aside style={{ padding: "1rem", borderLeft: "1px solid rgba(148,163,184,0.4)", overflowY: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Propriétés</h2>
          <Inspector />
        </aside>
      </main>
      <TimelinePlaceholder />
    </div>
  );
};

export default App;
