import React, {useCallback, useState} from 'react'
import {View, Text, TextInput, StyleSheet, Alert} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation} from 'react-query'
import {useNavigation, useRoute} from '@react-navigation/native'
import {showMessage} from 'react-native-flash-message'

import {useAppSelector} from '../../hooks'
import {INoticeDto} from '../../types'
import {queryKeys, sendNotice} from '../../api'
import {SendNoticeRouteProps} from '../../navigation/HoldingSharingStackNavigator'
import {StackHeader, FloatingBottomButton} from '../../components/utils'
import * as theme from '../../theme'

export const SendNotice = () => {
  // ******************** utils ********************
  const navigation = useNavigation()
  const route = useRoute<SendNoticeRouteProps>()
  const nanumIdx = route.params.nanumIdx
  const accountIdxList = route.params.accountIdxList
  const creatorId: string = useAppSelector(state => state.auth.user.creatorId)

  // ******************** utils ********************
  const [title, setTitle] = useState<string>('')
  const [comments, setComments] = useState<string>('')

  const sendNoticeQuery = useMutation(queryKeys.sendNotice, sendNotice, {
    onSuccess(data, variables, context) {
      navigation.goBack()
      showMessage({
        // 에러 안내 메세지
        message: '공지사항이 전송되었습니다.',
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
    },
  })

  const onPressSendNotice = useCallback(() => {
    let noticeDto: INoticeDto[] = accountIdxList.map(tempAccountIdx => {
      return {
        nanumIdx,
        accountIdx: tempAccountIdx,
        title,
        comments,
        createdDate: '',
        creatorId: creatorId,
      }
    })

    console.log(JSON.stringify(noticeDto))

    sendNoticeQuery.mutate(noticeDto)
    // for (var i = 0; i < accountIdxList.length; i++) {
    //   sendNoticeQuery.mutate(noticeDto)
    // }
  }, [title, comments, creatorId, accountIdxList])

  const checkButtonEnabled = useCallback(() => {
    // 둘다 빈 문자열이 아닐 때만 공지 보낼 수 있음
    return title != '' && comments != ''
  }, [title, comments])

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StackHeader title="공지 보내기" goBack></StackHeader>
      <View style={styles.container}>
        <View style={{marginBottom: 24}}>
          <Text style={{...theme.styles.bold16, marginBottom: 10}}>제목</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[theme.styles.input, styles.textinput]}
            placeholder="제목 입력"
            placeholderTextColor={theme.gray200}
          />
        </View>
        <View>
          <Text style={{...theme.styles.bold16, marginBottom: 10}}>내용</Text>
          <TextInput
            value={comments}
            onChangeText={setComments}
            style={[theme.styles.input, styles.textinput, {height: 240, textAlignVertical: 'top', paddingTop: 20}]}
            placeholder="내용 입력"
            placeholderTextColor={theme.gray200}
            multiline
          />
        </View>
        <View style={styles.spacing}>
          <Text style={styles.termText}>부적절한 공지 등록 시 비 노출 또는 무통보 삭제될 수 있습니다.</Text>
          <Text style={styles.termText}>- 비방/욕설/명예훼손에 해당되는 게시물</Text>
          <Text style={styles.termText}>- 개인정보를 포함한 내용</Text>
        </View>
      </View>
      <FloatingBottomButton label="등록" enabled={checkButtonEnabled()} onPress={onPressSendNotice} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  termText: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.gray500,
  },
  spacing: {
    marginTop: 24,
  },
  textinput: {
    color: theme.gray800,
    lineHeight: 20,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: theme.white,
  },
  container: {
    flex: 1,
    padding: theme.PADDING_SIZE,
  },
})
