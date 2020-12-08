import rootReducer from './reducer'
import { applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createStore } from 'redux'

import thunkMiddleware from 'redux-thunk'

const composedEnhancer = composeWithDevTools(
  /* Add whatever middleware you actually want to use here */
  applyMiddleware(thunkMiddleware)
  /* other store enhancers if any */
)

const store = createStore(rootReducer, composedEnhancer)

export default store
