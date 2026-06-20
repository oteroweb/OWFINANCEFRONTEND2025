import { boot } from 'quasar/wrappers'
import * as Sentry from '@sentry/vue'

export default boot(({ app, router }) => {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) return // Sentry desactivado si no hay DSN configurado

  Sentry.init({
    app,
    dsn,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION as string | undefined,
  })
})
