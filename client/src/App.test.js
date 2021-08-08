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
  mockHandlerForFetchUserRequest,
  mockHandlerForCreateUserRequest,
  mockHandlerForIssueJWSTokenRequest,
  mockHandlerForFetchGoalsRequest,
  mockHandlerForFetchIntervalsRequest,
  mockHandlerForCreateGoalRequest,
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
  rest.post('/api/v1.0/goals', (req, res, ctx) => {
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

  test("an authenticated user clicks the 'Logout' link", async () => {
    /* Arrange. */
    quasiServer.use(rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest))

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
    const logoutAnchor = await screen.findByText('Logout')
    fireEvent.click(logoutAnchor)

    /* Assert. */
    let element

    element = screen.getByPlaceholderText('Enter email')
    expect(element).toBeInTheDocument()

    element = screen.getByPlaceholderText('Enter password')
    expect(element).toBeInTheDocument()
  })

  test("an authenticated user clicks on 'Goals Overview'", async () => {
    /* Arrange. */
    quasiServer.use(
      rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest),
      rest.get('/api/v1.0/goals', mockHandlerForFetchGoalsRequest),
      rest.get('/api/v1.0/intervals', mockHandlerForFetchIntervalsRequest)
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
    const goalsOverviewAnchor = await screen.findByText('Goals Overview')
    fireEvent.click(goalsOverviewAnchor)

    /* Assert. */
    let element

    element = await screen.findByText(
      'mocked-write tests for thunk-action creators'
    )
    expect(element).toBeInTheDocument()

    element = await screen.findByText('mocked-cook dinner')
    expect(element).toBeInTheDocument()
  })

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      ' but JWS token expires before the GET request for Goals is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest),
        rest.get('/api/v1.0/goals', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              error: 'Unauthorized',
              message: 'mocked-authentication required',
            })
          )
        })
      )
      /*
      Because the previous statement doesn't add a request handler for
      GET /api/v1.0/intervals , running this test case generates the following:

      console.warn
        [MSW] Warning: captured a request without a matching request handler:
        
          • GET http://localhost/api/v1.0/intervals
        
        If you still wish to intercept this unhandled request, please create a request handler for it.
        Read more: https://mswjs.io/docs/getting-started/mocks
      */

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
      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Assert. */
      let element

      element = await screen.findByText('FAILED TO FETCH GOALS')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      ' but JWS token expires before the GET request for Intervals is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest),
        rest.get('/api/v1.0/goals', mockHandlerForFetchGoalsRequest),
        rest.get('/api/v1.0/intervals', (req, res, ctx) => {
          return res(
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

      const history = createMemoryHistory()

      render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      )

      /* Act. */
      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Assert. */
      let element

      element = await screen.findByText('FAILED TO FETCH INTERVALS')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on 'Add a new goal'" +
      ' and finally fills out the form and submits it',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest),
        rest.get('/api/v1.0/goals', mockHandlerForFetchGoalsRequest),
        rest.get('/api/v1.0/intervals', mockHandlerForFetchIntervalsRequest),

        rest.post('/api/v1.0/goals', mockHandlerForCreateGoalRequest),
        rest.get('/api/v1.0/goals', mockHandlerForFetchGoalsRequest),
        rest.get('/api/v1.0/intervals', mockHandlerForFetchIntervalsRequest)
      )
      /*
      The previous statement uses the following request-handlers:
        mockHandlerForCreateGoalRequest
        mockHandlerForFetchGoalsRequest
      whose current implementation causes this test to generate the following:

        console.error
    Warning: Encountered two children with the same key, `10`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
        at tbody
        at table
        at div
        at GoalsOverview (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/src/features/goals/GoalsOverview.js:17:20)
        at Route (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/node_modules/react-router/cjs/react-router.js:470:29)
        at PrivateRoute (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/src/features/auth/PrivateRoute.js:8:22)
        at Switch (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/node_modules/react-router/cjs/react-router.js:676:29)
        at section
        at App (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/src/App.js:27:20)
        at Router (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/node_modules/react-router/cjs/react-router.js:99:30)
        at Provider (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/node_modules/react-redux/lib/components/Provider.js:19:20)
      */

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

      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Act. */
      const addNewGoalAnchor = screen.getByText('Add a new goal')
      fireEvent.click(addNewGoalAnchor)

      const descriptionInput = screen.getByPlaceholderText(
        'Enter description of goal'
      )
      fireEvent.change(descriptionInput, {
        target: { value: 'mocked-go for a swim' },
      })

      const addGoalButton = screen.getByRole('button', { name: 'Add goal' })
      fireEvent.click(addGoalButton)

      /* Assert. */
      const elements = await screen.findAllByText(
        'mocked-write tests for thunk-action creators'
      )
      expect(elements.length).toEqual(2)

      const element = await screen.findByText('mocked-cook dinner')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on 'Add a new goal'" +
      ' and finally submits an empty form',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest),
        rest.get('/api/v1.0/goals', mockHandlerForFetchGoalsRequest),
        rest.get('/api/v1.0/intervals', mockHandlerForFetchIntervalsRequest)
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

      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Act. */
      const addNewGoalAnchor = screen.getByText('Add a new goal')
      fireEvent.click(addNewGoalAnchor)

      const addGoalButton = screen.getByRole('button', { name: 'Add goal' })
      fireEvent.click(addGoalButton)

      /* Assert. */
      const element = await screen.findByText('FAILED TO ADD A NEW GOAL')
      expect(element).toBeInTheDocument()
    }
  )
})
