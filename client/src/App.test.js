import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducer'

import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import App from './App'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  mockHandlerForCreateUserRequest,
  mockHandlerForFetchUserRequest,
  mockHandlerForIssueJWSTokenRequest,
} from './testHelpers'

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

  test(
    'renders <Login> for an unauthenticated user,' +
      ' and then renders an <Alert>' +
      ' if the login form is submitted with incorrect credentials',
    async () => {
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

      const loginButton = screen.getByRole('button', {
        name: 'Login',
      })
      fireEvent.click(loginButton)

      /* Assert. */
      const element = await screen.findByText('AUTHENTICATION FAILED')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    'renders <Login> for an unauthenticated user,' +
      ' from where the user can log in',
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
        }),
        rest.post('/api/v1.0/tokens', mockHandlerForIssueJWSTokenRequest),
        rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest)
      )

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

      const loginAnchor = await screen.findByText('Login')
      fireEvent.click(loginAnchor)

      const emailInput = screen.getByPlaceholderText('Enter email')
      fireEvent.change(emailInput, {
        target: { value: 'mary.smith@protonmail.com' },
      })

      const passwordInput = screen.getByPlaceholderText('Enter password')
      fireEvent.change(passwordInput, {
        target: { value: '456' },
      })

      const loginButton = screen.getByRole('button', {
        name: 'Login',
      })
      fireEvent.click(loginButton)

      /* Assert. */
      const personalizedGreeting = await screen.findByText(
        'Welcome, mocked-mary.smith@protonmail.com !'
      )
      expect(personalizedGreeting).toBeInTheDocument()
    }
  )

  test('renders <Register> for an unauthenticated user', async () => {
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
    const registerAnchor = await screen.findByText('Register')
    fireEvent.click(registerAnchor)

    /* Assert. */
    let element

    element = screen.getByPlaceholderText('Enter email')
    expect(element).toBeInTheDocument()

    element = screen.getByPlaceholderText('Enter password')
    expect(element).toBeInTheDocument()

    element = screen.getByPlaceholderText('Confirm password')
    expect(element).toBeInTheDocument()
  })

  test(
    'renders <Register> for an unauthenticated user,' +
      ' and then renders an <Alert>' +
      ' if an incorrectly completed registration form is submitted',
    async () => {
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
      const registerAnchor = await screen.findByText('Register')
      fireEvent.click(registerAnchor)

      const emailInput = screen.getByPlaceholderText('Enter email')
      fireEvent.change(emailInput, {
        target: { value: 'mary.smith@protonmail.com' },
      })

      const passwordInput = screen.getByPlaceholderText('Enter password')
      fireEvent.change(passwordInput, { target: { value: '456' } })

      const confirmPasswordInput =
        screen.getByPlaceholderText('Confirm password')
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'something-different-from-456' },
      })

      const registerButton = screen.getByRole('button', { name: 'Register' })
      fireEvent.click(registerButton)

      /* Assert. */
      const element = await screen.findByText('PASSWORDS DO NOT MATCH')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    'renders <Register> for an unauthenticated user,' +
      ' from where the user can create a new account for herself',
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
        }),
        rest.post('/api/v1.0/users', mockHandlerForCreateUserRequest),
        rest.post('/api/v1.0/tokens', mockHandlerForIssueJWSTokenRequest),
        rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest)
      )

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
      const registerAnchor = await screen.findByText('Register')
      fireEvent.click(registerAnchor)

      const emailInput = screen.getByPlaceholderText('Enter email')
      fireEvent.change(emailInput, {
        target: { value: 'mary.smith@protonmail.com' },
      })

      const passwordInput = screen.getByPlaceholderText('Enter password')
      fireEvent.change(passwordInput, { target: { value: '456' } })

      const confirmPasswordInput =
        screen.getByPlaceholderText('Confirm password')
      fireEvent.change(confirmPasswordInput, {
        target: { value: '456' },
      })

      const registerButton = screen.getByRole('button', { name: 'Register' })
      fireEvent.click(registerButton)

      /* Assert. */
      const element = await screen.findByText(
        'YOU HAVE SUCCESSFULLY REGISTERED'
      )
      expect(element).toBeInTheDocument()

      const personalizedGreeting = await screen.findByText(
        'Welcome, mocked-mary.smith@protonmail.com !'
      )
      expect(personalizedGreeting).toBeInTheDocument()
    }
  )

  test(
    'renders <Register> for an unauthenticated user,' +
      ' and then renders an <Alert>' +
      ' if the registration form is submitted with an email that is already taken',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', (req, res, ctx) => {
          return res.once(
            ctx.status(401),
            ctx.json({
              error: 'Unauthorized',
              message: 'mocked-authentication required?',
            })
          )
        }),
        rest.post('/api/v1.0/users', (req, res, ctx) => {
          return res.once(
            ctx.status(400),
            ctx.json({
              error: 'Unauthorized',
              message:
                'mocked-There already exists a user with the provided email.',
            })
          )
        })
      )

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
      const registerAnchor = await screen.findByText('Register')
      fireEvent.click(registerAnchor)

      const emailInput = screen.getByPlaceholderText('Enter email')
      fireEvent.change(emailInput, {
        target: { value: 'mary.smith@protonmail.com' },
      })

      const passwordInput = screen.getByPlaceholderText('Enter password')
      fireEvent.change(passwordInput, { target: { value: '456' } })

      const confirmPasswordInput =
        screen.getByPlaceholderText('Confirm password')
      fireEvent.change(confirmPasswordInput, {
        target: { value: '456' },
      })

      const registerButton = screen.getByRole('button', { name: 'Register' })
      fireEvent.click(registerButton)

      /* Assert. */
      const element = await screen.findByText(
        'mocked-There already exists a user with the provided email.'
      )
      expect(element).toBeInTheDocument()
    }
  )
})
