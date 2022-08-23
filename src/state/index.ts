/*
 * MIT License
 *
 * Copyright (c) 2022 Staatsbibliothek zu Berlin - Preußischer Kulturbesitz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { AnyAction, createAction, isType } from './stateUtils'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createStore } from 'redux'

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
  [viewerId: string]: SingleViewerState;
}

export const actions = {

  addViewer: createAction<{
    viewerId: string
  }>('hsp-tei-viewer/ADD_VIEWER'),

  removeViewer: createAction<{
    viewerId: string
  }>('hsp-tei-viewer/REMOVE_VIEWER'),

  scrollToTocItem: createAction<{
    viewerId: string,
    tocItemId?: string
  }>('hsp-tei-viewer/SCROLL_TO_TOC_ITEM'),

  setOpenTocItems: createAction<{
    viewerId: string,
    tocItemIds: Record<string, boolean>
  }>('hsp-tei-viewer/SET_OPEN_TOC_ITEMS'),

  setSearch: createAction<{
    viewerId: string,
    search: Partial<SearchState>
  }>('hsp-tei-viewer/SET_SEARCH'),

  toggleTocItem: createAction<{
    viewerId: string,
    tocItemId?: string
  }>('hsp-tei-viewer/TOGGLE_TOC_ITEM'),

  changeTocItemVisibility: createAction<{
    viewerId: string,
    tocItemId?: string,
    visible: boolean
  }>('hsp-tei-viewer/CHANGE_TOC_ITEM_VISIBILITY'),
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

const defaultState: MultiViewerState = {}

/**
 * Handles the state of a single viewer.
 */
function viewerReducer(state: SingleViewerState, action: AnyAction): SingleViewerState {

  if (isType(action, actions.scrollToTocItem)) {
    return {
      ...state,
      scrollToTocItem: action.payload.tocItemId,
    }
  }

  if (isType(action, actions.toggleTocItem)) {
    const id = action.payload.tocItemId

    if (!id) {
      return state
    }

    return {
      ...state,
      openTocItems: {
        ...state.openTocItems,
        [id]: !state.openTocItems[id],
      },
    }
  }

  if (isType(action, actions.setOpenTocItems)) {
    const { tocItemIds } = action.payload
    return {
      ...state,
      openTocItems: tocItemIds,
    }
  }

  if (isType(action, actions.setSearch)) {
    const { search } = action.payload
    return {
      ...state,
      search: {
        ...state.search,
        ...search,
      }
    }
  }

  if (isType(action, actions.changeTocItemVisibility)) {
    const itemId = action.payload.tocItemId

    if (!itemId) {
      return state
    }

    const oldVisibleItems = state.visibleTocItems || []
    const visibleTocItems = action.payload.visible && oldVisibleItems.indexOf(itemId) < 0
      ? [...oldVisibleItems, itemId]
      : oldVisibleItems.filter((id) => (action.payload.visible || id !== itemId))

    return {
      ...state,
      visibleTocItems,
    }
  }

  return state
}

/**
 * This is the root reducer of the library. It handles the state of all viewers.
 */
export function reducer(state = defaultState, action: AnyAction): MultiViewerState {

  /**
   * If the action targets a single viewer then
   * forward it to the viewer reducer.
   */
  if (
    isType(action, actions.changeTocItemVisibility) ||
    isType(action, actions.scrollToTocItem) ||
    isType(action, actions.setOpenTocItems) ||
    isType(action, actions.setSearch) ||
    isType(action, actions.toggleTocItem)
  ) {
    const { viewerId } = action.payload
    const viewerState = state[viewerId]

    if (!viewerState) {
      console.error('reducer: viewerId does not exist')
    }

    return {
      ...state,
      [viewerId]: viewerReducer(viewerState, action)
    }
  }

  /**
   * Actions that does concern the multi viewer state
   * rather than a single viewer
   */

  if (isType(action, actions.addViewer)) {
    if (!state[action.payload.viewerId]) {
      return {
        ...state,
        [action.payload.viewerId]: emptyViewer,
      }
    }
  }

  if (isType(action, actions.removeViewer)) {
    const { [action.payload.viewerId]: toRemove, ...remainingState } = state
    return {
      ...remainingState
    }
  }

  return state
}

export const makeStore = (initialState?: MultiViewerState) => createStore(
  reducer,
  initialState,
  composeWithDevTools()
)
