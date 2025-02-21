import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'

import { SearchControl } from '../../src/components/SearchControl'
import { State, makeStore } from '../../src/state'

const testState: State = {
  i18nConfig: {
    language: 'de',
    disableTranslation: false,
  },
  viewers: {
    testViewerId: {
      search: {
        focus: 2,
        found: 4,
        phraseSearch: false,
        query: 'foo',
      },
      openTocItems: {},
      visibleTocItems: [],
    },
  },
}

const store = makeStore(testState)

jest.mock('../../src/context/Viewer', () => ({
  useViewerContext: jest.fn(() => ({
    viewerId: 'testViewerId',
  })),
}))

jest.mock('../../src/context/ViewerStateProvider', () => ({
  useSelector: (selector: (state: State) => unknown) =>
    selector(store.getState()),
}))

function renderSearchControl() {
  return render(
    <Provider store={store}>
      <SearchControl />
    </Provider>,
  )
}

describe('SearchControl', function () {
  it('navigates result on enter and shift enter', function () {
    const { getByRole } = renderSearchControl()
    const input = getByRole('textbox')
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    })
    expect(store.getState().viewers).toEqual({
      testViewerId: {
        search: {
          focus: 3,
          found: 4,
          phraseSearch: false,
          query: 'foo',
        },
        openTocItems: {},
        visibleTocItems: [],
      },
    })
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
      shiftKey: true,
    })
    expect(store.getState().viewers).toEqual({
      testViewerId: {
        search: {
          focus: 1,
          found: 4,
          phraseSearch: false,
          query: 'foo',
        },
        openTocItems: {},
        visibleTocItems: [],
      },
    })
  })
})
