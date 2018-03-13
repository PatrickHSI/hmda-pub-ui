import React from 'react'
import { Switch, Route } from 'react-router-dom'
import BannerUSA from './common/BannerUSA.jsx'
import AppHeader from './common/AppHeader.jsx'
import Footer from './common/Footer.jsx'
import Home from './Home.jsx'
import ModifiedLar from './reports/modified-lar/index.jsx'
import NotFound from './common/NotFound.jsx'

const App = () => {
  return (
    <React.Fragment>
      <AppHeader />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/reports/modified-lar/*" component={NotFound} />
        <Route path="/reports/modified-lar" component={ModifiedLar} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </React.Fragment>
  )
}

export default App
