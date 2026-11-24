import { cn } from "@/lib/utils";

interface ResolutionNodeProps {
  className?: string;
  active?: boolean;
  title?: string;
}

export const ResolutionNode = ({ className, active = false, title }: ResolutionNodeProps) => {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("h-7 w-auto", className)}
    >
      <g stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6.5h5c3.6 0 5.4 2 7.2 5.2L20.5 16" opacity="0.75" />
        <path d="M6 16h13.5" opacity="0.95" />
        <path d="M6 25.5h5c3.6 0 5.4-2 7.2-5.2L20.5 16" opacity="0.75" />
        <path d="M27.5 16H43" className="text-primary-bright" opacity="0.95" />
      </g>

      {active && (
        <g stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.85">
          <path d="M6 16h13.5" className="animate-signal-flow" />
          <path d="M27.5 16H43" className="animate-signal-flow" />
        </g>
      )}

      <g fill="currentColor">
        <circle cx="5" cy="6.5" r="2.1" opacity="0.55" />
        <circle cx="5" cy="16" r="2.1" opacity="0.8" />
        <circle cx="5" cy="25.5" r="2.1" opacity="0.55" />
      </g>

      {/* resolution node */}
      <rect
        x="19.6"
        y="11.6"
        width="8.8"
        height="8.8"
        rx="1.6"
        transform="rotate(45 24 16)"
        fill="var(--background)"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="21.9"
        y="13.9"
        width="4.2"
        height="4.2"
        rx="0.8"
        transform="rotate(45 24 16)"
        fill="currentColor"
        className={cn(active && "animate-node-pulse origin-center")}
      />
    </svg>
  );
};
