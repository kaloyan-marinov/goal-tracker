// import React from 'react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchGoals } from './goalsSlice'
import { useSelector } from 'react-redux'
import { selectGoalIds, selectGoalEntities } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const GoalsOverview = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const promise = dispatch(fetchGoals())
    /* TODO: [similar but not identical to the TODO, which is within the useEffect()
             call in <App>]
    
             find out if the next instruction is an acceptable way of dealing with the
             fetchGoals() "thunk" action, whose latest version is introduced in the same
             commit as this comment.
    */
    return promise
      .then(() => {})
      .catch(() => dispatch(displayAlertTemporarily('FAILED TO FETCH GOALS')))
  }, [])

  const goalIds = useSelector(selectGoalIds)
  const goalEntities = useSelector(selectGoalEntities)

  return (
    <Fragment>
      [GoalsOverview]
      <div>
        <p>Goal Actions</p>
        <ul>
          <li>
            <Link to="/add-new-goal">Add a new goal</Link>
          </li>
        </ul>
      </div>
      <div>
        <p>Goals</p>
        <table>
          <tr>
            <th>Description</th>
            <th>Column-2</th>
            <th>Column-3</th>
          </tr>
          {goalIds.map((goalId) => (
            <tr key={goalId}>
              <td>{goalEntities[goalId].description}</td>
              <td>
                <Link to={`/edit-goal/${goalId}`}>Edit</Link>
              </td>
              <td>
                <Link to={`/delete-goal/${goalId}`}>Delete</Link>
              </td>
            </tr>
          ))}
        </table>
      </div>
    </Fragment>
  )
}

export default GoalsOverview
