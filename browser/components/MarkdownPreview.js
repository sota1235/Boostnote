import React, { PropTypes } from 'react'
import markdown from 'browser/lib/markdown'
import _ from 'lodash'
import CodeMirror from 'codemirror'
import consts from 'browser/lib/consts'
import Raphael from 'raphael'
import flowchart from 'flowchart'
import SequenceDiagram from 'js-sequence-diagrams'

function decodeHTMLEntities (text) {
  var entities = [
    ['apos', '\''],
    ['amp', '&'],
    ['lt', '<'],
    ['gt', '>']
  ]

  for (var i = 0, max = entities.length; i < max; ++i) {
    text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1])
  }

  return text
}

const { remote } = require('electron')
const { app } = remote
const path = require('path')

const markdownStyle = require('!!css!stylus?sourceMap!./markdown.styl')[0][1]
const appPath = 'file://' + (process.env.NODE_ENV === 'production'
  ? app.getAppPath()
  : path.resolve())

function buildStyle (fontFamily, fontSize, codeBlockFontFamily, lineNumber) {
  return `
@font-face {
  font-family: 'Lato';
  src: url('${appPath}/resources/fonts/Lato-Regular.woff2') format('woff2'), /* Modern Browsers */
       url('${appPath}/resources/fonts/Lato-Regular.woff') format('woff'), /* Modern Browsers */
       url('${appPath}/resources/fonts/Lato-Regular.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
  text-rendering: optimizeLegibility;
}
${markdownStyle}
body {
  font-family: ${fontFamily.join(', ')};
  font-size: ${fontSize}px;
}
code {
  font-family: ${codeBlockFontFamily.join(', ')};
}
.lineNumber {
  ${lineNumber && 'display: block !important;'}
  font-family: ${codeBlockFontFamily.join(', ')};
}

h1, h2, h3, h4 {
  border: none;
}
`
}

const { shell } = require('electron')
const OSX = global.process.platform === 'darwin'

const defaultFontFamily = ['helvetica', 'arial', 'sans-serif']
if (!OSX) {
  defaultFontFamily.unshift('\'Microsoft YaHei\'')
  defaultFontFamily.unshift('meiryo')
}
const defaultCodeBlockFontFamily = ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', 'monospace']

export default class MarkdownPreview extends React.Component {
  constructor (props) {
    super(props)

    this.contextMenuHandler = (e) => this.handleContextMenu(e)
    this.mouseDownHandler = (e) => this.handleMouseDown(e)
    this.mouseUpHandler = (e) => this.handleMouseUp(e)
    this.anchorClickHandler = (e) => this.handlePreviewAnchorClick(e)
    this.checkboxClickHandler = (e) => this.handleCheckboxClick(e)
  }

  handlePreviewAnchorClick (e) {
    e.preventDefault()
    e.stopPropagation()

    let anchor = e.target.closest('a')
    let href = anchor.getAttribute('href')
    if (_.isString(href) && href.match(/^#/)) {
      let targetElement = this.refs.root.contentWindow.document.getElementById(href.substring(1, href.length))
      if (targetElement != null) {
        this.getWindow().scrollTo(0, targetElement.offsetTop)
      }
    } else {
      shell.openExternal(href)
    }
  }

  handleCheckboxClick (e) {
    this.props.onCheckboxClick(e)
  }

  handleContextMenu (e) {
    this.props.onContextMenu(e)
  }

  handleMouseDown (e) {
    if (e.target != null) {
      switch (e.target.tagName) {
        case 'A':
        case 'INPUT':
          return null
      }
    }
    if (this.props.onMouseDown != null) this.props.onMouseDown(e)
  }

  handleMouseUp (e) {
    if (e.target != null && e.target.tagName === 'A') {
      return null
    }
    if (this.props.onMouseUp != null) this.props.onMouseUp(e)
  }

  componentDidMount () {
    this.refs.root.setAttribute('sandbox', 'allow-scripts')
    this.refs.root.contentWindow.document.body.addEventListener('contextmenu', this.contextMenuHandler)

    this.refs.root.contentWindow.document.head.innerHTML = `
      <style id='style'></style>
      <link rel="stylesheet" href="${appPath}/compiled/katex-style.css">
      <link rel="stylesheet" href="${appPath}/node_modules/codemirror/lib/codemirror.css">
      <link rel="stylesheet" id="codeTheme">
    `
    this.rewriteIframe()
    this.applyStyle()

    this.refs.root.contentWindow.document.addEventListener('mousedown', this.mouseDownHandler)
    this.refs.root.contentWindow.document.addEventListener('mouseup', this.mouseUpHandler)
  }

  componentWillUnmount () {
    this.refs.root.contentWindow.document.body.removeEventListener('contextmenu', this.contextMenuHandler)
    this.refs.root.contentWindow.document.removeEventListener('mousedown', this.mouseDownHandler)
    this.refs.root.contentWindow.document.removeEventListener('mouseup', this.mouseUpHandler)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value !== this.props.value) this.rewriteIframe()
    if (prevProps.fontFamily !== this.props.fontFamily ||
      prevProps.fontSize !== this.props.fontSize ||
      prevProps.codeBlockFontFamily !== this.props.codeBlockFontFamily ||
      prevProps.codeBlockTheme !== this.props.codeBlockTheme ||
      prevProps.lineNumber !== this.props.lineNumber ||
      prevProps.theme !== this.props.theme) {
      this.applyStyle()
      this.rewriteIframe()
    }
  }

