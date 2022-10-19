import {BASE_URL} from '@env'
import axios from 'axios'
import {useAppSelector} from '../hooks'
import {token} from '../redux/slices'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

export default apiClient
