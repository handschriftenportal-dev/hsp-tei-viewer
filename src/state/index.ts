import { configureStore, createReducer } from '@reduxjs/toolkit'
import { AnyAction } from 'redux'

import { I18nConfig } from '../contexts/i18n'
import { createAction } from './stateUtils'

export interface SearchState {
  focus: number
  found: number
  phraseSearch: boolean
  query: string
}

export interface SingleViewerState {
  openTocItems: Record<string, boolean>
  search: SearchState
  scrollToTocItem?: string
  visibleTocItems: string[]
}

export interface MultiViewerState {
  [viewerId: string]: SingleViewerState
}

export interface State {
  i18nConfig: I18nConfig
  viewers: MultiViewerState
}

export const actions = {
  addViewer: createAction<{
    viewerId: string
  }>('hsp-tei-viewer/ADD_VIEWER'),

  removeViewer: createAction<{
    viewerId: string
  }>('hsp-tei-viewer/REMOVE_VIEWER'),

  scrollToTocItem: createAction<{
    viewerId: string
    tocItemId?: string
  }>('hsp-tei-viewer/SCROLL_TO_TOC_ITEM'),

  setOpenTocItems: createAction<{
    viewerId: string
    tocItemIds: Record<string, boolean>
  }>('hsp-tei-viewer/SET_OPEN_TOC_ITEMS'),

  setSearch: createAction<{
    viewerId: string
    search: Partial<SearchState>
  }>('hsp-tei-viewer/SET_SEARCH'),

  toggleTocItem: createAction<{
    viewerId: string
    tocItemId?: string
  }>('hsp-tei-viewer/TOGGLE_TOC_ITEM'),

  changeTocItemVisibility: createAction<{
    viewerId: string
    tocItemId?: string
    visible: boolean
  }>('hsp-tei-viewer/CHANGE_TOC_ITEM_VISIBILITY'),
  setI18nConfig: createAction<I18nConfig>('SET_I18N_CONFIG'),
}

export const selectors = {
  getI18nConfig: (state: State) => state.i18nConfig,
}

const emptyViewer: SingleViewerState = {
  openTocItems: {},
  scrollToTocItem: undefined,
  search: {
    focus: -1,
    found: 0,
    phraseSearch: true,
    query: '',
  },
  visibleTocItems: [],
}

const defaultState: State = {
  i18nConfig: {
    language: 'de',
    disableTranslation: false,
  },
  viewers: {},
}

export const viewerReducer = createReducer<SingleViewerState>(
  emptyViewer,
  (builder) => {
    builder.addCase(actions.scrollToTocItem, (state, action) => {
      state.scrollToTocItem = action.payload.tocItemId
    })

    builder.addCase(actions.toggleTocItem, (state, action) => {
      const id = action.payload.tocItemId

      if (!id) {
        return
      }
      state.openTocItems[id] = !state.openTocItems[id]
    })

    builder.addCase(actions.setOpenTocItems, (state, action) => {
      const { tocItemIds } = action.payload
      state.openTocItems = tocItemIds
    })

    builder.addCase(actions.setSearch, (state, action) => {
      const { search } = action.payload
      state.search = { ...state.search, ...search }
    })

    builder.addCase(actions.changeTocItemVisibility, (state, action) => {
      const itemId = action.payload.tocItemId
      if (!itemId) {
        return
      }
      const oldVisibleItems = state.visibleTocItems || []
      const visibleTocItems =
        action.payload.visible && oldVisibleItems.indexOf(itemId) < 0
          ? [...oldVisibleItems, itemId]
          : oldVisibleItems.filter(
              (id) => action.payload.visible || id !== itemId,
            )
      state.visibleTocItems = visibleTocItems
    })
  },
)

/**
 * This is the root reducer of the library. It handles the state of all viewers.
 */
export const reducer = createReducer<State>(defaultState, (builder) => {
  builder.addCase(actions.setI18nConfig, (state, action) => {
    state.i18nConfig = action.payload
  })

  /**
   * Actions that does concern the multi viewer state
   * rather than a single viewer
   */

  builder.addCase(actions.addViewer, (state, action) => {
    const { viewerId } = action.payload
    if (!state.viewers[viewerId]) {
      state.viewers[viewerId] = emptyViewer
    }
  })
  builder.addCase(actions.removeViewer, (state, action) => {
    const { viewerId } = action.payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [viewerId]: toRemove, ...remainingViewers } = state.viewers

    state.viewers = remainingViewers
  })

  /**
   * If the action targets a single viewer then
   * forward it to the viewer reducer.
   */
  const handleViewerAction = (state: State, action: AnyAction) => {
    const { viewerId } = action.payload
    const viewerState = state.viewers[viewerId]
    if (!viewerState) {
      console.error('reducer: viewerId does not exist')
      return
    }
    state.viewers[viewerId] = viewerReducer(viewerState, action)
  }
  builder.addMatcher(
    (action) =>
      action.type === actions.changeTocItemVisibility.type ||
      action.type === actions.scrollToTocItem.type ||
      action.type === actions.setOpenTocItems.type ||
      action.type === actions.setSearch.type ||
      action.type === actions.toggleTocItem.type,
    handleViewerAction,
  )
})

export const makeStore: any = (initalState?: State) =>
  configureStore({ reducer, preloadedState: initalState, devTools: true })
