import { CodeBlock, Copy, DownloadSimple } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useFlow } from "../../context/FlowContext";
import { SectionHeading } from "../ui/SectionHeading";

export function FlowJsonPreview() {
  const { state } = useFlow();
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="w-full text-left mb-6 flex-1 flex flex-col min-h-0">
      <SectionHeading
        icon={
          <CodeBlock size={16} className="text-gray-500 dark:text-gray-400" />
        }
        title="Flow JSON"
      />

      <div className="w-full flex-1 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-lg mb-3 p-3 overflow-y-auto text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-pre-wrap min-h-0">
        {exportedJson}
      </div>

      <div className="flex gap-3">
        <button
          className={`btn btn-secondary flex-1 ${copied ? "text-[#7ed6df]!" : ""}`}
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
  );
}
