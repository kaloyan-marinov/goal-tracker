import alertsReducer from './features/alerts/alertsSlice'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  alerts: alertsReducer,
})

export default rootReducer
