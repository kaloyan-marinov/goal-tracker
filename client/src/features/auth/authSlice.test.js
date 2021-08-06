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
import { createStoreMock } from '../../testHelpers'
import { createUser } from './authSlice'

const USER = {
  id: 17,
  email: 'mary.smith@protonmail.com',
}

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
        currentUser: USER,
      },
    }

    const currentUser = selectCurrentUser(initSt)

    expect(currentUser).toEqual(USER)
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
    const action = fetchUserFulfilled(USER)

    expect(action).toEqual({
      type: 'auth/fetchUser/fulfilled',
      payload: USER,
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
      payload: USER,
    }

    const newStAuth = authReducer(initStAuth, action)

    expect(newStAuth).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      token: null,
      isAuthenticated: true,
      currentUser: USER,
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

/* Describe what requests should be mocked. */
const requestHandlersToMock = [
  rest.post('/api/v1.0/users', (req, res, ctx) => {
    return res.once(
      ctx.status(201),
      ctx.json({
        id: 1,
        email: 'mary.smith@protonmail.com',
      })
    )
  }),
]

/* Create an MSW "request-interception layer". */
const quasiServer = setupServer(...requestHandlersToMock)

describe('thunk-action creators', () => {
  let storeMock

  beforeAll(() => {
    // Enable API mocking.
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
    // Disable API mocking.
    quasiServer.close()
  })

  test('createUser + its HTTP request is mocked to succeed', async () => {
    const createUserPromise = storeMock.dispatch(
      createUser('mocked-mary.smith@protonmail.com', 'mocked-456')
    )

    await expect(createUserPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'auth/createUser/pending' },
      { type: 'auth/createUser/fulfilled' },
    ])
  })
})
