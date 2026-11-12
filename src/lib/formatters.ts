const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatNaira(amountKobo: number) {
  return nairaFormatter.format(amountKobo / 100);
}

export function formatNairaCompact(amountKobo: number) {
  return `₦${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amountKobo / 100))}`;
}

export function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00.000Z`));
}
