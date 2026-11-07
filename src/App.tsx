
import { useState } from 'react'

import Sidebar from './components/layout/sidebar/Sidebar'
import Topbar from './components/layout/topbar/Topbar'

import type { UserRole } from './config/roles'
import { navigationByRole } from './config/navigation'

import OverviewPage from './features/county-mentor/pages/OverviewPage'

import './App.css'

function App() {
  const [activeRole, setActiveRole] =
    useState<UserRole>('county-mentor')

  const [activePath, setActivePath] =
    useState('/county-mentor/overview')

  const currentNavigation = navigationByRole[activeRole]

  const activeItem = currentNavigation.groups
    .flatMap((group) => group.items)
    .find((item) => item.path === activePath)

  const pageTitle = activeItem?.label ?? 'Overview'

  function handleRoleChange(role: UserRole) {
    const nextNavigation = navigationByRole[role]

    const firstItem = nextNavigation.groups
      .flatMap((group) => group.items)[0]

    setActiveRole(role)

    if (firstItem) {
      setActivePath(firstItem.path)
    }
  }

  function handleNavigate(path: string) {
    setActivePath(path)
  }

  return (
    <div className="app-layout">
      <Sidebar
        navigation={currentNavigation}
        activePath={activePath}
        onNavigate={handleNavigate}
      />

      <main className="app-main">
        <Topbar
          pageTitle={pageTitle}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
        />

        <div className="app-content">
          {activeRole === 'county-mentor' &&
          activePath === '/county-mentor/overview' ? (
            <OverviewPage title={pageTitle} />
          ) : (
            <section className="section-placeholder">
              <p>{currentNavigation.title.toUpperCase()}</p>

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
