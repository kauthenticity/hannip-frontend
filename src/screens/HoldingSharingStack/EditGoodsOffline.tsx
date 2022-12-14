import React, {useCallback, useMemo, useState} from 'react'
import {View, Text, TextInput, ScrollView, StyleSheet, Platform} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Switch} from 'react-native-paper'
import KeyboardManager from 'react-native-keyboard-manager'

import {useNavigation, useRoute} from '@react-navigation/native'
import {useToggle} from '../../hooks'
import {WriteGoodsOfflineRouteProps, WriteGoodsOfflineNavigationProps} from '../../navigation/WriteGoodsStackNavigator'
import {StackHeader, FloatingBottomButton} from '../../components/utils'
import {StepIndicator, ProductInfo, AdditionalQuestions, SelectTimeLocation} from '../../components/WriteGoodsStack'
import * as theme from '../../theme'
import {IAdditionalQuestion, IProductInfo, ISharingForm, IReceiveInfo} from '../../types'

// ***************************** ios keyboard settings *****************************
if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true)
  KeyboardManager.setEnableDebugging(false)
  KeyboardManager.setKeyboardDistanceFromTextField(10)
  KeyboardManager.setLayoutIfNeededOnUpdate(true)
  KeyboardManager.setEnableAutoToolbar(true)
  KeyboardManager.setToolbarDoneBarButtonItemText('확인')
  KeyboardManager.setToolbarManageBehaviourBy('subviews') // "subviews" | "tag" | "position"
  KeyboardManager.setToolbarPreviousNextButtonEnable(false)
  KeyboardManager.setToolbarTintColor('#007aff') // Only #000000 format is supported
  KeyboardManager.setToolbarBarTintColor('#FFFFFF') // Only #000000 format is supported
  KeyboardManager.setShouldShowToolbarPlaceholder(true)
  KeyboardManager.setOverrideKeyboardAppearance(false)
  KeyboardManager.setKeyboardAppearance('default') // "default" | "light" | "dark"
  KeyboardManager.setShouldResignOnTouchOutside(true)
  KeyboardManager.setShouldPlayInputClicks(true)
  KeyboardManager.resignFirstResponder()
}

export const EditGoodsOffline = () => {
  // ***************************** utils *****************************
  const navigation = useNavigation<WriteGoodsOfflineNavigationProps>()
  const route = useRoute<WriteGoodsOfflineRouteProps>()
  const {images, categories, title, content, hashtags, type, isOpenDateBooked, openDate} = useMemo(() => {
    return route.params
  }, [])

  // ***************************** states *****************************
  const [isSecretForm, toggleSecretForm] = useToggle(false) // 시크릿 폼 여부
  const [additionalQuestions, setAdditionalQuestions] = useState<IAdditionalQuestion[]>([])
  const [products, setProducts] = useState<IProductInfo[]>([]) // 상품 정보 state
  const [secretKey, setSecretKey] = useState('')
  const [receiveInfo, setReceiveInfo] = useState<IReceiveInfo[]>([])

  // 처음에 화면 로드될 때 이전 페이지 작성 정보 가져옴

  // ***************************** callbacks *****************************
  const isButtonEnabled = useCallback(() => {
    if (receiveInfo.length == 0 || products.length == 0) {
      return false
    }
    return true
  }, [receiveInfo, products])

  const onPressNext = useCallback(() => {
    // 백에 전송할 나눔글 폼
    const form: ISharingForm = {
      images,
      categories,
      title,
      content,
      //hashtags,
      type,
      isOpenDateBooked,
      openDate,
      isSecretForm,
      additionalQuestions,
      products,
      secretKey,
      receiveInfo,
    }
    // ************* 여기에 api 작성 *************
    // 백에서 받아온 게시글 id를 다음 스크린으로 넘겨줌.
    navigation.navigate('WriteGoodsComplete', {
      id: '11111',
    })
  }, [isSecretForm, additionalQuestions, products, secretKey])

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <StackHeader goBack title="모집폼 작성" />
      <ScrollView style={[styles.container]}>
        <View style={[theme.styles.wrapper]}>
          <StepIndicator step={2} />
        </View>
        <View style={[theme.styles.wrapper, styles.spacing]}>
          <SelectTimeLocation receiveInfo={receiveInfo} setReceiveInfo={setReceiveInfo} />
        </View>

        <View style={[theme.styles.wrapper, styles.spacing]}>
          <ProductInfo productInfos={products} setProductInfos={setProducts} />
        </View>
        <View style={[theme.styles.wrapper, styles.spacing]}>
          <AdditionalQuestions questions={additionalQuestions} setQuestions={setAdditionalQuestions} />
        </View>

        <View style={[theme.styles.wrapper, styles.spacing]}>
          <View style={[theme.styles.rowSpaceBetween]}>
            <Text style={{fontFamily: 'Pretendard-Medium', fontSize: 16}}>시크릿 폼</Text>
            <Switch color={theme.gray800} onValueChange={toggleSecretForm} value={isSecretForm} />
          </View>
          <TextInput
            style={[theme.styles.input, {marginTop: 10}]}
            value={secretKey}
            onChangeText={setSecretKey}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={theme.gray300}
          />
        </View>
      </ScrollView>
      <FloatingBottomButton enabled={isButtonEnabled()} label="다음" onPress={onPressNext} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },

  spacing: {
    marginBottom: 24,
  },
})
