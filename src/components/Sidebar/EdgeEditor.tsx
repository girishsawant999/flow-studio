import {
  ArrowRight,
  GitBranch,
  Link,
  Plus,
  TextAa,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useFlow } from "../../context/FlowContext";
import type { Edge } from "../../types";
import { SectionHeading } from "../ui/SectionHeading";

interface EdgeEditorProps {
  edge: Edge;
}

export function EdgeEditor({ edge }: EdgeEditorProps) {
  const { state, dispatch } = useFlow();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const sourceNode = state.nodes.find((n) => n.id === edge.sourceNodeId);
  const targetNode = state.nodes.find((n) => n.id === edge.targetNodeId);

  const handleAddParam = () => {
    if (!newKey.trim()) return;
    const updatedParams = { ...(edge.parameters || {}), [newKey]: newValue };
    dispatch({
      type: "UPDATE_EDGE",
      payload: { id: edge.id, data: { parameters: updatedParams } },
    });
    setNewKey("");
    setNewValue("");
  };

  const handleRemoveParam = (key: string) => {
    const updatedParams = { ...(edge.parameters || {}) };
    delete updatedParams[key];
    dispatch({
      type: "UPDATE_EDGE",
      payload: { id: edge.id, data: { parameters: updatedParams } },
    });
  };

  return (
    <div className="w-[380px] bg-white dark:bg-stone-900 border-l border-slate-200 dark:border-stone-800 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10 h-full">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-stone-800 font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-[#7ed6df]" />
          <span>Edit Transition</span>
        </div>
        <button
          className="btn-icon"
          onClick={() => dispatch({ type: "REMOVE_EDGE", payload: edge.id })}
          title="Delete Edge"
        >
          <Trash size={18} className="text-red-500" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <SectionHeading
          icon={
            <ArrowRight
              size={16}
              className="text-gray-500 dark:text-gray-400"
            />
          }
          title="Path Connection"
        />

        <div className="mb-8 text-[13px] text-gray-900 dark:text-gray-50 p-4 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-lg flex flex-col gap-3">
          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase">
              From
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-slate-400" />
              {sourceNode?.description || sourceNode?.id || "Unknown Node"}
            </div>
          </div>

          <div className="pl-1">
            <ArrowRight
              size={16}
              className="text-gray-200 dark:text-stone-800 rotate-90"
              weight="bold"
            />
          </div>

          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase">
              To
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7ed6df]" />
              {targetNode?.description || targetNode?.id || "Unknown Node"}
            </div>
          </div>
        </div>

        <hr className="border-0 border-t border-slate-200 dark:border-stone-800 my-6" />

        <SectionHeading
          icon={
            <TextAa size={16} className="text-gray-500 dark:text-gray-400" />
          }
          title="Condition"
        />

        <div className="mb-8">
          <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Condition Text / Intent
          </label>
          <input
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 text-gray-900 dark:text-gray-50 text-sm focus:outline-none focus:border-[#7ed6df] focus:ring-2 focus:ring-[rgba(126,214,223,0.2)] transition-colors duration-200"
            placeholder="e.g. If user says yes"
            value={edge.condition}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_EDGE",
                payload: { id: edge.id, data: { condition: e.target.value } },
              })
            }
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-[1.4]">
            This text is displayed on the canvas branch and used to evaluate
            user intent routing.
          </p>
        </div>

        <hr className="border-0 border-t border-slate-200 dark:border-stone-800 my-6" />

        <SectionHeading
          icon={<Link size={16} className="text-gray-500 dark:text-gray-400" />}
          title="Parameters"
        />

        <div className="space-y-4">
          {edge.parameters && Object.keys(edge.parameters).length > 0 && (
            <div className="space-y-2">
              {Object.entries(edge.parameters).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-lg group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-500 uppercase font-bold truncate">
                      {key}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-50 truncate">
                      {value}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveParam(key)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 border border-dashed border-slate-300 dark:border-stone-700 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Key"
                className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddParam}
              disabled={!newKey.trim()}
              className="btn btn-secondary w-full py-1.5 text-xs"
            >
              <Plus size={14} /> Add Parameter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
