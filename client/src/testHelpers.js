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

const MOCK_GOAL_10 = {
  id: 10,
  description: 'mocked-write tests for thunk-action creators',
}

const MOCK_GOAL_20 = {
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
