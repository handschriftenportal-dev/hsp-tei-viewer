import { decodeXML } from 'entities'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { hidaTypes } from '../utils/hidaTypes'

const useStyles = makeStyles((theme) => ({
  accordion: {
    marginBottom: theme.spacing(0.5),
  },
  accordionDetails: {
    flexDirection: 'column',
  },
  accordionSummary: { fontFamily: theme.typography.fontFamily },
  details: {
    fontFamily: 'Junicode-2-Regular',
  },
  register: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
}))

interface RegisterElementProps {
  taggedElements: Element
}

function RegisterElement(props: Readonly<RegisterElementProps>) {
  const cls = useStyles()
  const { taggedElements } = props

  const type = taggedElements.getAttribute('type') ?? ''
  const details = taggedElements.children[0]
    ? decodeXML(taggedElements.children[0].innerHTML)
    : decodeXML(taggedElements.innerHTML)

  return (
    <AccordionDetails className={cls.accordionDetails}>
      <Typography>{hidaTypes[type]}:</Typography>
      <Typography className={cls.details}>{details}</Typography>
    </AccordionDetails>
  )
}

interface Props {
  elements: Element
}

export function Register(props: Readonly<Props>) {
  const cls = useStyles()
  const { elements } = props
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasMarkedElement = document.querySelector('mark') !== null
      setIsExpanded(hasMarkedElement)
    })

    observer.observe(document, { subtree: true, childList: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  const tagElements = elements.getElementsByTagName('term')

  return (
    <Box id="register" className={cls.register}>
      <Accordion
        className={cls.accordion}
        expanded={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
      >
        <AccordionSummary
          className={cls.accordionSummary}
          expandIcon={<ExpandMoreIcon />}
          id="registerEntry"
        >
          {t('teiViewerPlugin.registerData')}
        </AccordionSummary>
        {Array.from(tagElements).map((taggedElem, index) => {
          return <RegisterElement key={index} taggedElements={taggedElem} />
        })}
      </Accordion>
    </Box>
  )
}
