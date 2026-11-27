import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { createSlot, readSlots } from "../../utils/components/slots";
import styles from "./Tabs.module.css";

export type TabItemProps = {
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  children: ReactNode;
  defaultActive?: number;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  className?: string;
};

const Item = createSlot<TabItemProps>("Tabs.Item");

function TabsRoot({
  children,
  defaultActive = 0,
  activeIndex: controlledIndex,
  onActiveChange,
  className = "",
}: TabsProps) {
  const [internalIndex, setInternalIndex] = useState(defaultActive);
  const activeIndex = controlledIndex ?? internalIndex;
  const tabsId = useId();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabItems = readSlots(children, [Item], "Tabs").map(
    ({ props }) => props,
  );

  const setActiveIndex = (index: number) => {
    if (controlledIndex === undefined) {
      setInternalIndex(index);
    }

    onActiveChange?.(index);
  };

  const getNextEnabledIndex = (
    index: number,
    direction: 1 | -1,
  ): number => {
    let nextIndex = index;
    for (let i = 0; i < tabItems.length; i++) {
      nextIndex = (nextIndex + direction + tabItems.length) % tabItems.length;
      if (!tabItems[nextIndex].disabled) {
        return nextIndex;
      }
    }
    return index;
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = getNextEnabledIndex(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = getNextEnabledIndex(index, -1);
        break;
      case "Home":
        nextIndex = tabItems.findIndex((tab) => !tab.disabled);
        break;
      case "End":
        nextIndex = [...tabItems]
          .map((tab, tabIndex) => ({ tab, tabIndex }))
          .reverse()
          .find(({ tab }) => !tab.disabled)?.tabIndex;
        break;
      default:
        return;
    }

    event.preventDefault();

    if (nextIndex !== undefined && nextIndex !== -1) {
      setActiveIndex(nextIndex);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  if (tabItems.length === 0) {
    return null;
  }

  const effectiveIndex =
    tabItems[activeIndex] && !tabItems[activeIndex].disabled
      ? activeIndex
      : Math.max(0, tabItems.findIndex((tab) => !tab.disabled));

  return (
    <div
      className={`${styles.tabs} ${className}`}
      data-reveal-container="tabs"
    >
      <div
        className={styles.tabslist}
        role="tablist"
        aria-label="Content sections"
      >
        {tabItems.map((tab, index) => {
          const tabId = `${tabsId}-tab-${index}`;
          const panelId = `${tabsId}-panel-${index}`;
          const isActive = index === effectiveIndex;

          return (
            <button
              key={tabId}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              data-reveal-tab-trigger={index}
              className={`${styles.tabstrigger} ${isActive ? styles.active : ""
                }`}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabItems.map((tab, index) => {
        const tabId = `${tabsId}-tab-${index}`;
        const panelId = `${tabsId}-panel-${index}`;
        const isActive = index === effectiveIndex;

        return (
          <div
            key={panelId}
            id={panelId}
            className={styles.tabspanel}
            role="tabpanel"
            aria-labelledby={tabId}
            tabIndex={0}
            hidden={!isActive}
            data-reveal-tab-panel={index}
          >
            {tab.children}
          </div>
        );
      })}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, { Item });