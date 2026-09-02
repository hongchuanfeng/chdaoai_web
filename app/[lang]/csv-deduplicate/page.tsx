import CSVDeduplicate from '@/components/CSVDeduplicate'
import CSVToolInfo from '@/components/CSVToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CSV Deduplicate - Remove Duplicate Rows',
  description: 'Remove duplicate rows from your CSV files with our easy-to-use tool.',
}

export default function LangCsvDeduplicatePage() {
  const exampleImages = [
    '/csv/deduplicate/1.jpg',
    '/csv/deduplicate/2.jpg',
    '/csv/deduplicate/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <CSVDeduplicate />
      <CSVToolInfo toolKey="csv_deduplicate" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

