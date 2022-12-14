import React, {useMemo, useState, useEffect, useCallback} from 'react'
import {View, Text, StyleSheet, Dimensions, FlatList, Alert} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useNavigation, useRoute} from '@react-navigation/native'
import {SelectCategoryRouteProps} from '../../navigation/LoginStackNavigator'
import {getStatusBarHeight} from 'react-native-status-bar-height'
import Modal from 'react-native-modal'
import {BottomSheet} from '../../components/utils'

import {StackHeader, Button, CategoryItem, FloatingBottomButton, XIcon} from '../../components/utils'
import {SearchStar, EmptyResult, InitScreen} from '../../components/LoginStack'
import * as theme from '../../theme'
import {IStar} from '../../types'
import {login, storeAccessToken, storeRefreshToken} from '../../redux/slices'
import {useAppDispatch} from '../../hooks'
import {storeString} from '../../hooks'

const BUTTON_GAP = 10
const STATUS_BAR_HEIGHT = getStatusBarHeight()

type SelectedStarTagProps = {
  item: string
  onPressRemove: () => void
}

type SetCategoryNanumFormProps = {
  category: string
  setCategory: React.Dispatch<React.SetStateAction<string>>
  categoryModalOpened: boolean
  setCategoryModalOpened: React.Dispatch<React.SetStateAction<boolean>>
}
const IMAGE_SIZE = (Dimensions.get('window').width - 40 - 32 - 18) / 3
const IMAGE_BORDER = IMAGE_SIZE / 2
const CIRCLE_SIZE = IMAGE_SIZE + 6
const CIRCLE_BORDER = CIRCLE_SIZE / 2

const SelectedStarTag = ({item, onPressRemove}: SelectedStarTagProps) => {
  return (
    <View style={[theme.styles.rowSpaceBetween, styles.tagContainer]}>
      <Text style={[theme.styles.text14]}>{item}</Text>
      <XIcon size={16} onPress={() => onPressRemove()} style={{marginLeft: 8}} />
    </View>
  )
}

export const SetCategoryNanumForm = ({category, setCategory, categoryModalOpened, setCategoryModalOpened}: SetCategoryNanumFormProps) => {
  // ******************** utils  ********************
  const navigation = useNavigation()
  const BUTTON_WIDTH = useMemo(() => (Dimensions.get('window').width - theme.PADDING_SIZE * 2 - BUTTON_GAP) / 2, [])

  // ******************** states  ********************
  const [singerSelected, setSingerSelected] = useState(true) // ??????, ?????? ????????? ??????
  const [starsAll, setStarsAll] = useState<IStar[]>([]) // ???????????? ????????? ????????? ????????? ??????
  const [singers, setSingers] = useState<IStar[]>([]) // ???????????? ????????? ?????? ????????? ??????
  const [actors, setActors] = useState<IStar[]>([]) // ???????????? ????????? ?????? ????????? ??????
  const [stars, setStars] = useState<IStar[]>([]) // ????????? ????????? ????????? ????????? ?????????
  const [keyword, setKeyword] = useState<string>('')

  // ******************** react queries  ********************
  // useEffect(() => {
  //   fetch('http://localhost:8081/src/data/dummyStars.json', {
  //     method: 'get',
  //   })
  //     .then(res => res.json())
  //     .then(result => {
  //       result.forEach((item: any) => (item.selected = false)) // selected ?????????
  //       setStarsAll(result)
  //       const singers = result.filter((item: any) => item.maincategory == 'singer') // ????????? ?????????
  //       setSingers(singers) // singer??? ??????
  //       setActors(result.filter((item: any) => item.maincategory == 'actor')) // ????????? ????????? actors??? ??????

  //       setStars(singers) // ?????? ????????? ????????? singers
  //     })
  // }, [])

  // ******************** callbacks  ********************
  const onPressSinger = useCallback(() => {
    setSingerSelected(true)
    setStars(singers)
  }, [singers])
  const onPressActor = useCallback(() => {
    setSingerSelected(false)
    setStars(actors)
  }, [actors])

  const searchKeyword = useCallback(
    (keyword: string) => {
      // ?????? ?????? ?????? ?????? ??????
      if (keyword == '') return

      setStars(starsAll.filter(star => star.name.includes(keyword)))
      setKeyword('')
    },
    [keyword],
  )

  const onPressSelectCompletion = useCallback(() => {
    if (category == '') return
    // email, name, image, category ????????? ???????????? api.
    // ????????? access token, refresh token ?????????.

    navigation.goBack()
  }, [category])

  const onPressCategory = useCallback(
    (item: IStar) => {
      const {id} = item
      setCategory(item.name)
    },
    [stars],
  )

  const onPressRemove = useCallback(() => {
    setCategory('')
  }, [])

  return (
    <BottomSheet modalVisible={categoryModalOpened} setModalVisible={setCategoryModalOpened}>
      <View>
        <View style={[theme.styles.wrapper, styles.rootContainer]}>
          <View style={[styles.mainCategoryContainer]}>
            <Button selected={singerSelected} label="??????" style={{width: BUTTON_WIDTH}} onPress={onPressSinger} />
            <Button selected={!singerSelected} label="??????" style={{width: BUTTON_WIDTH}} onPress={onPressActor} />
          </View>

          <SearchStar keyword={keyword} setKeyword={setKeyword} searchKeyword={searchKeyword} />
          <View style={[theme.styles.rowFlexStart, {flexWrap: 'wrap'}]}>
            <SelectedStarTag item={category} onPressRemove={onPressRemove} />
          </View>
        </View>
        <View style={{flex: 1}}>
          {stars.length == 0 ? (
            <EmptyResult />
          ) : (
            <FlatList
              data={stars}
              renderItem={({item, index}) => (
                <CategoryItem
                  category={item}
                  onPress={onPressCategory}
                  selectedStars={[
                    {
                      id: '',
                      maincategory: 'singer',
                      name: category,
                      uri: '',
                      selected: false,
                    },
                  ]}
                  imageSize={IMAGE_SIZE}
                  imageBorder={IMAGE_BORDER}
                  circleSize={CIRCLE_SIZE}
                  circleBorder={CIRCLE_BORDER}
                  index={index}
                />
              )}
              numColumns={3}
              columnWrapperStyle={{justifyContent: 'flex-start', marginVertical: 10}}
              contentContainerStyle={{paddingHorizontal: theme.PADDING_SIZE}}
            />
          )}
          <FloatingBottomButton label="?????? ??????" enabled={category != ''} onPress={onPressSelectCompletion} />
        </View>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  tagContainer: {
    backgroundColor: theme.gray50,
    marginRight: 8,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 26,
    marginBottom: 8,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: theme.white,
    paddingVertical: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  mainCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
})
