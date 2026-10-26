import { Comparison as ComparisonRoot } from "./Comparison";
import { LeftItem } from "./LeftItem";
import { RightItem } from "./RightItem";

export const Comparison = Object.assign(ComparisonRoot, {
    Left: LeftItem,
    Right: RightItem,
});

export type { ComparisonItemProps, ComparisonProps } from "./types";
