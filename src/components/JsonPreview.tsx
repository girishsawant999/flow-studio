import {
  CaretDown,
  CaretUp,
  Copy,
  DownloadSimple,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useFlow } from "../context/FlowContext";

export default function JsonPreview() {
  const { state } = useFlow();
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derive the target JSON schema on every state change
  const exportedJson = useMemo(() => {
    // Validate Flow first

    const outputNodes = state.nodes.map((node) => {
      // Find all edges sourcing from this node
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
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`json-preview ${collapsed ? "collapsed" : ""}`}>
      <div
        className="header-bar"
        style={{ cursor: "pointer", padding: "12px 16px", userSelect: "none" }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {collapsed ? <CaretUp size={16} /> : <CaretDown size={16} />}
          <span>Live JSON Preview</span>
        </div>
        {!collapsed && (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="control-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              title="Copy"
            >
              <Copy
                size={16}
                color={copied ? "var(--accent-color)" : "currentColor"}
              />
            </button>
            <button
              className="control-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              title="Download"
            >
              <DownloadSimple size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        className="content-area"
        style={{ padding: 0, backgroundColor: "var(--bg-color)" }}
      >
        <pre
          style={{
            margin: 0,
            padding: 16,
            fontSize: 13,
            fontFamily: "monospace",
            overflowX: "auto",
            color: "var(--text-primary)",
          }}
        >
          {exportedJson}
        </pre>
      </div>
    </div>
  );
}
