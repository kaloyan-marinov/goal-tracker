import alertsReducer from './features/alerts/alertsSlice'
import { combineReducers } from 'redux'
import authReducer from './features/auth/authSlice'

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
})

export default rootReducer
