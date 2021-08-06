import thunkMiddleware from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

export const createStoreMock = configureMockStore([thunkMiddleware])

/* Mock handlers for HTTP requests. */
export const mockHandlerForCreateUserRequest = (req, res, ctx) => {
  return res.once(
    ctx.status(201),
    ctx.json({
      id: 1,
      email: 'mocked-mary.smith@protonmail.com',
    })
  )
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
  return res(
    ctx.status(200),
    ctx.json({
      id: 1,
      email: 'mocked-mary.smith@protonmail.com',
    })
  )
}
