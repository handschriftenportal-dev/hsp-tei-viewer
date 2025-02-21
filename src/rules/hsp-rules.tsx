import React from 'react'

import { NsResolver } from '..'
import { ExternalReference } from '../components/ExternalReference'
import { Register } from '../components/Register'
import { Rule } from '../types'
import { evaluate, getContentType, substringFullWord } from '../utils'

export const nsResolver: NsResolver = {
  lookupNamespaceURI: function () {
    return 'http://www.tei-c.org/ns/1.0'
  },
  lookupNamespacePrefix: function (uri: string | null) {
    if (uri === 'http://www.tei-c.org/ns/1.0') {
      return 'tei'
    }
    return null
  },
}
export const hspRules: Rule[] = [
  {
    description: 'Nicht anzuzeigende Nodes',
    display: false,
    xpath: `
      //tei:index
      | //tei:additional/tei:adminInfo
      | //tei:msIdentifier/tei:altIdentifier
      | //tei:msIdentifier/tei:collection
      | //tei:teiHeader
    `,
  },
  // see ticket #15745
  // {
  //   description: 'Normdatenverweis',
  //   display: true,
  //   render: (props) => {
  //     const elem = props.node as Element
  //     return (
  //       <Tooltip
  //         tabIndex={0}
  //         title={elem.getAttributeNode('key')?.value || elem.getAttributeNode('ref')?.value || ''}
  //       >
  //         <span style={{ color: '#d65151' }}>
  //           {props?.children}
  //         </span>
  //       </Tooltip>
  //     )
  //   },
  //   xpath: '//*[@key] | //tei:persName[@ref]'
  // },
  {
    description: 'register',
    display: true,
    xpath:
      '//tei:msItem/tei:note[@type="register"] | //tei:msPart[@type="other"]/tei:p',
    render: (props) => {
      const elements = props.node as Element
      return <Register elements={elements} />
    },
  },
  {
    description: 'msPart',
    display: true,
    element: 'div',
    headline: {
      style: {
        color: '#000000',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '1.2px',
        lineHeight: '1',
        marginTop: '0px',
        marginBottom: '11px',
        textTransform: 'uppercase',
      },
      value: (node, tocEntryRule) => {
        return tocEntryRule?.tocEntry?.value(node, tocEntryRule)
      },
    },
    xpath: '//tei:msPart',
    tocEntry: {
      value: (node) => {
        const element = node as Element
        const partType = element.getAttribute('type')
        const partIdnos = evaluate(
          './tei:msIdentifier/tei:idno',
          node,
          nsResolver,
        ) as Element[]
        const partIdno = partIdnos.length > 0 && partIdnos[0].textContent
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
          case 'other':
            return partIdno || 'Sonstiges'
          default:
            return partType
        }
      },
    },
  },
  {
    description: 'msPart ausblenden',
    display: false,
    xpath: '//tei:msPart/tei:msIdentifier/tei:idno',
  },
  {
    description: 'Beschreibung äußeres',
    display: true,
    element: 'div',
    headline: {
      value: (node, rule) => {
        return rule?.tocEntry?.value(node, rule)
      },
    },
    xpath: '//tei:physDesc',
    style: {
      color: '#202020',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0px',
      marginBottom: '24px',
    },
    tocEntry: {
      value: () => 'Äußeres',
    },
  },
  {
    description: 'Äußeres (Kunst)',
    display: true,
    element: 'div',
    headline: {
      value: (node, rule) => {
        return rule?.tocEntry?.value(node, rule) || ''
      },
    },
    xpath: '//tei:decoNote[@type="form"]',
    style: {
      color: '#202020',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0px',
      marginBottom: '24px',
    },
    tocEntry: {
      value: () => 'Buchschmuck',
    },
  },
  {
    description: 'Inhalt (Text, Musik, Kunst)',
    display: true,
    element: 'div',
    headline: {
      value: (node) => {
        const element = node as Element
        const termElements = evaluate(
          'tei:ref[@type="locus"] | tei:ref[(starts-with(@type, "bezwrk[") and "].6922" = substring(@type, string-length(@type) - 6 + 1))] | tei:ref[@type="workTitle"]',
          node,
          nsResolver,
        ) as Element[]
        const title = termElements
          .map((termElement) => termElement.textContent)
          .join(', ')
        const type = getContentType(element.getAttribute('type'))
        return title ? `${title} ${type}` : type
      },
    },
    xpath:
      '//tei:msContents//tei:msItem/tei:note[@type="text" or @type="music"] | //tei:msContents/tei:msItem/tei:decoNote[@type="content"]',
    style: {
      color: '#202020',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0px',
      marginBottom: '16px',
    },
    tocEntry: {
      value: (node) => {
        const element = node as Element
        const termElements = evaluate(
          'tei:ref[@type="locus"] | tei:ref[(starts-with(@type, "bezwrk[") and "].6922" = substring(@type, string-length(@type) - 6 + 1))] | tei:ref[@type="workTitle"]',
          node,
          nsResolver,
        ) as Element[]
        const title = termElements
          .map((termElement) => termElement.textContent)
          .join(', ')
        const modifiedTitle = title
          ? substringFullWord(title, 47, ' ...') + ' '
          : ''
        const type = getContentType(element.getAttribute('type'))

        return `${modifiedTitle}${type}`
      },
    },
  },
  {
    description: 'Geschichte',
    display: true,
    element: 'div',
    headline: {
      value: (node, rule) => {
        return rule?.tocEntry?.value(node, rule)
      },
    },
    xpath: '//tei:history',
    style: {
      color: '#202020',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0px',
      marginBottom: '24px',
    },
    tocEntry: {
      value: () => {
        return 'Geschichte'
      },
    },
  },
  {
    description: 'Blockelemente',
    display: true,
    element: 'div',
    xpath:
      '//tei:additional | //tei:physDesc//tei:objectDesc | //tei:physDesc//tei:handDesc | //tei:physDesc//tei:decoDesc',
    style: {
      color: '#202020',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0px',
      marginBottom: '24px',
    },
  },
  {
    description: 'Identifikation, Scrollmarke für msDesc',
    display: true,
    element: 'p',
    headline: {
      display: false,
    },
    xpath: '//tei:msDesc/tei:msIdentifier',
    tocEntry: {
      value: (node) => {
        const identifierEl = node as Element
        const descEl = identifierEl.parentElement as Element
        const idnoSignatur = evaluate(
          '//tei:msDesc/tei:msIdentifier/tei:idno',
          descEl,
          nsResolver,
        ) as Element[]

        return idnoSignatur[0].textContent as string
      },
    },
  },
  {
    description: 'Kommas Identifikation',
    display: true,
    render: (props) => <>{props.children}, </>,
    xpath:
      '//tei:msDesc/tei:msIdentifier/tei:settlement | //tei:msDesc/tei:msIdentifier/tei:repository',
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
    element: 'div',
    xpath: '//tei:p',
    style: {
      color: '#202020',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0px',
      marginBottom: '24px',
    },
  },
  {
    description: 'msContents',
    display: true,
    element: 'div',
    headline: {
      value: (node, rule) => {
        return rule?.tocEntry?.value(node, rule)
      },
    },
    xpath: '//tei:msContents',
    tocEntry: {
      value: () => 'Inhalt',
    },
  },
  {
    description: 'msItem',
    display: true,
    element: 'div',
  },
  {
    description: 'Signatur',
    display: true,
    element: 'h1',
    xpath: '//tei:msDesc/tei:msIdentifier',
    style: {
      color: '#000000',
      fontWeight: 'normal',
      fontSize: '26px',
    },
  },
  {
    display: true,
    description: 'Titel unterhalb Signatur',
    element: 'p',
    xpath: '//tei:msDesc/tei:head/tei:title',
    style: {
      color: '#000000',
      fontWeight: 'normal',
      fontSize: '22px',
    },
  },
  {
    display: true,
    description: 'Schlagzeile unterhalb msDesc',
    element: 'p',
    xpath: '//tei:msDesc/tei:head/tei:note[@type="headline"]',
    style: {
      color: '#000000',
      fontSize: '16px',
      lineHeight: '1.25',
      marginTop: '0',
      marginBottom: '24px',
    },
  },
  {
    display: true,
    description: 'Schlagzeile unterhalb msPart / Zwischenüberschriften',
    element: 'p',
    xpath:
      '//tei:msPart/tei:head/tei:note[@type="caption" or @type="headline"]',
    style: {
      color: '#202020',
      fontSize: '16px',
      fontWeight: 'bold',
      lineHeight: '1',
      marginTop: '0px',
      marginBottom: '11px',
    },
  },
  {
    description: 'Anchor Ref',
    display: true,
    xpath: '//tei:ref[@target]',
    render: (props) => {
      const element = props.node as Element
      return (
        <ExternalReference element={element}>
          {props.children}
        </ExternalReference>
      )
    },
  },
  {
    description: 'Incipit',
    display: true,
    element: 'span',
    style: { fontStyle: 'italic' },
    xpath: '//tei:msdesc//tei:quote[@type = "incipit"]',
  },
  {
    description: 'Explizit',
    display: true,
    element: 'span',
    style: { fontStyle: 'italic' },
    xpath: '//tei:msdesc//tei:quote[@type = "explicit"]',
  },
  {
    description: 'Anderes Zitat',
    display: true,
    element: 'span',
    style: { fontStyle: 'italic' },
    xpath: '//tei:msdesc//tei:quote[not(@type)]',
  },
  // Temporarily unused bold styling for title and author, replaced with the two xpaths below
  // {
  //   description: 'Werkautor',
  //   display: true,
  //   element: 'span',
  //   style: { fontWeight: 'bold' },
  //   xpath: '//tei:rs[@type="person" and @role="aut"]',
  // },
  // {
  //   description: 'Werktitel',
  //   display: true,
  //   element: 'span',
  //   style: { fontWeight: 'bold' },
  //   xpath:
  //     '//tei:msItem/tei:note[@type="text"]/tei:title | //tei:msItem/tei:title',
  // },
  {
    description: 'Autor',
    display: true,
    element: 'span',
    style: { fontVariantCaps: 'small-caps' },
    xpath: '//tei:msdesc//tei:persName[@role="author"]',
  },
  {
    description: 'Werktitel',
    display: true,
    element: 'span',
    style: { fontVariantCaps: 'small-caps' },
    xpath: '//tei:msdesc//tei:title',
  },
  {
    description: 'Literatur (ToC-Eintrag)',
    display: true,
    element: 'div',
    headline: {
      value: (node, rule) => {
        return rule?.tocEntry?.value(node, rule)
      },
    },
    xpath: '//tei:additional',
    tocEntry: {
      value: () => {
        return 'Literatur'
      },
    },
  },
  {
    description: 'Initien',
    display: true,
    element: 'span',
    xpath: '//tei:ref[@type="initium"]',
    style: { fontStyle: 'italic' },
  },
  {
    description: 'Einstiegspunkt msdesc',
    display: true,
    element: 'div',
    style: {
      fontFamily: 'Junicode-2-Regular, Roboto',
      fontSize: '16px',
      color: '#202020',
    },
    xpath: '//tei:msDesc',
  },
  {
    description: 'Line breaks',
    display: true,
    // using "render" instead of "element" because React.createElement for <br/> can't be called with children in props
    render: () => <br />,
    xpath: '//tei:lb',
  },
  {
    description: 'Elemente ohne korrespondierende HTML-Tags',
    display: true,
    xpath: '/tei:TEI | /tei:TEI/tei:text | /tei:TEI/tei:text/tei:body',
  },
  {
    description: 'hochgestellte Zeichen',
    display: true,
    element: 'sup',
    xpath: '//tei:hi[@rend="sup"]',
  },
  {
    isDefaultRule: true,
    description: 'All elements display their childrens',
    display: true,
  },
  {
    description: 'Metadata',
    display: true,
    xpath: '//tei:TEI',
    metadata: (node) => {
      const teiEl = node as Element
      const fileDesc = teiEl.getElementsByTagName('fileDesc')?.item(0)
      const descEl = teiEl.getElementsByTagName('msDesc')?.item(0)
      const headEl = descEl?.getElementsByTagName('head')?.item(0)
      const msIdentifier = descEl?.getElementsByTagName('msIdentifier')?.item(0)
      if (headEl || msIdentifier || fileDesc) {
        const metadata: Record<string, string> = {}
        const authorCollection = fileDesc
          ?.getElementsByTagName('titleStmt')
          ?.item(0)
          ?.getElementsByTagName('persName')
        let authors = ''
        const authorsArray: any = []
        if (authorCollection) {
          for (let i = 0; i < authorCollection.length; i++) {
            if (authorCollection[0]?.getAttribute('role')?.includes('author')) {
              authorsArray.push(authorCollection[i].innerHTML)
            }
          }
          authors = authorsArray.join(', ')
        }
        const descId = descEl?.getAttribute('xml:id')
        const fileDescContent = fileDesc?.textContent
        const pubYear = fileDesc
          ?.getElementsByTagName('publicationStmt')
          ?.item(0)
          ?.querySelectorAll('[type="primary"]')
          ?.item(0)?.textContent
        if (authors) {
          metadata.authors = authors
        }
        if (descId) {
          metadata.descId = descId
        }
        if (fileDescContent) {
          metadata.fileDescContent = fileDescContent
        }
        if (pubYear) {
          metadata.pubYear = pubYear
        }
        if (Object.keys(metadata).length > 0) {
          return metadata
        }
      }
      return {}
    },
  },
]
