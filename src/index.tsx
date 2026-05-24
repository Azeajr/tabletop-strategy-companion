/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import './db/seed' // side-effect: kicks off DB init + seed loading (seedsReady)

// Request persistent storage to prevent OS from evicting OPFS data
void navigator.storage?.persist()

const root = document.getElementById('root')
render(() => <App />, root!)
