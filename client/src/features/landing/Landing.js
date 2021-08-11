// import React from "react";
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../auth/authSlice'
import { Redirect } from 'react-router-dom'

const Landing = () => {
  console.log(`${new Date().toISOString()} - React is rendering <Landing>`)

  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    const nextUrl = '/dashboard'
    console.log(`    isAuthenticated: ${isAuthenticated}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  return (
    <div className="container">
      <h1>WELCOME TO GoalTracker</h1>
      <p>
        Start keeping track of how much time you spend in pursuit of your goals!
      </p>
    </div>
  )
}

export default Landing
