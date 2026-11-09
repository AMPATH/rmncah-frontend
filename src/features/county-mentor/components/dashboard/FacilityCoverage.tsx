import { Button } from '@carbon/react'
import { ArrowRight, Hospital, Location } from '@carbon/icons-react'

import type { FacilityCoverageItem } from '../../types/county-mentor.types'

interface FacilityCoverageProps {
  facilities: FacilityCoverageItem[]
  onNavigate: (path: string) => void
}

function FacilityCoverage({
  facilities,
  onNavigate,
}: FacilityCoverageProps) {
  return (
    <section className="county-panel county-facilities">
      <div className="county-panel__heading">
        <div>
          <h2>Facility coverage</h2>
          <p>Mentorship participation by facility.</p>
        </div>

        <Button
          kind="tertiary"
          size="sm"
          renderIcon={ArrowRight}
          onClick={() => onNavigate('/county-mentor/facilities')}
        >
          View facilities
        </Button>
      </div>

      {facilities.length === 0 ? (
        <div className="county-empty">
          No facilities have been registered.
        </div>
      ) : (
        <div className="county-facility-list">
          {facilities.map((facility) => (
            <article className="county-facility-row" key={facility.id}>
              <div className="county-facility-row__identity">
                <Hospital size={19} />

                <div>
                  <strong>{facility.name}</strong>

                  <span>
                    <Location size={13} />
                    {facility.location}
                  </span>
                </div>
              </div>

              <div className="county-facility-row__counts">
                <span>{facility.mentors} mentors</span>
                <span>{facility.mentees} mentees</span>
              </div>

              <span
                className={`county-facility-status ${
                  facility.activity === 'Active'
                    ? 'county-facility-status--active'
                    : 'county-facility-status--attention'
                }`}
              >
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