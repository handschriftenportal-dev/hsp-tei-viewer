import React from 'react'
import ReactDom from 'react-dom'
import { HspViewer } from './HspViewer'

const loremIpsum = 'dist/lorem-ipsum-handschriftenbeschreibung.xml'
const registerExample = 'dist/register_example.xml'
ReactDom.render(<HspViewer url={registerExample}/>, document.getElementById('app'))
