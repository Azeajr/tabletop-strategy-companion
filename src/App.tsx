import { Router, Route } from '@solidjs/router'
import { ConfirmationContext, createConfirmation } from './hooks/use-confirmation'
import GameLibrary from './views/GameLibrary'
import PreGameDashboard from './views/PreGameDashboard'
import LiveCompanion from './views/LiveCompanion'

export default function App() {
  const confirmation = createConfirmation()
  return (
    <ConfirmationContext.Provider value={confirmation}>
      <Router>
        <Route path="/" component={GameLibrary} />
        <Route path="/game/:id" component={PreGameDashboard} />
        <Route path="/game/:id/play" component={LiveCompanion} />
      </Router>
    </ConfirmationContext.Provider>
  )
}
