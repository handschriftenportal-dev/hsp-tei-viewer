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

import { makeStyles } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import React, { useEffect } from 'react'
import { useScrollContext, useViewerContext } from '../context/Viewer'
import { debounce } from '../utils'
import { TreeParser } from './TreeParser'
import { actions } from '../state'
import { SearchElement } from '../components/SearchElement'

interface Props {
  classes: {
    root: string
    focusedMatch: string
    searchMatch: string
  }
}

const useStyles = makeStyles((theme) => ({
  focusedMatch: {},
  searchMatch: {},
  root: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
  },
}))

export function Text(props: Props) {
  const classes = useStyles(props)
  const dispatch = useDispatch()
  const { viewerId, root, rules, } = useViewerContext()
  const defaultRule = rules.find(rule => rule.isDefaultRule)
  const scrollContainerRef = useScrollContext()

  const debouncedDispatchClearScrollTo = debounce(() => dispatch(actions.scrollToTocItem({
    viewerId,
  })), 500)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', debouncedDispatchClearScrollTo, false)
    }
  }, [])

  return (
    <div className={classes.root} ref={scrollContainerRef}>
      {
        <SearchElement classes={{
          focusedMatch: classes.focusedMatch,
          searchMatch: classes.searchMatch
        }}>
          <TreeParser
            node={root}
            defaultRule={defaultRule}
            scrollContainerRef={scrollContainerRef}
          />
        </SearchElement>
      }
  </div>)
}
