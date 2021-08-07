import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import rootReducer from '../../reducer'
import Login from './Login'
import Alert from '../alerts/Alert'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { mockHandlerForFetchUserRequest } from '../../testHelpers'

const requestHandlersToMock = [
  rest.post('/api/v1.0/tokens', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Unauthorized',
        message: 'mocked-authentication required',
      })
    )
  }),
  rest.get('/api/v1.0/user', (req, res, ctx) => {
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

describe('<Login> + mocking of HTTP requests', () => {
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

  test('renders for an unauthenticated user', () => {
    /* Arrange. */
    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    /* Act. */
    render(
      <Provider store={realStore}>
        <Login />
      </Provider>
    )

    /* Assert. */
    const emailInput = screen.getByPlaceholderText('Enter email')
    expect(emailInput).toBeInTheDocument()

    const passwordElement = screen.getByPlaceholderText('Enter password')
    expect(passwordElement).toBeInTheDocument()
  })

  test('tbd', async () => {
    /* Arrange. */
    const enhancer = applyMiddleware(thunkMiddleware)
    const realStore = createStore(rootReducer, enhancer)

    render(
      <Provider store={realStore}>
        <Alert />
        <Login />
      </Provider>
    )

    const emailInput = screen.getByPlaceholderText('Enter email')
    expect(emailInput).toBeInTheDocument()

    const passwordElement = screen.getByPlaceholderText('Enter password')
    expect(passwordElement).toBeInTheDocument()

    /* Act. */
    fireEvent.change(emailInput, {
      target: { value: 'mary.smith@protonmail.com' },
    })
    fireEvent.change(passwordElement, { target: { value: '456' } })

    const loginButton = screen.getByRole('button', { name: 'Login' })
    fireEvent.click(loginButton)

    /* Assert. */
    const element = await screen.findByText('AUTHENTICATION FAILED')
    expect(element).toBeInTheDocument()
  })
})
