// import React from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import {
  reinitializeIntervalsSlice,
  selectIntervalEntities,
} from './intervalsSlice'
import {
  reinitializeGoalsSlice,
  selectGoalEntities,
  selectGoalIds,
} from '../goals/goalsSlice'
import { useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { editInterval } from './intervalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { logout } from '../auth/authSlice'

const EditInterval = (props) => {
  console.log(`${new Date().toISOString()} - React is rendering <EditInterval>`)

  const dispatch = useDispatch()

  const params = useParams()
  const intervalId = params.id

  const interval = useSelector(selectIntervalEntities)[intervalId]
  const goalIds = useSelector(selectGoalIds)
  const goalEntities = useSelector(selectGoalEntities)
  const goal = goalEntities[interval.goal_id]

  const [formData, setFormData] = useState({
    goalId: interval.goal_id.toString(),
    startTimestamp: interval.start,
    finalTimestamp: interval.final,
  })

  const [toIntervalsOverview, setToIntervalsOverview] = useState(false)

  if (toIntervalsOverview) {
    const nextUrl = '/intervals-overview'
    console.log(`    toIntervalsOverview: ${toIntervalsOverview}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const { goalId, startTimestamp, finalTimestamp } = formData

  const goalOptions = goalIds.map((gId) => (
    <option key={gId} value={gId.toString()}>
      {goalEntities[gId].description}
    </option>
  ))

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(
        editInterval(interval.id, goalId, startTimestamp, finalTimestamp)
      )
      dispatch(displayAlertTemporarily('INTERVAL SUCCESSFULLY EDITED'))
      setToIntervalsOverview(true)
    } catch (err) {
      let alertMessage

      if (err.response.status === 401) {
        dispatch(logout())
        dispatch(reinitializeGoalsSlice())
        dispatch(reinitializeIntervalsSlice())
        alertMessage =
          'FAILED TO EDIT THE SELECTED INTERVAL - PLEASE LOG BACK IN'
      } else {
        alertMessage =
          err.response.data.message ||
          'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      }

      dispatch(displayAlertTemporarily('[FROM <EditInterval>] ' + alertMessage))
    }
  }

  return (
    <Fragment>
      [EditInterval]
      <div>
        <Link to="/intervals-overview">Return to Intervals Overview</Link>
      </div>
      <div>
        <h3>The selected interval:</h3>
        <table border="1">
          <tr>
            <th>Start</th>
            <th>Final</th>
            <th>Goal Description</th>
          </tr>
          <tr>
            <td>{interval.start}</td>
            <td>{interval.final}</td>
            <td>{goal.description}</td>
          </tr>
        </table>
        <hr />
        <form onSubmit={(e) => handleSubmit(e)}>
          <h3>Select the goal that you have worked on</h3>
          <select name="goalId" value={goalId} onChange={handleChange}>
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
          <input type="submit" value="Edit" />
        </form>
      </div>
    </Fragment>
  )
}

export default EditInterval
