import axios from 'axios'
import { RequestStatus } from '../../constants'
import { GOAL_TRACKER_TOKEN } from '../auth/authSlice'

export const initialStateGoals = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  ids: [],
  entities: {},
}

export default function goalsReducer(state = initialStateGoals, action) {
  switch (action.type) {
    case 'goals/createGoal/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'goals/createGoal/fulfilled': {
      const goal = action.payload

      const newIds = state.ids.concat(goal.id)
      const newEntities = {
        ...state.entities,
        [goal.id]: goal,
      }

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    }

    case 'goals/createGoal/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

    case 'goals/fetchGoals/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'goals/fetchGoals/fulfilled': {
      const goals = action.payload

      const newIds = goals.map((goal) => goal.id)
      const newEntities = goals.reduce((goalsObj, goal) => {
        goalsObj[goal.id] = goal
        return goalsObj
      }, {})

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    }

    case 'goals/fetchGoals/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

    case 'goals/reinitializeGoalsSlice': {
      return initialStateGoals
    }

    case 'goals/editGoal/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'goals/editGoal/fulfilled': {
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

    case 'goals/editGoal/rejected': {
      return {
        ...state,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      }
    }

    case 'goals/deleteGoal/pending': {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      }
    }

    case 'goals/deleteGoal/fulfilled': {
      const idOfDeletedGoal = action.payload

      const remainingIds = state.ids.filter((id) => id !== idOfDeletedGoal)

      const remainingEntities = { ...state.entities }
      delete remainingEntities[idOfDeletedGoal]

      return {
        ...state,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: remainingIds,
        entities: remainingEntities,
      }
    }

    case 'goals/deleteGoal/rejected': {
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
export const createGoalPending = () => ({
  type: 'goals/createGoal/pending',
})

export const createGoalFulfilled = (goal) => ({
  type: 'goals/createGoal/fulfilled',
  payload: goal,
})

export const createGoalRejected = (error) => ({
  type: 'goals/createGoal/rejected',
  error,
})

export const fetchGoalsPending = () => ({
  type: 'goals/fetchGoals/pending',
})

export const fetchGoalsFulfilled = (goals) => ({
  type: 'goals/fetchGoals/fulfilled',
  payload: goals,
})

export const fetchGoalsRejected = (error) => ({
  type: 'goals/fetchGoals/rejected',
  error,
})

export const reinitializeGoalsSlice = () => ({
  type: 'goals/reinitializeGoalsSlice',
})

export const editGoalPending = () => ({
  type: 'goals/editGoal/pending',
})

export const editGoalFulfilled = (editedGoal) => ({
  type: 'goals/editGoal/fulfilled',
  payload: editedGoal,
})

export const editGoalRejected = (error) => ({
  type: 'goals/editGoal/rejected',
  error,
})

export const deleteGoalPending = () => ({
  type: 'goals/deleteGoal/pending',
})

export const deleteGoalFulfilled = (goalId) => ({
  type: 'goals/deleteGoal/fulfilled',
  payload: goalId,
})

export const deleteGoalRejected = (error) => ({
  type: 'goals/deleteGoal/rejected',
  error,
})

/* Thunk-action creator functions */
export const createGoal = (description) => async (dispatch) => {
  const body = { description }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
    },
  }

  dispatch(createGoalPending())
  try {
    console.log('issuing the following request: POST /api/v1.0/goals')

    const response = await axios.post('/api/v1.0/goals', body, config)
    dispatch(createGoalFulfilled(response.data))
    return Promise.resolve()
  } catch (err) {
    const responseBodyError =
      err.response.data.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(createGoalRejected(responseBodyError))
    return Promise.reject(err)
  }
}

export const fetchGoals = () => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
    },
  }

  dispatch(fetchGoalsPending())
  try {
    console.log('issuing the following request: GET /api/v1.0/goals')

    const response = await axios.get('/api/v1.0/goals', config)
    console.log('inspecting response')
    console.log(response)
    dispatch(fetchGoalsFulfilled(response.data.goals))
    return Promise.resolve()
  } catch (err) {
    console.error('inspecting err')
    console.error(err)
    const responseBodyError =
      err.response.data.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(fetchGoalsRejected(responseBodyError))
    return Promise.reject(err)
  }
}

export const editGoal = (id, newDescription) => async (dispatch) => {
  const body = { description: newDescription }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
    },
  }

  dispatch(editGoalPending())
  try {
    console.log(`issuing the following request: PUT /api/v1.0/goals/${id}`)

    const response = await axios.put(`/api/v1.0/goals/${id}`, body, config)
    dispatch(editGoalFulfilled(response.data))
    return Promise.resolve()
  } catch (err) {
    const responseBodyError =
      err.response.data.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(editGoalRejected(responseBodyError))
    return Promise.reject(err)
  }
}

export const deleteGoal = (goalId) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem(GOAL_TRACKER_TOKEN),
    },
  }

  dispatch(deleteGoalPending())
  try {
    console.log(
      `issuing the following request: DELETE /api/v1.0/goals/${goalId}`
    )

    const response = await axios.delete(`/api/v1.0/goals/${goalId}`, config)
    dispatch(deleteGoalFulfilled(goalId))
    return Promise.resolve()
  } catch (err) {
    const responseBodyError =
      err.response.data.error ||
      'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
    dispatch(deleteGoalRejected(responseBodyError))
    return Promise.reject(err)
  }
}

export const selectGoalIds = (state) => state.goals.ids

export const selectGoalEntities = (state) => state.goals.entities
