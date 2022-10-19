import {BASE_URL} from '@env'
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
