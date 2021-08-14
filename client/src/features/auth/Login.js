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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(issueJWSToken(email, password))
      dispatch(displayAlertTemporarily('YOU HAVE LOGGED IN SUCCESSFULLY'))
      await dispatch(fetchUser())
    } catch (thunkActionErrorOrWholeErrorObject) {
      dispatch(displayAlertTemporarily(thunkActionErrorOrWholeErrorObject))
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
      <form onSubmit={(e) => handleSubmit(e)}>
        <div>
          <input
            type="email"
            placeholder="Enter email"
            name="email"
            value={email}
            onChange={(e) => handleChange(e)}
            // required // disabled temporarily, to test the server side
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter password"
            name="password"
            value={password}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <input type="submit" value="Login" />
      </form>
    </Fragment>
  )
}

export default Login
