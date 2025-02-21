import { hspRules, nsResolver } from '../../src/rules/hsp-rules'
import { Rule, XNode } from '../../src/types'
import * as utils from '../../src/utils'

import {
  evaluate,
  findHeadlineRule,
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

describe('<msIdentifier/> within msDesc', function () {
  it('handles msPart TOC items correctly', function () {
    const msPartBooklet = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="booklet"></msPart></TEI>',
      hspRules,
    )
    const bookletRule = msPartBooklet.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      bookletRule.headline &&
        bookletRule.headline.value &&
        bookletRule.headline.value(msPartBooklet, bookletRule),
    ).toBe('Faszikel')

    const msPartAccMat = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="accMat"></msPart></TEI>',
      hspRules,
    )
    const accMatRule = msPartAccMat.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      accMatRule.headline &&
        accMatRule.headline.value &&
        accMatRule.headline.value(msPartAccMat, accMatRule),
    ).toBe('Beigabe')

    const msPartFragment = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="fragment"></msPart></TEI>',
      hspRules,
    )
    const fragmentRule = msPartFragment.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      fragmentRule.headline &&
        fragmentRule.headline.value &&
        fragmentRule.headline.value(msPartFragment, fragmentRule),
    ).toBe('Fragment')

    const msPartBinding = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="binding"></msPart></TEI>',
      hspRules,
    )
    const bindingRule = msPartBinding.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      bindingRule.headline &&
        bindingRule.headline.value &&
        bindingRule.headline.value(msPartBinding, bindingRule),
    ).toBe('Einband')

    const msPartAnyType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="foo"></msPart></TEI>',
      hspRules,
    )
    const anyRule = msPartAnyType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(
      anyRule.headline &&
        anyRule.headline.value &&
        anyRule.headline.value(msPartAnyType, anyRule),
    ).toBe('foo')

    const msPartEmptyType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type=""></msPart></TEI>',
      hspRules,
    )
    const emptyRule = msPartEmptyType.rules?.find(
      (rule) => !!rule.tocEntry,
    ) as Rule
    expect(
      emptyRule.headline &&
        emptyRule.headline.value &&
        emptyRule.headline.value(msPartEmptyType, emptyRule),
    ).toBe('Kodikologische Einheit')

    const msPartNoType = getMockElement(
      '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart></msPart></TEI>',
      hspRules,
    )
    const noneRule = msPartNoType.rules?.find((rule) => !!rule.tocEntry) as Rule
    expect(
      noneRule.headline &&
        noneRule.headline.value &&
        noneRule.headline.value(msPartNoType, noneRule),
    ).toBe('Kodikologische Einheit')
  })
})

describe('<msIdentifier/> within msDesc', function () {
  it('returns "display:false" for <msIdentifier/>', function () {
    const titleRoot = getRootNode(
      'test/fixtures/loremIpsum_beschreibung.xml',
      hspRules,
    )
    const nodes = evaluate(
      '//tei:msDesc/tei:msIdentifier',
      titleRoot,
      nsResolver,
    ) as XNode[]
    expect(nodes.length).toBe(1)
    const headlineRule = findHeadlineRule(nodes[0])
    expect(headlineRule.headline?.display).toBeFalsy()
  })
})

describe('<physDesc/> / Äußeres', function () {
  it('returns "Äußeres" for all appearances', function () {
    const nodes = evaluate('//tei:physDesc', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.tocEntry &&
          headlineRule.tocEntry.value(node, headlineRule),
      ).toBe('Äußeres')
    })
  })
})

