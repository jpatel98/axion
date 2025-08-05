'use client'

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  contact_person?: string
}

interface Quote {
  id: string
  quote_number: string
  title: string
  description: string
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  valid_until: string
  notes?: string | null
  created_at: string
  customers: Customer
  quote_line_items: LineItem[]
}

interface Company {
  name: string
  email?: string
  phone?: string
  address?: string
}

interface QuotePDFData {
  quote: Quote
  company: Company
}

// PDF generation functionality moved to direct implementation below

export const generateQuotePDF = async (quoteId: string): Promise<Blob> => {
  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    
    const response = await fetch(`/api/v1/quotes/${quoteId}/pdf`)
    if (!response.ok) {
      throw new Error('Failed to fetch quote data for PDF')
    }

    const data: QuotePDFData = await response.json()
    
    // Create PDF directly here to avoid class instantiation issues
    const pdf = new jsPDF()
    const pageHeight = pdf.internal.pageSize.height
    const pageWidth = pdf.internal.pageSize.width
    const margin = 20
    let currentY = margin

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const { quote, company } = data

    // Header - Company Name
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(company.name, pageWidth / 2, currentY, { align: 'center' })
    currentY += 30

    // Company contact info
    if (company.address || company.phone || company.email) {
      let contactInfo = []
      if (company.address) contactInfo.push(company.address)
      if (company.phone) contactInfo.push(`Phone: ${company.phone}`)
      if (company.email) contactInfo.push(`Email: ${company.email}`)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(contactInfo.join(' | '), pageWidth / 2, currentY, { align: 'center' })
      currentY += 20
    }

    // Horizontal line
    pdf.line(margin, currentY, pageWidth - margin, currentY)
    currentY += 20

    // Quote Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('QUOTE', margin, currentY)

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Date: ${formatDate(quote.created_at)}`, pageWidth - margin, currentY, { align: 'right' })
    currentY += 30

    // Quote Information
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Quote Information', margin, currentY)
    currentY += 20

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Quote Number: ${quote.quote_number}`, margin, currentY)
    currentY += 15
    pdf.text(`Title: ${quote.title}`, margin, currentY)
    currentY += 15
    pdf.text(`Status: ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}`, margin, currentY)
    currentY += 15
    pdf.text(`Valid Until: ${formatDate(quote.valid_until)}`, margin, currentY)
    currentY += 20

    // Customer Information
    const rightColumnX = pageWidth / 2 + 10
    let customerY = currentY - 80

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Bill To:', rightColumnX, customerY)
    customerY += 20

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(quote.customers.name, rightColumnX, customerY)
    customerY += 15

    if (quote.customers.contact_person) {
      pdf.text(`Attn: ${quote.customers.contact_person}`, rightColumnX, customerY)
      customerY += 15
    }

    if (quote.customers.address_line1) {
      pdf.text(quote.customers.address_line1, rightColumnX, customerY)
      customerY += 15
    }

    if (quote.customers.city && quote.customers.state) {
      pdf.text(`${quote.customers.city}, ${quote.customers.state} ${quote.customers.postal_code || ''}`, rightColumnX, customerY)
      customerY += 15
    }

    if (quote.customers.phone) {
      pdf.text(`Phone: ${quote.customers.phone}`, rightColumnX, customerY)
      customerY += 15
    }

    if (quote.customers.email) {
      pdf.text(`Email: ${quote.customers.email}`, rightColumnX, customerY)
      customerY += 15
    }

    currentY = Math.max(currentY, customerY) + 20

    // Description if available
    if (quote.description) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Description:', margin, currentY)
      currentY += 15

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const lines = pdf.splitTextToSize(quote.description, pageWidth - 2 * margin)
      pdf.text(lines, margin, currentY)
      currentY += lines.length * 5 + 20
    }

    // Line Items Table
    const tableStartY = currentY
    
    // Table header background
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F')

    // Table headers
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Description', margin + 2, currentY + 8)
    pdf.text('Qty', margin + 102, currentY + 8)
    pdf.text('Unit Price', margin + 132, currentY + 8)
    pdf.text('Line Total', margin + 172, currentY + 8)

    currentY += 20

    // Table borders
    pdf.line(margin, tableStartY, pageWidth - margin, tableStartY)
    pdf.line(margin, currentY, pageWidth - margin, currentY)

    // Line items
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    quote.quote_line_items.forEach((item, index) => {
      const rowY = currentY + 15
      
      // Alternate row background
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(margin, currentY, pageWidth - 2 * margin, 20, 'F')
      }

      pdf.text(item.description.substring(0, 40), margin + 2, rowY)
      pdf.text(item.quantity.toString(), margin + 102, rowY)
      pdf.text(formatCurrency(item.unit_price), margin + 132, rowY)
      pdf.text(formatCurrency(item.line_total), margin + 172, rowY)

      currentY += 20
      pdf.line(margin, currentY, pageWidth - margin, currentY)
    })

    currentY += 10

    // Totals section
    const totalsX = pageWidth - 120
    
    if (quote.subtotal !== quote.total) {
      pdf.setFontSize(10)
      pdf.text('Subtotal:', totalsX, currentY)
      pdf.text(formatCurrency(quote.subtotal), totalsX + 60, currentY, { align: 'right' })
      currentY += 15

      if (quote.tax_amount > 0) {
        pdf.text(`Tax (${(quote.tax_rate * 100).toFixed(2)}%):`, totalsX, currentY)
        pdf.text(formatCurrency(quote.tax_amount), totalsX + 60, currentY, { align: 'right' })
        currentY += 15
      }
    }

    // Total line
    pdf.line(totalsX, currentY, pageWidth - margin, currentY)
    currentY += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Total:', totalsX, currentY)
    pdf.text(formatCurrency(quote.total), totalsX + 60, currentY, { align: 'right' })
    currentY += 25

    // Notes section
    if (quote.notes) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Notes:', margin, currentY)
      currentY += 15

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const notesLines = pdf.splitTextToSize(quote.notes, pageWidth - 2 * margin)
      pdf.text(notesLines, margin, currentY)
      currentY += notesLines.length * 5 + 20
    }

    // Footer
    const footerY = pageHeight - 30
    pdf.setFontSize(10)
    pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' })

    const pdfBuffer = pdf.output('arraybuffer') as Uint8Array
    return new Blob([pdfBuffer], { type: 'application/pdf' })
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export const downloadQuotePDF = async (quoteId: string, fileName?: string) => {
  try {
    const pdfBlob = await generateQuotePDF(quoteId)
    const url = URL.createObjectURL(pdfBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || `quote-${quoteId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    throw error
  }
}