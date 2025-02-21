import React from 'react'

import makeStyles from '@material-ui/core/styles/makeStyles'
import TreeItem from '@material-ui/lab/TreeItem'

const useStyles = makeStyles((theme) => ({
  content: {
    alignItems: 'flex-start',
    padding: '8px 16px 8px 0',
    width: 'auto',
  },
  group: {
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
  },
  label: {
    boxOrient: 'vertical',
    display: '-webkit-box',
    lineClamp: 2,
    overflow: 'hidden',
    paddingLeft: 0,
  },
  selected: {}, // needed for pseudo $selected class
  root: {
    '&$selected > $content $label': {
      backgroundColor: 'inherit',
      color: '#d65151',
    },
    '&:focus > $content': {
      backgroundColor: 'transparent',
    },
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:hover >$content $label, &:focus > $content $label, &$selected > $content $label, &$selected > $content $label:hover, &$selected:focus > $content $label':
      {
        backgroundColor: 'transparent',
      },
  },
}))

interface Props {
  id: string
  label: string
  children: React.ReactNode
}

export function TocItem(props: Props) {
  const cls = useStyles()

  return (
    <TreeItem
      nodeId={props.id}
      label={props.label}
      classes={{
        root: cls.root,
        content: cls.content,
        label: cls.label,
        group: cls.group,
        selected: cls.selected,
      }}
    >
      {props.children}
    </TreeItem>
  )
}
