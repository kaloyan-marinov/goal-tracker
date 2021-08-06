import thunkMiddleware from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

export const createStoreMock = configureMockStore([thunkMiddleware])

/* Mock handlers for HTTP requests. */
export const mockHandlerForCreateUserRequest = (req, res, ctx) => {
  return res.once(
    ctx.status(201),
    ctx.json({
      id: 1,
      email: 'mary.smith@protonmail.com',
    })
  )
}
