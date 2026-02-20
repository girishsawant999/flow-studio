import type { MouseEvent as ReactMouseEvent } from "react";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import type { Position } from "../types";
import { ShortcutsHint } from "./Canvas/ShortcutsHint";
import { ZoomControls } from "./Canvas/ZoomControls";
import FlowEdge from "./Edge";
import FlowNode from "./Node";

import { useCanvasViewport } from "../hooks/useCanvasViewport";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { FlowNameEditor } from "./Canvas/FlowNameEditor";

const Canvas = () => {
  const { state, dispatch } = useFlow();
  const {
    canvasRef,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: handleViewportMouseUp,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    transform,
  } = useCanvasViewport();

  // Dragging connection state
  const [isDrawingEdge, setIsDrawingEdge] = useState(false);
  const [drawingEdgeSource, setDrawingEdgeSource] = useState<string | null>(
    null,
  );
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });

  const updateMousePos = (e: ReactMouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const normalizedX = (rawX - transform.x) / transform.zoom;
      const normalizedY = (rawY - transform.y) / transform.zoom;
      setMousePos({ x: normalizedX, y: normalizedY });
    }
  };

  const handleMouseMoveInternal = (e: ReactMouseEvent) => {
    updateMousePos(e);
    handleMouseMove(e);
  };

  const handleMouseUpInternal = () => {
    handleViewportMouseUp();
    if (isDrawingEdge) {
      setIsDrawingEdge(false);
      setDrawingEdgeSource(null);
    }
  };

  // Add new node at interaction position or viewport center
  const addNewNode = () => {
    const newPosition = state.lastInteractionPosition
      ? {
          x: state.lastInteractionPosition.x + 75,
          y: state.lastInteractionPosition.y + 120,
        }
      : {
          x: (400 - transform.x) / transform.zoom,
          y: (300 - transform.y) / transform.zoom,
        };

    dispatch({
      type: "ADD_NODE",
      payload: {
        id: `node_${uuidv4().substring(0, 6)}`,
        description: "New Step",
        prompt: "",
        position: newPosition,
      },
    });
  };

  useKeyboardShortcuts({
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    addNewNode,
  });

  // Node Handle Events connection
  const onHandleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDrawingEdge(true);
    setDrawingEdgeSource(nodeId);
  };

  const onHandleMouseUp = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawingEdge && drawingEdgeSource && drawingEdgeSource !== nodeId) {
      dispatch({
        type: "ADD_EDGE",
        payload: {
          id: `edge_${uuidv4().substring(0, 8)}`,
          sourceNodeId: drawingEdgeSource,
          targetNodeId: nodeId,
          condition: "New Condition",
        },
      });
    }
    setIsDrawingEdge(false);
    setDrawingEdgeSource(null);
  };

  const renderDrawingEdge = () => {
    if (!isDrawingEdge || !drawingEdgeSource) return null;
    const sourceNode = state.nodes.find((n) => n.id === drawingEdgeSource);
    if (!sourceNode) return null;

    const startX = sourceNode.position.x + 220;
    const startY = sourceNode.position.y + 60;
    const endX = mousePos.x;
    const endY = mousePos.y;

    const cp1x = startX + Math.abs(endX - startX) * 0.5;
    const cp1y = startY;
    const cp2x = endX - Math.abs(endX - startX) * 0.5;
    const cp2y = endY;

    const pathData = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;

    return (
      <path
        className="fill-none stroke-2 stroke-[#7ed6df] pointer-events-none"
        d={pathData}
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <div
      id="canvas-area"
      className={`flex-1 relative overflow-hidden bg-slate-50 dark:bg-stone-950 ${isPanning ? "cursor-move" : ""}`}
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveInternal}
      onMouseUp={handleMouseUpInternal}
      onMouseLeave={handleMouseUpInternal}
    >
      <div
        className={`absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#292524_1px,transparent_1px)] delay-0 ${!isPanning ? "transition-[background-position,background-size] duration-150 ease-out" : ""}`}
        style={{
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          backgroundSize: `${20 * transform.zoom}px ${20 * transform.zoom}px`,
        }}
      />

      <FlowNameEditor />

      <div
        className={`absolute inset-0 origin-top-left pointer-events-none ${!isPanning ? "transition-transform duration-150 ease-out" : ""}`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {state.edges.map((edge) => (
            <FlowEdge key={edge.id} edge={edge} />
          ))}
          {renderDrawingEdge()}
        </svg>

        {state.nodes.map((node) => (
          <FlowNode
            key={node.id}
            node={node}
            onHandleMouseDown={onHandleMouseDown}
            onHandleMouseUp={onHandleMouseUp}
            zoom={transform.zoom}
          />
        ))}
      </div>

      <ShortcutsHint />

      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
      />
    </div>
  );
};

export default React.memo(Canvas);
