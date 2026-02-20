import React, { useEffect, useState } from "react";
import { useFlow } from "../context/FlowContext";
import type { Node as NodeType } from "../types";

interface FlowNodeProps {
  node: NodeType;
  zoom: number;
  onHandleMouseDown: (id: string, e: React.MouseEvent) => void;
  onHandleMouseUp: (id: string, e: React.MouseEvent) => void;
}

export default function FlowNode({
  node,
  zoom,
  onHandleMouseDown,
  onHandleMouseUp,
}: FlowNodeProps) {
  const { state, dispatch } = useFlow();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const isSelected = state.selectedNodeId === node.id;
  const isStart = state.startNodeId === node.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas pan
    setIsDragging(true);

    // Select this node
    dispatch({ type: "SET_SELECTED_NODE", payload: node.id });

    // Calculate offset considering zoom
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const xOffset = (e.clientX - rect.left) / zoom;
    const yOffset = (e.clientY - rect.top) / zoom;

    setDragOffset({ x: xOffset, y: yOffset });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new position based on canvas transform
      const canvasEl = document.querySelector(".canvas-area");
      if (!canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      const newX =
        (rawX - state.transform.x) / state.transform.zoom - dragOffset.x;
      const newY =
        (rawY - state.transform.y) / state.transform.zoom - dragOffset.y;

      // Restrict grid snap? (Optional, maybe snap to 10px)
      const snapX = Math.round(newX / 10) * 10;
      const snapY = Math.round(newY / 10) * 10;

      dispatch({
        type: "MOVE_NODE",
        payload: { id: node.id, position: { x: snapX, y: snapY } },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dispatch, state.transform, dragOffset, node.id]);

  return (
    <div
      className={`node-container ${isSelected ? "selected" : ""} ${isStart ? "start-node" : ""} animate-slide-in`}
      style={{
        left: node.position.x,
        top: node.position.y,
        pointerEvents: "auto", // Important so children events pass up
        zIndex: isSelected ? 10 : 2,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="node-id">{node.id}</div>
      <div className="node-title">{node.description || "Untitled Step"}</div>
      <div
        className="node-prompt"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "200px",
        }}
      >
        {node.prompt}
      </div>

      {/* Input handle (Left) */}
      <div
        className="node-handle handle-left"
        onMouseDown={(e) => {
          e.stopPropagation();
        }} // Maybe left doesn't start edges, just receives them
        onMouseUp={(e) => onHandleMouseUp(node.id, e)}
      />

      {/* Output handle (Right) */}
      <div
        className="node-handle handle-right"
        onMouseDown={(e) => onHandleMouseDown(node.id, e)}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
}
