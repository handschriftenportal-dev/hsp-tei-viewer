import clsx from 'clsx'
import React, { ChangeEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import IconButton from '@material-ui/core/IconButton'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftSharp'
import ChevronRightIcon from '@material-ui/icons/ChevronRightSharp'
import CloseIcon from '@material-ui/icons/Close'
import SearchIcon from '@material-ui/icons/SearchSharp'

import { useViewerContext } from '../context/Viewer'
import { useSelector } from '../context/ViewerStateProvider'
import { actions } from '../state'

const useStyles = makeStyles(() => ({
  removeSearchRoot: {
    padding: 0,
  },
  inputPointer: {
    outline: 'none !important',
  },
  closeIcon: {
    cursor: 'pointer',
  },
}))

export function SearchControl() {
  const { viewerId } = useViewerContext()
  const { focus, found, phraseSearch, query } = useSelector(
    (state) => state.viewers[viewerId].search,
  )
  const dispatch = useDispatch()
  const cls = useStyles()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pointerEvent, setPointerEvent] = useState(false)
  const { t } = useTranslation()

  function next() {
    dispatch(
      actions.setSearch({
        viewerId,
        search: {
          focus: focus >= found - 1 ? 0 : focus + 1,
        },
      }),
    )
  }

  function prev() {
    dispatch(
      actions.setSearch({
        viewerId,
        search: {
          focus: focus <= 0 ? found - 1 : focus - 1,
        },
      }),
    )
  }

  function handleInputChange(ev: ChangeEvent<HTMLInputElement>): void {
    setPointerEvent(true)
    dispatch(
      actions.setSearch({
        viewerId,
        search: {
          focus: -1,
          found: 0,
          query: ev.target.value,
        },
      }),
    )
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    setPointerEvent(false)
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        prev()
      } else {
        next()
      }
    }
  }

  const handleOnClick = () => {
    dispatch(
      actions.setSearch({
        viewerId,
        search: {
          focus: -1,
          found: 0,
          query: '',
        },
      }),
    )
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={phraseSearch}
            onChange={() =>
              dispatch(
                actions.setSearch({
                  viewerId,
                  search: {
                    focus: -1,
                    phraseSearch: !phraseSearch,
                  },
                }),
              )
            }
            name="phraseSearch"
            color="primary"
          />
        }
        label={t('teiViewerPlugin.window.search.phrase') || ''}
      />
      <TextField
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPointerDown={() => setPointerEvent(true)}
        inputRef={inputRef}
        value={query}
        InputProps={{
          endAdornment: !query.length ? (
            <SearchIcon />
          ) : (
            <IconButton
              classes={{ root: cls.removeSearchRoot }}
              aria-label={t('teiViewerPlugin.window.search.removePhrase') || ''}
              onClick={() => handleOnClick()}
            >
              <CloseIcon />
            </IconButton>
          ),
        }}
        inputProps={{
          'aria-label': t('teiViewerPlugin.window.search.phrase') || '',
          className: clsx({ [cls.inputPointer]: pointerEvent }),
        }}
      />
      {found > 0 && (
        <Typography variant="body2" align="center">
          <IconButton
            aria-label={t('teiViewerPlugin.window.search.prevResult') || ''}
            onClick={prev}
          >
            <ChevronLeftIcon />
          </IconButton>
          <span style={{ unicodeBidi: 'plaintext' }}>
            {t('teiViewerPlugin.window.search.results')}:
            {focus >= 0
              ? ` ${focus + 1} ${t('teiViewerPlugin.window.search.resultsOf')} `
              : ''}
            {found}
          </span>
          <IconButton
            aria-label={t('teiViewerPlugin.window.search.nextResult') || ''}
            onClick={next}
          >
            <ChevronRightIcon />
          </IconButton>
        </Typography>
      )}
    </div>
  )
}
