import { v4 as uuidv4 } from 'uuid'

export const initialStateAlerts = {
  entities: {},
}

export default function alertsReducer(state = initialStateAlerts, action) {
  switch (action.type) {
    case 'alerts/alertSet': {
      const alert = action.payload

      return {
        ...state,
        entities: {
          ...state.entities,
          [alert.id]: alert,
        },
      }
    }

    case 'alerts/alertRemoved': {
      const alertId = action.payload

      const newEntities = { ...state.entities }
      delete newEntities[alertId]

      return {
        ...state,
        entities: newEntities,
      }
    }

    default:
      return state
  } /* end: switch */
}

/* Action creator functions */
export const alertSet = (alert) => ({ type: 'alerts/alertSet', payload: alert })

export const alertRemoved = (alertId) => ({
  type: 'alerts/alertRemoved',
  payload: alertId,
})

/* Thunk-action creator functions */
export const displayAlertTemporarily =
  (message, timeout = 5000) =>
  (dispatch) => {
    const alertId = uuidv4()

    const alert = {
      id: alertId,
      message: message,
    }
    dispatch(alertSet(alert))

    setTimeout(() => dispatch(alertRemoved(alert.id)), timeout)
  }
