import axios from 'axios'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const initialState = {
  requestStatus: 'idle', // or: 'loading', 'succeeded', 'failed',
  token: localStorage.getItem('goal-tracker-token'),
  isAuthenticated: null,
  currentUser: null,
}

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'auth/registerPending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: auth/registerPending */

    case 'auth/registerFulfilled': {
      return {
        ...state,
        requestStatus: 'succeeded', // TODO: find the commit where this was added and replace the "fulfilled" in that commit with "succeeded"
      }
    } /* end: auth/registerFulfilled */

    case 'auth/registerRejected': {
      return {
        ...state,
        requestStatus: 'failed',
        // error: action.error, // TODO: find out if this should be added (or should have first been added) to the "implement an authSlice, and within that a register() "thunk action" + dispatch register() from <Register>" commit
      }
    } /* end: auth/registerRejected */

    case 'auth/issueJWSTokenPending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: auth/issueJWSTokenPending */

    case 'auth/issueJWSTokenFulfilled': {
      const token = action.payload

      localStorage.setItem('goal-tracker-token', token)

      return {
        ...state,
        requestStatus: 'succeeded',
        token,
        isAuthenticated: true,
      }
    } /* end: auth/issueJWSTokenFulfilled */

    case 'auth/issueJWSTokenRejected': {
      return {
        ...state,
        requestStatus: 'failed',
        // error: action.error, // find out if this should be added (or should have first been added) to the commit that adds this case
      }
    } /* end: auth/issueJWSTokenRejected */

    case 'auth/loadUserPending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: auth/loadUserPending */

    case 'auth/loadUserFulfilled': {
      const user = action.payload

      return {
        ...state,
        requestStatus: 'succeeded',
        isAuthenticated: true,
        currentUser: user,
      }
    } /* end: auth/loadUserFulfilled */

    case 'auth/loadUserRejected': {
      return {
        ...state,
        requestStatus: 'failed',
      }
    } /* end: auth/loadUserRejected */

    case 'auth/logout': {
      localStorage.removeItem('goal-tracker-token')

      /* TODO: find out
               why the auth reducer in the devconnector repo does not set `user: null`
               when reducing/handling the LOGOUT action type */
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
const registerPending = () => ({
  type: 'auth/registerPending',
})

const registerFulfilled = () => ({
  type: 'auth/registerFulfilled',
})

const registerRejected = (error) => ({
  type: 'auth/registerRejected',
  error,
})

const issueJWSTokenPending = () => ({
  type: 'auth/issueJWSTokenPending',
})

const issueJWSTokenFulfilled = (token) => ({
  type: 'auth/issueJWSTokenFulfilled',
  payload: token,
})

const issueJWSTokenRejected = (error) => ({
  type: 'auth/issueJWSTokenRejected',
  error,
})

const loadUserPending = () => ({
  type: 'auth/loadUserPending',
})

const loadUserFulfilled = (user) => ({
  type: 'auth/loadUserFulfilled',
  payload: user,
})

const loadUserRejected = (error) => ({
  type: 'auth/loadUserRejected',
  error,
})

export const logout = () => ({
  type: 'auth/logout',
})

/* "Thunk action creator" functions */
export const register = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const body = JSON.stringify({ email, password })

  dispatch(registerPending())
  try {
    const response = await axios.post('/api/v1.0/users', body, config)
    dispatch(registerFulfilled())

    dispatch(displayAlertTemporarily('[YOU HAVE SUCCESSFULLY REGISTERED]'))

    return Promise.resolve()
  } catch (error) {
    dispatch(registerRejected(error.toString()))

    const payload = error.response.data
    dispatch(displayAlertTemporarily(`[${payload.message}]`))

    return Promise.reject()
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
    const response = await axios.post('/api/v1.0/tokens', body, config)
    dispatch(issueJWSTokenFulfilled(response.data.token))
    return Promise.resolve()
  } catch (error) {
    dispatch(issueJWSTokenRejected(error.toString()))
    return Promise.reject()
  }
}

export const loadUser = () => async (dispatch) => {
  const body = {}
  /* TODO: remove the previous instruction altogether,
           because no body is to be sent when making an axios.get() request
  */

  const token = localStorage.getItem('goal-tracker-token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(loadUserPending())
  try {
    const response = await axios.get('/api/v1.0/user', config)
    dispatch(loadUserFulfilled(response.data))
  } catch (error) {
    dispatch(loadUserRejected(error.toString()))
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
