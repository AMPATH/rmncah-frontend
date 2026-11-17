import { Button, Tag } from '@carbon/react'
import type { LearningResource } from '../../data/models/learning-resource.types.ts'

interface ResourceDetailsProps {
  resource: LearningResource
  onClose: () => void
  variant: 'mentor' | 'mentee'
}

export default function ResourceDetails({
  resource,
  onClose,
  variant,
}: ResourceDetailsProps) {
  const isMentee = variant === 'mentee'
  const prefix = isMentee
    ? 'mentee-resource-details'
    : 'resource-details'

  const formattedDate = new Date(
    `${resource.publishedDate}T00:00:00`,
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hasFile = resource.fileUrl.trim().length > 0
  const sectionClass = isMentee ? undefined : `${prefix}__section`

  return (
    <aside
      className={prefix}
      aria-label="Resource details"
    >
      <header className={`${prefix}__header`}>
        <div>
          <span>
            {isMentee ? 'LEARNING MATERIAL' : 'RESOURCE DETAILS'}
          </span>
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

      <div className={`${prefix}__body`}>
        <div className={`${prefix}__type`}>
          <Tag type="blue">{resource.type}</Tag>
        </div>

        <section className={sectionClass}>
          <h3>
            {isMentee ? 'About this resource' : 'Description'}
          </h3>
          <p>{resource.description}</p>
        </section>

        <section className={sectionClass}>
          <h3>
            {isMentee ? 'Learning information' : 'Training information'}
          </h3>

          <dl>
            <div>
              <dt>{isMentee ? 'Assigned module' : 'Training module'}</dt>
              <dd>{resource.moduleTitle}</dd>
            </div>

            <div>
              <dt>{isMentee ? 'Learning section' : 'Module section'}</dt>
              <dd>{resource.sectionTitle}</dd>
            </div>
          </dl>
        </section>

        <section className={sectionClass}>
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
          <div className={`${prefix}__notice`}>
            <strong>
              {isMentee
                ? 'Learning file not yet connected'
                : 'File not connected'}
            </strong>

            <p>
              {isMentee
                ? 'This resource is listed in your assigned learning materials, but its file has not yet been uploaded or connected. Contact your assigned mentor if you need access to the material.'
                : 'This is illustrative resource data. The published file will become available when its file URL is supplied.'}
            </p>
          </div>
        )}
      </div>

      <footer className={`${prefix}__footer`}>
        {hasFile ? (
          <>
            <a
              className={isMentee ? undefined : `${prefix}__link`}
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open resource
            </a>

            <a
              className={
                isMentee
                  ? 'secondary'
                  : `${prefix}__link ${prefix}__link--secondary`
              }
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
      </footer>
    </aside>
  )
}
