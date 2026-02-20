import React from "react";

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
}

export function SectionHeading({ icon, title }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-1.5 mb-4 text-gray-900 dark:text-gray-50 font-semibold text-xs uppercase tracking-[0.5px]">
      {icon}
      <span>{title}</span>
    </div>
  );
}
