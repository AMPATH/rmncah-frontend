
import { useEffect, useState } from 'react'

import Sidebar from '../../components/layout/sidebar/Sidebar'
import EmONCTopbar from './components/layout/topbar/EmONCTopbar'

import type { UserRole } from '../../config/roles'
import { navigationByRole } from '../../config/navigation'
import { initializeDemoData } from '../../core/data/seed/seed-initializer'

import CountyMentorOverviewPage from '../county-mentor/pages/OverviewPage'
import CountyMentorsPage from '../county-mentor/pages/MentorsPage'
import CountyCohortsPage from '../county-mentor/pages/CohortsPage'
import CountyMenteesPage from '../county-mentor/pages/MenteesPage'
import CountyFacilitiesPage from '../county-mentor/pages/FacilitiesPage'
import CountySiteAssessmentsPage from '../county-mentor/pages/SiteAssessmentsPage'
import CountyFeedbackPage from '../county-mentor/pages/FeedbackPage'

import MentorOverviewPage from '../mentor/pages/OverviewPage'
import MyCohortsPage from '../mentor/pages/MyCohortsPage'
import MenteesPage from '../mentor/pages/MenteesPage'
import LearningPlanPage from '../mentor/pages/LearningPlanPage'
import AssessmentsPage from '../mentor/pages/AssessmentsPage'
import ResourcesPage from '../mentor/pages/ResourcesPage'
import CohortSubmissionsPage from '../mentor/pages/CohortSubmissionsPage'
import FeedbackPage from '../mentor/pages/FeedbackPage'

import ProgramLeadOverviewPage from '../program-lead/pages/OverviewPage'
import TrainingModulesPage from '../program-lead/pages/TrainingModulesPage'
import ModuleSectionsPage from '../program-lead/pages/ModuleSectionsPage'
import LearningMaterialsPage from '../program-lead/pages/LearningMaterialsPage'
import ModuleLibraryPage from '../program-lead/pages/ModuleLibraryPage'

import './App.scss'

