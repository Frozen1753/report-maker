import { ChevronRight } from "lucide-react";
import { useState, type ReactNode, type SyntheticEvent } from "react";

import styles from "./Collapsible.module.css";

type CollapsibleProps = {
  title?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Collapsible({
  title = "See more details",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? internalOpen;

  const handleToggle = (
    event: SyntheticEvent<HTMLDetailsElement>,
  ) => {
    const nextOpen = event.currentTarget.open;

    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <details
      className={styles.collapsible}
      open={isOpen}
      onToggle={handleToggle}
      data-reveal-container="collapsible"
    >
      <summary className={styles["collapsible-summary"]}>
        <span className={styles["collapsible-chevron"]} aria-hidden="true">
          <ChevronRight size={18} strokeWidth={2.25} />
        </span>
        <span>{title}</span>
      </summary>

      <div className={styles["collapsible-content"]}>{children}</div>
    </details>
  );
}
