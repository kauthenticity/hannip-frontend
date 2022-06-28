import React, {useCallback, useState} from 'react'
import {View, Text, ScrollView, TextInput, NativeSyntheticEvent, TextInputChangeEventData, StyleSheet, Platform} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import KeyboardManager from 'react-native-keyboard-manager'
import {useQuery} from 'react-query'

import {StackHeader, FloatingBottomButton, NeccesaryField, SeparatorBold} from '../../components/utils'
import {FindAddress, ProductInfo, MakeNewField} from '../../components/GoodsStack'
import {IRequestFormOnline, ISharingRequestInfo} from '../../types'
import {queryKeys, getGoodsRequestInfo} from '../../api'
import * as theme from '../../theme'

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

export const GoodsReqeustOnline = () => {
  // ***************************** utils *****************************
  const [answers, setAnswers] = useState<string[]>([])

  // ***************************** states *****************************
  const [info, setInfo] = useState<ISharingRequestInfo>({
    products: [],
    title: '',
    additionalQuestions: [],
  })
  const [requestForm, setRequestForm] = useState<IRequestFormOnline>({
    name: '',
    address: {
      postcode: '',
      roadAddress: '',
      detailedAddress: '',
    },
    product: [],
  })
  const [selectedItems, setSelectedItems] = useState<any>({}) // 선택한 상품들

  // ***************************** react query *****************************
  useQuery(queryKeys.goodsRequestInfo, getGoodsRequestInfo, {
    onSuccess: data => {
      setInfo(data)
      setRequestForm({
        ...requestForm,
      })
      data.products.forEach((item: any) => {
        selectedItems[item.id] = false
      })
    },
  })

  // ***************************** callbacks *****************************
  const isButtonEnabled = useCallback(() => {
    // 기본 필수 정보 중에 하나라도 안 채워진 게 있으면 false 리턴
    if (
      requestForm.name == '' ||
      requestForm.address.detailedAddress == '' ||
      requestForm.address.postcode == '' ||
      requestForm.address.roadAddress == '' ||
      requestForm.product.length == 0
    ) {
      return false
    }
    // 추가 질문 사항 중 필수 질문에 대한 input이 비어 있으면 false 리턴
    for (var i = 0; i < info.additionalQuestions.length; i++) {
      if (info.additionalQuestions[i].necessary == true && answers[i] == '') {
        return false
      }
    }
    return true
  }, [requestForm, answers, info])

  const onPressRequest = useCallback(
    (requestForm: IRequestFormOnline) => {
      console.log(answers)
      console.log(requestForm)
    },
    [requestForm, answers],
  )
  return (
    <SafeAreaView style={theme.styles.safeareaview}>
      <StackHeader title="신청하기" goBack />
      <ScrollView>
        <View style={{marginBottom: 20, marginTop: 10}}>
          <Text style={[theme.styles.wrapper, styles.title]}>BTS 키링 나눔</Text>
          <View style={[theme.styles.wrapper]}>
            <Text style={[theme.styles.bold16]}>상품 선택</Text>
            {info.products.map(item => (
              <ProductInfo
                item={item}
                key={item.id}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                requestForm={requestForm}
                setRequestForm={setRequestForm}
              />
            ))}
          </View>
        </View>
        <SeparatorBold />

        <View style={[{padding: theme.PADDING_SIZE}]}>
          <Text style={[theme.styles.bold16]}>정보 입력</Text>

          <View style={[styles.spacing]}>
            <View style={[theme.styles.rowFlexStart]}>
              <Text style={theme.styles.label}>이름</Text>
              <NeccesaryField />
            </View>
            <TextInput
              value={requestForm.name}
              onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => setRequestForm({...requestForm, name: e.nativeEvent.text})}
              style={[theme.styles.input, styles.input]}
              placeholder="이름"
              placeholderTextColor={theme.gray200}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={[styles.spacing]}>
            <View style={[theme.styles.rowFlexStart]}>
              <Text style={theme.styles.label}>주소</Text>
              <NeccesaryField />
            </View>
            <FindAddress requestForm={requestForm} setRequestForm={setRequestForm} />
          </View>
          {info.additionalQuestions.map((item, index) => (
            <MakeNewField id={item.id} label={item.content} necessary={item.necessary} index={index} answers={answers} setAnswers={setAnswers} />
          ))}
        </View>
      </ScrollView>
      <FloatingBottomButton label="제출하기" enabled={isButtonEnabled()} onPress={() => onPressRequest(requestForm)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  spacing: {
    marginTop: 24,
  },
  input: {},
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    marginBottom: 16,
  },
})
