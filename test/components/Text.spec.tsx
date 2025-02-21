import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'

import { Rule, Text } from '../../src'
import { nsResolver } from '../../src/rules/hsp-rules'
import * as utils from '../../src/utils'

import { TestProvider } from '../testutils/TestProvider'
import { evaluate, getRoot } from '../testutils/utils'

jest.spyOn(utils, 'evaluate').mockImplementation(evaluate)

const classes = {
  focusedMatch: '',
  root: '',
  searchMatch: '',
}

const rule: Rule = {
  display: true,
  xpath: '//tei:msPart',
}

const viewerId = 'test'
const teiRoot =
  '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart>content msPart</msPart></TEI>'

const teiRootWithRegisterOther =
  '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msPart type="other"><msIdentifier><idno>Sonstiges</idno></msIdentifier><p><index n="MXML-31160011_bezper[0]" indexName="Vorbesitz-erster"><term type="4100"><persName key="z001_119539926">Philipp Eberhard</persName></term></index></p></msPart></TEI>'
const teiRootWithRegisterItem =
  '<TEI xmlns="http://www.tei-c.org/ns/1.0"><msContents><msItem n="MXML-31160013"><note type="register"><p><index n="MXML-31160013_bezwrk[0]" indexName="Abschrift"><term type="6930gi">Anne de Bretagne</term></index></p></note></msItem></msContents></TEI>'

function renderTextComponent(root: Node, rules: Rule[]) {
  return render(
    <TestProvider
      viewerId={viewerId}
      nsResolver={nsResolver}
      root={root}
      rules={rules}
    >
      <Text classes={classes} />
    </TestProvider>,
  )
}

describe('<Text />', () => {
  it("renders element's text correctly", () => {
    const root = getRoot(teiRoot)
    renderTextComponent(root, [rule])
    screen.getByText('content msPart')
  })

  it("renders element's text by using the given element", () => {
    const root = getRoot(teiRoot)
    const modifiedRule = { ...rule, element: 'div' }
    renderTextComponent(root, [modifiedRule])
    expect(screen.getByText('content msPart').nodeName).toBe('DIV')
  })

  it("doesn't render element's text if rule's display value equals false", () => {
    const root = getRoot(teiRoot)
    const modifiedRule = { ...rule, display: false }
    renderTextComponent(root, [modifiedRule])
    expect(screen.queryByText('content msPart')).toBeNull()
  })

  it("rule's render method is used, if there is any", () => {
    const root = getRoot(teiRoot)
    const modifiedRule = {
      ...rule,
      render: () => <span>rendered content</span>,
    }
    renderTextComponent(root, [modifiedRule])
    screen.getByText('rendered content')
  })

  it('headline is rendered correctly', () => {
    const root = getRoot(teiRoot)
    const modifiedRule = { ...rule, headline: { value: () => 'test headline' } }
    renderTextComponent(root, [modifiedRule])
    screen.getByText('test headline')
  })

  it("headline isn't rendered if there's a rule having display: false", () => {
    const root = getRoot(teiRoot)
    const modifiedRule = { ...rule, headline: { display: false } }
    renderTextComponent(root, [rule, modifiedRule])
    expect(screen.queryByText('test headline')).toBeNull()
  })

  it('register fields are rendered in mspart other', () => {
    const root = getRoot(teiRootWithRegisterOther)
    const modifiedRule = {
      display: true,
      xpath: '//tei:msPart[@type="other"]/tei:p',
    }
    renderTextComponent(root, [modifiedRule])
    screen.getByText('Sonstiges')
    screen.getByText('Philipp Eberhard')
  })
  it('register fields are rendered in msItem type="register"', () => {
    const root = getRoot(teiRootWithRegisterItem)
    const modifiedRule = {
      display: true,
      xpath: '//tei:msItem/tei:note[@type="register"]',
    }
    renderTextComponent(root, [modifiedRule])
    screen.getByText('Anne de Bretagne')
  })
})
