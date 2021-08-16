import thunkMiddleware from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

export const createStoreMock = configureMockStore([thunkMiddleware])

export const mockSingleFailure = (req, res, ctx) => {
  return res.once(
    ctx.status(401),
    ctx.json({
      error: 'mocked-Unauthorized',
      message: 'mocked-authentication required',
    })
  )
}

export const mockMultipleFailures = (req, res, ctx) => {
  return res(
    ctx.status(401),
    ctx.json({
      error: 'mocked-Unauthorized',
      message: 'mocked-authentication required',
    })
  )
}

/* Mock handlers for HTTP requests. */
export const MOCK_USER_1 = {
  id: 1,
  email: 'mocked-mary.smith@protonmail.com',
}

export const mockCreateUser = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_USER_1))
}

export const mockIssueJWSToken = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      token: 'mocked-jws-token',
    })
  )
}

export const mockFetchUser = (req, res, ctx) => {
  return res.once(ctx.status(200), ctx.json(MOCK_USER_1))
}

export const mockMultipleFetchUser = (req, res, ctx) => {
  return res(ctx.status(200), ctx.json(MOCK_USER_1))
}

export const MOCK_GOAL_10 = {
  id: 10,
  description: '[mocked] build a backend application',
}

export const MOCK_GOAL_20 = {
  id: 20,
  description: '[mocked] build a frontend application',
}

export const mockCreateGoal = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_GOAL_10))
}

export const mockFetchGoals = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      goals: [MOCK_GOAL_10, MOCK_GOAL_20],
    })
  )
}

export const mockEditGoal = (req, res, ctx) => {
  const { id: goalId } = req.params

  return res.once(
    ctx.status(200),
    ctx.json({
      id: parseInt(goalId),
      description: MOCK_GOAL_20.description + ' - its edited version',
    })
  )
}

export const mockDeleteGoal = (req, res, ctx) => {
  return res.once(ctx.status(204))
}

const MOCK_INTERVALS = [
  {
    id: 100,
    goal_id: 10,
    start: '2021-08-05 18:54',
    final: '2021-08-05 19:46',
  },
  {
    id: 101,
    goal_id: 20,
    start: '2021-08-05 19:53',
    final: '2021-08-05 20:41',
  },
  {
    id: 102,
    goal_id: 10,
    start: '1999-08-05 18:54',
    final: '1999-08-05 19:46',
  },
  {
    id: 103,
    goal_id: 10,
    start: '2021-03-03 03:03',
    final: '2021-03-03 04:00',
  },
  {
    id: 104,
    goal_id: 10,
    start: '2021-04-04 04:04',
    final: '2021-04-04 05:00',
  },
  {
    id: 105,
    goal_id: 10,
    start: '2021-05-05 05:05',
    final: '2021-05-05 06:00',
  },
  {
    id: 106,
    goal_id: 10,
    start: '2021-06-06 06:06',
    final: '2021-06-06 07:00',
  },
  {
    id: 107,
    goal_id: 10,
    start: '2021-07-07 07:07',
    final: '2021-07-07 08:00',
  },
  {
    id: 108,
    goal_id: 10,
    start: '2021-08-08 08:08',
    final: '2021-08-08 09:00',
  },
  {
    id: 109,
    goal_id: 10,
    start: '2021-09-09 09:09',
    final: '2021-09-09 10:00',
  },
  {
    id: 110,
    goal_id: 10,
    start: '2021-10-10 10:10',
    final: '2021-10-10 11:00',
  },
]

export const MOCK_INTERVAL_100 = {
  ...MOCK_INTERVALS[0],
}

export const MOCK_INTERVAL_101 = {
  ...MOCK_INTERVALS[1],
}

export const MOCK_INTERVAL_102 = {
  ...MOCK_INTERVALS[2],
}

export const mockCreateInterval = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_INTERVAL_100))
}

export const mockFetchIntervals = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      items: [MOCK_INTERVAL_100, MOCK_INTERVAL_101],
      _meta: {
        total_items: 2,
        per_page: 10,
        total_pages: 1,
        page: 1,
      },
      _links: {
        self: '/api/v1.0/intervals?per_page=10&page=1',
        next: null,
        prev: null,
        first: '/api/v1.0/intervals?per_page=10&page=1',
        last: '/api/v1.0/intervals?per_page=10&page=1',
      },
    })
  )
}

export const mockEditInterval = (req, res, ctx) => {
  const { id: intervalIdStr } = req.params
  const intervalId = parseInt(intervalIdStr)

  const editedInterval =
    intervalId != MOCK_INTERVAL_100.id ? MOCK_INTERVAL_100 : MOCK_INTERVAL_101

  return res.once(
    ctx.status(200),
    ctx.json({
      ...editedInterval,
      id: intervalId,
    })
  )
}

export const mockDeleteInterval = (req, res, ctx) => {
  return res.once(ctx.status(204))
}

export const requestHandlers = {
  mockSingleFailure,
  mockMultipleFailures,

  mockCreateUser,
  mockIssueJWSToken,
  mockFetchUser,
  mockMultipleFetchUser,

  mockCreateGoal,
  mockFetchGoals,
  mockEditGoal,
  mockDeleteGoal,

  mockCreateInterval,
  mockFetchIntervals,
  mockEditInterval,
  mockDeleteInterval,
}
