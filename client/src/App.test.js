import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

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
  requestHandlers,
  MOCK_GOAL_10,
  MOCK_INTERVAL_300,
  MOCK_INTERVAL_100,
  MOCK_INTERVAL_200,
  MOCK_GOAL_20,
} from './testHelpers'

const requestHandlersToMock = [
  rest.get('/api/v1.0/user', requestHandlers.mockMultipleFailures),

  rest.post('/api/v1.0/tokens', requestHandlers.mockMultipleFailures),

  rest.post('/api/v1.0/goals', requestHandlers.mockMultipleFailures),

  rest.put('/api/v1.0/goals/:id', requestHandlers.mockMultipleFailures),
  rest.delete('/api/v1.0/goals/:id', requestHandlers.mockMultipleFailures),

  rest.put('/api/v1.0/intervals/:id', requestHandlers.mockMultipleFailures),
  rest.delete('/api/v1.0/intervals/:id', requestHandlers.mockMultipleFailures),
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
        rest.get('/api/v1.0/user', requestHandlers.mockSingleFailure),
        rest.post('/api/v1.0/users', requestHandlers.mockCreateUser),
        rest.post('/api/v1.0/tokens', requestHandlers.mockIssueJWSToken),
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser)
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
        'YOU HAVE REGISTERED SUCCESSFULLY'
      )
      expect(element).toBeInTheDocument()

      expect(history.location.pathname).toEqual('/register')
    }
  )

  test(
    'renders <Register> for an unauthenticated user,' +
      ' and then renders an <Alert>' +
      ' if the registration form is submitted with an email that is already taken',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockSingleFailure),
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
      const element = await screen.findByText('mocked-Unauthorized')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    'renders <Login> for an unauthenticated user,' +
      ' from where the user can log in',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockSingleFailure),
        rest.post('/api/v1.0/tokens', requestHandlers.mockIssueJWSToken),
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser)
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

  test("an authenticated user clicks the 'Logout' link", async () => {
    /* Arrange. */
    quasiServer.use(rest.get('/api/v1.0/user', requestHandlers.mockFetchUser))

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

  test(
    "an authenticated user manually enters '/register'" +
      " into her web browser's address bar",
    async () => {
      /* Arrange. */
      quasiServer.use(rest.get('/api/v1.0/user', requestHandlers.mockFetchUser))

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

      const personalizedGreeting = await screen.findByText(
        'Welcome, mocked-mary.smith@protonmail.com !'
      )
      expect(personalizedGreeting).toBeInTheDocument()

      const logoutAnchor = await screen.findByText('Logout')
      expect(logoutAnchor).toBeInTheDocument()

      /* Act. */
      history.push('/register')

      /* Assert. */
      expect(history.location.pathname).toEqual('/dashboard')
    }
  )

  test("an authenticated user clicks on 'Goals Overview'", async () => {
    /* Arrange. */
    quasiServer.use(
      rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
      rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
      rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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

    element = await screen.findByText(MOCK_GOAL_10.description)
    expect(element).toBeInTheDocument()

    element = await screen.findByText(MOCK_GOAL_20.description)
    expect(element).toBeInTheDocument()
  })

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      ' but JWS token expires before the GET request for Goals is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockMultipleFailures)
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

      element = await screen.findByText(
        "[FROM <GoalsOverview>'s useEffect HOOK] FAILED TO FETCH GOALS - PLEASE LOG BACK IN"
      )
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      ' but JWS token expires before the GET request for Intervals is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockMultipleFailures)
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
        "[FROM <GoalsOverview>'s useEffect HOOK] FAILED TO FETCH INTERVALS - PLEASE LOG BACK IN"
      )
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on 'Add a new goal'," +
      ' and finally fills out the form and submits it',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.post('/api/v1.0/goals', requestHandlers.mockCreateGoal),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
      )
      /*
      The previous statement uses the following request-handlers:
        requestHandlers.mockCreateGoal
        requestHandlers.mockFetchGoals
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
      const elements = await screen.findAllByText(MOCK_GOAL_10.description)
      expect(elements.length).toEqual(2)

      const element = await screen.findByText(MOCK_GOAL_20.description)
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on 'Add a new goal'," +
      ' and finally submits an empty form',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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
      const element = await screen.findByText(
        '[FROM <AddNewGoal>] FAILED TO ADD A NEW GOAL - PLEASE LOG BACK IN'
      )
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on the 1st 'Edit' anchor tag," +
      ' and finally fills out the form and submits it',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.put('/api/v1.0/goals/:id', requestHandlers.mockEditGoal)
      )
      /*
      Because the previous statement doesn't add a request handler for
      GET /api/v1.0/goals , running this test case generates the following:

      console.warn
        [MSW] Warning: captured a request without a matching request handler:
        
          • GET http://localhost/api/v1.0/goals
        
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

      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Act. */
      const editAnchorTags = await screen.findAllByText('Edit')
      expect(editAnchorTags.length).toEqual(2)
      const editAnchorTag = editAnchorTags[0]
      fireEvent.click(editAnchorTag)

      const descriptionInputs = screen.getAllByDisplayValue(
        MOCK_GOAL_10.description
      )
      expect(descriptionInputs.length).toEqual(2)

      const newDescriptionInput = descriptionInputs[1]
      fireEvent.change(newDescriptionInput, {
        target: { value: MOCK_GOAL_20.description + ' - its edited version' },
      })

      const editButton = screen.getByRole('button', { name: 'Edit' })
      fireEvent.click(editButton)

      /* Assert. */
      let element

      element = await screen.findByText('GOAL SUCCESSFULLY EDITED')
      expect(element).toBeInTheDocument()

      element = screen.getByText(
        MOCK_GOAL_20.description + ' - its edited version'
      )
      expect(element).toBeInTheDocument()

      element = screen.getByText(MOCK_GOAL_20.description)
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on the 1st 'Edit' anchor tag," +
      ' fills out the form and submits it' +
      ' but the JWS token expires before the PUT request is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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
      const editAnchorTags = await screen.findAllByText('Edit')
      const editAnchorTag = editAnchorTags[0]
      fireEvent.click(editAnchorTag)

      const descriptionInputs = screen.getAllByDisplayValue(
        MOCK_GOAL_10.description
      )
      expect(descriptionInputs.length).toEqual(2)

      const newDescriptionInput = descriptionInputs[1]
      fireEvent.change(newDescriptionInput, {
        target: { value: '[mocked] cook dinner' },
      })

      const editButton = screen.getByRole('button', { name: 'Edit' })
      fireEvent.click(editButton)

      /* Assert. */
      const element = await screen.findByText(
        '[FROM <EditGoal>] FAILED TO EDIT THE SELECTED GOAL - PLEASE LOG BACK IN'
      )
      expect(element).toBeInTheDocument()

      expect(history.location.pathname).toEqual('/login')
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on the 1st 'Delete' anchor tag," +
      " and finally clicks on the 'Yes' button",
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.delete('/api/v1.0/goals/:id', requestHandlers.mockDeleteGoal)
      )
      /*
      Because the previous statement doesn't add a request handler for
      GET /api/v1.0/goals , running this test case generates the following:

      console.warn
        [MSW] Warning: captured a request without a matching request handler:
        
          • GET http://localhost/api/v1.0/goals
        
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

      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Act. */
      const deleteAnchors = await screen.findAllByText('Delete')
      expect(deleteAnchors.length).toEqual(2)

      const deleteAnchor = deleteAnchors[0]
      fireEvent.click(deleteAnchor)

      let element

      element = screen.getByText('Description of the selected goal:')
      expect(element).toBeInTheDocument()

      element = screen.getByText('Do you want to delete the selected goal?')
      expect(element).toBeInTheDocument()

      const descriptionInput = screen.getByDisplayValue(
        MOCK_GOAL_10.description
      )
      expect(descriptionInput).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')
      fireEvent.click(yesButton)

      /* Assert. */
      element = await screen.findByText('GOAL SUCCESSFULLY DELETED')
      expect(element).toBeInTheDocument()

      const descriptionOfDeletedGoal = screen.queryByText(
        MOCK_GOAL_10.description
      )
      expect(descriptionOfDeletedGoal).not.toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on the 1st 'Delete' anchor tag," +
      " and finally clicks on the 'Yes' button" +
      ' but the JWS token expires before the DELETE request is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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
      const deleteAnchors = await screen.findAllByText('Delete')
      expect(deleteAnchors.length).toEqual(2)

      const deleteAnchor = deleteAnchors[0]
      fireEvent.click(deleteAnchor)

      let element

      element = screen.getByText('Description of the selected goal:')
      expect(element).toBeInTheDocument()

      element = screen.getByText('Do you want to delete the selected goal?')
      expect(element).toBeInTheDocument()

      const descriptionInput = screen.getByDisplayValue(
        MOCK_GOAL_10.description
      )
      expect(descriptionInput).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')
      fireEvent.click(yesButton)

      /* Assert. */
      element = await screen.findByText(
        '[FROM <DeleteGoal>] FAILED TO DELETE THE SELECTED GOAL - PLEASE LOG BACK IN'
      )
      expect(element).toBeInTheDocument()

      expect(history.location.pathname).toEqual('/login')
    }
  )

  test(
    "an authenticated user clicks on 'Goals Overview'," +
      " then clicks on the 1st 'Delete' anchor tag," +
      " and finally clicks on the 'No' button",
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
      )
      /*
      Because the previous statement doesn't add a request handler for
      GET /api/v1.0/goals , running this test case generates the following:

      console.warn
        [MSW] Warning: captured a request without a matching request handler:
        
          • GET http://localhost/api/v1.0/goals
        
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

      const goalsOverviewAnchor = await screen.findByText('Goals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Act. */
      const deleteAnchors = await screen.findAllByText('Delete')
      expect(deleteAnchors.length).toEqual(2)

      const deleteAnchor = deleteAnchors[0]
      fireEvent.click(deleteAnchor)

      let element

      element = screen.getByText('Description of the selected goal:')
      expect(element).toBeInTheDocument()

      element = screen.getByText('Do you want to delete the selected goal?')
      expect(element).toBeInTheDocument()

      const descriptionInput = screen.getByDisplayValue(
        MOCK_GOAL_10.description
      )
      expect(descriptionInput).toBeInTheDocument()

      const noButton = screen.getByText('No')
      fireEvent.click(noButton)

      /* Assert. */
      const deleteAnchorElements = await screen.findAllByText('Delete')
      expect(deleteAnchorElements.length).toEqual(2)
    }
  )

  test("an authenticated user clicks on 'Intervals Overview'", async () => {
    /* Arrange. */
    quasiServer.use(
      rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
      rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
      rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

      rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
      rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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
    const goalsOverviewAnchor = await screen.findByText('Intervals Overview')
    fireEvent.click(goalsOverviewAnchor)

    /* Assert. */
    let elementForInterval1

    elementForInterval1 = await screen.findByText(MOCK_GOAL_10.description)
    expect(elementForInterval1).toBeInTheDocument()
    elementForInterval1 = screen.getByText('2021-08-05 18:54')
    expect(elementForInterval1).toBeInTheDocument()
    elementForInterval1 = screen.getByText('2021-08-05 19:46')
    expect(elementForInterval1).toBeInTheDocument()

    let elementForInterval2

    elementForInterval2 = await screen.findByText(MOCK_GOAL_20.description)
    expect(elementForInterval2).toBeInTheDocument()
    elementForInterval2 = screen.getByText('2021-08-05 19:53')
    expect(elementForInterval2).toBeInTheDocument()
    elementForInterval2 = screen.getByText('2021-08-05 20:41')
    expect(elementForInterval2).toBeInTheDocument()
  })

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      ' but JWS token expires before the GET request for Goals is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockMultipleFailures)
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
      const goalsOverviewAnchor = await screen.findByText('Intervals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Assert. */
      let element

      element = await screen.findByText(
        "[FROM <IntervalsOverview>'s useEffect HOOK] FAILED TO FETCH GOALS - PLEASE LOG BACK IN"
      )
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      ' but JWS token expires before the GET request for Intervals is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockMultipleFailures)
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
      const goalsOverviewAnchor = await screen.findByText('Intervals Overview')
      fireEvent.click(goalsOverviewAnchor)

      /* Assert. */
      let element

      element = await screen.findByText(
        "[FROM <IntervalsOverview>'s useEffect HOOK] FAILED TO FETCH INTERVALS - PLEASE LOG BACK IN"
      )
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on 'Add a new interval'," +
      ' and finally fills out the form and submits it',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals), // consumed by <AddNewInterval>'s effect function

        rest.post('/api/v1.0/intervals', requestHandlers.mockCreateInterval),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals)
        // rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
      )
      /*
      The previous statement uses the following request-handlers:
        requestHandlers.mockCreateGoal
        requestHandlers.mockFetchGoals
      whose current implementation causes this test to generate the following:

      console.error
        Warning: Encountered two children with the same key, `100`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
            at tbody
            at table
            at div
            at IntervalsOverview (/Users/is4e1pmmt/Documents/repos/goal-tracker/client/src/features/intervals/IntervalsOverview.js:18:20)
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

      const goalsOverviewAnchor = await screen.findByText('Intervals Overview')
      fireEvent.click(goalsOverviewAnchor)

      await waitFor(() => {
        const rows = screen.queryAllByText('Edit')
        expect(rows.length).toEqual(2)
      })

      const addNewIntervalAnchor = screen.getByText('Add a new interval')
      fireEvent.click(addNewIntervalAnchor)

      let optionElement1
      optionElement1 = await screen.findByText(MOCK_GOAL_10.description)
      expect(optionElement1).toBeInTheDocument()

      let optionElement2
      optionElement2 = screen.getByText(MOCK_GOAL_10.description)
      expect(optionElement2).toBeInTheDocument()

      /* Act. */
      const selectOne = screen.getByRole('combobox')
      fireEvent.change(selectOne, {
        target: { value: MOCK_GOAL_10.description },
      })

      const timestampInputs = screen.getAllByPlaceholderText('YYYY-MM-DD HH:MM')
      expect(timestampInputs.length).toEqual(2)
      const [startTimestampInput, finalTimestampInput] = timestampInputs

      fireEvent.change(startTimestampInput, {
        target: { value: MOCK_INTERVAL_300.start },
      })
      fireEvent.change(finalTimestampInput, {
        target: { value: MOCK_INTERVAL_300.final },
      })

      const addIntervalButton = screen.getByRole('button', {
        name: 'Add interval',
      })
      fireEvent.click(addIntervalButton)

      /* Assert. */
      const element = await screen.findByText('NEW INTERVAL ADDED')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on 'Add a new interval'," +
      ' fills out the form and submits it' +
      ' but the JWS token expires before the POST request is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.post('/api/v1.0/intervals', requestHandlers.mockMultipleFailures),

        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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

      const goalsOverviewAnchor = await screen.findByText('Intervals Overview')
      fireEvent.click(goalsOverviewAnchor)

      await waitFor(() => {
        const rows = screen.queryAllByText('Edit')
        expect(rows.length).toEqual(2)
      })

      const addNewIntervalAnchor = screen.getByText('Add a new interval')
      fireEvent.click(addNewIntervalAnchor)

      let optionElement1
      optionElement1 = await screen.findByText(MOCK_GOAL_10.description)
      expect(optionElement1).toBeInTheDocument()

      let optionElement2
      optionElement2 = screen.getByText(MOCK_GOAL_10.description)
      expect(optionElement2).toBeInTheDocument()

      /* Act. */
      const selectOne = screen.getByRole('combobox')
      fireEvent.change(selectOne, {
        target: { value: MOCK_GOAL_10.description },
      })

      const timestampInputs = screen.getAllByPlaceholderText('YYYY-MM-DD HH:MM')
      expect(timestampInputs.length).toEqual(2)
      const [startTimestampInput, finalTimestampInput] = timestampInputs

      fireEvent.change(startTimestampInput, {
        target: { value: MOCK_INTERVAL_300.start },
      })
      fireEvent.change(finalTimestampInput, {
        target: { value: MOCK_INTERVAL_300.final },
      })

      const addIntervalButton = screen.getByRole('button', {
        name: 'Add interval',
      })
      fireEvent.click(addIntervalButton)

      /* Assert. */
      const element = await screen.findByText(
        '[FROM <AddNewInterval>] FAILED TO ADD A NEW INTERVAL - PLEASE LOG BACK IN'
      )
      expect(element).toBeInTheDocument()

      expect(history.location.pathname).toEqual('/login')
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on the 1st 'Edit' anchor tag," +
      ' and finally fills out the form and submits it',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.put('/api/v1.0/intervals/:id', requestHandlers.mockEditInterval),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals)
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

      const intervalsOverviewAnchor = await screen.findByText(
        'Intervals Overview'
      )
      fireEvent.click(intervalsOverviewAnchor)

      /* Act. */
      const editAnchorTags = await screen.findAllByText('Edit')
      expect(editAnchorTags.length).toEqual(2)
      const editAnchorTag = editAnchorTags[0]
      fireEvent.click(editAnchorTag)

      const startTimestampInput = screen.getByDisplayValue(
        MOCK_INTERVAL_100.start
      )
      fireEvent.change(startTimestampInput, {
        target: { value: '2021-08-09 06:57' },
      })

      const editButton = screen.getByRole('button', { name: 'Edit' })
      fireEvent.click(editButton)

      /* Assert. */
      let element

      element = await screen.findByText('INTERVAL SUCCESSFULLY EDITED')
      expect(element).toBeInTheDocument()
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on the 1st 'Edit' anchor tag," +
      ' fills out the form and submits it' +
      ' but the JWS token expires before the PUT request is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        // rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals)
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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

      const intervalsOverviewAnchor = await screen.findByText(
        'Intervals Overview'
      )
      fireEvent.click(intervalsOverviewAnchor)

      /* Act. */
      const editAnchorTags = await screen.findAllByText('Edit')
      expect(editAnchorTags.length).toEqual(2)
      const editAnchorTag = editAnchorTags[0]
      fireEvent.click(editAnchorTag)

      const startTimestampInput = screen.getByDisplayValue(
        MOCK_INTERVAL_100.start
      )
      fireEvent.change(startTimestampInput, {
        target: { value: '2021-08-09 06:57' },
      })

      const editButton = screen.getByRole('button', { name: 'Edit' })
      fireEvent.click(editButton)

      /* Assert. */
      const element = await screen.findByText(
        '[FROM <EditInterval>] FAILED TO EDIT THE SELECTED INTERVAL - PLEASE LOG BACK IN'
      )
      expect(element).toBeInTheDocument()

      expect(history.location.pathname).toEqual('/login')
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on the 1st 'Delete' anchor tag," +
      " and finally clicks on the 'Yes' button",
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.delete(
          '/api/v1.0/intervals/:id',
          requestHandlers.mockDeleteInterval
        ),

        rest.get('/api/v1.0/goals', (req, res, ctx) => {
          return res.once(
            ctx.status(200),
            ctx.json({
              goals: [MOCK_GOAL_20],
            })
          )
        }),
        rest.get('/api/v1.0/intervals', (req, res, ctx) => {
          return res.once(
            ctx.status(200),
            ctx.json({
              items: [MOCK_INTERVAL_200],
              _meta: {
                total_items: 1,
                per_page: 10,
                total_pages: 1,
                page: 1,
              },
              _links: {
                self: '/api/v1.0/intervals?per_page=10&page=1',
                next: null,
                prev: null,
                first: '/api/v1.0/intervals?per_page=10&page=1',
                last: '/api/v1.0/intervals?per_page=10&page=1',
              },
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

      const intervalsOverviewAnchor = await screen.findByText(
        'Intervals Overview'
      )
      fireEvent.click(intervalsOverviewAnchor)

      /* Act. */
      const deleteAnchors = await screen.findAllByText('Delete')
      expect(deleteAnchors.length).toEqual(2)

      const deleteAnchor = deleteAnchors[0]
      fireEvent.click(deleteAnchor)

      let element

      element = screen.getByText('The selected interval:')
      expect(element).toBeInTheDocument()

      element = screen.getByText('Do you want to delete the selected interval?')
      expect(element).toBeInTheDocument()

      const descriptionInput = screen.getByText(MOCK_GOAL_10.description)
      expect(descriptionInput).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')
      fireEvent.click(yesButton)

      /* Assert. */
      element = await screen.findByText('INTERVAL SUCCESSFULLY DELETED')
      expect(element).toBeInTheDocument()

      await waitFor(() => {
        const descriptionOfDeletedGoal = screen.queryByText(
          MOCK_GOAL_10.description
        )
        expect(descriptionOfDeletedGoal).not.toBeInTheDocument()
      })
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on the 1st 'Delete' anchor tag," +
      " and finally clicks on the 'Yes' button" +
      ' but the JWS token expires before the DELETE request is issued',
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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

      const intervalsOverviewAnchor = await screen.findByText(
        'Intervals Overview'
      )
      fireEvent.click(intervalsOverviewAnchor)

      /* Act. */
      const deleteAnchors = await screen.findAllByText('Delete')
      expect(deleteAnchors.length).toEqual(2)

      const deleteAnchor = deleteAnchors[0]
      fireEvent.click(deleteAnchor)

      let element

      element = screen.getByText('The selected interval:')
      expect(element).toBeInTheDocument()

      element = screen.getByText('Do you want to delete the selected interval?')
      expect(element).toBeInTheDocument()

      const descriptionInput = screen.getByText(MOCK_GOAL_10.description)
      expect(descriptionInput).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')
      fireEvent.click(yesButton)

      /* Assert. */
      element = await screen.findByText(
        '[FROM <DeleteInterval>] FAILED TO DELETE THE SELECTED INTERVAL - PLEASE LOG BACK IN'
      )
      expect(element).toBeInTheDocument()

      expect(history.location.pathname).toEqual('/login')
    }
  )

  test(
    "an authenticated user clicks on 'Intervals Overview'," +
      " then clicks on the 1st 'Delete' anchor tag," +
      " and finally clicks on the 'No' button",
    async () => {
      /* Arrange. */
      quasiServer.use(
        rest.get('/api/v1.0/user', requestHandlers.mockFetchUser),
        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),

        rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
        rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals)
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

      const intervalsOverviewAnchor = await screen.findByText(
        'Intervals Overview'
      )
      fireEvent.click(intervalsOverviewAnchor)

      /* Act. */
      const deleteAnchors = await screen.findAllByText('Delete')
      expect(deleteAnchors.length).toEqual(2)

      const deleteAnchor = deleteAnchors[0]
      fireEvent.click(deleteAnchor)

      let element

      element = screen.getByText('The selected interval:')
      expect(element).toBeInTheDocument()

      element = screen.getByText('Do you want to delete the selected interval?')
      expect(element).toBeInTheDocument()

      const descriptionInput = screen.getByText(MOCK_GOAL_10.description)
      expect(descriptionInput).toBeInTheDocument()

      const noButton = screen.getByText('No')
      fireEvent.click(noButton)

      /* Assert. */
      const deleteAnchorElements = await screen.findAllByText('Delete')
      expect(deleteAnchorElements.length).toEqual(2)

      element = await screen.findByText(MOCK_GOAL_10.description)
      expect(element).toBeInTheDocument()

      element = await screen.findByText(MOCK_GOAL_20.description)
      expect(element).toBeInTheDocument()
    }
  )
})
