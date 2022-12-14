import React, {useCallback, useEffect, useState} from 'react'
import {View, Text, Pressable, TextInput, Image, StyleSheet, Dimensions} from 'react-native'
import FastImage from 'react-native-fast-image'
import {useNavigation} from '@react-navigation/native'
import moment from 'moment'
import * as theme from '../../theme'
import type {IHoldingSharingList, ISharingInfo} from '../../types'
import {Tag, XIcon, StarUnfilledIcon, StarFilledIcon} from '../utils'

const {width} = Dimensions.get('window')

var IMAGE_SIZE = (width - theme.PADDING_SIZE * 3) / 2

export const HoldingSharingItem = ({item}: {item: IHoldingSharingList}) => {
  // 나눔 게시글 아이템 구조분해 할당
  const {accountIdx, nanumIdx, creatorId, thumbnail, category, nanumMethod, title, createdDatetime, favorites, secretForm, secretPwd, firstDate} = item

  const now = moment()
  const openDate = moment(item.firstDate, 'YYYYMMDDHHmmss')

  // 이미지가 존재하면 이미지의 uri로, 없으면 기본 이미지로
  const imageUri = thumbnail ? thumbnail : 'http://localhost:8081/src/assets/images/no-image.jpeg'
  const navigation = useNavigation()

  const [isBefore, setIsBefore] = useState(false)

  useEffect(() => {
    setIsBefore(now < openDate ? true : false)
  }, [openDate])

  // 상세 페이지로 이동
  const onPressItem = useCallback(() => {
    // 내가 진행한 나눔은 시크릿폼, 난눔 시작 예약 여부 상관 없이 이동
    navigation.navigate('HoldingSharingStackNavigator', {
      screen: 'HoldingSharing',
      params: {
        nanumIdx: nanumIdx,
      },
    })
  }, [])

  return (
    <Pressable onPress={onPressItem} style={[styles.container]}>
      {isBefore && (
        <View style={styles.overlay}>
          <Text style={[styles.overlayText, {marginBottom: 2.5}]}>{openDate.format('YY/MM/DD HH:mm')}</Text>
          <Text style={styles.overlayText}>오픈 예정</Text>
        </View>
      )}
      <View style={{width: IMAGE_SIZE}}>
        <FastImage style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} source={{uri: imageUri}}></FastImage>
      </View>
      <View style={{marginTop: 10}}>
        <Tag label={nanumMethod == 'M' ? '우편' : '오프라인'} />
        <Text style={[styles.title, {width: IMAGE_SIZE}]}>{title}</Text>
        <Text style={[styles.writerName]}>{creatorId}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  secretModalContainer: {
    padding: 24,
    backgroundColor: theme.white,
    borderRadius: 8,
  },
  overlayText: {
    color: theme.white,
    fontFamily: 'Pretendard-SemiBold',
  },
  overlay: {
    position: 'absolute',
    zIndex: 1,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: 'rgba(32,32,33,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  writerName: {
    color: theme.gray500,
    fontFamily: 'Pretendard-Medium',
    marginTop: 2.5,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  container: {
    width: IMAGE_SIZE,
  },
  image: {
    borderRadius: 8,
  },
  imageHeader: {
    position: 'absolute',
    top: 5,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 5,
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    marginTop: 5,
    color: theme.gray800,
  },
})
