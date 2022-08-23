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

import React, { ReactElement } from 'react'
import { useViewerContext } from '../context/Viewer'
import { walk } from '../utils'
import { XNode } from '../types'
import { MetadataItem } from './MetadataItem'


export function Metadata() {
  const { root } = useViewerContext()
  const items: ReactElement[] = []

  walk(root, node => {
    const xnode = node as XNode

    if (!xnode.rules) {
      return
    }

    // If one rule has `display=false` then skip rendering.
    if (xnode.rules.some(rule => !rule.display)) {
      return
    }

    // Create a meta data item for each rule of the node.
    // This means the same node may have multiple entries
    // in the meta data panel.
    xnode.rules.forEach((rule, i) => {
      const key = xnode.xpath + '-' + i
      items.push(<MetadataItem key={key} xnode={xnode} rule={rule} />)
    })
  })

  return <>{items}</>
}
