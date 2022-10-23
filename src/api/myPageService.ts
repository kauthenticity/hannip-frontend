import apiClient from './apiClient'
import axios from 'axios'
import {BASE_URL} from '@env'

// 진행한 나눔 목록 조회
export const getOpenNanumList = async () => {
  const {data} = await apiClient.get('/api/mypage')

  return data
}

// 닉네임 수정
export const editNickname = async (nickname: string) => {
  const res = await apiClient.patch(`/api/mypage/nickname?nickname=${nickname}`)
  console.log('res:', res)
  return res.data
}

export const editProfile = async (nanumImage: FormData) => {
  const {data} = await axios.patch('/api/mypage/profile', nanumImage, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}
