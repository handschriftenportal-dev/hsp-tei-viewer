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

import React from 'react'
import { useSelector } from '../context/ViewerStateProvider'
import { useViewerContext } from '../context/Viewer'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import IconButton from '@material-ui/core/IconButton'
import Switch from '@material-ui/core/Switch'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftSharp'
import ChevronRightIcon from '@material-ui/icons/ChevronRightSharp'
import SearchIcon from '@material-ui/icons/SearchSharp'
import Typography from '@material-ui/core/Typography'
import { actions } from '../state'
import { useDispatch } from 'react-redux'


export function SearchControl() {
  const { viewerId } = useViewerContext()
  const { focus, found, phraseSearch, query } = useSelector(state => state[viewerId].search)
  const dispatch = useDispatch()

  function next() {
    dispatch(actions.setSearch({
      viewerId,
      search: {
        focus: focus >= found - 1 ? 0 : (focus + 1)
      }
    }))
  }

  function prev() {
    dispatch(actions.setSearch({
      viewerId,
      search: {
        focus: focus <= 0 ? found - 1 : (focus - 1)
      }
    }))
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        prev()
      } else {
        next()
      }
    }
  }

  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={phraseSearch}
            onChange={() => dispatch(actions.setSearch({
              viewerId,
              search: {
                focus: -1,
                phraseSearch: !phraseSearch,
              }
            }))}
            name="phraseSearch"
            color="primary"
          />
        }
        // TODO translation
        label="Phrasensuche aktiv"
      />
      <TextField
        onChange={e => dispatch(actions.setSearch({
          viewerId,
          search: {
            focus: -1,
            found: 0,
            query: e.target.value,
          }
        }))}
        onKeyDown={handleKeyDown}
        value={query}
        InputProps={{
          endAdornment: (
            <SearchIcon />
          )
        }}
      />
      {(found > 0) && (
        <Typography variant="body2" align="center">
          <IconButton
            aria-label="TODO prev"
            onClick={prev}
          >
            <ChevronLeftIcon />
          </IconButton>
          <span style={{ unicodeBidi: 'plaintext' }}>
            Treffer: {focus >= 0 ? `${focus + 1} von ` : ''} {found}
          </span>
          <IconButton
            aria-label="TODO next"
            onClick={next}
          >
            <ChevronRightIcon />
          </IconButton>
        </Typography>
      )}
    </div>
  )
}
