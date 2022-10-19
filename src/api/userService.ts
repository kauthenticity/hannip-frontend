import apiClient from './apiClient'
import {BASE_URL} from '@env'
import apiImageClient from './apiImageClient'
import {ISignUpRequestDto} from '../types'
import axios from 'axios'
export const checkNicknameDuplicated = async (nickname: string) => {
  const {data} = await apiClient.get(`api/user/findnickname?nickname=${nickname}`)
  return data
}

// 회원 가입 시 초기 프로필 이미지 설정
export const setInitialProfileImage = async (formData: FormData) => {
  const {data} = await apiImageClient.post('/api/user/profile', formData)

  return data
}

export const signUp = async (signUpRequest: ISignUpRequestDto) => {
  const {data} = await apiClient.post('/api/user/signup', signUpRequest)
  return data
}
// export const signUp = async (signUpRequest: ISignUpRequestDto) => {
//   const {data} = await axios.post(
//     `${BASE_URL}/api/user/signup`,
//     {signUpRequest: signUpRequest},
//     {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     },
//   )
//   return data
// }

export const signIn = async (email: string) => {
  const {data} = await apiClient.post('/api/user/signin', {email})

  return data
}

export const getUserInfo = async () => {
  const {data} = await apiClient.get('/api/user/me')

  return data
}
