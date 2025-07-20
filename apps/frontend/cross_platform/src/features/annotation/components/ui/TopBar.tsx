import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Panel } from '../../../../components/ui/Panel'
import { PanelTitleDouble } from '../../../../components/ui/PanelTitleDouble'
import { Paginator } from '../../../../components/ui/Paginator'
import { SelectorButton } from '../../../../components/ui/SelectorButton'
import { SelectorCustom } from '../../../../components/ui/SelectorCustom'
import { InputNumber } from '../../../../components/ui/InputNumber'
import { Button } from '../../../../components/ui/Button'

interface TopBarProps {
  className?: string
}

export function TopBar({ className = '' }: TopBarProps) {
  return (
    <div className={`flex justify-between items-center w-full border-b border-border bg-background text-foreground h-20 px-8 ${className}`}>

      <div className="hidden lg:block">
        <PanelTitleDouble 
          title={"Annotation Task ID: 777xxxxxxxxxxxx777"}
          subtitle={"Name_of_image.jpg"}
        />
      </div>

      <Paginator>
        <SelectorButton 
          icon={ChevronLeft}
        />
        
        <SelectorCustom>
          <span>Go to:</span>
          
          <InputNumber className="w-16" />

          <span>/ 140</span>
        </SelectorCustom>

        <SelectorButton 
          icon={ChevronRight}
        />
      </Paginator>

      <Button text="Exit Annotator" variant="fill" color="primary" />

    </div>
  )
} 