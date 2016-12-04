import { combineReducers, createStore, applyMiddleware } from 'redux'
import middlewares from '../middlewares/index'
import { routerReducer } from 'react-router-redux'
import { DEFAULT_CONFIG } from 'browser/main/lib/ConfigManager'

let defaultData = {
  storageMap: {},
  noteMap: {},
  starredSet: [],
  storageNoteMap: {},
  folderNoteMap: {},
  tagNoteMap: {}
}

function data (state = defaultData, action) {
  switch (action.type) {
    case 'THROTTLE_DATA':
      console.log(action)
      state = action.data
  }
  return state
}

function config (state = DEFAULT_CONFIG, action) {
  switch (action.type) {
    case 'INIT_CONFIG':
    case 'SET_CONFIG':
      return Object.assign({}, state, action.config)
    case 'SET_IS_SIDENAV_FOLDED':
      state.isSideNavFolded = action.isFolded
      return Object.assign({}, state)
    case 'SET_ZOOM':
      state.zoom = action.zoom
      return Object.assign({}, state)
    case 'SET_LIST_WIDTH':
      state.listWidth = action.listWidth
      return Object.assign({}, state)
    case 'SET_UI':
      return Object.assign({}, state, action.config)
  }
  return state
}

let reducer = combineReducers({
  data,
  config,
  routing: routerReducer
})

let store = createStore(reducer, applyMiddleware(...middlewares))

export default store
