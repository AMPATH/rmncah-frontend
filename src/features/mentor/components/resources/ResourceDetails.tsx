
import { Button, Tag } from '@carbon/react'
import type { MentorResource } from '../../types/mentor.types'

interface ResourceDetailsProps {
  resource: MentorResource
  onClose: () => void
}

export default function ResourceDetails({
  resource,
  onClose,
}: ResourceDetailsProps) {
  const formattedDate = new Date(
    `${resource.publishedDate}T00:00:00`,
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hasFile = resource.fileUrl.trim().length > 0

  return (
    <aside
      className="resource-details"
      aria-label="Resource details"
    >
      <div className="resource-details__header">
        <div>
          <span>RESOURCE DETAILS</span>
          <h2>{resource.title}</h2>
        </div>

        <Button
          kind="ghost"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      <div className="resource-details__body">
        <div className="resource-details__type">
          <Tag type="blue">{resource.type}</Tag>
        </div>

        <section className="resource-details__section">
          <h3>Description</h3>
          <p>{resource.description}</p>
        </section>

        <section className="resource-details__section">
          <h3>Training information</h3>

          <dl>
            <div>
              <dt>Training module</dt>
              <dd>{resource.moduleTitle}</dd>
            </div>

            <div>
              <dt>Module section</dt>
              <dd>{resource.sectionTitle}</dd>
            </div>
          </dl>
        </section>

        <section className="resource-details__section">
          <h3>File information</h3>

          <dl>
            <div>
              <dt>File name</dt>
              <dd>{resource.fileName}</dd>
            </div>

            <div>
              <dt>File size</dt>
              <dd>{resource.fileSize}</dd>
            </div>

            {resource.duration && (
              <div>
                <dt>Duration</dt>
                <dd>{resource.duration}</dd>
              </div>
            )}

            <div>
              <dt>Published date</dt>
              <dd>{formattedDate}</dd>
            </div>
          </dl>
        </section>

        {!hasFile && (
          <div className="resource-details__notice">
            <strong>File not connected</strong>
            <p>
              This is illustrative resource data. The published file
              will become available when its file URL is supplied.
            </p>
          </div>
        )}
      </div>

      <div className="resource-details__footer">
        {hasFile ? (
          <>
            <a
              className="resource-details__link"
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open resource
            </a>

            <a
              className="resource-details__link resource-details__link--secondary"
              href={resource.fileUrl}
              download={resource.fileName}
            >
              Download
            </a>
          </>
        ) : (
          <>
            <Button kind="primary" disabled>
              Open resource
            </Button>

            <Button kind="secondary" disabled>
              Download
            </Button>
          </>
        )}
      </div>
    </aside>
  )
}
