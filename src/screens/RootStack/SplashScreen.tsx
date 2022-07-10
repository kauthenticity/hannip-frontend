import React, {useEffect} from 'react'
import {View, Text, StyleSheet, Alert} from 'react-native'
import {Linking} from 'react-native'
import {useNavigation} from '@react-navigation/native'

import * as theme from '../../theme'
import {getString} from '../../hooks'
import {storeAccessToken, login} from '../../redux/slices'
import {useAppDispatch} from '../../hooks'

export const SplashScreen = () => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  useEffect(() => {
    getString('accessToken').then(accessToken => {
      console.log('accessToken :', accessToken)
      // if (accessToken == '' || accessToken == undefined) {
      //   // access token이 없으면 회원 가입 페이지로 이동
      //   navigation.navigate('MainTabNavigator')
      // } else {
      //dispatch(storeAccessToken(accessToken)) // redux에 accesss
      // accessToken으로 id, email, 카테고리 저장
      storeAccessToken('1111')
      // qna list 받아오기
      fetch('http://localhost:8081/src/data/dummyUser.json', {
        method: 'get',
      })
        .then(res => res.json())
        .then(result => {
          dispatch(
            login({
              email: result.email,
              name: result.name,
              profileImageUri: result.profileImageUri,
              userCategory: [{category: 'BTS', job: '배우', accountIdx: 0}],

              holdingSharingCnt: result.holdingSharingCnt,
              participateSharingCnt: result.participateSharingCnt,
              accountIdx: 0,
            }),
          )
        })
        .then(() => {
          // access token이 있으면 메인탭으로 이동
          navigation.navigate('MainTabNavigator')
        })
    })
    // })
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.appname}>한입</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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
