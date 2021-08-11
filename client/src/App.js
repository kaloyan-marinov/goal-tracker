// import React from "react";
import { Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'
import NavigationBar from './features/navigationbar/NavigationBar'
import Landing from './features/landing/Landing'
import Register from './features/auth/Register'
import Login from './features/auth/Login'
import './App.css'
import Alert from './features/alerts/Alert'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchUser } from './features/auth/authSlice'
import Dashboard from './features/dashboard/Dashboard'
import PrivateRoute from './features/auth/PrivateRoute'
import GoalsOverview from './features/goals/GoalsOverview'
import AddNewGoal from './features/goals/AddNewGoal'
import EditGoal from './features/goals/EditGoal'
import DeleteGoal from './features/goals/DeleteGoal'
import IntervalsOverview from './features/intervals/IntervalsOverview'
import AddNewInterval from './features/intervals/AddNewInterval'
import EditInterval from './features/intervals/EditInterval'
import DeleteInterval from './features/intervals/DeleteInterval'

const App = () => {
  console.log(`${new Date().toISOString()} - React is rendering <App>`)

  const dispatch = useDispatch()

  useEffect(() => {
    console.log('    <App> is running its effect function')

    const promise = dispatch(fetchUser())
    /* TODO: find out if the next instruction is an acceptable way of dealing with the
             fetchUser() "thunk" action, whose latest version is introduced in the same
             commit as this comment.
    */
    return promise
      .then(() => {
        console.log('    the promise has resolved')
      })
      .catch(() => {
        console.log('    the promise has rejected')
      })
  }, [dispatch])

  return (
    <Fragment>
      <NavigationBar />
      <Route exact path="/" component={Landing} />
      <section className="container">
        <Alert />
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <PrivateRoute exact path="/dashboard" component={Dashboard} />
          <PrivateRoute
            exact
            path="/goals-overview"
            component={GoalsOverview}
          />
          <PrivateRoute exact path="/add-new-goal" component={AddNewGoal} />
          <PrivateRoute exact path="/edit-goal/:id" component={EditGoal} />
          <PrivateRoute exact path="/delete-goal/:id" component={DeleteGoal} />
          <PrivateRoute
            exact
            path="/intervals-overview"
            component={IntervalsOverview}
          />
          <PrivateRoute
            exact
            path="/add-new-interval"
            component={AddNewInterval}
          />
          <PrivateRoute
            exact
            path="/edit-interval/:id"
            component={EditInterval}
          />
          <PrivateRoute
            exact
            path="/delete-interval/:id"
            component={DeleteInterval}
          />
        </Switch>
      </section>
    </Fragment>
  )
}

export default App
