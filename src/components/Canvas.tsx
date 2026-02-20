import type { MouseEvent as ReactMouseEvent } from "react";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import type { Position } from "../types";
import FlowEdge from "./Edge";
import FlowNode from "./Node";

export default function Canvas() {
  const { state, dispatch } = useFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState<Position>({ x: 0, y: 0 });

  // Dragging connection state
  const [isDrawingEdge, setIsDrawingEdge] = useState(false);
  const [drawingEdgeSource, setDrawingEdgeSource] = useState<string | null>(
    null,
  );
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });

  // Handle canvas pan
  const handleMouseDown = (e: ReactMouseEvent) => {
    // Only pan if clicking on the background, not nodes
    if (
      e.target === canvasRef.current ||
      (e.target as Element).classList.contains("canvas-svg")
    ) {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX, y: e.clientY });
      dispatch({ type: "SET_SELECTED_NODE", payload: null });
      dispatch({ type: "SET_SELECTED_EDGE", payload: null });
    }
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    // Normalize mouse pos relative to canvas, considering zoom/pan
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const normalizedX = (rawX - state.transform.x) / state.transform.zoom;
      const normalizedY = (rawY - state.transform.y) / state.transform.zoom;
      setMousePos({ x: normalizedX, y: normalizedY });
    }

    if (isPanning) {
      const dx = e.clientX - startPanPos.x;
      const dy = e.clientY - startPanPos.y;

      dispatch({
        type: "SET_TRANSFORM",
        payload: {
          ...state.transform,
          x: state.transform.x + dx,
          y: state.transform.y + dy,
        },
      });
      setStartPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    // If we were drawing an edge and dropped it in empty space, cancel it
    if (isDrawingEdge) {
      setIsDrawingEdge(false);
      setDrawingEdgeSource(null);
    }
  };

  // Handle zooming
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const zoomFactor = -0.001;
      const zoomDelta = e.deltaY * zoomFactor;
      const newZoom = Math.min(
        Math.max(0.1, state.transform.zoom + zoomDelta),
        3,
      );

      // Calculate pan adjustment for zooming based on mouse position
      const rect = canvasEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomRatio = newZoom / state.transform.zoom;
      const newX = mouseX - (mouseX - state.transform.x) * zoomRatio;
      const newY = mouseY - (mouseY - state.transform.y) * zoomRatio;

      dispatch({
        type: "SET_TRANSFORM",
        payload: { x: newX, y: newY, zoom: newZoom },
      });
    };

    canvasEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvasEl.removeEventListener("wheel", handleWheel);
  }, [state.transform, dispatch]);

  // Node Handle Events connection
  const onHandleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDrawingEdge(true);
    setDrawingEdgeSource(nodeId);
  };

  const onHandleMouseUp = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawingEdge && drawingEdgeSource && drawingEdgeSource !== nodeId) {
      // Connect!
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

  // Renders the drawing line when creating an edge
  const renderDrawingEdge = () => {
    if (!isDrawingEdge || !drawingEdgeSource) return null;
    const sourceNode = state.nodes.find((n) => n.id === drawingEdgeSource);
    if (!sourceNode) return null;

    // Output handle is roughly at node's x + width, y + height/2
    const startX = sourceNode.position.x + 220; // Approx Node width
    const startY = sourceNode.position.y + 60; // Approx half height
    const endX = mousePos.x;
    const endY = mousePos.y;

    // Bezier control points
    const cp1x = startX + Math.abs(endX - startX) * 0.5;
    const cp1y = startY;
    const cp2x = endX - Math.abs(endX - startX) * 0.5;
    const cp2y = endY;

    const pathData = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;

    return (
      <path
        className="connection-path"
        d={pathData}
        strokeDasharray="5,5"
        style={{ pointerEvents: "none", stroke: "var(--accent-color)" }}
      />
    );
  };

  return (
    <div
      className="canvas-area"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="canvas-bg-pattern"
        style={{
          backgroundPosition: `${state.transform.x}px ${state.transform.y}px`,
          backgroundSize: `${20 * state.transform.zoom}px ${20 * state.transform.zoom}px`,
        }}
      />

      <div
        style={{
          transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          inset: 0,
          pointerEvents:
            "none" /* Parent catches events, nodes catch their own */,
        }}
      >
        <svg className="canvas-svg">
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
            zoom={state.transform.zoom}
          />
        ))}
      </div>
    </div>
  );
}
