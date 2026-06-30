import * as React from 'react';

export interface MoneyProps {
  /** Numeric amount. Negative values render a minus sign. */
  value: number;
  /** Currency symbol / code prefix. @default '$' */
  currency?: string;
  /** Typography utility class controlling size. @default 't-amount-md' */
  className?: string;
  /** Force a leading +/- even for positive values. @default false */
  sign?: boolean;
  /** Mask the digits for privacy. @default false */
  hidden?: boolean;
  /** Override text color (e.g. var(--income-fg)). */
  color?: string;
}

/**
 * Tabular currency amount with consistent formatting, optional signed display
 * and a privacy mask. Pair with the t-amount-* type classes for scale.
 */
export function Money(props: MoneyProps): JSX.Element;
