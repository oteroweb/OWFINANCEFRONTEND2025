/// <reference types="vite/client" />

// Tipado de variables de entorno usadas por Vite en el cliente
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_KEY?: string;
  // Si usas router mode/base vía env, puedes dejarlas opcionales
  readonly VUE_ROUTER_MODE?: 'hash' | 'history' | 'abstract';
  readonly VUE_ROUTER_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Vue SFC type support
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
