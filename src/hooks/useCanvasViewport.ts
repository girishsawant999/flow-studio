import { useEffect, useRef, useState } from "react";
import { useFlow } from "../context/FlowContext";
import type { Position } from "../types";

export const useCanvasViewport = () => {
  const { state, dispatch } = useFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleMouseMove = (e: React.MouseEvent) => {
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
  };

  const handleZoomIn = () => {
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
  };

  const handleZoomOut = () => {
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
  };

  const handleCenter = () => {
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
      const nodeWidth = 320;
      const nodeHeight = 150;
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const zoomX = (canvasRect.width - padding * 2) / contentWidth;
    const zoomY = (canvasRect.height - padding * 2) / contentHeight;
    const newZoom = Math.min(Math.max(0.1, Math.min(zoomX, zoomY, 1.5)), 3);
    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;
    const newX = canvasRect.width / 2 - centerX * newZoom;
    const newY = canvasRect.height / 2 - centerY * newZoom;

    dispatch({
      type: "SET_TRANSFORM",
      payload: { x: newX, y: newY, zoom: newZoom },
    });
  };

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

  return {
    canvasRef,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    transform: state.transform,
  };
};
