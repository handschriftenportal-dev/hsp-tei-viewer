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

import { TocItem } from '../../src/types'

export const toc: TocItem[] = [
  {
    id: 'a',
    label: 'A',
    children: [
      {
        id: 'a-a',
        label: 'A-A',
      },
      {
        id: 'a-b',
        label: 'A-B',
        children: [
          {
            id: 'a-b-a',
            label: 'A-B-A',
          },
          {
            id: 'a-b-b',
            label: 'A-B-B',
          },
        ]
      },
      {
        id: 'a-c',
        label: 'A-C',
      },
    ]
  },
  {
    id: 'b',
    label: 'B',
  },
  {
    id: 'c',
    label: 'C',
    children: [
      {
        id: 'c-a',
        label: 'C-A',
      },
      {
        id: 'c-b',
        label: 'C-B',
        children: [
          {
            id: 'c-b-a',
            label: 'C-B-A',
          },
        ]
      },
    ]
  },
]