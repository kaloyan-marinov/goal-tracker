import axios from 'axios'
import { RequestStatus } from '../../constants'
import { GOAL_TRACKER_TOKEN } from '../auth/authSlice'

export const initialStateIntervals = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  _meta: {
    total_items: null,
    per_page: null,
    total_pages: null,
    page: null,
  },
  _links: {
    self: null,
    next: null,
    prev: null,
    first: null,
    last: null,
  },
  ids: [],
  entities: {},
}

export default function intervalsReducer(
  state = initialStateIntervals,
  action
) {
  switch (action.type) {
    case 'intervals/createInterval/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'intervals/createInterval/fulfilled': {
      const interval = action.payload

      const newIds = state.ids.concat(interval.id)
      const newEntities = {
        ...state.entities,
        [interval.id]: interval,
      }

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    }

    case 'intervals/createInterval/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

    case 'intervals/fetchIntervals/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'intervals/fetchIntervals/fulfilled': {
      const { _meta, _links, items: intervals } = action.payload

      const newIds = intervals.map((interval) => interval.id)
      const newEntities = intervals.reduce((intervalsObj, interval) => {
        intervalsObj[interval.id] = interval
        return intervalsObj
      }, {})

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        _meta,
        _links,
        ids: newIds,
        entities: newEntities,
      }
    }

    case 'intervals/fetchIntervals/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

    case 'intervals/reinitializeIntervalsSlice': {
      return initialStateIntervals
    }

    case 'intervals/editInterval/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'intervals/editInterval/fulfilled': {
      const editedGoal = action.payload

      const newEntities = {
        ...state.entities,
        [editedGoal.id]: editedGoal,
      }

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        entities: newEntities,
      }
    }

    case 'intervals/editInterval/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

    case 'intervals/deleteInterval/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'intervals/deleteInterval/fulfilled': {
      const idOfDeletedInterval = action.payload

      const remainingIds = state.ids.filter((id) => id !== idOfDeletedInterval)

      const remainingEntities = { ...state.entities }
      delete remainingEntities[idOfDeletedInterval]

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: remainingIds,
        entities: remainingEntities,
      }
    }

    case 'intervals/deleteInterval/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

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

export const fetchIntervalsFulfilled = (_meta, _links, items) => ({
  type: 'intervals/fetchIntervals/fulfilled',
  payload: {
    _meta,
    _links,
    items,
  },
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

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
      },
    }

    dispatch(createIntervalPending())
    try {
      console.log(`issuing the following request: POST /api/v1.0/intervals`)

      const response = await axios.post('/api/v1.0/intervals', body, config)
      dispatch(createIntervalFulfilled(response.data))
      return Promise.resolve()
    } catch (err) {
      const responseBodyError =
        err.response.data.error ||
        'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      dispatch(createIntervalRejected(responseBodyError))
      return Promise.reject(err)
    }
  }

export const fetchIntervals =
  (urlForOnePageOfIntervals) => async (dispatch) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
      },
    }

    dispatch(fetchIntervalsPending())
    try {
      console.log(
        `issuing the following request: GET ${urlForOnePageOfIntervals}`
      )

      const response = await axios.get(urlForOnePageOfIntervals, config)
      dispatch(
        fetchIntervalsFulfilled(
          response.data._meta,
          response.data._links,
          response.data.items
        )
      )
      return Promise.resolve()
    } catch (err) {
      const responseBodyError =
        err.response.data.error ||
        'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      dispatch(fetchIntervalsRejected(responseBodyError))
      return Promise.reject(err)
    }
  }

export const editInterval =
  (intervalId, goalId, startTimestamp, finalTimestamp) => async (dispatch) => {
    const body = {
      goal_id: Number(goalId),
      start: startTimestamp,
      final: finalTimestamp,
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
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
      const responseBodyError =
        err.response.data.error ||
        'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      dispatch(editIntervalRejected(responseBodyError))
      return Promise.reject(err)
    }
  }

export const deleteInterval = (intervalId) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
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
    const responseBodyError =
      err.response.data.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(deleteIntervalRejected(responseBodyError))
    return Promise.reject(err)
  }
}

export const selectIntervalIds = (state) => state.intervals.ids

export const selectIntervalEntities = (state) => state.intervals.entities

export const selectIntervalsMeta = (state) => state.intervals._meta

export const selectIntervalsLinks = (state) => state.intervals._links
