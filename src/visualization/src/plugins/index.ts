/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import { createVResizeDrawer } from '@wdns/vuetify-resize-drawer';
import { createPinia } from 'pinia'

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  app.use(vuetify)

  app.use(createVResizeDrawer({
    // options
  }));

  const pinia = createPinia()
  app.use(pinia)
}

