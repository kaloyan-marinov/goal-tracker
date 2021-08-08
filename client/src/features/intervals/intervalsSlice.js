import axios from 'axios'

export const initialStateIntervals = {
  requestStatus: 'idle', // or: 'loading', 'succeeded', 'failed'
  requestError: null,
  ids: [],
  entities: {},
}

export default function intervalsReducer(
  state = initialStateIntervals,
  action
) {
  switch (action.type) {
    /* TODO: rectify this as part of g-t-i-37 */
    case 'intervals/createInterval/pending': {
      return {
        ...state,
        requestStatus: 'pending',
      }
    } /* end: intervals/createInterval/pending */

    case 'intervals/createInterval/fulfilled': {
      const interval = action.payload

      const newIds = state.ids.concat(interval.id)
      const newEntities = {
        ...state.entities,
        [interval.id]: interval,
      }

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    } /* end: intervals/createInterval/fulfilled */

    case 'intervals/createInterval/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: intervals/createInterval/rejected */

    /* TODO: rectify this as part of g-t-i-37 */
    case 'intervals/fetchIntervals/pending': {
      return {
        ...state,
        requestStatus: 'pending',
      }
    } /* end: intervals/fetchIntervals/pending */

    case 'intervals/fetchIntervals/fulfilled': {
      const intervals = action.payload

      const newIds = intervals.map((interval) => interval.id)
      const newEntities = intervals.reduce((intervalsObj, interval) => {
        intervalsObj[interval.id] = interval
        return intervalsObj
      }, {})

      /* TODO: rectify this as part of g-t-i-37 */
      return {
        ...state,
        requestStatus: 'fulfilled',
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    } /* end: intervals/fetchIntervals/fulfilled */

    case 'intervals/fetchIntervals/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      } /* end: intervals/fetchIntervals/rejected */
    }

    case 'intervals/reinitializeIntervalsSlice': {
      return initialStateIntervals
    } /* end: intervals/reinitializeIntervalsSlice */

    case 'intervals/editInterval/pending': {
      /* TODO: rectify this as part of g-t-i-37 */
      return {
        ...state,
        requestStatus: 'pending',
      }
    } /* end: intervals/editInterval/pending */

    case 'intervals/editInterval/fulfilled': {
      /* TODO: rectify this as part of g-t-i-38 */
      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
      }
    } /* end: intervals/editInterval/fulfilled */

    case 'intervals/editInterval/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: intervals/editInterval/rejected */

    case 'intervals/deleteInterval/pending': {
      /* TODO: rectify this as part of g-t-i-37 */
      return {
        ...state,
        requestStatus: 'pending',
      }
    } /* end: intervals/deleteInterval/pending */

    case 'intervals/deleteInterval/fulfilled': {
      /* TODO: rectify this as part of g-t-i-38 */
      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
      } /* end: intervals/deleteInterval/fulfilled */
    }

    case 'intervals/deleteInterval/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: intervals/deleteInterval/rejected */

    default:
      return state
  } /* end: switch */
}

/* Action creator functions */
export const createIntervalPending = () => ({
  type: 'intervals/createInterval/pending',
})

export const createIntervalFulfilled = (interval) => ({
  type: 'intervals/createInterval/fulfilled',
  payload: interval,
})

export const createIntervalRejected = (error) => ({
  type: 'intervals/createInterval/rejected',
  error,
})

export const fetchIntervalsPending = () => ({
  type: 'intervals/fetchIntervals/pending',
})

export const fetchIntervalsFulfilled = (intervals) => ({
  type: 'intervals/fetchIntervals/fulfilled',
  payload: intervals,
})

export const fetchIntervalsRejected = (error) => ({
  type: 'intervals/fetchIntervals/rejected',
  error,
})

export const reinitializeIntervalsSlice = () => ({
  type: 'intervals/reinitializeIntervalsSlice',
})

export const editIntervalPending = () => ({
  type: 'intervals/editInterval/pending',
})

export const editIntervalFulfilled = (interval) => ({
  type: 'intervals/editInterval/fulfilled',
  payload: interval,
})

export const editIntervalRejected = (error) => ({
  type: 'intervals/editInterval/rejected',
  error,
})

export const deleteIntervalPending = () => ({
  type: 'intervals/deleteInterval/pending',
})

export const deleteIntervalFulfilled = (intervalId) => ({
  type: 'intervals/deleteInterval/fulfilled',
  payload: intervalId,
})

export const deleteIntervalRejected = (error) => ({
  type: 'intervals/deleteInterval/rejected',
  error,
})

/* Thunk-action creator functions */
export const createInterval =
  (goalId, startTimestamp, finalTimestamp) => async (dispatch) => {
    const body = {
      goal_id: Number(goalId),
      start: startTimestamp,
      final: finalTimestamp,
    }

    const token = localStorage.getItem('goal-tracker-token')
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }

    dispatch(createIntervalPending())
    try {
      console.log(`issuing the following request: POST /api/v1.0/intervals`)

      const response = await axios.post('/api/v1.0/intervals', body, config)
      dispatch(createIntervalFulfilled(response.data))
      return Promise.resolve()
    } catch (err) {
      const errorPayload = err.response.data
      const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
      dispatch(createIntervalRejected(actionError))
      return Promise.reject(actionError)
    }
  }

export const fetchIntervals = () => async (dispatch) => {
  const token = localStorage.getItem('goal-tracker-token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(fetchIntervalsPending())
  try {
    console.log(`issuing the following request: GET /api/v1.0/intervals`)

    const response = await axios.get('/api/v1.0/intervals', config)
    dispatch(fetchIntervalsFulfilled(response.data.intervals))
    return Promise.resolve()
  } catch (err) {
    const errorPayload = err.response.data
    const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
    dispatch(fetchIntervalsRejected(actionError))
    return Promise.reject(actionError)
  }
}

export const editInterval =
  (intervalId, goalId, startTimestamp, finalTimestamp) => async (dispatch) => {
    const body = {
      goal_id: Number(goalId),
      start: startTimestamp,
      final: finalTimestamp,
    }

    const token = localStorage.getItem('goal-tracker-token')
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }

    dispatch(editIntervalPending())
    try {
      console.log(
        `issuing the following request: PUT /api/v1.0/intervals/${intervalId}`
      )

      const response = await axios.put(
        `/api/v1.0/intervals/${intervalId}`,
        body,
        config
      )
      dispatch(editIntervalFulfilled(response.data))
      return Promise.resolve()
    } catch (err) {
      const errorPayload = err.response.data
      const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
      dispatch(editIntervalRejected(actionError))
      return Promise.reject(actionError)
    }
  }

export const deleteInterval = (intervalId) => async (dispatch) => {
  const token = localStorage.getItem('goal-tracker-token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(deleteIntervalPending())
  try {
    console.log(
      `issuing the following request: DELETE /api/v1.0/intervals/${intervalId}`
    )

    const response = await axios.delete(
      `/api/v1.0/intervals/${intervalId}`,
      config
    )
    dispatch(deleteIntervalFulfilled(intervalId))
    return Promise.resolve()
  } catch (err) {
    const errorPayload = err.response.data
    const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
    dispatch(deleteIntervalRejected(actionError))
    return Promise.reject(actionError)
  }
}

export const selectIntervalIds = (state) => state.intervals.ids

export const selectIntervalEntities = (state) => state.intervals.entities
