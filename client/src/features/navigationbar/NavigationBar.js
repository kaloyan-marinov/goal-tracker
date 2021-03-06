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
import { RequestStatus } from '../../constants'

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
      {requestStatus !== RequestStatus.LOADING && <Fragment>{links}</Fragment>}
    </nav>
  )
}

export default NavigationBar
