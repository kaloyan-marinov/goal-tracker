// import React from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectRequestStatus } from './authSlice'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = ({ component: Component, ...rest }) => {
  console.log(`${new Date().toISOString()} - React is rendering <PrivateRoute>`)

  console.log('    its children are as follows:')
  const childrenCount = React.Children.count(props.children)
  React.Children.forEach(props.children, (child, ind) => {
    console.log(
      `    child #${ind + 1} (out of ${childrenCount}): <${child.type.name}>`
    )
  })

  const isAuthenticated = useSelector(selectIsAuthenticated)
  console.log(`    isAuthenticated: ${isAuthenticated}`)

  const requestStatus = useSelector(selectRequestStatus)
  console.log(`    requestStatus: ${requestStatus}`)

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
