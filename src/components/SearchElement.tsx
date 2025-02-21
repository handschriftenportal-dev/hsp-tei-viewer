import Mark from 'mark.js'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import makeStyles from '@material-ui/core/styles/makeStyles'

import { useScrollContext, useViewerContext } from '../context/Viewer'
import { useSelector } from '../context/ViewerStateProvider'
import { actions } from '../state'
import { elementIsVisible } from '../utils'

interface Props {
  children: React.ReactNode
  classes: {
    focusedMatch: string
    searchMatch: string
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

export function SearchElement(props: Readonly<Props>) {
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useScrollContext()
  const classes = useStyles(props)

  const { viewerId } = useViewerContext()
  const dispatch = useDispatch()
  const { focus, phraseSearch, query } = useSelector(
    (state) => state.viewers[viewerId].search,
  )
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
        each: (elem) => {
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
        done: (found) => {
          dispatch(
            actions.setSearch({
              viewerId,
              search: {
                found,
              },
            }),
          )
        },
      })
    } else {
      mark.mark(markQuery, {
        className: classes.searchMatch,
        separateWordSearch: true,
        acrossElements: true,
        done: (found) => {
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
            ...Array.from(
              searchContainerRef.current?.getElementsByTagName('mark') ?? [],
            ).filter((elem) => elem.getAttribute('data-markjs') === 'true'),
          )
          markedElems.current.forEach((elem) => {
            index++
            elem.setAttribute('data-searchmarkindex', '' + index)
          })
          dispatch(
            actions.setSearch({
              viewerId,
              search: {
                found,
              },
            }),
          )
        },
      })
    }
  }, [markQuery, phraseSearch])

  // avoid scrolling to search results if Viewer is completely rerendered
  const [renderedOnce, setRenderedOnce] = useState(false)

  useEffect(() => {
    markedElems.current.forEach((elem) => {
      const markAsCurrent =
        elem.getAttribute('data-searchmarkindex') === '' + focus
      elem.className = markAsCurrent
        ? classes.focusedMatch
        : classes.searchMatch
      if (
        renderedOnce &&
        markAsCurrent &&
        scrollContainerRef.current &&
        !elementIsVisible(elem, scrollContainerRef.current, {
          minimalVisiblePixels: 20,
        })
      ) {
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

  return <div ref={searchContainerRef}>{props.children}</div>
}
