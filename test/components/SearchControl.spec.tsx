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

import React from 'react'
import { Provider } from 'react-redux'
import { render, fireEvent } from '@testing-library/react'
import { makeStore, MultiViewerState } from '../../src/state'
import { SearchControl } from '../../src/components/SearchControl'

const testState = {
  testViewerId: {
    search: {
      focus: 2,
      found: 4,
      phraseSearch: false,
      query: 'foo',
    },
    openTocItems: {},
    visibleTocItems: [],
  }
}

const store = makeStore(testState)

jest.mock('../../src/context/Viewer', () => ({
  useViewerContext: jest.fn(() => ({
    viewerId: 'testViewerId'
  }))
}))

jest.mock('../../src/context/ViewerStateProvider', () => ({
  useSelector: (selector: (state: MultiViewerState) => unknown) => selector(store.getState())
}))

function renderSearchControl() {
  return render(
    <Provider store={store}>
      <SearchControl/>
    </Provider>
  )
}

describe('SearchControl', function() {
  it('navigates result on enter and shift enter', function() {
    const { getByRole } = renderSearchControl()
    const input = getByRole('textbox')
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    })
    expect(store.getState()).toEqual({
      testViewerId: {
        search: {
          focus: 3,
          found: 4,
          phraseSearch: false,
          query: 'foo',
        },
        openTocItems: {},
        visibleTocItems: [],
      }
    })
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
      shiftKey: true
    })
    expect(store.getState()).toEqual({
      testViewerId: {
        search: {
          focus: 1,
          found: 4,
          phraseSearch: false,
          query: 'foo',
        },
        openTocItems: {},
        visibleTocItems: [],
      }
    })
  })
})
