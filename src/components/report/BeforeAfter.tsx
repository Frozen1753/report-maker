import type { ReactNode } from 'react';
import { Tabs, type TabItem } from './Tabs';

type Slot = string | ReactNode;

type BeforeAfterProps = {
  before: Slot;
  after: Slot;
  beforeLabel?: string;
  afterLabel?: string;
};

export function BeforeAfter({
  before,
  after,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
}: BeforeAfterProps) {
  const tabs: TabItem[] = [
    {
      label: beforeLabel,
      content: <div className="before-after-content">{before}</div>,
    },
    {
      label: afterLabel,
      content: <div className="before-after-content">{after}</div>,
    },
  ];

  return <Tabs tabs={tabs} className="before-after" />;
}
