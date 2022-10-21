import React, {useEffect, useState} from 'react'
import {View, Text, StyleSheet, StatusBar, Linking, Platform} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import {useMutation} from 'react-query'
import {URLSearchParams} from 'react-native-url-polyfill'
import KeyboardManager from 'react-native-keyboard-manager'
import LinearGradient from 'react-native-linear-gradient'

import * as theme from '../../theme'
import {getString, removeString, storeString} from '../../hooks'
import {storeToken, login} from '../../redux/slices'
import {getAccountInfoByIdx, signIn, getUserInfo, queryKeys} from '../../api'
import {useAppDispatch} from '../../hooks'
import {removeListener} from '@reduxjs/toolkit'
import {LogoWhiteIcon} from '../../components/utils'

if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true)
  KeyboardManager.setEnableDebugging(false)
  KeyboardManager.setKeyboardDistanceFromTextField(10)
  KeyboardManager.setLayoutIfNeededOnUpdate(true)
  KeyboardManager.setEnableAutoToolbar(false)
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

export const SplashScreen = () => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation()

  const signInQuery = useMutation(queryKeys.accountInfo, signIn, {
    onSuccess(data) {
      // 토큰 리덕스에 저장
      dispatch(storeToken(data.token))
      storeString('token', data.token)
      getUserInfoQuery.mutate()
    },
    onError(error) {
      console.log('splash screen에서 signin 중 에러가 발생했습니다.')
      console.log(error)
    },
  })

  const getUserInfoQuery = useMutation(queryKeys.accountInfo, getUserInfo, {
    onSuccess(data) {
      delete data.password
      delete data.userRole
      dispatch(login(data))
      storeString('id', data.id.toString()) // accountIdx를 async storage에 저장
      storeString('email', data.email) //이메일도 async storage에 저장
      navigation.navigate('MainTabNavigator')
    },
  })

  useEffect(() => {
    // async storage에서 access token을 가져온다.
    getString('token').then(token => {
      // access token이 없으면 main tab navigator로 이동
      if (token == null || token == undefined || token == '') {
        navigation.navigate('MainTabNavigator')
      }
      // access token이 있으면 apiClient에 저장.
      else {
        // async storage에서 email을 가져옴
        getString('email').then(email => {
          // email이 없으면 그냥 메인으로 이동
          if (email == null || email == undefined || email == '') {
            navigation.navigate('MainTabNavigator')
          }
          // email이 있으면 로그인 시킴
          else {
            signInQuery.mutate(email)
          }
        })
      }
    })

    // ************************* Deep Link *************************x
    //IOS && ANDROID : 앱이 딥링크로 처음 실행될때, 앱이 열려있지 않을 때
    Linking.getInitialURL().then(url => {
      console.log('url1 : ', url)
      const searchParams = new URLSearchParams(url!)
      const idx = searchParams.get('idx')
      console.log(url)
      deepLink(idx!)
      return () => removeListener
    })

    //IOS : 앱이 딥링크로 처음 실행될때, 앱이 열려있지 않을 때 && 앱이 실행 중일 때
    //ANDROID : 앱이 실행 중일 때
    Linking.addEventListener('url', url => {
      //console.log('url2 : ', url)
      const searchParams = new URLSearchParams(url!)
      const idx = searchParams.get('idx')
      addListenerLink(idx!)
      return () => removeListener
    })
  }, [])
  const deepLink = (idx: string) => {
    if (idx) {
      console.log('idx ini deepLink : ', idx)
      navigation.navigate('GoodsStackNavigator', {
        screen: 'NanumDetail',
        params: {
          nanumIdx: idx,
        },
      })
    }
  }
  const addListenerLink = (idx: string) => {
    if (idx) {
      navigation.navigate('GoodsStackNavigator', {
        screen: 'NanumDetail',
        params: {
          nanumIdx: idx,
        },
      })
    }
  }

  return (
    <>
      <StatusBar barStyle="default" translucent={true} />

      <LinearGradient
        start={{x: 1, y: 0}}
        end={{x: 0, y: 1}}
        colors={['rgba(141, 91, 255, 1)', 'rgba(255, 173, 193, 1)', 'rgba(255, 255, 255,1)']}
        style={styles.container}>
        <LogoWhiteIcon size={82} />
        <Text style={styles.logoText}>Hannip</Text>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  logoText: {
    fontFamily: 'Lexend-Bold',
    color: theme.white,
    fontSize: 32,
    lineHeight: 40,
    marginTop: 17,
  },
  title: {
    marginTop: 30,
    marginBottom: 60,
    color: theme.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appname: {
    color: theme.main,
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
  },
})
