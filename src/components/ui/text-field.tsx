import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  trailingAction?: ReactNode;
};

export function TextField({
  id,
  label,
  hint,
  error,
  trailingAction,
  className = "",
  ...props
}: TextFieldProps) {
  const messageId = `${id}-message`;
  const description = error || hint;
  const input = (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={description ? messageId : undefined}
      className={`min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${error ? "border-danger" : ""} ${trailingAction ? "pr-12" : ""} ${className}`}
      {...props}
    />
  );

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {trailingAction ? (
        <div className="relative">
          {input}
          <span className="absolute inset-y-0 right-1 flex items-center">
            {trailingAction}
          </span>
        </div>
      ) : (
        input
      )}
      {description ? (
        <p
          id={messageId}
          className={`text-sm ${error ? "text-danger" : "text-muted"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
