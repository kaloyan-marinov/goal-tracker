// import React from "react";
import { useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { issueJWSToken } from './authSlice'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from './authSlice'
import { Redirect } from 'react-router-dom'
import { fetchUser } from './authSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const Login = () => {
  console.log(`${new Date().toISOString()} - React is rendering <Login>`)

  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(issueJWSToken(email, password))
      await dispatch(fetchUser())
    } catch (err) {
      dispatch(displayAlertTemporarily('AUTHENTICATION FAILED'))
    }
  }

  if (isAuthenticated) {
    const nextUrl = '/dashboard'
    console.log(`    isAuthenticated: ${isAuthenticated}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  return (
    <Fragment>
      <h1>Login</h1>
      <form onSubmit={(e) => onSubmit(e)}>
        <div>
          <input
            type="email"
            placeholder="Enter email"
            name="email"
            value={email}
            onChange={(e) => onChange(e)}
            // required // disabled temporarily, to test the server side
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter password"
            name="password"
            value={password}
            onChange={(e) => onChange(e)}
          />
        </div>
        <input type="submit" value="Login" />
      </form>
    </Fragment>
  )
}

export default Login
