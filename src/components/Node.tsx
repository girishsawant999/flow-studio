import React, { useEffect, useState } from "react";
import { useFlow } from "../context/FlowContext";
import type { Node as NodeType } from "../types";

interface FlowNodeProps {
  node: NodeType;
  zoom: number;
  onHandleMouseDown: (id: string, e: React.MouseEvent) => void;
  onHandleMouseUp: (id: string, e: React.MouseEvent) => void;
}

const FlowNode = React.memo(function FlowNode({
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
      const canvasEl = document.getElementById("canvas-area");
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
      className={`absolute pointer-events-auto bg-white dark:bg-stone-900 border rounded-xl p-4 min-w-[220px] shadow-sm cursor-grab select-none transition-shadow duration-200 active:cursor-grabbing hover:shadow-md ${isSelected ? "border-[#7ed6df] shadow-[0_0_0_3px_rgba(126,214,223,0.3)] z-10" : "border-slate-300 dark:border-stone-700 z-2"} ${isStart ? "border-l-4! border-l-[#7ed6df]!" : ""} animate-[slideIn_0.3s_ease-out_forwards]`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mb-3">
        {node.id}
      </div>
      <div className="font-semibold text-sm mb-1">
        {node.description || "Untitled Step"}
      </div>
      <div className="relative group">
        <div className="text-[13px] text-gray-900 dark:text-gray-50 opacity-90 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
          {node.prompt}
        </div>
        {node.prompt && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-stone-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 max-w-[300px] whitespace-normal break-words w-max">
            {node.prompt}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-stone-800" />
          </div>
        )}
      </div>

      {/* Input handle (Left) */}
      <div
        className="absolute w-4 h-4 bg-white dark:bg-stone-900 border-2 border-slate-200 dark:border-stone-800 rounded-full top-1/2 -translate-y-1/2 cursor-crosshair transition-all duration-200 z-5 hover:bg-[#7ed6df] hover:border-[#7ed6df] hover:scale-120 -left-2"
        onMouseDown={(e) => {
          e.stopPropagation();
        }} // Maybe left doesn't start edges, just receives them
        onMouseUp={(e) => onHandleMouseUp(node.id, e)}
      />

      {/* Output handle (Right) */}
      <div
        className="absolute w-4 h-4 bg-white dark:bg-stone-900 border-2 border-slate-200 dark:border-stone-800 rounded-full top-1/2 -translate-y-1/2 cursor-crosshair transition-all duration-200 z-5 hover:bg-[#7ed6df] hover:border-[#7ed6df] hover:scale-120 -right-2"
        onMouseDown={(e) => onHandleMouseDown(node.id, e)}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
});

export default FlowNode;
