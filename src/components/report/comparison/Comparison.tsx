import { Tabs } from "../tabs";
import type { ComparisonProps } from "./types";

export function Comparison({
  children,
}: ComparisonProps) {
  return <Tabs className="before-after">{children}</Tabs>;
}
