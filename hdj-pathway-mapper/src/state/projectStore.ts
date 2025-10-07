import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type { Flow, FlowEdge, FlowNode, ProjectData, ViewMode } from "../models/project";
import { projectTemplates } from "../models/templates";

interface HistoryState {
  past: ProjectData[];
  future: ProjectData[];
}

interface ProjectState {
  project: ProjectData;
  activeFlowId: string;
  selectedNodeId?: string;
  view: ViewMode;
  history: HistoryState;
  loadProject: (project: ProjectData) => void;
  loadTemplate: (index: number) => void;
  addNode: (stepId: string, position: { x: number; y: number }) => void;
  connectNodes: (from: string, to: string) => void;
  updateNodePosition: (
    nodeId: string,
    position: { x: number; y: number },
    options?: { recordHistory?: boolean }
  ) => void;
  selectNode: (nodeId?: string) => void;
  updateView: (view: ViewMode) => void;
  updateStep: (stepId: string, payload: Partial<{ label: string; durationMin: number }>) => void;
  undo: () => void;
  redo: () => void;
  checkpoint: () => void;
}

const cloneProject = (project: ProjectData): ProjectData =>
  structuredClone(project) as ProjectData;

const pushHistory = (state: ProjectState["history"], snapshot: ProjectData) => {
  state.past.push(cloneProject(snapshot));
  if (state.past.length > 50) {
    state.past.shift();
  }
  state.future = [];
};

const initialProject = projectTemplates[0];

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: cloneProject(initialProject),
    activeFlowId: initialProject.flows[0]?.flowId ?? "",
    selectedNodeId: undefined,
    view: "flow",
    history: { past: [], future: [] },
    loadProject: (project) =>
      set((state) => {
        state.history = { past: [], future: [] };
        state.project = cloneProject(project);
        state.activeFlowId = project.flows[0]?.flowId ?? "";
        state.selectedNodeId = undefined;
      }),
    loadTemplate: (index) => {
      const template = projectTemplates[index];
      if (template) {
        get().loadProject(template);
      }
    },
    addNode: (stepId, position) =>
      set((state) => {
        const flow = state.project.flows.find((f) => f.flowId === state.activeFlowId);
        if (!flow) return;
        pushHistory(state.history, state.project);
        const node: FlowNode = { id: nanoid(), stepRef: stepId, ...position };
        flow.nodes.push(node);
        state.selectedNodeId = node.id;
      }),
    connectNodes: (from, to) =>
      set((state) => {
        const flow = state.project.flows.find((f) => f.flowId === state.activeFlowId);
        if (!flow) return;
        if (from === to) return;
        const exists = flow.edges.some((edge) => edge.from === from && edge.to === to);
        if (exists) return;
        pushHistory(state.history, state.project);
        const edge: FlowEdge = { id: nanoid(), from, to, type: "sequence" };
        flow.edges.push(edge);
      }),
    updateNodePosition: (nodeId, position, options = { recordHistory: false }) =>
      set((state) => {
        const flow = state.project.flows.find((f) => f.flowId === state.activeFlowId);
        if (!flow) return;
        const node = flow.nodes.find((n) => n.id === nodeId);
        if (!node) return;
        if (options.recordHistory) {
          pushHistory(state.history, state.project);
        }
        node.x = position.x;
        node.y = position.y;
      }),
    selectNode: (nodeId) =>
      set((state) => {
        state.selectedNodeId = nodeId;
      }),
    updateView: (view) =>
      set((state) => {
        state.view = view;
      }),
    updateStep: (stepId, payload) =>
      set((state) => {
        const step = state.project.library.steps.find((item) => item.id === stepId);
        if (!step) return;
        pushHistory(state.history, state.project);
        Object.assign(step, payload);
      }),
    undo: () =>
      set((state) => {
        const snapshot = state.history.past.pop();
        if (!snapshot) return;
        state.history.future.unshift(cloneProject(state.project));
        state.project = snapshot;
        state.activeFlowId = snapshot.flows[0]?.flowId ?? "";
      }),
    redo: () =>
      set((state) => {
        const snapshot = state.history.future.shift();
        if (!snapshot) return;
        state.history.past.push(cloneProject(state.project));
        state.project = snapshot;
        state.activeFlowId = snapshot.flows[0]?.flowId ?? "";
      }),
    checkpoint: () =>
      set((state) => {
        pushHistory(state.history, state.project);
      })
  }))
);

export const selectActiveFlow = (state: ProjectState): Flow | undefined =>
  state.project.flows.find((flow) => flow.flowId === state.activeFlowId);
