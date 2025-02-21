import React from 'react'
import { useTranslation } from 'react-i18next'

import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Rule, XNode } from '../types'

function normalizePath(path: string) {
  return path.replace(/[^a-zA-Z0-9]/g, '_')
}

const useStyles = makeStyles((theme) => ({
  accordion: {
    margin: 'unset !important',
    wordBreak: 'break-word',
    hyphens: 'auto',
    padding: theme.spacing(1, 1, 0, 2),
  },
  accordionDetails: {
    display: 'unset',
    padding: 'unset',
  },
  accordionSummary: {
    padding: 'unset',
    minHeight: 'unset !important',
    '& .MuiAccordionSummary-content.Mui-expanded': {
      margin: 'unset',
    },
  },
  accordionSummaryText: {
    // from https://github.com/ProjectMirador/mirador/blob/master/src/config/settings.js#L117
    fontSize: '0.678rem',
    fontWeight: 500,
    letterSpacing: '0.166em',
    lineHeight: '2em',
    textTransform: 'uppercase',
  },
  typographyBody: { marginBottom: '.5em', marginLeft: '0px' },
}))

interface Props {
  xnode: XNode
  rule: Rule
  buttonProps?: any
}

export function MetadataItem(props: Props) {
  const { xnode, rule } = props
  const cls = useStyles()
  const { t } = useTranslation()

  if (!rule.metadata) {
    return null
  }

  const completeMetadata = rule.metadata(xnode)
  const { authors, descId, fileDescContent, pubYear } = completeMetadata
  const nPath = normalizePath(xnode.xpath)

  return (
    <div key={nPath}>
      <Accordion defaultExpanded={true} className={cls.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className={cls.accordionSummary}
        >
          <Typography variant="overline" className={cls.accordionSummaryText}>
            {t('teiViewerPlugin.window.title.default') || ''}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={cls.accordionDetails}>
          <Typography variant="h4" component="h5">
            <Typography component="dt" variant="subtitle2">
              {t('teiViewerPlugin.window.metadataContent.overview')}
            </Typography>
            <Typography
              className={cls.typographyBody}
              component="dd"
              variant="body1"
            >
              {descId}
            </Typography>
            <Typography component="dt" variant="subtitle2">
              {t('teiViewerPlugin.window.metadataContent.author')}
            </Typography>
            <Typography
              className={cls.typographyBody}
              component="dd"
              variant="body1"
            >
              {authors}
            </Typography>
            <Typography component="dt" variant="subtitle2">
              {t('teiViewerPlugin.window.metadataContent.publicationYear')}
            </Typography>
            <Typography
              className={cls.typographyBody}
              component="dd"
              variant="body1"
            >
              {pubYear}
            </Typography>
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={false} className={cls.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className={cls.accordionSummary}
        >
          <Typography variant="overline" className={cls.accordionSummaryText}>
            {t('teiViewerPlugin.window.metadataContent.fileDesc') || ''}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={cls.accordionDetails}>
          <Typography variant="body1">{fileDescContent.trim()}</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}
