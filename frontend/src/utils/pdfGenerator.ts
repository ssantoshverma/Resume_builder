import html2pdf from "html2pdf.js"

export const generatePDF = async (elementId: string, filename = "resume.pdf") => {
  const element = document.getElementById(elementId)

  if (!element) {
    throw new Error("Resume content element not found")
  }

  const options = {
    margin: 0.5,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
    },
  }

  try {
    await html2pdf().set(options).from(element).save()
    return true
  } catch (error) {
    console.error("PDF generation failed:", error)
    throw new Error("Failed to generate PDF")
  }
}

export const previewPDF = async (elementId: string) => {
  const element = document.getElementById(elementId)

  if (!element) {
    throw new Error("Resume content element not found")
  }

  const options = {
    margin: 0.5,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
    },
  }

  try {
    const pdf = await html2pdf().set(options).from(element).outputPdf("blob")
    const pdfUrl = URL.createObjectURL(pdf)
    window.open(pdfUrl, "_blank")
    return true
  } catch (error) {
    console.error("PDF preview failed:", error)
    throw new Error("Failed to preview PDF")
  }
}
