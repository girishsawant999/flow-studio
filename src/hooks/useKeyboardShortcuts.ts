import { useEffect } from "react";
import { useFlow } from "../context/FlowContext";

interface UseKeyboardShortcutsProps {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleCenter: () => void;
  addNewNode: () => void;
}

export const useKeyboardShortcuts = ({
  handleZoomIn,
  handleZoomOut,
  handleCenter,
  addNewNode,
}: UseKeyboardShortcutsProps) => {
  const { state, dispatch } = useFlow();

  useEffect(() => {
    const PAN_STEP = 50;

    const handleKeyDown = (e: KeyboardEvent) => {
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
};
