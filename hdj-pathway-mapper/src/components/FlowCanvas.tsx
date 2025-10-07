import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import type { FlowNode } from "../models/project";
import { useProjectStore, selectActiveFlow } from "../state/projectStore";

const snapToGrid = (value: number, grid = 8) => Math.round(value / grid) * grid;

export const FlowCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { flow, nodes, edges } = useProjectStore((state) => {
    const activeFlow = selectActiveFlow(state);
    return {
      flow: activeFlow,
      nodes: activeFlow?.nodes ?? [],
      edges: activeFlow?.edges ?? []
    };
  });
  const selectNode = useProjectStore((state) => state.selectNode);
  const selectedNodeId = useProjectStore((state) => state.selectedNodeId);
  const updateNodePosition = useProjectStore((state) => state.updateNodePosition);
  const connectNodes = useProjectStore((state) => state.connectNodes);
  const addNode = useProjectStore((state) => state.addNode);
  const steps = useProjectStore((state) => state.project.library.steps);
  const checkpoint = useProjectStore((state) => state.checkpoint);

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const getStepLabel = useCallback(
    (node: FlowNode) => steps.find((step) => step.id === node.stepRef)?.label ?? "Étape",
    [steps]
  );

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const stepId = event.dataTransfer.getData("text/plain");
      if (!stepId) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = snapToGrid(event.clientX - rect.left);
      const y = snapToGrid(event.clientY - rect.top);
      addNode(stepId, { x, y });
    },
    [addNode]
  );

  const handleDragOver = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, node: FlowNode) => {
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const initial = { x: node.x, y: node.y };
      let hasCommitted = false;
      const move = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const x = snapToGrid(initial.x + dx);
        const y = snapToGrid(initial.y + dy);
        if (!hasCommitted) {
          checkpoint();
          hasCommitted = true;
        }
        updateNodePosition(node.id, { x, y });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [updateNodePosition]
  );

  const handleNodeClick = useCallback(
    (nodeId: string, event: ReactMouseEvent<HTMLButtonElement>) => {
      if (event.altKey) {
        setConnectingFrom(nodeId);
        return;
      }
      if (connectingFrom && connectingFrom !== nodeId) {
        connectNodes(connectingFrom, nodeId);
        setConnectingFrom(null);
        return;
      }
      selectNode(nodeId);
    },
    [connectingFrom, connectNodes, selectNode]
  );

  const renderedEdges = useMemo(() => {
    return edges.map((edge) => {
      const from = nodes.find((node) => node.id === edge.from);
      const to = nodes.find((node) => node.id === edge.to);
      if (!from || !to) return null;
      const path = `M ${from.x + 120} ${from.y + 32} L ${to.x} ${to.y + 32}`;
      return <path key={edge.id} d={path} stroke="#94a3b8" strokeWidth={2} fill="none" markerEnd="url(#arrow)" />;
    });
  }, [edges, nodes]);

  if (!flow) {
    return <div style={{ padding: "2rem" }}>Aucun parcours actif.</div>;
  }

  return (
    <div
      id="flow-canvas"
      ref={canvasRef}
      role="presentation"
      style={{
        flex: 1,
        position: "relative",
        backgroundImage: "linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        overflow: "hidden"
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
          </marker>
        </defs>
        {renderedEdges}
      </svg>
      {nodes.map((node) => {
        const label = getStepLabel(node);
        const isSelected = selectedNodeId === node.id;
        const isConnecting = connectingFrom === node.id;
        return (
          <button
            key={node.id}
            type="button"
            onClick={(event) => handleNodeClick(node.id, event)}
            onPointerDown={(event) => handlePointerDown(event, node)}
            style={{
              position: "absolute",
              top: node.y,
              left: node.x,
              minWidth: 160,
              padding: "0.75rem 1rem",
              borderRadius: 12,
              border: `2px solid ${isSelected ? "#38bdf8" : "rgba(148,163,184,0.5)"}`,
              background: isConnecting ? "rgba(56,189,248,0.15)" : "rgba(15,23,42,0.8)",
              color: "white",
              cursor: "grab",
              textAlign: "left",
              userSelect: "none"
            }}
          >
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {steps.find((step) => step.id === node.stepRef)?.durationMin ?? 0} min
            </div>
            <div style={{ position: "absolute", insetInlineEnd: -4, top: "50%", transform: "translateY(-50%)" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#38bdf8" }} />
            </div>
          </button>
        );
      })}
    </div>
  );
};
