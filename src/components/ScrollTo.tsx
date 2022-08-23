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

import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { debounce, throttle } from '../utils'
import { actions } from '../state'
import { useSelector } from '../context/ViewerStateProvider'
import { useViewerContext } from '../context/Viewer'


export interface Props {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement>;
  id: string;
  // scrollIntoViewOptions?: any;
  offsetTop?: number;
  forceScroll?: boolean;
}

export function ScrollTo(props: Props) {
  const { children, id, containerRef, offsetTop } = props

  const dispatch = useDispatch()
  const scrollToRef = useRef<HTMLDivElement>(null)
  const { viewerId } = useViewerContext()
  const { visibleTocItems, scrollToTocItem } = useSelector(state => state[viewerId])
  const scrollTo = id === scrollToTocItem


  function elementIsVisible() {
    const scrollToRect = scrollToRef.current?.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (!scrollToRect || !containerRect) {
      return false
    }

    const elementTopIsUnderContainerTop = scrollToRect.top > (containerRect.top + (offsetTop || 0))
    const elementTopIsOverContainerBottom = scrollToRect.top < containerRect.bottom
    const elementBottomIsOverContainerBottom = scrollToRect.bottom < containerRect.bottom
    const elementBottomIsUnderContainerTop = scrollToRect.bottom > (containerRect.top + (offsetTop || 0))

    return ((elementTopIsUnderContainerTop && elementTopIsOverContainerBottom) ||
      (elementBottomIsOverContainerBottom && elementBottomIsUnderContainerTop) ||
      (!elementTopIsUnderContainerTop && !elementBottomIsOverContainerBottom))
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
    containerRef.current.scrollTop = scrollToRef.current.offsetTop - containerRef.current.offsetTop
    dispatch(actions.scrollToTocItem({
      tocItemId: undefined,
      viewerId,
    }))
  }

  useEffect(() => {
    scrollToElement()
  }, [scrollTo])

  const stateVisibility = (visibleTocItems.indexOf(id) >= 0) || false

  const stateVisibilityRef = React.useRef(false)

  useEffect(() => {
    stateVisibilityRef.current = stateVisibility
  }, [stateVisibility])

  function checkVisibility() {
    const visible = elementIsVisible()
    const sv = stateVisibilityRef.current
    if (sv !== visible) {
      dispatch(actions.changeTocItemVisibility({
        viewerId,
        visible,
        tocItemId: id,
      }))
    }
  }

  const throttleVisibility = throttle(() => {
    checkVisibility()
  }, 200)

  const debounceVisiblity = debounce(() => {
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

  return (
    <div ref={scrollToRef}>
      {children}
    </div>
  )
}
