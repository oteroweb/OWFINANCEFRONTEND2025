import * as React from 'react';

export interface EyebrowProps {
  children?: React.ReactNode;
}

/**
 * Tiny all-caps meta label (the "eyebrow") placed above amounts and section
 * headings to add context, e.g. "DISPONIBLE · USD".
 */
export function Eyebrow(props: EyebrowProps): JSX.Element;