function App() {
  // Initialize demo data once when the application mounts.
  useEffect(() => {
    const seedResult = initializeDemoData()

    console.info('[EmONC] Demo data initialization:', seedResult)
  }, [])

  // Application state.
  const [activeRole, setActiveRole] =
    useState<UserRole>('county-mentor')

  const [activePath, setActivePath] =
    useState('/county-mentor/overview')

  // Mobile navigation drawer state.
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

  // Current role navigation configuration.
  const currentNavigation = navigationByRole[activeRole]

  const activeItem = currentNavigation.groups
    .flatMap((group) => group.items)
    .find((item) => item.path === activePath)

  const pageTitle = activeItem?.label ?? 'Overview'

  // Handle role switching.
  function handleRoleChange(role: UserRole) {
    const nextNavigation = navigationByRole[role]

    const firstItem = nextNavigation.groups
      .flatMap((group) => group.items)[0]

    setActiveRole(role)
    setIsMobileMenuOpen(false)

    if (firstItem) {
      setActivePath(firstItem.path)
    }
  }

  // Handle navigation between pages.
  function handleNavigate(path: string) {
    setActivePath(path)
    setIsMobileMenuOpen(false)
  }

  // Open or close the mobile navigation drawer.
  function handleMobileMenuToggle() {
    setIsMobileMenuOpen((previous) => !previous)
  }

  function handleMobileMenuClose() {
    setIsMobileMenuOpen(false)
  }

  // Render the active page.
  function renderPage() {
    // COUNTY MENTOR - OVERVIEW
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/overview'
    ) {
      return (
        <CountyMentorOverviewPage
          title={pageTitle}
          onNavigate={handleNavigate}
        />
      )
    }

    // COUNTY MENTOR - MENTORS
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/mentors'
    ) {
      return <CountyMentorsPage title={pageTitle} />
    }

    // COUNTY MENTOR - COHORTS
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/cohorts'
    ) {
      return <CountyCohortsPage title={pageTitle} />
    }

    // COUNTY MENTOR - MENTEES
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/mentees'
    ) {
      return <CountyMenteesPage title={pageTitle} />
    }

    // COUNTY MENTOR - FACILITIES
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/facilities'
    ) {
      return <CountyFacilitiesPage title={pageTitle} />
    }

    // COUNTY MENTOR - SITE ASSESSMENTS
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/site-assessments'
    ) {
      return <CountySiteAssessmentsPage title={pageTitle} />
    }

    // COUNTY MENTOR - FEEDBACK
    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/feedback'
    ) {
      return <CountyFeedbackPage title={pageTitle} />
    }

    // PROGRAM LEAD - OVERVIEW
    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/overview'
    ) {
      return (
        <ProgramLeadOverviewPage
          title={pageTitle}
          onNavigate={handleNavigate}
        />
      )
    }

    // PROGRAM LEAD - TRAINING MODULES
    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/training-modules'
    ) {
      return (
        <TrainingModulesPage
          title={pageTitle}
          onNavigate={handleNavigate}
        />
      )
    }

    // PROGRAM LEAD - MODULE SECTIONS
    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/module-sections'
    ) {
      return <ModuleSectionsPage title={pageTitle} />
    }

    // PROGRAM LEAD - LEARNING MATERIALS
    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/learning-materials'
    ) {
      return <LearningMaterialsPage title={pageTitle} />
    }

    // PROGRAM LEAD - MODULE LIBRARY
    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/module-library'
    ) {
      return (
        <ModuleLibraryPage
          title={pageTitle}
          onNavigate={handleNavigate}
        />
      )
    }

    // MENTOR - OVERVIEW
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/overview'
    ) {
      return <MentorOverviewPage title={pageTitle} />
    }

    // MENTOR - MY COHORTS
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/cohorts'
    ) {
      return <MyCohortsPage title={pageTitle} />
    }

    // MENTOR - MENTEES
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/mentees'
    ) {
      return <MenteesPage title={pageTitle} />
    }

    // MENTOR - LEARNING PLAN
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/learning-plan'
    ) {
      return <LearningPlanPage title={pageTitle} />
    }

    // MENTOR - ASSESSMENTS
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/assessments'
    ) {
      return <AssessmentsPage title={pageTitle} />
    }

    // MENTOR - RESOURCES
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/resources'
    ) {
      return <ResourcesPage title={pageTitle} />
    }

    // MENTOR - COHORT SUBMISSIONS
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/cohort-submissions'
    ) {
      return <CohortSubmissionsPage title={pageTitle} />
    }

    // MENTOR - FEEDBACK
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/feedback'
    ) {
      return <FeedbackPage title={pageTitle} />
    }

    // OTHER PAGES - TEMPORARY PLACEHOLDER
    return (
      <section className="section-placeholder">
        <p>{currentNavigation.title.toUpperCase()}</p>

        <h1>{pageTitle}</h1>

        <span>
          This section will be implemented in its own feature module.
        </span>
      </section>
    )
  }

  return (
    <div className="emonc-app">
      <div className="app-layout">

        {/* Application sidebar */}
        <Sidebar
          navigation={currentNavigation}
          activePath={activePath}
          onNavigate={handleNavigate}
          mobileOpen={isMobileMenuOpen}
          onClose={handleMobileMenuClose}
          
        />

        {/* Mobile navigation backdrop */}
        {isMobileMenuOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={handleMobileMenuClose}
          />
        )}

        {/* Main application area */}
        <main className="app-main">

          {/* Application topbar */}
          <EmONCTopbar
            pageTitle={pageTitle}
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            onMenuClick={handleMobileMenuToggle}
            mobileMenuOpen={isMobileMenuOpen}
          />

          {/* Active page content */}
          <div className="app-content">
            {renderPage()}
          </div>

        </main>
      </div>
    </div>
  )
}

export default App
