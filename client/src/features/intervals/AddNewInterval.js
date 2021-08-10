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

           restatement on 2021/08/10, 07:05
              this component should only be rendered
              when the user clicks 'Add a new interval' on <IntervalsOverview>

              in view of that and in view of <IntervalsOverview>'s own effect function,
              it should be possible to altogether remove the following useEffect hook
  */
  useEffect(() => {
    console.log('    <AddNewInterval> is running its effect function')

    const effectFn = async () => {
      console.log(
        "    <AddNewInterval>'s useEffect hook is dispatching fetchGoals()"
      )
      try {
        await dispatch(fetchGoals())
      } catch (err) {
        dispatch(displayAlertTemporarily('FAILED TO FETCH GOALS'))
      }
    }

    effectFn()
  }, [dispatch])

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
  /* TODO: find out whether goalId should remain unused, or if it should be used
           similarly to how this component's other state variables are used
  */

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(createInterval(goalId, startTimestamp, finalTimestamp))
      dispatch(displayAlertTemporarily('NEW INTERVAL ADDED'))
      setToIntervalsOverview(true)
    } catch (actionError) {
      dispatch(displayAlertTemporarily(actionError))
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
      <form onSubmit={(e) => onSubmit(e)}>
        <h3>Select the goal that you have worked on</h3>
        <select name="goalId" value={goalId} onChange={onChange}>
          <option value="0"></option>
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
