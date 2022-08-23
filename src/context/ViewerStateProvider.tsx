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

import React, { createContext, useCallback, useContext } from 'react'
import { Provider, useSelector as useReduxSelector } from 'react-redux'
import { makeStore, MultiViewerState } from '../state'


const defaultSliceSelector = (state: any) => state
export const SliceContext = createContext(defaultSliceSelector)


export interface Props {
  children?: React.ReactNode
  sliceSelector?: (state: any) => MultiViewerState
}

export function ViewerStateProvider(props: Props) {
  const { children, sliceSelector } = props

  const callback = useCallback(sliceSelector || defaultSliceSelector, [])

  if (sliceSelector) {
    return (
      <SliceContext.Provider value={callback}>
        {children}
      </SliceContext.Provider>
    )
  }

  const store = makeStore()

  return (
    <Provider store={store}>
      <SliceContext.Provider value={callback}>
        { props.children }
      </SliceContext.Provider>
    </Provider>
  )
}

export function useSelector<T>(selector: (state: MultiViewerState) => T) {
  const sliceSelector = useContext(SliceContext)
  return useReduxSelector(state => selector(sliceSelector(state)))
}
