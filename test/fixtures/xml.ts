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

import { Rule } from '../../src'

export const xmlString = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a>
  <b>
    <title>B1</title>
    <c>
    </c>
    <c>
      <e>
        <title>E1</title>
      </e>
      <!-- This is a comment -->
      <![CDATA[foo]]>
      <?foo bar?>
    </c>
    <c>
      <e>
        <title>E2</title>
        <f>
          <g>
            <title>G1</title>
          </g>
        </f>
      </e>
    </c>
    <d>
    </d>
  </b>
</a>
`

export const abcRules: Rule[] = [
  {
    display: true,
    xpath: '//b|//e|//g',
    tocEntry: (node) => {
      let title = ''
      if (node.hasChildNodes()) {
        node.childNodes.forEach((childNode) => {
          if (childNode.nodeType === Node.ELEMENT_NODE && childNode.nodeName === 'title') {
            title = childNode.textContent || ''
          }
        })
      }
      return title
    }
  },
  {
    display: true,
    element: 'div'
  }
]