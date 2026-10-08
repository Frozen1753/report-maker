import type { ReactNode } from 'react';

import { Tooltip, type TooltipProps } from './Tooltip';
import styles from './Term.module.css';

export interface TermProps extends Omit<TooltipProps, 'content' | 'className'> {
  tooltip: ReactNode;
}

export function Term({ tooltip, ...rest }: TermProps) {
  return <Tooltip content={tooltip} className={styles.term} {...rest} />;
}
