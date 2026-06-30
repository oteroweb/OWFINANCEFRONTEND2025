import * as React from 'react';

export interface AvatarProps {
  /** Single character / initials rendered inside the badge. */
  initial: React.ReactNode;
  /** Diameter in px. @default 40 */
  size?: number;
}

/**
 * Circular brand-colored badge showing a user's initial. Scales its glyph with
 * `size`. Use in headers, profile rows and account lists.
 */
export function Avatar(props: AvatarProps): JSX.Element;
