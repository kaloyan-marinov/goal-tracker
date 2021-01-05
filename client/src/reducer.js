import alertsReducer from './features/alerts/alertsSlice'
import { combineReducers } from 'redux'
import authReducer from './features/auth/authSlice'
import goalsReducer from './features/goals/goalsSlice'

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  goals: goalsReducer,
})

export default rootReducer
