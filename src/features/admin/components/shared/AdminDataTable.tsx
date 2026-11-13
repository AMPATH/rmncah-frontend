
import type { ReactNode } from 'react'

export interface AdminTableColumn<T> {
  key: keyof T
  label: string
  render?: (row: T) => ReactNode
}

interface AdminDataTableProps<T extends { id: string }> {
  columns: AdminTableColumn<T>[]
  rows: T[]
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export default function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = 'No records found.',
  onRowClick,
}: AdminDataTableProps<T>) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="admin-table__empty">
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'admin-table__row--clickable' : ''}
              >
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render
                      ? column.render(row)
                      : String(row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
