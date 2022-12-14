import React, {useCallback, useMemo} from 'react'
import {View, Text, Pressable, StyleSheet} from 'react-native'
import FastImage from 'react-native-fast-image'
import {useNavigation} from '@react-navigation/native'
import {RightArrowIcon} from '../utils'
import * as theme from '../../theme'
import {useAppSelector} from '../../hooks'

type WriterProfileBannerProps = {
  nanumIdx: number
  writerProfileImageUri: string | undefined
  writername: string
  askNum: number
  writerAccountIdx: number
}

export const WriterProfileBanner = ({nanumIdx, writerProfileImageUri, writername, askNum, writerAccountIdx}: WriterProfileBannerProps) => {
  // ******************** utils ********************
  const userAccountIdx = useAppSelector(state => state.auth.user.accountIdx)
  const navigation = useNavigation()

  const imageUri = useMemo(
    () =>
      writerProfileImageUri == '' || writerProfileImageUri == undefined || writerProfileImageUri == null
        ? require('../../assets/images/no_user.jpeg')
        : {uri: writerProfileImageUri},
    [],
  )

  // ******************** callbacks ********************
  // 문의글 리스트로 이동하는 네비게이션
  const onPressQnA = useCallback(() => {
    console.log(userAccountIdx, writerAccountIdx)

    if (userAccountIdx == writerAccountIdx) {
      navigation.navigate('QnAListCreator', {
        nanumIdx,
      })
    } else {
      navigation.navigate('QnAListUser', {
        nanumIdx,
      })
    }
  }, [userAccountIdx, writerAccountIdx])

  const onPressWriterProfile = useCallback(() => {
    navigation.navigate('WriterProfile', {
      writerAccountIdx: writerAccountIdx,
      nanumIdx: nanumIdx,
    })
  }, [])

  return (
    <View style={[theme.styles.rowSpaceBetween, styles.container]}>
      <Pressable style={[theme.styles.rowFlexStart]} onPress={onPressWriterProfile}>
        <FastImage source={imageUri} style={{width: 24, height: 24, borderRadius: 12, marginRight: 8}}></FastImage>
        <Text style={[theme.styles.bold16, {color: theme.gray700}]}>{writername}</Text>
      </Pressable>
      <Pressable style={[theme.styles.rowFlexStart]} onPress={onPressQnA}>
        <Text style={{fontSize: 16}}>문의글</Text>
        <Text style={{color: theme.main, marginLeft: 8, fontSize: 16}}>{askNum}</Text>
        <RightArrowIcon size={20} onPress={onPressQnA} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: theme.gray50,
  },
})
