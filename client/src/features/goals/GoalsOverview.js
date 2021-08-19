// import React from 'react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchGoals, reinitializeGoalsSlice } from './goalsSlice'
import {
  fetchIntervals,
  reinitializeIntervalsSlice,
  selectIntervalsLinks,
} from '../intervals/intervalsSlice'
import { useSelector } from 'react-redux'
import { selectGoalIds, selectGoalEntities } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { logout } from '../auth/authSlice'
import { URL_FOR_FIRST_PAGE_OF_INTERVALS } from '../../constants'

const GoalsOverview = () => {
  console.log(
    `${new Date().toISOString()} - React is rendering <GoalsOverview>`
  )

  const goalIds = useSelector(selectGoalIds)
  console.log(`    goalIds: ${JSON.stringify(goalIds)}`)

  const goalEntities = useSelector(selectGoalEntities)
  // console.log(`    goalEntities: ${JSON.stringify(goalEntities)}`)

  const intervalsLinks = useSelector(selectIntervalsLinks)
  console.log(`    intervalsLinks: ${JSON.stringify(intervalsLinks)}`)

  const intervalsUrl =
    intervalsLinks.self === null
      ? URL_FOR_FIRST_PAGE_OF_INTERVALS
      : intervalsLinks.self

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
        let alertMessage

        if (err.response.status === 401) {
          dispatch(logout())
          dispatch(reinitializeGoalsSlice())
          dispatch(reinitializeIntervalsSlice())
          alertMessage = 'FAILED TO FETCH GOALS - PLEASE LOG BACK IN'
        } else {
          alertMessage =
            err.response.data.message ||
            'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
        }

        dispatch(
          displayAlertTemporarily(
            "[FROM <GoalsOverview>'s useEffect HOOK] " + alertMessage
          )
        )
      }

      console.log(
        "    <GoalsOverview>'s useEffect hook is dispatching fetchIntervals(intervalsUrl)"
      )
      console.log(`    with intervalsUrl: ${intervalsUrl}`)
      try {
        await dispatch(fetchIntervals(intervalsUrl))
      } catch (err) {
        let alertMessage

        if (err.response.status === 401) {
          dispatch(logout())
          dispatch(reinitializeGoalsSlice())
          dispatch(reinitializeIntervalsSlice())
          alertMessage = 'FAILED TO FETCH INTERVALS - PLEASE LOG BACK IN'
        } else {
          alertMessage =
            err.response.data.message ||
            'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
        }

        dispatch(
          displayAlertTemporarily(
            "[FROM <GoalsOverview>'s useEffect HOOK] " + alertMessage
          )
        )
      }
    }

    effectFn()
  }, [dispatch, intervalsUrl])

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
