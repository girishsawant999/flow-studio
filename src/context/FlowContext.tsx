import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer } from "react";
import type { Edge, FlowState, Node, Position } from "../types";

export type Action =
  | { type: "ADD_NODE"; payload: Node }
  | { type: "UPDATE_NODE"; payload: { id: string; data: Partial<Node> } }
  | { type: "REMOVE_NODE"; payload: string }
  | { type: "ADD_EDGE"; payload: Edge }
  | { type: "UPDATE_EDGE"; payload: { id: string; data: Partial<Edge> } }
  | { type: "REMOVE_EDGE"; payload: string }
  | { type: "SET_START_NODE"; payload: string }
  | { type: "SET_SELECTED_NODE"; payload: string | null }
  | { type: "SET_SELECTED_EDGE"; payload: string | null }
  | { type: "MOVE_NODE"; payload: { id: string; position: Position } }
  | { type: "SET_TRANSFORM"; payload: { x: number; y: number; zoom: number } }
  | { type: "IMPORT_FLOW"; payload: FlowState }
  | { type: "SET_FLOW_NAME"; payload: string };

const initialState: FlowState = {
  flowName: "Untitled Flow",
  nodes: [
    {
      id: "node_1",
      description: "Initial Node",
      prompt: "What do you want to do?",
      position: { x: 300, y: 200 },
    },
  ],
  edges: [],
  startNodeId: "node_1",
  selectedNodeId: null,
  selectedEdgeId: null,
  transform: { x: 0, y: 0, zoom: 1 },
  lastInteractionPosition: { x: 300, y: 200 }, // Matches initial node
};

const flowReducer = (state: FlowState, action: Action): FlowState => {
  switch (action.type) {
    case "ADD_NODE":
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        selectedNodeId: action.payload.id,
        lastInteractionPosition: action.payload.position,
      };
    case "UPDATE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? { ...node, ...action.payload.data }
            : node,
        ),
        // Important: if the node ID changed, we also need to update edges and startNodeId
        edges: state.edges.map((edge) => {
          if (action.payload.data.id) {
            const newEdge = { ...edge };
            if (edge.sourceNodeId === action.payload.id)
              newEdge.sourceNodeId = action.payload.data.id;
            if (edge.targetNodeId === action.payload.id)
              newEdge.targetNodeId = action.payload.data.id;
            return newEdge;
          }
          return edge;
        }),
        startNodeId:
          action.payload.data.id && state.startNodeId === action.payload.id
            ? action.payload.data.id
            : state.startNodeId,
        selectedNodeId:
          action.payload.data.id && state.selectedNodeId === action.payload.id
            ? action.payload.data.id
            : state.selectedNodeId,
      };
    case "REMOVE_NODE":
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.payload),
        edges: state.edges.filter(
          (edge) =>
            edge.sourceNodeId !== action.payload &&
            edge.targetNodeId !== action.payload,
        ),
        startNodeId:
          state.startNodeId === action.payload ? null : state.startNodeId,
        selectedNodeId:
          state.selectedNodeId === action.payload ? null : state.selectedNodeId,
      };
    case "ADD_EDGE":
      return { ...state, edges: [...state.edges, action.payload] };
    case "UPDATE_EDGE":
      return {
        ...state,
        edges: state.edges.map((edge) =>
          Math.abs(edge.id.localeCompare(action.payload.id)) === 0
            ? { ...edge, ...action.payload.data }
            : edge,
        ),
      };
    case "REMOVE_EDGE":
      return {
        ...state,
        edges: state.edges.filter((edge) => edge.id !== action.payload),
        selectedEdgeId:
          state.selectedEdgeId === action.payload ? null : state.selectedEdgeId,
      };
    case "SET_START_NODE":
      return { ...state, startNodeId: action.payload };
    case "SET_SELECTED_NODE":
      return { ...state, selectedNodeId: action.payload, selectedEdgeId: null };
    case "SET_SELECTED_EDGE":
      return { ...state, selectedEdgeId: action.payload, selectedNodeId: null };
    case "MOVE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? { ...node, position: action.payload.position }
            : node,
        ),
        lastInteractionPosition: action.payload.position,
      };
    case "SET_TRANSFORM":
      return { ...state, transform: action.payload };
    case "IMPORT_FLOW":
      return action.payload;
    case "SET_FLOW_NAME":
      return { ...state, flowName: action.payload };
    default:
      return state;
  }
};

const FlowContext = createContext<{
  state: FlowState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(flowReducer, initialState);
  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
};
