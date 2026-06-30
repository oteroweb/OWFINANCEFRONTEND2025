import * as React from 'react';

export interface ChipProps {
  children?: React.ReactNode;
  /** Semantic color treatment. @default 'default' */
  variant?: 'default' | 'currency' | 'brand' | 'income' | 'expense' | 'warning' | 'info';
  /** Optional Material Icons ligature name shown before the label. */
  icon?: string;
}

/**
 * Compact pill for status, category and metadata labels. Pick the `variant`
 * that matches meaning — `income`/`expense` for money direction, `warning`/`info`
 * for alerts, `brand` for emphasis.
 */
export function Chip(props: ChipProps): JSX.Element;
