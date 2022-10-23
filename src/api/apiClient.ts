import {BASE_URL} from '@env'
import axios from 'axios'
import {useAppSelector} from '../hooks'
import {token} from '../redux/slices'

const apiClient = axios.create({
  baseURL: BASE_URL,
})

let store: any

export const injectStore = (_store: any) => {
  store = _store
}

apiClient.interceptors.request.use(request => {
  const token = store.getState().auth.token

  if (token != null && token != '' && token != undefined) {
    request.headers!.Authorization = `Bearer ${token}`
  }
  return request
})

apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      console.log('unauthorized')
    }
  },
)

export default apiClient
