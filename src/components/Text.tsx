import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import makeStyles from '@material-ui/core/styles/makeStyles'

import { SearchElement } from '../components/SearchElement'
import { useScrollContext, useViewerContext } from '../context/Viewer'
import { actions } from '../state'
import { debounce } from '../utils'
import { TreeParser } from './TreeParser'

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
    wordBreak: 'break-word',
  },
}))

export function Text(props: Props) {
  const classes = useStyles(props)
  const dispatch = useDispatch()
  const { viewerId, root, rules } = useViewerContext()
  const defaultRule = rules.find((rule) => rule.isDefaultRule)
  const scrollContainerRef = useScrollContext()

  const debouncedDispatchClearScrollTo = debounce(
    () =>
      dispatch(
        actions.scrollToTocItem({
          viewerId,
        }),
      ),
    500,
  )

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener(
        'scroll',
        debouncedDispatchClearScrollTo,
        false,
      )
    }
  }, [])

  return (
    <div tabIndex={-1} className={classes.root} ref={scrollContainerRef}>
      {
        <SearchElement
          classes={{
            focusedMatch: classes.focusedMatch,
            searchMatch: classes.searchMatch,
          }}
        >
          <TreeParser
            node={root}
            defaultRule={defaultRule}
            scrollContainerRef={scrollContainerRef}
          />
        </SearchElement>
      }
    </div>
  )
}
