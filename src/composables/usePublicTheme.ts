import { ref, onMounted } from 'vue';

const KEY = 'ow-theme';
const isDark = ref(false);

function applyTheme(dark: boolean) {
  const theme = dark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // storage may be unavailable
  }
}

export function usePublicTheme() {
  onMounted(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'dark' || saved === 'light') {
        isDark.value = saved === 'dark';
        applyTheme(isDark.value);
      }
  } catch {
    // ignore
  }
  });

  function toggleTheme() {
    isDark.value = !isDark.value;
    applyTheme(isDark.value);
  }

  return {
    isDark,
    toggleTheme,
  };
}
