import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './InfoTab.styl'

const electron = require('electron')
const { shell, remote } = electron
const appVersion = remote.app.getVersion()

class InfoTab extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  handleLinkClick (e) {
    shell.openExternal(e.currentTarget.href)
    e.preventDefault()
  }

  render () {
    return (
      <div styleName='root'>
        <div styleName='header'>Info</div>

        <div styleName='top'>
          <div styleName='icon-space'>
            <img styleName='icon' src='../resources/app.png' width='92' height='92'/>
            <div styleName='icon-right'>
              <div styleName='appId'>Boostnote {appVersion}</div>
              <div styleName='description'>
                A simple markdown/snippet note app for developer.
              </div>
            </div>
          </div>
          <div styleName='clear'></div>
          <div styleName='madeBy'>Made by&nbsp;
            <a href='http://maisin.co/'
              onClick={(e) => this.handleLinkClick(e)}
            >MAISIN&CO.</a></div>
          <div styleName='copyright'>Copyright 2016 MAISIN&CO. All rights reserved.</div>
        </div>
        <ul styleName='list'>
          <li>
            The codes of this app is published under GPLv3 license.
          </li>
          <li>
            Any kinds of feedback, creating a new issue or a pull request, would be welcomed.
          </li>
          <li>
            Issue Tracker : <a href='https://github.com/BoostIO/Boostnote/issues'
              onClick={(e) => this.handleLinkClick(e)}
            >https://github.com/BoostIO/Boostnote/issues</a>
          </li>
        </ul>
      </div>
    )
  }
}

InfoTab.propTypes = {
}

export default CSSModules(InfoTab, styles)
