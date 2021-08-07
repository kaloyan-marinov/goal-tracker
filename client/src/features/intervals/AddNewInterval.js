// import React from 'react'
import { Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { selectGoalIds, selectGoalEntities } from '../goals/goalsSlice'
import { useEffect } from 'react'
import { fetchGoals } from '../goals/goalsSlice'
import { Redirect } from 'react-router-dom'
import { createInterval } from './intervalsSlice'

const AddNewInterval = () => {
  console.log(
    `${new Date().toISOString()} - React is rendering <AddNewInterval>`
  )

  /* TODO: add logic for validating the data entered into the input fields
   */
  const dispatch = useDispatch()

  const goalIds = useSelector(selectGoalIds)
  const goalEntities = useSelector(selectGoalEntities)
  /* TODO: look into whether the "make <IntervalsOverview> display the Goal Description
           (instead of the Goal ID)" commit made it possible to altogether remove the
           following call of useEffect
  */
  useEffect(() => {
    console.log('    <AddNewInterval> is running its effect function')

    const promise = dispatch(fetchGoals())
    return promise
      .then(() => {})
      .catch(() => dispatch(displayAlertTemporarily('FAILED TO FETCH GOALS')))
  }, [])

  const [formData, setFormData] = useState({
    goalId: '',
    startTimestamp: '',
    finalTimestamp: '',
  })
  const [toIntervalsOverview, setToIntervalsOverview] = useState(false)

  if (toIntervalsOverview) {
    return <Redirect to="/intervals-overview" />
  }

  const { goalId, startTimestamp, finalTimestamp } = formData
  /* TODO: find out whether goalId should remain unused, or if it should be used
           similarly to how this component's other state variables are used
  */

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    dispatch(createInterval(goalId, startTimestamp, finalTimestamp))
      .then(() => dispatch(displayAlertTemporarily('NEW INTERVAL ADDED')))
      .then(() => setToIntervalsOverview(true))
      .catch((actionError) => dispatch(displayAlertTemporarily(actionError)))
  }

  const goalOptions = goalIds.map((gId) => (
    <option key={gId} value={gId}>
      {goalEntities[gId].description}
    </option>
  ))

  return (
    <Fragment>
      [AddNewInterval]
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
        <input type="submit" value="Add interval" />
      </form>
    </Fragment>
  )
}

export default AddNewInterval
