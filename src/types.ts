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

import { CSSProperties, FC } from 'react'


export interface XNode extends Node {
  xpath: string
  rules?: Rule[]
}

export interface Rule {
  /**
   * XPath to target ELEMENTS. Text nodes will be ignored.
   */
  xpath?: string;
  /**
   * If true then the `xpath` prop will be ignored and the rule applies to all
   * nodes that are not adressed by other rules.
   */
  isDefaultRule?: boolean
  /**
   * no functional purpose, only for documentation and debugging purposes
   */
   description?: string;
   /**
   * if display is false, the entire branch below a node will not be displayed
   */
  display: boolean;
  /**
   * HTML element name to contain the child node renderings (element and text nodes)
   */
  element?: string;

  metadata?: (node: Node, locale?: string) => Record<string, string>
  /**
   * render a React element via function instead of a simple HTML element
   */
  render?: FC<{ node: Node; rule: Rule; }>
  /**
   * only relevant if element is given
   */
  style?: CSSProperties;
  /**
   * If present, this results in a toc entry with the return value as label
   */
  tocEntry?: (node: Node, locale?: string) => string;
}

export interface NsResolver {
  lookupNamespaceURI: (namespacePrefix: string | null) => string | null;
  lookupNamespacePrefix: (namespaceUri: string | null) => string | null
}

