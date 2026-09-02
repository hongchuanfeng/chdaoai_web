import CSVTool from '@/components/CSVTool'
import CSVToolInfo from '@/components/CSVToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CSV Merge - Combine CSV Files',
  description: 'Merge multiple CSV files into one document with our easy-to-use tool.',
}

export default function LangCsvMergePage() {
  const exampleImages = [
    '/csv/merge/1.jpg',
    '/csv/merge/2.jpg',
    '/csv/merge/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <CSVTool toolKey="csv_merge" />
      <CSVToolInfo toolKey="csv_merge" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

