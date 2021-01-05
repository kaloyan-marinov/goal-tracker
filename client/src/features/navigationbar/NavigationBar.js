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

const NavigationBar = () => {
  const dispatch = useDispatch()
  const requestStatus = useSelector(selectRequestStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const onClick = () => {
    dispatch(logout())
    dispatch(reinitializeGoalsSlice())
  }

  const links = isAuthenticated ? (
    <ul>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <a href="#!" onClick={onClick}>
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
