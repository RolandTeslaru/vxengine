import React from 'react'
import { vxObjectProps } from '../../types/objectStore'
import MaterialParamsPanel from './MaterialParamsPanel'
import MaterialTreePanel from './MaterialTreePanel'

interface Props {
    vxobject: vxObjectProps
}

const MaterialPanels = ({ vxobject }: Props) => {
  return (
    <>
        <MaterialParamsPanel vxobject={vxobject} />
        <MaterialTreePanel vxobject={vxobject} />
    </>
  )
}

export default MaterialPanels