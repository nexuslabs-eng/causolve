import type { ReactNode } from "react";

interface AuthSummaryItem {
  label: string;
  value: ReactNode;
}

interface AuthSummaryProps {
  items: AuthSummaryItem[];
}

export const AuthSummary = ({ items }: AuthSummaryProps) => {
  return (
    <dl className="divide-y divide-border rounded-md border border-border bg-surface-inset/30 px-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-6 py-4 text-sm">
          <dt className="text-muted-foreground">{item.label}</dt>

          <dd className="min-w-0 truncate text-right font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};
