import React, {useMemo, useState, useCallback} from 'react'
import {View, Text, StyleSheet, Dimensions, Pressable, FlatList, Alert} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useNavigation} from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import {useMutation, useQuery} from 'react-query'
import {showMessage} from 'react-native-flash-message'

import {StackHeader, Button, XSmallIcon, CheckboxMainIcon, FloatingBottomButton} from '../../components/utils'
import {SearchStar, EmptyResult} from '../../components/LoginStack'
import * as theme from '../../theme'
import {ICategoryDto, IAccountCategoryDto} from '../../types'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {getAccountInfo, queryKeys, searchCategory} from '../../api'

const BUTTON_GAP = 10

const IMAGE_SIZE = (Dimensions.get('window').width - 40 - 32 - 18) / 3
const IMAGE_BORDER = IMAGE_SIZE / 2
const CIRCLE_SIZE = IMAGE_SIZE + 6
const CIRCLE_BORDER = CIRCLE_SIZE / 2
const BUTTON_WIDTH = (Dimensions.get('window').width - theme.PADDING_SIZE * 2 - BUTTON_GAP) / 2

export const EditCategory = () => {
  // ******************** utils  ********************
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)

  console.log('accountIdx : ', user.accountIdx)

  // ******************** states  ********************
  const [init, setInit] = useState<boolean>(true) // 처음에만 검색해보세요! 화면 띄움
  const [singerSelected, setSingerSelected] = useState<boolean>(true) // 선택한 대분류
  const [keyword, setKeyword] = useState<string>('')
  const [result, setResult] = useState<ICategoryDto | ''>('')
  const [userSelectedCategories, setUserSelectedCategories] = useState<IAccountCategoryDto[]>(user.accountCategoryDtoList)

  // ******************** react queries  ********************
  const searchCategoryQuery = useMutation(queryKeys.searchCategory, searchCategory, {
    // 검색 api
    onSuccess(data, variables, context) {
      console.log(data)
      setResult(data)
      console.log(data == '')
    },
    onError(error, variables, context) {
      showMessage({
        // 에러 안내 메세지
        message: '검색 중 에러가 발생했습니다',
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
  // ******************** callbacks  ********************
  const searchKeyword = useCallback(
    (keyword: string) => {
      // 입력 값이 없을 때는 리턴
      if (keyword == '') return
      init && setInit(false) // 한번 검색을 하고 나면 init screen은 필요 없음
      searchCategoryQuery.mutate(keyword)
      setKeyword('')
    },
    [keyword],
  )

  const onPressRemoveCategory = useCallback((param: IAccountCategoryDto) => {
    setUserSelectedCategories(userSelectedCategories =>
      userSelectedCategories.filter(item => {
        console.log(item, param)
        return item.job != param.job || item.category != param.category
      }),
    )
  }, [])

  const isSelected = useCallback(
    (category: ICategoryDto) => {
      return userSelectedCategories.filter(item => item.job == category.job && item.category == category.nickName).length == 0 ? false : true
    },
    [userSelectedCategories],
  )

  const onPressCategory = useCallback(
    (category: ICategoryDto) => {
      if (isSelected(category)) {
        setUserSelectedCategories(userSelectedCategories.filter(item => item.job != category.job || item.category != category.nickName))
      } else {
        if (userSelectedCategories.length == 5) {
          Alert.alert('최대 5명까지 선택 가능합니다')
          return
        }
        setUserSelectedCategories(
          userSelectedCategories.concat({
            job: category.job,
            category: category.nickName,
            accountIdx: 0,
          }),
        )
      }
    },
    [userSelectedCategories],
  )

  const onPressSave = useCallback(() => {
    navigation.goBack()
  }, [])
  return (
    <SafeAreaView style={theme.styles.safeareaview}>
      <StackHeader title="카테고리 설정" x goBack />
      <View style={[theme.styles.wrapper, {flex: 1}]}>
        <View style={[styles.mainCategoryContainer]}>
          <Button
            selected={singerSelected}
            label="가수"
            style={{width: BUTTON_WIDTH}}
            onPress={() => {
              setSingerSelected(true)
            }}
          />
          <Button
            selected={!singerSelected}
            label="배우"
            style={{width: BUTTON_WIDTH}}
            onPress={() => {
              setSingerSelected(false)
            }}
          />
        </View>
        <SearchStar keyword={keyword} setKeyword={setKeyword} searchKeyword={searchKeyword} />
        <View style={[theme.styles.rowFlexStart, {flexWrap: 'wrap', marginBottom: 16}]}>
          {userSelectedCategories.length > 0 &&
            userSelectedCategories.map(item => (
              <View key={item.category + item.job} style={[theme.styles.rowFlexStart, {marginBottom: 8}, styles.selectedCategoryButton]}>
                <Text style={[{marginRight: 8}, theme.styles.text14]}>{item.category}</Text>
                <XSmallIcon size={16} onPress={() => onPressRemoveCategory(item)} />
              </View>
            ))}
        </View>
        {init == true ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={theme.styles.bold20}>관심 있는 스타를 검색해 보세요!</Text>
          </View>
        ) : result == '' ? (
          <EmptyResult />
        ) : (
          <View style={{width: CIRCLE_SIZE}}>
            <Pressable style={[styles.pressableView, isSelected(result) && styles.selectedPressable]} onPress={() => onPressCategory(result)}>
              {isSelected(result) && <CheckboxMainIcon style={styles.checkboxMain} />}
              <FastImage style={styles.image} source={{uri: result.imgUrl}}></FastImage>
            </Pressable>
            <Text style={styles.starName}>{result.nickName}</Text>
          </View>
        )}
      </View>
      <FloatingBottomButton label="저장하기" enabled={user.accountCategoryDtoList != userSelectedCategories} onPress={onPressSave} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
