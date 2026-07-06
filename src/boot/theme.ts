import { boot } from 'quasar/wrappers';
import { Dark } from 'quasar';

const KEY = 'ow-theme';

export default boot(() => {
  let dark = false;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') {
      dark = saved === 'dark';
    } else {
      dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
    }
  } catch {
    // storage/matchMedia unavailable — keep light default
  }
  Dark.set(dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
});
