import React, {useCallback} from 'react'
import {View, StyleSheet, Text, Platform, Alert} from 'react-native'
import {useMutation} from 'react-query'
import {showMessage} from 'react-native-flash-message'
import {useNavigation} from '@react-navigation/native'
import {useQueryClient} from 'react-query'

import {Tag, StarFilledIcon, StarUnfilledIcon, LockIcon} from '../utils'
import {NoticeBanner} from './NoticeBanner'
import {SharingTimeLocation} from './SharingTimeLocation'
import {WriterProfileBanner} from './WriterProfileBanner'
import {SharingGoodsInfo} from './SharingGoodsInfo'
import {INanum} from '../../types'
import {addFavorite, removeFavorite, queryKeys} from '../../api'
import {useAppSelector} from '../../hooks'
import * as theme from '../../theme'

type ContentProps = {
  headerHeight: number
  nanumDetail: INanum
  numInquires: number
}

export function NanumDetailContent({headerHeight, nanumDetail, numInquires}: ContentProps) {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const accountIdx = useAppSelector(state => state.auth.user.accountIdx)
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn)

  const addFavoriteQuery = useMutation([queryKeys.favorites], addFavorite, {
    onSuccess: () => {
      nanumDetail.favorites_yn = 'Y' // 프론트 단에서만 즐겨찾기 여부 수정.
      nanumDetail.favorites += 1

      queryClient.invalidateQueries([queryKeys.favorites])

      showMessage({
        // 에러 안내 메세지
        message: '찜 목록에 추가되었습니다.',
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
  // 찜 해제
  const removeFavoriteQuery = useMutation([queryKeys.favorites], removeFavorite, {
    onSuccess: () => {
      // 즐겨찾기 버튼 클릭했을 때
      nanumDetail.favorites_yn = 'N' //  프론트 단에서만 즐겨찾기 여부 수정. (invalidate query로 새로 가져오기 X)
      nanumDetail.favorites -= 1
      queryClient.invalidateQueries([queryKeys.favorites])

      showMessage({
        // 에러 안내 메세지
        message: '찜 목록에서 삭제되었습니다.',
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

  const onPressAddFavorite = useCallback(() => {
    if (isLoggedIn == false) {
      if (Platform.OS == 'ios') {
        Alert.alert('로그인 후 이용할 수 있습니다. 로그인 페이지로 이동하시겠습니까?', '', [
          {
            text: '취소',
          },
          {
            text: '확인',
            onPress: () => navigation.navigate('MyPageTabStackNavigator'),
          },
        ])
      } else {
        Alert.alert('로그인 후 이용할 수 있습니다', '로그인 페이지로 이동하시겠습니까?', [
          {
            text: '취소',
          },
          {
            text: '확인',
            onPress: () => navigation.navigate('MyPageTabStackNavigator'),
          },
        ])
      }
    } else {
      if (addFavoriteQuery.isLoading || removeFavoriteQuery.isLoading) {
        return
      }
      // 즐겨찾기 버튼 클릭했을 때

      addFavoriteQuery.mutate({
        accountIdx: accountIdx,
        nanumIdx: nanumDetail.nanumIdx,
        categoryIdx: nanumDetail.categoryIdx,
        category: nanumDetail.category,
      }) // 인자에는 query params 넣기
    }
  }, [nanumDetail, accountIdx, addFavoriteQuery, removeFavoriteQuery])

  const onPressRemoveFavorite = useCallback(() => {
    if (isLoggedIn == false) {
      if (Platform.OS == 'ios') {
        Alert.alert('로그인 후 이용할 수 있습니다. 로그인 페이지로 이동하시겠습니까?', '', [
          {
            text: '취소',
          },
          {
            text: '확인',
            onPress: () => navigation.navigate('MyPageTabStackNavigator'),
          },
        ])
      } else {
        Alert.alert('로그인 후 이용할 수 있습니다', '로그인 페이지로 이동하시겠습니까?', [
          {
            text: '취소',
          },
          {
            text: '확인',
            onPress: () => navigation.navigate('MyPageTabStackNavigator'),
          },
        ])
      }
    } else {
      if (addFavoriteQuery.isLoading || removeFavoriteQuery.isLoading || nanumDetail.favorites == 0) {
        return
      }

      removeFavoriteQuery.mutate({
        accountIdx: accountIdx,
        nanumIdx: nanumDetail.nanumIdx,
        categoryIdx: nanumDetail.categoryIdx,
        category: nanumDetail.category,
      }) // 인자에는 query params 넣기
    }
  }, [nanumDetail, accountIdx, addFavoriteQuery, removeFavoriteQuery])

  return (
    <View
      style={[
        styles.container,
        {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -24,
          zIndex: 1,
        },
      ]}>
      <View style={styles.padding}>
        <View style={[theme.styles.rowFlexStart]}>
          <Tag label={nanumDetail?.nanumMethod == 'O' ? '오프라인' : '우편'}></Tag>
          {nanumDetail.secretForm == 'Y' && <LockIcon />}
        </View>
        <View style={[{marginVertical: 16}, theme.styles.rowSpaceBetween]}>
          <Text style={[styles.title]}>{nanumDetail?.title}</Text>
          <View style={{alignItems: 'center'}}>
            {nanumDetail?.favorites_yn == 'Y' ? (
              <StarFilledIcon size={30} onPress={onPressRemoveFavorite} />
            ) : (
              <StarUnfilledIcon size={30} onPress={onPressAddFavorite} />
            )}
            <Text style={{color: theme.gray500, fontSize: 12, fontFamily: 'Pretendard-Medium'}}>{nanumDetail.favorites}</Text>
          </View>
        </View>
        <Text style={[styles.date]}>{nanumDetail.firstDate.slice(0, 10)}</Text>
        <SharingGoodsInfo products={nanumDetail.nanumGoodslist} />
        {nanumDetail.nanumMethod == 'O' && <SharingTimeLocation schedules={nanumDetail.nanumDatelist} />}
      </View>
      <NoticeBanner nanumIdx={nanumDetail?.nanumIdx} writerAccountIdx={accountIdx} />
      <View style={{padding: theme.PADDING_SIZE, justifyContent: 'center'}}>
        <Text style={theme.styles.bold16}>상세 설명</Text>
        <View style={[styles.descriptionContainer, {minHeight: 120}]}>
          <Text style={styles.contentText}>{nanumDetail.contents}</Text>
        </View>
      </View>
      <WriterProfileBanner
        writername={nanumDetail.creatorId}
        nanumIdx={nanumDetail.nanumIdx}
        writerProfileImageUri={nanumDetail.accountDto?.accountImg}
        writerAccountIdx={nanumDetail.accountDto?.accountIdx}
        askNum={numInquires}
      />

      <View style={{height: 80}}>{/* <RelatedSharing /> */}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionContainer: {
    paddingTop: theme.PADDING_SIZE,
    //justifyContent: 'center',
    flex: 1,
  },
  userName: {
    color: theme.gray800,
    fontFamily: 'Pretendard-SemiBold',
  },
  userImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 15,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followText: {
    color: theme.white,
  },

  date: {
    color: theme.gray700,
    fontFamily: 'Pretendard-Medium',
  },
  starText: {
    fontFamily: 'Pretendard-Medium',
    color: theme.gray500,
    marginTop: 5,
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    color: theme.gray800,
  },

  rootContainer: {
    flex: 1,
    zIndex: 99,
  },
  container: {
    backgroundColor: 'white',
  },
  itemContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 25,
    color: '#FFD800',
  },
  padding: {padding: 20},
})
