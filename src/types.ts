export interface Position {
  x: number;
  y: number;
}

export interface Edge {
  id: string; // Internal unique ID
  sourceNodeId: string;
  targetNodeId: string;
  condition: string;
  parameters?: Record<string, string>;
}

export interface Node {
  id: string; // Both internal and the user-facing ID
  description?: string;
  prompt: string;
  position: Position;
}

// Normalized state structure for Context
export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  startNodeId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Canvas Viewport Data
  transform: { x: number; y: number; zoom: number };
}
