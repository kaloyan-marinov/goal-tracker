// import React from 'react'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { selectGoalEntities } from './goalsSlice'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { deleteGoal } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'

const DeleteGoal = (props) => {
  console.log(`${new Date().toISOString()} - React is rendering <DeleteGoal>`)

  const dispatch = useDispatch()

  const goalId = props.match.params.id
  const goal = useSelector(selectGoalEntities)[goalId]

  const [toGoalsOverview, setToGoalsOverview] = useState(false)

  if (toGoalsOverview || goal === undefined) {
    const nextUrl = '/goals-overview'
    console.log(
      `    toGoalsOverview || goal === undefined: ${
        toGoalsOverview || goal === undefined
      }`
    )
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const handleClickYes = async () => {
    try {
      await dispatch(deleteGoal(goal.id))
      dispatch(displayAlertTemporarily('GOAL SUCCESSFULLY DELETED'))
    } catch (err) {
      dispatch(displayAlertTemporarily('FAILED TO DELETE THE SELECTED GOAL'))
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
