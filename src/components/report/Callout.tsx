import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "note";

type CalloutProps = {
    type?: CalloutType;
    title?: string;
    children: ReactNode;
};

const DEFAULT_TITLES: Record<CalloutType, string> = {
    info: "Info",
    warning: "Attention",
    note: "Note",
};

export function Callout({ type = "info", title, children }: CalloutProps) {
    return (
        <div className={`callout callout-${type}`}>
            <div className="callout-title">{title ?? DEFAULT_TITLES[type]}</div>
            <div className="callout-body">{children}</div>
        </div>
    );
};
