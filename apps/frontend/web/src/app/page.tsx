import React from 'react'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          ABE Annotation Platform
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Welcome to the image data labeling platform
        </p>
      </div>
    </main>
  )
} 