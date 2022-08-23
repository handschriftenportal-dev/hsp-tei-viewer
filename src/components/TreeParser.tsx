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

import React, { ReactNode } from 'react'
import { Rule, XNode } from '../types'
import { ScrollTo } from './ScrollTo'


export interface Props {
  node: Node;
  defaultRule?: Rule;
  scrollContainerRef: React.RefObject<HTMLElement>;
}

export function TreeParser(props: Props) {
  const { node, defaultRule, scrollContainerRef } = props
  const xnode = node as XNode

  if (xnode.nodeType === Node.TEXT_NODE) {
    return (<>{xnode.nodeValue}</>)
  }

  if (xnode.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  // If the node does not have rules and no default rule was provided
  // then use a simple internal default rule.
  const rules = xnode.rules || (defaultRule && [defaultRule]) || [{
    display: true,
    element: 'span'
  }]

  // If one rule has `display=false` then skip rendering.
  if (rules.some(rule => !rule.display)) {
    return null
  }

  const childElements: ReactNode[] = []

  xnode.childNodes.forEach((child, index) => {
    const childElement = (
      <TreeParser
        key={index}
        node={child}
        defaultRule={defaultRule}
        scrollContainerRef={scrollContainerRef}
      />
    )

    if (childElement) {
      childElements.push(childElement)
    }
  })

  // Iteratively wrap the node in elements defined by the rule array.
  // The rule array is processed from left to right, meaning that
  // the first rule results in the most inner element, and so on.
  let result: ReactNode = <>{childElements}</>
  rules.forEach(rule => {
    if (rule.render) {
      result = rule.render({ rule, node: xnode, children: result })
    } else if (rule.element) {
      const props = { style: rule.style, 'data-nodename': node.nodeName }
      result = React.createElement(rule.element, props, result)
    }
  })

  if (rules.some(rule => rule.tocEntry)) {
    return (
      <ScrollTo
        id={xnode.xpath || ''}
        containerRef={scrollContainerRef}
      >
        { result }
      </ScrollTo>
    )
  }

  return <>{result}</>
}
