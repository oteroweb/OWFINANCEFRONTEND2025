declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
// no se si tiene efecto
// Vue SFC module shim (ensures .vue files have a default export for TS)
// declare module '*.vue' {
//   import type { DefineComponent } from 'vue'
//   type Props = Record<string, never>
//   type Emits = Record<string, never>
//   const component: DefineComponent<Props, Emits, unknown>
//   export default component
// }
