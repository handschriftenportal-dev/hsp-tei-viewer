import React, {
  MutableRefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDispatch } from 'react-redux'

import { actions } from '../state'
import { NsResolver, Rule, XNode } from '../types'
import { evaluate, isElement, isIgnoredNode, isText } from '../utils'

export function addXpaths(
  node: Node,
  prefix: string,
  pos = 1,
  nsResolver: NsResolver,
) {
  const xnode = node as XNode

  if (isElement(node)) {
    const el = node as Element
    const nsPrefix = nsResolver.lookupNamespacePrefix(el.namespaceURI)
    const xPathNsPrefix = nsPrefix ? nsPrefix + ':' : ''
    xnode.xpath = `${prefix}/${xPathNsPrefix + node.localName}[${pos}]`
  } else if (isText(node)) {
    xnode.xpath = `${prefix}/text()[${pos}]`
  } else if (isIgnoredNode(node)) {
    // no xpath for comments, cdata and processing instructions or their (impossible?) childs
    return
  } else {
    throw new Error('unexpected node type')
  }

  const tagMap: Record<string, number> = {}

  for (let i = 0; i < node.childNodes.length; i++) {
    const child: ChildNode = node.childNodes[i]
    const tag = isElement(child) ? child.localName : '_text'

    tag in tagMap ? (pos = ++tagMap[tag]) : (pos = tagMap[tag] = 1)

    addXpaths(child, xnode.xpath, pos, nsResolver)
  }
}

export function addRuleInfo(root: Node, rules: Rule[], nsResolver: NsResolver) {
  rules.forEach((rule) => {
    if (rule.isDefaultRule) {
      return
    }

    if (!rule.xpath) {
      return
    }

    const targets = evaluate(rule.xpath, root, nsResolver) as XNode[]

    if (typeof targets === 'string') {
      return
    }

    targets.forEach((node) => {
      const xnode = node

      if (!xnode.rules) {
        xnode.rules = []
      }

      // Multiple rules may apply to the same node.
      // At this point we simply store all rules in the node.
      // The components down in the tree are responsible for themself to
      // decide how to deal with multiple rules.
      xnode.rules.push(rule)
    })
  })
}

export interface ViewerContextType {
  viewerId: string
  nsResolver: NsResolver
  root: Node
  rules: Rule[]
}

export const ViewerContext = createContext<ViewerContextType | undefined>(
  undefined,
)

export const ScrollContext = createContext<
  MutableRefObject<HTMLDivElement | null> | undefined
>(undefined)

export interface Props {
  children: React.ReactNode
  viewerId: string
  nsResolver: NsResolver
  root: Node
  rules: Rule[]
}

export const Viewer = function (props: Props) {
  const { children, nsResolver, root, rules, viewerId } = props
  const dispatch = useDispatch()

  const [contextValue, setContextValue] = useState<ViewerContextType>()

  useEffect(() => {
    if (!root) {
      return
    }

    dispatch(
      actions.addViewer({
        viewerId,
      }),
    )

    // HEADS UP!
    // This functions are mutable, meaning they change
    // the xml tree that was provided by the root property.
    // Currently they only add new properties to the tree nodes.
    // This may or may not be a problem for the library consumer.
    addXpaths(root, '', 1, nsResolver)
    addRuleInfo(root, rules, nsResolver)

    setContextValue({
      viewerId,
      root,
      rules,
      nsResolver,
    })
  }, [root])

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!contextValue) {
    return null
  }

  return (
    <ViewerContext.Provider value={contextValue}>
      <ScrollContext.Provider value={scrollContainerRef}>
        {children}
      </ScrollContext.Provider>
    </ViewerContext.Provider>
  )
}

export function useViewerContext() {
  const context = useContext(ViewerContext)
  return context as ViewerContextType
}

export function useScrollContext() {
  const context = useContext(ScrollContext)
  return context as MutableRefObject<HTMLDivElement | null>
}
