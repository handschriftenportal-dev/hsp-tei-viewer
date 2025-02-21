import xpath from 'xpath'

import { addRuleInfo, addXpaths } from '../../src/context/Viewer'
import { nsResolver } from '../../src/rules/hsp-rules'
import { NsResolver, Rule, XNode } from '../../src/types'

const fs = require('fs')

export function evaluate(
  xpathExpression: string,
  node: Node,
  nsResolver: NsResolver,
) {
  if (!node.ownerDocument) {
    return []
  }

  const res = xpath.evaluate(
    xpathExpression,
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

export function getRoot(mockXml: string): Element {
  return new DOMParser().parseFromString(mockXml, 'text/xml')
    .firstElementChild as Element
}

export function getMockRoot(mockXml: string, rules: Rule[]): Element {
  const root = getRoot(mockXml)
  addXpaths(root, '', 1, nsResolver)
  addRuleInfo(root, rules, nsResolver)
  return root
}

export function getMockElement(mockXml: string, rules: Rule[]): XNode {
  const children = Array.from(getMockRoot(mockXml, rules).childNodes)
  return children[0] as Node as XNode
}

export function getRootNode(path: string, rules: Rule[]) {
  const xmlContent: string = fs.readFileSync(path).toString()
  const document = new DOMParser().parseFromString(xmlContent, 'text/xml')
  const root = document.firstElementChild as Element
  addXpaths(root, '', 1, nsResolver)
  addRuleInfo(root, rules, nsResolver)
  return root
}

export function findTocRule(node: XNode): Rule {
  expect(node.rules?.filter((rule) => !!rule.tocEntry)?.length).toBe(1)
  return node.rules?.find((rule) => !!rule.tocEntry) as Rule
}

export function findHeadlineRule(node: XNode): Rule {
  expect(node.rules?.filter((rule) => !!rule.headline)?.length).toBe(1)
  return node.rules?.find((rule) => !!rule.headline) as Rule
}

export function testNode(
  xpath: string,
  node: Node,
  test: (rule: Rule) => boolean,
  expectedCount = -1,
) {
  const nodes = evaluate(xpath, node, nsResolver) as XNode[]
  expect(nodes instanceof Array).toBe(true)
  if (expectedCount > -1) {
    expect(nodes.length).toBe(expectedCount)
  } else {
    expect(nodes.length).toBeGreaterThan(0)
  }
  nodes.forEach((node) => {
    expect(node.rules?.filter((rule) => test(rule)).length).toBeFalsy()
  })
}
