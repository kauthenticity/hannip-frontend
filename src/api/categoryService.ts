import axios from 'axios'
import {BASE_URL} from '@env'
import {ICategoryDto, ICategoryGetDto} from '../types'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const postCategory = async (categoryDto: ICategoryDto) => {
  const {data} = await apiClient.post('/api/category/write', categoryDto)
  return data
}

export const searchCategory = async (categoryDto: ICategoryDto) => {
  const {data} = await apiClient.post('/api/category/search', categoryDto)

  return data
}

export const getCategoryAll = async ({page, size, sort, keyword, categoryType}: ICategoryGetDto) => {
  const {data} = await apiClient.get(
    `/api/category?page=${page == undefined ? '' : page}&size=${size == undefined ? '' : size}&sort=${sort == undefined ? '' : sort}&keyword=${
      keyword == undefined ? '' : keyword
    }&categoryType=${categoryType}`,
  )

  return data
}
