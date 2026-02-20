import { PencilSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { useFlow } from "../../context/FlowContext";

export const FlowNameEditor = () => {
  const { state, dispatch } = useFlow();
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(state.flowName);

  if (isEditingName) {
    return (
      <div className="absolute left-4 top-4 z-10">
        <input
          className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-md px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-lg outline-none focus:ring-2 focus:ring-[#7ed6df] min-w-[180px]"
          value={localName}
          autoFocus
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={() => {
            const trimmed = localName.trim();
            if (trimmed) {
              dispatch({ type: "SET_FLOW_NAME", payload: trimmed });
            } else {
              setLocalName(state.flowName);
            }
            setIsEditingName(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              setLocalName(state.flowName);
              setIsEditingName(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute left-4 top-4 z-10">
      <div
        className="group flex items-center gap-2 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-md px-3 py-1.5 shadow-lg cursor-pointer select-none transition-colors hover:border-[#7ed6df]"
        onDoubleClick={() => {
          setLocalName(state.flowName);
          setIsEditingName(true);
        }}
        title="Double-click to rename"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
          {state.flowName}
        </span>
        <PencilSimple
          size={14}
          className="text-slate-400 dark:text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};
