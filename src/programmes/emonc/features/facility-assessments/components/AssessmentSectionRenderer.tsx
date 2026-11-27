
import type {
  AssessmentAnswer,
  AssessmentSourceRow,
  AssessmentTemplate,
  AssessmentTemplateSection,
  YesNoPairAnswer,
} from '../types'

interface AssessmentSectionRendererProps {
  template: AssessmentTemplate
  section: AssessmentTemplateSection
  answers: Record<string, AssessmentAnswer>
  onAnswerChange: (questionId: string, answer: AssessmentAnswer) => void
}

function getSourceRows(
  template: AssessmentTemplate,
  item: AssessmentTemplateSection['items'][number],
): AssessmentSourceRow[] {
  const block = template.blocks[item.source.block]

  if (!block?.rows) return []

  const indexes = item.source.rows ?? (
    item.source.row === undefined ? [] : [item.source.row]
  )

  return indexes
    .map((index) => block.rows?.[index])
    .filter((row): row is AssessmentSourceRow => row !== undefined)
}

function getCellText(paragraphs: string[]): string {
  return paragraphs.join(' ')
}

function isYesOption(text: string): boolean {
  return /^\s*YES(?:\s|\[|$)/i.test(text)
}

function isNoOption(text: string): boolean {
  return /^\s*NO(?:\s|\[|$)/i.test(text)
}

function isNumberMarker(paragraph: string): boolean {
  return /^\s*\d+\.?\s*$/.test(paragraph)
}

function hasQuestionText(
  row: AssessmentSourceRow,
  answerCellIndexes: number[],
): boolean {
  return row.cells.some((cell, index) => {
    if (answerCellIndexes.includes(index)) return false

    return cell.paragraphs.some(
      (paragraph) =>
        paragraph.trim().length > 0 && !isNumberMarker(paragraph),
    )
  })
}

function getYesNoCells(row: AssessmentSourceRow): {
  yesIndex: number
  noIndex: number
} | null {
  const yesIndex = row.cells.findIndex((cell) =>
    isYesOption(getCellText(cell.paragraphs)),
  )

  const noIndex = row.cells.findIndex((cell) =>
    isNoOption(getCellText(cell.paragraphs)),
  )

  if (yesIndex === -1 || noIndex === -1) return null

  return { yesIndex, noIndex }
}

function getCombinedYesNoIndexes(row: AssessmentSourceRow): number[] {
  return row.cells.reduce<number[]>((indexes, cell, index) => {
    const text = getCellText(cell.paragraphs)

    if (/\bYES\b/i.test(text) && /\bNO\b/i.test(text)) {
      indexes.push(index)
    }

    return indexes
  }, [])
}

function getReasonOptions(
  row: AssessmentSourceRow,
  startIndex: number,
  endIndex: number,
): string[] {
  return row.cells
    .slice(startIndex, endIndex)
    .flatMap((cell) => cell.paragraphs)
    .filter(
      (paragraph) =>
        paragraph.trim().length > 0 && !isNumberMarker(paragraph),
    )
}

function SourceContent({
  rows,
  questionNumber,
  excludedCells = [],
}: {
  rows: AssessmentSourceRow[]
  questionNumber: number
  excludedCells?: number[][]
}) {
  return (
    <div className="assessment-question__source">
      {rows.map((row, rowIndex) => {
        const firstCell = row.cells[0]

        const sourceNumber = rowIndex === 0
          ? firstCell?.paragraphs.find(isNumberMarker)
          : undefined

        const hasSourceNumber = Boolean(sourceNumber)

        const questionCellIndex = hasSourceNumber
          ? row.cells.findIndex(
              (cell, index) =>
                index > 0 &&
                cell.paragraphs.some(
                  (paragraph) => paragraph.trim().length > 0,
                ),
            )
          : -1

        const shouldShowInlineNumber = rowIndex === 0

        return (
          <div
            className={[
              'assessment-question__source-row',
              questionCellIndex !== -1
                ? 'assessment-question__source-row--numbered'
                : '',
            ].filter(Boolean).join(' ')}
            key={rowIndex}
          >
            {questionCellIndex !== -1 && (
              <div className="assessment-question__numbered-question">
                <span className="assessment-question__source-number">
                  {questionNumber}.
                </span>

                <div className="assessment-question__source-question">
                  {row.cells[questionCellIndex].paragraphs
                    .filter((paragraph) => paragraph.length > 0)
                    .map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                </div>
              </div>
            )}

            {row.cells.map((cell, cellIndex) => {
              if (excludedCells[rowIndex]?.includes(cellIndex)) {
                return null
              }

              if (
                questionCellIndex !== -1 &&
                (cellIndex === 0 || cellIndex === questionCellIndex)
              ) {
                return null
              }

              const paragraphs = cell.paragraphs.filter(
                (paragraph) =>
                  paragraph.length > 0 &&
                  !(rowIndex === 0 && cellIndex === 0 && isNumberMarker(paragraph)),
              )

              if (paragraphs.length === 0) return null

              const isFirstVisibleCell =
                rowIndex === 0 &&
                !hasSourceNumber &&
                shouldShowInlineNumber &&
                cellIndex === row.cells.findIndex((candidate) =>
                  candidate.paragraphs.some(
                    (paragraph) => paragraph.trim().length > 0,
                  ),
                )

              return (
                <div
                  className="assessment-question__source-cell"
                  key={cellIndex}
                >
                  {isFirstVisibleCell && (
                    <span className="assessment-question__source-number">
                      {questionNumber}.
                    </span>
                  )}

                  {paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function EquipmentSourceContent({
  rows,
}: {
  rows: AssessmentSourceRow[]
}) {
  return (
    <div className="assessment-question__equipment-source">
      {rows.map((row, rowIndex) => {
        const number = row.cells[0]?.paragraphs.filter(
          (paragraph) => paragraph.length > 0,
        ) ?? []

        const name = row.cells[1]?.paragraphs.filter(
          (paragraph) => paragraph.length > 0,
        ) ?? []

        const crossCheck = row.cells[8]?.paragraphs.filter(
          (paragraph) => paragraph.length > 0,
        ) ?? []

        return (
          <div className="assessment-question__equipment-item" key={rowIndex}>
            <span className="assessment-question__equipment-number">
              {number.map((paragraph, index) => (
                <span key={index}>{paragraph}</span>
              ))}
            </span>

            <div className="assessment-question__equipment-name">
              {name.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {crossCheck.length > 0 && (
                <span className="assessment-question__cross-check">
                  <strong>Cross-check</strong>
                  {crossCheck.map((reference, index) => (
                    <span key={index}>{reference}</span>
                  ))}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function YesNoControl({
  questionId,
  fieldId,
  label,
  value,
  onChange,
}: {
  questionId: string
  fieldId: string
  label: string
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  return (
    <fieldset className="assessment-question__response">
      <legend>{label}</legend>

      <div className="assessment-question__choices">
        {(['yes', 'no'] as const).map((option) => (
          <label className="assessment-question__choice" key={option}>
            <input
              type="radio"
              name={`answer-${questionId}-${fieldId}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ReasonSelect({
  questionId,
  fieldId,
  label,
  options,
  value,
  onChange,
}: {
  questionId: string
  fieldId: string
  label: string
  options: string[]
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  if (options.length === 0) return null

  return (
    <div className="assessment-question__reason">
      <label htmlFor={`${questionId}-${fieldId}`}>{label}</label>

      <select
        id={`${questionId}-${fieldId}`}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">Select a reason</option>

        {options.map((option, index) => (
          <option value={option} key={`${index}-${option}`}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function EquipmentResponse({
  questionId,
  fields,
  value,
  onChange,
}: {
  questionId: string
  fields: { id: string; label: string }[]
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  const current = (
    value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {}
  ) as YesNoPairAnswer

  const updateField = (
    fieldId: keyof YesNoPairAnswer,
    answer: 'yes' | 'no',
  ) => {
    onChange({
      available: current.available ?? null,
      enoughForMonth: current.enoughForMonth ?? null,
      [fieldId]: answer,
    })
  }

  return (
    <div className="assessment-question__paired-response">
      {fields.map((field) => (
        <fieldset
          className="assessment-question__equipment-field"
          key={field.id}
        >
          <legend>{field.label}</legend>

          <div className="assessment-question__equipment-choices">
            {(['yes', 'no'] as const).map((option) => {
              const selected =
                current[field.id as keyof YesNoPairAnswer] === option

              return (
                <label
                  className={[
                    'assessment-question__equipment-choice',
                    selected ? `is-selected is-${option}` : '',
                  ].filter(Boolean).join(' ')}
                  key={option}
                >
                  <input
                    type="radio"
                    name={`answer-${questionId}-${field.id}`}
                    value={option}
                    checked={selected}
                    onChange={() =>
                      updateField(
                        field.id as keyof YesNoPairAnswer,
                        option,
                      )
                    }
                  />

                  <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

function SignalFunctionResponse({
  questionId,
  row,
  fields,
  value,
  onChange,
}: {
  questionId: string
  row: AssessmentSourceRow
  fields: { id: string; label: string; type?: string }[]
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  const answerIndexes = getCombinedYesNoIndexes(row)
  const firstAnswerIndex = answerIndexes[0]
  const secondAnswerIndex = answerIndexes[1]

  if (firstAnswerIndex === undefined || secondAnswerIndex === undefined) {
    return null
  }

  const reasonIndexes = row.cells.reduce<number[]>((indexes, cell, index) => {
    const isBetweenAnswers =
      index > firstAnswerIndex && index < secondAnswerIndex

    const isAfterSecondAnswer = index > secondAnswerIndex

    const hasReasonText = cell.paragraphs.some(
      (paragraph) =>
        paragraph.trim().length > 0 && !isNumberMarker(paragraph),
    )

    if ((isBetweenAnswers || isAfterSecondAnswer) && hasReasonText) {
      indexes.push(index)
    }

    return indexes
  }, [])

  const capacityReasonIndex = reasonIndexes.find(
    (index) => index < secondAnswerIndex,
  )

  const performanceReasonIndex = reasonIndexes.find(
    (index) => index > secondAnswerIndex,
  )

  const capacityOptions = capacityReasonIndex === undefined
    ? []
    : getReasonOptions(row, capacityReasonIndex, capacityReasonIndex + 1)

  const performanceOptions = performanceReasonIndex === undefined
    ? []
    : getReasonOptions(row, performanceReasonIndex, performanceReasonIndex + 1)

  const current = (
    value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {}
  ) as Record<string, string | number | null>

  const updateFields = (changes: Record<string, string | null>) => {
    onChange({
      ...current,
      ...changes,
    })
  }

  const capacityField = fields.find((field) => field.id === 'capacity')
  const capacityReasonField = fields.find(
    (field) => field.id === 'capacityReason',
  )
  const performedField = fields.find((field) => field.id === 'performed')
  const performanceReasonField = fields.find(
    (field) => field.id === 'performanceReason',
  )

  return (
    <div className="assessment-question__signal-response">
      {capacityField && (
        <YesNoControl
          questionId={questionId}
          fieldId={capacityField.id}
          label={capacityField.label}
          value={current.capacity ?? null}
          onChange={(answer) => {
            updateFields({
              capacity: answer === 'yes' || answer === 'no' ? answer : null,
              ...(answer === 'yes' ? { capacityReason: null } : {}),
            })
          }}
        />
      )}

      {current.capacity === 'no' && capacityReasonField && (
        <ReasonSelect
          questionId={questionId}
          fieldId={capacityReasonField.id}
          label={capacityReasonField.label}
          options={capacityOptions}
          value={current.capacityReason ?? null}
          onChange={(answer) =>
            updateFields({
              capacityReason: typeof answer === 'string' ? answer : null,
            })
          }
        />
      )}

      {performedField && (
        <YesNoControl
          questionId={questionId}
          fieldId={performedField.id}
          label={performedField.label}
          value={current.performed ?? null}
          onChange={(answer) =>
            updateFields({
              performed: answer === 'yes' || answer === 'no' ? answer : null,
              ...(answer === 'yes' ? { performanceReason: null } : {}),
            })
          }
        />
      )}

      {current.performed === 'no' && performanceReasonField && (
        <ReasonSelect
          questionId={questionId}
          fieldId={performanceReasonField.id}
          label={performanceReasonField.label}
          options={performanceOptions}
          value={current.performanceReason ?? null}
          onChange={(answer) =>
            updateFields({
              performanceReason: typeof answer === 'string' ? answer : null,
            })
          }
        />
      )}
    </div>
  )
}

type AnswerFields = Record<string, string | number | string[] | null>

function getAnswerFields(value: AssessmentAnswer): AnswerFields {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as AnswerFields
    : {}
}

function ProfileFields({
  rows,
  value,
  onChange,
}: {
  rows: AssessmentSourceRow[]
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  const current = getAnswerFields(value)

  const update = (fieldId: string, answer: string) => {
    onChange({ ...current, [fieldId]: answer })
  }

  return (
    <div className="assessment-question__profile-fields">
      {rows.map((row, rowIndex) => (
        <div className="assessment-question__profile-row" key={rowIndex}>
          {row.cells.map((cell, cellIndex) => {
            const label = cell.paragraphs.find(
              (paragraph) => paragraph.trim().length > 0,
            )

            if (!label) return null

            const fieldId = `field-${rowIndex}-${cellIndex}`

            if (label.includes('Start time:') && label.includes('End time:')) {
              return (
                <div className="assessment-question__profile-field" key={fieldId}>
                  {(['startTime', 'endTime'] as const).map((field, index) => (
                    <label key={field}>
                      {index === 0 ? 'Start time:' : 'End time:'}

                      <input
                        type="time"
                        value={
                          typeof current[field] === 'string'
                            ? current[field] as string
                            : ''
                        }
                        onChange={(event) => update(field, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              )
            }

            const optionsText = label.match(/\(([^)]+)\)/)?.[1]

            const options = optionsText && (
              label.includes('Facility level:') ||
              label.includes('Facility ownership:')
            )
              ? optionsText.split(',').map((option) => option.trim())
              : []

            return (
              <div className="assessment-question__profile-field" key={fieldId}>
                <label htmlFor={`${fieldId}-input`}>{label}</label>

                {options.length > 0 ? (
                  <select
                    id={`${fieldId}-input`}
                    value={
                      typeof current[fieldId] === 'string'
                        ? current[fieldId] as string
                        : ''
                    }
                    onChange={(event) => update(fieldId, event.target.value)}
                  >
                    <option value="">Select</option>

                    {options.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${fieldId}-input`}
                    type="text"
                    value={
                      typeof current[fieldId] === 'string'
                        ? current[fieldId] as string
                        : ''
                    }
                    onChange={(event) => update(fieldId, event.target.value)}
                  />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ConditionalServiceResponse({
  row,
  value,
  onChange,
}: {
  row: AssessmentSourceRow
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  const current = getAnswerFields(value)

  const sourceText = row.cells.flatMap((cell) => cell.paragraphs)

  const options = sourceText
    .filter((paragraph) => paragraph.includes('\t'))
    .flatMap((paragraph) => paragraph.split('\t'))
    .map((option) => option.trim())
    .filter(Boolean)

  const selected = Array.isArray(current.serviceAreas)
    ? current.serviceAreas
    : []

  const update = (changes: AnswerFields) => {
    onChange({ ...current, ...changes })
  }

  return (
    <div className="assessment-question__conditional-response">
      <YesNoControl
        questionId="post-abortion-care"
        fieldId="response"
        label="Response"
        value={current.response ?? null}
        onChange={(answer) => update({
          response: answer === 'yes' || answer === 'no' ? answer : null,
          ...(answer === 'no' ? { serviceAreas: [] } : {}),
        })}
      />

      {current.response === 'yes' && (
        <fieldset className="assessment-question__response">
          <legend>
            If yes for above, in which service area is the service provided?
          </legend>

          <div className="assessment-question__checklist">
            {options.map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option)

                    update({ serviceAreas: next })
                  }}
                />

                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}

function NumberResponse({
  value,
  onChange,
}: {
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  return (
    <div className="assessment-question__number-response">
      <input
        type="number"
        min="0"
        step="1"
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(event) =>
          onChange(
            event.target.value === '' ? null : Number(event.target.value),
          )
        }
      />
    </div>
  )
}

function NumberGroupResponse({
  row,
  value,
  onChange,
}: {
  row: AssessmentSourceRow
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  const current = getAnswerFields(value)
  const sourceCells = row.cells.slice(2)
  const fields: { id: string; label: string }[] = []

  for (let index = 0; index < sourceCells.length; index += 1) {
    const label = sourceCells[index].paragraphs.join(' ').trim()

    if (!label) continue

    if (
      label === 'New-born U' &&
      sourceCells[index + 1]?.paragraphs.join(' ').trim() === 'nit'
    ) {
      fields.push({ id: 'count-1', label: 'New-born Unit' })
      index += 1
      continue
    }

    fields.push({
      id: `count-${index}`,
      label,
    })
  }

  return (
    <div className="assessment-question__number-group">
      {fields.map((field) => (
        <label key={field.id}>
          <span>{field.label}</span>

          <input
            type="number"
            min="0"
            step="1"
            value={
              typeof current[field.id] === 'string' ||
              typeof current[field.id] === 'number'
                ? String(current[field.id])
                : ''
            }
            onChange={(event) =>
              onChange({
                ...current,
                [field.id]: event.target.value === ''
                  ? null
                  : Number(event.target.value),
              })
            }
          />
        </label>
      ))}
    </div>
  )
}

function DocumentChecklist({
  row,
  value,
  onChange,
}: {
  row: AssessmentSourceRow
  value: AssessmentAnswer
  onChange: (answer: AssessmentAnswer) => void
}) {
  const current = getAnswerFields(value)

  const excluded = [
    'Availability of MNH policy and guideline documents',
    'Confirm physically if the documents listed below are available.',
  ]

  const documents = row.cells
    .flatMap((cell) => cell.paragraphs)
    .filter(
      (paragraph) =>
        paragraph.trim().length > 0 &&
        !excluded.includes(paragraph) &&
        !paragraph.includes('(specify)'),
    )

  return (
    <div className="assessment-question__checklist">
      {documents.map((document, index) => {
        const fieldId = `document-${index}`

        return (
          <div className="assessment-question__document" key={fieldId}>
            <span>{document}</span>

            <div className="assessment-question__document-choices">
              {(['yes', 'no'] as const).map((answer) => (
                <label key={answer}>
                  <input
                    type="radio"
                    name={`${fieldId}-availability`}
                    value={answer}
                    checked={current[fieldId] === answer}
                    onChange={() =>
                      onChange({
                        ...current,
                        [fieldId]: answer,
                      })
                    }
                  />

                  {answer === 'yes' ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AssessmentSectionRenderer({
  template,
  section,
  answers,
  onAnswerChange,
}: AssessmentSectionRendererProps) {
  return (
    <section className="assessment-questionnaire-section">
      <header className="assessment-questionnaire-section__header">
        <h2>{section.title}</h2>
        <span>{section.items.length} items</span>
      </header>

      <div className="assessment-questionnaire-section__items">
        {section.items.map((item, itemIndex) => {
          const rows = getSourceRows(template, item)
          const answerCells = rows.map(getYesNoCells)

          const canAnswerYesNo =
            item.response.type === 'yesno' &&
            rows.length > 0 &&
            answerCells.every(
              (cells, index) =>
                cells !== null &&
                hasQuestionText(rows[index], [
                  cells.yesIndex,
                  cells.noIndex,
                ]),
            )

          const isEquipmentResponse =
            item.response.type === 'yesno-pair'

          const isSignalFunctionResponse =
            item.response.type === 'signal-function'

          const excludedCells = rows.map((row, rowIndex) => {
            if (canAnswerYesNo) {
              const cells = answerCells[rowIndex]

              return cells
                ? [cells.yesIndex, cells.noIndex]
                : []
            }

            if (isEquipmentResponse) {
              return [2, 3, 4, 5, 6, 7]
            }

            if (isSignalFunctionResponse) {
              const combinedIndexes = getCombinedYesNoIndexes(row)
              const firstAnswer = combinedIndexes[0]
              const secondAnswer = combinedIndexes[1]

              const reasonIndexes = row.cells.reduce<number[]>(
                (indexes, cell, index) => {
                  const betweenAnswers =
                    firstAnswer !== undefined &&
                    secondAnswer !== undefined &&
                    index > firstAnswer &&
                    index < secondAnswer

                  const afterSecondAnswer =
                    secondAnswer !== undefined && index > secondAnswer

                  const hasReasonText = cell.paragraphs.some(
                    (paragraph) =>
                      paragraph.trim().length > 0 &&
                      !isNumberMarker(paragraph),
                  )

                  if ((betweenAnswers || afterSecondAnswer) && hasReasonText) {
                    indexes.push(index)
                  }

                  return indexes
                },
                [],
              )

              return [...combinedIndexes, ...reasonIndexes]
            }

            return []
          })

          return (
            <article
              className={[
                'assessment-question',
                isEquipmentResponse ? 'assessment-question--equipment' : '',
              ].filter(Boolean).join(' ')}
              key={item.id}
            >
              {isEquipmentResponse ? (
                <EquipmentSourceContent rows={rows} />
              ) : (
                <SourceContent
                  rows={rows}
                  questionNumber={itemIndex + 1}
                  excludedCells={excludedCells}
                />
              )}

              {canAnswerYesNo && (
                <YesNoControl
                  questionId={item.id}
                  fieldId="response"
                  label="Response"
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'yesno-pair' && rows[0] && (
                <EquipmentResponse
                  questionId={item.id}
                  fields={item.response.fields}
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'signal-function' && rows[0] && (
                <SignalFunctionResponse
                  questionId={item.id}
                  row={rows[0]}
                  fields={item.response.fields}
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'profile-fields' && (
                <ProfileFields
                  rows={rows}
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'yesno-and-conditional-select' && rows[0] && (
                <ConditionalServiceResponse
                  row={rows[0]}
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'number' && (
                <NumberResponse
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'number-group' && rows[0] && (
                <NumberGroupResponse
                  row={rows[0]}
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}

              {item.response.type === 'document-checklist' && rows[0] && (
                <DocumentChecklist
                  row={rows[0]}
                  value={answers[item.id] ?? null}
                  onChange={(answer) => onAnswerChange(item.id, answer)}
                />
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
