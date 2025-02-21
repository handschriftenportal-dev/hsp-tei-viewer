import { WebModuleEvents } from 'hsp-web-module'
import { createContext, useContext } from 'react'

import { State } from '../state'

export type Events = WebModuleEvents<State> & {
  openResourceInSearchClicked: CustomEvent<{ hspobjectid: string }>
}

export const EventTargetContext = createContext<EventTarget | undefined>(
  undefined,
)

export const useEventTarget = () =>
  useContext(EventTargetContext) as EventTarget

export function useEvent<N extends keyof Events>(name: N) {
  const target = useEventTarget()
  return (detail: Events[N]['detail']) => {
    return target.dispatchEvent(
      new CustomEvent(name, {
        detail,
        cancelable: true,
      }),
    )
  }
}
