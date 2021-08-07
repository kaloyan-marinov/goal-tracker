import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducer'
import App from './App'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { mockHandlerForMultipleFetchUserRequests } from './testHelpers'

describe('<App>', () => {
  test('renders <Landing> for an unauthenticated user', () => {
    /* Arrange. */
    quasiServer.use(
      rest.get('/api/v1.0/user', (req, res, ctx) => {
        return res.once(
          ctx.status(401),
          ctx.json({
            error: 'Unauthorized',
            message: 'mocked-authentication required',
          })
        )
      })
    )

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

const requestHandlersToMock = [
  rest.get('/api/v1.0/user', mockHandlerForMultipleFetchUserRequests),
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
    quasiServer.use(
      rest.get('/api/v1.0/user', (req, res, ctx) => {
        return res.once(
          ctx.status(401),
          ctx.json({
            error: 'Unauthorized',
            message: 'mocked-authentication required',
          })
        )
      })
    )

    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    render(
      <Provider store={realStore}>
        <App />
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

  test(
    'causes an alert to be rendered' +
      ' when an unauthenticated user attempts to log in via incorrect credentials',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', (req, res, ctx) => {
          return res.once(
            ctx.status(401),
            ctx.json({
              error: 'Unauthorized',
              message: 'mocked-authentication required',
            })
          )
        })
      )

      quasiServer.use(
        rest.get('/api/v1.0/tokens', (req, res, ctx) => {
          return res.once(
            ctx.status(401),
            ctx.json({
              error: 'Unauthorized',
              message: 'mocked-authentication required',
            })
          )
        })
      )

      const enhancer = applyMiddleware(thunkMiddleware)
      const realStore = createStore(rootReducer, enhancer)

      render(
        <Provider store={realStore}>
          <App />
        </Provider>
      )

      /* Act. */
      const loginButton = await screen.findByRole('button', {
        name: 'Login',
      })
      fireEvent.click(loginButton)

      /* Assert. */
      const alertElement = await screen.findByText('AUTHENTICATION FAILED')
      expect(alertElement).toBeInTheDocument()
    }
  )

  test('renders <Dashboard> for an authenticated user', async () => {
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
    const personalizedGreeting = await screen.findByText(
      'Welcome, mocked-mary.smith@protonmail.com !'
    )
    expect(personalizedGreeting).toBeInTheDocument()
  })
})
