import { HspThemeProvider } from 'hsp-web-module'
import React, { createContext, useCallback, useContext } from 'react'
import { Provider, useSelector as useReduxSelector } from 'react-redux'

import {
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles'

import { Providers } from '../contexts/Providers'
import { State, makeStore } from '../state'

const config = {
  enableRouting: true,
  discoveryEndpoint: '/api/search',
  theme: {
    mixins: {
      toolbar: {
        minHeight: 0,
      },
    },
  },
  createAbsoluteURL({
    pathname,
    search,
    hash,
  }: {
    pathname: string
    search: string
    hash: string
  }) {
    const url = new URL(pathname, window.location.origin)
    url.search = search
    url.hash = hash
    return url
  },
  cacheOptions: {
    staleTime: 3 * 60 * 1000,
    retry: 3,
  },
  classNamePrefix: 'hsp-tei-viewer',
  customFetch: window.fetch,
}

const defaultSliceSelector = (state: any) => state
export const SliceContext = createContext(defaultSliceSelector)

const defaultEventTarget = new EventTarget()

defaultEventTarget.addEventListener('openResourceInSearchClicked', (e) => {
  console.log('event fired:', e)
})
export interface Props {
  children?: React.ReactNode
  sliceSelector?: (state: any) => State
  eventTarget?: EventTarget
}

export function ViewerStateProvider(props: Props) {
  const { children, sliceSelector } = props

  const callback = useCallback(sliceSelector ?? defaultSliceSelector, [])
  const store = makeStore()
  const eventTarget = props.eventTarget ?? defaultEventTarget
  const generateClassName = createGenerateClassName({
    seed: config.classNamePrefix,
  })

  const Viewer = (
    <Providers config={config} eventTarget={eventTarget}>
      <SliceContext.Provider value={callback}>{children}</SliceContext.Provider>
    </Providers>
  )

  if (sliceSelector) {
    return Viewer
  }

  return (
    <Provider store={store}>
      <StylesProvider generateClassName={generateClassName}>
        <HspThemeProvider themeOptions={config.theme}>
          {Viewer}
        </HspThemeProvider>
      </StylesProvider>
    </Provider>
  )
}

export function useSelector<T>(selector: (state: State) => T) {
  const sliceSelector = useContext(SliceContext)
  return useReduxSelector((state) => selector(sliceSelector(state)))
}
