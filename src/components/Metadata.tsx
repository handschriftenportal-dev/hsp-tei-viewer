import React from 'react'

import { useViewerContext } from '../context/Viewer'
import { XNode } from '../types'
import { MetadataItem } from './MetadataItem'

export function Metadata() {
  const { root } = useViewerContext()

  const xNode = root as XNode
  if (xNode.rules) {
    const metaDataRule = xNode.rules.find((e) => e.metadata !== undefined)
    if (metaDataRule) {
      return <MetadataItem xnode={xNode} rule={metaDataRule}></MetadataItem>
    }
  }
  return null
}
