// import React from "react";
import { Fragment } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import NavigationBar from './features/navigationbar/NavigationBar'
import Landing from './features/landing/Landing'
import Register from './features/auth/Register'
import Login from './features/auth/Login'
import './App.css'
import Alert from './features/alerts/Alert'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchUser } from './features/auth/authSlice'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const promise = dispatch(fetchUser())
    /* TODO: find out if the next instruction is an acceptable way of dealing with the
             fetchUser() "thunk" action, whose latest version is introduced in the same
             commit as this comment.
    */
    return promise.then(() => {}).catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Fragment>
        <NavigationBar />
        <Route exact path="/" component={Landing} />
        <section className="container">
          <Alert />
          <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </section>
      </Fragment>
    </BrowserRouter>
  )
}

export default App
