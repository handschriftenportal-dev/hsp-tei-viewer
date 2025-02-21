import { render, screen } from '@testing-library/react'
import React from 'react'

import { HspViewer } from '../demo/HspViewer'

test('<HspViewer/> demo', function () {
  render(
    <HspViewer xml="<?xml version='1.0' encoding='UTF-8' standalone='yes'?><TEI><teiHeader><fileDesc><titleStmt><title>Beschreibungstitel</title></titleStmt></fileDesc></teiHeader></TEI>" />,
  )
  screen.getByText('Beschreibungstitel')
})

describe('Register', () => {
  it('Shows the term of the register, if it is nested', () => {
    render(
      <HspViewer
        xml="<?xml version='1.0' encoding='UTF-8' standalone='yes'?><TEI><msPart>content msPart 
      <note type='register'><p>
       <index indexName='Rezeption'>
         <term type='4100'>
          <persName key='1'>Livius, Titus</persName> 
         </term>  
        </index>  
      </p></note></msPart></TEI>"
      />,
    )
    screen.getByText(/Livius, Titus/)
  })
  it('Shows the terms of the register', () => {
    render(
      <HspViewer
        xml="<?xml version='1.0' encoding='UTF-8' standalone='yes'?><TEI><msPart>content msPart
       <note type='register'><p> 
        <index n='MXML-1' indexName='Abschrift'>
          <term type='6930gi'>De origine civitatis et legum Romanorum</term>
          <term type='6930gi'>Consilia de spuriorum successione</term>
        </index>
      </p></note></msPart></TEI>"
      />,
    )
    screen.getByText(/De origine civitatis et legum Romanorum/)
    screen.getByText(/Consilia de spuriorum successione/)
  })
})
