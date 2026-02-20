import { CursorClick, Plus, UploadSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import { ImportModal } from "./JsonPreview";
import { EdgeEditor } from "./Sidebar/EdgeEditor";
import { FlowJsonPreview } from "./Sidebar/FlowJsonPreview";
import { FlowSummary } from "./Sidebar/FlowSummary";
import { NodeEditor } from "./Sidebar/NodeEditor";

export default function Sidebar() {
  const { state, dispatch } = useFlow();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Conditionals must come after all hooks are declared
  if (state.selectedNodeId) {
    const node = state.nodes.find((n) => n.id === state.selectedNodeId);
    if (node) return <NodeEditor node={node} />;
  }

  if (state.selectedEdgeId) {
    const edge = state.edges.find((e) => e.id === state.selectedEdgeId);
    if (edge) return <EdgeEditor edge={edge} />;
  }

  return (
    <div className="w-[380px] bg-white dark:bg-stone-900 border-l border-slate-200 dark:border-stone-800 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10 h-full">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-stone-800 font-semibold flex items-center gap-2">
        <CursorClick size={20} weight="fill" className="text-[#7ed6df]" />
        <span>Properties Panel</span>
      </div>
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex gap-3 mb-8">
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              const lastNode =
                state.nodes.length > 0
                  ? state.nodes[state.nodes.length - 1]
                  : null;
              const newPosition = lastNode
                ? { x: lastNode.position.x + 250, y: lastNode.position.y }
                : {
                    x: -state.transform.x / state.transform.zoom + 100,
                    y: -state.transform.y / state.transform.zoom + 100,
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
            }}
          >
            <Plus weight="bold" size={16} /> Add Node
          </button>

          <button
            className="btn btn-secondary w-full"
            onClick={() => setIsImportModalOpen(true)}
          >
            <UploadSimple weight="bold" size={16} /> Import Flow
          </button>
        </div>

        <FlowSummary />

        <div className="w-full h-px bg-slate-200 dark:bg-stone-800 my-6" />

        <FlowJsonPreview />
      </div>

      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={(newState) => {
            dispatch({ type: "IMPORT_FLOW", payload: newState });
            setIsImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