  applyStyle () {
    let { fontFamily, fontSize, codeBlockFontFamily, lineNumber, codeBlockTheme } = this.props
    fontFamily = _.isString(fontFamily) && fontFamily.trim().length > 0
      ? [fontFamily].concat(defaultFontFamily)
      : defaultFontFamily
    codeBlockFontFamily = _.isString(codeBlockFontFamily) && codeBlockFontFamily.trim().length > 0
      ? [codeBlockFontFamily].concat(defaultCodeBlockFontFamily)
      : defaultCodeBlockFontFamily

    this.setCodeTheme(codeBlockTheme)
    this.getWindow().document.getElementById('style').innerHTML = buildStyle(fontFamily, fontSize, codeBlockFontFamily, lineNumber, codeBlockTheme, lineNumber)
  }

  setCodeTheme (theme) {
    theme = consts.THEMES.some((_theme) => _theme === theme)
      ? theme
      : 'default'
    this.getWindow().document.getElementById('codeTheme').href = `${appPath}/node_modules/codemirror/theme/${theme}.css`
  }

  rewriteIframe () {
    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('a'), (el) => {
      el.removeEventListener('click', this.anchorClickHandler)
    })
    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('input[type="checkbox"]'), (el) => {
      el.removeEventListener('click', this.checkboxClickHandler)
    })

    let { value, theme, indentSize, codeBlockTheme } = this.props

    this.refs.root.contentWindow.document.body.setAttribute('data-theme', theme)
    this.refs.root.contentWindow.document.body.innerHTML = markdown.render(value)

    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('a'), (el) => {
      el.addEventListener('click', this.anchorClickHandler)
    })

    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('input[type="checkbox"]'), (el) => {
      el.addEventListener('click', this.checkboxClickHandler)
    })

    codeBlockTheme = consts.THEMES.some((_theme) => _theme === codeBlockTheme)
      ? codeBlockTheme
      : 'default'

    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('.code code'), (el) => {
      let syntax = CodeMirror.findModeByName(el.className)
      if (syntax == null) syntax = CodeMirror.findModeByName('Plain Text')
      CodeMirror.requireMode(syntax.mode, () => {
        let content = el.innerHTML
        el.innerHTML = ''
        el.parentNode.className += ` cm-s-${codeBlockTheme} CodeMirror`
        CodeMirror.runMode(content, syntax.mime, el, {
          tabSize: indentSize
        })
      })
    })
    let opts = {}
    // if (this.props.theme === 'dark') {
    //   opts['font-color'] = '#DDD'
    //   opts['line-color'] = '#DDD'
    //   opts['element-color'] = '#DDD'
    //   opts['fill'] = '#3A404C'
    // }
    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('.flowchart'), (el) => {
      Raphael.setWindow(this.getWindow())
      try {
        let diagram = flowchart.parse(decodeHTMLEntities(el.innerHTML))
        el.innerHTML = ''
        diagram.drawSVG(el, opts)
        _.forEach(el.querySelectorAll('a'), (el) => {
          el.addEventListener('click', this.anchorClickHandler)
        })
      } catch (e) {
        console.error(e)
        el.className = 'flowchart-error'
        el.innerHTML = 'Flowchart parse error: ' + e.message
      }
    })

    _.forEach(this.refs.root.contentWindow.document.querySelectorAll('.sequence'), (el) => {
      Raphael.setWindow(this.getWindow())
      try {
        let diagram = SequenceDiagram.parse(decodeHTMLEntities(el.innerHTML))
        el.innerHTML = ''
        diagram.drawSVG(el, {theme: 'simple'})
        _.forEach(el.querySelectorAll('a'), (el) => {
          el.addEventListener('click', this.anchorClickHandler)
        })
      } catch (e) {
        console.error(e)
        el.className = 'sequence-error'
        el.innerHTML = 'Sequence diagram parse error: ' + e.message
      }
    })
  }

  focus () {
    this.refs.root.focus()
  }

  getWindow () {
    return this.refs.root.contentWindow
  }

  scrollTo (targetRow) {
    let blocks = this.getWindow().document.querySelectorAll('body>[data-line]')

    for (let index = 0; index < blocks.length; index++) {
      let block = blocks[index]
      let row = parseInt(block.getAttribute('data-line'))
      if (row > targetRow || index === blocks.length - 1) {
        block = blocks[index - 1]
        block != null && this.getWindow().scrollTo(0, block.offsetTop)
        break
      }
    }
  }

  render () {
    let { className, style, tabIndex } = this.props
    return (
      <iframe className={className != null
          ? 'MarkdownPreview ' + className
          : 'MarkdownPreview'
        }
        style={style}
        tabIndex={tabIndex}
        ref='root'
      />
    )
  }
}

MarkdownPreview.propTypes = {
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseDown: PropTypes.func,
  className: PropTypes.string,
  value: PropTypes.string
}
