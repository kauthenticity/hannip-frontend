import axios from 'axios'

export const kakaoOauth = async () => {
  const {data} = await axios.post(
    'http://ec2-3-35-50-197.ap-northeast-2.compute.amazonaws.com/oauth2/authorization/kakao?redirect_uri=http://ec2-3-35-50-197.ap-northeast-2.compute.amazonaws.com/auth/token',
    {},
  )
  return data
}
