import {
  ChartPieSlice,
  GitBranch,
  Graph,
  Link,
  LinkBreak,
} from "@phosphor-icons/react";
import { useFlow } from "../../context/FlowContext";
import { SectionHeading } from "../ui/SectionHeading";

export function FlowSummary() {
  const { state } = useFlow();

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
    <div className="w-full text-left">
      <SectionHeading
        icon={
          <ChartPieSlice
            size={16}
            className="text-gray-500 dark:text-gray-400"
          />
        }
        title="Flow Summary"
      />

      <div className="flex flex-col gap-3 bg-slate-50 dark:bg-stone-950 p-4 rounded-lg border border-slate-200 dark:border-stone-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
            <Graph size={16} /> Total Nodes
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {totalNodes}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
            <Link size={16} /> Connected Nodes
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {connectedNodes}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div
            className={`flex items-center gap-1.5 text-[13px] ${
              disconnectedNodes > 0
                ? "text-red-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <LinkBreak size={16} /> Disconnected Nodes
          </div>
          <span
            className={`font-semibold ${
              disconnectedNodes > 0
                ? "text-red-500"
                : "text-gray-900 dark:text-gray-50"
            }`}
          >
            {disconnectedNodes}
          </span>
        </div>
        <div className="w-full h-px bg-slate-200 dark:bg-stone-800 my-1" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
            <GitBranch size={16} /> Total Conditions
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {totalEdges}
          </span>
        </div>
      </div>
    </div>
  );
}
