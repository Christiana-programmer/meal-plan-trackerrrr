"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/text-field";
import { parseNairaToKobo } from "@/lib/money";
import type { CreateExpenseInput, Expense } from "@/types/expense";

type AddExpenseDialogProps = {
  startDate: string;
  endDate: string;
  today: string;
  onClose: () => void;
  onSave: (input: CreateExpenseInput) => Promise<void>;
  expense?: Expense;
};

export function AddExpenseDialog({
  startDate,
  endDate,
  today,
  onClose,
  onSave,
  expense,
}: AddExpenseDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const amountKobo = parseNairaToKobo(
      String(formData.get("amount") ?? ""),
    );
    const description = String(formData.get("description") ?? "").trim();
    const transactionDate = String(formData.get("transactionDate") ?? "");

    try {
      await onSave({ amountKobo, description, transactionDate });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The expense could not be saved. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#102018]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-dialog-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-t-3xl border border-border bg-surface p-6 shadow-2xl focus:outline-none sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              {expense ? "Update transaction" : "New transaction"}
            </p>
            <h2
              id="expense-dialog-title"
              className="mt-1 text-2xl font-semibold tracking-tight"
            >
              {expense ? "Edit expense" : "Record an expense"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
            className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-background hover:text-foreground"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          Add a meal purchase from within your current budget period.
        </p>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <TextField
            id="expenseAmount"
            name="amount"
            label="Amount (₦)"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="e.g. 2000.00"
            defaultValue={expense ? (expense.amountKobo / 100).toFixed(2) : ""}
            required
          />
          <TextField
            id="expenseDescription"
            name="description"
            label="Description"
            placeholder="e.g. Lunch"
            maxLength={120}
            defaultValue={expense?.description}
            required
          />
          <TextField
            id="expenseDate"
            name="transactionDate"
            label="Date"
            type="date"
            min={startDate}
            max={today < endDate ? today : endDate}
            defaultValue={expense?.transactionDate ?? today}
            required
          />
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm leading-6 text-danger"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving…"
                : expense
                  ? "Save changes"
                  : "Save expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
