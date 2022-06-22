import React, {useCallback} from 'react'
import {View, Text, Pressable, StyleSheet} from 'react-native'
import FastImage from 'react-native-fast-image'
import {useNavigation} from '@react-navigation/native'
import {RightArrowIcon} from '../utils'
import * as theme from '../../theme'

export const WriterProfileBanner = () => {
  const navigation = useNavigation()

  // 문의글 리스트로 이동하는 네비게이션
  const onPressQnA = useCallback(() => {
    navigation.navigate('QnAList', {
      id: '11111', // 해당 게시글 id
    })
  }, [])

  return (
    <View style={[theme.styles.rowSpaceBetween, {paddingHorizontal: 20, paddingVertical: 16}]}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <FastImage source={require('../../assets/images/no_user.jpeg')} style={{width: 24, height: 24, borderRadius: 12, marginRight: 8}}></FastImage>
        <Text style={[theme.styles.bold16, {color: theme.gray700}]}>춤추는 고양이</Text>
      </View>
      <Pressable style={[theme.styles.rowFlexStart]} onPress={onPressQnA}>
        <Text style={{fontSize: 16}}>문의글</Text>
        <Text style={{color: theme.main, marginLeft: 8, fontSize: 16}}></Text>
        <RightArrowIcon size={20} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({})
