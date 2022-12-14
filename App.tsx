import 'react-native-gesture-handler'
import React, {useEffect, useCallback} from 'react'
import {Alert, ActivityIndicator, Linking, Platform} from 'react-native'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {NavigationContainer} from '@react-navigation/native'
import messaging from '@react-native-firebase/messaging'
import {QueryClient, QueryClientProvider} from 'react-query'
import {setCustomText} from 'react-native-global-props'
import {useNavigation} from '@react-navigation/native'
import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {gray800} from './src/theme'
import RootStackNavigtor from './src/navigation/RootStackNavigator'
import MainTabNavigator from './src/navigation/MainTabNavigator'
import {store} from './src/redux/store'
import {Provider as ReduxProvider} from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import FlashMessage from 'react-native-flash-message'
import KeyboardManager from 'react-native-keyboard-manager'
import SplashScreen from 'react-native-splash-screen'
import CodePush from 'react-native-code-push'

if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true)
  KeyboardManager.setEnableDebugging(false)
  KeyboardManager.setKeyboardDistanceFromTextField(10)
  KeyboardManager.setLayoutIfNeededOnUpdate(true)
  KeyboardManager.setEnableAutoToolbar(true)
  KeyboardManager.setToolbarDoneBarButtonItemText('확인')
  KeyboardManager.setToolbarManageBehaviourBy('subviews') // "subviews" | "tag" | "position"
  KeyboardManager.setToolbarPreviousNextButtonEnable(false)
  KeyboardManager.setToolbarTintColor('#007aff') // Only #000000 format is supported
  KeyboardManager.setToolbarBarTintColor('#FFFFFF') // Only #000000 format is supported
  KeyboardManager.setShouldShowToolbarPlaceholder(true)
  KeyboardManager.setOverrideKeyboardAppearance(false)
  KeyboardManager.setKeyboardAppearance('default') // "default" | "light" | "dark"
  KeyboardManager.setShouldResignOnTouchOutside(true)
  KeyboardManager.setShouldPlayInputClicks(true)
  KeyboardManager.resignFirstResponder()
}

// 권한 설정이 필요한 곳에 넣으면 됨.
// 현재는 테스트를 위해 첫 페이지에 넣음.
async function requestUserPermission() {
  // authStatus 0 : 거절, 1 : 승인, 2 : 잠정적 승인
  const authStatus = await messaging().requestPermission()
  const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (enabled) {
    console.log('Authorization status:', authStatus)
  }
}
const queryClient = new QueryClient()

const customTextProps = {
  style: {
    fontFamily: 'Pretendard-Regular',
    color: gray800,
  },
}

// const linking = {
//   prefixes: ['hannip://'],
//   config: {
//     initialRouteName: 'GoodsStackNavigator',
//     screens: {
//       GoodsDetail: {
//         path: '/GoodsDetail',
//       },
//     },
//   },
// }

const App = () => {
  // internet checking
  const unsubscribe = useCallback(
    () =>
      NetInfo.addEventListener(state => {
        if (!state.isConnected) {
          Alert.alert('인터넷을 확인해주세요', '', [{text: '확인'}])
        }
      }),
    [],
  )

  const googleSigninConfigure = useCallback(() => {
    GoogleSignin.configure({
      webClientId: '10776992039-a2u306icmbug1iivc4p3nekco3055rjf.apps.googleusercontent.com',
    })
  }, [])
  useEffect(() => {
    // 기본 폰트를 pretendard로 지정
    setCustomText(customTextProps)

    // 구글 로그인 설정
    googleSigninConfigure()
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
    })
    SplashScreen.hide()

    // 알림 허용 설정 요청
    requestUserPermission()
    return unsubscribe
  }, [])

  unsubscribe()

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <SafeAreaProvider style={{flex: 1, backgroundColor: 'white'}}>
          <NavigationContainer>
            <RootStackNavigtor />
            <FlashMessage position="top" />
          </NavigationContainer>
        </SafeAreaProvider>
      </ReduxProvider>
    </QueryClientProvider>
  )
}
const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_START,
  updateDialog: {
    title: '업데이트',
    optionalUpdateMessage: '업데이트를 진행합니다',
    optionalInstallButtonLabel: '확인',
    optionalIgnoreButtonLabel: '취소',
  },
  installMode: CodePush.InstallMode.IMMEDIATE,
}

export default CodePush(codePushOptions)(App)
