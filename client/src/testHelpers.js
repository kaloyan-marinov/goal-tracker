import thunkMiddleware from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

export const createStoreMock = configureMockStore([thunkMiddleware])
