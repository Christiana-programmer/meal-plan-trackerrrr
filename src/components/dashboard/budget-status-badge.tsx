import type { BudgetStatus } from "@/types/dashboard";

const statusStyles: Record<BudgetStatus, string> = {
  upcoming: "bg-[#edf3ff] text-[#315ea8]",
  active: "bg-[#eaf4ed] text-[#24734b]",
  exhausted: "bg-danger-soft text-danger",
  completed: "bg-background text-muted",
};

const statusLabels: Record<BudgetStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  exhausted: "Exhausted",
  completed: "Completed",
};

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[status]}`}
    >
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {statusLabels[status]}
    </span>
  );
}
