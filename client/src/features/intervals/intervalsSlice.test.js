import { MOCK_INTERVAL_100, MOCK_INTERVAL_200 } from '../../testHelpers'

import {
  initialStateIntervals,
  selectIntervalIds,
  selectIntervalEntities,
  createIntervalPending,
  createIntervalFulfilled,
  createIntervalRejected,
  fetchIntervalsPending,
  fetchIntervalsFulfilled,
  fetchIntervalsRejected,
  reinitializeIntervalsSlice,
  editIntervalPending,
  editIntervalFulfilled,
  editIntervalRejected,
  deleteIntervalPending,
  deleteIntervalFulfilled,
  deleteIntervalRejected,
} from './intervalsSlice'
import intervalsReducer from './intervalsSlice'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createStoreMock, requestHandlers } from '../../testHelpers'
import {
  createInterval,
  fetchIntervals,
  editInterval,
  deleteInterval,
} from './intervalsSlice'
import { RequestStatus } from '../../constants'

describe('selectors', () => {
  const initSt = {
    intervals: {
      ...initialStateIntervals,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: [MOCK_INTERVAL_100.id, MOCK_INTERVAL_200.id],
      entities: {
        [MOCK_INTERVAL_100.id]: MOCK_INTERVAL_100,
        [MOCK_INTERVAL_200.id]: MOCK_INTERVAL_200,
      },
    },
  }

  test('selectIntervalIds', () => {
    const intervalIds = selectIntervalIds(initSt)

    expect(intervalIds).toEqual([100, 200])
  })

  test('selectIntervalEntities', () => {
    const intervalEntities = selectIntervalEntities(initSt)

    expect(intervalEntities).toEqual({
      100: {
        id: 100,
        goal_id: 10,
        start: '2021-08-05 18:54',
        final: '2021-08-05 19:46',
      },
      200: {
        id: 200,
        goal_id: 20,
        start: '2021-08-05 19:53',
        final: '2021-08-05 20:41',
      },
    })
  })
})

describe('action creators', () => {
  test('createIntervalPending', () => {
    const action = createIntervalPending()

    expect(action).toEqual({
      type: 'intervals/createInterval/pending',
    })
  })

  test('createIntervalFulfilled', () => {
    const action = createIntervalFulfilled(MOCK_INTERVAL_100)

    expect(action).toEqual({
      type: 'intervals/createInterval/fulfilled',
      payload: MOCK_INTERVAL_100,
    })
  })

  test('createIntervalRejected', () => {
    const action = createIntervalRejected('intervals-createInterval-rejected')

    expect(action).toEqual({
      type: 'intervals/createInterval/rejected',
      error: 'intervals-createInterval-rejected',
    })
  })

  test('fetchIntervalsPending', () => {
    const action = fetchIntervalsPending()

    expect(action).toEqual({
      type: 'intervals/fetchIntervals/pending',
    })
  })

  test('fetchIntervalsFulfilled', () => {
    const action = fetchIntervalsFulfilled([
      MOCK_INTERVAL_100,
      MOCK_INTERVAL_200,
    ])

    expect(action).toEqual({
      type: 'intervals/fetchIntervals/fulfilled',
      payload: [MOCK_INTERVAL_100, MOCK_INTERVAL_200],
    })
  })

  test('fetchIntervalsRejected', () => {
    const action = fetchIntervalsRejected('intervals-fetchIntervals-rejected')

    expect(action).toEqual({
      type: 'intervals/fetchIntervals/rejected',
      error: 'intervals-fetchIntervals-rejected',
    })
  })

  test('reinitializeIntervalsSlice', () => {
    const action = reinitializeIntervalsSlice()

    expect(action).toEqual({
      type: 'intervals/reinitializeIntervalsSlice',
    })
  })

  test('editIntervalPending', () => {
    const action = editIntervalPending()

    expect(action).toEqual({
      type: 'intervals/editInterval/pending',
    })
  })

  test('editIntervalFulfilled', () => {
    const action = editIntervalFulfilled(MOCK_INTERVAL_100)

    expect(action).toEqual({
      type: 'intervals/editInterval/fulfilled',
      payload: MOCK_INTERVAL_100,
    })
  })

  test('editIntervalRejected', () => {
    const action = editIntervalRejected('intervals-editInterval-rejected')

    expect(action).toEqual({
      type: 'intervals/editInterval/rejected',
      error: 'intervals-editInterval-rejected',
    })
  })

  test('deleteIntervalPending', () => {
    const action = deleteIntervalPending()

    expect(action).toEqual({
      type: 'intervals/deleteInterval/pending',
    })
  })

  test('deleteIntervalFulfilled', () => {
    const action = deleteIntervalFulfilled(MOCK_INTERVAL_200.id)

    expect(action).toEqual({
      type: 'intervals/deleteInterval/fulfilled',
      payload: MOCK_INTERVAL_200.id,
    })
  })

  test('deleteIntervalRejected', () => {
    const action = deleteIntervalRejected('intervals-deleteInterval-rejected')

    expect(action).toEqual({
      type: 'intervals/deleteInterval/rejected',
      error: 'intervals-deleteInterval-rejected',
    })
  })
})

