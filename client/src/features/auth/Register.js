// import React from "react";
import { useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { createUser } from './authSlice'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from './authSlice'
import { Redirect } from 'react-router-dom'

const Register = () => {
  console.log(`${new Date().toISOString()} - React is rendering <Register>`)

  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const { email, password, confirmPassword } = formData

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      dispatch(displayAlertTemporarily('PASSWORDS DO NOT MATCH'))
    } else {
      try {
        await dispatch(createUser(email, password))
        dispatch(displayAlertTemporarily('YOU HAVE REGISTERED SUCCESSFULLY'))
      } catch (thunkActionError) {
        dispatch(displayAlertTemporarily(thunkActionError))
      }
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
      <h1>Register</h1>
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
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <input type="submit" value="Register" />
      </form>
    </Fragment>
  )
}

export default Register
