import {
  ChatTeardropText,
  Flag,
  Hash,
  TextAa,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useFlow } from "../../context/FlowContext";
import type { Node } from "../../types";
import { SectionHeading } from "../ui/SectionHeading";

interface NodeEditorProps {
  node: Node;
}

export function NodeEditor({ node }: NodeEditorProps) {
  const { state, dispatch } = useFlow();
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleIdChange = (newId: string) => {
    if (newId === node.id) {
      setErrorId(null);
      return;
    }
    if (state.nodes.some((n) => n.id === newId)) {
      setErrorId("ID must be unique");
    } else {
      setErrorId(null);
      dispatch({
        type: "UPDATE_NODE",
        payload: { id: node.id, data: { id: newId } },
      });
    }
  };

  const isStartNode = state.startNodeId === node.id;

  const handleRemoveNode = () => {
    dispatch({ type: "REMOVE_NODE", payload: node.id });
  };

  const handleSetStartNode = () => {
    dispatch({ type: "SET_START_NODE", payload: node.id });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: node.id, data: { description: e.target.value } },
    });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: node.id, data: { prompt: e.target.value } },
    });
  };

  return (
    <div className="w-[380px] bg-white dark:bg-stone-900 border-l border-slate-200 dark:border-stone-800 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10 h-full">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-stone-800 font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isStartNode ? "bg-[#7ed6df]" : "bg-slate-500 dark:bg-slate-400"
            }`}
          />
          <span>Edit Node</span>
        </div>
        <button
          className="btn-icon"
          onClick={handleRemoveNode}
          title="Delete Node"
        >
          <Trash size={18} className="text-red-500" />
        </button>
      </div>

      <div className="p-6 pb-[100px] flex-1 overflow-y-auto">
        <SectionHeading
          icon={<Hash size={16} className="text-gray-500 dark:text-gray-400" />}
          title="Identity & Settings"
        />

        <div className="mb-6">
          <label className="flex justify-between text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Node ID</span>
            {errorId && (
              <span className="text-red-500 text-[11px]">{errorId}</span>
            )}
          </label>
          <input
            className={`w-full px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-stone-950 text-gray-900 dark:text-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(126,214,223,0.2)] transition-colors duration-200 ${
              errorId
                ? "border-red-500 focus:border-red-500"
                : "border-slate-200 dark:border-stone-800 focus:border-[#7ed6df]"
            }`}
            value={node.id}
            onChange={(e) => handleIdChange(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <button
            className={`btn w-full shadow-md ${
              isStartNode ? "btn-secondary" : "btn-primary"
            }`}
            onClick={handleSetStartNode}
            disabled={isStartNode}
          >
            <Flag weight={isStartNode ? "fill" : "regular"} size={16} />
            {isStartNode ? "Current Start Node" : "Set as Start Node"}
          </button>
        </div>

        <hr className="border-0 border-t border-slate-200 dark:border-stone-800 my-6" />

        <SectionHeading
          icon={
            <TextAa size={16} className="text-gray-500 dark:text-gray-400" />
          }
          title="Content"
        />

        <div className="mb-4">
          <label className="flex justify-between text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Description</span>
            {!node.description && (
              <span className="text-red-500 text-[11px]">Required</span>
            )}
          </label>
          <input
            className={`w-full px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-stone-950 text-gray-900 dark:text-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(126,214,223,0.2)] transition-colors duration-200 ${
              !node.description
                ? "border-red-500 focus:border-red-500"
                : "border-slate-200 dark:border-stone-800 focus:border-[#7ed6df]"
            }`}
            placeholder="e.g. Ask User Name"
            value={node.description || ""}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            <ChatTeardropText size={14} />
            Prompt Message
          </label>
          <textarea
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 text-gray-900 dark:text-gray-50 text-sm focus:outline-none focus:border-[#7ed6df] focus:ring-2 focus:ring-[rgba(126,214,223,0.2)] transition-colors duration-200 resize-y min-h-[120px] leading-relaxed"
            placeholder="What should the bot say at this step?"
            value={node.prompt}
            onChange={handlePromptChange}
          />
        </div>
      </div>
    </div>
  );
}
