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

import { hspMsDescRules, nsResolver } from '../../src/rules/hsp-msdesc'
import { addRuleInfo, addXpaths } from '../../src/context/Viewer'
import { Rule, XNode } from '../../src/types'
import * as utils from '../../src/utils'
import { evaluate } from '../testutils/utils'

jest.spyOn(utils, 'evaluate').mockImplementation(evaluate)

const fs = require('fs')

function getRootNode(path: string) {
  const xmlContent: string = fs.readFileSync(path).toString()
  const document = new DOMParser().parseFromString(xmlContent, 'text/xml')
  const root = document.firstElementChild as Element
  addXpaths(root, '', 1, nsResolver)
  addRuleInfo(root, hspMsDescRules, nsResolver)
  return root
}

const root = getRootNode('test/fixtures/loremIpsum_beschreibung.xml')
const altRoot = getRootNode('test/fixtures/msdesc-alternatives.xml')


function getMockRoot(mockXml: string) : Element {
  const root = new DOMParser().parseFromString(mockXml, 'text/xml').firstElementChild as Element
  addXpaths(root, '', 1, nsResolver)
  addRuleInfo(root, hspMsDescRules, nsResolver)
  return root
}

function getMockElement(mockXml: string): XNode {
  const children = Array.from(getMockRoot(mockXml).childNodes)
  return children[0] as Node as XNode
}

describe('rules', function() {
  it('handles msPart TOC items correctly', function() {
    const msPartBooklet = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="booklet"></msPart></TEI>')
    expect(msPartBooklet.rules).toBeDefined()
    expect(msPartBooklet.rules?.length).toBeGreaterThanOrEqual(1)
    const bookletTocRule = msPartBooklet.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(bookletTocRule).toBeDefined()
    expect(bookletTocRule.tocEntry && bookletTocRule.tocEntry(msPartBooklet)).toBe('Faszikel')

    const msPartAccMat = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="accMat"></msPart></TEI>')
    const accMatRule = msPartAccMat.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(accMatRule.tocEntry && accMatRule.tocEntry(msPartAccMat)).toBe('Beigabe')

    const msPartFragment = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="fragment"></msPart></TEI>')
    const fragmentRule = msPartFragment.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(fragmentRule.tocEntry && fragmentRule.tocEntry(msPartFragment)).toBe('Fragment')

    const msPartBinding = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="binding"></msPart></TEI>')
    const bindingRule = msPartBinding.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(bindingRule.tocEntry && bindingRule.tocEntry(msPartBinding)).toBe('Einband')

    const msPartAnyType = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="foo"></msPart></TEI>')
    const anyRule = msPartAnyType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(anyRule.tocEntry && anyRule.tocEntry(msPartAnyType)).toBe('foo')

    const msPartOtherType = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="other"></msPart></TEI>')
    expect(msPartOtherType.rules?.some(rule => !rule.display))

    const msPartEmptyType = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type=""></msPart></TEI>')
    const emptyRule = msPartEmptyType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(emptyRule.tocEntry && emptyRule.tocEntry(msPartEmptyType)).toBe('Kodikologische Einheit')

    const msPartNoType = getMockElement('<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart></msPart></TEI>')
    const noneRule = msPartNoType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(noneRule.tocEntry && noneRule.tocEntry(msPartNoType)).toBe('Kodikologische Einheit')
  })
})

function findTocRule(node: XNode) : Rule {
  expect(node.rules?.filter(rule => !!rule.tocEntry)?.length).toBe(1)
  return node.rules?.find(rule => !!rule.tocEntry) as Rule
}

describe('<msIdentifier/> within msDesc', function() {
  it('returns the content of index title field for <msIdentifier/> if present', function() {
    const titleRoot = getRootNode('test/fixtures/msdesc-indextitle.xml')
    const nodes = evaluate('//tei:msDesc/tei:msIdentifier', titleRoot, nsResolver) as XNode[]
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Title term')
  })

  it('returns the content of "head/title" for <msIdentifier/>', function() {
    const titleRoot = getRootNode('test/fixtures/msdesc-title.xml')
    const nodes = evaluate('//tei:msDesc/tei:msIdentifier', titleRoot, nsResolver) as XNode[]
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Title tag')
  })

  it('returns "Beschreibung" if "head/title" is empty or missing', function() {
    const nodes = evaluate('//tei:msDesc/tei:msIdentifier', root, nsResolver) as XNode[]
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Beschreibung')
  })
})

describe('<physDesc/> / Kodikologie', function() {
  it('returns "Kodikologie" for all appearances', function() {
    const nodes = evaluate('//tei:physDesc', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Kodikologie')
    })
  })
})

describe('<msContents/>', function() {
  it('returns "Inhalt" for all appearances', function() {
    const nodes = evaluate('//tei:msContents', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Inhalt')
    })
  })
})

describe('<note type="text"/> / Inhalt (Text)', function() {
  it('returns content of msItem/index[@type="namensachen"]/term[@type="Abschrift"]', function() {
    const nodes = evaluate('//tei:msItem/tei:note[@type="text"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Text: Inhaltstitel')
  })

  it('returns "Inhalt (Text)" if no content is given', function() {
    const nodes = evaluate('//tei:msItem/tei:note[@type="text"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Text')
    })
  })
})

describe('<note type="music"/> / Inhalt (Musik)', function() {
  it('returns content of msItem/index[@type="namensachen"]/term[@type="Abschrift"]', function() {
    const nodes = evaluate('//tei:msItem/tei:note[@type="music"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Musik: Inhaltstitel')
  })

  it('returns "Inhalt (Text)" if no content is given', function() {
    const nodes = evaluate('//tei:msItem/tei:note[@type="music"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Musik')
    })
  })
})

