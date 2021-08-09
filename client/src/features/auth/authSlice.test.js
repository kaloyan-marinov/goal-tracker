import {
  initialStateAuth,
  selectIsAuthenticated,
  selectRequestStatus,
  selectCurrentUser,
  createUserPending,
  createUserFulfilled,
  createUserRejected,
  issueJWSTokenPending,
  issueJWSTokenFulfilled,
  issueJWSTokenRejected,
  fetchUserPending,
  fetchUserFulfilled,
  fetchUserRejected,
  logout,
} from './authSlice'
import authReducer from './authSlice'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  createStoreMock,
  mockHandlerForCreateUserRequest,
  mockHandlerForIssueJWSTokenRequest,
  mockHandlerForFetchUserRequest,
  mockHandlerForMultipleFailures,
  MOCK_USER_1,
} from '../../testHelpers'
import { createUser, issueJWSToken, fetchUser } from './authSlice'

describe('selectors', () => {
  test('selectIsAuthenticated', () => {
    const initSt = {
      auth: {
        ...initialStateAuth,
        isAuthenticated: false,
      },
    }

    const isAuthenticated = selectIsAuthenticated(initSt)

    expect(isAuthenticated).toEqual(false)
  })

  test('selectRequestStatus', () => {
    const initSt = {
      auth: {
        ...initialStateAuth,
        requestStatus: 'loading',
      },
    }

    const requestStatus = selectRequestStatus(initSt)

    expect(requestStatus).toEqual('loading')
  })

  test('selectCurrentUser', () => {
    const initSt = {
      auth: {
        ...initialStateAuth,
        currentUser: MOCK_USER_1,
      },
    }

    const currentUser = selectCurrentUser(initSt)

    expect(currentUser).toEqual(MOCK_USER_1)
  })
})

describe('action creators', () => {
  test('createUserPending', () => {
    const action = createUserPending()

    expect(action).toEqual({
      type: 'auth/createUser/pending',
    })
  })

  test('createUserRejected', () => {
    const action = createUserRejected('auth-createUser-rejected')

    expect(action).toEqual({
      type: 'auth/createUser/rejected',
      error: 'auth-createUser-rejected',
    })
  })

  test('createUserFulfilled', () => {
    const action = createUserFulfilled()

    expect(action).toEqual({
      type: 'auth/createUser/fulfilled',
    })
  })

  test('issueJWSTokenPending', () => {
    const action = issueJWSTokenPending()

    expect(action).toEqual({
      type: 'auth/issueJWSToken/pending',
    })
  })

  test('issueJWSTokenRejected', () => {
    const action = issueJWSTokenRejected('auth-issueJWSToken-rejected')

    expect(action).toEqual({
      type: 'auth/issueJWSToken/rejected',
      error: 'auth-issueJWSToken-rejected',
    })
  })

  test('issueJWSTokenFulfilled', () => {
    const action = issueJWSTokenFulfilled('access-token')

    expect(action).toEqual({
      type: 'auth/issueJWSToken/fulfilled',
      payload: 'access-token',
    })
  })

  test('fetchUserPending', () => {
    const action = fetchUserPending()

    expect(action).toEqual({
      type: 'auth/fetchUser/pending',
    })
  })

  test('fetchUserRejected', () => {
    const action = fetchUserRejected('auth-fetchUser-rejected')

    expect(action).toEqual({
      type: 'auth/fetchUser/rejected',
      error: 'auth-fetchUser-rejected',
    })
  })

  test('fetchUserFulfilled', () => {
    const action = fetchUserFulfilled(MOCK_USER_1)

    expect(action).toEqual({
      type: 'auth/fetchUser/fulfilled',
      payload: MOCK_USER_1,
    })
  })

  test('logout', () => {
    const action = logout()

    expect(action).toEqual({
      type: 'auth/logout',
    })
  })
})

