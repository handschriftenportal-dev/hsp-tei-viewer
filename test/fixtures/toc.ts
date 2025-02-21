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
        ],
      },
      {
        id: 'a-c',
        label: 'A-C',
      },
    ],
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
        ],
      },
    ],
  },
]
