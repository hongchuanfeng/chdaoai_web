import EbookFormatConversionTool from '@/components/EbookFormatConversionTool'
import EbookToolInfo from '@/components/EbookToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'eBook Format Conversion - Convert eBook Formats',
  description: 'Convert eBooks between different formats like EPUB, PDF, MOBI, AZW3 and more.',
}

export default function LangEbookFormatConversionPage() {
  const exampleImages = [
    '/ebook/format-conversion/1.jpg',
    '/ebook/format-conversion/2.jpg',
    '/ebook/format-conversion/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EbookFormatConversionTool toolKey="ebook-format-conversion" />
      <EbookToolInfo toolKey="ebook_format_conversion" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

