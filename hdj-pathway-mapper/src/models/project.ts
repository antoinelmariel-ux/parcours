export type StepType =
  | "step"
  | "wait"
  | "prep"
  | "pharma"
  | "consult"
  | "monitor"
  | "exit";

export interface StepDefinition {
  id: string;
  type: StepType;
  label: string;
  durationMin: number;
  color?: string;
  icon?: string;
  tags?: string[];
}

export type ResourceType = "room" | "nurse" | "chair" | "equip";

export interface ResourceDefinition {
  id: string;
  type: ResourceType;
  label: string;
  capacity: number;
  color?: string;
  skills?: string[];
}

export type EdgeType = "sequence" | "choice" | "parallel";

export interface FlowNode {
  id: string;
  stepRef: string;
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
}

export interface Flow {
  flowId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface ProjectMeta {
  name: string;
  version: number;
  createdAt?: string;
}

export interface ProjectData {
  projectId: string;
  meta: ProjectMeta;
  library: {
    steps: StepDefinition[];
    resources: ResourceDefinition[];
  };
  flows: Flow[];
}

export type ViewMode = "flow" | "gantt" | "table" | "heatmap";
