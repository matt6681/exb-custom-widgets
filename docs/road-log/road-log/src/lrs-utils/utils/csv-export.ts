// CSV export utility
// Generates a CSV string from data and triggers a browser download

/**
 * Export an array of row objects as a CSV file download.
 */
export function exportCSV (
  filename: string,
  data: Array<Record<string, any>>,
  columns?: string[]
): void {
  if (!data || data.length === 0) return

  // Determine columns from first row if not provided
  const cols = columns || Object.keys(data[0])

  // Build CSV content
  const lines: string[] = []

  // Header row
  lines.push(cols.map(escapeCSVField).join(','))

  // Data rows
  for (const row of data) {
    const values = cols.map(col => {
      const val = row[col]
      if (val === null || val === undefined) return ''
      return escapeCSVField(String(val))
    })
    lines.push(values.join(','))
  }

  const csvContent = lines.join('\r\n')
  downloadFile(filename.endsWith('.csv') ? filename : `${filename}.csv`, csvContent, 'text/csv')
}

function escapeCSVField (value: string): string {
  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function downloadFile (filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
