/**
 * @fileoverview Filter for all notes.
 */
import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './SideNavFilter.styl'

/**
 * @param {boolean} isHomeActive
 * @param {Function} handleAllNotesButtonClick
 * @param {boolean} isStarredActive
 * @param {Function} handleStarredButtonClick
 * @return {React.Component}
 */
const SideNavFilter = ({
  isHomeActive, handleAllNotesButtonClick, isStarredActive, handleStarredButtonClick
}) => (
  <div styleName='menu'>
    <button styleName={isHomeActive ? 'menu-button--active' : 'menu-button'}
      onClick={handleAllNotesButtonClick}
    >
      <i className='fa fa-book fa-fw'/>
      <span styleName='menu-button-label'>All Notes</span>
    </button>
    <button styleName={isStarredActive ? 'menu-button--active' : 'menu-button'}
      onClick={handleStarredButtonClick}
    >
      <i className='fa fa-star fa-fw'/>
      <span styleName='menu-button-label'>Starred</span>
    </button>
  </div>
)

SideNavFilter.propTypes = {
  isHomeActive: PropTypes.bool.isRequired,
  handleAllNotesButtonClick: PropTypes.func.isRequired,
  isStarredActive: PropTypes.bool.isRequired,
  handleStarredButtonClick: PropTypes.func.isRequired,
}

export default CSSModules(SideNavFilter, styles)
