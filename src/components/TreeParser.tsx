import React, { ReactNode } from 'react'

import { Rule, XNode } from '../types'
import { ScrollTo } from './ScrollTo'

export interface Props {
  node: Node
  defaultRule?: Rule
  scrollContainerRef: React.RefObject<HTMLElement>
}

// default css for styling the tocItem based headlines
const defaultHeadlineStyle = {
  color: '#202020',
  fontSize: '16px',
}

export function TreeParser(props: Props) {
  const { node, defaultRule, scrollContainerRef } = props
  const xnode = node as XNode

  if (xnode.nodeType === Node.TEXT_NODE) {
    return <>{xnode.nodeValue}</>
  }

  if (xnode.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  // If the node does not have rules and no default rule was provided
  // then use a simple internal default rule.
  const rules = xnode.rules ||
    (defaultRule && [defaultRule]) || [
      {
        display: true,
        element: 'span',
      },
    ]

  // If one rule has `display=false` then skip rendering.
  if (rules.some((rule) => !rule.display)) {
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

  // We dont't want multiple headlines for the same node
  const headlineRule = rules.find((rule) => rule.headline)

  let headline: ReactNode
  // Only show headline if there is no rule for hiding it (display === false)
  if (
    headlineRule?.headline?.value &&
    !rules.some((rule) => rule.headline?.display === false)
  ) {
    const props = {
      style: { ...defaultHeadlineStyle, ...headlineRule?.style },
      'data-nodename': node.nodeName,
    }
    // pass the tocEntry's rule to be able to re-use value, if necessary
    const value = headlineRule.headline.value(xnode, headlineRule)
    if (value) {
      headline = React.createElement('h1', props, value)
    }
  }

  rules.forEach((rule) => {
    if (rule.render) {
      result = rule.render({ rule, node: xnode, children: result })
    } else if (rule.element) {
      const props = { style: rule.style, 'data-nodename': node.nodeName }
      result = React.createElement(rule.element, props, result)
    }
  })

  if (rules.some((rule) => rule.tocEntry?.value)) {
    return (
      <ScrollTo id={xnode.xpath || ''} containerRef={scrollContainerRef}>
        {headline} {result}
      </ScrollTo>
    )
  }

  return (
    <>
      {headline} {result}
    </>
  )
}
