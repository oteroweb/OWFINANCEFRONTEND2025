import * as React from 'react';

export interface PillButtonProps {
  /** Button label / content. */
  children?: React.ReactNode;
  /** Optional Material Icons ligature name shown before the label. */
  icon?: string;
  /** Visual style. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size scale. @default 'md' */
  size?: 'sm' | 'md';
  onClick?: () => void;
  /** Accessible label (use when the button is icon-only or ambiguous). */
  ariaLabel?: string;
  /** Native button type. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Primary pill-shaped action button. Use `primary` for the main CTA on a view,
 * `secondary` for supporting actions, `ghost` for low-emphasis, `danger` for
 * destructive intent.
 */
export function PillButton(props: PillButtonProps): JSX.Element;
