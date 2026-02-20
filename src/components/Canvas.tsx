import { PencilSimple } from "@phosphor-icons/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import type { Position } from "../types";
import { ShortcutsHint } from "./Canvas/ShortcutsHint";
import { ZoomControls } from "./Canvas/ZoomControls";
import FlowEdge from "./Edge";
import FlowNode from "./Node";

export default function Canvas() {
  const { state, dispatch } = useFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState<Position>({ x: 0, y: 0 });

  // Editable flow name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(state.flowName);

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

  const handleZoomIn = useCallback(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newZoom = Math.min(state.transform.zoom + 0.2, 3);
    const zoomRatio = newZoom / state.transform.zoom;

    dispatch({
      type: "SET_TRANSFORM",
      payload: {
        x: centerX - (centerX - state.transform.x) * zoomRatio,
        y: centerY - (centerY - state.transform.y) * zoomRatio,
        zoom: newZoom,
      },
    });
  }, [state.transform, dispatch]);

  const handleZoomOut = useCallback(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newZoom = Math.max(state.transform.zoom - 0.2, 0.1);
    const zoomRatio = newZoom / state.transform.zoom;

    dispatch({
      type: "SET_TRANSFORM",
      payload: {
        x: centerX - (centerX - state.transform.x) * zoomRatio,
        y: centerY - (centerY - state.transform.y) * zoomRatio,
        zoom: newZoom,
      },
    });
  }, [state.transform, dispatch]);

  const handleCenter = useCallback(() => {
    if (state.nodes.length === 0) {
      dispatch({
        type: "SET_TRANSFORM",
        payload: { x: 0, y: 0, zoom: 1 },
      });
      return;
    }

    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const padding = 50;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    state.nodes.forEach((node) => {
      // Approximate dimensions based on typical node size
      const nodeWidth = 320;
      const nodeHeight = 150;

      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate maximum possible zoom to fit content
    const zoomX = (canvasRect.width - padding * 2) / contentWidth;
    const zoomY = (canvasRect.height - padding * 2) / contentHeight;
    const newZoom = Math.min(Math.max(0.1, Math.min(zoomX, zoomY, 1.5)), 3);

    // Calculate center coordinates
    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;

    const newX = canvasRect.width / 2 - centerX * newZoom;
    const newY = canvasRect.height / 2 - centerY * newZoom;

    dispatch({
      type: "SET_TRANSFORM",
      payload: { x: newX, y: newY, zoom: newZoom },
    });
  }, [state.nodes, dispatch]);

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

  // Add new node at interaction position or viewport center
  const addNewNode = useCallback(() => {
    const newPosition = state.lastInteractionPosition
      ? {
          x: state.lastInteractionPosition.x + 75,
          y: state.lastInteractionPosition.y + 100,
        }
      : {
          x: (400 - state.transform.x) / state.transform.zoom,
          y: (300 - state.transform.y) / state.transform.zoom,
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
  }, [dispatch, state.transform, state.lastInteractionPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const PAN_STEP = 50;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip shortcuts when typing in form fields
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key.toLowerCase();

      switch (key) {
        case "w":
          dispatch({
            type: "SET_TRANSFORM",
            payload: { ...state.transform, y: state.transform.y - PAN_STEP },
          });
          break;
        case "a":
          dispatch({
            type: "SET_TRANSFORM",
            payload: { ...state.transform, x: state.transform.x - PAN_STEP },
          });
          break;
        case "s":
          dispatch({
            type: "SET_TRANSFORM",
            payload: { ...state.transform, y: state.transform.y + PAN_STEP },
          });
          break;
        case "d":
          dispatch({
            type: "SET_TRANSFORM",
            payload: { ...state.transform, x: state.transform.x + PAN_STEP },
          });
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "0":
          handleCenter();
          break;
        case "n":
          addNewNode();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.transform,
    dispatch,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    addNewNode,
  ]);

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
        className="fill-none stroke-2 stroke-[#7ed6df] pointer-events-none"
        d={pathData}
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <div
      id="canvas-area"
      className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-stone-950"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className={`absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#292524_1px,transparent_1px)] delay-0 ${!isPanning ? "transition-[background-position,background-size] duration-150 ease-out" : ""}`}
        style={{
          backgroundPosition: `${state.transform.x}px ${state.transform.y}px`,
          backgroundSize: `${20 * state.transform.zoom}px ${20 * state.transform.zoom}px`,
        }}
      />

      {/* Floating Flow Name */}
      <div className="absolute left-4 top-4 z-10">
        {isEditingName ? (
          <input
            className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-md px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-lg outline-none focus:ring-2 focus:ring-[#7ed6df] min-w-[180px]"
            value={localName}
            autoFocus
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => {
              const trimmed = localName.trim();
              if (trimmed) {
                dispatch({ type: "SET_FLOW_NAME", payload: trimmed });
              } else {
                setLocalName(state.flowName);
              }
              setIsEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              } else if (e.key === "Escape") {
                setLocalName(state.flowName);
                setIsEditingName(false);
              }
            }}
          />
        ) : (
          <div
            className="group flex items-center gap-2 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-md px-3 py-1.5 shadow-lg cursor-pointer select-none transition-colors hover:border-[#7ed6df]"
            onDoubleClick={() => {
              setLocalName(state.flowName);
              setIsEditingName(true);
            }}
            title="Double-click to rename"
          >
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {state.flowName}
            </span>
            <PencilSimple
              size={14}
              className="text-slate-400 dark:text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>

      <div
        className={`absolute inset-0 origin-top-left pointer-events-none ${!isPanning ? "transition-transform duration-150 ease-out" : ""}`}
        style={{
          transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.zoom})`,
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
            zoom={state.transform.zoom}
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
}
