import {apiClient} from './apiClient'

export const checkNicknameDuplicated = async (nickname: string) => {
  const {data} = await apiClient.get(`api/user/findnickname?nickname=${nickname}`)
  return data
}
