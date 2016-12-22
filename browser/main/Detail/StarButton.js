import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './StarButton.styl'
import _ from 'lodash'

class StarButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isActive: false
    }
  }

  handleMouseDown (e) {
    this.setState({
      isActive: true
    })
  }

  handleMouseUp (e) {
    this.setState({
      isActive: false
    })
  }

  handleMouseLeave (e) {
    this.setState({
      isActive: false
    })
  }

  render () {
    let { className } = this.props

    return (
      <button className={_.isString(className)
          ? 'StarButton ' + className
          : 'StarButton'
        }
        styleName={this.state.isActive || this.props.isActive
          ? 'root--active'
          : 'root'
        }
        onMouseDown={(e) => this.handleMouseDown(e)}
        onMouseUp={(e) => this.handleMouseUp(e)}
        onMouseLeave={(e) => this.handleMouseLeave(e)}
        onClick={this.props.onClick}
      >
        <i styleName='icon'
          className={this.state.isActive || this.props.isActive
            ? 'fa fa-star'
            : 'fa fa-star-o'
          }
        />
      </button>
    )
  }
}

StarButton.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
}

export default CSSModules(StarButton, styles)
