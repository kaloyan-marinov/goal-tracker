import thunkMiddleware from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

export const createStoreMock = configureMockStore([thunkMiddleware])

/* Mock handlers for HTTP requests. */
const MOCK_USER_1 = {
  id: 1,
  email: 'mocked-mary.smith@protonmail.com',
}

export const mockHandlerForCreateUserRequest = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_USER_1))
}

export const mockHandlerForIssueJWSTokenRequest = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      token: 'mocked-jws-token',
    })
  )
}

export const mockHandlerForFetchUserRequest = (req, res, ctx) => {
  return res.once(ctx.status(200), ctx.json(MOCK_USER_1))
}

export const mockHandlerForMultipleFetchUserRequests = (req, res, ctx) => {
  return res(ctx.status(200), ctx.json(MOCK_USER_1))
}

export const MOCK_GOAL_10 = {
  id: 10,
  description: 'mocked-write tests for thunk-action creators',
}

export const MOCK_GOAL_20 = {
  id: 20,
  description: 'mocked-cook dinner',
}

export const mockHandlerForCreateGoalRequest = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_GOAL_10))
}

export const mockHandlerForFetchGoalsRequest = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      goals: [MOCK_GOAL_10, MOCK_GOAL_20],
    })
  )
}

export const mockHandlerForEditGoalRequest = (req, res, ctx) => {
  const { id: goalId } = req.params

  return res.once(
    ctx.status(200),
    ctx.json({
      id: parseInt(goalId),
      description: MOCK_GOAL_20.description + ' - its edited version',
    })
  )
}

export const mockHandlerForDeleteGoalRequest = (req, res, ctx) => {
  return res.once(ctx.status(204))
}

export const MOCK_INTERVAL_100 = {
  id: 100,
  goal_id: 10,
  start: '2021-08-05 18:54',
  final: '2021-08-05 19:46',
}

export const MOCK_INTERVAL_200 = {
  id: 200,
  goal_id: 20,
  start: '2021-08-05 19:53',
  final: '2021-08-05 20:41',
}

export const MOCK_INTERVAL_300 = {
  id: 300,
  goal_id: 10,
  start: '1999-08-05 18:54',
  final: '1999-08-05 19:46',
}

export const mockHandlerForCreateIntervalRequest = (req, res, ctx) => {
  return res.once(ctx.status(201), ctx.json(MOCK_INTERVAL_100))
}

export const mockHandlerForFetchIntervalsRequest = (req, res, ctx) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      intervals: [MOCK_INTERVAL_100, MOCK_INTERVAL_200],
    })
  )
}

export const mockHandlerForEditIntervalRequest = (req, res, ctx) => {
  const { id: intervalIdStr } = req.params
  const intervalId = parseInt(intervalIdStr)

  const editedInterval =
    intervalId != MOCK_INTERVAL_100.id ? MOCK_INTERVAL_100 : MOCK_INTERVAL_200

  return res.once(
    ctx.status(200),
    ctx.json({
      ...editedInterval,
      id: intervalId,
    })
  )
}

export const mockHandlerForDeleteIntervalRequest = (req, res, ctx) => {
  return res.once(ctx.status(204))
}
