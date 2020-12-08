// import React from "react";
import { Fragment } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import NavigationBar from './features/navigationbar/NavigationBar'
import Landing from './features/landing/Landing'
import Register from './features/auth/Register'
import Login from './features/auth/Login'
import './App.css'
import Alert from './features/alerts/Alert'

const App = () => {
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
