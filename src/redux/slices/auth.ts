import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {createDraftSafeSelector} from '@reduxjs/toolkit'
import {IAccountCategoryDto, IAccountDto, IUserDto} from '../../types'
import AsyncStorage from '@react-native-async-storage/async-storage'

//Each slice file should define a type for its initial state value,
// so that createSlice can correctly infer the type of state in each case reducer.

export interface User {
  email: string
  creatorId: string
  accountCategoryDtoList: IAccountCategoryDto[]
  accountImg: string | undefined
  holdingSharingCnt: number | undefined
  participateSharingCnt: number | undefined
  accountIdx: number
  creatorIdDatetime: string
}

export interface Auth {
  isLogggedIn: boolean
  user: User
  accessToken: string
  refreshToken: string
  token: string
}

const initialState = {
  isLoggedIn: false,
  user: {
    //   email: '',
    //   creatorId: '',
    //   accountCategoryDtoList: [
    //     {
    //       job: '가수',
    //       categoryName: '전체보기',
    //       accountIdx: 0,
    //       categoryIdx: 0,
    //     },
    //   ],
    //   accountImg: '',
    //   holdingSharingCnt: 0,
    //   participateSharingCnt: 0,
    //   accountIdx: 0,
    //   creatorIdDatetime: '1997-01-01 00:00:00',
    // } as User,
    // accessToken: '',
    // refreshToken: '',
    createDate: '1997-01-01 00:00:00',
    email: '',
    id: 0,
    nickname: '',
    profileUrl: '',
    updateDate: '1997-01-01 00:00:00',
    userBlockList: [{banUserId: 0, id: 0}],
    userCategoryDtoList: [
      {
        categoryId: 0,
        id: 0,
      },
    ],
    userFavoritesList: [{nanumId: 0, id: 0}],
  },
  token: '',
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<IUserDto>) => {
      state.isLoggedIn = true
      state.user.createDate = action.payload.createDate
      state.user.email = action.payload.email
      state.user.id = action.payload.id
      state.user.nickname = action.payload.nickname
      state.user.profileUrl = action.payload.profileUrl
      state.user.updateDate = action.payload.updateDate
      state.user.userBlockList = action.payload.userBlockList
      state.user.userCategoryDtoList = action.payload.userCategoryDtoList
      state.user.userFavoritesList = action.payload.userFavoritesList
    },
    storeToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    logout: state => {
      //AsyncStorage.removeItem('accessToken')
      //AsyncStorage.removeItem('accountIdx')

      return initialState
    },

    // updateProfileImage: (state, action: PayloadAction<string>) => {
    //   state.user.accountImg = action.payload
    // },
    // updateName: (state, action: PayloadAction<string>) => {
    //   state.user.creatorId = action.payload
    // },
    // updateCategory: (state, action: PayloadAction<IAccountCategoryDto[]>) => {
    //   state.user.accountCategoryDtoList = action.payload
    // },
  },
})

const selectSelf = (state: Auth) => state
export const userSelector = createDraftSafeSelector(selectSelf, state => state.user)
export default authSlice.reducer
export const {login, storeToken, logout} = authSlice.actions

export const token = (state: Auth) => state.token
