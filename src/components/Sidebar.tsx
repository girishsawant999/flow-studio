import { Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlow } from "../context/FlowContext";
import type { Edge, Node } from "../types";

export default function Sidebar() {
  const { state, dispatch } = useFlow();

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
    <div
      className="sidebar"
      style={{ justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <div style={{ color: "var(--text-secondary)", textAlign: "center" }}>
        Select a node or edge to edit its properties.
      </div>
      <button
        className="primary-btn"
        style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}
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
        <Plus weight="bold" /> Add Node
      </button>
    </div>
  );
}

function NodeEditor({ node }: { node: Node }) {
  const { state, dispatch } = useFlow();
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleIdChange = (newId: string) => {
    // Validate uniqueness
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
    <div className="sidebar">
      <div className="header-bar">
        <span>Edit Node</span>
        <button
          className="control-btn"
          onClick={() => dispatch({ type: "REMOVE_NODE", payload: node.id })}
          title="Delete Node"
        >
          <Trash size={18} color="var(--danger-color)" />
        </button>
      </div>
      <div className="content-area">
        <div className="form-group">
          <label className="form-label">Node ID (Must be unique)</label>
          <input
            className="input-field"
            defaultValue={node.id}
            onChange={(e) => handleIdChange(e.target.value)}
            style={{ borderColor: errorId ? "var(--danger-color)" : "" }}
          />
          {errorId && (
            <div
              style={{
                color: "var(--danger-color)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {errorId}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Description (Required)</label>
          <input
            className="input-field"
            value={node.description || ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NODE",
                payload: { id: node.id, data: { description: e.target.value } },
              })
            }
          />
          {!node.description && (
            <div
              style={{
                color: "var(--danger-color)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Description is required
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Prompt</label>
          <textarea
            className="input-field"
            style={{ resize: "vertical", minHeight: 80 }}
            value={node.prompt}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NODE",
                payload: { id: node.id, data: { prompt: e.target.value } },
              })
            }
          />
        </div>

        <div
          className="form-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            className="primary-btn"
            style={{
              flex: 1,
              backgroundColor: isStartNode
                ? "var(--node-border)"
                : "var(--accent-color)",
              color: isStartNode ? "var(--text-primary)" : "white",
            }}
            onClick={() =>
              dispatch({ type: "SET_START_NODE", payload: node.id })
            }
            disabled={isStartNode}
          >
            {isStartNode ? "Is Start Node" : "Make Start Node"}
          </button>
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
    <div className="sidebar">
      <div className="header-bar">
        <span>Edit Transition</span>
        <button
          className="control-btn"
          onClick={() => dispatch({ type: "REMOVE_EDGE", payload: edge.id })}
          title="Delete Edge"
        >
          <Trash size={18} color="var(--danger-color)" />
        </button>
      </div>
      <div className="content-area">
        <div
          style={{
            marginBottom: 20,
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: "12px",
            backgroundColor: "var(--bg-color)",
            borderRadius: 8,
          }}
        >
          <strong>From:</strong> {sourceNode?.description || sourceNode?.id}{" "}
          <br />
          <strong>To:</strong> {targetNode?.description || targetNode?.id}
        </div>

        <div className="form-group">
          <label className="form-label">Condition Text</label>
          <input
            className="input-field"
            value={edge.condition}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_EDGE",
                payload: { id: edge.id, data: { condition: e.target.value } },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
