// import React from 'react'
import { Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { selectIntervalEntities } from './intervalsSlice'
import { selectGoalEntities } from '../goals/goalsSlice'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { deleteInterval } from './intervalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const DeleteInterval = (props) => {
  console.log(
    `${new Date().toISOString()} - React is rendering <DeleteInterval>`
  )

  const dispatch = useDispatch()

  const intervalId = props.match.params.id
  const interval = useSelector(selectIntervalEntities)[intervalId]
  const goal = useSelector(selectGoalEntities)[interval.goal_id]

  console.log(`    interval: ${JSON.stringify(interval)}`)
  console.log(`    goal: ${JSON.stringify(goal)}`)

  const [toIntervalsOverview, setToIntervalsOverview] = useState(false)

  if (toIntervalsOverview) {
    const nextUrl = '/intervals-overview'
    console.log(`    toIntervalsOverview: ${toIntervalsOverview}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const onClickYes = async () => {
    try {
      await dispatch(deleteInterval(interval.id))
      dispatch(displayAlertTemporarily('INTERVAL SUCCESSFULLY DELETED'))
      setToIntervalsOverview(true)
    } catch (err) {
      dispatch(
        displayAlertTemporarily('FAILED TO DELETE THE SELECTED INTERVAL')
      )
    }
  }

  const onClickNo = () => setToIntervalsOverview(true)

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
          <button onClick={onClickYes}>Yes</button>
        </li>
        <li>
          <button onClick={onClickNo}>No</button>
        </li>
      </ul>
    </Fragment>
  )
}

export default DeleteInterval
