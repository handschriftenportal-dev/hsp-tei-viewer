import React, { ReactNode } from 'react'

import Link from '@material-ui/core/Link'
import Tooltip from '@material-ui/core/Tooltip'

interface Props {
  element: Element
  children: ReactNode
}

export function ExternalReference(props: Readonly<Props>) {
  const { element, children } = props

  const target = element.getAttribute('target') ?? ''
  const content = element.textContent
  try {
    const url = new URL(target)

    return (
      <Tooltip tabIndex={0} title={'teiViewerPlugin.externalReference'}>
        <Link href={url.href} target="_blank" rel="noreferrer" color="primary">
          {content}
        </Link>
      </Tooltip>
    )
  } catch {
    return <>{children}</>
  }
}
