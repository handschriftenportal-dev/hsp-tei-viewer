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

import React, { ChangeEvent, Fragment, ReactElement, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import TreeView from '@material-ui/lab/TreeView'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { useViewerContext } from '../context/Viewer'
import { XNode } from '../types'
import { actions } from '../state'
import { useSelector } from '../context/ViewerStateProvider'
import { TocItem } from './TocItem'


function recursivelyRenderTocItems(node: Node, visibleItems: string[]): ReactElement | null {
  const xnode = node as XNode

  // If one rule has `display=false` then skip rendering.
  if (xnode.rules?.some(rule => !rule.display)) {
    return null
  }

  const children = Array.from(node.childNodes)
    .map(child => recursivelyRenderTocItems(child, visibleItems))
    .filter(x => x)

  // We dont't want multiple toc items for the same node
  // so we use the first tocEntry function we can find and ignore the others.
  const tocEntry = xnode.rules?.find(rule => rule.tocEntry)?.tocEntry

  if (tocEntry) {
    return (
      <TocItem
        key={xnode.xpath}
        id={xnode.xpath}
        label={tocEntry(xnode)}
      >
        { children }
      </TocItem>
    )
  }

  return children.length > 0
    ? <Fragment key={xnode.xpath}>{ children }</Fragment>
    : null
}

// Die Zusammenstellung der Table of Contents ist eine Vereinfachung
// im Vergleich zur vorherigen Variante: Hier werden nicht automatisch
// die visible Unterknoten aufgeklappt. Wäre aber eh noch eine Anforderungsfrage.

export function TableOfContents() {
  const dispatch = useDispatch()
  const { root, viewerId } = useViewerContext()
  const visibleTocItems = useSelector(state => state[viewerId].visibleTocItems)
  const openTocItems = useSelector(state => state[viewerId].openTocItems)
  const expanded = Object.keys(openTocItems).filter(key => openTocItems[key])

  const tocItems = useMemo(() => recursivelyRenderTocItems(root, visibleTocItems), [])

  function handleToggleNode(event: ChangeEvent<unknown>, nodeIds: string[]) {
    dispatch(actions.setOpenTocItems({
      viewerId,
      tocItemIds: nodeIds.reduce((acc, id) => {
        return { ...acc, [id]: true }
      }, {})
    }))
  }

  function handleNodeSelect(event: ChangeEvent<unknown>, nodeIds: string[]) {
    dispatch(actions.scrollToTocItem({
      viewerId,
      tocItemId: nodeIds[0]
    }))
  }

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      multiSelect={true}
      selected={visibleTocItems}
      onNodeToggle={handleToggleNode}
      onNodeSelect={handleNodeSelect}
    >
      { tocItems }
    </TreeView>
  )
}
