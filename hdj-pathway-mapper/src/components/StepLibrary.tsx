import type { StepDefinition } from "../models/project";
import { useProjectStore } from "../state/projectStore";

interface StepLibraryProps {
  onDrop: (step: StepDefinition, position: { x: number; y: number }) => void;
}

export const StepLibrary = ({ onDrop }: StepLibraryProps) => {
  const steps = useProjectStore((state) => state.project.library.steps);

  return (
    <div aria-label="Bibliothèque des étapes" role="list">
      {steps.map((step) => (
        <button
          key={step.id}
          id={`step-${step.id}`}
          role="listitem"
          style={{
            display: "block",
            width: "100%",
            padding: "0.5rem 0.75rem",
            marginBottom: "0.5rem",
            borderRadius: 8,
            border: "1px solid rgba(148,163,184,0.5)",
            background: "transparent",
            color: "inherit",
            textAlign: "left",
            cursor: "grab"
          }}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", step.id);
            event.dataTransfer.effectAllowed = "copy";
          }}
          onDoubleClick={() => onDrop(step, { x: 160, y: 160 })}
        >
          <strong>{step.label}</strong>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{step.durationMin} min</div>
        </button>
      ))}
    </div>
  );
};
