import React, {useMemo, useState, useCallback, useEffect} from 'react'
import {View, Text, FlatList, StyleSheet, Dimensions, Pressable, Alert, ActivityIndicator} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useNavigation, useRoute} from '@react-navigation/native'
import {useMutation, useQuery} from 'react-query'
import {showMessage} from 'react-native-flash-message'

import {SelectCategoryRouteProps} from '../../navigation/LoginStackNavigator'
import {StackHeader, Button, CheckboxMainIcon, FloatingBottomButton, XIcon, XSmallIcon} from '../../components/utils'
import {EmptyResult, SearchStar} from '../../components/LoginStack'
import * as theme from '../../theme'
import {ICategoryDto, ISignUpRequestDto} from '../../types'
import {login as ReduxLogin, storeToken} from '../../redux/slices'
import {useAppDispatch, storeString} from '../../hooks'
import {queryKeys, getCategoryAll, signUp, signIn, getUserInfo} from '../../api'
import FastImage from 'react-native-fast-image'

const BUTTON_GAP = 10

const IMAGE_SIZE = (Dimensions.get('window').width - 40 - 32 - 18) / 3
const IMAGE_GAP = (Dimensions.get('window').width - 40 - IMAGE_SIZE * 3) / 3
const IMAGE_BORDER = IMAGE_SIZE / 2
const CIRCLE_SIZE = IMAGE_SIZE + 8
const CIRCLE_BORDER = CIRCLE_SIZE / 2
const BUTTON_WIDTH = (Dimensions.get('window').width - theme.PADDING_SIZE * 2 - BUTTON_GAP) / 2

