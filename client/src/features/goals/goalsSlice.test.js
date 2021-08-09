import {
  initialStateGoals,
  selectGoalIds,
  selectGoalEntities,
  createGoalPending,
  createGoalFulfilled,
  createGoalRejected,
  fetchGoalsPending,
  fetchGoalsFulfilled,
  fetchGoalsRejected,
  reinitializeGoalsSlice,
  editGoalPending,
  editGoalFulfilled,
  editGoalRejected,
  deleteGoalPending,
  deleteGoalFulfilled,
  deleteGoalRejected,
} from './goalsSlice'
import goalsReducer from './goalsSlice'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  createStoreMock,
  requestHandlers,
  MOCK_GOAL_10,
  MOCK_GOAL_20,
} from '../../testHelpers'
import { createGoal, fetchGoals, editGoal, deleteGoal } from './goalsSlice'

describe('selectors', () => {
  test('selectGoalIds', () => {
    const initSt = {
      goals: {
        ...initialStateGoals,
        ids: [MOCK_GOAL_10.id, MOCK_GOAL_20.id],
        entities: {
          [MOCK_GOAL_10.id]: MOCK_GOAL_10,
          [MOCK_GOAL_20.id]: MOCK_GOAL_20,
        },
      },
    }

    const goalIds = selectGoalIds(initSt)

    expect(goalIds).toEqual([10, 20])
  })

  test('selectGoalEntities', () => {
    const initSt = {
      goals: {
        ...initialStateGoals,
        ids: [MOCK_GOAL_10.id, MOCK_GOAL_20.id],
        entities: {
          [MOCK_GOAL_10.id]: MOCK_GOAL_10,
          [MOCK_GOAL_20.id]: MOCK_GOAL_20,
        },
      },
    }

    const goalEntities = selectGoalEntities(initSt)
    expect(goalEntities).toEqual({
      10: {
        id: 10,
        description: '[mocked] build a backend application',
      },
      20: {
        id: 20,
        description: '[mocked] build a frontend application',
      },
    })
  })
})

describe('action creators', () => {
  test('createGoalPending', () => {
    const action = createGoalPending()

    expect(action).toEqual({
      type: 'goals/createGoal/pending',
    })
  })

  test('createGoalFulfilled', () => {
    const action = createGoalFulfilled(MOCK_GOAL_10)

    expect(action).toEqual({
      type: 'goals/createGoal/fulfilled',
      payload: MOCK_GOAL_10,
    })
  })

  test('createGoalRejected', () => {
    const action = createGoalRejected('goals-createGoal-rejected')

    expect(action).toEqual({
      type: 'goals/createGoal/rejected',
      error: 'goals-createGoal-rejected',
    })
  })

  test('fetchGoalsPending', () => {
    const action = fetchGoalsPending()

    expect(action).toEqual({
      type: 'goals/fetchGoals/pending',
    })
  })

  test('fetchGoalsFulfilled', () => {
    const action = fetchGoalsFulfilled([MOCK_GOAL_10, MOCK_GOAL_20])

    expect(action).toEqual({
      type: 'goals/fetchGoals/fulfilled',
      payload: [MOCK_GOAL_10, MOCK_GOAL_20],
    })
  })

  test('fetchGoalsRejected', () => {
    const action = fetchGoalsRejected('goals-fetchGoals-rejected')

    expect(action).toEqual({
      type: 'goals/fetchGoals/rejected',
      error: 'goals-fetchGoals-rejected',
    })
  })

  test('reinitializeGoalsSlice', () => {
    const action = reinitializeGoalsSlice()

    expect(action).toEqual({
      type: 'goals/reinitializeGoalsSlice',
    })
  })

  test('editGoalPending', () => {
    const action = editGoalPending()

    expect(action).toEqual({
      type: 'goals/editGoal/pending',
    })
  })

  test('editGoalFulfilled', () => {
    const action = editGoalFulfilled(MOCK_GOAL_20)

    expect(action).toEqual({
      type: 'goals/editGoal/fulfilled',
      payload: MOCK_GOAL_20,
    })
  })

  test('editGoalRejected', () => {
    const action = editGoalRejected('goals-editGoal-rejected')

    expect(action).toEqual({
      type: 'goals/editGoal/rejected',
      error: 'goals-editGoal-rejected',
    })
  })

  test('deleteGoalFulfilled', () => {
    const action = deleteGoalFulfilled(MOCK_GOAL_20.id)

    expect(action).toEqual({
      type: 'goals/deleteGoal/fulfilled',
      payload: 20,
    })
  })

  test('deleteGoalPending', () => {
    const action = deleteGoalPending()

    expect(action).toEqual({
      type: 'goals/deleteGoal/pending',
    })
  })

  test('deleteGoalRejected', () => {
    const action = deleteGoalRejected('goals-deleteGoal-rejected')

    expect(action).toEqual({
      type: 'goals/deleteGoal/rejected',
      error: 'goals-deleteGoal-rejected',
    })
  })
})

