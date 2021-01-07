import alertsReducer from './features/alerts/alertsSlice'
import { combineReducers } from 'redux'
import authReducer from './features/auth/authSlice'
import goalsReducer from './features/goals/goalsSlice'
import intervalsReducer from './features/intervals/intervalsSlice'

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  goals: goalsReducer,
  intervals: intervalsReducer,
})

export default rootReducer
