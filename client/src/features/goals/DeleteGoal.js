// import React from 'react'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { reinitializeGoalsSlice, selectGoalEntities } from './goalsSlice'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { deleteGoal } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { logout } from '../auth/authSlice'
import { reinitializeIntervalsSlice } from '../intervals/intervalsSlice'

const DeleteGoal = (props) => {
  console.log(`${new Date().toISOString()} - React is rendering <DeleteGoal>`)

  const dispatch = useDispatch()

  const goalId = props.match.params.id
  const goal = useSelector(selectGoalEntities)[goalId]

  const [toGoalsOverview, setToGoalsOverview] = useState(false)

  if (goal === undefined || toGoalsOverview) {
    const nextUrl = '/goals-overview'
    console.log(`    goal === undefined || toGoalsOverview: true`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const handleClickYes = async () => {
    try {
      await dispatch(deleteGoal(goal.id))
      dispatch(displayAlertTemporarily('GOAL SUCCESSFULLY DELETED'))
    } catch (err) {
      let alertMessage

      if (err.response.status === 401) {
        dispatch(logout())
        dispatch(reinitializeGoalsSlice())
        dispatch(reinitializeIntervalsSlice())
        alertMessage = 'FAILED TO DELETE THE SELECTED GOAL - PLEASE LOG BACK IN'
      } else {
        alertMessage =
          err.response.data.message ||
          'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      }

      dispatch(displayAlertTemporarily('[FROM <DeleteGoal>] ' + alertMessage))
    }
  }

  const handleClickNo = () => setToGoalsOverview(true)

  return (
    <Fragment>
      [DeleteGoal]
      <div>
        <h3>Description of the selected goal:</h3>
        <input type="text" value={goal.description} disabled />
      </div>
      <hr />
      <div>Do you want to delete the selected goal?</div>
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

export default DeleteGoal
