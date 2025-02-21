import { addXpaths } from '../../src/context/Viewer'

import { xmlString } from '../fixtures/xml'

const doc = new DOMParser().parseFromString(xmlString, 'text/xml')

describe('addXpaths', function () {
  it('does not fail for comments', function () {
    addXpaths(doc.firstElementChild as Element, '', 0, {
      lookupNamespacePrefix: () => '',
      lookupNamespaceURI: () => '',
    })
  })
})
