import '@testing-library/jest-dom'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducer'

import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import App from './App'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { mockHandlerForFetchUserRequest } from './testHelpers'

const requestHandlersToMock = [
  rest.get('/api/v1.0/user', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Unauthorized',
        message: 'mocked-authentication required',
      })
    )
  }),
  rest.post('/api/v1.0/tokens', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Unauthorized',
        message: 'mocked-authentication required',
      })
    )
  }),
]

/* Create an MSW "request-interception layer". */
const quasiServer = setupServer(...requestHandlersToMock)

describe('<App> + mocking of HTTP requests', () => {
  beforeAll(() => {
    /* Enable API mocking. */
    quasiServer.listen()
  })

  afterEach(() => {
    quasiServer.resetHandlers()
  })

  afterAll(() => {
    /* Disable API mocking. */
    quasiServer.close()
  })

  test('renders <Login> for an unauthenticated user', async () => {
    /* Arrange. */
    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    const history = createMemoryHistory()

    render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    )

    /* Act. */
    const loginAnchor = await screen.findByText('Login')
    fireEvent.click(loginAnchor)

    /* Assert. */
    let element

    element = screen.getByPlaceholderText('Enter email')
    expect(element).toBeInTheDocument()

    element = screen.getByPlaceholderText('Enter password')
    expect(element).toBeInTheDocument()
  })

  test('tbd', async () => {
    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    const history = createMemoryHistory()

    /* Act. */
    cleanup()

    render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    )

    /* Assert. */
    const loginAnchor = await screen.findByText('Login')
    fireEvent.click(loginAnchor)

    /* Act. */
    const emailInput = screen.getByPlaceholderText('Enter email')
    fireEvent.change(emailInput, {
      target: { value: 'mary.smith@protonmail.com' },
    })

    const passwordInput = screen.getByPlaceholderText('Enter password')
    fireEvent.change(passwordInput, {
      target: { value: '456' },
    })

    const loginButton = await screen.findByRole('button', {
      name: 'Login',
    })
    fireEvent.click(loginButton)

    const element = await screen.findByText('AUTHENTICATION FAILED')
    expect(element).toBeInTheDocument()
  })

  test('renders <Dashboard> for an authenticated user', async () => {
    /* Arrange. */
    quasiServer.use(rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest))

    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    const history = createMemoryHistory()

    /* Act. */
    render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    )

    /* Assert. */
    const personalizedGreeting = await screen.findByText(
      'Welcome, mocked-mary.smith@protonmail.com !'
    )
    expect(personalizedGreeting).toBeInTheDocument()
  })
})
