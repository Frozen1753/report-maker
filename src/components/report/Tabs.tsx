import {
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react";

export type TabItem = {
    label: string;
    content: ReactNode;
    disabled?: boolean;
};

type TabsProps = {
    tabs: TabItem[];
    defaultActive?: number;
    className?: string;
};

export function Tabs({
    tabs,
    defaultActive = 0,
    className = "",
}: TabsProps) {
    const [activeIndex, setActiveIndex] = useState(defaultActive);
    const tabsId = useId();
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const getNextEnabledIndex = (
        index: number,
        direction: 1 | -1,
    ): number => {
        let nextIndex = index;

        for (let i = 0; i < tabs.length; i++) {
            nextIndex = (nextIndex + direction + tabs.length) % tabs.length;

            if (!tabs[nextIndex].disabled) {
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
                nextIndex = tabs.findIndex((tab) => !tab.disabled);
                break;

            case "End":
                nextIndex = [...tabs]
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

    if (tabs.length === 0) {
        return null;
    }

    const activeTab = tabs[activeIndex] ?? tabs[0];

    return (
        <div className={`tabs ${className}`}>
            <div className="tabs-list" role="tablist" aria-label="Content sections">
                {tabs.map((tab, index) => {
                    const tabId = `${tabsId}-tab-${index}`;
                    const panelId = `${tabsId}-panel-${index}`;
                    const isActive = index === activeIndex;

                    return (
                        <button
                            key={tabId}
                            ref={(element) => {
                                buttonRefs.current[index] = element;
                            }}
                            id={tabId}
                            type="button"
                            role="tab"
                            className={`tabs-trigger${isActive ? " active" : ""}`}
                            aria-selected={isActive}
                            aria-controls={panelId}
                            tabIndex={isActive ? 0 : -1}
                            disabled={tab.disabled}
                            onClick={() => setActiveIndex(index)}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div
                id={`${tabsId}-panel-${activeIndex}`}
                className="tabs-panel"
                role="tabpanel"
                aria-labelledby={`${tabsId}-tab-${activeIndex}`}
                tabIndex={0}
            >
                {activeTab.content}
            </div>
        </div>
    );
}