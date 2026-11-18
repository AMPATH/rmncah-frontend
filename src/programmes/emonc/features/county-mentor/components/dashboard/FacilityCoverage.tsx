import {
  ArrowRight,
  Hospital,
  Location,
  UserMultiple,
} from '@carbon/icons-react'
import { Button } from '@carbon/react'

import type { FacilityCoverageItem } from '../../types/county-mentor.types.ts'

interface FacilityCoverageProps {
  facilities: FacilityCoverageItem[]
  onNavigate: (path: string) => void
}

function FacilityCoverage({ facilities, onNavigate }: FacilityCoverageProps) {
  return (
    <section className="county-panel county-facilities">
      <div className="county-panel__heading">
        <div>
          <span className="county-panel__eyebrow">FACILITY NETWORK</span>
          <h2>Facility coverage</h2>
          <p>Mentorship participation across facilities.</p>
        </div>

        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowRight}
          onClick={() => onNavigate('/county-mentor/facilities')}
        >
          View all
        </Button>
      </div>

      {facilities.length === 0 ? (
        <div className="county-empty">
          <Hospital size={24} />
          <strong>No facilities registered</strong>
          <span>No facilities have been registered.</span>
        </div>
      ) : (
        <div className="county-facility-list">
          {facilities.map((facility) => (
            <article className="county-facility-row" key={facility.id}>
              <span className="county-facility-row__icon">
                <Hospital size={20} />
              </span>

              <div className="county-facility-row__identity">
                <strong>{facility.name}</strong>
                <span>
                  <Location size={13} />
                  {facility.location}
                </span>
              </div>

              <div className="county-facility-row__counts">
                <span>
                  <UserMultiple size={14} />
                  {facility.mentors} mentors
                </span>
                <span>{facility.mentees} mentees</span>
              </div>

              <span
                className={`county-facility-status ${
                  facility.activity === 'Active'
                    ? 'county-facility-status--active'
                    : 'county-facility-status--attention'
                }`}
              >
                <span className="county-facility-status__dot" />
                {facility.activity}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default FacilityCoverage
