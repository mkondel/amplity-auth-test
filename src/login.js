/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import Router from 'next/router'
import getConfig from 'next/config'
import { Authenticator } from "aws-amplify-react"
import { API, Auth, Hub } from 'aws-amplify'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

// env variables that are set in AWS (serverless.yml)
// accessed here through next.config.js by using getConfig()
const { publicRuntimeConfig } = getConfig()
const { STAGE, googleId, facebookId } = publicRuntimeConfig

// used to have classes here, but not used anymore
const styles = theme => ({})

// url path to redirect to after a certain event
const redirectOnLogin = '/profile'
const redirectOnLogout = '/login'

// the login page with react hooks
function Login(props) {
  const [authState, setAuthState] = useState('signIn')
  const [alreadyCheckedAuth, setAlreadyCheckedAuth] = useState(false)
  // console.log('Login')
  const { pageContext: {auth} } = props
  
  const decideToRedirect = newAuthState => authState === 'signIn' && newAuthState === 'signedIn'

  const respondToAuthStateChange = async newAuthState => {
    console.log({ authState, newAuthState, alreadyCheckedAuth })

    let groups = []
    if( decideToRedirect(newAuthState) ){
      // get the currenlty logged in user, this will only work for AWS user pool users
      try{
        const data = await Auth.currentSession()
        groups = data.idToken.payload['cognito:groups']
      }catch(errorGettingSessionUser){
        console.error(errorGettingSessionUser)
      }
      // check user in db has the right groups and roles
      try{
        await API.post(publicRuntimeConfig.STAGE, '/checkUserDb', {body: {groups}})
        // redirect to either /profile or back to /login
        newAuthState === 'signedIn' ? Router.push(redirectOnLogin) : Router.push(redirectOnLogout)
        console.log('done here')
      }catch(errorCheckingUser){
        console.error(errorCheckingUser)
      }
    }else{
      setAlreadyCheckedAuth(true)
      setAuthState(newAuthState)
    }
  }

  const handleHubEvents = data => {
    console.log(`handleHubEvents() start.`)
    const { payload } = data;
    console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
  }

  // attempting to capture onClick events for the Signin button
  useEffect(() => {
    console.log(`useEffect() start.`)
    // set up Amplify event listeners
    Hub.listen('auth', handleHubEvents)

    return () => {
      console.log(`useEffect() cleanup.`)
      Hub.remove('auth', handleHubEvents)
    }
  })

  return <div>
    <Authenticator 

      theme={{
        toast: {
          backgroundColor: 'red',
          borderColor: 'red',
          position: 'fixed',
        },
      }}

      federated={{
        google_client_id: googleId,
        facebook_app_id: facebookId,
      }}

      // signedIn - after Login
      // signIn - after Logout or before Login
      onStateChange={ respondToAuthStateChange } 

      signUpConfig={{
        hiddenDefaults: ['phone_number'],
        signUpFields: [
          { label: 'Email', key: 'email', required: true, type: 'string', custom: false },
          { label: 'Password', key: 'password', required: true, type: 'password', custom: false },
          { label: 'Username', key: 'username', required: true, type: 'string', custom: true, displayOrder: 1 },
        ]
      }}
    />
  </div>
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Login)


