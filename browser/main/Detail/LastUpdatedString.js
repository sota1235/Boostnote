/**
 * @fileoverview Component for show updated date of the detail.
 */
import React, { PropTypes } from 'react'
import { getLastUpdated } from 'browser/lib/date-formatter'
import CSSModules from 'browser/lib/CSSModules'
import styles from './LastUpdatedString.styl'

const LastUpdatedString = ({ date }) => {
  let text = ''

  try {
    text = `Last updated at ${getLastUpdated(date)}`
  } catch (e) {
    text = ''
  }

  return (
    <p styleName='info-right-date'>{text}</p>
  )
}

LastUpdatedString.propTypes = {
  date: PropTypes.string,
}

export default CSSModules(LastUpdatedString, styles)
