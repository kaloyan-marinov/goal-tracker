import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from '../../reducer'
import Landing from './Landing'
import store from '../../store'
import { createMemoryHistory } from 'history'
import { Router, Route } from 'react-router-dom'

test('renders for an unauthenticated user', () => {
  /* Arrange. */
  const enhancer = applyMiddleware(thunkMiddleware)
  const realStore = createStore(rootReducer, enhancer)

  /* Act. */
  render(
    <Provider store={realStore}>
      <Landing />
    </Provider>
  )

  /* Assert. */
  const headingElement = screen.getByText('WELCOME TO GoalTracker')
  expect(headingElement).toBeInTheDocument()

  const paragraphElement = screen.getByText(
    'Start keeping track of how much time you spend in pursuit of your goals!'
  )
  expect(paragraphElement).toBeInTheDocument()
})

test('renders for an authenticated user', () => {
  /* Arrange. */
  const initSt = {
    ...store.getState(),
    auth: {
      ...store.getState().auth,
      isAuthenticated: true,
    },
  }
  const enhancer = applyMiddleware(thunkMiddleware)
  const realStore = createStore(rootReducer, initSt, enhancer)

  const history = createMemoryHistory()

  /* Act. */
  render(
    <Provider store={realStore}>
      <Router history={history}>
        <Route exact path="/">
          <Landing />
        </Route>
        <Route exact path="/dashboard">
          <div>This is a placeholder for the [Dashboard] component.</div>
        </Route>
      </Router>
    </Provider>
  )

  /* Assert. */
  const divElement = screen.getByText(
    'This is a placeholder for the [Dashboard] component.'
  )
  expect(divElement).toBeInTheDocument()
})
