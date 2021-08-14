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
import { fetchUser, logout } from './features/auth/authSlice'
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
import { displayAlertTemporarily } from './features/alerts/alertsSlice'
import { reinitializeGoalsSlice } from './features/goals/goalsSlice'
import { reinitializeIntervalsSlice } from './features/intervals/intervalsSlice'

const App = () => {
  console.log(`${new Date().toISOString()} - React is rendering <App>`)

  const dispatch = useDispatch()

  useEffect(() => {
    console.log('    <App> is running its effect function')

    const effectFn = async () => {
      console.log("    <App>'s useEffect hook is dispatching fetchUser()")

      try {
        await dispatch(fetchUser())
      } catch (err) {
        let alertMessage

        if (err.response.status === 401) {
          dispatch(logout())
          dispatch(reinitializeGoalsSlice())
          dispatch(reinitializeIntervalsSlice())
          alertMessage = 'PLEASE REGISTER OR LOG IN'
        } else {
          alertMessage =
            err.response.data.message ||
            'ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION'
        }

        dispatch(
          displayAlertTemporarily(
            "[FROM <App>'s useEffect HOOK] " + alertMessage
          )
        )
      }
    }

    effectFn()
  }, [dispatch])

  return (
    <Fragment>
      <NavigationBar />
      <Route exact path="/">
        <Landing />
      </Route>
      <section className="container">
        <Alert />
        <Switch>
          <Route exact path="/register">
            <Register />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <PrivateRoute exact path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute exact path="/goals-overview">
            <GoalsOverview />
          </PrivateRoute>
          <PrivateRoute exact path="/add-new-goal">
            <AddNewGoal />
          </PrivateRoute>
          <PrivateRoute exact path="/edit-goal/:id">
            <EditGoal />
          </PrivateRoute>
          <PrivateRoute exact path="/delete-goal/:id">
            <DeleteGoal />
          </PrivateRoute>
          <PrivateRoute exact path="/intervals-overview">
            <IntervalsOverview />
          </PrivateRoute>
          <PrivateRoute exact path="/add-new-interval">
            <AddNewInterval />
          </PrivateRoute>
          <PrivateRoute exact path="/edit-interval/:id">
            <EditInterval />
          </PrivateRoute>
          <PrivateRoute exact path="/delete-interval/:id">
            <DeleteInterval />
          </PrivateRoute>
        </Switch>
      </section>
    </Fragment>
  )
}

export default App
