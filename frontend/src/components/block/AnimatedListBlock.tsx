"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

// Skeleton placeholder item - always shows gray blocks instead of text
const SkeletonItem = () => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="size-10 rounded-lg bg-gray-300 dark:bg-gray-600" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-600" />
          <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
        className
      )}
    >
      <AnimatedList>
        {Array(5)
          .fill(null)
          .map((_, idx) => (
            <SkeletonItem key={idx} />
          ))}
      </AnimatedList>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}
