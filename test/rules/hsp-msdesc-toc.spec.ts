import { hspRules, nsResolver } from '../../src/rules/hsp-rules'
import { Rule, XNode } from '../../src/types'
import * as utils from '../../src/utils'

import {
  evaluate,
  findTocRule,
  getMockElement,
  getRootNode,
  testNode,
} from '../testutils/utils'

jest.spyOn(utils, 'evaluate').mockImplementation(evaluate)

const root = getRootNode('test/fixtures/loremIpsum_beschreibung.xml', hspRules)
const altRoot = getRootNode('test/fixtures/msdesc-alternatives.xml', hspRules)
const alt2Root = getRootNode(
  'test/fixtures/msdesc-alternatives-2.xml',
  hspRules,
)

describe('rules', function () {
  it('handles msPart TOC items correctly', function () {
    const msPartBooklet = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="booklet"></msPart></TEI>',
      hspRules,
    )
    const bookletTocRule = msPartBooklet.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      bookletTocRule.tocEntry &&
        bookletTocRule.tocEntry.value(msPartBooklet, bookletTocRule),
    ).toBe('Faszikel')

    const msPartAccMat = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="accMat"></msPart></TEI>',
      hspRules,
    )
    const accMatRule = msPartAccMat.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      accMatRule.tocEntry &&
        accMatRule.tocEntry.value(msPartAccMat, accMatRule),
    ).toBe('Beigabe')

    const msPartFragment = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="fragment"></msPart></TEI>',
      hspRules,
    )
    const fragmentRule = msPartFragment.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      fragmentRule.tocEntry &&
        fragmentRule.tocEntry.value(msPartFragment, fragmentRule),
    ).toBe('Fragment')

    const msPartBinding = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="binding"></msPart></TEI>',
      hspRules,
    )
    const bindingRule = msPartBinding.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      bindingRule.tocEntry &&
        bindingRule.tocEntry.value(msPartBinding, bindingRule),
    ).toBe('Einband')

    const msPartAnyType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="foo"></msPart></TEI>',
      hspRules,
    )
    const anyRule = msPartAnyType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(
      anyRule.tocEntry && anyRule.tocEntry.value(msPartAnyType, anyRule),
    ).toBe('foo')

    const msPartOtherType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="other"></msPart></TEI>',
      hspRules,
    )
    expect(msPartOtherType.rules?.some((rule) => !rule.display))

    const msPartEmptyType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type=""></msPart></TEI>',
      hspRules,
    )
    const emptyRule = msPartEmptyType.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      emptyRule.tocEntry &&
        emptyRule.tocEntry.value(msPartEmptyType, emptyRule),
    ).toBe('Kodikologische Einheit')

    const msPartNoType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart></msPart></TEI>',
      hspRules,
    )
    const noneRule = msPartNoType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(
      noneRule.tocEntry && noneRule.tocEntry.value(msPartNoType, noneRule),
    ).toBe('Kodikologische Einheit')
  })
})

describe('<msIdentifier/> within msDesc', function () {
  it('returns the content of "idno" for <msIdentifier/>', function () {
    const nodes = evaluate(
      '//tei:msDesc/tei:msIdentifier',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes.length).toBe(1)
    const tocRule = findTocRule(nodes[0])
    expect(tocRule.tocEntry && tocRule.tocEntry.value(nodes[0], tocRule)).toBe(
      'dolor sit amet Titel',
    )
  })
})

describe('<physDesc/> / Äußeres', function () {
  it('returns "Äußeres" for all appearances', function () {
    const nodes = evaluate('//tei:physDesc', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'Äußeres',
      )
    })
  })
})

describe('<msContents/>', function () {
  it('returns "Inhalt" for all appearances', function () {
    const nodes = evaluate('//tei:msContents', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'Inhalt',
      )
    })
  })
})

