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
import { makeStyles } from '@material-ui/core/styles'
import TreeItem from '@material-ui/lab/TreeItem'


const useStyles = makeStyles(theme => ({
  content: {
    alignItems: 'flex-start',
    padding: '8px 16px 8px 0',
    width: 'auto',
  },
  group: {
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
  },
  label: {
    boxOrient: 'vertical',
    display: '-webkit-box',
    lineClamp: 2,
    overflow: 'hidden',
    paddingLeft: 0,
  },
  selected: {}, // needed for pseudo $selected class
  root: {
    '&$selected > $content $label': {
      backgroundColor: 'inherit',
      color: '#d65151',
      fontWeight: 700,
    },
    '&:focus > $content': {
      backgroundColor: 'transparent',
    },
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover
    },
    '&:hover >$content $label, &:focus > $content $label, &$selected > $content $label, &$selected > $content $label:hover, &$selected:focus > $content $label': {
      backgroundColor: 'transparent',
    },
  },
}))

interface Props {
  id: string
  label: string
  children: React.ReactNode
}

export function TocItem(props: Props) {
  const cls = useStyles()

  return (
    <TreeItem
      nodeId={props.id}
      label={props.label}
      classes={{
        root: cls.root,
        content: cls.content,
        label: cls.label,
        group: cls.group,
        selected: cls.selected,
      }}
    >
      { props.children}
    </TreeItem>
  )
}
