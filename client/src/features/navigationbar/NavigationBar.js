// import React from "react";
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectRequestStatus,
  selectIsAuthenticated,
  logout,
} from '../auth/authSlice'
import { Fragment } from 'react'
import { reinitializeGoalsSlice } from '../goals/goalsSlice'
import { reinitializeIntervalsSlice } from '../intervals/intervalsSlice'

const NavigationBar = () => {
  console.log(
    `${new Date().toISOString()} - React is rendering <NavigationBar>`
  )

  const dispatch = useDispatch()
  const requestStatus = useSelector(selectRequestStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  console.log(`    requestStatus: ${requestStatus}`)
  console.log(`    isAuthenticated: ${isAuthenticated}`)

  const handleClick = () => {
    dispatch(logout())
    dispatch(reinitializeGoalsSlice())
    dispatch(reinitializeIntervalsSlice())
    /* TODO: consider the commit immediately before this comment was written;
             there was an issue with that commit; the issue could be
             demonstrated by using the UI in the following way:

             1. log in with user A
             2. go to /intervals-overview
             3. log out
             4. log in with user B
             5. go to /intervals-overview

             which would report a crash in the browser
             due to "TypeError: goal is undefined"
             as well as to the `goal.description` within <IntervalsOverview>

             so, that commit contained a bug in [that commit's implementation] of the UI
             - the bug consisted in the fact that logging out didn't use to
             correctly update the "intervals" slice of the Redux state
    */
  }

  const links = isAuthenticated ? (
    <ul>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <a href="#!" onClick={handleClick}>
          Logout
        </a>
      </li>
    </ul>
  ) : (
    <div>
      <ul>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </div>
  )

  return (
    <nav>
      <h1>
        <Link to="/">GoalTracker</Link>
      </h1>
      {requestStatus !== 'loading' && <Fragment>{links}</Fragment>}
    </nav>
  )
}

export default NavigationBar
