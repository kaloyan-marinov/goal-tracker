// import React from "react";
import { useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { createUser, issueJWSToken } from './authSlice'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from './authSlice'
import { Redirect } from 'react-router-dom'
import { fetchUser } from './authSlice'

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

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      dispatch(displayAlertTemporarily('PASSWORDS DO NOT MATCH'))
    } else {
      try {
        await dispatch(createUser(email, password))
        dispatch(displayAlertTemporarily('YOU HAVE SUCCESSFULLY REGISTERED'))

        await dispatch(issueJWSToken(email, password))

        await dispatch(fetchUser())
      } catch (actionError) {
        dispatch(displayAlertTemporarily(actionError))
      }
    }
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />
  }

  return (
    <Fragment>
      <h1>Register</h1>
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
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => onChange(e)}
          />
        </div>
        <input type="submit" value="Register" />
      </form>
    </Fragment>
  )
}

export default Register