export const SelectCategory = () => {
  // ******************** utils  ********************
  const navigation = useNavigation()
  const route = useRoute<SelectCategoryRouteProps>()
  const dispatch = useAppDispatch()
  const {email, name, profileImage} = useMemo(() => route.params, [])

  // ******************** states  ********************
  const [singerSelected, setSingerSelected] = useState(true) // 가수, 배우 대분류 선택
  const [keyword, setKeyword] = useState<string>('') // 검색 키워드
  const [result, setResult] = useState<ICategoryDto[]>([]) // 검색 결과
  const [userSelectedCategories, setUserSelectedCategories] = useState<ICategoryDto[]>([]) // 사용자가 선택한 카테고리들
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false)

  // ******************** react queries  ********************
  const signUpQuery = useMutation(queryKeys.signUp, signUp, {
    // 회원 가입 api
    onSuccess(data) {
      setSignUpSuccess(true)
      // 회원 가입 성공하면 백단에서 보내준 accountIdx로 계정 정보를 불러옴.
      //getAccountInfoByIdxQuery.mutate(data)

      signInQuery.mutate(email)
    },
    onError(error) {
      showMessage({
        // 에러 안내 메세지
        message: '회원 가입 중 에러가 발생했습니다',
        type: 'info',
        animationDuration: 300,
        duration: 1350,
        style: {
          backgroundColor: 'rgba(36, 36, 36, 0.9)',
        },
        titleStyle: {
          fontFamily: 'Pretendard-Medium',
        },
        floating: true,
      })
      console.log(error)
    },
  })

  const searchCategoryQuery = useMutation(queryKeys.searchCategory, getCategoryAll, {
    // 검색 api
    onSuccess(data, variables, context) {
      setResult(data.categoryListResponses.content)
    },
    onError(error, variables, context) {
      showMessage({
        // 에러 안내 메세지
        message: '카테고리 검색 중 에러가 발생했습니다',
        type: 'info',
        animationDuration: 300,
        duration: 1350,
        style: {
          backgroundColor: 'rgba(36, 36, 36, 0.9)',
        },
        titleStyle: {
          fontFamily: 'Pretendard-Medium',
        },
        floating: true,
      })
      console.log(error)
    },
  })

  const signInQuery = useMutation(queryKeys.accountInfo, signIn, {
    onSuccess(data, variables, context) {
      // 토큰 리덕스에 저장
      dispatch(storeToken(data.token))
      storeString('token', data.token)
      getUserInfoQuery.mutate()
    },
    onError(error, variables, context) {
      showMessage({
        // 에러 안내 메세지
        message: '계정 정보를 가져오는 중 에러가 발생했습니다',
        type: 'info',
        animationDuration: 300,
        duration: 1350,
        style: {
          backgroundColor: 'rgba(36, 36, 36, 0.9)',
        },
        titleStyle: {
          fontFamily: 'Pretendard-Medium',
        },
        floating: true,
      })
      console.log(error)
    },
  })

  const getCategoryQuery = useQuery(queryKeys.category, () => getCategoryAll({sort: 'asc', categoryType: 'singer'}), {
    onSuccess(data) {
      console.log(data)
      setResult(data.categoryListResponses.content)
    },
  })
  const getUserInfoQuery = useMutation(queryKeys.accountInfo, getUserInfo, {
    onSuccess(data, variables, context) {
      delete data.password
      delete data.userRole
      dispatch(ReduxLogin(data))
      storeString('id', data.id.toString()) // accountIdx를 async storage에 저장
      storeString('email', data.email) //이메일도 async storage에 저장
      navigation.navigate('MainTabNavigator')
    },
  })
  // ******************** callbacks  ********************
  // 검색 호출 시
  const searchKeyword = useCallback(
    // 검색 api 호출
    (keyword: string, categoryType?: 'singer' | 'actor') => {
      // 입력 값이 없을 때는 리턴

      searchCategoryQuery.mutate({
        categoryType: categoryType ? categoryType : singerSelected ? 'singer' : 'actor',
        keyword,
      })
      setKeyword('')
    },
    [keyword, singerSelected],
  )

  // 회원 가입 버튼 클릭 시
  const onPressSignUp = useCallback(() => {
    if (signUpQuery.isLoading) {
      return
    }

    const signUpForm: ISignUpRequestDto = {
      categoryDtoList: userSelectedCategories.map(item => {
        return {categoryId: item.categoryId}
      }),
      email,
      nickname: name,
      url: profileImage,
    }
    console.log(JSON.stringify(signUpForm))
    // 회원 가입 post api 호출
    signUpQuery.mutate(signUpForm)
  }, [userSelectedCategories, signUpQuery])

  //해당 카테고리가 선택됐는지
  const isSelected = useCallback(
    (category: ICategoryDto) => {
      return userSelectedCategories.filter(item => item.categoryId == category.categoryId).length == 0 ? false : true
    },
    [userSelectedCategories],
  )

  // 카테고리 아이템 클릭시
  const onPressCategory = useCallback(
    (category: ICategoryDto) => {
      if (isSelected(category)) {
        setUserSelectedCategories(userSelectedCategories.filter(item => item.categoryId != category.categoryId))
      } else {
        if (userSelectedCategories.length == 5) {
          Alert.alert('최대 5명까지 선택 가능합니다')
          return
        }
        setUserSelectedCategories(userSelectedCategories.concat(category))
      }
    },
    [userSelectedCategories],
  )

  // 해당 카테고리를 선택한 카테고리 리스트에서 제거
  const onPressRemoveCategory = useCallback((param: ICategoryDto) => {
    setUserSelectedCategories(userSelectedCategories =>
      userSelectedCategories.filter(item => {
        return item.categoryId != param.categoryId
      }),
    )
  }, [])

  return (
    <SafeAreaView style={theme.styles.safeareaview}>
      <StackHeader title="카테고리" />
      <View style={[{flex: 1}]}>
        <View style={[styles.mainCategoryContainer, theme.styles.wrapper]}>
          <Button
            selected={singerSelected}
            label="가수"
            style={{width: BUTTON_WIDTH}}
            onPress={() => {
              setSingerSelected(true)
              searchKeyword('', 'singer')
            }}
          />
          <Button
            selected={!singerSelected}
            label="배우"
            style={{width: BUTTON_WIDTH}}
            onPress={() => {
              setSingerSelected(false)
              searchKeyword('', 'actor')
            }}
          />
        </View>

        <View style={[theme.styles.wrapper]}>
          <SearchStar keyword={keyword} setKeyword={setKeyword} searchKeyword={searchKeyword} />
        </View>
        <View style={[{flex: 1}]}>
          <View
            style={[
              theme.styles.rowFlexStart,
              theme.styles.wrapper,
              {flexWrap: 'wrap', marginBottom: 16},
              result.length == 0 && {position: 'absolute', top: 0},
            ]}>
            {userSelectedCategories.length > 0 &&
              userSelectedCategories.map(item => (
                <View key={item.categoryId} style={[theme.styles.rowFlexStart, {marginBottom: 8}, styles.selectedCategoryButton]}>
                  <Text style={[{marginRight: 8}, theme.styles.text14]}>{item.name}</Text>
                  <XSmallIcon size={16} onPress={() => onPressRemoveCategory(item)} />
                </View>
              ))}
          </View>
          {getCategoryQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : result.length == 0 ? (
            <EmptyResult />
          ) : (
            <FlatList
              data={result}
              numColumns={3}
              columnWrapperStyle={[{justifyContent: 'flex-start', marginBottom: 16}, theme.styles.wrapper]}
              renderItem={({item, index}) => (
                <View style={[{width: CIRCLE_SIZE}, index % 3 != 2 && {marginRight: IMAGE_GAP}]}>
                  <Pressable style={[styles.pressableView, isSelected(item) && styles.selectedPressable]} onPress={() => onPressCategory(item)}>
                    {isSelected(item) && <CheckboxMainIcon style={styles.checkboxMain} />}
                    <FastImage style={styles.image} source={{uri: item.imageUrl}}></FastImage>
                  </Pressable>
                  <Text style={styles.starName}>{item.name}</Text>
                </View>
              )}></FlatList>
          )}
        </View>
      </View>
      <FloatingBottomButton
        label="선택 완료"
        enabled={userSelectedCategories.length != 0 && signUpSuccess == false && signUpQuery.isLoading == false}
        onPress={onPressSignUp}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -48,
  },
  selectedCategoryButton: {
    backgroundColor: theme.gray50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderRadius: 26,
    marginRight: 8,
  },
  starName: {
    color: theme.gray700,
    marginTop: 8,
    textAlign: 'center',
  },
  checkboxMain: {
    position: 'absolute',
    right: 4,
    top: 4,
    zIndex: 1,
  },
  selectedPressable: {
    backgroundColor: theme.main,
  },
  pressableView: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    //width: IMAGE_SIZE,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,

    borderRadius: IMAGE_BORDER,
    resizeMode: 'cover',
  },
  tagContainer: {
    backgroundColor: theme.gray50,
    marginRight: 8,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 26,
    marginBottom: 8,
  },

  mainCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
})
