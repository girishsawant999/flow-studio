import {
  ArrowRightIcon as ArrowRight,
  ChartPieSliceIcon as ChartPieSlice,
  ChatTeardropTextIcon as ChatTeardropText,
  CodeBlockIcon as CodeBlock,
  CopyIcon as Copy,
  CursorClickIcon as CursorClick,
  DownloadSimpleIcon as DownloadSimple,
  FlagIcon as Flag,
  GitBranchIcon as GitBranch,
  GraphIcon as Graph,
  HashIcon as Hash,
  LinkIcon as Link,
  LinkBreakIcon as LinkBreak,
  PlusIcon as Plus,
  TextAaIcon as TextAa,
  TrashIcon as Trash,
  UploadSimpleIcon as UploadSimple,
} from "@phosphor-icons/react";
import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import type { Edge, Node } from "../types";
import { ImportModal } from "./JsonPreview";

export default function Sidebar() {
  const { state, dispatch } = useFlow();

  const totalNodes = state.nodes.length;
  const totalEdges = state.edges.length;

  const connectedNodeIds = new Set<string>();
  state.edges.forEach((edge) => {
    connectedNodeIds.add(edge.sourceNodeId);
    connectedNodeIds.add(edge.targetNodeId);
  });

  const connectedNodes = state.nodes.filter((n) =>
    connectedNodeIds.has(n.id),
  ).length;
  const disconnectedNodes = totalNodes - connectedNodes;

  const [copied, setCopied] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Derive the target JSON schema on every state change unconditionally
  const exportedJson = useMemo(() => {
    const outputNodes = state.nodes.map((node) => {
      const outgoingEdges = state.edges.filter(
        (e) => e.sourceNodeId === node.id,
      );

      const mappedEdges = outgoingEdges.map((edge) => ({
        to_node_id: edge.targetNodeId,
        condition: edge.condition,
        parameters: edge.parameters || {},
      }));

      return {
        id: node.id,
        description: node.description,
        prompt: node.prompt,
        edges: mappedEdges,
      };
    });

    const schema = {
      nodes: outputNodes,
      start_node_id: state.startNodeId,
    };

    return JSON.stringify(schema, null, 2);
  }, [state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.flowName || "flow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Conditionals must come after all hooks are declared
  if (state.selectedNodeId) {
    const node = state.nodes.find((n) => n.id === state.selectedNodeId);
    if (!node) return null;
    return <NodeEditor node={node} />;
  }

  if (state.selectedEdgeId) {
    const edge = state.edges.find((e) => e.id === state.selectedEdgeId);
    if (!edge) return null;
    return <EdgeEditor edge={edge} />;
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
              dispatch({
                type: "ADD_NODE",
                payload: {
                  id: `node_${uuidv4().substring(0, 6)}`,
                  description: "New Step",
                  prompt: "",
                  position: {
                    x: -state.transform.x / state.transform.zoom + 100,
                    y: -state.transform.y / state.transform.zoom + 100,
                  },
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

        <div className="w-full text-left">
          <SectionHeading
            icon={
              <ChartPieSlice
                size={16}
                className="text-gray-500 dark:text-gray-400"
              />
            }
            title="Flow Summary"
          />

          <div className="flex flex-col gap-3 bg-slate-50 dark:bg-stone-950 p-4 rounded-lg border border-slate-200 dark:border-stone-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
                <Graph size={16} /> Total Nodes
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {totalNodes}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
                <Link size={16} /> Connected Nodes
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {connectedNodes}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div
                className={`flex items-center gap-1.5 text-[13px] ${
                  disconnectedNodes > 0
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <LinkBreak size={16} /> Disconnected Nodes
              </div>
              <span
                className={`font-semibold ${
                  disconnectedNodes > 0
                    ? "text-red-500"
                    : "text-gray-900 dark:text-gray-50"
                }`}
              >
                {disconnectedNodes}
              </span>
            </div>
            <div className="w-full h-px bg-slate-200 dark:bg-stone-800 my-1" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
                <GitBranch size={16} /> Total Conditions
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {totalEdges}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 dark:bg-stone-800 my-6" />

        <div className="w-full text-left mb-6 flex-1 flex flex-col min-h-0">
          <SectionHeading
            icon={
              <CodeBlock
                size={16}
                className="text-gray-500 dark:text-gray-400"
              />
            }
            title="Flow JSON"
          />

          <div className="w-full flex-1 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-lg mb-3 p-3 overflow-y-auto text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-pre-wrap min-h-0">
            {exportedJson}
          </div>

          <div className="flex gap-3">
            <button
              className={`btn btn-secondary flex-1 ${
                copied ? "text-[#7ed6df]!" : ""
              }`}
              onClick={handleCopy}
              title="Copy JSON"
            >
              <Copy weight="bold" size={16} /> Copy
            </button>
            <button
              className="btn btn-secondary flex-1"
              onClick={handleDownload}
              title="Download JSON"
            >
              <DownloadSimple weight="bold" size={16} /> Save
            </button>
          </div>
        </div>
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

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-4 text-gray-900 dark:text-gray-50 font-semibold text-xs uppercase tracking-[0.5px]">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function NodeEditor({ node }: { node: Node }) {
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
          onClick={() => dispatch({ type: "REMOVE_NODE", payload: node.id })}
          title="Delete Node"
        >
          <Trash size={18} className="text-red-500" />
        </button>
      </div>

      <div className="p-6 pb-[100px] flex-1 overflow-y-auto">
        {/* IDENTITY SECTION */}
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
            onClick={() =>
              dispatch({ type: "SET_START_NODE", payload: node.id })
            }
            disabled={isStartNode}
          >
            <Flag weight={isStartNode ? "fill" : "regular"} size={16} />
            {isStartNode ? "Current Start Node" : "Set as Start Node"}
          </button>
        </div>

        <hr className="border-0 border-t border-slate-200 dark:border-stone-800 my-6" />

        {/* CONTENT SECTION */}
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
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NODE",
                payload: { id: node.id, data: { description: e.target.value } },
              })
            }
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
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NODE",
                payload: { id: node.id, data: { prompt: e.target.value } },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function EdgeEditor({ edge }: { edge: Edge }) {
  const { state, dispatch } = useFlow();

  const sourceNode = state.nodes.find((n) => n.id === edge.sourceNodeId);
  const targetNode = state.nodes.find((n) => n.id === edge.targetNodeId);

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

        <div className="mb-4">
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
      </div>
    </div>
  );
}
