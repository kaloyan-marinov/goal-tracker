import {
  alertSet,
  alertRemoved,
  initialStateAlerts,
  displayAlertTemporarily,
} from './alertsSlice'
import alertsReducer from './alertsSlice'

import thunkMiddleware from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

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

const createStoreMock = configureMockStore([thunkMiddleware])

describe('thunk-action creators', () => {
  beforeEach(() => {
    /*
    Mock out "timer functions"
    (i.e., setTimeout, setInterval, clearTimeout, clearInterval)
    with mock functions.
    */
    jest.useFakeTimers()
  })

  afterEach(() => {
    /*
    [Restore] timer[ function]s to their normal behavior.
    */
    jest.useRealTimers()
  })

  test(
    'displayAlertTemporarily -' +
      ' waits the specified amount of time' +
      ' before dispatching alertRemoved',
    async () => {
      const storeMock = createStoreMock({
        alerts: {
          ...initialStateAlerts,
        },
      })

      storeMock.dispatch(
        displayAlertTemporarily('This alert will be removed after 100 ms!', 100)
      )

      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
    }
  )

  test(
    'displayAlertTemporarily -' +
      ' dispatches (alertSet + ' +
      ' and, after the specified amount of time, also) alertRemoved',
    async () => {
      /* Arrange. */
      const storeMock = createStoreMock({
        alerts: {
          ...initialStateAlerts,
        },
      })

      /* Act. */
      storeMock.dispatch(
        displayAlertTemporarily(
          'This alert will be removed after the default amount of time!'
        )
      )

      jest.runAllTimers()

      /* Assert. */
      const actions = storeMock.getActions()

      expect(actions[0].type).toEqual('alerts/alertSet')
      expect(actions[0].payload.message).toEqual(
        'This alert will be removed after the default amount of time!'
      )

      expect(actions[1].type).toEqual('alerts/alertRemoved')
      expect(actions[1].payload).toEqual(actions[0].payload.id)
    }
  )
})
