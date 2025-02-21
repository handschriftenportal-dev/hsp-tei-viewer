import { NsResolver } from './types'

export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

export function isText(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE
}

export function isIgnoredNode(node: Node): node is Text {
  return (
    node.nodeType === Node.COMMENT_NODE ||
    node.nodeType === Node.CDATA_SECTION_NODE ||
    node.nodeType === Node.PROCESSING_INSTRUCTION_NODE
  )
}

export function walk(node: Node, fn: (node: Node) => void) {
  fn(node)
  node.childNodes.forEach((node) => walk(node, fn))
}

export function evaluate(xpath: string, node: Node, nsResolver: NsResolver) {
  // Any changes in this function must be reflected in its mock version in /test/testutils/utils.ts
  if (!node.ownerDocument) {
    return []
  }

  const res = node.ownerDocument.evaluate(
    xpath,
    node,
    nsResolver,
    XPathResult.ANY_TYPE,
    null,
  )

  if (res.resultType === XPathResult.STRING_TYPE) {
    return res.stringValue
  }

  const nodes: Node[] = []
  let cur: Node | null
  cur = res.iterateNext()

  while (cur) {
    nodes.push(cur)
    cur = res.iterateNext()
  }

  return nodes
}

export const debounce = <F extends (...args: any[]) => any>(
  fn: F,
  ms = 200,
) => {
  let timeout: any

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => resolve(fn(...args)), ms)
    })
}

export const throttle = (fn: () => any, ms = 200) => {
  let throttling = false
  return () => {
    if (!throttling) {
      fn()
      throttling = true
      setTimeout(() => {
        throttling = false
      }, ms)
    }
  }
}

interface VisibilityOptions {
  minimalVisiblePixels?: number
  offsetTop?: number
}

export function elementIsVisible(
  element: Element,
  container: Element,
  options: VisibilityOptions = {},
) {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  if (!elementRect || !containerRect) {
    return false
  }
  const offsetTop = options.offsetTop || 0
  const minimalVisiblePixels = options.minimalVisiblePixels || 0

  const elementTopIsUnderContainerTop =
    elementRect.top > containerRect.top + offsetTop
  const elementTopIsOverContainerBottom =
    elementRect.top + minimalVisiblePixels < containerRect.bottom
  const elementBottomIsOverContainerBottom =
    elementRect.bottom < containerRect.bottom
  const elementBottomIsUnderContainerTop =
    elementRect.bottom - minimalVisiblePixels > containerRect.top + offsetTop

  return (
    (elementTopIsUnderContainerTop && elementTopIsOverContainerBottom) ||
    (elementBottomIsOverContainerBottom && elementBottomIsUnderContainerTop) ||
    (!elementTopIsUnderContainerTop && !elementBottomIsOverContainerBottom)
  )
}

export function substringFullWord(str: string, max: number, suffix: string) {
  return str.length < max
    ? str
    : `${str.slice(
        0,
        str.slice(0, max - suffix.length).lastIndexOf(' '),
      )}${suffix}`
}

export function getContentType(value: string | null) {
  switch (value) {
    case 'content':
      return '[Kunst]'
    case 'music':
      return '[Musik]'
    default:
      return '[Text]'
  }
}
