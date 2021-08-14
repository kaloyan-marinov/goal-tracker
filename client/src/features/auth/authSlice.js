import axios from 'axios'

export const GOAL_TRACKER_TOKEN = 'goal-tracker-token'

export const initialStateAuth = {
  requestStatus: 'idle', // or: 'loading', 'succeeded', 'failed',
  requestError: null, // or: string
  token: localStorage.getItem(GOAL_TRACKER_TOKEN),
  isAuthenticated: null,
  currentUser: null,
}

export default function authReducer(state = initialStateAuth, action) {
  switch (action.type) {
    case 'auth/createUser/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    }

    case 'auth/createUser/fulfilled': {
      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
      }
    }

    case 'auth/createUser/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    }

    case 'auth/issueJWSToken/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    }

    case 'auth/issueJWSToken/fulfilled': {
      const token = action.payload

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        token,
        isAuthenticated: true,
      }
    }

    case 'auth/issueJWSToken/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    }

    case 'auth/fetchUser/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    }

    case 'auth/fetchUser/fulfilled': {
      const user = action.payload

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        isAuthenticated: true,
        currentUser: user,
      }
    }

    case 'auth/fetchUser/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    }

    case 'auth/removeJWSToken': {
      /*
      TODO: find out
            why the auth reducer in the devconnector repo does not set `user: null`
            when reducing/handling the LOGOUT action type
      */

      return {
        ...state,
        token: null,
        isAuthenticated: false,
        currentUser: null,
      }
    }

    default:
      return state
  } /* end: switch */
}

/* Action creator functions */
export const createUserPending = () => ({
  type: 'auth/createUser/pending',
})

export const createUserFulfilled = () => ({
  type: 'auth/createUser/fulfilled',
})

export const createUserRejected = (error) => ({
  type: 'auth/createUser/rejected',
  error,
})

export const issueJWSTokenPending = () => ({
  type: 'auth/issueJWSToken/pending',
})

export const issueJWSTokenFulfilled = (token) => ({
  type: 'auth/issueJWSToken/fulfilled',
  payload: token,
})

export const issueJWSTokenRejected = (error) => ({
  type: 'auth/issueJWSToken/rejected',
  error,
})

export const fetchUserPending = () => ({
  type: 'auth/fetchUser/pending',
})

export const fetchUserFulfilled = (user) => ({
  type: 'auth/fetchUser/fulfilled',
  payload: user,
})

export const fetchUserRejected = (error) => ({
  type: 'auth/fetchUser/rejected',
  error,
})

export const removeJWSToken = () => ({
  type: 'auth/removeJWSToken',
})

/* Thunk-action creator functions */
export const createUser = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const body = JSON.stringify({ email, password })

  dispatch(createUserPending())
  try {
    console.log('issuing the following request: POST /api/v1.0/user')

    const response = await axios.post('/api/v1.0/users', body, config)
    dispatch(createUserFulfilled())
    return Promise.resolve()
  } catch (err) {
    const responseBody = err.response.data
    const responseBodyMessage =
      responseBody.message ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(createUserRejected(responseBodyMessage))
    return Promise.reject(responseBodyMessage)
  }
}

export const issueJWSToken = (email, password) => async (dispatch) => {
  const body = {}

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: email,
      password,
    },
  }

  dispatch(issueJWSTokenPending())
  try {
    console.log('issuing the following request: POST /api/v1.0/tokens')

    const response = await axios.post('/api/v1.0/tokens', body, config)
    localStorage.setItem(GOAL_TRACKER_TOKEN, response.data.token)
    dispatch(issueJWSTokenFulfilled(response.data.token))
    return Promise.resolve()
  } catch (err) {
    const responseBody = err.response.data
    const responseBodyError =
      responseBody.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(issueJWSTokenRejected(responseBodyError))
    return Promise.reject(responseBodyError)
  }
}

export const fetchUser = () => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
    },
  }

  dispatch(fetchUserPending())
  try {
    console.log('issuing the following request: GET /api/v1.0/user')

    const response = await axios.get('/api/v1.0/user', config)
    dispatch(fetchUserFulfilled(response.data))
    return Promise.resolve()
  } catch (err) {
    const responseBody = err.response.data
    const responseBodyError =
      responseBody.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(fetchUserRejected(responseBodyError))
    return Promise.reject(err)
  }
}

export const logout = () => {
  return (dispatch) => {
    localStorage.removeItem('goal-tracker-token')
    dispatch(removeJWSToken())
  }
}

/* Selector functions */
export const selectIsAuthenticated = (state) => {
  /*
  TODO:
  in the commit that added this comment, I noticed
  that navigating to /login or /register actually calls this selector function twice
  - why is that?
  */
  return state.auth.isAuthenticated
}

export const selectRequestStatus = (state) => state.auth.requestStatus

export const selectCurrentUser = (state) => state.auth.currentUser
