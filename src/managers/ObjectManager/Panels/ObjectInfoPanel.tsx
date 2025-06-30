import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import React from 'react'
import JsonView from 'react18-json-view'
import ICON_MAP from '../components/ObjectTree/icons'

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
      <JsonView src={vxobject} collapsed={({ depth }) => depth > 1}/>
    </CollapsiblePanel>
  )
}

export default ObjectInfoPanel
