/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import './db/seed' // side-effect: kicks off DB init + seed loading (seedsReady)

// Request persistent storage to prevent OS from evicting OPFS data
void navigator.storage?.persist()

const root = document.getElementById('root')
render(() => <App />, root!)

// Read-only state accessor for the agent harness (harness.config.mjs). Behind
// the DEV constant, so production builds drop it; the production smoke fails
// if `__harness` ever ships.
if (import.meta.env.DEV) void import('./dev/harness').then((harness) => harness.installHarnessAccessor())
