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
    tocEntry: {
      value: (node) => {
        let title = ''
        if (node.hasChildNodes()) {
          node.childNodes.forEach((childNode) => {
            if (
              childNode.nodeType === Node.ELEMENT_NODE &&
              childNode.nodeName === 'title'
            ) {
              title = childNode.textContent || ''
            }
          })
        }
        return title
      },
    },
  },
  {
    display: true,
    element: 'div',
  },
]
