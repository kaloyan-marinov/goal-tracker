// import React from 'react'
import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetchGoals, reinitializeGoalsSlice } from '../goals/goalsSlice'
import {
  fetchIntervals,
  reinitializeIntervalsSlice,
  selectIntervalsLinks,
  selectIntervalsMeta,
} from './intervalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { useSelector } from 'react-redux'
import { selectGoalEntities } from '../goals/goalsSlice'
import { selectIntervalIds, selectIntervalEntities } from './intervalsSlice'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { logout } from '../auth/authSlice'
import { URL_FOR_FIRST_PAGE_OF_INTERVALS } from '../../constants'

const IntervalsOverview = () => {
  console.log(
    `${new Date().toISOString()} - React is rendering <IntervalsOverview>`
  )

  const goalEntities = useSelector(selectGoalEntities)
  console.log(`    goalEntities: ${JSON.stringify(goalEntities)}`)

  const intervalIds = useSelector(selectIntervalIds)
  console.log(`    intervalIds: ${intervalIds}`)

  const intervalEntities = useSelector(selectIntervalEntities)
  console.log(`    intervalEntities: ${JSON.stringify(intervalEntities)}`)

  const intervalsMeta = useSelector(selectIntervalsMeta)
  console.log(`    intervalsMeta: ${JSON.stringify(intervalsMeta)}`)

  const intervalsLinks = useSelector(selectIntervalsLinks)
  console.log(`    intervalsLinks: ${JSON.stringify(intervalsLinks)}`)

  const dispatch = useDispatch()

  const initialIntervalsUrl =
    intervalsLinks.self === null
      ? URL_FOR_FIRST_PAGE_OF_INTERVALS
      : intervalsLinks.self

  const [intervalsUrl, setIntervalsUrl] = useState(initialIntervalsUrl)

  useEffect(() => {
    console.log('    <IntervalsOverview> is running its effect function')

    const effectFn = async () => {
      console.log(
        "    <IntervalsOverview>'s useEffect hook is dispatching fetchGoals()"
      )
      try {
        await dispatch(fetchGoals())
      } catch (err) {
        let alertMessage

        console.error('inspectin err')
        console.error(err)

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
            "[FROM <IntervalsOverview>'s useEffect HOOK] " + alertMessage
          )
        )
      }

      console.log(
        "    <IntervalsOverview>'s useEffect hook is dispatching fetchIntervals(intervalsUrl)"
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
            "[FROM <IntervalsOverview>'s useEffect HOOK] " + alertMessage
          )
        )
      }
    }

    effectFn()
  }, [dispatch, intervalsUrl])

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

  let paginationControllingButtons
  if (intervalsMeta.page === null) {
    paginationControllingButtons = (
      <div>Building pagination-controlling buttons...</div>
    )
  } else {
    const paginationCtrlButtonPrev =
      intervalsLinks.prev !== null ? (
        <button onClick={(e) => setIntervalsUrl(intervalsLinks.prev)}>
          Previous page
        </button>
      ) : (
        <button disabled>Previous page</button>
      )

    const paginationCtrlButtonNext =
      intervalsLinks.next !== null ? (
        <button onClick={(e) => setIntervalsUrl(intervalsLinks.next)}>
          Next page
        </button>
      ) : (
        <button disabled>Next page</button>
      )

    const paginationCtrlButtonFirst =
      intervalsLinks.first !== null ? (
        <button onClick={(e) => setIntervalsUrl(intervalsLinks.first)}>
          First page
        </button>
      ) : (
        <button disabled>First page</button>
      )

    const paginationCtrlButtonLast =
      intervalsLinks.last !== null ? (
        <button onClick={(e) => setIntervalsUrl(intervalsLinks.last)}>
          Last page
        </button>
      ) : (
        <button disabled>Last page</button>
      )

    paginationControllingButtons = (
      <Fragment>
        <div>
          {paginationCtrlButtonFirst} {paginationCtrlButtonPrev}{' '}
          <span style={{ color: 'red' }}>
            Current page: {intervalsMeta.page}
          </span>{' '}
          {paginationCtrlButtonNext} {paginationCtrlButtonLast}
        </div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      [IntervalsOverview]
      <div>
        <p>Intervals</p>
        <div>
          <Link to="/add-new-interval">Add a new interval</Link>
        </div>
        <br />
        {paginationControllingButtons}
        <table border="1">
          <thead>
            <tr>
              <th>[Column-1]</th>
              <th>[Column-2]</th>
              <th>Start</th>
              <th>End</th>
              <th>Goal Description</th>
            </tr>
          </thead>
          <tbody>{intervalTableRows}</tbody>
        </table>
      </div>
    </Fragment>
  )
}

export default IntervalsOverview
