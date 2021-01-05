// import React from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectRequestStatus } from './authSlice'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const requestStatus = useSelector(selectRequestStatus)

  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated && requestStatus !== 'loading' ? (
          <Redirect to="/login" />
        ) : (
          <Component {...props} />
        )
      }
    />
  )
}

export default PrivateRoute
