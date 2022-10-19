/**
 * @format
 */

import {AppRegistry} from 'react-native'
import App from './App'
import messaging from '@react-native-firebase/messaging'
import {name as appName} from './app.json'
import 'react-native-url-polyfill/auto'
import {store} from './src/redux/store'
import {injectStore} from './src/api/apiClient'

injectStore(store)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage)
})

AppRegistry.registerComponent(appName, () => App)