describe('slice reducer', () => {
  test('goals/createGoal/pending', () => {
    const initStGoals = {
      ...initialStateGoals,
    }
    const action = {
      type: 'goals/createGoal/pending',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'loading',
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('goals/createGoal/fulfilled', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
      ids: [MOCK_GOAL_10.id],
      entities: {
        [MOCK_GOAL_10.id]: MOCK_GOAL_10,
      },
    }
    const action = {
      type: 'goals/createGoal/fulfilled',
      payload: MOCK_GOAL_20,
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [10, 20],
      entities: {
        10: {
          id: 10,
          description: '[mocked] build a backend application',
        },
        20: {
          id: 20,
          description: '[mocked] build a frontend application',
        },
      },
    })
  })

  test('goals/createGoal/rejected', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
    }
    const action = {
      type: 'goals/createGoal/rejected',
      error: 'goals-createGoal-rejected',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      ...initStGoals,
      requestStatus: 'failed',
      requestError: 'goals-createGoal-rejected',
    })
  })

  test('goals/fetchGoals/pending', () => {
    const initStGoals = {
      ...initialStateGoals,
    }
    const action = {
      type: 'goals/fetchGoals/pending',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'loading',
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('goals/fetchGoals/fulfilled', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
    }
    const action = {
      type: 'goals/fetchGoals/fulfilled',
      payload: [MOCK_GOAL_10, MOCK_GOAL_20],
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [10, 20],
      entities: {
        10: {
          id: 10,
          description: '[mocked] build a backend application',
        },
        20: {
          id: 20,
          description: '[mocked] build a frontend application',
        },
      },
    })
  })

  test('goals/fetchGoals/rejected', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
    }
    const action = {
      type: 'goals/fetchGoals/rejected',
      error: 'goals-fetchGoals-rejected',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      ...initStGoals,
      requestStatus: 'failed',
      requestError: 'goals-fetchGoals-rejected',
    })
  })

  test('goals/reinitializeGoalsSlice', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'succeeded',
      ids: [MOCK_GOAL_10.id, MOCK_GOAL_20.id],
      entities: {
        [MOCK_GOAL_10.id]: MOCK_GOAL_10,
        [MOCK_GOAL_20.id]: MOCK_GOAL_20,
      },
    }
    const action = reinitializeGoalsSlice()

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual(initialStateGoals)
  })

  test('goals/editGoal/pending', () => {
    const initStGoals = {
      ...initialStateGoals,
    }
    const action = {
      type: 'goals/editGoal/pending',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'loading',
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('goals/editGoal/fulfilled', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
      ids: [MOCK_GOAL_10.id],
      entities: {
        [MOCK_GOAL_10.id]: MOCK_GOAL_10,
      },
    }
    const action = {
      type: 'goals/editGoal/fulfilled',
      payload: {
        id: MOCK_GOAL_10.id,
        description: 'cook dinner',
      },
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [10],
      entities: {
        10: {
          id: 10,
          description: 'cook dinner',
        },
      },
    })
  })

  test('goals/editGoal/rejected', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
    }
    const action = {
      type: 'goals/editGoal/rejected',
      error: 'goals-editGoal-rejected',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      ...initStGoals,
      requestStatus: 'failed',
      requestError: 'goals-editGoal-rejected',
    })
  })

  test('goals/deleteGoal/pending', () => {
    const initStGoals = {
      ...initialStateGoals,
    }
    const action = {
      type: 'goals/deleteGoal/pending',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'pending',
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('goals/deleteGoal/fulfilled', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
      ids: [MOCK_GOAL_10.id],
      entities: {
        [MOCK_GOAL_10.id]: MOCK_GOAL_10,
      },
    }
    const action = {
      type: 'goals/deleteGoal/fulfilled',
      payload: MOCK_GOAL_10.id,
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [],
      entities: {},
    })
  })

  test('goals/deleteGoal/rejected', () => {
    const initStGoals = {
      ...initialStateGoals,
      requestStatus: 'loading',
    }
    const action = {
      type: 'goals/deleteGoal/rejected',
      error: 'goals-deleteGoal-rejected',
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      ...initStGoals,
      requestStatus: 'failed',
      requestError: 'goals-deleteGoal-rejected',
    })
  })
})