describe('<note type="text"/> / Inhalt (Text)', function () {
  it('returns content of tei:ref[@type="locus"] | tei:ref[(starts-with(@type, "bezwrk[") and "].6922" = substring(@type, string-length(@type) - 6 + 1))] | tei:ref[@type="workTitle"], ', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="text"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const tocRule = findTocRule(nodes[0])
    expect(tocRule.tocEntry && tocRule.tocEntry.value(nodes[0], tocRule)).toBe(
      'At vero, eos et, accusam et justo [Text]',
    )
  })

  it('shortens content if length is too long and adds `... [Text]` at the end', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="text"]',
      alt2Root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'At vero, eos et, accusam et justo ... [Text]',
      )
    })
  })

  it('returns "[Text]" if no content is given', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="text"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        '[Text]',
      )
    })
  })
})

describe('<note type="music"/> / Inhalt (Musik)', function () {
  it('returns content of tei:ref[@type="locus"] | tei:ref[(starts-with(@type, "bezwrk[") and "].6922" = substring(@type, string-length(@type) - 6 + 1))] | tei:ref[@type="workTitle"]', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="music"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const tocRule = findTocRule(nodes[0])
    expect(tocRule.tocEntry && tocRule.tocEntry.value(nodes[0], tocRule)).toBe(
      'duo, dolores, et ea [Musik]',
    )
  })

  it('shortens content if length is too long and adds `... [Musik]` at the end', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="music"]',
      alt2Root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'duo, dolores, et ea sadipscing elitr, sed ... [Musik]',
      )
    })
  })

  it('returns "[Musik]" if no content is given', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="music"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        '[Musik]',
      )
    })
  })
})

describe('<decoNote type="content"/> / Inhalt (Kunst)', function () {
  it('returns content of tei:ref[@type="locus"] | tei:ref[(starts-with(@type, "bezwrk[") and "].6922" = substring(@type, string-length(@type) - 6 + 1))] | tei:ref[@type="workTitle"]', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:decoNote[@type="content"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const tocRule = findTocRule(nodes[0])
    expect(tocRule.tocEntry && tocRule.tocEntry.value(nodes[0], tocRule)).toBe(
      'Stet clita, kasd, gubergren [Kunst]',
    )
  })

  it('shortens content if length is too long and adds `... [Kunst]` at the end', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:decoNote[@type="content"]',
      alt2Root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'Stet clita, kasd, gubergren sadipscing ... [Kunst]',
      )
    })
  })

  it('returns "[Kunst]" if no content is given', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:decoNote[@type="content"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        '[Kunst]',
      )
    })
  })
})

describe('<decoNote type="form"/> / Buchschmuck', function () {
  it('returns "Buchschmuck" despite presence of msItem/index[@type="namensachen"]/term[@type="Abschrift"]', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:decoNote[@type="form"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBe(1)
    const tocRule = findTocRule(nodes[0])
    expect(tocRule.tocEntry && tocRule.tocEntry.value(nodes[0], tocRule)).toBe(
      'Buchschmuck',
    )
  })

  it('returns "Buchschmuck" if no content is given', function () {
    const nodes = evaluate(
      '//tei:msItem/tei:decoNote[@type="form"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'Buchschmuck',
      )
    })
  })
})

describe('<history/>', function () {
  it('returns "Geschichte" for all appearances', function () {
    const nodes = evaluate('//tei:history', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'Geschichte',
      )
    })
  })
})

describe('<msPart type="binding"/>, Einband', function () {
  it('returns content of msIdentifier/idno,', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="binding"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    const node = nodes[0]
    const tocRule = findTocRule(node)
    expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
      'Einband-idno',
    )
  })

  it('returns "Einband" as fallback', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="binding"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const tocRule0 = findTocRule(node0)
    expect(tocRule0.tocEntry && tocRule0.tocEntry.value(node0, tocRule0)).toBe(
      'Einband',
    )

    const node1 = nodes[1]
    const tocRule1 = findTocRule(node1)
    expect(tocRule1.tocEntry && tocRule1.tocEntry.value(node1, tocRule1)).toBe(
      'Einband',
    )
  })
})

