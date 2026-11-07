
import { useState } from 'react'

import Sidebar from './components/layout/sidebar/Sidebar'
import Topbar from './components/layout/topbar/Topbar'

import { countyMentorNavigation } from './config/navigation/countyMentor'
import OverviewPage from './features/county-mentor/pages/OverviewPage'

import './App.css'

function App() {
  const defaultPath = '/county-mentor/overview'

  const [activePath, setActivePath] = useState(defaultPath)

  const activeItem = countyMentorNavigation.groups
    .flatMap((group) => group.items)
    .find((item) => item.path === activePath)

  const pageTitle = activeItem?.label ?? 'Overview'

  return (
    <div className="app-layout">
      <Sidebar
        navigation={countyMentorNavigation}
        activePath={activePath}
        onNavigate={setActivePath}
      />

      <main className="app-main">
        <Topbar pageTitle={pageTitle} />

        <div className="app-content">
          {activePath === defaultPath ? (
            <OverviewPage title={pageTitle} />
          ) : (
            <section className="section-placeholder">
              <p>COUNTY MENTOR / RH</p>
              <h1>{pageTitle}</h1>
              <span>
                This section will be implemented in its own feature module.
              </span>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
