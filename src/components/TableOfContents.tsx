import React, { ChangeEvent, Fragment, ReactElement, useMemo } from 'react'
import { useDispatch } from 'react-redux'

import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TreeView from '@material-ui/lab/TreeView'

import { useViewerContext } from '../context/Viewer'
import { useSelector } from '../context/ViewerStateProvider'
import { actions } from '../state'
import { XNode } from '../types'
import { TocItem } from './TocItem'

function recursivelyRenderTocItems(
  node: Node,
  visibleItems: string[],
): ReactElement | null {
  const xnode = node as XNode

  // If one rule has `display=false` then skip rendering.
  if (xnode.rules?.some((rule) => !rule.display)) {
    return null
  }

  const children = Array.from(node.childNodes)
    .map((child) => recursivelyRenderTocItems(child, visibleItems))
    .filter((x) => x)

  // We dont't want multiple toc items for the same node
  // so we use the first tocEntry function we can find and ignore the others.
  const tocEntryRule = xnode.rules?.find((rule) => rule.tocEntry)

  if (tocEntryRule && tocEntryRule?.tocEntry) {
    return (
      <TocItem
        key={xnode.xpath}
        id={xnode.xpath}
        label={tocEntryRule?.tocEntry?.value(xnode, tocEntryRule)}
      >
        {children}
      </TocItem>
    )
  }

  return children.length > 0 ? (
    <Fragment key={xnode.xpath}>{children}</Fragment>
  ) : null
}

// Die Zusammenstellung der Table of Contents ist eine Vereinfachung
// im Vergleich zur vorherigen Variante: Hier werden nicht automatisch
// die visible Unterknoten aufgeklappt. Wäre aber eh noch eine Anforderungsfrage.

export function TableOfContents() {
  const dispatch = useDispatch()
  const { root, viewerId } = useViewerContext()
  const visibleTocItems = useSelector(
    (state) => state.viewers[viewerId].visibleTocItems,
  )
  const openTocItems = useSelector(
    (state) => state.viewers[viewerId].openTocItems,
  )
  const expanded = Object.keys(openTocItems).filter((key) => openTocItems[key])

  const tocItems = useMemo(
    () => recursivelyRenderTocItems(root, visibleTocItems),
    [],
  )

  function handleToggleNode(event: ChangeEvent<unknown>, nodeIds: string[]) {
    dispatch(
      actions.setOpenTocItems({
        viewerId,
        tocItemIds: nodeIds.reduce((acc, id) => {
          return { ...acc, [id]: true }
        }, {}),
      }),
    )
  }

  function handleNodeSelect(event: ChangeEvent<unknown>, nodeIds: string[]) {
    dispatch(
      actions.scrollToTocItem({
        viewerId,
        tocItemId: nodeIds[0],
      }),
    )
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
      {tocItems}
    </TreeView>
  )
}
