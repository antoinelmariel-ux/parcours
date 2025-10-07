import { nanoid } from "nanoid";
import type { ProjectData, StepDefinition } from "./project";

const withIds = <T extends { id: string }>(items: Omit<T, "id">[]): T[] =>
  items.map((item) => ({ ...item, id: nanoid() })) as T[];

const baseSteps: StepDefinition[] = [
  {
    id: "",
    type: "prep",
    label: "Accueil",
    durationMin: 15,
    color: "#4B7CA2"
  },
  {
    id: "",
    type: "pharma",
    label: "Pharmacie",
    durationMin: 20,
    color: "#D4A373"
  },
  {
    id: "",
    type: "monitor",
    label: "Surveillance",
    durationMin: 30,
    color: "#00857C"
  },
  {
    id: "",
    type: "consult",
    label: "Consultation",
    durationMin: 25,
    color: "#6C5DD3"
  }
];

const templateFactory = (name: string, customSteps: Partial<StepDefinition>[]) => {
  const steps = withIds(
    baseSteps.map((step, idx) => ({ ...step, ...customSteps[idx] })).slice(0, customSteps.length)
  );
  const nodes = steps.map((step, index) => ({
    id: nanoid(),
    stepRef: step.id,
    x: 120 + index * 200,
    y: 160
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    id: nanoid(),
    from: nodes[index].id,
    to: node.id,
    type: "sequence" as const
  }));

  return {
    projectId: nanoid(),
    meta: {
      name,
      version: 1,
      createdAt: new Date().toISOString()
    },
    library: {
      steps,
      resources: withIds([
        { type: "nurse", label: "IDE 1", capacity: 1 },
        { type: "chair", label: "Fauteuil A", capacity: 1 }
      ])
    },
    flows: [
      {
        flowId: nanoid(),
        name,
        nodes,
        edges
      }
    ]
  } satisfies ProjectData;
};

export const projectTemplates: ProjectData[] = [
  templateFactory("ORL – Perf courte", [
    { label: "Accueil ORL" },
    { label: "Prépa perfusion" },
    { label: "Perfusion" }
  ]),
  templateFactory("Immunothérapie", [
    { label: "Admission" },
    { label: "Préparation immuno" },
    { label: "Injection", durationMin: 45 }
  ]),
  templateFactory("Perfusion courte", [
    { label: "Accueil", durationMin: 10 },
    { label: "Prépa pharmaceutique", durationMin: 15 },
    { label: "Perfusion" },
    { label: "Surveillance", durationMin: 20 }
  ])
];
