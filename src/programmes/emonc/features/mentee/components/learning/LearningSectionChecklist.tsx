
import { Checkmark } from '@carbon/icons-react'

import type { MenteeLearningSection } from '../../data/menteeLearningData'

interface LearningSectionChecklistProps {
  sections: MenteeLearningSection[]
}

function LearningSectionChecklist({
  sections,
}: LearningSectionChecklistProps) {
  return (
    <div className="mentee-section-checklist">
      {sections.map((section) => (
        <div
          className={`mentee-section-checklist__item ${
            section.completed
              ? 'mentee-section-checklist__item--completed'
              : ''
          }`}
          key={section.id}
        >
          {section.completed && (
            <Checkmark
              size={16}
              aria-label="Completed"
            />
          )}

          <span>{section.label}</span>
        </div>
      ))}
    </div>
  )
}

export default LearningSectionChecklist
