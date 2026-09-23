import { useState, type ReactNode } from "react";

type Slot = string | ReactNode;

type BeforeAfterProps = {
    before: Slot;
    after: Slot;
    beforeLabel?: string;
    afterLabel?: string;
};

function renderSlot(slot: Slot) {
    if (typeof slot === "string") {
        return <img src={slot} alt="" />;
    }
    return slot;
}

export function BeforeAfter({ before, after, beforeLabel = "Avant", afterLabel = "Après" }: BeforeAfterProps) {
    const [active, setActive] = useState<"before" | "after">("before");

    return (
        <div className="before-after">
            <div className="before-after-toggle" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={active === "before"}
                    className={active === "before" ? "active" : ""}
                    onClick={() => setActive("before")}
                >
                    {beforeLabel}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={active === "after"}
                    className={active === "after" ? "active" : ""}
                    onClick={() => setActive("after")}
                >
                    {afterLabel}
                </button>
            </div>

            <div className="before-after-stage">
                <div className={`before-after-layer${active === "before" ? " visible" : ""}`}>
                    {renderSlot(before)}
                </div>
                <div className={`before-after-layer${active === "after" ? " visible" : ""}`}>
                    {renderSlot(after)}
                </div>
            </div>
        </div>
    );
};
