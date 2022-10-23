import apiClient from './apiClient'
import axios from 'axios'
import {BASE_URL} from '@env'
import {useAppSelector} from '../hooks'

// 진행한 나눔 목록 조회
export const getOpenNanumList = async () => {
  const {data} = await apiClient.get('/api/mypage')

  return data
}

// 닉네임 수정
export const editNickname = async (nickname: string) => {
  try {
    const {data} = await apiClient.patch(`/api/mypage/nickname?nickname=${nickname}`)
    return data
  } catch (err: any) {
    if (err.response && err.response.status === 400) {
      return err.response.data
    }
  }
}

export const editProfile = async (formData: FormData) => {
  try {
    const {data} = await apiClient.patch('/api/mypage/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  } catch (err) {
    console.log('err : ', err)
    return err
  }
}
