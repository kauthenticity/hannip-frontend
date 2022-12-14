import React, {useState, useCallback, useMemo} from 'react'
import {View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet} from 'react-native'
import {useMutation, useQueryClient} from 'react-query'
import {showMessage} from 'react-native-flash-message'

import {DeleteQnAModal} from './DeleteQnAModal'
import * as theme from '../../theme'
import {IInquiryNanumDto, IInquiryEditDto} from '../../types'
import {LockIcon} from '../utils'
import {queryKeys, updateInquiry} from '../../api'

type QnAListUserItemProps = {
  item: IInquiryNanumDto
  accountIdx: number
  nanumIdx: number
  inquiryIdx: number
}

type QuestionProps = {
  item: IInquiryNanumDto
  accountIdx: number
  nanumIdx: number
  inquiryIdx: number
}

type Answerprops = {
  answer: string | undefined
  answerDate: string
  //answeredDate: Date | undefined
}

const QnASecret = () => {
  return (
    <View style={[theme.styles.rowFlexStart]}>
      <Text style={[styles.q, styles.secret]}>Q.</Text>
      <Text style={[styles.q, styles.secret]}>비밀글</Text>
    </View>
  )
}

const Question = ({item, accountIdx, nanumIdx, inquiryIdx}: QuestionProps) => {
  // ******************** utils ********************
  const {secretYn, answerComments, creatorId, comments, createdDate} = item
  const writerAccountIdx = item.accountIdx
  const queryClient = useQueryClient()

  // ******************** states ********************
  const [editPressed, setEditPressed] = useState<boolean>(false) // 수정하기 버튼 눌리면 에디터 띄움
  const [deleteQnAModalVisible, setDeleteQnAModalVisible] = useState<boolean>(false) // 삭제하기 모달
  const [editedContent, setEditedContent] = useState<string>(comments)
  const isAnswered = answerComments != ''
  const isSecret = secretYn == 'Y' ? true : false

  const showMenuIcon = useMemo(() => {
    return accountIdx == writerAccountIdx && answerComments == '' // 작성자가 본인이고, 답변이 달리지 않았을 때만 수정 및 삭제 가능
  }, [])

  // ******************** react query ********************
  const updateInquiryQuery = useMutation([queryKeys.inquiry, nanumIdx], updateInquiry, {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries([queryKeys.inquiry, nanumIdx]) // 문의글 목록 다시 get
      setEditPressed(false)
    },
    onError(error, variables, context) {
      showMessage({
        // 에러 안내 메세지
        message: '문의글 업데이트 중 에러가 발생했습니다',
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

  // ******************** callbacks ********************
  const onPressEdit = useCallback(() => {
    setEditPressed(true)
  }, [])
  const onPressDelete = useCallback(() => {
    setDeleteQnAModalVisible(true)
  }, [])

  const onPressEditComplete = useCallback(() => {
    if (updateInquiryQuery.isLoading) {
      return
    }
    const inquiryEditDto: IInquiryEditDto = {
      inquiryIdx: inquiryIdx,
      comments: editedContent,
      secretYn: secretYn,
    }
    updateInquiryQuery.mutate(inquiryEditDto)
  }, [editedContent, inquiryIdx])

  console.log(createdDate)

  return (
    <View>
      <DeleteQnAModal
        deleteQnAModalVisible={deleteQnAModalVisible}
        setDeleteQnAModalVisible={setDeleteQnAModalVisible}
        nanumIdx={nanumIdx}
        inquiryIdx={inquiryIdx}
      />
      <View style={[theme.styles.rowSpaceBetween, {marginBottom: 8}]}>
        <View style={[theme.styles.rowFlexStart]}>
          <Text style={[theme.styles.text12, {fontSize: 12, color: isAnswered ? theme.main : theme.gray500}]}>{isAnswered ? '답변완료' : '답변예정'}</Text>
          {isSecret && <LockIcon size={20} style={{marginLeft: 4}} />}
        </View>
        {showMenuIcon && (
          <View style={[theme.styles.rowFlexStart]}>
            <Pressable style={{marginRight: 8}} onPress={onPressEdit}>
              <Text style={styles.editText}>수정</Text>
            </Pressable>
            <Pressable onPress={onPressDelete}>
              <Text style={styles.editText}>삭제</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={[theme.styles.rowFlexStart, {marginBottom: 8}]}>
        <Text style={[styles.q, {alignSelf: 'flex-start'}]}>Q.</Text>
        {editPressed ? (
          <View style={{flex: 1}}>
            <TextInput
              textAlignVertical="top"
              multiline
              value={editedContent}
              placeholder="최대 150자 작성 가능합니다"
              placeholderTextColor={theme.gray300}
              onChangeText={setEditedContent}
              maxLength={150}
              style={[theme.styles.input, {height: 150, paddingTop: 16}]}></TextInput>
            <Pressable style={styles.editButton} onPress={onPressEditComplete}>
              {updateInquiryQuery.isLoading ? <ActivityIndicator /> : <Text style={{color: theme.white}}>수정하기</Text>}
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.content, {flex: 1}]}>{editedContent}</Text>
        )}
      </View>
      <View style={[theme.styles.rowSpaceBetween]}>
        <Text style={[styles.writer]}>{creatorId}</Text>
        <Text style={[styles.date]}>{createdDate.slice(0, 16)}</Text>
      </View>
    </View>
  )
}

const Answer = ({answer, answerDate}: Answerprops) => {
  //const Answer = ({answer, answeredDate}: Answerprops) => {
  return (
    <View>
      <View style={[theme.styles.rowFlexStart, {marginTop: 16, marginBottom: 8}]}>
        <Text style={[styles.q, {alignSelf: 'flex-start', color: theme.main}]}>A.</Text>
        <Text style={[styles.content, {flex: 1}]}>{answer}</Text>
      </View>
      <View style={[theme.styles.rowSpaceBetween]}>
        <Text style={[styles.writer, {color: theme.main}]}>나눔진행자</Text>
        <Text style={[styles.date]}>{answerDate}</Text>
      </View>
    </View>
  )
}

export const QnAListUserItem = ({item, accountIdx, nanumIdx, inquiryIdx}: QnAListUserItemProps) => {
  return (
    <View style={[styles.qnaListItemContainer]}>
      {item.secretYn == 'Y' && item.accountIdx != accountIdx ? (
        <QnASecret />
      ) : (
        <>
          <Question item={item} accountIdx={accountIdx} nanumIdx={nanumIdx} inquiryIdx={inquiryIdx} />
          {item.answerComments != '' && <Answer answer={item.answerComments} answerDate={item.answerDate.slice(0, 16)} />}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  editButton: {
    alignSelf: 'stretch',
    height: 48,
    backgroundColor: theme.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 16,
  },
  editText: {
    fontSize: 12,
    lineHeight: 16,
  },
  qnaListItemContainer: {
    padding: 16,
    borderColor: theme.gray200,
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 16,
  },
  q: {
    marginRight: 8,
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    color: theme.gray700,
    fontSize: 16,
    lineHeight: 24,
  },
  writer: {
    color: theme.gray500,
    fontSize: 12,
    lineHeight: 16,
  },
  date: {
    color: theme.gray500,
    fontSize: 12,
    lineHeight: 16,
  },
  secret: {
    color: theme.gray500,
  },
  submitAnswerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.gray800,
    backgroundColor: theme.gray800,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  writeAnswerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.gray800,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
