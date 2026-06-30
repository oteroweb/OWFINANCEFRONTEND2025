import * as React from 'react';

export interface IconButtonProps {
  /** Material Icons ligature name (e.g. 'notifications', 'visibility'). */
  icon: string;
  onClick?: () => void;
  /** Accessible label — required since the button has no text. */
  ariaLabel?: string;
  /** Renders the brand-soft active treatment. @default false */
  active?: boolean;
  /** Square edge length in px. @default 40 */
  size?: number;
}

/**
 * Square, icon-only button used for header actions, toolbars and toggles.
 * Always pass `ariaLabel`. Set `active` to show the selected/brand-soft state.
 */
export function IconButton(props: IconButtonProps): JSX.Element;
