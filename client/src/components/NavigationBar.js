// import React from "react";
import { Link } from 'react-router-dom'

const NavigationBar = () => {
  return (
    <nav>
      <h1>
        <Link to="/">GoalTracker</Link>
      </h1>
      <ul>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavigationBar
