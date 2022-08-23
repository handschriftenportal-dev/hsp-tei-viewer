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

import { actions, MultiViewerState, reducer } from '../src/state'

const state: MultiViewerState = {
  foo: {
    openTocItems: {
      a: true,
      b: true,
      c: false,
    },
    scrollToTocItem: undefined,
    visibleTocItems: [
      'a',
      'b',
      'c',
    ],
    search: {
      focus: -1,
      found: 0,
      phraseSearch: true,
      query: '',
    }
  }
}

describe('viewerReducer', function() {
  it('actions.addViewer adds new viewer', function() {
    const newState = reducer(state, actions.addViewer({
      viewerId: 'bar'
    }))

    expect(newState.bar).toEqual({
      openTocItems: {},
      scrollToTocItem: undefined,
      visibleTocItems: [],
      search: {
        focus: -1,
        found: 0,
        phraseSearch: true,
        query: '',
      },
    })
  })

  it('actions.addViewer does not add new viewer if viewer id exists', function() {
    const newState = reducer(state, actions.addViewer({
      viewerId: 'foo'
    }))

    expect(newState.foo).toEqual({
      openTocItems: {
        a: true,
        b: true,
        c: false,
      },
      scrollToTocItem: undefined,
      visibleTocItems: [
        'a',
        'b',
        'c',
      ],
      search: {
        focus: -1,
        found: 0,
        phraseSearch: true,
        query: '',
      },
    })
  })



  it('return correct values for actions.scrollToTocItem', function() {
    const state1 = reducer(state, actions.scrollToTocItem({
      viewerId: 'foo',
      tocItemId: 'a',
    }))
    expect(state1).toEqual({
      foo: {
        ...state1.foo,
        scrollToTocItem: 'a',
      }
    })
    const state2 = reducer(state1, actions.scrollToTocItem({
      viewerId: 'foo',
      tocItemId: undefined,
    }))
    expect(state2).toEqual(state)
  })

  it('return correct values for ToggleAction', function() {
    const stateWithAToggled = reducer(state, actions.toggleTocItem({
      viewerId: 'foo',
      tocItemId: 'a',
    }))
    expect(stateWithAToggled).toEqual({
      foo: {
        ...state.foo,
        openTocItems: {
          a: false,
          b: true,
          c: false,
        },
      }
    })

    const stateWithCToggled = reducer(state, actions.toggleTocItem({
      viewerId: 'foo',
      tocItemId: 'c',
    }))
    expect(stateWithCToggled).toEqual({
      foo: {
        ...state.foo,
        openTocItems: {
          a: true,
          b: true,
          c: true,
        },
      }
    })

    const stateWithDToggled = reducer(state, actions.toggleTocItem({
      viewerId: 'foo',
      tocItemId: 'd',
    }))
    expect(stateWithDToggled).toEqual({
      foo: {
        ...state.foo,
        openTocItems: {
          a: true,
          b: true,
          c: false,
          d: true,
        },
      }
    })
  })

  it('return correct values for SetVisibilityAction', function() {
    const stateWithVisibleA = reducer(state, actions.changeTocItemVisibility({
      viewerId: 'foo',
      tocItemId: 'a',
      visible: true,
    }))
    expect(stateWithVisibleA).toEqual(state)

    const stateWithInvisibleA = reducer(state, actions.changeTocItemVisibility({
      viewerId: 'foo',
      tocItemId: 'a',
      visible: false,
    }))
    expect(stateWithInvisibleA).toEqual({
      foo: {
        ...state.foo,
        visibleTocItems: ['b', 'c']
      }
    })

    const stateWithVisibleD = reducer(state, actions.changeTocItemVisibility({
      viewerId: 'foo',
      tocItemId: 'd',
      visible: true,
    }))
    expect(stateWithVisibleD).toEqual({
      foo: {
        ...state.foo,
        visibleTocItems: ['a', 'b', 'c', 'd']
      }
    })
  })

  it('return correct values for SetOpenTocItemsAction', function() {
    const newState = reducer(state, actions.setOpenTocItems({
      viewerId: 'foo',
      tocItemIds: {
        'e': true,
        'f': false,
      }
    }))
    expect(newState).toEqual({
      foo: {
        ...state.foo,
        openTocItems: {
          'e': true,
          'f': false,
        }
      }
    })
  })

  it('sets focus correctly', function() {
    const newState = reducer(state, actions.setSearch({
      viewerId: 'foo',
      search: {
        focus: 0,
      }
    }))
    expect(newState).toEqual({
      foo: {
        ...state.foo,
        search: {
          focus: 0,
          found: 0,
          phraseSearch: true,
          query: '',
        }
      }
    })
  })
})
