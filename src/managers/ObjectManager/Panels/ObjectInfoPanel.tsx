import CollapsiblePanel from '@vxengine/ui/components/CollapsiblePanel'
import React from 'react'
import JsonView from 'react18-json-view'
import ICON_MAP from './ObjectTreePanel/icons'

interface Props {
    vxobject: any
}

const ObjectInfoPanel: React.FC<Props> = ({ vxobject }) => {
  return (
    <CollapsiblePanel
        title="Object Info"
        defaultOpen={false}
        icon={ICON_MAP["Icon"]}
        iconClassName=" "
    >
      <div className='overflow-y-scroll h-auto'>
        <JsonView src={vxobject} collapsed={({ depth }) => depth > 1}/>
      </div>
    </CollapsiblePanel>
  )
}

export default ObjectInfoPanel
