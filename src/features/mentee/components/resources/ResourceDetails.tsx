
import { Button, Tag } from '@carbon/react'
import type { MentorResource } from '../../../mentor/types/mentor.types'

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
      className="mentee-resource-details"
      aria-label="Resource details"
    >
      <header className="mentee-resource-details__header">
        <div>
          <span>LEARNING MATERIAL</span>
          <h2>{resource.title}</h2>
        </div>

        <Button
          kind="ghost"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </header>

      <div className="mentee-resource-details__body">
        <div className="mentee-resource-details__type">
          <Tag type="blue">{resource.type}</Tag>
        </div>

        <section>
          <h3>About this resource</h3>
          <p>{resource.description}</p>
        </section>

        <section>
          <h3>Learning information</h3>

          <dl>
            <div>
              <dt>Assigned module</dt>
              <dd>{resource.moduleTitle}</dd>
            </div>

            <div>
              <dt>Learning section</dt>
              <dd>{resource.sectionTitle}</dd>
            </div>
          </dl>
        </section>

        <section>
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
          <div className="mentee-resource-details__notice">
            <strong>Learning file not yet connected</strong>
            <p>
              This resource is listed in your assigned learning
              materials, but its file has not yet been uploaded
              or connected. Contact your assigned mentor if you
              need access to the material.
            </p>
          </div>
        )}
      </div>

      <footer className="mentee-resource-details__footer">
        {hasFile ? (
          <>
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open resource
            </a>

            <a
              href={resource.fileUrl}
              download={resource.fileName}
              className="secondary"
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
      </footer>
    </aside>
  )
}
