import { createApp, type Component } from 'vue'

export function withSetup(hook, ...args) {
  let result: Component

  const app = createApp({
    setup() {
      result = hook(...args)
      return () => {}
    },
  })

  app.mount(document.createElement('div'))

  return [app, result]
}
