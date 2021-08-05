import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducer'
import App from './App'
import { expect } from '@jest/globals'

describe('<App>', () => {
  test("renders a 'WELCOME TO GoalTracker' message", () => {
    /* Arrange. */
    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    /* Act. */
    render(
      <Provider store={realStore}>
        <App />
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
})
