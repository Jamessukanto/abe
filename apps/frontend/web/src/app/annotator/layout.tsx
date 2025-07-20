import React from 'react'
import { TopBar, RightPanel, CanvasArea, BottomToolsPanel } from '@abe/cross_platform'

export default function AnnotatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full flex flex-col">
      <TopBar  />

      <div className="flex h-full">

        <div className="flex-1 relative">
          <CanvasArea />
          <BottomToolsPanel />
        </div>

        <RightPanel />

      </div>
      
      {/* Web-specific content */}
      {children}
    </div>
  )
} 