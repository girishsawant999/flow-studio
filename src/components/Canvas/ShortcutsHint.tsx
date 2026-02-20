import { Keyboard } from "@phosphor-icons/react";

export function ShortcutsHint() {
  return (
    <div className="group absolute left-4 bottom-4 z-10">
      <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-lg shadow-lg overflow-hidden transition-all duration-200">
        <div className="hidden group-hover:grid px-4 py-3 grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 min-w-[190px] animate-[fadeIn_150ms_ease-out]">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex gap-1">
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              W
            </kbd>
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              A
            </kbd>
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              S
            </kbd>
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              D
            </kbd>
          </span>
          <span>Pan</span>

          <span className="font-semibold text-slate-800 dark:text-slate-200 flex gap-1">
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              +
            </kbd>
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              −
            </kbd>
          </span>
          <span>Zoom In / Out</span>

          <span className="font-semibold text-slate-800 dark:text-slate-200">
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              0
            </kbd>
          </span>
          <span>Center View</span>

          <span className="font-semibold text-slate-800 dark:text-slate-200">
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              N
            </kbd>
          </span>
          <span>New Node</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            <kbd className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
              Delete
            </kbd>
          </span>
          <span>Delete Node/Edge</span>
        </div>

        <button className="flex group-hover:hidden items-center gap-1.5 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
          <Keyboard size={16} />
          <span>Shortcuts</span>
        </button>
      </div>
    </div>
  );
}
