"use client";

import { Button } from "@/components/ui/button";

type ConfirmDeleteDialogProps = {
  description: string;
  isDeleting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({
  description,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#102018]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-expense-title"
        aria-describedby="delete-expense-description"
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <p className="text-sm font-semibold text-danger">Delete transaction</p>
        <h2
          id="delete-expense-title"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Delete this expense?
        </h2>
        <p
          id="delete-expense-description"
          className="mt-3 text-sm leading-6 text-muted"
        >
          “{description}” will be permanently removed from this demo budget and
          the balance will be recalculated.
        </p>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Keep expense
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete expense"}
          </Button>
        </div>
      </section>
    </div>
  );
}
