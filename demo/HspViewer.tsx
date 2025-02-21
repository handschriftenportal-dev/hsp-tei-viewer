import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core'
import {
  ViewerStateProvider,
  Viewer,
  Metadata,
  TableOfContents,
  Text,
  NsResolver,
  hspRules,
  SearchControl,
} from '../src/'

const nsResolver: NsResolver = {
  lookupNamespaceURI: function (prefix: string | null) {
    return 'http://www.tei-c.org/ns/1.0'
  },
  lookupNamespacePrefix: function (uri: string | null) {
    if (uri === 'http://www.tei-c.org/ns/1.0') {
      return 'tei'
    }
    return null
  },
}

const useStyles = makeStyles((theme) => ({
  searchMatch: {
    backgroundColor: theme.palette.grey[500],
  },
  focusedMatch: {
    backgroundColor: theme.palette.primary.main,
  },
  root: {
    height: 500,
    maxHeight: 500,
    overflowY: 'scroll',
    scrollBehavior: 'smooth'
  },
}))

interface HspViewerProps {
  url?: string;
  xml?: string;
}

/**
 * This component function serves as an example how to include the viewer's components
 * into an app.
 * - The app has to provide a namespace resolver, a xml root element and a rule configuration.
 * - The app has to handle the fundamental layout.
 * - TODO: a theme should be passed (or the viewer just uses the apps theme provider)
 * @param props Either a URL or a XML as string.
 * @returns example viewer
 */
export function HspViewer(props: HspViewerProps) {
  const [root, setRoot] = useState<Node | undefined>(undefined)
  const { url, xml } = props
  const classes = useStyles()

  useEffect(() => {
    if (url) {
      fetch(url)
        .then(resp => resp.text())
        .then(fetchedXml => {
          const doc = new DOMParser().parseFromString(fetchedXml, 'text/xml')
          setRoot(doc.firstElementChild as Node)
        })
    } else if (xml) {
      const doc = new DOMParser().parseFromString(xml, 'text/xml')
      setRoot(doc.firstElementChild as Node)
    } else {
      console.warn('Neither URL nor XML content has been provided for HspViewer.')
    }
  }, [url, xml])

  if (!root) {
    return null
  }

  return (
    root
      ? <div style={{ fontSize: '10pt', display: 'flex', height: '100%' }}>
        <ViewerStateProvider>
          <Viewer root={root} nsResolver={nsResolver} rules={hspRules} viewerId="abc">
            <div style={{ display: 'flex', width: '250px', flexShrink: 0, flexDirection: 'column' }}>
              <SearchControl />
              <TableOfContents />
              <Metadata />
            </div>
            <div style={{ display: 'flex', marginLeft: '0px', flexDirection: 'column' }}>
              <Text classes={classes} />
            </div>
          </Viewer>
        </ViewerStateProvider>
      </div>
      : null
  )
}