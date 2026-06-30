import * as React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  /** Hero elevation: larger radius, padding and float shadow. @default false */
  hero?: boolean;
  /** Inner padding in px (ignored when hero). @default 24 */
  padding?: number;
  /** Extra inline style overrides merged onto the container. */
  style?: React.CSSProperties;
}

/**
 * Elevated surface container. Use the default for list/section cards and
 * `hero` for the primary balance / feature panel at the top of a view.
 */
export function Card(props: CardProps): JSX.Element;
