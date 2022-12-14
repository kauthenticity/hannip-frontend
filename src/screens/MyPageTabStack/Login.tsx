import React, {useCallback} from 'react'
import {View, Text, Pressable, StyleSheet, Platform} from 'react-native'
import FastImage from 'react-native-fast-image'
import {useNavigation} from '@react-navigation/native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {GoogleSignin} from '@react-native-google-signin/google-signin'
import auth from '@react-native-firebase/auth'
import {KakaoOAuthToken, KakaoProfile, getProfile as getKakaoProfile, login} from '@react-native-seoul/kakao-login'
import {useMutation} from 'react-query'
import axios from 'axios'
import {queryKeys, getAccountInfoByIdx, getAccountInfoByEmail, kakaoOauth} from '../../api'

import {login as ReduxLogin, storeAccessToken} from '../../redux/slices/auth'
import * as theme from '../../theme'
import {showMessage} from 'react-native-flash-message'
import appleAuth, {AppleRequestResponse} from '@invertase/react-native-apple-authentication'
import {storeString, useAppDispatch, getString} from '../../hooks'
import {StackHeader, BellIcon} from '../../components/utils'

const ios = Platform.OS == 'ios'

const ACCESS_TOKEN =
  'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjYzNjYyMDI1LCJleHAiOjE2NjQ4NzE2MjV9.dxNwUn0nNjw9NiLPYN31HBOCWkGzYugTXj5UwGFXNcQ3k0s_PoSBaZsjmSBqKJcwMkG0E3dstBRdnfHySRVWIQ'
type LoginButtonProps = {
  label: string
  source: object
  onPress?: () => void
  style?: any
  textStyle?: any
}

const LoginButton = ({label, source, onPress, style, textStyle}: LoginButtonProps) => {
  return (
    <Pressable style={[styles.loginButtonWrapper, style]} onPress={onPress}>
      <FastImage style={styles.logo} source={source}></FastImage>
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  )
}