const requestHandlersToMock = [
  rest.post('/api/v1.0/goals', requestHandlers.mockCreateGoal),
  rest.get('/api/v1.0/goals', requestHandlers.mockFetchGoals),
  rest.put('/api/v1.0/goals/:id', requestHandlers.mockEditGoal),
  rest.delete('/api/v1.0/goals/:id', requestHandlers.mockDeleteGoal),
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
      goals: {
        ...initialStateGoals,
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

  test('createGoal + its HTTP request is mocked to succeed', async () => {
    const createGoalPromise = storeMock.dispatch(
      createGoal('write tests for thunk-action creators')
    )

    await expect(createGoalPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/createGoal/pending' },
      {
        type: 'goals/createGoal/fulfilled',
        payload: {
          id: 10,
          description: '[mocked] build a backend application',
        },
      },
    ])
  })

  test('createGoal + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.post('/api/v1.0/goals', requestHandlers.mockMultipleFailures)
    )

    const createGoalPromise = storeMock.dispatch(
      createGoal('write tests for thunk-action creators')
    )

    await expect(createGoalPromise).rejects.toEqual(
      'mocked-authentication required'
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/createGoal/pending' },
      {
        type: 'goals/createGoal/rejected',
        error: 'mocked-authentication required',
      },
    ])
  })

  test('fetchGoals + its HTTP request is mocked to succeed', async () => {
    const fetchGoalsPromise = storeMock.dispatch(fetchGoals())

    await expect(fetchGoalsPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/fetchGoals/pending' },
      {
        type: 'goals/fetchGoals/fulfilled',
        payload: [
          {
            id: 10,
            description: '[mocked] build a backend application',
          },
          {
            id: 20,
            description: '[mocked] build a frontend application',
          },
        ],
      },
    ])
  })

  test('fetchGoals + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.get('/api/v1.0/goals', requestHandlers.mockMultipleFailures)
    )

    const fetchGoalsPromise = storeMock.dispatch(fetchGoals())

    await expect(fetchGoalsPromise).rejects.toEqual(
      'mocked-authentication required'
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/fetchGoals/pending' },
      {
        type: 'goals/fetchGoals/rejected',
        error: 'mocked-authentication required',
      },
    ])
  })

  test('editGoal + its HTTP request is mocked to succeed', async () => {
    const editGoalPromise = storeMock.dispatch(
      editGoal(MOCK_GOAL_10.id, 'clean up the dinner table')
    )

    await expect(editGoalPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/editGoal/pending' },
      {
        type: 'goals/editGoal/fulfilled',
        payload: {
          id: 10,
          description:
            '[mocked] build a frontend application - its edited version',
        },
      },
    ])
  })

  test('editGoal + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.put('/api/v1.0/goals/:id', requestHandlers.mockMultipleFailures)
    )

    const editGoalPromise = storeMock.dispatch(
      editGoal(17, 'clean up the dinner table')
    )

    await expect(editGoalPromise).rejects.toEqual(
      'mocked-authentication required'
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/editGoal/pending' },
      {
        type: 'goals/editGoal/rejected',
        error: 'mocked-authentication required',
      },
    ])
  })

  test('deleteGoal + its HTTP request is mocked to succeed', async () => {
    const deleteGoalPromise = storeMock.dispatch(deleteGoal(17))

    await expect(deleteGoalPromise).resolves.toEqual(undefined)
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/deleteGoal/pending' },
      {
        type: 'goals/deleteGoal/fulfilled',
        payload: 17,
      },
    ])
  })

  test('deleteGoal + its HTTP request is mocked to fail', async () => {
    quasiServer.use(
      rest.delete('/api/v1.0/goals/:id', requestHandlers.mockMultipleFailures)
    )

    const deleteGoalPromise = storeMock.dispatch(deleteGoal(17))

    await expect(deleteGoalPromise).rejects.toEqual(
      'mocked-authentication required'
    )
    expect(storeMock.getActions()).toEqual([
      { type: 'goals/deleteGoal/pending' },
      {
        type: 'goals/deleteGoal/rejected',
        error: 'mocked-authentication required',
      },
    ])
  })
})
