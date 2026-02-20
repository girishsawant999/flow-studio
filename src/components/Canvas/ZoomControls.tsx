import {
  CornersOut,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onCenter,
}: ZoomControlsProps) {
  return (
    <div className="absolute right-4 bottom-4 flex flex-col gap-2 bg-white dark:bg-stone-900 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-stone-800 z-10 transition-colors">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-md transition-colors text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
        title="Zoom In (+)"
      >
        <MagnifyingGlassPlus size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-md transition-colors text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
        title="Zoom Out (-)"
      >
        <MagnifyingGlassMinus size={20} />
      </button>
      <button
        onClick={onCenter}
        className="p-2 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-md transition-colors text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
        title="Reset View (0)"
      >
        <CornersOut size={20} />
      </button>
    </div>
  );
}
