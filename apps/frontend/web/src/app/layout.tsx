import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { AnnotationProvider } from '@abe/cross_platform/src/features/annotation/components/providers/AnnotationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ABE Annotation Platform',
  description: 'Image data labeling platform for machine learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AnnotationProvider>
          {children}
        </AnnotationProvider>
      </body>
    </html>
  )
} 