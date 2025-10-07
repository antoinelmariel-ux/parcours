import { useMemo } from "react";
import { useProjectStore } from "../state/projectStore";

export const Inspector = () => {
  const selectedNodeId = useProjectStore((state) => state.selectedNodeId);
  const project = useProjectStore((state) => state.project);
  const updateStep = useProjectStore((state) => state.updateStep);

  const nodeInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    for (const flow of project.flows) {
      const node = flow.nodes.find((item) => item.id === selectedNodeId);
      if (node) {
        const step = project.library.steps.find((item) => item.id === node.stepRef);
        return { node, step };
      }
    }
    return null;
  }, [project, selectedNodeId]);

  if (!nodeInfo) {
    return <p style={{ opacity: 0.65 }}>Sélectionnez un bloc pour modifier ses propriétés.</p>;
  }

  const { step } = nodeInfo;

  if (!step) {
    return <p style={{ color: "tomato" }}>Étape introuvable.</p>;
  }

  return (
    <form
      style={{ display: "grid", gap: "0.75rem" }}
      aria-label="Propriétés de l'étape sélectionnée"
      onSubmit={(event) => event.preventDefault()}
    >
      <label style={{ display: "grid", gap: 4 }}>
        <span>Nom</span>
        <input
          value={step.label}
          onChange={(event) => updateStep(step.id, { label: event.target.value })}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 8,
            border: "1px solid rgba(148,163,184,0.5)",
            background: "rgba(15,23,42,0.4)",
            color: "inherit"
          }}
        />
      </label>
      <label style={{ display: "grid", gap: 4 }}>
        <span>Durée (min)</span>
        <input
          type="number"
          min={0}
          value={step.durationMin}
          onChange={(event) => updateStep(step.id, { durationMin: Number(event.target.value) })}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 8,
            border: "1px solid rgba(148,163,184,0.5)",
            background: "rgba(15,23,42,0.4)",
            color: "inherit"
          }}
        />
      </label>
    </form>
  );
};
