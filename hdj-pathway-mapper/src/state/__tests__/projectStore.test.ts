import { describe, expect, it } from "vitest";
import { useProjectStore } from "../projectStore";

describe("projectStore", () => {
  it("ajoute un noeud depuis la bibliothèque", () => {
    const stepId = useProjectStore.getState().project.library.steps[0]?.id;
    expect(stepId).toBeTruthy();
    useProjectStore.getState().addNode(stepId!, { x: 100, y: 100 });
    const flow = useProjectStore.getState().project.flows[0];
    const node = flow.nodes.find((item) => item.stepRef === stepId);
    expect(node).toBeTruthy();
  });

  it("crée une arête entre deux noeuds", () => {
    const flow = useProjectStore.getState().project.flows[0];
    const [first, second] = flow.nodes;
    if (first && second) {
      useProjectStore.getState().connectNodes(first.id, second.id);
      expect(flow.edges.some((edge) => edge.from === first.id && edge.to === second.id)).toBe(true);
    }
  });
});
