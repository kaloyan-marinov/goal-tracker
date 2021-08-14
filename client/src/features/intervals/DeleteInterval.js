// import React from 'react'
import { Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import {
  reinitializeIntervalsSlice,
  selectIntervalEntities,
} from './intervalsSlice'
import { reinitializeGoalsSlice, selectGoalEntities } from '../goals/goalsSlice'
import { useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { deleteInterval } from './intervalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { logout } from '../auth/authSlice'

const DeleteInterval = (props) => {
  console.log(
    `${new Date().toISOString()} - React is rendering <DeleteInterval>`
  )

  const dispatch = useDispatch()

  const params = useParams()
  const intervalId = params.id

  const interval = useSelector(selectIntervalEntities)[intervalId]
  console.log(`    interval: ${JSON.stringify(interval)}`)

  const isIntervalUndefined = interval === undefined
  const goalId = isIntervalUndefined === true ? '-1' : interval.goal_id
  const goal = useSelector(selectGoalEntities)[goalId]
  console.log(`    goal: ${JSON.stringify(goal)}`)

  const [toIntervalsOverview, setToIntervalsOverview] =
    useState(isIntervalUndefined)

  if (isIntervalUndefined || toIntervalsOverview) {
    const nextUrl = '/intervals-overview'
    console.log(`    isIntervalUndefined: ${isIntervalUndefined}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const handleClickYes = async () => {
    try {
      await dispatch(deleteInterval(interval.id))
      dispatch(displayAlertTemporarily('INTERVAL SUCCESSFULLY DELETED'))
    } catch (err) {
      let alertMessage

      if (err.response.status === 401) {
        dispatch(logout())
        dispatch(reinitializeGoalsSlice())
        dispatch(reinitializeIntervalsSlice())
        alertMessage =
          'FAILED TO DELETE THE SELECTED INTERVAL - PLEASE LOG BACK IN'
      } else {
        alertMessage =
          err.response.data.message ||
          'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      }

      dispatch(
        displayAlertTemporarily('[FROM <DeleteInterval>] ' + alertMessage)
      )
    }
  }

  const handleClickNo = () => setToIntervalsOverview(true)

  return (
    <Fragment>
      [DeleteInterval]
      <h3>The selected interval:</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Start</th>
            <th>Final</th>
            <th>Goal Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{interval.start}</td>
            <td>{interval.final}</td>
            <td>{goal.description}</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <div>Do you want to delete the selected interval?</div>
      <ul>
        <li>
          <button onClick={handleClickYes}>Yes</button>
        </li>
        <li>
          <button onClick={handleClickNo}>No</button>
        </li>
      </ul>
    </Fragment>
  )
}

export default DeleteInterval
