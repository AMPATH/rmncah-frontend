import { useState } from 'react'

import Sidebar from './components/layout/sidebar/Sidebar'
import Topbar from './components/layout/topbar/Topbar'

import type { UserRole } from './config/roles'
import { navigationByRole } from './config/navigation'

import CountyMentorOverviewPage from './features/county-mentor/pages/OverviewPage'
import CountyMentorsPage from './features/county-mentor/pages/MentorsPage'
import CountyCohortsPage from './features/county-mentor/pages/CohortsPage'
import CountyMenteesPage from './features/county-mentor/pages/MenteesPage'
import CountyFacilitiesPage from './features/county-mentor/pages/FacilitiesPage'
import CountySiteAssessmentsPage from './features/county-mentor/pages/SiteAssessmentsPage'
import CountyFeedbackPage from './features/county-mentor/pages/FeedbackPage'


import MentorOverviewPage from './features/mentor/pages/OverviewPage'
import MyCohortsPage from './features/mentor/pages/MyCohortsPage'
import MenteesPage from './features/mentor/pages/MenteesPage'
import LearningPlanPage from './features/mentor/pages/LearningPlanPage'
import AssessmentsPage from './features/mentor/pages/AssessmentsPage'
import ResourcesPage from './features/mentor/pages/ResourcesPage'
import CohortSubmissionsPage from './features/mentor/pages/CohortSubmissionsPage'
import FeedbackPage from './features/mentor/pages/FeedbackPage'

import ProgramLeadOverviewPage from './features/program-lead/pages/OverviewPage'
import TrainingModulesPage from './features/program-lead/pages/TrainingModulesPage'
import ModuleSectionsPage from './features/program-lead/pages/ModuleSectionsPage'
import LearningMaterialsPage from './features/program-lead/pages/LearningMaterialsPage'
import ModuleLibraryPage from './features/program-lead/pages/ModuleLibraryPage'

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

  function renderPage() {
    // COUNTY MENTOR DASHBOARD
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


if (
  activeRole === 'county-mentor' &&
  activePath === '/county-mentor/cohorts'
) {
  return (
    <CountyCohortsPage
      title={pageTitle}
    />
  )
}

if (
  activeRole === 'county-mentor' &&
  activePath === '/county-mentor/mentees'
) {
  return (
    <CountyMenteesPage
      title={pageTitle}
    />
  )
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


// COUNTY MENTOR - FEEDBACK & CHALLENGES
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

    // PROGRAM LEAD - MODULE SECTIONS
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
    // MENTOR OVERVIEW
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
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App