describe('<msContents/>', function () {
  it('returns "Inhalt" for all appearances', function () {
    const nodes = evaluate('//tei:msContents', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach(() => {
      nodes.forEach((node) => {
        const headlineRule = findHeadlineRule(node)
        expect(
          headlineRule.tocEntry &&
            headlineRule.tocEntry.value(node, headlineRule),
        ).toBe('Inhalt')
      })
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
    const tocHeadline = findHeadlineRule(nodes[0])
    expect(
      tocHeadline.headline?.value &&
        tocHeadline.headline.value(nodes[0], tocHeadline),
    ).toBe('At vero, eos et, accusam et justo [Text]')
  })

  it("doesn't shorten content if length is too long", function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="text"]',
      alt2Root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline?.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe(
        'At vero, eos et, accusam et justo sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore [Text]',
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
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline?.value &&
          headlineRule.headline?.value(node, headlineRule),
      ).toBe('[Text]')
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
    const headlineRule = findHeadlineRule(nodes[0])
    expect(
      headlineRule.headline &&
        headlineRule.headline.value &&
        headlineRule.headline.value(nodes[0], headlineRule),
    ).toBe('duo, dolores, et ea [Musik]')
  })

  it("doesn't shorten content if length is too long", function () {
    const nodes = evaluate(
      '//tei:msItem/tei:note[@type="music"]',
      alt2Root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe(
        'duo, dolores, et ea sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore [Musik]',
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
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe('[Musik]')
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
    const headlineRule = findHeadlineRule(nodes[0])
    expect(
      headlineRule.headline &&
        headlineRule.headline.value &&
        headlineRule.headline.value(nodes[0], headlineRule),
    ).toBe('Stet clita, kasd, gubergren [Kunst]')
  })

  it("doesn't shorten content if length is too long", function () {
    const nodes = evaluate(
      '//tei:msItem/tei:decoNote[@type="content"]',
      alt2Root,
      nsResolver,
    ) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe(
        'Stet clita, kasd, gubergren sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore [Kunst]',
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
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe('[Kunst]')
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
    const headlineRule = findHeadlineRule(nodes[0])
    expect(
      headlineRule.headline &&
        headlineRule.headline.value &&
        headlineRule.headline.value(nodes[0], headlineRule),
    ).toBe('Buchschmuck')
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
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe('Buchschmuck')
    })
  })
})

describe('<history/>', function () {
  it('returns "Geschichte" for all appearances', function () {
    const nodes = evaluate('//tei:history', root, nsResolver) as XNode[]
    expect(nodes instanceof Array).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    nodes.forEach((node) => {
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe('Geschichte')
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
    const headlineRule = findHeadlineRule(node)
    expect(
      headlineRule.headline &&
        headlineRule.headline.value &&
        headlineRule.headline.value(node, headlineRule),
    ).toBe('Einband-idno')
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
    const headlineRule0 = findHeadlineRule(node0)
    expect(
      headlineRule0.headline &&
        headlineRule0.headline.value &&
        headlineRule0.headline.value(node0, headlineRule0),
    ).toBe('Einband')

    const node1 = nodes[1]
    const headlineRule1 = findHeadlineRule(node1)
    expect(
      headlineRule1.headline &&
        headlineRule1.headline.value &&
        headlineRule1.headline.value(node1, headlineRule1),
    ).toBe('Einband')
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
    const headlineRule0 = findHeadlineRule(node0)
    expect(
      headlineRule0.headline &&
        headlineRule0.headline.value &&
        headlineRule0.headline.value(node0, headlineRule0),
    ).toBe('lorem ipsum')

    const node1 = nodes[1]
    const headlineRule1 = findHeadlineRule(node1)
    expect(
      headlineRule1.headline &&
        headlineRule1.headline.value &&
        headlineRule1.headline.value(node1, headlineRule1),
    ).toBe('Fragment')
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
    const headlineRule0 = findHeadlineRule(node0)
    expect(
      headlineRule0.headline &&
        headlineRule0.headline.value &&
        headlineRule0.headline.value(node0, headlineRule0),
    ).toBe('Fragment')

    const node1 = nodes[1]
    const headlineRule1 = findHeadlineRule(node1)
    expect(
      headlineRule1.headline &&
        headlineRule1.headline.value &&
        headlineRule1.headline.value(node1, headlineRule1),
    ).toBe('Fragment')
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
    const headlineRule = findHeadlineRule(node)
    expect(
      headlineRule.headline &&
        headlineRule.headline.value &&
        headlineRule.headline.value(node, headlineRule),
    ).toBe('Faszikel')

    const altNodes = evaluate(
      '//tei:msPart[@type="booklet"]',
      altRoot,
      nsResolver,
    ) as XNode[]
    expect(altNodes instanceof Array).toBe(true)
    expect(altNodes.length).toBeGreaterThan(0)

    const altNode = altNodes[0]
    const headlineRuleAlt = findHeadlineRule(altNode)
    expect(
      headlineRuleAlt.headline &&
        headlineRuleAlt.headline.value &&
        headlineRuleAlt.headline.value(altNode, headlineRuleAlt),
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
    const headlineRule1 = findHeadlineRule(node1)
    expect(
      headlineRule1.headline &&
        headlineRule1.headline.value &&
        headlineRule1.headline.value(node1, headlineRule1),
    ).toBe('Faszikel')

    const node2 = nodes[2]
    const headlineRule2 = findHeadlineRule(node2)
    expect(
      headlineRule2.headline &&
        headlineRule2.headline.value &&
        headlineRule2.headline.value(node2, headlineRule2),
    ).toBe('Faszikel')
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
      const headlineRule = findHeadlineRule(node)
      expect(
        headlineRule.headline &&
          headlineRule.headline.value &&
          headlineRule.headline.value(node, headlineRule),
      ).toBe('Beigabe')
    })
  })

  describe('<additional/>, Literatur', function () {
    it('always returns "Literatur",', function () {
      const nodes = evaluate('//tei:additional', root, nsResolver) as XNode[]
      expect(nodes instanceof Array).toBe(true)
      expect(nodes.length).toBeGreaterThan(0)

      nodes.forEach((node) => {
        const headlineRule = findHeadlineRule(node)
        expect(
          headlineRule.headline &&
            headlineRule.headline.value &&
            headlineRule.headline.value(node, headlineRule),
        ).toBe('Literatur')
      })
    })
  })
})

describe('Default behaviour', function () {
  it('does not provide a headline for <head/>, <msItem/>', function () {
    testNode('//tei:msDesc/tei:head', root, (rule) => !!rule.headline?.value, 1)
    testNode('//tei:msItem', root, (rule) => !!rule.tocEntry)
  })
})
