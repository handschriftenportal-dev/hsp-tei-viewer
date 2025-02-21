import React from 'react'

import { Config, ConfigContext } from './config'
import { EventTargetContext } from './events'

export interface Props {
  children?: React.ReactNode
  config: Required<Config>
  eventTarget: EventTarget
}

export function Providers(props: Props) {
  return (
    <ConfigContext.Provider value={props.config}>
      <EventTargetContext.Provider value={props.eventTarget}>
        {props.children}
      </EventTargetContext.Provider>
    </ConfigContext.Provider>
  )
}
