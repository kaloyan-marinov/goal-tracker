// import React from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { selectGoalEntities } from './goalsSlice'
import { useState, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import { editGoal } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { Link } from 'react-router-dom'

const EditGoal = (props) => {
  const dispatch = useDispatch()

  const goalId = props.match.params.id
  const goal = useSelector(selectGoalEntities)[goalId]
  const [description, setDescription] = useState(goal.description)

  const [toGoalsOverview, setToGoalsOverview] = useState(false)

  if (toGoalsOverview) {
    return <Redirect to="/goals-overview" />
  }

  const onChange = (e) => {
    setDescription(e.target.value)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    dispatch(editGoal(goalId, description))
      .then(() => dispatch(displayAlertTemporarily('GOAL SUCCESSFULLY EDITED')))
      .then(() => {
        setToGoalsOverview(true)
      })
      .catch(() => {
        dispatch(displayAlertTemporarily('FAILED TO EDIT THE SELECTED GOAL'))
      })
  }

  return (
    <Fragment>
      [EditGoal]
      <div>
        <Link to="/goals-overview">Return to Goals Overview</Link>
      </div>
      <form onSubmit={(e) => onSubmit(e)}>
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
            onChange={(e) => onChange(e)}
            // required // disabled temporarily, to test the server side
          />
        </div>
        <input type="submit" value="Edit" />
      </form>
    </Fragment>
  )
}

export default EditGoal
