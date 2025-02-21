import { AnyAction } from 'redux'

import { State, actions, reducer } from '../src/state'

const state: State = {
  i18nConfig: {
    language: 'de',
    disableTranslation: false,
  },
  viewers: {
    foo: {
      openTocItems: {
        a: true,
        b: true,
        c: false,
      },
      scrollToTocItem: undefined,
      visibleTocItems: ['a', 'b', 'c'],
      search: {
        focus: -1,
        found: 0,
        phraseSearch: true,
        query: '',
      },
    },
  },
}

describe('viewerReducer', function () {
  it('actions.addViewer adds new viewer', function () {
    const newState = reducer(
      state,
      actions.addViewer({
        viewerId: 'bar',
      }) as AnyAction,
    )

    expect(newState.viewers.bar).toEqual({
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

  it('actions.addViewer does not add new viewer if viewer id exists', function () {
    const newState = reducer(
      state,
      actions.addViewer({
        viewerId: 'foo',
      }) as AnyAction,
    )

    expect(newState.viewers.foo).toEqual({
      openTocItems: {
        a: true,
        b: true,
        c: false,
      },
      scrollToTocItem: undefined,
      visibleTocItems: ['a', 'b', 'c'],
      search: {
        focus: -1,
        found: 0,
        phraseSearch: true,
        query: '',
      },
    })
  })

  it('return correct values for actions.scrollToTocItem', function () {
    const state1 = reducer(
      state,
      actions.scrollToTocItem({
        viewerId: 'foo',
        tocItemId: 'a',
      }) as AnyAction,
    )
    expect(state1.viewers).toEqual({
      foo: {
        ...state1.viewers.foo,
        scrollToTocItem: 'a',
      },
    })
    const state2 = reducer(
      state1,
      actions.scrollToTocItem({
        viewerId: 'foo',
        tocItemId: undefined,
      }) as AnyAction,
    )
    expect(state2).toEqual(state)
  })

  it('return correct values for ToggleAction', function () {
    const stateWithAToggled = reducer(
      state,
      actions.toggleTocItem({
        viewerId: 'foo',
        tocItemId: 'a',
      }) as AnyAction,
    )
    expect(stateWithAToggled.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        openTocItems: {
          a: false,
          b: true,
          c: false,
        },
      },
    })

    const stateWithCToggled = reducer(
      state,
      actions.toggleTocItem({
        viewerId: 'foo',
        tocItemId: 'c',
      }) as AnyAction,
    )
    expect(stateWithCToggled.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        openTocItems: {
          a: true,
          b: true,
          c: true,
        },
      },
    })

    const stateWithDToggled = reducer(
      state,
      actions.toggleTocItem({
        viewerId: 'foo',
        tocItemId: 'd',
      }) as AnyAction,
    )
    expect(stateWithDToggled.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        openTocItems: {
          a: true,
          b: true,
          c: false,
          d: true,
        },
      },
    })
  })

  it('return correct values for SetVisibilityAction', function () {
    const stateWithVisibleA = reducer(
      state,
      actions.changeTocItemVisibility({
        viewerId: 'foo',
        tocItemId: 'a',
        visible: true,
      }) as AnyAction,
    )
    expect(stateWithVisibleA).toEqual(state)

    const stateWithInvisibleA = reducer(
      state,
      actions.changeTocItemVisibility({
        viewerId: 'foo',
        tocItemId: 'a',
        visible: false,
      }) as AnyAction,
    )
    expect(stateWithInvisibleA.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        visibleTocItems: ['b', 'c'],
      },
    })

    const stateWithVisibleD = reducer(
      state,
      actions.changeTocItemVisibility({
        viewerId: 'foo',
        tocItemId: 'd',
        visible: true,
      }) as AnyAction,
    )
    expect(stateWithVisibleD.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        visibleTocItems: ['a', 'b', 'c', 'd'],
      },
    })
  })

  it('return correct values for SetOpenTocItemsAction', function () {
    const newState = reducer(
      state,
      actions.setOpenTocItems({
        viewerId: 'foo',
        tocItemIds: {
          e: true,
          f: false,
        },
      }) as AnyAction,
    )
    expect(newState.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        openTocItems: {
          e: true,
          f: false,
        },
      },
    })
  })

  it('sets focus correctly', function () {
    const newState = reducer(
      state,
      actions.setSearch({
        viewerId: 'foo',
        search: {
          focus: 0,
        },
      }) as AnyAction,
    )
    expect(newState.viewers).toEqual({
      foo: {
        ...state.viewers.foo,
        search: {
          focus: 0,
          found: 0,
          phraseSearch: true,
          query: '',
        },
      },
    })
  })
})
