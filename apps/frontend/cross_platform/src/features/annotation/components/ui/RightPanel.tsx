'use client'

import React from 'react'
import { FileText, MoreHorizontal, Minus, Plus } from 'lucide-react'
import { Panel } from '../../../../components/ui/Panel'
import { Tabs } from '../../../../components/ui/Tabs'
import { Tab } from '../../../../components/ui/Tab'
import { Scrollable, TreeRow, TreeGroupRow, InputDropdown, InputText, Icon, FieldIconPair, FieldLabel, Field } from '../../../../components/ui'

export function RightPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-120 border-l border-border bg-background">

      {/* All-Annotations Panel */}
      <Panel >

        <h1 className="mb-3">All Annotations</h1>
        
        <Tabs>
          <Tab text="Layers" active={true} />
          <Tab text="Classes" />
        </Tabs>
        
        <Scrollable>
          <TreeRow icon={FileText} name="General" />
          <TreeGroupRow icon={FileText} name="Level 1">
            <TreeRow icon={FileText} name="Level 1 Item" />
            <TreeGroupRow icon={FileText} name="Level 2">
              <TreeRow icon={FileText} name="Level 2 Item" />
              <TreeGroupRow icon={FileText} name="Level 3">
                <TreeRow icon={FileText} name="Level 3 Item" />
                <TreeGroupRow icon={FileText} name="Level 4">
                  <TreeRow icon={FileText} name="Level 4 Item" />
                  <TreeGroupRow icon={FileText} name="Level 5">
                    <TreeRow icon={FileText} name="Level 5 Item" />
                    <TreeGroupRow icon={FileText} name="Level 6 (Limited)">
                      <TreeRow icon={FileText} name="Level 6 Item (Limited)" />
                    </TreeGroupRow>
                  </TreeGroupRow>
                </TreeGroupRow>
              </TreeGroupRow>
            </TreeGroupRow>
          </TreeGroupRow>
        </Scrollable>

      </Panel>

      {/* Inspector Panel */}
      <Panel height="h-full">

        <h1 className="mb-3">Inspector</h1>
        
        <Field>

          <FieldIconPair>
            <FieldLabel label="Class" />
            <Icon icon={MoreHorizontal} />
          </FieldIconPair>

          <FieldIconPair>
            <InputDropdown 
              title="Select Tool"
              options={["Eye", "Eyes", "Mouth", "Nose", "Face"]}
            />
            <Icon icon={null} />
          </FieldIconPair>

        </Field>

        
        <Field className='pt-8 pb-0'>
          <FieldIconPair>
            <FieldLabel label="CUSTOM PROPERTIES" className="text-base" />
            <Icon icon={Plus} />
          </FieldIconPair>
        </Field>


        <Field>

          <FieldIconPair>
            <FieldLabel label="Description" />
            <Icon icon={Minus} />
          </FieldIconPair>

          <FieldIconPair>
            <InputText 
              placeholder="Enter description..."
            />
            <Icon icon={null} />
          </FieldIconPair>

        </Field>


      </Panel>

    </div>
  )
} 