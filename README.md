# FlowStudio

A modern, highly interactive flow builder designed from scratch without relying on external canvas/graph libraries like React Flow or state management libraries like Zustand. Built for speed, precision, and a premium developer experience.

## ✨ Premium Features

- **Custom Canvas Engine**: A proprietary React-based canvas tracking global mouse events to calculate transform matrices. Native scale & pan logic with normalization from screen to local coordinates.
- **SVG Bezier Edges**: Transitions (Edges) rendered as mathematical bezier curves. Intelligent control point calculation creates a fluid "swooping" effect similar to enterprise-grade design tools.
- **Advanced State Orchestration**: Leverages `useReducer` for predictable, serial state transactions. Handles complex graph operations (node removal, edge cleanup, ID remapping) without race conditions.
- **Smart JSON Serialization**: Real-time transformation from flat arrays to nested, production-ready JSON schemas.
- **Canvas Interaction Suite**:
  - **Zoom & Pan**: Fluid mouse-wheel zooming and friction-less panning.
  - **Floating Controls**: Integrated action panel for precise zoom control and view centering.
  - **Shortcuts System**: Full keyboard support (WASD for pan, +/- for zoom, `N` for new nodes, `Del` for removal).
- **Pro-Grade Editor**:
  - **Editable Flow Identity**: Double-click headers to rename files on the fly.
  - **Grid Snapping**: Native 10px grid alignment for perfectly organized layouts.
  - **Live Schema Validation**: Industrial-strength JSON importer with real-time error reporting and schema verification.
  - **Property Panels**: Context-aware sidebars for modifying node prompts and conditional logic.
- **Aesthetic Excellence**: Built with a custom "Outfit" typography system, dark/light mode detection, and glassmorphic UI components.

## 🛠 Technology Stack

- **Core**: [React 19](https://react.dev/) (Vite + TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with modern CSS variables.
- **Icons**: [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`)
- **Utility**: `uuid` for secure entity identification.

## ⌨️ Keyboard Shortcuts

| Shortcut            | Action               |
| ------------------- | -------------------- |
| `W`, `A`, `S`, `D`  | Pan View             |
| `+`, `-`, `=`       | Zoom In / Out        |
| `0`                 | Center View          |
| `N`                 | Add New Node         |
| `Del` / `Backspace` | Remove Selected Item |

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Launch Development Server**

   ```bash
   pnpm run dev
   ```

3. **Production Build**
   ```bash
   pnpm run build
   ```

---

Built with ❤️ for performance-intensive flow orchestration.
