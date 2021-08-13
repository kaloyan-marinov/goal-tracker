// import React from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { reinitializeGoalsSlice, selectGoalEntities } from './goalsSlice'
import { useState, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import { editGoal } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { Link } from 'react-router-dom'
import { logout } from '../auth/authSlice'
import { reinitializeIntervalsSlice } from '../intervals/intervalsSlice'

const EditGoal = (props) => {
  console.log(`${new Date().toISOString()} - React is rendering <EditGoal>`)

  const dispatch = useDispatch()

  const goalId = props.match.params.id
  const goal = useSelector(selectGoalEntities)[goalId]
  const [description, setDescription] = useState(goal.description)

  const [toGoalsOverview, setToGoalsOverview] = useState(false)

  if (toGoalsOverview) {
    const nextUrl = '/goals-overview'
    console.log(`    toGoalsOverview: ${toGoalsOverview}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const handleChange = (e) => {
    setDescription(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(editGoal(goalId, description))
      dispatch(displayAlertTemporarily('GOAL SUCCESSFULLY EDITED'))
      setToGoalsOverview(true)
    } catch (err) {
      let alertMessage

      if (err.response.status === 401) {
        dispatch(logout())
        dispatch(reinitializeGoalsSlice())
        dispatch(reinitializeIntervalsSlice())
        alertMessage = 'FAILED TO EDIT THE SELECTED GOAL - PLEASE LOG BACK IN'
      } else {
        alertMessage =
          err.response.data.message ||
          'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
      }

      dispatch(displayAlertTemporarily('[FROM <EditGoal>] ' + alertMessage))
    }
  }

  return (
    <Fragment>
      [EditGoal]
      <div>
        <Link to="/goals-overview">Return to Goals Overview</Link>
      </div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div>
          <h3>Description of the selected goal:</h3>
          <input type="text" value={goal.description} disabled />
        </div>
        <div>
          <h3>New description:</h3>
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => handleChange(e)}
            // required // disabled temporarily, to test the server side
          />
        </div>
        <input type="submit" value="Edit" />
      </form>
    </Fragment>
  )
}

export default EditGoal
