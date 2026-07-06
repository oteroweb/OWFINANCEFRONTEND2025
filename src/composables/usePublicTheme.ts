import { ref } from 'vue';
import { Dark } from 'quasar';

const KEY = 'ow-theme';
// El boot file `src/boot/theme.ts` ya aplicó Dark.set()/data-theme antes del
// primer render (desde localStorage o el color-scheme del dispositivo).
const isDark = ref(Dark.isActive);

function applyTheme(dark: boolean) {
  Dark.set(dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try {
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  } catch {
    // storage may be unavailable
  }
}

export function usePublicTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value;
    applyTheme(isDark.value);
  }

  return {
    isDark,
    toggleTheme,
  };
}
