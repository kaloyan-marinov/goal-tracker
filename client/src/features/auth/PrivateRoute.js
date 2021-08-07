// import React from 'react'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectRequestStatus } from './authSlice'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = (props) => {
  const { component: Component, ...rest } = props

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

  if (!isAuthenticated && requestStatus !== 'loading') {
    const nextURL = '/login'
    console.log(
      `    <PrR> !isAuthenticated && requestStatus !== 'loading': true` +
        ` > redirecting to ${nextURL} ...`
    )

    return <Route {...rest} render={(props) => <Redirect to={nextURL} />} />
  } else {
    console.log(
      `    <PrR> !isAuthenticated && requestStatus !== 'loading': false` +
        ` > rendering the above-listed children`
    )

    return <Route {...rest} render={(props) => <Component {...props} />} />
  }
}

export default PrivateRoute
