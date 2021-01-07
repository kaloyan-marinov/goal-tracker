// import React from 'react'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchGoals } from '../goals/goalsSlice'
import { fetchIntervals } from './intervalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { useSelector } from 'react-redux'
import { selectGoalEntities } from '../goals/goalsSlice'
import { selectIntervalIds, selectIntervalEntities } from './intervalsSlice'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'

const IntervalsOverview = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    /* TODO: [identical to the TODO, which is within the useEffect() call in
             <GoalsOverview>]
    
             find out if the next instruction is an acceptable way of dispatching the
             fetchGoals() and fetchIntervals() "thunk" actions:
             (a) one after another, and
             (b) in such a way that allows us to handle the potential failure of each
                 individual "thunk" action separately
    */
    dispatch(fetchGoals())
      .catch(() => dispatch(displayAlertTemporarily('FAILED TO FETCH GOALS')))
      .then(() => dispatch(fetchIntervals()))
      .catch(() =>
        dispatch(displayAlertTemporarily('FAILED TO FETCH INTERVALS'))
      )
  }, [])

  const goalEntities = useSelector(selectGoalEntities)
  const intervalIds = useSelector(selectIntervalIds)
  const intervalEntities = useSelector(selectIntervalEntities)

  const intervalTableRows = intervalIds.map((intervalId) => {
    const interval = intervalEntities[intervalId]

    const goal = goalEntities[interval.goal_id]

    return (
      <tr key={interval.id}>
        <td>
          <Link to={`/delete-interval/${interval.id}`}>Delete</Link>
        </td>
        <td>
          <Link to={`/edit-interval/${interval.id}`}>Edit</Link>
        </td>
        <td>{interval.start}</td>
        <td>{interval.final}</td>
        <td>{goal.description}</td>
      </tr>
    )
  })

  return (
    <Fragment>
      [IntervalsOverview]
      <div>
        <p>Intervals</p>
        <div>
          <Link to="/add-new-interval">Add a new interval</Link>
        </div>
        <br />
        <table border="1">
          <tr>
            <th>[Column-1]</th>
            <th>[Column-2]</th>
            <th>Start</th>
            <th>End</th>
            <th>Goal Description</th>
          </tr>
          {intervalTableRows}
        </table>
      </div>
    </Fragment>
  )
}

export default IntervalsOverview
