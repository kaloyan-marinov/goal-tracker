// import React from 'react'
import { useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { createGoal } from './goalsSlice'
import { displayAlertTemporarily } from '../alerts/alertsSlice'
import { Redirect } from 'react-router-dom'

const AddNewGoal = () => {
  console.log(`${new Date().toISOString()} - React is rendering <AddNewGoal>`)

  const dispatch = useDispatch()
  const [description, setDescription] = useState('')
  const [toGoalsOverview, setToGoalsOverview] = useState(false)

  if (toGoalsOverview) {
    /*
    recall that this component utilizes the declarative approach
    that is recommended by https://ui.dev/react-router-v5-programmatically-navigate/
    
    TODO:
    notice that this ends up dispatching a "fetchGoals()" thunk-action, but
    the diff of that thunk-action's "goals/fetchGoalsFulfilled" sub-action is empty

    this means that the HTTP request, which the thunk-action sends to the backend API,
    is unnecessary

    figure out how to avoid sending that request
    */
    const nextUrl = '/goals-overview'
    console.log(`    toGoalsOverview: ${toGoalsOverview}`)
    console.log(`    >> re-directing to ${nextUrl}`)
    return <Redirect to={nextUrl} />
  }

  const onChange = (e) => {
    setDescription(e.target.value)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      await dispatch(createGoal(description))
      dispatch(displayAlertTemporarily('NEW GOAL ADDED'))
      setToGoalsOverview(true)
    } catch (err) {
      dispatch(displayAlertTemporarily('FAILED TO ADD A NEW GOAL'))
    }
  }

  return (
    <Fragment>
      [AddNewGoal]
      <form onSubmit={(e) => onSubmit(e)}>
        <div>
          <input
            type="text"
            placeholder="Enter description of goal"
            name="description"
            value={description}
            onChange={(e) => onChange(e)}
            // required // disabled temporarily, to test the server side
          />
        </div>
        <input type="submit" value="Add goal" />
      </form>
    </Fragment>
  )
}

export default AddNewGoal
