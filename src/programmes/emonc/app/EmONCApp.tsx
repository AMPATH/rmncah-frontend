
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import Sidebar from '../layout/sidebar/Sidebar'
import EmONCTopbar from '../layout/topbar/EmONCTopbar'

import type { UserRole } from '../config/roles'
import { navigationByRole } from '../config/navigation'
import { initializeDemoData } from '../data/seed/seed-initializer'

// County Mentor pages
import CountyMentorOverviewPage from '../features/county-mentor/pages/OverviewPage'
import CountyMentorsPage from '../features/county-mentor/pages/MentorsPage'
import CountyCohortsPage from '../features/county-mentor/pages/CohortsPage'
import CountyMenteesPage from '../features/county-mentor/pages/MenteesPage'
import CountyFacilitiesPage from '../features/county-mentor/pages/FacilitiesPage'
import CountySiteAssessmentsPage from '../features/county-mentor/pages/SiteAssessmentsPage'
import CountyFeedbackPage from '../features/county-mentor/pages/FeedbackPage'

// Program Lead pages
import ProgramLeadOverviewPage from '../features/program-lead/pages/OverviewPage'
import TrainingModulesPage from '../features/program-lead/pages/TrainingModulesPage'
import ModuleSectionsPage from '../features/program-lead/pages/ModuleSectionsPage'
import LearningMaterialsPage from '../features/program-lead/pages/LearningMaterialsPage'
import ModuleLibraryPage from '../features/program-lead/pages/ModuleLibraryPage'

// Mentor pages
import MentorOverviewPage from '../features/mentor/pages/OverviewPage'
import MyCohortsPage from '../features/mentor/pages/MyCohortsPage'
import MenteesPage from '../features/mentor/pages/MenteesPage'
import LearningPlanPage from '../features/mentor/pages/LearningPlanPage'
import AssessmentsPage from '../features/mentor/pages/AssessmentsPage'
import ResourcesPage from '../features/mentor/pages/ResourcesPage'
import CohortSubmissionsPage from '../features/mentor/pages/CohortSubmissionsPage'
import FeedbackPage from '../features/mentor/pages/FeedbackPage'

// Mentee pages
import MenteeOverviewPage from '../features/mentee/pages/OverviewPage'
import MyLearningPage from '../features/mentee/pages/MyLearningPage'
import SchedulePage from '../features/mentee/pages/SchedulePage'
import MenteeAssessmentsPage from '../features/mentee/pages/AssessmentsPage'
import MenteeResourcesPage from '../features/mentee/pages/ResourcesPage'
import MenteeFeedbackPage from '../features/mentee/pages/FeedbackPage'



// System Administrator pages
import AdminOverviewPage from '../features/system-admin/pages/OverviewPage'
import AdminUserManagementPage from '../features/system-admin/pages/UserManagementPage'
import AdminRolePermissionsPage from '../features/system-admin/pages/RolePermissionsPage'
import AdminSystemConfigurationPage from '../features/system-admin/pages/SystemConfigurationPage'
import AdminModuleManagementPage from '../features/system-admin/pages/ModuleManagementPage'
import AdminAuditLogsPage from '../features/system-admin/pages/AuditLogsPage'
import AdminReportsPage from '../features/system-admin/pages/ReportsPage'


import './App.scss'

const DEFAULT_PATH = '/program-lead/overview'
const EMONC_PREFIX = '/emonc'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const seedResult = initializeDemoData()

    console.info('[EmONC] Demo data initialization:', seedResult)
  }, [])

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Resolve the internal navigation path from the browser URL.
  const requestedPath = location.pathname.startsWith(EMONC_PREFIX)
    ? location.pathname.slice(EMONC_PREFIX.length) || DEFAULT_PATH
    : DEFAULT_PATH

  // Determine which role owns the current navigation path.
  const matchedRole = (Object.keys(navigationByRole) as UserRole[]).find(
    (role) =>
      navigationByRole[role].groups
        .flatMap((group) => group.items)
        .some((item) => item.path === requestedPath),
  )

  const activeRole: UserRole = matchedRole ?? 'program-lead'
  const activePath = matchedRole ? requestedPath : DEFAULT_PATH

  const currentNavigation = navigationByRole[activeRole]

  const activeItem = currentNavigation.groups
    .flatMap((group) => group.items)
    .find((item) => item.path === activePath)

  const pageTitle = activeItem?.label ?? 'Overview'

  // Redirect invalid or unknown EmONC URLs to the default page.
  useEffect(() => {
    if (!matchedRole) {
      navigate(`${EMONC_PREFIX}${DEFAULT_PATH}`, { replace: true })
    }
  }, [matchedRole, navigate])

  function handleRoleChange(role: UserRole) {
    const nextNavigation = navigationByRole[role]

    const firstItem = nextNavigation.groups
      .flatMap((group) => group.items)[0]

    setIsMobileMenuOpen(false)

    if (firstItem) {
      navigate(`${EMONC_PREFIX}${firstItem.path}`)
    }
  }

  function handleNavigate(path: string) {
    navigate(`${EMONC_PREFIX}${path}`)
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

    // System Administrator

    // System Administrator
    if (
      activeRole === 'admin' &&
      activePath === '/admin/overview'
    ) {
      return <AdminOverviewPage title={pageTitle} />
    }

    if (
      activeRole === 'admin' &&
      activePath === '/admin/users'
    ) {
      return <AdminUserManagementPage title={pageTitle} />
    }

    if (
      activeRole === 'admin' &&
      activePath === '/admin/roles'
    ) {
      return <AdminRolePermissionsPage title={pageTitle} />
    }

    if (
      activeRole === 'admin' &&
      activePath === '/admin/configuration'
    ) {
      return <AdminSystemConfigurationPage title={pageTitle} />
    }

    if (
      activeRole === 'admin' &&
      activePath === '/admin/modules'
    ) {
      return <AdminModuleManagementPage title={pageTitle} />
    }

    if (
      activeRole === 'admin' &&
      activePath === '/admin/audit-logs'
    ) {
      return <AdminAuditLogsPage title={pageTitle} />
    }

    if (
      activeRole === 'admin' &&
      activePath === '/admin/reports'
    ) {
      return <AdminReportsPage title={pageTitle} />
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

          <div className="emonc-app-content">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
