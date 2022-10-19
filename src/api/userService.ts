import {apiClient, apiImageClient} from './apiClient'

export const checkNicknameDuplicated = async (nickname: string) => {
  const {data} = await apiClient.get(`api/user/findnickname?nickname=${nickname}`)
  return data
}

// 회원 가입 시 초기 프로필 이미지 설정
export const setInitialProfileImage = async (formData: FormData) => {
  const {data} = await apiImageClient.post('/api/user/profile', formData)

  return data
}
