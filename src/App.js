import React from 'react'
import './App.css'
import Amplify from "aws-amplify";
import { Authenticator } from "aws-amplify-react"

Amplify.configure({
  Auth: {
    region: 'us-east-1', 
    userPoolId: 'us-east-1_OyIsDwmhp', 
    identityPoolId: 'arn:aws:cognito-idp:us-east-1:420925289119:userpool/us-east-1_OyIsDwmhp', 
    userPoolWebClientId: '7nqaoe4mul31mu3h56vqf7qt1h',
  },
})

const respondToAuthStateChange = e => {
  console.log(`respondToAuthStateChange() start`)
  console.log(e)
}

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <Authenticator 
          theme={{
            toast: {
              backgroundColor: 'red',
              borderColor: 'red',
              position: 'fixed',
            },
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
    </div>
  )
}

export default App
