import {
  CaretDownIcon as CaretDown,
  CaretUpIcon as CaretUp,
  CheckCircleIcon as CheckCircle,
  CopyIcon as Copy,
  DownloadSimpleIcon as DownloadSimple,
  UploadSimpleIcon as UploadSimple,
  WarningCircleIcon as WarningCircle,
  XIcon as X,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import type { Edge, FlowState, Node } from "../types";

export default function JsonPreview() {
  const { state, dispatch } = useFlow();
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Derive the target JSON schema on every state change
  const exportedJson = useMemo(() => {
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
    a.download = `${state.flowName || "flow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  const handleImportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImportModalOpen(true);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopy();
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDownload();
  };

  const handleCloseImport = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = (newState: FlowState) => {
    dispatch({ type: "IMPORT_FLOW", payload: newState });
    setIsImportModalOpen(false);
  };

  return (
    <>
      <div
        className={`absolute bottom-6 left-6 w-[400px] max-h-[300px] bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl shadow-lg flex flex-col overflow-hidden z-10 transition-transform duration-300 ease-in-out ${
          collapsed ? "translate-y-[calc(100%-48px)]" : ""
        }`}
      >
        <div
          className="px-5 py-4 border-b border-slate-200 dark:border-stone-800 font-semibold flex items-center justify-between cursor-pointer select-none"
          onClick={toggleCollapsed}
        >
          <div className="flex items-center gap-2">
            {collapsed ? <CaretUp size={16} /> : <CaretDown size={16} />}
            <span>Live JSON Preview</span>
          </div>
          {!collapsed && (
            <div className="flex gap-1">
              <button
                className="btn-icon"
                onClick={handleImportClick}
                title="Import JSON"
              >
                <UploadSimple size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={handleCopyClick}
                title="Copy"
              >
                <Copy
                  size={16}
                  className={copied ? "text-[#7ed6df]" : "text-current"}
                />
              </button>
              <button
                className="btn-icon"
                onClick={handleDownloadClick}
                title="Download"
              >
                <DownloadSimple size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-stone-950 p-0 overflow-y-auto">
          <pre className="m-0 p-4 text-[13px] font-mono overflow-x-auto text-gray-900 dark:text-gray-50">
            {exportedJson}
          </pre>
        </div>
      </div>

      {isImportModalOpen && (
        <ImportModal
          onClose={handleCloseImport}
          onImport={handleImportSuccess}
        />
      )}
    </>
  );
}

export function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (state: FlowState) => void;
}) {
  const [jsonText, setJsonText] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<FlowState | null>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setParsedData(null); // Reset valid state on change
  };

  const handleValidate = () => {
    try {
      const data = JSON.parse(jsonText);
      const errors: string[] = [];
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      if (!data.nodes || !Array.isArray(data.nodes)) {
        errors.push("Invalid format: 'nodes' array is required.");
        setValidationErrors(errors);
        setParsedData(null);
        return;
      }

      let yOffset = 100;
      let xOffset = 100;

      data.nodes.forEach(
        (
          n: {
            id: string;
            description: string;
            prompt?: string;
            edges?: Array<{
              to_node_id: string;
              condition?: string;
              parameters?: Record<string, string>;
            }>;
          },
          idx: number,
        ) => {
          if (!n.id) errors.push(`Node at index ${idx} is missing an 'id'.`);
          if (!n.description)
            errors.push(`Node '${n.id || idx}' is missing a 'description'.`);

          const x = xOffset;
          const y = yOffset;

          yOffset += 150;
          if (yOffset > 600) {
            yOffset = 100;
            xOffset += 300;
          }

          newNodes.push({
            id: n.id,
            description: n.description || "",
            prompt: n.prompt || "",
            position: { x, y },
          });

          if (n.edges && Array.isArray(n.edges)) {
            n.edges.forEach(
              (
                e: {
                  to_node_id: string;
                  condition?: string;
                  parameters?: Record<string, string>;
                },
                eIdx: number,
              ) => {
                if (!e.to_node_id)
                  errors.push(
                    `Edge #${eIdx} on Node '${n.id}' is missing 'to_node_id'.`,
                  );

                newEdges.push({
                  id: `edge_${uuidv4().substring(0, 8)}`,
                  sourceNodeId: n.id,
                  targetNodeId: e.to_node_id,
                  condition: e.condition || "",
                  parameters: e.parameters,
                });
              },
            );
          }
        },
      );

      if (!data.start_node_id) {
        errors.push("Missing 'start_node_id'.");
      } else if (!newNodes.some((n) => n.id === data.start_node_id)) {
        errors.push(
          `Start node '${data.start_node_id}' does not exist in the nodes array.`,
        );
      }

      // Verify all edge targets exist
      newEdges.forEach((e) => {
        if (!newNodes.some((n) => n.id === e.targetNodeId)) {
          errors.push(`Edge targets non-existent node: '${e.targetNodeId}'.`);
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        setParsedData(null);
      } else {
        setValidationErrors([]);
        setParsedData({
          flowName: data.name || "Imported Flow",
          nodes: newNodes,
          edges: newEdges,
          startNodeId: data.start_node_id,
          selectedNodeId: null,
          selectedEdgeId: null,
          transform: { x: 0, y: 0, zoom: 1 },
          lastInteractionPosition: null, // Reset on import
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setValidationErrors(["Invalid JSON Syntax: " + message]);
      setParsedData(null);
    }
  };

  const handleImportConfirm = () => {
    if (parsedData) {
      onImport(parsedData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stone-900 w-[600px] max-w-[90vw] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-stone-800">
          <h2 className="m-0 text-lg text-gray-900 dark:text-gray-50">
            Import Flow JSON
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <p className="m-0 mb-4 text-sm text-gray-500 dark:text-gray-400">
            Paste your JSON schema below. We will validate it before importing
            it to the canvas.
          </p>

          <textarea
            className="w-full h-[200px] font-mono text-[13px] mb-4 p-3 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 text-gray-900 dark:text-gray-50 focus:outline-none focus:border-[#7ed6df] focus:ring-2 focus:ring-[#7ed6df]/20 transition-all duration-200"
            placeholder={`{\n  "nodes": [...],\n  "start_node_id": "..."\n}`}
            value={jsonText}
            onChange={handleJsonChange}
          />

          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-500 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
                <WarningCircle size={18} /> Validation Errors
              </div>
              <ul className="m-0 pl-6 text-red-500 text-[13px]">
                {validationErrors.map((err, i) => (
                  <li key={i} className="mb-1">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsedData && (
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-500 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-blue-500 font-semibold mb-2">
                <CheckCircle size={18} /> Valid Schema Detected
              </div>
              <div className="text-gray-900 dark:text-gray-50 text-[13px] flex flex-col gap-1">
                <span>
                  <strong>Total Nodes:</strong> {parsedData.nodes.length}
                </span>
                <span>
                  <strong>Total Edges:</strong> {parsedData.edges.length}
                </span>
                <span>
                  <strong>Start Node:</strong> {parsedData.startNodeId}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-stone-800 flex justify-end gap-3 bg-slate-50 dark:bg-stone-950">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          {!parsedData ? (
            <button
              className={`btn btn-primary ${!jsonText.trim() ? "opacity-50 pointer-events-none" : ""}`}
              onClick={handleValidate}
              disabled={!jsonText.trim()}
            >
              Validate JSON
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleImportConfirm}>
              Import to Canvas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
