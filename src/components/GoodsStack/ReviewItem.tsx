import React, {useState, useCallback, useMemo} from 'react'
import {View, Text, Pressable, ScrollView, StyleSheet} from 'react-native'
import ImageView from 'react-native-image-viewing'
import FastImage from 'react-native-fast-image'
import {useMutation, useQueryClient} from 'react-query'
import {showMessage} from 'react-native-flash-message'

import type {ImageSource} from 'react-native-image-viewing/dist/@types'
import {useAppSelector} from '../../hooks'
import * as theme from '../../theme'
import {queryKeys, deleteReview} from '../../api'
import {IReviewDto, IReviewDeleteDto} from '../../types'

type ReviewItemProps = {
  item: any
  opened: boolean
  index: number
  onPressReview: (index: number) => void
}
export const ReviewItem = ({item, opened, index, onPressReview}: ReviewItemProps) => {
  const [showImageView, setShowImageView] = useState<boolean>(false) // image view를 띄울지
  const currentCreatorId = useAppSelector(state => state.auth.user.creatorId)
  const queryClient = useQueryClient()
  const [imageIndex, setImageIndex] = useState<number>(0) // imageView 에서 띄울 이미지의 index
  const {accountIdx, date, creatorId, createdDatetime, comments, images, nanumIdx} = item

  const onPressImage = useCallback((index: number) => {
    setImageIndex(index)
    setShowImageView(true)
  }, [])

  const imageViewAssets = useMemo(() => {
    if (images) {
      return images?.map((url: string) => {
        return {uri: url}
      })
    } else {
      return []
    }
  }, [])

  const deleteReviewQuery = useMutation([queryKeys.review], deleteReview, {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries([queryKeys.review])
      showMessage({
        message: '후기 삭제가 완료되었습니다.',
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

  const onPressDelete = useCallback(() => {
    if (deleteReviewQuery.isLoading) {
      return
    }
    const reviewDto: IReviewDeleteDto = {
      nanumIdx: nanumIdx,
      creatorId: creatorId,
    }

    deleteReviewQuery.mutate(reviewDto)
  }, [accountIdx, deleteReviewQuery])

  return (
    <>
      {imageViewAssets.length > 0 && (
        <ImageView
          images={imageViewAssets}
          imageIndex={imageIndex}
          visible={showImageView}
          keyExtractor={(imageSrc: ImageSource, index: number) => String(imageSrc) + index.toString() + index.toString()}
          onRequestClose={() => setShowImageView(false)}
          swipeToCloseEnabled
        />
      )}

      <View style={[{paddingVertical: 10}, opened && {backgroundColor: theme.gray50}]}>
        <Pressable onPress={() => onPressReview(index)} style={[theme.styles.wrapper]}>
          <View style={[theme.styles.rowSpaceBetween, {marginVertical: 6}]}>
            <Text style={{fontSize: 12}}>{creatorId}</Text>
            <View style={[theme.styles.rowFlexStart]}>
              <Text style={{fontSize: 12, color: theme.gray700}}>{createdDatetime.slice(0, 10)}</Text>
              {currentCreatorId == creatorId && (
                <Pressable onPress={onPressDelete}>
                  <Text style={styles.deleteText}>삭제</Text>
                </Pressable>
              )}
            </View>
          </View>
          <View style={[theme.styles.rowSpaceBetween]}>
            <View style={{flex: 1, alignSelf: 'flex-start'}}>
              {!opened && (
                <Text numberOfLines={1} style={{flexWrap: 'wrap'}}>
                  {comments}
                </Text>
              )}
            </View>
            {!opened && <View>{images && <FastImage source={{uri: images[0]}} style={[styles.imagePreview]} />}</View>}
          </View>
        </Pressable>
        {opened && (
          <Pressable style={[theme.styles.wrapper]} onPress={() => onPressReview(index)}>
            <Text style={{marginBottom: 8}}>{comments}</Text>
            {images && (
              <ScrollView horizontal contentContainerStyle={{paddingVertical: 6}} scrollEnabled={images.length >= 3} showsHorizontalScrollIndicator={false}>
                {images.map((image: string, index: any) => (
                  <Pressable key={image + index.toString()} onPress={() => onPressImage(index)}>
                    <FastImage source={{uri: image}} style={[styles.reviewImage]}></FastImage>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        )}
      </View>
      <View style={[styles.reviewSeparator, theme.styles.wrapper]} />
    </>
  )
}

const styles = StyleSheet.create({
  deleteText: {
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
    color: theme.gray700,
  },
  buyedListText: {
    color: theme.gray500,
  },
  reviewImage: {
    width: 116,
    height: 116,
    borderRadius: 4,
    marginRight: 12,
  },
  imagePreview: {
    width: 46,
    height: 46,
    borderRadius: 4,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: theme.gray200,
  },
})