describe('slice reducer', () => {
  test('intervals/createInterval/pending', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/createInterval/pending',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.LOADING,
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('intervals/createInterval/fulfilled', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/createInterval/fulfilled',
      payload: MOCK_INTERVAL_100,
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      ids: [MOCK_INTERVAL_100.id],
      entities: {
        [MOCK_INTERVAL_100.id]: MOCK_INTERVAL_100,
      },
    })
  })

  test('intervals/createInterval/rejected', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/createInterval/rejected',
      error: 'intervals-createInterval-rejected',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.FAILED,
      requestError: 'intervals-createInterval-rejected',
      ids: [],
      entities: {},
    })
  })

  test('intervals/fetchIntervals/pending', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/fetchIntervals/pending',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.LOADING,
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('intervals/fetchIntervals/fulfilled', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/fetchIntervals/fulfilled',
      payload: [MOCK_INTERVAL_100, MOCK_INTERVAL_200],
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      ids: [MOCK_INTERVAL_100.id, MOCK_INTERVAL_200.id],
      entities: {
        [MOCK_INTERVAL_100.id]: MOCK_INTERVAL_100,
        [MOCK_INTERVAL_200.id]: MOCK_INTERVAL_200,
      },
    })
  })

  test('intervals/fetchIntervals/rejected', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/fetchIntervals/rejected',
      error: 'intervals-fetchIntervals-rejected',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.FAILED,
      requestError: 'intervals-fetchIntervals-rejected',
      ids: [],
      entities: {},
    })
  })

  test('intervals/reinitializeIntervalsSlice', () => {
    const initStIntervals = {
      ...initialStateIntervals,
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      ids: [MOCK_INTERVAL_200.id],
      entities: {
        [MOCK_INTERVAL_200.id]: MOCK_INTERVAL_200,
      },
    }
    const action = {
      type: 'intervals/reinitializeIntervalsSlice',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual(initialStateIntervals)
  })

  test('intervals/editInterval/pending', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/editInterval/pending',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.LOADING,
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('intervals/editInterval/fulfilled', () => {
    const initStIntervals = {
      ...initialStateIntervals,
      requestStatus: 'using this value is illustrative but unrealistic',
      requestError: 'using this value is illustrative but unrealistic',
      ids: [MOCK_INTERVAL_200.id],
      entities: {
        [MOCK_INTERVAL_200.id]: MOCK_INTERVAL_200,
      },
    }
    const action = {
      type: 'intervals/editInterval/fulfilled',
      payload: {
        ...MOCK_INTERVAL_100,
        id: MOCK_INTERVAL_200.id,
      },
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      ids: [MOCK_INTERVAL_200.id],
      entities: {
        [MOCK_INTERVAL_200.id]: {
          id: MOCK_INTERVAL_200.id,
          goal_id: MOCK_INTERVAL_100.goal_id,
          start: MOCK_INTERVAL_100.start,
          final: MOCK_INTERVAL_100.final,
        },
      },
    })
  })

  test('intervals/editInterval/rejected', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/editInterval/rejected',
      error: 'intervals-editInterval-rejected',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.FAILED,
      requestError: 'intervals-editInterval-rejected',
      ids: [],
      entities: {},
    })
  })

  test('intervals/deleteInterval/pending', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/deleteInterval/pending',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.LOADING,
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('intervals/deleteInterval/fulfilled', () => {
    const initStIntervals = {
      ...initialStateIntervals,
      requestStatus: 'using this value is illustrative but unrealistic',
      requestError: 'using this value is illustrative but unrealistic',
      ids: [MOCK_INTERVAL_200.id],
      entities: {
        [MOCK_INTERVAL_200.id]: MOCK_INTERVAL_200,
      },
    }
    const action = {
      type: 'intervals/deleteInterval/fulfilled',
      payload: MOCK_INTERVAL_200.id,
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('intervals/deleteInterval/rejected', () => {
    const initStIntervals = {
      ...initialStateIntervals,
    }
    const action = {
      type: 'intervals/deleteInterval/rejected',
      error: 'intervals-deleteInterval-rejected',
    }

    const newSt = intervalsReducer(initStIntervals, action)

    expect(newSt).toEqual({
      requestStatus: RequestStatus.FAILED,
      requestError: 'intervals-deleteInterval-rejected',
      ids: [],
      entities: {},
    })
  })
})

const requestHandlersToMock = [
  rest.post('/api/v1.0/intervals', requestHandlers.mockCreateInterval),
  rest.get('/api/v1.0/intervals', requestHandlers.mockFetchIntervals),
  rest.put('/api/v1.0/intervals/:id', requestHandlers.mockEditInterval),
  rest.delete('/api/v1.0/intervals/:id', requestHandlers.mockDeleteInterval),
]

/* Create an MSW "request-interception layer". */
const quasiServer = setupServer(...requestHandlersToMock)

describe('thunk-action creators', () => {
  let storeMock

  beforeAll(() => {
    /* Enable API mocking. */
    quasiServer.listen()
  })

  beforeEach(() => {
    storeMock = createStoreMock({
      intervals: {
        ...initialStateIntervals,
      },
    })
  })

  afterEach(() => {
    quasiServer.resetHandlers()
  })

  afterAll(() => {
    /* Disable API mocking. */
    quasiServer.close()
  })

  test('createInterval + its HTTP request is mocked to succeed', async () => {
    const createIntervalPromise = storeMock.dispatch(
      createInterval(1717, '2021-08-06 17:17', '2021-08-06 18:16')
    )

    await expect(createIntervalPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/createInterval/pending' },
      {
        type: 'intervals/createInterval/fulfilled',
        payload: MOCK_INTERVAL_100,
      },
    ])
  })

  test('createInterval + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.post('/api/v1.0/intervals', requestHandlers.mockMultipleFailures)
    )

    const createIntervalPromise = storeMock.dispatch(
      createInterval(1717, '2021-08-06 17:17', '2021-08-06 18:16')
    )

    await expect(createIntervalPromise).rejects.toEqual(
      new Error('Request failed with status code 401')
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/createInterval/pending' },
      {
        type: 'intervals/createInterval/rejected',
        error: 'mocked-Unauthorized',
      },
    ])
  })

  test('fetchIntervals + its HTTP request is mocked to succeed', async () => {
    const fetchIntervalsPromise = storeMock.dispatch(fetchIntervals())

    await expect(fetchIntervalsPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/fetchIntervals/pending' },
      {
        type: 'intervals/fetchIntervals/fulfilled',
        payload: [MOCK_INTERVAL_100, MOCK_INTERVAL_200],
      },
    ])
  })

  test('fetchIntervals + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.get('/api/v1.0/intervals', requestHandlers.mockMultipleFailures)
    )

    const fetchIntervalsPromise = storeMock.dispatch(fetchIntervals())

    await expect(fetchIntervalsPromise).rejects.toEqual(
      new Error('Request failed with status code 401')
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/fetchIntervals/pending' },
      {
        type: 'intervals/fetchIntervals/rejected',
        error: 'mocked-Unauthorized',
      },
    ])
  })

  test('editInterval + its HTTP request is mocked to succeed', async () => {
    const editIntervalPromise = storeMock.dispatch(
      editInterval(171717, 1717, '2021-08-06 17:17', '2021-08-06 18:16')
    )

    await expect(editIntervalPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/editInterval/pending' },
      {
        type: 'intervals/editInterval/fulfilled',
        payload: {
          ...MOCK_INTERVAL_100,
          id: 171717,
        },
      },
    ])
  })

  test('editInterval + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.put('/api/v1.0/intervals/:id', requestHandlers.mockMultipleFailures)
    )

    const editIntervalPromise = storeMock.dispatch(
      editInterval(171717, 1717, '2021-08-06 17:17', '2021-08-06 18:16')
    )

    await expect(editIntervalPromise).rejects.toEqual(
      new Error('Request failed with status code 401')
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/editInterval/pending' },
      {
        type: 'intervals/editInterval/rejected',
        error: 'mocked-Unauthorized',
      },
    ])
  })

  test('deleteInterval + its HTTP request is mocked to succeed', async () => {
    const deleteIntervalPromise = storeMock.dispatch(deleteInterval(171717))

    await expect(deleteIntervalPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/deleteInterval/pending' },
      {
        type: 'intervals/deleteInterval/fulfilled',
        payload: 171717,
      },
    ])
  })

  test('deleteInterval + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.delete(
        '/api/v1.0/intervals/:id',
        requestHandlers.mockMultipleFailures
      )
    )

    const deleteIntervalPromise = storeMock.dispatch(deleteInterval(171717))

    await expect(deleteIntervalPromise).rejects.toEqual(
      new Error('Request failed with status code 401')
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'intervals/deleteInterval/pending' },
      {
        type: 'intervals/deleteInterval/rejected',
        error: 'mocked-Unauthorized',
      },
    ])
  })
})
