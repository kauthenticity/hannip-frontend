import React, {useCallback, useEffect, useState} from 'react'
import {View, Pressable, Text, StyleSheet} from 'react-native'
import Modal from 'react-native-modal'
import {useMutation} from 'react-query'
import {Shadow} from 'react-native-shadow-2'

import {getStatusBarHeight} from 'react-native-status-bar-height'
import {isIphoneX} from 'react-native-iphone-x-helper'
import {useNavigation} from '@react-navigation/native'
import {queryKeys, updateUserSelectedCategory} from '../../api'
import {updateCategory} from '../../redux/slices'
import {useAppSelector, useAppDispatch} from '../../hooks'
import {IUserCategoryDto} from '../../types'
import * as theme from '../../theme'

const MARGIN_TOP = isIphoneX() ? getStatusBarHeight() + 56 : 56

type CategoryDropdownProps = {
  showCategoryModal: boolean
  setShowCategoryModal: React.Dispatch<React.SetStateAction<boolean>>
  userCategory: IUserCategoryDto
  setUserCategory: React.Dispatch<React.SetStateAction<IUserCategoryDto>>
  categories: IUserCategoryDto[]
}

type CategoryItemProps = {
  userCategory: IUserCategoryDto
  currentCategory: IUserCategoryDto
  borderTop?: boolean
  borderBottom?: boolean
  onPressItem: (category: IUserCategoryDto) => void
}

const CategoryItem = ({userCategory, currentCategory, borderTop, borderBottom, onPressItem}: CategoryItemProps) => {
  // ******************** utils ********************
  const selected: boolean = userCategory.id == currentCategory.id

  // ******************** renderer ********************
  return (
    <Pressable
      onPress={() => onPressItem(currentCategory)}
      style={[styles.itemContainer, selected && {backgroundColor: theme.main50}, borderTop && styles.borderTop, borderBottom && styles.borderBottom]}>
      <Text style={[selected && {fontFamily: 'Pretendard-Bold'}]}>{currentCategory.categoryName}</Text>
    </Pressable>
  )
}

export const CategoryDropdown = ({showCategoryModal, setShowCategoryModal, userCategory, setUserCategory, categories}: CategoryDropdownProps) => {
  // ******************** utils ********************
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  // ******************** states ********************
  const [categoryPressed, setCategoryPressed] = useState<boolean>(false)
  const user = useAppSelector(state => state.auth.user)
  const [userCategoryDtoList, setUserCategoryDtoList] = useState<IUserCategoryDto[]>(user.userCategoryDtoList)
  const id = useAppSelector(state => state.auth.user.id)

  const updateUserSelectedCategoryQuery = useMutation(queryKeys.accountInfo, updateUserSelectedCategory, {
    onSuccess(data, variables, context) {
      console.log('update success')
    },
    onError(error, variables, context) {
      console.log(error)
    },
  })

  useEffect(() => {
    setUserCategoryDtoList(user.userCategoryDtoList)
  }, [user])

  // ******************** callbacks ********************

  const onPressItem = useCallback(
    (category: IUserCategoryDto) => {
      // setUserCategory(category)
      // const temp = userCategoryDtoList.slice()
      // const idx = userCategoryDtoList.indexOf(category)
      // console.log(temp)
      // temp.splice(idx, 1)
      // temp.unshift(category)
      // console.log(temp)
      // updateUserSelectedCategoryQuery.mutate({
      //   accountCategoryDto: temp.map(item => {
      //     return {
      //       ...item,
      //       accountIdx: accountIdx,
      //     }
      //   }),
      //   accountIdx: accountIdx,
      // })
      // setUserCategoryDtoList(temp)
      // dispatch(updateCategory(temp))
      // setShowCategoryModal(false)
    },
    [userCategoryDtoList, id],
  )

  const onPressEditCategory = useCallback(() => {
    setShowCategoryModal(false)
    setCategoryPressed(true)
    navigation.navigate('EditCategory')
    // 카테고리 수정하기로 이동하는 네비게이션 필요
  }, [])

  // ******************** renderer ********************

  return (
    <Modal
      isVisible={showCategoryModal}
      onBackdropPress={() => setShowCategoryModal(false)}
      backdropOpacity={0}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      animationInTiming={200}
      animationOutTiming={200}
      onModalHide={() => {
        if (categoryPressed) {
          navigation.navigate('EditCategory')
          setCategoryPressed(false)
        }
      }}
      style={{margin: 0}}>
      <Shadow containerViewStyle={[styles.container]} distance={20} startColor="rgba(0,0,0,0.06)">
        <View style={{borderRadius: 4}}>
          {categories.map((item, index) => {
            if (index == 0) {
              return <CategoryItem key={item.categoryName + index} userCategory={userCategory} currentCategory={item} onPressItem={onPressItem} borderTop />
            } else {
              return <CategoryItem userCategory={userCategory} currentCategory={item} onPressItem={onPressItem} key={item.categoryName + index} />
            }
          })}
          <CategoryItem
            userCategory={userCategory}
            currentCategory={{categoryName: '수정하기', id: user?.id, categoryId: -1}}
            borderBottom
            onPressItem={onPressEditCategory}
          />
        </View>
      </Shadow>
    </Modal>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    width: 144,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: theme.white,
    left: 0,
  },
  container: {
    position: 'absolute',
    top: MARGIN_TOP,
    zIndex: 100,
    left: 12,
    width: 144,
  },
  borderTop: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  borderBottom: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
})
