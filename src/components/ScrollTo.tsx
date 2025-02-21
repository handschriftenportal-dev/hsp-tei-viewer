import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { useViewerContext } from '../context/Viewer'
import { useSelector } from '../context/ViewerStateProvider'
import { actions } from '../state'
import { throttle } from '../utils'

export interface Props {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLElement>
  id: string
  // scrollIntoViewOptions?: any;
  offsetTop?: number
  forceScroll?: boolean
}

export function ScrollTo(props: Props) {
  const { children, id, containerRef, offsetTop } = props

  const dispatch = useDispatch()
  const scrollToRef = useRef<HTMLDivElement>(null)
  const { viewerId } = useViewerContext()
  const { visibleTocItems, scrollToTocItem } = useSelector(
    (state) => state.viewers[viewerId],
  )
  const scrollTo = id === scrollToTocItem

  function elementIsVisible() {
    const scrollToRect = scrollToRef.current?.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (!scrollToRect || !containerRect) {
      return false
    }

    const elementTopIsUnderContainerTop =
      scrollToRect.top > containerRect.top + (offsetTop || 0)
    const elementTopIsOverContainerBottom =
      scrollToRect.top < containerRect.bottom
    const elementBottomIsOverContainerBottom =
      scrollToRect.bottom < containerRect.bottom
    const elementBottomIsUnderContainerTop =
      scrollToRect.bottom > containerRect.top + (offsetTop || 0)

    return (
      (elementTopIsUnderContainerTop && elementTopIsOverContainerBottom) ||
      (elementBottomIsOverContainerBottom &&
        elementBottomIsUnderContainerTop) ||
      (!elementTopIsUnderContainerTop && !elementBottomIsOverContainerBottom)
    )
  }

  /**
   * Scroll to the element if it is set to be scolled and is not visible
   */
  function scrollToElement() {
    // const { scrollIntoViewOptions } = props
    if (!scrollTo || !scrollToRef.current || !containerRef.current) {
      return
    }

    // The following line might result in scrolling the containerRef element away
    // (scrollToRef?.current as any).scrollIntoView(scrollIntoViewOptions || { behavior: 'smooth', block: 'start' })
    // This will not work if the display rules use positioned elements
    containerRef.current.scrollTop =
      scrollToRef.current.offsetTop - containerRef.current.offsetTop
    dispatch(
      actions.scrollToTocItem({
        tocItemId: undefined,
        viewerId,
      }),
    )
  }

  useEffect(() => {
    scrollToElement()
  }, [scrollTo])

  const stateVisibility = visibleTocItems.indexOf(id) >= 0 || false

  const stateVisibilityRef = React.useRef(false)

  useEffect(() => {
    stateVisibilityRef.current = stateVisibility
  }, [stateVisibility])

  function checkVisibility() {
    const visible = elementIsVisible()
    const sv = stateVisibilityRef.current
    if (sv !== visible) {
      dispatch(
        actions.changeTocItemVisibility({
          viewerId,
          visible,
          tocItemId: id,
        }),
      )
    }
  }

  const throttleVisibility = throttle(() => {
    checkVisibility()
  }, 200)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', throttleVisibility, false)
    }
    if (visibleTocItems.length === 0) {
      checkVisibility()
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', throttleVisibility)
      }
    }
  }, [containerRef])

  return <div ref={scrollToRef}>{children}</div>
}
