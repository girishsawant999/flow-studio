import {
  ArrowRight,
  ChartPieSlice,
  ChatTeardropText,
  CursorClick,
  Flag,
  GitBranch,
  Graph,
  Hash,
  Link,
  LinkBreak,
  Plus,
  TextAa,
  Trash,
} from "@phosphor-icons/react";
import React, { useState } from "react";
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

  return (
    <div
      className="sidebar"
      style={{
        backgroundColor: "var(--panel-bg)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        className="header-bar"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <CursorClick size={20} weight="fill" color="var(--accent-color)" />
        <span>Properties Panel</span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <CursorClick
            size={32}
            color="var(--text-secondary)"
            weight="duotone"
          />
        </div>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: 16,
            color: "var(--text-primary)",
          }}
        >
          No Selection
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Click on any node or edge in the canvas to view and edit its
          properties here.
        </p>

        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "var(--border-color)",
            margin: "32px 0 24px 0",
          }}
        />

        <div style={{ width: "100%", textAlign: "left" }}>
          <SectionHeading
            icon={<ChartPieSlice size={16} color="var(--text-secondary)" />}
            title="Flow Summary"
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              backgroundColor: "var(--bg-color)",
              padding: 16,
              borderRadius: 8,
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                <Graph size={16} /> Total Nodes
              </div>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {totalNodes}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                <Link size={16} /> Connected Nodes
              </div>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {connectedNodes}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color:
                    disconnectedNodes > 0
                      ? "var(--danger-color)"
                      : "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                <LinkBreak size={16} /> Disconnected Nodes
              </div>
              <span
                style={{
                  fontWeight: 600,
                  color:
                    disconnectedNodes > 0
                      ? "var(--danger-color)"
                      : "var(--text-primary)",
                }}
              >
                {disconnectedNodes}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 1,
                backgroundColor: "var(--border-color)",
                margin: "4px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                <GitBranch size={16} /> Total Conditions
              </div>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {totalEdges}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "var(--border-color)",
            margin: "24px 0 32px 0",
          }}
        />

        <button
          className="primary-btn"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            padding: "12px",
          }}
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
          <Plus weight="bold" size={16} /> Add New Node
        </button>
      </div>
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 16,
        color: "var(--text-primary)",
        fontWeight: 600,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
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
    <div
      className="sidebar"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        className="header-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isStartNode
                ? "var(--accent-color)"
                : "var(--text-secondary)",
            }}
          />
          <span>Edit Node</span>
        </div>
        <button
          className="control-btn"
          onClick={() => dispatch({ type: "REMOVE_NODE", payload: node.id })}
          title="Delete Node"
        >
          <Trash size={18} color="var(--danger-color)" />
        </button>
      </div>

      <div
        className="content-area"
        style={{ flex: 1, padding: 24, paddingBottom: 100 }}
      >
        {/* IDENTITY SECTION */}
        <SectionHeading
          icon={<Hash size={16} color="var(--text-secondary)" />}
          title="Identity & Settings"
        />

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label
            className="form-label"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>Node ID</span>
            {errorId && (
              <span style={{ color: "var(--danger-color)", fontSize: 11 }}>
                {errorId}
              </span>
            )}
          </label>
          <input
            className="input-field"
            value={node.id}
            onChange={(e) => handleIdChange(e.target.value)}
            style={{
              borderColor: errorId ? "var(--danger-color)" : "",
              fontFamily: "monospace",
              backgroundColor: "var(--bg-color)",
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 32 }}>
          <button
            className="primary-btn"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
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
            <Flag weight={isStartNode ? "fill" : "regular"} size={16} />
            {isStartNode ? "Current Start Node" : "Set as Start Node"}
          </button>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid var(--border-color)",
            margin: "24px 0",
          }}
        />

        {/* CONTENT SECTION */}
        <SectionHeading
          icon={<TextAa size={16} color="var(--text-secondary)" />}
          title="Content"
        />

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label
            className="form-label"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>Description</span>
            {!node.description && (
              <span style={{ color: "var(--danger-color)", fontSize: 11 }}>
                Required
              </span>
            )}
          </label>
          <input
            className="input-field"
            placeholder="e.g. Ask User Name"
            value={node.description || ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NODE",
                payload: { id: node.id, data: { description: e.target.value } },
              })
            }
            style={{
              borderColor: !node.description ? "var(--danger-color)" : "",
            }}
          />
        </div>

        <div className="form-group">
          <label
            className="form-label"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ChatTeardropText size={14} color="var(--text-secondary)" />
            Prompt Message
          </label>
          <textarea
            className="input-field"
            placeholder="What should the bot say at this step?"
            style={{ resize: "vertical", minHeight: 120, lineHeight: 1.5 }}
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
    <div
      className="sidebar"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        className="header-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GitBranch size={16} color="var(--accent-color)" />
          <span>Edit Transition</span>
        </div>
        <button
          className="control-btn"
          onClick={() => dispatch({ type: "REMOVE_EDGE", payload: edge.id })}
          title="Delete Edge"
        >
          <Trash size={18} color="var(--danger-color)" />
        </button>
      </div>

      <div className="content-area" style={{ flex: 1, padding: 24 }}>
        <SectionHeading
          icon={<ArrowRight size={16} color="var(--text-secondary)" />}
          title="Path Connection"
        />

        <div
          style={{
            marginBottom: 32,
            fontSize: 13,
            color: "var(--text-primary)",
            padding: "16px",
            backgroundColor: "var(--bg-color)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              From
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "var(--text-secondary)",
                }}
              />
              {sourceNode?.description || sourceNode?.id || "Unknown Node"}
            </div>
          </div>

          <div style={{ paddingLeft: 3 }}>
            <ArrowRight
              size={16}
              color="var(--border-color)"
              weight="bold"
              style={{ transform: "rotate(90deg)" }}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              To
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-color)",
                }}
              />
              {targetNode?.description || targetNode?.id || "Unknown Node"}
            </div>
          </div>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid var(--border-color)",
            margin: "24px 0",
          }}
        />

        <SectionHeading
          icon={<TextAa size={16} color="var(--text-secondary)" />}
          title="Condition"
        />

        <div className="form-group">
          <label className="form-label">Condition Text / Intent</label>
          <input
            className="input-field"
            placeholder="e.g. If user says yes"
            value={edge.condition}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_EDGE",
                payload: { id: edge.id, data: { condition: e.target.value } },
              })
            }
          />
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            This text is displayed on the canvas branch and used to evaluate
            user intent routing.
          </p>
        </div>
      </div>
    </div>
  );
}
