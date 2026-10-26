import { Tabs } from "../tabs";
import type { ComparisonItemProps } from "./types";

export function LeftItem({
    children,
    label = "Before",
}: ComparisonItemProps) {
    return (
        <Tabs.Item label={label}>
            <div className="before-after-content">{children}</div>
        </Tabs.Item>
    );
}
