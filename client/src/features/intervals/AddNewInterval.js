// import React from 'react'
import { Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import {
  selectGoalIds,
  selectGoalEntities,
  reinitializeGoalsSlice,
} from '../goals/goalsSlice'
import { Redirect } from 'react-router-dom'
import { createInterval, reinitializeIntervalsSlice } from './intervalsSlice'
import { logout } from '../auth/authSlice'

const AddNewInterval = () => {
  console.log(
    `${new Date().toISOString()} - React is rendering <AddNewInterval>`
  )

  /*
  TODO: add logic for validating the data entered into the input fields
  */
  const dispatch = useDispatch()

  const goalIds = useSelector(selectGoalIds)
  const goalEntities = useSelector(selectGoalEntities)

  const [formData, setFormData] = useState({
    goalId: '0',
    startTimestamp: '',
    finalTimestamp: '',
  })
  const [toIntervalsOverview, setToIntervalsOverview] = useState(false)

  if (toIntervalsOverview) {
    const nextUrl = '/intervals-overview'
    console.log(`    toIntervalsOverview: ${toIntervalsOverview}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const { goalId, startTimestamp, finalTimestamp } = formData

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(createInterval(goalId, startTimestamp, finalTimestamp))
      dispatch(displayAlertTemporarily('NEW INTERVAL ADDED'))
      setToIntervalsOverview(true)
    } catch (err) {
      let alertMessage

      if (err.response.status === 401) {
        dispatch(logout())
        dispatch(reinitializeGoalsSlice())
        dispatch(reinitializeIntervalsSlice())
        alertMessage = 'FAILED TO ADD A NEW INTERVAL - PLEASE LOG BACK IN'
      } else {
        alertMessage =
          err.response.data.message ||
          'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      }

      dispatch(
        displayAlertTemporarily('[FROM <AddNewInterval>] ' + alertMessage)
      )
    }
  }

  const goalOptions = goalIds.map((gId) => (
    <option key={gId} value={gId.toString()}>
      {goalEntities[gId].description}
    </option>
  ))

  return (
    <Fragment>
      [AddNewInterval]
      <form onSubmit={(e) => handleSubmit(e)}>
        <h3>Select the goal that you have worked on</h3>
        <select name="goalId" value={goalId} onChange={handleChange}>
          <option value="0"></option>
          {goalOptions}
        </select>
        <h3>Enter the start timestamp (in GMT)</h3>
        <input
          type="text"
          placeholder="YYYY-MM-DD HH:MM"
          name="startTimestamp"
          value={startTimestamp}
          onChange={handleChange}
        />
        <h3>Enter the final timestamp (in GMT)</h3>
        <input
          type="text"
          placeholder="YYYY-MM-DD HH:MM"
          name="finalTimestamp"
          value={finalTimestamp}
          onChange={handleChange}
        />
        <hr />
        <input type="submit" value="Add interval" />
      </form>
    </Fragment>
  )
}

export default AddNewInterval
