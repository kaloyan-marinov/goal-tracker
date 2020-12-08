// import React from 'react'
import { useSelector } from 'react-redux'

const Alert = () => {
  const alerts = useSelector((state) => state.alerts.entities)

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
