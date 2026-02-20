# Visual Flow Builder

A modern, highly interactive flow builder designed from scratch without relying on external canvas/graph libraries like React Flow or state management libraries like Zustand.

## Technology Stack

- **React 18** (Vite + TypeScript)
- **State Management**: Native `React Context` with `useReducer` for complex state actions.
- **Styling**: Vanilla CSS with modern custom properties, dark/light mode detection, and grid patterns.
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Utility**: UUID for generating unique identifiers.

## Key Technical Decisions

1. **Custom Canvas Engine**
   Instead of using React Flow, the canvas is built using a custom React component that tracks global mouse events (`mousedown`, `mousemove`, `mouseup`, `wheel`) to calculate a transform matrix. The scale & pan logic is entirely scratch-built, normalizing global screen coordinates into local canvas coordinates.

2. **SVG Edge Rendering**
   Transitions (Edges) are rendered dynamically as bezier curves using `<svg>` elements that sit perfectly behind the DOM nodes. The curves calculate control points mathematically based on the distance between the two connected nodes, achieving a beautiful swooping effect similar to premium tools.

3. **React `useReducer` for State**
   Given the complexity of a node graph, a single top-level Reducer ensures that state transactions are predictable. When an Edge is added or a Node is deleted (along with its associated edges), the reducer can process these operations serially without triggering async race conditions common in deeply nested `useState` hooks.

4. **Schema Normalization vs Export**
   Internally, `nodes` and `edges` are stored in two flat arrays. This format is far superior for canvas rendering as it guarantees $O(1)$ lookups and predictable React mapping. However, the exact requested JSON format nests edges _inside_ nodes. The `JsonPreview.tsx` component handles this transformation effortlessly on-the-fly via a `useMemo` derivative function before visualizing it exactly as expected.

## Features Let's built:

- **Canvas Navigation**: Pan by dragging an empty area, Zoom playfully using the mouse scroll wheel.
- **Drag Node**: Click and grab a node to move it anywhere.
- **Draw Edges**: Click and drag from a Node's right-side handle and drop it into another Node's left-side handle to connect them conditionally!
- **Sidebar Integration**: Selecting a Node or Edge populates the interactive properties panel where you can visually label conditions and prompts.
- **Live Validations**: ID conflict checking, required field validators, and empty state fallbacks are all active inline.
- **JSON Live Preview**: The exact target structural layout is presented in a floating, collapsible widget on the bottom left. Can be copied or downloaded straight to disk.

## How to run locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run the development server:

   ```bash
   pnpm run dev
   ```

3. Build for production:
   ```bash
   pnpm run build
   ```
