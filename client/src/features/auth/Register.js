// import React from "react";
import { useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const Register = () => {
  const dispatch = useDispatch()

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

  const onSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      dispatch(displayAlertTemporarily('PASSWORDS DO NOT MATCH'))
    } else {
      // TODO: Make a request for creating a new user to the backend.
      console.log(`${Date().toString()}`)
      console.log(formData)
    }
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
            required
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
