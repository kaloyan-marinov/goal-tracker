// import React from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { selectIntervalEntities } from './intervalsSlice'
import { selectGoalEntities, selectGoalIds } from '../goals/goalsSlice'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { editInterval } from './intervalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'

const EditInterval = (props) => {
  const dispatch = useDispatch()

  const intervalId = props.match.params.id
  const interval = useSelector(selectIntervalEntities)[intervalId]
  const goalIds = useSelector(selectGoalIds)
  const goalEntities = useSelector(selectGoalEntities)
  const goal = goalEntities[interval.goal_id]

  const [formData, setFormData] = useState({
    goalId: interval.goal_id,
    startTimestamp: interval.start,
    finalTimestamp: interval.final,
  })

  const [toIntervalsOverview, setToIntervalsOverview] = useState(false)

  if (toIntervalsOverview) {
    return <Redirect to="/intervals-overview" />
  }

  const { goalId, startTimestamp, finalTimestamp } = formData

  const goalOptions = goalIds.map((gId) =>
    gId === goalId ? (
      <option selected="selected" key={gId} value={gId}>
        {goalEntities[gId].description}
      </option>
    ) : (
      <option key={gId} value={gId}>
        {goalEntities[gId].description}
      </option>
    )
  )

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = (e) => {
    e.preventDefault()

    dispatch(editInterval(interval.id, goalId, startTimestamp, finalTimestamp))
      .then(() =>
        dispatch(displayAlertTemporarily('INTERVAL SUCCESSFULLY EDITED'))
      )
      .then(() => {
        setToIntervalsOverview(true)
      })
      .catch((actionError) => {
        dispatch(displayAlertTemporarily(actionError))
      })
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
        <form onSubmit={(e) => onSubmit(e)}>
          <h3>Select the goal that you have worked on</h3>
          <select name="goalId" onChange={onChange}>
            <option value=""></option>
            {goalOptions}
          </select>
          <h3>Enter the start timestamp (in GMT)</h3>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:MM"
            name="startTimestamp"
            value={startTimestamp}
            onChange={onChange}
          />
          <h3>Enter the final timestamp (in GMT)</h3>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:MM"
            name="finalTimestamp"
            value={finalTimestamp}
            onChange={onChange}
          />
          <hr />
          <input type="submit" value="Edit" />
        </form>
      </div>
    </Fragment>
  )
}

export default EditInterval
