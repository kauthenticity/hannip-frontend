import {BASE_URL} from '@env'
import axios from 'axios'
const apiImageClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'content-type': 'multipart/form-data',
  },
})

export default apiImageClient
