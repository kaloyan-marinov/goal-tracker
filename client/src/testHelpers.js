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

export const MOCK_GOAL_30 = {
  id: 30,
  description: '[mocked] fix a typo',
}

export const MOCK_GOALS = [MOCK_GOAL_10, MOCK_GOAL_20, MOCK_GOAL_30]

export const mockCreateGoal = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_GOAL_10))
}

export const mockFetchGoals = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      goals: [MOCK_GOAL_10, MOCK_GOAL_20, MOCK_GOAL_30],
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

const MOCK_INTERVALS_PART_1 = [
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
    goal_id: 20,
    start: '2021-08-07 18:54',
    final: '2021-08-07 19:46',
  },
]

const MOCK_INTERVALS_PART_2 = Array.from({ length: 50 }).map((_, index) => {
  const startMinute = index.toString().padStart(2, '0')
  const finalMinute = (index + 1).toString().padStart(2, '0')

  return {
    id: 200 + index,
    goal_id: 30,
    start: `2021-08-16 00:${startMinute}`,
    final: `2021-08-16 00:${finalMinute}`,
  }
})

export const MOCK_INTERVALS = MOCK_INTERVALS_PART_1.concat(
  MOCK_INTERVALS_PART_2
)

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
  const totalItems = MOCK_INTERVALS.length
  const perPage = 10
  const totalPages = Math.ceil(totalItems / perPage)
  const page = parseInt(req.url.searchParams.get('page') || '1')

  const start = (page - 1) * perPage
  const end = start + perPage
  const items = MOCK_INTERVALS.slice(start, end)

  const _links = {
    self: `/api/v1.0/intervals?per_page=${perPage}&page=${page}`,
    next:
      page >= totalPages
        ? null
        : `/api/v1.0/intervals?per_page=${perPage}&page=${page + 1}`,
    prev:
      page <= 1
        ? null
        : `/api/v1.0/intervals?per_page=${perPage}&page=${page - 1}`,
    first: `/api/v1.0/intervals?per_page=${perPage}&page=1`,
    last: `/api/v1.0/intervals?per_page=${perPage}&page=${totalPages}`,
  }

  return res.once(
    ctx.status(200),
    ctx.json({
      items,
      _meta: {
        total_items: totalItems,
        per_page: perPage,
        total_pages: totalPages,
        page,
      },
      _links,
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
