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
  const dispatch = useDispatch()

  useEffect(() => {
    /* TODO: consider the commit immediately before this function was implemented in its
             present form; there was an issue with that commit; the issue could be
             demonstrated by using the UI in the following way:

             1. go to /goals-overview
             2. create a new Goal
             3. go to /intervals-overview
             4. create a new Interval associated with the newly-created Goal
             5. go to /goals-overview
             6. delete the newly-created Goal
             7. go to /intervals-overview
                which would report a crash in the browser
                due to "TypeError: goal is undefined"
                as well as to the `goal.description` within <IntervalsOverview>

             so, that commit contained a bug in [that commit's implementation] of the UI
             - the bug consisted in the fact that deleting a Goal didn't use to
             correctly update the user's Interval resources in the Redux state
    */
    /* TODO: consider a user who logs in successfully using the UI
             - find out why such a user cannot simply type in "/add-new-goal" or
             "/add-new-interval" in his/her browser's address bar
   */
    /* TODO: [similar but not identical to the TODO, which is within the useEffect()
             call in <App>]
    
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
          <tr>
            <th>[Column-1]</th>
            <th>[Column-2]</th>
            <th>Description</th>
          </tr>
          {goalTableRows}
        </table>
      </div>
    </Fragment>
  )
}

export default GoalsOverview
