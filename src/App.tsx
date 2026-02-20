import { useEffect } from "react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import { useFlow } from "./context/FlowContext";

function App() {
  const { state, dispatch } = useFlow();

  // Handle global keyboard events (Backspace/Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        if (state.selectedNodeId) {
          dispatch({ type: "REMOVE_NODE", payload: state.selectedNodeId });
        } else if (state.selectedEdgeId) {
          dispatch({ type: "REMOVE_EDGE", payload: state.selectedEdgeId });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedNodeId, state.selectedEdgeId, dispatch]);

  return (
    <div className="flex w-full h-full">
      <Canvas />
      <Sidebar />
    </div>
  );
}

export default App;
