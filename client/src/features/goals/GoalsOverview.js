// import React from 'react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchGoals } from './goalsSlice'
import { fetchIntervals } from '../intervals/intervalsSlice'
import { useSelector } from 'react-redux'
import { selectGoalIds, selectGoalEntities } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const GoalsOverview = () => {
  console.log(
    `${new Date().toISOString()} - React is rendering <GoalsOverview>`
  )

  const dispatch = useDispatch()

  useEffect(() => {
    console.log('    <GoalsOverview> is running its effect function')

    /* TODO: consider a user who logs in successfully using the UI
             - find out why such a user cannot simply type in "/add-new-goal" or
             "/add-new-interval" in his/her browser's address bar
    */

    const effectFn = async () => {
      console.log(
        "    <GoalsOverview>'s useEffect hook is dispatching fetchGoals()"
      )
      try {
        await dispatch(fetchGoals())
      } catch (err) {
        dispatch(displayAlertTemporarily('FAILED TO FETCH GOALS'))
      }

      console.log(
        "    <GoalsOverview>'s useEffect hook is dispatching fetchIntervals()"
      )
      try {
        await dispatch(fetchIntervals())
      } catch (err) {
        dispatch(displayAlertTemporarily('FAILED TO FETCH INTERVALS'))
      }
    }

    effectFn()
  }, [dispatch])

  const goalIds = useSelector(selectGoalIds)
  const goalEntities = useSelector(selectGoalEntities)

  const goalTableRows = goalIds.map((goalId) => {
    const goal = goalEntities[goalId]

    return (
      <tr key={goal.id}>
        <td>
          <Link to={`/delete-goal/${goal.id}`}>Delete</Link>
        </td>
        <td>
          <Link to={`/edit-goal/${goal.id}`}>Edit</Link>
        </td>
        <td>{goal.description}</td>
      </tr>
    )
  })

  return (
    <Fragment>
      [GoalsOverview]
      <div>
        <p>Goals</p>
        <div>
          <Link to="/add-new-goal">Add a new goal</Link>
        </div>
        <br />
        <table border="1">
          <thead>
            <tr>
              <th>[Column-1]</th>
              <th>[Column-2]</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>{goalTableRows}</tbody>
        </table>
      </div>
    </Fragment>
  )
}

export default GoalsOverview