describe('<msPart type="fragment"/>, Fragment', function () {
  it('returns content of msIdentifier/idno,', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="fragment"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const tocRule0 = findTocRule(node0)
    expect(tocRule0.tocEntry && tocRule0.tocEntry.value(node0, tocRule0)).toBe(
      'lorem ipsum',
    )

    const node1 = nodes[1]
    const tocRule1 = findTocRule(node1)
    expect(tocRule1.tocEntry && tocRule1.tocEntry.value(node1, tocRule1)).toBe(
      'Fragment',
    )
  })

  it('returns "Fragment" as fallback', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="fragment"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const tocRule0 = findTocRule(node0)
    expect(tocRule0.tocEntry && tocRule0.tocEntry.value(node0, tocRule0)).toBe(
      'Fragment',
    )

    const node1 = nodes[1]
    const tocRule1 = findTocRule(node1)
    expect(tocRule1.tocEntry && tocRule1.tocEntry.value(node1, tocRule1)).toBe(
      'Fragment',
    )
  })
})

describe('<msPart type="other"/>, Sonstiges', function () {
  it('return content of msIdentifier/idno,', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="other"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node0 = nodes[0]
    const tocRule0 = findTocRule(node0)
    expect(tocRule0.tocEntry && tocRule0.tocEntry.value(node0, tocRule0)).toBe(
      'Sonstiges',
    )

    const node1 = nodes[1]
    const tocRule1 = findTocRule(node1)
    expect(tocRule1.tocEntry && tocRule1.tocEntry.value(node1, tocRule1)).toBe(
      'Sonstiges',
    )
  })
})

describe('<msPart type="booklet"/>, Faszikel', function () {
  it('returns content of msIdentifier/idno,', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="booklet"]',
      root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node = nodes[0]
    const tocRule = findTocRule(node)
    expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
      'Faszikel',
    )

    const altNodes = evaluate(
      '//tei:msPart[@type="booklet"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(altNodes instanceof Array).toBe(true)
    expect(altNodes.length).toBeGreaterThan(0)

    const altNode = altNodes[0]
    const tocRuleAlt = findTocRule(altNode)
    expect(
      tocRuleAlt.tocEntry && tocRuleAlt.tocEntry.value(altNode, tocRuleAlt),
    ).toBe('Faszikel mit idno')
  })

  it('returns "Faszikel" as fallback', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="booklet"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node1 = nodes[1]
    const tocRule1 = findTocRule(node1)
    expect(tocRule1.tocEntry && tocRule1.tocEntry.value(node1, tocRule1)).toBe(
      'Faszikel',
    )

    const node2 = nodes[2]
    const tocRule2 = findTocRule(node2)
    expect(tocRule2.tocEntry && tocRule2.tocEntry.value(node2, tocRule2)).toBe(
      'Faszikel',
    )
  })
})

describe('<msPart type="accMat"/>, Beigabe', function () {
  it('always returns "Beigabe",', function () {
    const nodes = evaluate(
      '//tei:msPart[@type="accMat"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    const node = nodes[0]
    const tocRule = findTocRule(node)
    expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
      'Beigabe',
    )
  })
})

describe('<additional/>, Literatur', function () {
  it('always returns "Literatur",', function () {
    const nodes = evaluate('//tei:additional', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)

    nodes.forEach((node) => {
      const tocRule = findTocRule(node)
      expect(tocRule.tocEntry && tocRule.tocEntry.value(node, tocRule)).toBe(
        'Literatur',
      )
    })
  })
})

describe('Default behaviour', function () {
  it('does not provide a toc entry for <head/>, <msItem/>', function () {
    testNode('//tei:msDesc/tei:head', root, (rule) => !!rule.tocEntry?.value, 1)
    testNode('//tei:msItem', root, (rule) => !!rule.tocEntry?.value)
  })
})
