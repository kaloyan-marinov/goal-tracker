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
import { expect, test } from '@jest/globals'

const GOAL_17 = {
  id: 17,
  description: 'build a backend application',
}

const GOAL_27 = {
  id: 27,
  description: 'build a frontend application',
}

describe('selectors', () => {
  test('selectGoalIds', () => {
    const initSt = {
      goals: {
        ...initialStateGoals,
        ids: [GOAL_17.id, GOAL_27.id],
        entities: {
          [GOAL_17.id]: GOAL_17,
          [GOAL_27.id]: GOAL_27,
        },
      },
    }

    const goalIds = selectGoalIds(initSt)

    expect(goalIds).toEqual([17, 27])
  })

  test('selectGoalEntities', () => {
    const initSt = {
      goals: {
        ...initialStateGoals,
        ids: [GOAL_17.id, GOAL_27.id],
        entities: {
          [GOAL_17.id]: GOAL_17,
          [GOAL_27.id]: GOAL_27,
        },
      },
    }

    const goalEntities = selectGoalEntities(initSt)
    expect(goalEntities).toEqual({
      17: {
        id: 17,
        description: 'build a backend application',
      },
      27: {
        id: 27,
        description: 'build a frontend application',
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
    const action = createGoalFulfilled(GOAL_17)

    expect(action).toEqual({
      type: 'goals/createGoal/fulfilled',
      payload: GOAL_17,
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
    const action = fetchGoalsFulfilled([GOAL_17, GOAL_27])

    expect(action).toEqual({
      type: 'goals/fetchGoals/fulfilled',
      payload: [GOAL_17, GOAL_27],
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
    const action = editGoalFulfilled(GOAL_27)

    expect(action).toEqual({
      type: 'goals/editGoal/fulfilled',
      payload: GOAL_27,
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
    const action = deleteGoalFulfilled(GOAL_27.id)

    expect(action).toEqual({
      type: 'goals/deleteGoal/fulfilled',
      payload: 27,
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
      ids: [GOAL_17.id],
      entities: {
        [GOAL_17.id]: GOAL_17,
      },
    }
    const action = {
      type: 'goals/createGoal/fulfilled',
      payload: GOAL_27,
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [17, 27],
      entities: {
        17: {
          id: 17,
          description: 'build a backend application',
        },
        27: {
          id: 27,
          description: 'build a frontend application',
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
      payload: [GOAL_17, GOAL_27],
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [17, 27],
      entities: {
        17: {
          id: 17,
          description: 'build a backend application',
        },
        27: {
          id: 27,
          description: 'build a frontend application',
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
      ids: [GOAL_17.id, GOAL_27.id],
      entities: {
        [GOAL_17.id]: GOAL_17,
        [GOAL_27.id]: GOAL_27,
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
      ids: [GOAL_17.id],
      entities: {
        [GOAL_17.id]: GOAL_17,
      },
    }
    const action = {
      type: 'goals/editGoal/fulfilled',
      payload: {
        id: GOAL_17.id,
        description: 'cook dinner',
      },
    }

    const newSt = goalsReducer(initStGoals, action)

    expect(newSt).toEqual({
      requestStatus: 'succeeded',
      requestError: null,
      ids: [17],
      entities: {
        17: {
          id: 17,
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
      ids: [GOAL_17.id],
      entities: {
        [GOAL_17.id]: GOAL_17,
      },
    }
    const action = {
      type: 'goals/deleteGoal/fulfilled',
      payload: 17,
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
