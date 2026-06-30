/* Money — formatted currency amount with optional sign and privacy mask. */
/* global React */

export function Money({ value, currency = '$', className = 't-amount-md', sign = false, hidden = false, color }) {
  const isNeg = value < 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const display = hidden ? '••••••' : formatted;
  const prefix = sign ? (isNeg ? '− ' : '+ ') : (isNeg ? '− ' : '');
  return (
    <span className={className} style={{ color: color || 'inherit' }}>
      {prefix}{currency} {display}
    </span>
  );
}
