import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducer'
import App from './App'

describe('<App>', () => {
  test("renders a 'Hello world!' message", () => {
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
    const divElement = screen.getByText('Hello world!')
    console.log(divElement)
    expect(divElement).toBeInTheDocument()
  })
})