describe('<decoNote type="content"/> / Inhalt (Kunst)', function() {
  it('returns content of msItem/index[@type="namensachen"]/term[@type="Abschrift"]', function() {
    const nodes = evaluate('//tei:msItem/tei:decoNote[@type="content"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Kunst: Inhaltstitel')
  })

  it('returns "Kunst" if no content is given', function() {
    const nodes = evaluate('//tei:msItem/tei:decoNote[@type="content"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Kunst')
    })
  })
})

describe('<decoNote type="form"/> / Buchschmuck', function() {
  it('returns "Buchschmuck" despite presence of msItem/index[@type="namensachen"]/term[@type="Abschrift"]', function() {
    const nodes = evaluate('//tei:msItem/tei:decoNote[@type="form"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const { tocEntry } = findTocRule(nodes[0])
    expect(tocEntry && tocEntry(nodes[0])).toBe('Buchschmuck')
  })

  it('returns "Buchschmuck" if no content is given', function() {
    const nodes = evaluate('//tei:msItem/tei:decoNote[@type="form"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Buchschmuck')
    })
  })
})

describe('<history/>', function() {
  it('returns "Geschichte" for all appearances', function() {
    const nodes = evaluate('//tei:history', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(node => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Geschichte')
    })
  })
})

describe('<msPart type="binding"/>, Einband', function() {
  it('returns content of msIdentifier/idno,', function() {
    const nodes = evaluate('//tei:msPart[@type="binding"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    const node = nodes[0]
    const { tocEntry } = findTocRule(node)
    expect(tocEntry && tocEntry(node)).toBe('Einband-idno')
  })

  it('returns "Einband" as fallback', function() {
    const nodes = evaluate('//tei:msPart[@type="binding"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const { tocEntry: tocEntry0 } = findTocRule(node0)
    expect(tocEntry0 && tocEntry0(node0)).toBe('Einband')

    const node1 = nodes[1]
    const { tocEntry: tocEntry1 } = findTocRule(node1)
    expect(tocEntry1 && tocEntry1(node1)).toBe('Einband')
  })
})

describe('<msPart type="fragment"/>, Fragment', function() {
  it('returns content of msIdentifier/idno,', function() {
    const nodes = evaluate('//tei:msPart[@type="fragment"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const { tocEntry: tocEntry0 } = findTocRule(node0)
    expect(tocEntry0 && tocEntry0(node0)).toBe('lorem ipsum')

    const node1 = nodes[1]
    const { tocEntry: tocEntry1 } = findTocRule(node1)
    expect(tocEntry1 && tocEntry1(node1)).toBe('Fragment')
  })

  it('returns "Fragment" as fallback', function() {
    const nodes = evaluate('//tei:msPart[@type="fragment"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const { tocEntry: tocEntry0 } = findTocRule(node0)
    expect(tocEntry0 && tocEntry0(node0)).toBe('Fragment')

    const node1 = nodes[1]
    const { tocEntry: tocEntry1 } = findTocRule(node1)
    expect(tocEntry1 && tocEntry1(node1)).toBe('Fragment')
  })
})

describe('<msPart type="booklet"/>, Faszikel', function() {
  it('returns content of msIdentifier/idno,', function() {
    const nodes = evaluate('//tei:msPart[@type="booklet"]', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node = nodes[0]
    const { tocEntry } = findTocRule(node)
    expect(tocEntry && tocEntry(node)).toBe('Faszikel')

    const altNodes = evaluate('//tei:msPart[@type="booklet"]', altRoot, nsResolver) as XNode[]
    expect(altNodes instanceof Array).toBe(true)
    expect(altNodes.length).toBeGreaterThan(0)

    const altNode = altNodes[0]
    const { tocEntry: altTocEntry } = findTocRule(altNode)
    expect(altTocEntry && altTocEntry(altNode)).toBe('Faszikel mit idno')
  })

  it('returns "Faszikel" as fallback', function() {
    const nodes = evaluate('//tei:msPart[@type="booklet"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node1 = nodes[1]
    const { tocEntry: tocEntry1 } = findTocRule(node1)
    expect(tocEntry1 && tocEntry1(node1)).toBe('Faszikel')

    const node2 = nodes[2]
    const { tocEntry: tocEntry2 } = findTocRule(node2)
    expect(tocEntry2 && tocEntry2(node2)).toBe('Faszikel')
  })
})

describe('<msPart type="accMat"/>, Beigabe', function() {
  it('always returns "Beigabe",', function() {
    const nodes = evaluate('//tei:msPart[@type="accMat"]', altRoot, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node = nodes[0]
    const { tocEntry } = findTocRule(node)
    expect(tocEntry && tocEntry(node)).toBe('Beigabe')
  })
})

describe('<additional/>, Literatur', function() {
  it('always returns "Literatur",', function() {
    const nodes = evaluate('//tei:additional', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    nodes.forEach((node) => {
      const { tocEntry } = findTocRule(node)
      expect(tocEntry && tocEntry(node)).toBe('Literatur')
    })
  })
})

describe('Default behaviour', function() {
  function testNodehasNoToCEntry(xpath: string, expectedCount = -1) {
    const nodes = evaluate(xpath, root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    if (expectedCount > -1) {
      expect(nodes.length).toBe(expectedCount)
    } else {
      expect(nodes.length).toBeGreaterThan(0)
    }
    nodes.forEach(node => {
      expect(node.rules?.filter(rule => !!rule.tocEntry).length).toBeFalsy()
    })
  }

  it('does not provide a toc entry for <head/>, <msItem/>', function() {
    testNodehasNoToCEntry('//tei:msDesc/tei:head', 1)
    testNodehasNoToCEntry('//tei:msItem')
  })
})
