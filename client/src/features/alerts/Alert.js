// import React from 'react'
import { useSelector } from 'react-redux'

const Alert = () => {
  console.log(`${new Date().toISOString()} - React is rendering <Alert>`)

  const alerts = useSelector((state) => state.alerts.entities)
  /*
  TODO: find the commit that added the previous instruction,
        and figure out why it didn't define a selector function in authSlice.js
  */

  return (
    alerts !== null &&
    Object.keys(alerts).length > 0 &&
    Object.values(alerts).map((alert) => (
      <div key={alert.id} className="red-text">
        {alert.message}
      </div>
    ))
  )
}
export default Alert
