import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './FolderSelect.styl'
import _ from 'lodash'

class FolderSelect extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      status: 'IDLE',
      search: '',
      optionIndex: -1
    }
  }

  componentDidMount () {
    this.value = this.props.value
  }

  componentDidUpdate () {
    this.value = this.props.value
  }

  handleClick (e) {
    this.setState({
      status: 'SEARCH',
      optionIndex: -1
    }, () => {
      this.refs.search.focus()
    })
  }

  handleFocus (e) {
    if (this.state.status === 'IDLE') {
      this.setState({
        status: 'FOCUS'
      })
    }
  }

  handleBlur (e) {
    if (this.state.status === 'FOCUS') {
      this.setState({
        status: 'IDLE'
      })
    }
  }

  handleKeyDown (e) {
    switch (e.keyCode) {
      case 13:
        if (this.state.status === 'FOCUS') {
          this.setState({
            status: 'SEARCH',
            optionIndex: -1
          }, () => {
            this.refs.search.focus()
          })
        }
        break
      case 40:
      case 38:
        if (this.state.status === 'FOCUS') {
          this.setState({
            status: 'SEARCH',
            optionIndex: 0
          }, () => {
            this.refs.search.focus()
          })
        }
        break
      case 9:
        if (e.shiftKey) {
          e.preventDefault()
          let tabbable = document.querySelectorAll('a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])')
          let previousEl = tabbable[Array.prototype.indexOf.call(tabbable, this.refs.root) - 1]
          if (previousEl != null) previousEl.focus()
        }
    }
  }

  handleSearchInputBlur (e) {
    if (e.relatedTarget !== this.refs.root) {
      this.setState({
        status: 'IDLE'
      })
    }
  }

  handleSearchInputChange (e) {
    let { folders } = this.props
    let search = this.refs.search.value
    let optionIndex = search.length > 0
      ? _.findIndex(folders, (folder) => {
        return folder.name.match(new RegExp('^' + _.escapeRegExp(search), 'i'))
      })
      : -1

    this.setState({
      search: this.refs.search.value,
      optionIndex: optionIndex
    })
  }

  handleSearchInputKeyDown (e) {
    switch (e.keyCode) {
      case 40:
        e.stopPropagation()
        this.nextOption()
        break
      case 38:
        e.stopPropagation()
        this.previousOption()
        break
      case 13:
        e.stopPropagation()
        this.selectOption()
        break
      case 27:
        e.stopPropagation()
        this.setState({
          status: 'FOCUS'
        }, () => {
          this.refs.root.focus()
        })
    }
  }

  nextOption () {
    let { storages } = this.props
    let { optionIndex } = this.state

    optionIndex++
    if (optionIndex >= folders.length) optionIndex = 0

    this.setState({
      optionIndex
    })
  }

  previousOption () {
    let { folders } = this.props
    let { optionIndex } = this.state

    optionIndex--
    if (optionIndex < 0) optionIndex = folders.length - 1

    this.setState({
      optionIndex
    })
  }

  selectOption () {
    let { folders } = this.props
    let optionIndex = this.state.optionIndex

    let folder = folders[optionIndex]
    if (folder != null) {
      this.setState({
        status: 'FOCUS'
      }, () => {
        this.setValue(folder.key)
        this.refs.root.focus()
      })
    }
  }

  handleOptionClick (storageKey, folderKey) {
    return (e) => {
      e.stopPropagation()
      this.setState({
        status: 'FOCUS'
      }, () => {
        this.setValue(storageKey + '-' + folderKey)
        this.refs.root.focus()
      })
    }
  }

  setValue (value) {
    this.value = value
    this.props.onChange()
  }

  render () {
    let { className, data, value } = this.props
    let splitted = value.split('-')
    let storageKey = splitted.shift()
    let folderKey = splitted.shift()
    let options = []
    data.storageMap.forEach((storage, index) => {
      storage.folders.forEach((folder) => {
        options.push({
          storage: storage,
          folder: folder
        })
      })
    })

    let currentOption = options.filter((option) => option.storage.key === storageKey && option.folder.key === folderKey)[0]

    if (this.state.search.trim().length > 0) {
      let filter = new RegExp('^' + _.escapeRegExp(this.state.search), 'i')
      options = options.filter((option) => filter.test(option.folder.name))
    }

    let optionList = options
      .map((option, index) => {
        return (
          <div styleName={index === this.state.optionIndex
              ? 'search-optionList-item--active'
              : 'search-optionList-item'
            }
            key={option.storage.key + '-' + option.folder.key}
            onClick={(e) => this.handleOptionClick(option.storage.key, option.folder.key)(e)}
          >
            <span styleName='search-optionList-item-name'
              style={{borderColor: option.folder.color}}
            >
              {option.folder.name}
              <span styleName='search-optionList-item-name-surfix'>in {option.storage.name}</span>
            </span>
          </div>
        )
      })

    return (
      <div className={_.isString(className)
          ? 'FolderSelect ' + className
          : 'FolderSelect'
        }
        styleName={this.state.status === 'SEARCH'
          ? 'root--search'
          : this.state.status === 'FOCUS'
          ? 'root--focus'
          : 'root'
        }
        ref='root'
        tabIndex='0'
        onClick={(e) => this.handleClick(e)}
        onFocus={(e) => this.handleFocus(e)}
        onBlur={(e) => this.handleBlur(e)}
        onKeyDown={(e) => this.handleKeyDown(e)}
      >
        {this.state.status === 'SEARCH'
          ? <div styleName='search'>
            <input styleName='search-input'
              ref='search'
              value={this.state.search}
              placeholder='Folder...'
              onChange={(e) => this.handleSearchInputChange(e)}
              onBlur={(e) => this.handleSearchInputBlur(e)}
              onKeyDown={(e) => this.handleSearchInputKeyDown(e)}
            />
            <div styleName='search-optionList'
              ref='optionList'
            >
              {optionList}
            </div>
          </div>
          : <div styleName='idle'>
            <div styleName='idle-label'>
              <span styleName='idle-label-name'
                style={{borderColor: currentOption.folder.color}}
              >
                {currentOption.folder.name}
                <span styleName='idle-label-name-surfix'>in {currentOption.storage.name}</span>
              </span>
            </div>
            <i styleName='idle-caret' className='fa fa-fw fa-caret-down'/>
          </div>
        }

      </div>
    )
  }
}

FolderSelect.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  folders: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    name: PropTypes.string,
    color: PropTypes.string
  }))
}

export default CSSModules(FolderSelect, styles)
