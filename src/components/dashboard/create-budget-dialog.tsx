"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/text-field";
import { calculateEndDate, isValidIsoDate } from "@/lib/calculations";
import { formatDate, formatNaira } from "@/lib/formatters";
import { parseNairaToKobo } from "@/lib/money";
import type { CreateBudgetInput } from "@/types/budget";

type CreateBudgetDialogProps = {
  today: string;
  onClose: () => void;
  onSave: (input: CreateBudgetInput) => Promise<void>;
};

export function CreateBudgetDialog({
  today,
  onClose,
  onSave,
}: CreateBudgetDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [credits, setCredits] = useState("");
  const [duration, setDuration] = useState("30");
  const [startDate, setStartDate] = useState(today);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const totalCreditsKobo = parseNairaToKobo(credits);
  const durationDays = Number(duration);
  const hasValidPreview =
    totalCreditsKobo > 0 &&
    Number.isInteger(durationDays) &&
    durationDays > 0 &&
    isValidIsoDate(startDate);
  const endDate = hasValidPreview
    ? calculateEndDate(startDate, durationDays)
    : null;
  const initialDailyAllowanceKobo =
    hasValidPreview && durationDays > 0
      ? Math.round(totalCreditsKobo / durationDays)
      : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSave({
        totalCreditsKobo,
        durationDays,
        startDate,
      });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The new meal credit could not be saved. Please try again.",
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
        aria-labelledby="budget-dialog-title"
        tabIndex={-1}
        className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 shadow-2xl focus:outline-none sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">New credit</p>
            <h2
              id="budget-dialog-title"
              className="mt-1 text-2xl font-semibold tracking-tight"
            >
              Set up your meal budget
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
          Enter the meal credit you received. We’ll calculate a daily spending
          guide for the period you choose.
        </p>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <TextField
            id="budgetCredits"
            name="credits"
            label="Meal credit received (₦)"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50000.00"
            value={credits}
            onChange={(event) => setCredits(event.target.value)}
            required
          />
          <TextField
            id="budgetDuration"
            name="duration"
            label="Budget duration (days)"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
          />
          <TextField
            id="budgetStartDate"
            name="startDate"
            label="Credit start date"
            type="date"
            min={today}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />

          {hasValidPreview && endDate ? (
            <div className="grid gap-3 rounded-2xl bg-primary-soft p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted">Daily guide</p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  {formatNaira(initialDailyAllowanceKobo)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Period ends</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDate(endDate)}
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm leading-6 text-danger"
            >
              {error}
            </p>
          ) : null}

          <div className="rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted">
            Your daily guide is a recommendation. Unused credits carry forward,
            and spending can’t exceed your remaining balance.
          </div>

          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !hasValidPreview}>
              {isSaving ? "Saving…" : "Save meal credit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
