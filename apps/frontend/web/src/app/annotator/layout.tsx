import React from 'react'
import { TopBar, RightPanel, CanvasContainer, BottomToolsPanel } from '@abe/cross_platform'

export default function AnnotatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full flex flex-col">
      
      <TopBar />

      <div className="flex h-full">
        <CanvasContainer />
        <RightPanel>
          <div> </div>
        </ RightPanel>
      </div>

      <BottomToolsPanel />

      {/* Web-specific content */}
      {children}

    </div>
  )
} 