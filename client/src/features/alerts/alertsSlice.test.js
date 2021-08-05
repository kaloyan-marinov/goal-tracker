import { alertSet, alertRemoved, initialStateAlerts } from './alertsSlice'
import alertsReducer from './alertsSlice'
import { expect, test } from '@jest/globals'

const ALERT = {
  id: 'alert-id-17',
  message: 'An error has been encountered!',
}

describe('action creators', () => {
  test('alertSet', () => {
    const action = alertSet(ALERT)

    expect(action).toEqual({
      type: 'alerts/alertSet',
      payload: ALERT,
    })
  })

  test('alertRemoved', () => {
    const action = alertRemoved('alert-id-17')

    expect(action).toEqual({
      type: 'alerts/alertRemoved',
      payload: 'alert-id-17',
    })
  })
})

describe('slice reducer', () => {
  test('alerts/alertSet', () => {
    const initStAlerts = {
      ...initialStateAlerts,
    }
    const action = {
      type: 'alerts/alertSet',
      payload: ALERT,
    }

    const newSt = alertsReducer(initStAlerts, action)

    expect(newSt).toEqual({
      entities: {
        [ALERT.id]: ALERT,
      },
    })
  })

  test('alerts/alertRemoved', () => {
    const initStAlerts = {
      ...initialStateAlerts,
      entities: {
        [ALERT.id]: ALERT,
        'alert-id-27': {
          id: 'alert-id-27',
          message: 'This alert will be removed!',
        },
      },
    }
    const action = {
      type: 'alerts/alertRemoved',
      payload: 'alert-id-27',
    }

    const newSt = alertsReducer(initStAlerts, action)

    expect(newSt).toEqual({
      entities: {
        [ALERT.id]: ALERT,
      },
    })
  })
})
