import React from "react";
import { useFlow } from "../context/FlowContext";
import type { Edge as EdgeType } from "../types";

interface FlowEdgeProps {
  edge: EdgeType;
}

export default function FlowEdge({ edge }: FlowEdgeProps) {
  const { state, dispatch } = useFlow();

  const sourceNode = state.nodes.find((n) => n.id === edge.sourceNodeId);
  const targetNode = state.nodes.find((n) => n.id === edge.targetNodeId);

  if (!sourceNode || !targetNode) return null;

  // Assuming node width is ~200px and height is ~100px.
  // Real implementation would measure elements using refs, but this avoids re-rendering loops for simplicity.
  // Let's use conservative hardcoded values based on CSS minimums.
  const srcX = sourceNode.position.x + 220; // right side
  const srcY = sourceNode.position.y + 50; // middle height
  const tgtX = targetNode.position.x; // left side
  const tgtY = targetNode.position.y + 50; // middle height

  // Bezier curve calculation
  const distance = Math.abs(tgtX - srcX);
  const cpOffset = distance * 0.5 + 40; // control point offset for beautiful curve

  const d = `M ${srcX},${srcY} C ${srcX + cpOffset},${srcY} ${tgtX - cpOffset},${tgtY} ${tgtX},${tgtY}`;

  const isSelected = state.selectedEdgeId === edge.id;

  // midpoint for label
  const midX = (srcX + tgtX) / 2;
  const midY = (srcY + tgtY) / 2;

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SET_SELECTED_EDGE", payload: edge.id });
  };

  return (
    <>
      <path className="connection-path-bg" d={d} onClick={handleEdgeClick} />
      <path
        className={`connection-path ${isSelected ? "selected" : ""}`}
        d={d}
        onClick={handleEdgeClick}
      />

      {/* Label is rendered in HTML layer via foreignObject so it can be styled nicely relative to Canvas */}
      <foreignObject
        x={midX - 100}
        y={midY - 20}
        width="200"
        height="40"
        style={{ pointerEvents: "none", overflow: "visible" }}
      >
        <div
          className={`edge-label ${isSelected ? "selected" : ""}`}
          onClick={handleEdgeClick}
          style={{
            position: "absolute",
            top: "20px",
            left: "100px",
            pointerEvents: "auto",
          }}
        >
          {edge.condition || "Unnamed Transition"}
        </div>
      </foreignObject>
    </>
  );
}
