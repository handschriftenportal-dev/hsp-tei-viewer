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

import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core'
import Mark from 'mark.js'
import { elementIsVisible } from '../utils'
import { useSelector } from '../context/ViewerStateProvider'
import { useScrollContext, useViewerContext } from '../context/Viewer'
import { actions } from '../state'
import { useDispatch } from 'react-redux'

interface Props {
  children: React.ReactNode;
  classes: {
    focusedMatch: string;
    searchMatch: string;
  }
}

const useStyles = makeStyles(() => ({
  focusedMatch: {},
  searchMatch: {},
}))

function normalizeQuery(s: string) {
  if (!s) {
    return s
  }
  return s.trim().replace(/\s+/g, ' ')
}

export function SearchElement(props: Props) {
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useScrollContext()
  const classes = useStyles(props)

  const { viewerId } = useViewerContext()
  const dispatch = useDispatch()
  const { focus, phraseSearch, query } = useSelector(state => state[viewerId].search)
  const markQuery = normalizeQuery(query)

  const markedElems = useRef<Element[]>([])

  useEffect(() => {
    markedElems.current = []
    if (!searchContainerRef.current) {
      return
    }
    const mark = new Mark(searchContainerRef.current)
    mark.unmark()
    if (!markQuery || markQuery.length < 2) {
      return
    }
    // index of match
    let index = -1
    if (phraseSearch) {
      // sum of length of previous partly matches for current index
      let currentLength = 0
      mark.mark(markQuery, {
        className: classes.searchMatch,
        separateWordSearch: false,
        acrossElements: true,
        each: elem => {
          // ignore matches that are empty or just whitespaces
          if (elem.textContent && elem.textContent.trim().length > 0) {
            const normalizedText = normalizeQuery(elem.textContent)
            if (currentLength === 0) {
              // start of match - increase index
              index++
            } else {
              if (currentLength + normalizedText.length > markQuery.length) {
                // sum of all partly matches to big for query - next index, reset currentLength
                index++
                currentLength = 0
              }
            }
            if (currentLength > 0) {
              // account for whitespace in query
              currentLength += 1
            }
            currentLength += normalizedText.length
            elem.setAttribute('data-searchmarkindex', '' + index)
            markedElems.current.push(elem)
          }
        },
        done: found => {
          dispatch(actions.setSearch({
            viewerId,
            search: {
              found: found,
            }
          }))
        }
      })
    } else {
      mark.mark(markQuery, {
        className: classes.searchMatch,
        separateWordSearch: true,
        acrossElements: true,
        done: found => {
          /*
           * The order of elements received by the "each" callback for separate word search does not
           * correspond with their appearance in the HTML. They are rather ordered by the single terms
           * first, apparently by the length of the individual term, by their appearance second.
           *
           * E.g. for the search 'parchment and paper', the order would be
           * - all appearances of 'parchment'
           * - all appearances of 'paper'
           * - all appearances of 'and'
           *
           * As a result, we can not use "each" to populate a search result navigation.
           */
          markedElems.current.push(
            ...(
              Array.from(searchContainerRef.current?.getElementsByTagName('mark') || [])
                .filter(elem => elem.getAttribute('data-markjs') === 'true')
            )
          )
          markedElems.current.forEach(elem => {
            index++
            elem.setAttribute('data-searchmarkindex', '' + index)
          })
          dispatch(actions.setSearch({
            viewerId,
            search: {
              found: found,
            }
          }))
        },
      })
    }
  }, [markQuery, phraseSearch])

  // avoid scrolling to search results if Viewer is completely rerendered
  const [renderedOnce, setRenderedOnce] = useState(false)

  useEffect(() => {
    markedElems.current.forEach((elem) => {
      const markAsCurrent = elem.getAttribute('data-searchmarkindex') === ('' + focus)
      elem.className = markAsCurrent ? classes.focusedMatch : classes.searchMatch
      if (renderedOnce && markAsCurrent && scrollContainerRef.current && !elementIsVisible(elem, scrollContainerRef.current, { minimalVisiblePixels: 20 })) {
        elem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
      }
    })
    if (!renderedOnce) {
      setRenderedOnce(true)
    }
  }, [focus])

  return (
    <div ref={searchContainerRef}>
      {props.children}
    </div>
  )
}
