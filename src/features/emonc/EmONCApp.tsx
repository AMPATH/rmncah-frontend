
import { useEffect, useState } from 'react'

import Sidebar from '../../components/layout/sidebar/Sidebar'
import EmONCTopbar from './components/layout/topbar/EmONCTopbar'

import type { UserRole } from '../../config/roles'
import { navigationByRole } from '../../config/navigation'
import { initializeDemoData } from '../../core/data/seed/seed-initializer'

// County Mentor pages
import CountyMentorOverviewPage from '../county-mentor/pages/OverviewPage'
import CountyMentorsPage from '../county-mentor/pages/MentorsPage'
import CountyCohortsPage from '../county-mentor/pages/CohortsPage'
import CountyMenteesPage from '../county-mentor/pages/MenteesPage'
import CountyFacilitiesPage from '../county-mentor/pages/FacilitiesPage'
import CountySiteAssessmentsPage from '../county-mentor/pages/SiteAssessmentsPage'
import CountyFeedbackPage from '../county-mentor/pages/FeedbackPage'

// Program Lead pages
import ProgramLeadOverviewPage from '../program-lead/pages/OverviewPage'
import TrainingModulesPage from '../program-lead/pages/TrainingModulesPage'
import ModuleSectionsPage from '../program-lead/pages/ModuleSectionsPage'
import LearningMaterialsPage from '../program-lead/pages/LearningMaterialsPage'
import ModuleLibraryPage from '../program-lead/pages/ModuleLibraryPage'

// Mentor pages
import MentorOverviewPage from '../mentor/pages/OverviewPage'
import MyCohortsPage from '../mentor/pages/MyCohortsPage'
import MenteesPage from '../mentor/pages/MenteesPage'
import LearningPlanPage from '../mentor/pages/LearningPlanPage'
import AssessmentsPage from '../mentor/pages/AssessmentsPage'
import ResourcesPage from '../mentor/pages/ResourcesPage'
import CohortSubmissionsPage from '../mentor/pages/CohortSubmissionsPage'
import FeedbackPage from '../mentor/pages/FeedbackPage'

// Mentee pages
import MenteeOverviewPage from '../mentee/pages/OverviewPage'
import MyLearningPage from '../mentee/pages/MyLearningPage'
import SchedulePage from '../mentee/pages/SchedulePage'
import MenteeAssessmentsPage from '../mentee/pages/AssessmentsPage'
import MenteeResourcesPage from '../mentee/pages/ResourcesPage'
import MenteeFeedbackPage from '../mentee/pages/FeedbackPage'

import './App.scss'

function App() {
  useEffect(() => {
    const seedResult = initializeDemoData()

    console.info('[EmONC] Demo data initialization:', seedResult)
  }, [])

  const [activeRole, setActiveRole] =
    useState<UserRole>('county-mentor')

  const [activePath, setActivePath] =
    useState('/county-mentor/overview')

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

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
    setIsMobileMenuOpen(false)

    if (firstItem) {
      setActivePath(firstItem.path)
    }
  }

  function handleNavigate(path: string) {
    setActivePath(path)
    setIsMobileMenuOpen(false)
  }

  function handleMobileMenuToggle() {
    setIsMobileMenuOpen((previous) => !previous)
  }

  function handleMobileMenuClose() {
    setIsMobileMenuOpen(false)
  }

  function renderPage() {
    // County Mentor
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

    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/mentors'
    ) {
      return <CountyMentorsPage title={pageTitle} />
    }

    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/cohorts'
    ) {
      return <CountyCohortsPage title={pageTitle} />
    }

    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/mentees'
    ) {
      return <CountyMenteesPage title={pageTitle} />
    }

    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/facilities'
    ) {
      return <CountyFacilitiesPage title={pageTitle} />
    }

    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/site-assessments'
    ) {
      return <CountySiteAssessmentsPage title={pageTitle} />
    }

    if (
      activeRole === 'county-mentor' &&
      activePath === '/county-mentor/feedback'
    ) {
      return <CountyFeedbackPage title={pageTitle} />
    }

    // Program Lead
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

    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/module-sections'
    ) {
      return <ModuleSectionsPage title={pageTitle} />
    }

    if (
      activeRole === 'program-lead' &&
      activePath === '/program-lead/learning-materials'
    ) {
      return <LearningMaterialsPage title={pageTitle} />
    }

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

    // Mentor
    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/overview'
    ) {
      return <MentorOverviewPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/cohorts'
    ) {
      return <MyCohortsPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/mentees'
    ) {
      return <MenteesPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/learning-plan'
    ) {
      return <LearningPlanPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/assessments'
    ) {
      return <AssessmentsPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/resources'
    ) {
      return <ResourcesPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/cohort-submissions'
    ) {
      return <CohortSubmissionsPage title={pageTitle} />
    }

    if (
      activeRole === 'mentor' &&
      activePath === '/mentor/feedback'
    ) {
      return <FeedbackPage title={pageTitle} />
    }

    // Mentee
    if (
      activeRole === 'mentee' &&
      activePath === '/mentee/overview'
    ) {
      return <MenteeOverviewPage title={pageTitle} />
    }

    if (
      activeRole === 'mentee' &&
      activePath === '/mentee/learning'
    ) {
      return <MyLearningPage title={pageTitle} />
    }

    if (
      activeRole === 'mentee' &&
      activePath === '/mentee/schedule'
    ) {
      return <SchedulePage title={pageTitle} />
    }

    if (
      activeRole === 'mentee' &&
      activePath === '/mentee/assessments'
    ) {
      return <MenteeAssessmentsPage title={pageTitle} />
    }

    if (
      activeRole === 'mentee' &&
      activePath === '/mentee/resources'
    ) {
      return <MenteeResourcesPage title={pageTitle} />
    }

    if (
      activeRole === 'mentee' &&
      activePath === '/mentee/feedback'
    ) {
      return <MenteeFeedbackPage title={pageTitle} />
    }

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
        <Sidebar
          navigation={currentNavigation}
          activePath={activePath}
          onNavigate={handleNavigate}
          mobileOpen={isMobileMenuOpen}
          onClose={handleMobileMenuClose}
        />

        {isMobileMenuOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={handleMobileMenuClose}
          />
        )}

        <main className="app-main">
          <EmONCTopbar
            pageTitle={pageTitle}
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            onMenuClick={handleMobileMenuToggle}
            mobileMenuOpen={isMobileMenuOpen}
          />

          <div className="app-content">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
