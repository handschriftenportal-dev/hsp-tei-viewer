import React from 'react'

import { ViewerStateProvider } from '../../src'
import { Props, Viewer } from '../../src/context/Viewer'

export function TestProvider(props: Props) {
  return (
    <ViewerStateProvider>
      <Viewer {...props} />
    </ViewerStateProvider>
  )
}