describe('slice reducer', () => {
  test('auth/createUser/pending', () => {
    const initStAuth = {
      ...initialStateAuth,
    }
    const action = {
      type: 'auth/createUser/pending',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'loading',
      requestError: null,
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })

  test('auth/createUser/fulfilled', () => {
    const initStAuth = {
      ...initialStateAuth,
      requestStatus: 'loading',
      requestError: 'using this value is illustrative but unrealistic',
    }
    const action = {
      type: 'auth/createUser/fulfilled',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })

  test('auth/createUser/rejected', () => {
    const initStAuth = {
      ...initialStateAuth,
      requestStatus: 'loading',
      requestError: 'using this value is illustrative but unrealistic',
    }
    const action = {
      type: 'auth/createUser/rejected',
      error: 'auth-createUser-rejected',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'failed',
      requestError: 'auth-createUser-rejected',
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })

  test('auth/issueJWSToken/pending', () => {
    const initStAuth = {
      ...initialStateAuth,
    }
    const action = {
      type: 'auth/issueJWSToken/pending',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'loading',
      requestError: null,
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })

  test('auth/issueJWSToken/rejected', () => {
    const initStAuth = {
      ...initialStateAuth,
      requestStatus: 'loading',
      requestError: 'using this value is illustrative but unrealistic',
    }
    const action = {
      type: 'auth/issueJWSToken/rejected',
      error: 'auth-issueJWSToken-rejected',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'failed',
      requestError: 'auth-issueJWSToken-rejected',
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })

  test('auth/fetchUser/pending', () => {
    const initStAuth = {
      ...initialStateAuth,
    }
    const action = {
      type: 'auth/fetchUser/pending',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'loading',
      requestError: null,
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })

  test('auth/fetchUser/fulfilled', () => {
    const initStAuth = {
      ...initialStateAuth,
      requestStatus: 'loading',
      requestError: 'using this value is illustrative but unrealistic',
    }
    const action = {
      type: 'auth/fetchUser/fulfilled',
      payload: MOCK_USER_1,
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      token: null,
      isAuthenticated: true,
      currentUser: MOCK_USER_1,
    })
  })

  test('auth/fetchUser/rejected', () => {
    const initStAuth = {
      ...initialStateAuth,
      requestStatus: 'loading',
      requestError: 'using this value is illustrative but unrealistic',
    }
    const action = {
      type: 'auth/fetchUser/rejected',
      error: 'auth-fetchUser-rejected',
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'failed',
      requestError: 'auth-fetchUser-rejected',
      token: null,
      isAuthenticated: null,
      currentUser: null,
    })
  })
})

const requestHandlersToMock = [
  rest.post('/api/v1.0/users', mockHandlerForCreateUserRequest),
  rest.post('/api/v1.0/tokens', mockHandlerForIssueJWSTokenRequest),
  rest.get('/api/v1.0/user', mockHandlerForFetchUserRequest),
]

/* Create an MSW "request-interception layer". */
const quasiServer = setupServer(...requestHandlersToMock)

describe('thunk-action creators', () => {
  let storeMock

  beforeAll(() => {
    /* Enable API mocking. */
    quasiServer.listen()
  })

  beforeEach(() => {
    storeMock = createStoreMock({
      auth: {
        ...initialStateAuth,
      },
    })
  })

  afterEach(() => {
    quasiServer.resetHandlers()
  })

  afterAll(() => {
    /* Disable API mocking. */
    quasiServer.close()
  })

  test('createUser + its HTTP request is mocked to succeed', async () => {
    const createUserPromise = storeMock.dispatch(
      createUser('mary.smith@protonmail.com', '456')
    )

    await expect(createUserPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/createUser/pending' },
      { type: 'auth/createUser/fulfilled' },
    ])
  })

  test('createUser + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.post('/api/v1.0/users', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Bad Request',
            message: 'There already exists a user with the provided email.',
          })
        )
      })
    )

    const createUserPromise = storeMock.dispatch(
      createUser('mary.smith@protonmail.com', '456')
    )

    await expect(createUserPromise).rejects.toEqual(
      'There already exists a user with the provided email.'
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/createUser/pending' },
      {
        type: 'auth/createUser/rejected',
        error: 'There already exists a user with the provided email.',
      },
    ])
  })

  test('issueJWSToken + its HTTP request is mocked to succeed', async () => {
    const issueJWSTokenPromise = storeMock.dispatch(
      issueJWSToken('mary.smith@protonmail.com', '456')
    )

    await expect(issueJWSTokenPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/issueJWSToken/pending' },
      {
        type: 'auth/issueJWSToken/fulfilled',
        payload: 'mocked-jws-token',
      },
    ])
  })

  test('issueJWSToken + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.post('/api/v1.0/tokens', mockHandlerForMultipleFailures)
    )

    const issueJWSTokenPromise = storeMock.dispatch(
      issueJWSToken('mary.smith@protonmail.com', '456')
    )

    await expect(issueJWSTokenPromise).rejects.toEqual('mocked-Unauthorized')
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/issueJWSToken/pending' },
      {
        type: 'auth/issueJWSToken/rejected',
        error: 'mocked-Unauthorized',
      },
    ])
  })

  test('fetchUser + its HTTP request is mocked to succeed', async () => {
    const fetchUserPromise = storeMock.dispatch(fetchUser())

    await expect(fetchUserPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/fetchUser/pending' },
      {
        type: 'auth/fetchUser/fulfilled',
        payload: {
          id: 1,
          email: 'mocked-mary.smith@protonmail.com',
        },
      },
    ])
  })

  test('fetchUser + its HTTP request is mocked to fail', async () => {
    quasiServer.use(rest.get('/api/v1.0/user', mockHandlerForMultipleFailures))
    const fetchUserPromise = storeMock.dispatch(fetchUser())

    await expect(fetchUserPromise).rejects.toEqual('mocked-Unauthorized')
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/fetchUser/pending' },
      {
        type: 'auth/fetchUser/rejected',
        error: 'mocked-Unauthorized',
      },
    ])
  })
})
