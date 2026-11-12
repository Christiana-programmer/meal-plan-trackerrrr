import type { ReactNode, SVGProps } from "react";

type IconName =
  | "overview"
  | "budget"
  | "transactions"
  | "plus"
  | "logout"
  | "close"
  | "arrow"
  | "eye"
  | "eyeOff";

const iconPaths: Record<IconName, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  budget: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2.5" />
      <path d="M3 9h18M7 5V3m10 2V3" />
      <path d="M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 16.5h.01M12 16.5h.01" />
    </>
  ),
  transactions: (
    <>
      <path d="M7 3h8l4 4v14H5V3h2Z" />
      <path d="M14 3v5h5M8 12h8M8 16h8" />
    </>
  ),
  plus: <path d="M12 5v14m-7-7h14" />,
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </>
  ),
  close: <path d="m18 6-12 12M6 6l12 12" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.8M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7a10.5 10.5 0 0 0 3-.4" />
    </>
  ),
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}
