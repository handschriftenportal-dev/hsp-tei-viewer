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

import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { XNode, Rule } from '../types'


function normalizePath(path: string) {
  return path.replace(/[^a-zA-Z0-9]/g, '_')
}

const useStyles = makeStyles((theme) => ({
  section: {
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
  }
}))

interface Props {
  xnode: XNode
  rule: Rule
}

export function MetadataItem(props: Props) {
  const { xnode, rule } = props
  const cls = useStyles()

  if (!rule.metadata) {
    return null
  }

  const metadata = rule.metadata(xnode)
  const tocLabel = rule.tocEntry?.(xnode)
  const nPath = normalizePath(xnode.xpath)

  return (
    <Paper
      className={cls.section}
      key={nPath}
    >
      <Typography
        variant="h4"
        component="h5"
      >
        {tocLabel}
      </Typography>
      <dl>
        {
          Object.keys(metadata).map(key => ([
            (
              <Typography
                component="dt"
                key={`label-${nPath}-${key}`}
                variant='subtitle2'
              >
                {key}
              </Typography>
            ),
            (
                <Typography
                style={{ marginBottom: '.5em', marginLeft: '0px' }}
                component="dd"
                key={`value-${nPath}-${key}`}
                variant="body1"
              >
                { metadata[key] }
              </Typography>
            )
          ]))
        }
      </dl>
    </Paper>
  )
}
