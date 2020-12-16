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
    case 'auth/createUser/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: auth/createUser/pending */

    case 'auth/createUser/fulfilled': {
      return {
        ...state,
        requestStatus: 'succeeded', // TODO: find the commit where this was added and replace the "fulfilled" in that commit with "succeeded"
      }
    } /* end: auth/createUser/fulfilled */

    case 'auth/createUser/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        // error: action.error, // TODO: find out if this should be added (or should have first been added) to the "implement an authSlice, and within that a register() "thunk action" + dispatch register() from <Register>" commit
      }
    } /* end: auth/createUser/rejected */

    case 'auth/issueJWSToken/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: auth/issueJWSToken/pending */

    case 'auth/issueJWSToken/fulfilled': {
      const token = action.payload

      localStorage.setItem('goal-tracker-token', token)

      return {
        ...state,
        requestStatus: 'succeeded',
        token,
        isAuthenticated: true,
      }
    } /* end: auth/issueJWSToken/fulfilled */

    case 'auth/issueJWSToken/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        // error: action.error, // find out if this should be added (or should have first been added) to the commit that adds this case
      }
    } /* end: auth/issueJWSToken/rejected */

    case 'auth/fetchUser/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: auth/fetchUser/pending */

    case 'auth/fetchUser/fulfilled': {
      const user = action.payload

      return {
        ...state,
        requestStatus: 'succeeded',
        isAuthenticated: true,
        currentUser: user,
      }
    } /* end: auth/fetchUser/fulfilled */

    case 'auth/fetchUser/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
      }
    } /* end: auth/fetchUser/rejected */

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
    } /* end: auth/logout */

    default:
      return state
  } /* end: switch */
}

/* Action creator functions */
const createUserPending = () => ({
  type: 'auth/createUser/pending',
})

const createUserFulfilled = () => ({
  type: 'auth/createUser/fulfilled',
})

const createUserRejected = (error) => ({
  type: 'auth/createUser/rejected',
  error,
})

const issueJWSTokenPending = () => ({
  type: 'auth/issueJWSToken/pending',
})

const issueJWSTokenFulfilled = (token) => ({
  type: 'auth/issueJWSToken/fulfilled',
  payload: token,
})

const issueJWSTokenRejected = (error) => ({
  type: 'auth/issueJWSToken/rejected',
  error,
})

const fetchUserPending = () => ({
  type: 'auth/fetchUser/pending',
})

const fetchUserFulfilled = (user) => ({
  type: 'auth/fetchUser/fulfilled',
  payload: user,
})

const fetchUserRejected = (error) => ({
  type: 'auth/fetchUser/rejected',
  error,
})

export const logout = () => ({
  type: 'auth/logout',
})

/* "Thunk action creator" functions */
export const createUser = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const body = JSON.stringify({ email, password })

  dispatch(createUserPending())
  try {
    const response = await axios.post('/api/v1.0/users', body, config)
    dispatch(createUserFulfilled())

    dispatch(displayAlertTemporarily('YOU HAVE SUCCESSFULLY REGISTERED'))

    return Promise.resolve()
  } catch (error) {
    dispatch(createUserRejected(error.toString()))

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

export const fetchUser = () => async (dispatch) => {
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

  dispatch(fetchUserPending())
  try {
    const response = await axios.get('/api/v1.0/user', config)
    dispatch(fetchUserFulfilled(response.data))
  } catch (error) {
    dispatch(fetchUserRejected(error.toString()))
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
