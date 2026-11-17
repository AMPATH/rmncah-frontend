
import LearningHeader from '../components/learning/LearningHeader'
import LearningSummary from '../components/learning/LearningSummary'
import LearningModuleList from '../components/learning/LearningModuleList'

import { menteeLearningData } from '../data/menteeLearningData'

import '../styles/mentee-learning.scss'

interface MyLearningPageProps {
  title: string
}

function MyLearningPage({ title }: MyLearningPageProps) {
  const {
    mentee,
    planTitle,
    totalModules,
    completedModules,
    completedSections,
    totalSections,
    modules,
  } = menteeLearningData

  return (
    <main className="mentee-learning-page">
      <LearningHeader
        title={title}
        planTitle={planTitle}
        cohort={mentee.cohort}
      />

      <LearningSummary
        totalModules={totalModules}
        completedModules={completedModules}
        completedSections={completedSections}
        totalSections={totalSections}
      />

      <LearningModuleList modules={modules} />

      <footer className="mentee-learning-page__footer">
        <span>EmONC Mentorship Training System</span>
        <span>Mentee workspace</span>
      </footer>
    </main>
  )
}

export default MyLearningPage
