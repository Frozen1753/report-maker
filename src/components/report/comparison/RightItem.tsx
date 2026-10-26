import { Tabs } from "../tabs";
import type { ComparisonItemProps } from "./types";

export function RightItem({
    children,
    label = "After",
}: ComparisonItemProps) {
    return (
        <Tabs.Item label={label}>
            <div className="before-after-content">{children}</div>
        </Tabs.Item>
    );
}
