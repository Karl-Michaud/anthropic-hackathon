import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

/**
 * Sanitize filename by removing invalid characters
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase()
}

/**
 * Export essay as a plain text file
 */
export function exportAsTxt(content: string, filename: string): void {
  const sanitizedName = sanitizeFilename(filename)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${sanitizedName}.txt`)
}

/**
 * Export essay as a PDF file
 */
export function exportAsPdf(
  content: string,
  filename: string,
  title?: string
): void {
  const sanitizedName = sanitizeFilename(filename)
  const doc = new jsPDF()

  // Set up fonts and margins
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  let yPosition = margin

  // Add title if provided
  if (title) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const titleLines = doc.splitTextToSize(title, maxWidth)
    doc.text(titleLines, margin, yPosition)
    yPosition += titleLines.length * 8 + 10
  }

  // Add content
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')

  // Split content into lines that fit the page width
  const lines = doc.splitTextToSize(content, maxWidth)
  const lineHeight = 7

  for (const line of lines) {
    // Check if we need a new page
    if (yPosition + lineHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }

    doc.text(line, margin, yPosition)
    yPosition += lineHeight
  }

  doc.save(`${sanitizedName}.pdf`)
}

/**
 * Export essay as a Microsoft Word document
 */
export async function exportAsDocx(
  content: string,
  filename: string,
  title?: string
): Promise<void> {
  const sanitizedName = sanitizeFilename(filename)

  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter((p) => p.trim())

  const docChildren: Paragraph[] = []

  // Add title if provided
  if (title) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 32, // 16pt
          }),
        ],
        spacing: { after: 400 },
      })
    )
  }

  // Add content paragraphs
  for (const para of paragraphs) {
    // Handle line breaks within paragraphs
    const lines = para.split('\n')
    const textRuns: TextRun[] = []

    lines.forEach((line, index) => {
      textRuns.push(
        new TextRun({
          text: line,
          size: 24, // 12pt
        })
      )
      if (index < lines.length - 1) {
        textRuns.push(new TextRun({ break: 1 }))
      }
    })

    docChildren.push(
      new Paragraph({
        children: textRuns,
        spacing: { after: 200 },
      })
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${sanitizedName}.docx`)
}

export type ExportFormat = 'txt' | 'pdf' | 'docx'

/**
 * Export essay in the specified format
 */
export async function exportEssay(
  content: string,
  filename: string,
  format: ExportFormat,
  title?: string
): Promise<void> {
  switch (format) {
    case 'txt':
      exportAsTxt(content, filename)
      break
    case 'pdf':
      exportAsPdf(content, filename, title)
      break
    case 'docx':
      await exportAsDocx(content, filename, title)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}
