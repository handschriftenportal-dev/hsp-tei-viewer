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

import Tooltip from '@material-ui/core/Tooltip'
import React from 'react'
import { NsResolver } from '..'
import { Rule } from '../types'
import { evaluate } from '../utils'

export const nsResolver: NsResolver = {
  lookupNamespaceURI: function(prefix: string | null) {
    return 'http://www.tei-c.org/ns/1.0'
  },
  lookupNamespacePrefix: function(uri: string | null) {
    if (uri === 'http://www.tei-c.org/ns/1.0') {
      return 'tei'
    }
    return null
  },
}
export const hspMsDescRules : Rule[] = [
  {
    description: 'Nicht anzuzeigende Nodes',
    display: false,
    xpath: `
      //tei:index
      | //tei:additional/tei:adminInfo
      | //tei:msIdentifier/tei:altIdentifier
      | //tei:msIdentifier/tei:collection
      | //tei:teiHeader
      | //tei:fileDesc
      | //tei:msPart[@type="other"]
    `
  },
  {
    description: 'Normdatenverweis',
    display: true,
    render: (props) => {
      const elem = props.node as Element
      return (
        <Tooltip
          tabIndex={0}
          title={elem.getAttributeNode('key')?.value || elem.getAttributeNode('ref')?.value || ''}
        >
          <span style={{ color: '#d65151' }}>
            {props?.children}
          </span>
        </Tooltip>
      )
    },
    xpath: '//*[@key] | //tei:persName[@ref]'
  },
  {
    description: 'msPart',
    display: true,
    element: 'div',
    xpath: '//tei:msPart',
    tocEntry: (node) => {
      const element = node as Element
      const partType = element.getAttribute('type')
      const partIdnos = evaluate('./tei:msIdentifier/tei:idno', node, nsResolver) as Element[]
      const partIdno = partIdnos.length > 0 && (partIdnos[0]).textContent
      switch (partType) {
        case null:
        case '':
          return 'Kodikologische Einheit'
        case 'binding':
          return partIdno || 'Einband'
        case 'fragment':
          return partIdno || 'Fragment'
        case 'accMat':
          return 'Beigabe'
        case 'booklet':
          return partIdno || 'Faszikel'
        default:
          return partType
      }
    }
  },
  {
    description: 'Überschrift für msPart',
    xpath: '//tei:msPart/tei:msIdentifier/tei:idno',
    display: true,
    element: 'p',
    style: { fontWeight: 'bold' }
  },
  {
    description: 'Beschreibung äußeres',
    display: true,
    element: 'div',
    xpath: '//tei:physDesc',
    style: { marginBlockEnd: '20px' },
    tocEntry: () => 'Kodikologie'
  },
  {
    description: 'Äußeres (Kunst)',
    display: true,
    element: 'div',
    xpath: '//tei:decoNote[@type="form"]',
    style: { marginBlockEnd: '20px' },
    tocEntry: () => 'Buchschmuck'
  },
  {
    description: 'Inhalt (Text, Musik, Kunst)',
    display: true,
    element: 'div',
    xpath: '//tei:msContents//tei:msItem/tei:note[@type="text" or @type="music"] | //tei:msContents/tei:msItem/tei:decoNote[@type="content"]',
    style: { marginBlockEnd: '20px' },
    tocEntry: (node) => {
      const element = node as Element
      const termElements = evaluate('../tei:index[@type="namensachen"]/tei:term[@type="Abschrift"]', node, nsResolver) as Element[]
      const title = termElements.map(termElement => (termElement).textContent).join(', ')
      switch (element.getAttribute('type')) {
        case 'content':
          return `Kunst${title ? ': ' + title : ''}`
        case 'music':
          return `Musik${title ? ': ' + title : ''}`
        default:
          return `Text${title ? ': ' + title : ''}`
      }
    }
  },
  {
    description: 'Geschichte',
    display: true,
    element: 'div',
    xpath: '//tei:history',
    style: { marginBlockEnd: '20px' },
    tocEntry: () => {
      return 'Geschichte'
    }
  },
  {
    description: 'Blockelemente',
    display: true,
    element: 'div',
    xpath: '//tei:additional | //tei:physDesc//tei:objectDesc | //tei:physDesc//tei:handDesc | //tei:physDesc//tei:decoDesc',
    style: { marginBlockEnd: '20px' }
  },
  {
    description: 'Identifikation, Scrollmarke für msDesc',
    display: true,
    element: 'p',
    xpath: '//tei:msDesc/tei:msIdentifier',
    tocEntry: (node) => {
      const identifierEl = node as Element
      const descEl = identifierEl.parentElement as Element
      const termTitle = evaluate('//tei:msDesc/tei:head/tei:index[@indexName="norm_title"]/tei:term[@type="title"]', descEl, nsResolver) as Element[]
      if (termTitle.length > 0 && (termTitle[0]).textContent) {
        return (termTitle[0] as Element).textContent as string
      }
      const headEl = descEl.getElementsByTagName('head')?.item(0)
      if (headEl) {
        const titleEl = headEl.getElementsByTagName('title')?.item(0)
        return (titleEl && titleEl.textContent) || 'Beschreibung'
      }
      return 'Beschreibung'
    }
  },
  {
    description: 'Kommas Identifikation',
    display: true,
    render: (props) => (<span>{ props.children }, </span>),
    xpath: '//tei:msDesc/tei:msIdentifier/tei:settlement | //tei:msDesc/tei:msIdentifier/tei:repository',
  },
  {
    description: 'Titel unterhalb msDesc',
    display: true,
    element: 'h1',
    style: { fontSize: '16pt' },
    xpath: '//tei:msDesc/tei:head/tei:title',
  },
  {
    description: 'Titel unterhalb msPart',
    display: true,
    element: 'p',
    xpath: '//tei:msPart/tei:head/tei:title',
  },
  {
    description: 'Absätze',
    display: true,
    element: 'p',
    xpath: '//tei:p',
  },
  {
    description: 'msContents',
    display: true,
    element: 'div',
    xpath: '//tei:msContents',
    tocEntry: () => 'Inhalt'
  },
  {
    description: 'msItem',
    display: true,
    element: 'div'
  },
  {
    display: true,
    description: 'Schlagzeile unterhalb msDesc',
    element: 'p',
    xpath: '//tei:msDesc/tei:head/tei:note[@type="caption" or @type="headline"]',
  },
  {
    display: true,
    description: 'Schlagzeile unterhalb msPart',
    element: 'p',
    xpath: '//tei:msPart/tei:head/tei:note[@type="caption" or @type="headline"]',
  },
  {
    description: 'Zitat',
    display: true,
    element: 'span',
    style: { fontStyle: 'italic' },
    xpath: '//tei:quote'
  },
  {
    description: 'Werkautor',
    display: true,
    element: 'span',
    style: { fontWeight: 'bold' },
    xpath: '//tei:rs[@type="person" and @role="aut"]'
  },
  {
    description: 'Werktitel',
    display: true,
    element: 'span',
    style: { fontWeight: 'bold' },
    xpath: '//tei:msItem/tei:note[@type="text"]/tei:title | //tei:msItem/tei:title'
  },
  {
    description: 'Literatur (ToC-Eintrag)',
    display: true,
    element: 'div',
    xpath: '//tei:additional',
    tocEntry: () => {
      return 'Literatur'
    }
  },
  /* {
    description: 'Bibliographie',
    display: true,
    element: 'ul',
    xpath: '//tei:listBibl[./tei:bibl]',
  },
  {
    description: 'Einzelne bibliographische Einträge',
    display: true,
    element: 'li',
    xpath: '//tei:listBibl/tei:bibl'
  }, */
  {
    description: 'Einstiegspunkt msdesc',
    display: true,
    element: 'div',
    style: { fontFamily: 'Roboto, junicode', fontSize: '12pt' },
    xpath: '//tei:msDesc',
    metadata: (node) => {
      const descEl = node as Element
      const headEl = descEl.getElementsByTagName('head')?.item(0)
      const msIdentifier = descEl.getElementsByTagName('msIdentifier')?.item(0)
      if (headEl || msIdentifier) {
        const metadata: Record<string, string> = {}
        const idno = msIdentifier?.getElementsByTagName('idno')?.item(0)?.textContent
        const settlement = msIdentifier?.getElementsByTagName('settlement')?.item(0)?.textContent
        const repository = msIdentifier?.getElementsByTagName('repository')?.item(0)?.textContent
        const title = headEl?.getElementsByTagName('title')?.item(0)?.textContent
        if (settlement) {
          metadata.Ort = settlement
        }
        if (repository) {
          metadata.Einrichtung = repository
        }
        if (idno) {
          metadata.Signatur = idno
        }
        if (title) {
          metadata.Titel = title
        }
        if (Object.keys(metadata).length > 0) {
          return metadata
        }
      }
      return {}
    }
  },
  {
    description: 'Line breaks',
    display: true,
    // using "render" instead of "element" because React.createElement for <br/> can't be called with children in props
    render: (props) => (<><br/><br/></>),
    xpath: '//tei:lb',
  },
  {
    description: 'Elemente ohne korrespondierende HTML-Tags',
    display: true,
    xpath: '/tei:TEI | /tei:TEI/tei:text | /tei:TEI/tei:text/tei:body',
  },
  {
    isDefaultRule: true,
    description: 'All elements display their children within spans',
    display: true,
    element: 'span',
  }
]
