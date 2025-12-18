'use client'

import jsPDF from 'jspdf'

interface PropertyData {
    title: string
    address: string
    bedrooms: number
    bathrooms: number
    garages: number
    squareMeters: number
    landArea?: number
    price: string
    description?: string
}

interface InclusionCategory {
    name: string
    items: {
        title: string
        features: string[]
    }[]
}

interface BrochureData {
    property: PropertyData
    tierName: string
    categories: InclusionCategory[]
}

// Company info
const COMPANY = {
    name: 'Cloverton Homes',
    tagline: 'Premium Residential Builder',
    phone: '1300 CLOVERTON',
    email: 'info@clovertonhomes.com.au',
    website: 'www.clovertonhomes.com.au',
    address: '123 Builder Street, Brisbane QLD 4000'
}

// Colors
const COLORS = {
    primary: '#2A6566',       // brand-teal
    charcoal: '#2C3E50',      // brand-charcoal
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    white: '#FFFFFF'
}

export async function generatePropertyBrochure(data: BrochureData): Promise<string> {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPos = margin

    // Helper functions
    const addText = (text: string, x: number, y: number, options?: { fontSize?: number, fontStyle?: string, color?: string, align?: 'left' | 'center' | 'right' }) => {
        const { fontSize = 12, fontStyle = 'normal', color = COLORS.charcoal, align = 'left' } = options || {}
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', fontStyle)
        doc.setTextColor(color)

        let xPos = x
        if (align === 'center') {
            xPos = pageWidth / 2
        } else if (align === 'right') {
            xPos = pageWidth - margin
        }

        doc.text(text, xPos, y, { align })
    }

    const addLine = (y: number, color: string = COLORS.lightGray) => {
        doc.setDrawColor(color)
        doc.setLineWidth(0.5)
        doc.line(margin, y, pageWidth - margin, y)
    }

    // ==================== HEADER ====================
    // Logo placeholder (rectangle with company name)
    doc.setFillColor(COLORS.charcoal)
    doc.rect(margin, yPos, 60, 15, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.white)
    doc.text('CLOVERTON', margin + 5, yPos + 10)

    // Contact info on right
    doc.setFontSize(9)
    doc.setTextColor(COLORS.gray)
    doc.setFont('helvetica', 'normal')
    doc.text(COMPANY.phone, pageWidth - margin, yPos + 5, { align: 'right' })
    doc.text(COMPANY.email, pageWidth - margin, yPos + 10, { align: 'right' })
    doc.text(COMPANY.website, pageWidth - margin, yPos + 15, { align: 'right' })

    yPos += 25
    addLine(yPos, COLORS.primary)
    yPos += 10

    // ==================== PROPERTY TITLE ====================
    addText(data.property.title, margin, yPos, { fontSize: 24, fontStyle: 'bold', color: COLORS.primary })
    yPos += 8
    addText(data.property.address, margin, yPos, { fontSize: 11, color: COLORS.gray })
    yPos += 15

    // ==================== PROPERTY SPECS ====================
    doc.setFillColor(COLORS.lightGray)
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 3, 3, 'F')

    const specWidth = (pageWidth - (margin * 2)) / 4
    const specs = [
        { label: 'Bedrooms', value: `${data.property.bedrooms}` },
        { label: 'Bathrooms', value: `${data.property.bathrooms}` },
        { label: 'Car Spaces', value: `${data.property.garages}` },
        { label: 'House Size', value: `${data.property.squareMeters}m²` },
    ]

    specs.forEach((spec, i) => {
        const xCenter = margin + (specWidth * i) + (specWidth / 2)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.charcoal)
        doc.text(spec.value, xCenter, yPos + 12, { align: 'center' })
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLORS.gray)
        doc.text(spec.label, xCenter, yPos + 18, { align: 'center' })
    })

    yPos += 35

    // ==================== PRICE ====================
    doc.setFillColor(COLORS.primary)
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 18, 3, 3, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.white)
    doc.text(`Package Price: ${data.property.price}`, pageWidth / 2, yPos + 12, { align: 'center' })
    yPos += 28

    // ==================== DESCRIPTION ====================
    if (data.property.description) {
        addText('About This Home', margin, yPos, { fontSize: 14, fontStyle: 'bold', color: COLORS.charcoal })
        yPos += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLORS.gray)
        const descLines = doc.splitTextToSize(data.property.description, pageWidth - (margin * 2))
        doc.text(descLines, margin, yPos)
        yPos += (descLines.length * 5) + 10
    }

    // ==================== INCLUSIONS ====================
    addLine(yPos - 3, COLORS.primary)
    yPos += 5
    addText(`${data.tierName} Inclusions`, margin, yPos, { fontSize: 16, fontStyle: 'bold', color: COLORS.primary })
    yPos += 10

    // Calculate columns
    const colWidth = (pageWidth - (margin * 2)) / 2
    let leftY = yPos
    let rightY = yPos
    let useLeft = true

    data.categories.forEach(category => {
        const startY = useLeft ? leftY : rightY
        const xPos = useLeft ? margin : margin + colWidth + 5

        // Check if we need a new page
        if (startY > pageHeight - 40) {
            doc.addPage()
            leftY = margin
            rightY = margin
            useLeft = true
        }

        let currentY = useLeft ? leftY : rightY

        // Category header
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.charcoal)
        doc.text(category.name.toUpperCase(), xPos, currentY)
        currentY += 6

        // Items and features
        category.items.forEach(item => {
            (item.features || []).forEach(feature => {
                if (currentY > pageHeight - 20) {
                    doc.addPage()
                    currentY = margin
                }
                doc.setFontSize(9)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(COLORS.gray)

                // Checkmark
                doc.setTextColor(COLORS.primary)
                doc.text('✓', xPos, currentY)
                doc.setTextColor(COLORS.gray)
                doc.text(feature, xPos + 5, currentY)
                currentY += 5
            })
        })

        currentY += 5

        if (useLeft) {
            leftY = currentY
        } else {
            rightY = currentY
        }
        useLeft = !useLeft
    })

    yPos = Math.max(leftY, rightY) + 10

    // ==================== FOOTER ====================
    // Ensure footer is at bottom
    const footerY = pageHeight - 25

    addLine(footerY - 5, COLORS.charcoal)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.charcoal)
    doc.text(COMPANY.name, margin, footerY)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.gray)
    doc.text(COMPANY.address, margin, footerY + 5)
    doc.text(`Phone: ${COMPANY.phone} | Email: ${COMPANY.email}`, margin, footerY + 10)

    // Date generated
    const today = new Date().toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    doc.text(`Generated: ${today}`, pageWidth - margin, footerY + 10, { align: 'right' })

    // ==================== SAVE ====================
    const filename = `${data.property.title.replace(/\s+/g, '-').toLowerCase()}-${data.tierName.toLowerCase()}-brochure.pdf`

    // Create blob and download link
    const pdfBlob = doc.output('blob')
    const blobUrl = URL.createObjectURL(pdfBlob)

    // Create a link element and trigger download
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
    }, 100)

    return filename
}
