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
      <path className="fill-none stroke-transparent stroke-[20px] pointer-events-auto cursor-pointer" d={d} onClick={handleEdgeClick} />
      <path
        className={`fill-none pointer-events-auto cursor-pointer transition-all duration-200 ${isSelected ? "stroke-[#7ed6df] stroke-[3px]" : "stroke-slate-400 dark:stroke-stone-600 stroke-2"}`}
        d={d}
        onClick={handleEdgeClick}
      />

      {/* Label is rendered in HTML layer via foreignObject so it can be styled nicely relative to Canvas */}
      <foreignObject
        x={midX - 100}
        y={midY - 20}
        width="200"
        height="40"
        className="pointer-events-none overflow-visible"
      >
        <div
          className={`absolute top-[20px] left-[100px] bg-white dark:bg-stone-900 border px-2 py-1 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm transition-all duration-200 whitespace-nowrap ${isSelected ? "!border-[#7ed6df] !text-gray-900 dark:!text-gray-50 z-20" : "border-slate-200 dark:border-stone-800"}`}
          onClick={handleEdgeClick}
          
        >
          {edge.condition || "Unnamed Transition"}
        </div>
      </foreignObject>
    </>
  );
}
