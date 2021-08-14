// import React from 'react'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectRequestStatus } from './authSlice'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = (props) => {
  console.log(`${new Date().toISOString()} - React is rendering <PrivateRoute>`)

  console.log('    its children are as follows:')
  const childrenCount = React.Children.count(props.children)
  React.Children.forEach(props.children, (child, ind) => {
    console.log(
      `    child #${ind + 1} (out of ${childrenCount}): <${child.type.name}>`
    )
  })

  const { children, ...rest } = props

  const requestStatus = useSelector(selectRequestStatus)
  console.log(`    requestStatus: ${requestStatus}`)

  const isAuthenticated = useSelector(selectIsAuthenticated)
  console.log(`    isAuthenticated: ${isAuthenticated}`)

  if (requestStatus === 'loading') {
    console.log(`    requestStatus: loading`)
    return React.Children.map(props.children, (child) => (
      <div>{`<${child.type.name}>`} - Loading...</div>
    ))
  } else if (!isAuthenticated) {
    const nextURL = '/login'
    console.log(
      `    isAuthenticated: ${isAuthenticated} > redirecting to ${nextURL} ...`
    )
    return <Redirect to={nextURL} />
  } else {
    console.log(
      `    isAuthenticated: ${isAuthenticated} > rendering the above-listed children`
    )
    return <Route {...rest}>{children}</Route>
  }
}

export default PrivateRoute
