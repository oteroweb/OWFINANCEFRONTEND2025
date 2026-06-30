import * as React from 'react';

export interface CurrencyChipProps {
  /** Currency code shown as the label. @default 'USD' */
  code?: string;
  /** Live (green dot) vs inactive (muted dot). @default true */
  active?: boolean;
}

/**
 * Selectable currency token used in the header / period contexts. The leading
 * dot signals whether the currency feed is live (`active`) or stale.
 */
export function CurrencyChip(props: CurrencyChipProps): JSX.Element;
