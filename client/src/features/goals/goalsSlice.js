import axios from 'axios'

const initialState = {
  requestStatus: 'idle', // or: 'loading', 'succeeded', 'failed'
  requestError: null,
  ids: [],
  entities: {},
}

export default function goalsReducer(state = initialState, action) {
  switch (action.type) {
    case 'goals/createGoal/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: goals/createGoal/pending */

    case 'goals/createGoal/fulfilled': {
      const goal = action.payload

      const newIds = state.ids.concat(goal.id)
      const newEntities = {
        ...state.entities,
        [goal.id]: goal,
      }

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    } /* end: goals/createGoal/fulfilled */

    case 'goals/createGoal/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: goals/createGoal/rejected */

    case 'goals/fetchGoals/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: goals/fetchGoals/pending */

    case 'goals/fetchGoals/fulfilled': {
      const goals = action.payload

      const newIds = goals.map((goal) => goal.id)
      const newEntities = goals.reduce((goalsObj, goal) => {
        goalsObj[goal.id] = goal
        return goalsObj
      }, {})

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        ids: newIds,
        entities: newEntities,
      }
    } /* end: goals/fetchGoals/fulfilled */

    case 'goals/fetchGoals/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: goals/fetchGoals/rejected */

    case 'goals/reinitializeGoalsSlice': {
      return initialState
    } /* end: goals/reinitializeGoalsSlice */

    case 'goals/editGoal/pending': {
      return {
        ...state,
        requestStatus: 'loading',
      }
    } /* end: goals/editGoal/pending */

    case 'goals/editGoal/fulfilled': {
      const editedGoal = action.payload

      const newEntities = {
        ...state.entities,
        [editedGoal.id]: editedGoal,
      }

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        entities: newEntities,
      }
    } /* end: goals/editGoal/fulfilled */

    case 'goals/editGoal/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: goals/editGoal/rejected */

    case 'goals/deleteGoal/pending': {
      return {
        ...state,
        requestStatus: 'pending',
      }
    } /* end: goals/deleteGoal/pending */

    case 'goals/deleteGoal/fulfilled': {
      const idOfDeletedGoal = action.payload

      const remainingIds = state.ids.filter((id) => id !== idOfDeletedGoal)

      const remainingEntities = { ...state.entities }
      delete remainingEntities[idOfDeletedGoal]

      return {
        ...state,
        requestStatus: 'succeeded',
        requestError: null,
        ids: remainingIds,
        entities: remainingEntities,
      }
    } /* end: goals/deleteGoal/fulfilled */

    case 'goals/deleteGoal/rejected': {
      return {
        ...state,
        requestStatus: 'failed',
        requestError: action.error,
      }
    } /* end: goals/deleteGoal/rejected */

    default:
      return state
  } /* end: switch */
}

/* Action creator functions */
const createGoalPending = () => ({
  type: 'goals/createGoal/pending',
})

const createGoalFulfilled = (goal) => ({
  type: 'goals/createGoal/fulfilled',
  payload: goal,
})

const createGoalRejected = (error) => ({
  type: 'goals/createGoal/rejected',
  error,
})

const fetchGoalsPending = () => ({
  type: 'goals/fetchGoals/pending',
})

const fetchGoalsFulfilled = (goals) => ({
  type: 'goals/fetchGoals/fulfilled',
  payload: goals,
})

const fetchGoalsRejected = (error) => ({
  type: 'goals/fetchGoals/rejected',
  error,
})

export const reinitializeGoalsSlice = () => ({
  type: 'goals/reinitializeGoalsSlice',
})

const editGoalPending = () => ({
  type: 'goals/editGoal/pending',
})

const editGoalFulfilled = (editedGoal) => ({
  type: 'goals/editGoal/fulfilled',
  payload: editedGoal,
})

const editGoalRejected = (error) => ({
  type: 'goals/editGoal/rejected',
  error,
})

const deleteGoalPending = () => ({
  type: 'goals/deleteGoal/pending',
})

const deleteGoalFulfilled = (goalId) => ({
  type: 'goals/deleteGoal/fulfilled',
  payload: goalId,
})

const deleteGoalRejected = (error) => ({
  type: 'goals/deleteGoal/rejected',
  error,
})

/* "Thunk action creator" functions */
export const createGoal = (description) => async (dispatch) => {
  const body = { description }

  const token = localStorage.getItem('goal-tracker-token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(createGoalPending())
  try {
    const response = await axios.post('/api/v1.0/goals', body, config)
    dispatch(createGoalFulfilled(response.data))
    return Promise.resolve()
  } catch (err) {
    const errorPayload = err.response.data
    const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
    dispatch(createGoalRejected(actionError))
    return Promise.reject(actionError)
  }
}

export const fetchGoals = () => async (dispatch) => {
  const token = localStorage.getItem('goal-tracker-token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(fetchGoalsPending())
  try {
    const response = await axios.get('/api/v1.0/goals', config)
    dispatch(fetchGoalsFulfilled(response.data.goals))
    return Promise.resolve()
  } catch (err) {
    const errorPayload = err.response.data
    const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
    dispatch(fetchGoalsRejected(actionError))
    return Promise.reject(actionError)
  }
}

export const editGoal = (id, newDescription) => async (dispatch) => {
  const body = { description: newDescription }

  const token = localStorage.getItem('goal-tracker-token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(editGoalPending())
  try {
    const response = await axios.put(`/api/v1.0/goals/${id}`, body, config)
    dispatch(editGoalFulfilled(response.data))
    return Promise.resolve()
  } catch (err) {
    const errorPayload = err.response.data
    const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
    dispatch(editGoalRejected(actionError))
    return Promise.reject(actionError)
  }
}

export const deleteGoal = (goalId) => async (dispatch) => {
  const token = localStorage.getItem('goal-tracker-token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  dispatch(deleteGoalPending())
  try {
    const response = await axios.delete(`/api/v1.0/goals/${goalId}`, config)
    dispatch(deleteGoalFulfilled(goalId))
    return Promise.resolve()
  } catch (err) {
    const errorPayload = err.response.data
    const actionError = errorPayload.message || 'ERROR NOT FROM BACKEND'
    dispatch(deleteGoalRejected(actionError))
    return Promise.reject(actionError)
  }
}

export const selectGoalIds = (state) => state.goals.ids

export const selectGoalEntities = (state) => state.goals.entities
