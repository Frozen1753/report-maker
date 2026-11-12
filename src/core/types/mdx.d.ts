
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { FigureEntry } from '../utils/mdx-plugins/remark-figures';
  import type { TocEntry } from '../utils/mdx-plugins/remark-heading-numbers';
  import type { MDXType } from './mdx-exports';

  export const toc: TocEntry[];
  export const figures: FigureEntry[];

  const MDXComponent: MDXType;
  export default MDXComponent;
}
