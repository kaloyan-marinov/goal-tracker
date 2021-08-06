// import React from 'react'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../auth/authSlice'

import { Link } from 'react-router-dom'

const Dashboard = () => {
  console.log(`${new Date().toISOString()} - React is rendering <Dashboard>`)

  const currentUser = useSelector(selectCurrentUser)

  return (
    <Fragment>
      [Dashboard]
      <p>Welcome, {currentUser && currentUser.email} !</p>
      <div>
        <ul>
          <li>
            <Link to="/goals-overview">Goals Overview</Link>
          </li>
          <li>
            <Link to="/intervals-overview">Intervals Overview</Link>
          </li>
        </ul>
      </div>
    </Fragment>
  )
}

export default Dashboard
