// import React from "react";
import { Fragment } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import Landing from './components/Landing'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Fragment>
        <NavigationBar />
        <Route exact path="/" component={Landing} />
        <section className="container">
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