export const Login = () => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  // const signInWithKakao = async (): Promise<void> => {
  //   //console.log('clicked')
  //   try {
  //     const token: KakaoOAuthToken = await login()
  //     // @ts-ignore
  //     const profile: KakaoProfile = await getKakaoProfile()

  //     // ?????? ???????????? ????????? ???????????? ??????
  //     getAccountInfoByEmail(profile.email)
  //       .then(res => {
  //         console.log(res)

  //         storeString('accountIdx', res.accountIdx.toString())
  //         storeString('email', res.email)

  //         dispatch(ReduxLogin(res))
  //         dispatch(storeAccessToken(ACCESS_TOKEN))
  //         axios.defaults.headers.common['Authorization'] = `Bearer ${ACCESS_TOKEN}`

  //         navigation.navigate('MainTabNavigator', {
  //           screen: 'NanumList',
  //         })
  //       })
  //       .catch(err => {
  //         // ?????? ???????????? ?????? ?????? ?????? ?????? ???????????? ??????
  //         if (err.response.status == 500) {
  //           navigation.navigate('LoginStackNavigator', {
  //             screen: 'SetProfile',
  //             params: {
  //               email: profile.email,
  //             },
  //           })
  //         }
  //       })
  //   } catch (err) {
  //     console.log(err)
  //     showMessage({
  //       message: '????????? ????????? ??? ????????? ??????????????????',
  //       type: 'info',
  //       animationDuration: 300,
  //       duration: 1350,
  //       style: {
  //         backgroundColor: 'rgba(36, 36, 36, 0.9)',
  //       },
  //       titleStyle: {
  //         fontFamily: 'Pretendard-Medium',
  //       },
  //       floating: true,
  //     })
  //   }
  // }
  const signInWithKakao = async (): Promise<void> => {
    try {
      const token: KakaoOAuthToken = await login()
      // @ts-ignore
      const profile: KakaoProfile = await getKakaoProfile()

      // ????????? ????????? ?????? ?????? ?????? ???????????? ??????
      navigation.navigate('LoginStackNavigator', {
        screen: 'SetProfile',
        params: {
          email: profile.email,
        },
      })
    } catch (err) {
      console.log(err)
      showMessage({
        message: '????????? ????????? ??? ????????? ??????????????????',
        type: 'info',
        animationDuration: 300,
        duration: 1350,
        style: {
          backgroundColor: 'rgba(36, 36, 36, 0.9)',
        },
        titleStyle: {
          fontFamily: 'Pretendard-Medium',
        },
        floating: true,
      })
    }
  }

  const SignInWithGoogle = async () => {
    try {
      const result = await GoogleSignin.signIn()

      const idToken = result.idToken
      const user = result.user
      const googleCredential = auth.GoogleAuthProvider.credential(idToken)
      auth().signInWithCredential(googleCredential)
      // ?????? ???????????? ????????? ???????????? ??????
      getAccountInfoByEmail(user.email)
        .then(res => {
          console.log(res)
          storeString('accountIdx', res.accountIdx.toString())
          storeString('email', res.email)

          dispatch(ReduxLogin(res))
          navigation.navigate('MainTabNavigator', {
            screen: 'NanumList',
          })
        })
        .catch(err => {
          // ?????? ???????????? ?????? ?????? ?????? ?????? ???????????? ??????
          if (err.response.status == 500) {
            navigation.navigate('LoginStackNavigator', {
              screen: 'SetProfile',
              params: {
                email: user.email,
              },
            })
          }
        })
    } catch (err) {
      console.log(err)
      showMessage({
        message: '?????? ????????? ??? ????????? ??????????????????',
        type: 'info',
        animationDuration: 300,
        duration: 1350,
        style: {
          backgroundColor: 'rgba(36, 36, 36, 0.9)',
        },
        titleStyle: {
          fontFamily: 'Pretendard-Medium',
        },
        floating: true,
      })
    }
  }

  const SignInWithApple = async () => {
    try {
      const appleAuthRequestResponse: AppleRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      })
      const {user, nonce, identityToken} = appleAuthRequestResponse
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce)
      auth().signInWithCredential(appleCredential)

      // ?????? ?????? ???????????? ????????? ???????????? ??? ????????? email??? null??? ???
      if (appleAuthRequestResponse.email == null) {
        // ????????? ??? ??? ???????????? async storage?????? ???????????? ????????????
        getString('email').then(email => {
          if (email != undefined && email != null) {
            // ??? ???????????? ?????? ????????? ?????? ????????? ??????
            getAccountInfoByEmail(email).then(res => {
              storeString('accountIdx', res.accountIdx.toString())
              storeString('email', res.email)

              dispatch(ReduxLogin(res))
              navigation.navigate('MainTabNavigator', {
                screen: 'NanumList',
              })
            })
          }
        })
      } else {
        // ?????? ?????? ???????????? ????????? ??? ????????? ?????? (ex. js7056@naver.com?????? ????????? ????????? ??? ??? js7056@naver.com?????? ??? ?????? ???????????? ????????? ??????)
        getAccountInfoByEmail(appleAuthRequestResponse.email)
          .then(res => {
            storeString('accountIdx', res.accountIdx.toString())

            dispatch(ReduxLogin(res))
            navigation.navigate('MainTabNavigator', {
              screen: 'NanumList',
            })
          })
          .catch(err => {
            // ?????? ???????????? ?????? ?????? ?????? ?????? ???????????? ??????
            if (err.response.status == 500) {
              navigation.navigate('LoginStackNavigator', {
                screen: 'SetProfile',
                params: {
                  email: appleAuthRequestResponse.email,
                },
              })
            }
          })
      }
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.warn('User canceled Apple Sign in.')
      } else {
        console.error(error)
        showMessage({
          message: '?????? ????????? ??? ????????? ??????????????????',
          type: 'info',
          animationDuration: 300,
          duration: 1350,
          style: {
            backgroundColor: 'rgba(36, 36, 36, 0.9)',
          },
          titleStyle: {
            fontFamily: 'Pretendard-Medium',
          },
          floating: true,
        })
      }
    }
  }

  return (
    <SafeAreaView style={[theme.styles.safeareaview]}>
      <StackHeader title="???????????????">
        <BellIcon />
      </StackHeader>
      <View style={styles.container}>
        <View style={{marginTop: -32}}>
          <Text style={{marginBottom: 8}}>?????? ????????? ????????????????</Text>
          <Text style={[theme.styles.bold20, {marginBottom: 48}]}>SNS ?????? ????????? ??? ??????????????????!</Text>
          <View style={[styles.loginButtonContainer]}>
            <LoginButton
              label="Kakao??? ?????????"
              style={{backgroundColor: '#fddc3f'}}
              source={require('../../assets/images/kakao_logo.png')}
              onPress={signInWithKakao}
            />
            {ios && (
              <LoginButton
                label="Apple??? ?????????"
                style={{backgroundColor: theme.black}}
                textStyle={{color: theme.white}}
                source={require('../../assets/images/apple_logo.png')}
                onPress={SignInWithApple}
              />
            )}

            <LoginButton
              style={{backgroundColor: theme.white, borderWidth: 1, borderColor: theme.gray200}}
              onPress={SignInWithGoogle}
              label="Google??? ?????????"
              source={require('../../assets/images/google_logo.png')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loginButtonContainer: {
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.PADDING_SIZE,
  },
  loginButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.gray50,
    borderRadius: 4,
    marginBottom: 16,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
  },
})
