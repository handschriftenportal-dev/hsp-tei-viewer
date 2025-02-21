import { CSSProperties, FC } from 'react'

export interface XNode extends Node {
  xpath: string
  rules?: Rule[]
}

export interface TocEntry {
  /**
   * If present, this results in a toc entry with the return value as label
   */
  value: (node: Node, rule: Rule, locale?: string) => string
}

export interface Headline {
  /**
   * If display is false, the related tocItem will not be shown as a headline in the content section
   * The 'display' attribute of the tocItem itself has the higher precedence.
   */
  display?: boolean
  /**
   * attributes for styling the headline element
   */
  style?: CSSProperties
  /**
   * If present, this results in a headline with the return value as text
   */
  value?: (node: Node, rule: Rule, locale?: string) => string | undefined
}

export interface Rule {
  /**
   * XPath to target ELEMENTS. Text nodes will be ignored.
   */
  xpath?: string
  /**
   * If true then the `xpath` prop will be ignored and the rule applies to all
   * nodes that are not adressed by other rules.
   */
  isDefaultRule?: boolean
  /**
   * no functional purpose, only for documentation and debugging purposes
   */
  description?: string
  /**
   * if display is false, the entire branch below a node will not be displayed
   */
  display: boolean
  /**
   * HTML element name to contain the child node renderings (element and text nodes)
   */
  element?: string
  /**
   * Contains information for rendering a headline
   */
  headline?: Headline

  metadata?: (node: Node, locale?: string) => Record<string, string>

  /**
   * render a React element via function instead of a simple HTML element
   */
  render?: FC<{ node: Node; rule: Rule }>
  /**
   * only relevant if element is given
   */
  style?: CSSProperties
  /**
   * information if a node should result in TOC item
   */
  tocEntry?: TocEntry
}

export interface NsResolver {
  lookupNamespaceURI: (namespacePrefix: string | null) => string | null
  lookupNamespacePrefix: (namespaceUri: string | null) => string | null
}
