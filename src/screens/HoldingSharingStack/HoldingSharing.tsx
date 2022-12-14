import React, {useCallback, useEffect, useState} from 'react'
import {View, Pressable, ScrollView, Text, StyleSheet, Alert, ActivityIndicator, Dimensions, RefreshControl} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, useMutation, useQueryClient} from 'react-query'
import {showMessage} from 'react-native-flash-message'
import moment from 'moment'
import {Shadow} from 'react-native-shadow-2'
import {getStatusBarHeight} from 'react-native-status-bar-height'
import Modal from 'react-native-modal'
import NotExistsSvg from '../../assets/Icon/NotExists.svg'

import {
  StackHeader,
  FloatingBottomButton,
  SharingPreview,
  MenuIcon,
  BottomSheet,
  DownArrowIcon,
  LeftArrowIcon,
  XIcon,
  RightArrowBoldIcon,
  CheckboxIcon,
  EmptyCheckboxIcon,
  Tag,
} from '../../components/utils'
import {HoldingSharingBottomSheetContent} from '../../components/HoldingSharingStack'
import {
  INanumGoodsOrderDto,
  INanumDetailDto,
  IMyNanumDetailDto,
  IApplyDto,
  IParticipatingSharingList,
  INanumGoodsDto,
  INanumGoods,
  IRequestNanumDetail,
  INanum,
} from '../../types'
import {useAppSelector, useToggle} from '../../hooks'
import * as theme from '../../theme'
import {useNavigation, useRoute} from '@react-navigation/native'
import {HoldingSharingRouteProps} from '../../navigation/HoldingSharingStackNavigator'
import {queryKeys, getNanumByIndex, getReceiverList, endNanum, cancelReceiver, getReceiverDetail, getParticipatingNanumList, postRequestDetail} from '../../api'
import {AddressModal, CancelModal, CheckFinishedModal} from '../../components/MyPageStack'
import {NotTakenModal} from '../../components/MyPageStack/NotTakenModal'
import {DeleteModal} from '../../components/GoodsStack/DeleteModal'
import {red} from '../../theme'

const BUTTON_WIDTH = (Dimensions.get('window').width - 40 - 10) / 2
const STATUSBAR_HEIGHT = getStatusBarHeight()

export const HoldingSharing = () => {
  // ************************** utils **************************
  const user = useAppSelector(state => state.auth.user)
  const accountIdx = useAppSelector(state => state.auth.user.accountIdx)
  const route = useRoute<HoldingSharingRouteProps>()
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const nanumIdx = route.params.nanumIdx

  // ************************** states **************************
  const [nanumDetailInfo, setNanumDetailInfo] = useState<INanum>()
  const [moreVisible, setMoreVisible] = useState<boolean>(false) //???????????? ?????? ?????????
  const [isDetail, setIsDetail] = useState<boolean>(false) // ??????????????? ????????????
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false)
  const [isClosed, setIsClosed] = useState<boolean>(false)
  const [receiverInfoList, setReceiverInfoList] = useState<
    {
      acceptedYn: 'Y' | 'N'
      realName: string // ?????? ??????. ????????? null????????? ??? ??????????????? creatorId ??????
      creatorId: string
      accountIdx: number // ???????????? accountIdx
      goodsNum: number // ????????? ????????? ??????
      goodsFirst: string // ????????? ?????? ??????
      selected: boolean // ???????????? ???????????????
    }[]
  >([])
  const [goodsInfoList, setGoodsInfoList] = useState<INanumGoodsDto[]>([]) // ?????? ??????
  const [bottomSheetModalVisible, setBottomSheetModalVisible] = useState<boolean>(false) // ????????????, ????????? ?????? bottom sheet ?????? ???
  const [itemFilter, setItemFilter] = useState<'????????????' | '????????????' | '?????????'>('????????????')
  const [index, SetIndex] = useState<number>(0) // ?????? ??????????????? ?????? receiver index
  const [participantAccountIdx, setParticipantAccountIdx] = useState<number>()
  const [receiverDetail, setReceiverDetail] = useState<IRequestNanumDetail>()
  const [accountIdxList, setAccountIdxList] = useState<number[]>([]) // ????????? ????????? ????????? accountIdxList
  const [currentAccountIdx, setCurrentAccountIdx] = useState<number>() // ????????? ????????? ????????? ?????? ????????? accountIdx
  const [unsongYn, setUnsongYn] = useState<boolean>(false)

  // <CancelModal
  // <AddressModal
  // <NotTakenModal
  // <CheckFinishedModal
  // ******* modal states *******
  const [cancelModalShow, toggleCancelModalShow] = useToggle(false)
  const [addressModalShow, toggleAddressModalShow] = useToggle(false)
  //const [isUnsong, setIsUnsong] = useState<'Y'|'N'>('Y');
  const [notTakenModalShow, toggleNotTakenModalShow] = useToggle(false)
  const [checkFinishedModalShow, toggleCheckFinishedModalShow] = useToggle(false)
  const [deletePressed, setDeletePressed] = useState<boolean>(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [misAcceptedNumber, setMisAcceptedNumber] = useState<number>(0)

  // ************************** react quries **************************

  const nanumInfo = useQuery([queryKeys.nanumDetail, nanumIdx], () => getNanumByIndex({nanumIdx: nanumIdx, accountIdx: accountIdx, favoritesYn: 'N'}), {
    onSuccess(data) {
      setNanumDetailInfo(data)
      console.log('nanumDetailInfo : ', data)
      setGoodsInfoList(data.nanumGoodslist)
    },
  })
  const receiverListQuery = useQuery([queryKeys.receiverList, nanumIdx], () => getReceiverList(nanumIdx), {
    onSuccess(data) {
      setIsClosed(data.nanumGoodsDto[0].endYn == 'Y' ? true : false)

      // ????????? ?????? ???????????? ?????? ???????????? ??????
      if (data.nanumDetailDto.length == 0) {
        setRefreshing(false)
        return
      }

      setAccountIdxList(data.nanumDetailDto.map((item: INanumDetailDto) => item.accountIdx))

      const tempReceiverList: {
        acceptedYn: 'Y' | 'N'
        realName: string // ?????? ??????. ????????? null????????? ??? ??????????????? creatorId ??????
        creatorId: string
        accountIdx: number // ???????????? accountIdx
        goodsNum: number // ????????? ????????? ??????
        goodsFirst: string // ????????? ?????? ??????
        selected: boolean // ???????????? ???????????????
      }[] = []

      // ????????? ????????? accountIdx ????????? ??????
      const nanumDetail: INanumDetailDto[] = data.nanumDetailDto.sort((a: INanumDetailDto, b: INanumDetailDto) => {
        if (a.accountIdx < b.accountIdx) {
          return -1
        }
        if (a.accountIdx > b.accountIdx) {
          return 1
        }
        return 0
      })
      tempReceiverList.push({
        acceptedYn: nanumDetail[0].acceptedYn,
        realName: nanumDetail[0].realName,
        creatorId: nanumDetail[0].creatorId,
        accountIdx: nanumDetail[0].accountIdx,
        goodsNum: 1,
        goodsFirst: nanumDetail[0].goodsName,
        selected: false,
      })

      for (var i = 1; i < nanumDetail.length; i++) {
        const prev = nanumDetail[i - 1]
        const cur = nanumDetail[i]

        // ?????? ???????????? ?????? ???????????? ????????????
        if (prev.accountIdx != cur.accountIdx) {
          tempReceiverList.push({
            acceptedYn: cur.acceptedYn,
            realName: cur.realName,
            creatorId: cur.creatorId,
            accountIdx: cur.accountIdx,
            goodsNum: 1,
            goodsFirst: cur.goodsName,
            selected: false,
          })
        }
        //
        else {
          tempReceiverList[tempReceiverList.length - 1].goodsNum += 1
        }
      }
      console.log(tempReceiverList)
      setReceiverInfoList(tempReceiverList)
      setRefreshing(false) // ????????? ????????? ?????? ??? refreshing??? false??? ??????
      //setReceiverInfoList(nanumDetail)
    },
  })
  const endNanumQuery = useMutation([queryKeys.endNanum, nanumIdx], endNanum, {
    onSuccess(data, variables, context) {
      showMessage({
        // ?????? ?????? ?????????
        message: '?????? ????????? ?????????????????????.',
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
  const myNanumDetailQuery = useMutation([queryKeys.requestedNanumDetail], postRequestDetail, {
    onSuccess(data, variables, context) {
      setRefreshing(false)

      setUnsongYn(data.applyDto.unsongYn == 'Y' ? true : false)
      setReceiverDetail(data)
      setMisAcceptedNumber(data.misAcceptedNumber)
      console.log('receiverDetail : ', receiverDetail)
    },
  })
  // ************************** callbacks **************************
  const onPressCheckbox = useCallback(
    (index: number) => {
      const temp = receiverInfoList.map((item, curIndex) => {
        return curIndex == index ? {...item, selected: !item.selected} : item
      })
      setReceiverInfoList(temp)
    },
    [receiverInfoList],
  )

  const onPressDelete = useCallback(() => {
    setDeletePressed(true)
    setMoreVisible(false)
  }, [receiverInfoList])

  const onPressSendNotice = useCallback(() => {
    navigation.navigate('SendNotice', {
      nanumIdx,
      accountIdxList: receiverInfoList.filter(item => item.selected == true).map(item => item.accountIdx),
    })
  }, [receiverInfoList])

  const sendNoticeButtonEnabled = useCallback(() => {
    return receiverInfoList.filter(item => item.selected == true).map(item => item.accountIdx).length > 0 ? true : false
  }, [receiverInfoList])

  const onPressViewDetail = useCallback(
    (idx: number) => {
      // console.log('idx in func : ', idx)
      // console.log('index ?????? ????????? ????????? : ', index)
      // console.log('receiverInfoList : ', receiverInfoList)
      // console.log('isDetail : ', isDetail)
      setIsDetail(true)
      setCurrentAccountIdx(receiverInfoList[idx]?.accountIdx)

      myNanumDetailQuery.mutate({
        nanumIdx: nanumIdx,
        accountIdx: receiverInfoList[idx].accountIdx,
      })

      SetIndex(idx)
    },
    [receiverInfoList, isDetail, index],
  )

  const onPressCloseDetail = useCallback(() => {
    setIsDetail(false)
  }, [])

  const onPressSelectAll = useCallback(() => {
    const temp = isAllSelected
    setIsAllSelected(!temp)
    if (temp) {
      const tempList = receiverInfoList.map(item => {
        return {...item, selected: false}
      })
      setReceiverInfoList(tempList)
    } else {
      const tempList = receiverInfoList.map(item => {
        return {...item, selected: true}
      })
      setReceiverInfoList(tempList)
    }
  }, [isAllSelected, receiverInfoList])

  const onPressItemFilter = useCallback(() => {
    setBottomSheetModalVisible(true)
  }, [])

  const onPressLeftArrow = useCallback(() => {
    const length = receiverInfoList.length
    const newIdx = index == 0 ? length - 1 : index - 1
    myNanumDetailQuery.mutate({
      nanumIdx,
      accountIdx: receiverInfoList[newIdx].accountIdx,
    })
    SetIndex(newIdx)
  }, [index, receiverInfoList])

  const onPressRightArrow = useCallback(() => {
    const length = receiverInfoList.length
    const newIdx = (index + 1) % length
    myNanumDetailQuery.mutate({
      nanumIdx,
      accountIdx: receiverInfoList[newIdx].accountIdx,
    })
    SetIndex(newIdx)
  }, [index, receiverInfoList])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    if (isDetail) {
      onPressViewDetail(index)
    }

    queryClient.invalidateQueries([queryKeys.receiverList, nanumIdx])
    //queryClient.invalidateQueries([queryKeys.requestedNanumDetail])
  }, [index])

  const onPressClose = useCallback(() => {
    Alert.alert('?????? ?????? ???????????????????', '', [{text: '??????'}, {text: '??????', onPress: () => endNanumQuery.mutate(nanumIdx)}])
  }, [nanumIdx])

  return (
    <SafeAreaView style={theme.styles.safeareaview}>
      <StackHeader title="????????? ??????" goBack>
        <MenuIcon onPress={() => setMoreVisible(moreVisible => !moreVisible)}></MenuIcon>
        <Modal
          isVisible={moreVisible}
          onBackdropPress={() => setMoreVisible(false)}
          animationInTiming={150}
          animationOutTiming={150}
          backdropOpacity={0}
          onModalHide={() => {
            if (deletePressed) {
              setDeleteModalVisible(true)
              setDeletePressed(false)
            }
          }}
          animationIn={'fadeIn'}
          animationOut="fadeOut">
          <Shadow
            containerViewStyle={{position: 'absolute', width: 144, right: 0, borderRadius: 4, top: STATUSBAR_HEIGHT + 28}}
            distance={48}
            startColor="rgba(0,0,0,0.08)">
            <View style={{borderRadius: 4}}>
              <Pressable onPress={onPressDelete} style={[styles.menuModalButton, {backgroundColor: 'rgba(250,250,250,0.96)', width: 144, borderRadius: 4}]}>
                <Text>????????????</Text>
              </Pressable>
            </View>
          </Shadow>
        </Modal>
      </StackHeader>

      <ScrollView contentContainerStyle={[theme.styles.wrapper]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <SharingPreview uri={nanumInfo.data?.thumbnail} category={nanumInfo.data?.category} title={nanumInfo.data?.title} />
        {/* ?????? ?????? ????????? & ?????? ?????? ?????? */}
        <View style={{marginVertical: 20}}>
          {goodsInfoList.map((item, index) => (
            <View key={index} style={[theme.styles.rowSpaceBetween, index != goodsInfoList.length - 1 && {marginBottom: 16}]}>
              <Text style={{fontFamily: 'Pretendard-Medium', color: theme.gray700, fontSize: 16}}>{item.goodsName}</Text>
              <View style={[theme.styles.rowFlexStart]}>
                <Text style={{color: theme.gray500, marginRight: 8}}>?????? ??????</Text>
                <Text style={{color: theme.secondary}}>{item.goodsNumber}</Text>
              </View>
            </View>
          ))}
          {isClosed == true ? (
            <Pressable style={[styles.closeNanumButton, styles.closeNanumButtonTrue]}>
              <Text style={styles.endSharingBtnText2}>????????? ???????????????</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.closeNanumButton, styles.closeNanumButtonFalse]} onPress={onPressClose}>
              <Text style={styles.endSharingBtnText}>?????? ??????</Text>
            </Pressable>
          )}
        </View>
        <View style={{height: 1, backgroundColor: theme.gray300, marginBottom: 20}}></View>
        {/* ?????? ?????? & ?????? ?????? ?????? */}
        <View style={[theme.styles.rowSpaceBetween, {marginBottom: 20}]}>
          {isAllSelected ? (
            <Pressable onPress={onPressSelectAll}>
              <Text style={{color: theme.secondary}}>?????? ?????? ??????</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onPressSelectAll}>
              <Text style={{color: theme.secondary}}>?????? ??????</Text>
            </Pressable>
          )}
          <Pressable style={[theme.styles.rowFlexStart]} onPress={onPressItemFilter}>
            <Text style={{marginRight: 4}}>{itemFilter}</Text>
            <DownArrowIcon onPress={onPressItemFilter} />
          </Pressable>
        </View>

        <View style={{flex: 1, marginBottom: 80}}>
          {receiverListQuery.isLoading ? (
            <ActivityIndicator />
          ) : receiverInfoList.length == 0 ? (
            <View style={[styles.emptyResultView]}>
              <NotExistsSvg />
              <View style={{marginTop: 32}}>
                <Text style={[theme.styles.bold20, {marginBottom: 8, textAlign: 'center'}]}>?????? ???????????? ?????????</Text>
                <Text style={{color: theme.gray700, fontSize: 16, lineHeight: 24}}>???????????? ????????? ?????? ???????????? ??????????????????!</Text>
              </View>
            </View>
          ) : isDetail == true ? (
            // ????????? ?????? ???????????? DOC
            <View style={{flex: 1}}>
              {/* ????????? ??????, x ?????? */}
              <View style={[theme.styles.rowSpaceBetween, {marginBottom: 16}]}>
                <View style={[theme.styles.rowFlexStart]}>
                  <LeftArrowIcon onPress={onPressLeftArrow} />
                  <Text style={{fontSize: 16, color: theme.gray700, lineHeight: 24}}>{index + 1}</Text>
                  <Text style={{fontSize: 16, color: theme.gray700, lineHeight: 24}}> / </Text>
                  <Text style={{fontSize: 16, color: theme.gray700, lineHeight: 24}}>{receiverInfoList.length}</Text>
                  <RightArrowBoldIcon onPress={onPressRightArrow} />
                </View>

                <XIcon onPress={onPressCloseDetail} />
              </View>
              <View style={{flex: 1}}>
                {myNanumDetailQuery.isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <View style={[theme.styles.rowSpaceBetween, {marginBottom: 12}]}>
                      <Text style={[theme.styles.text14, styles.receiverDetailDate]}>{receiverDetail?.applyDto.applyDate}</Text>
                      <Tag label={`????????? ${misAcceptedNumber}???`} />
                    </View>
                    <View style={[theme.styles.rowSpaceBetween, {marginBottom: 20}]}>
                      <Text style={styles.detailLabel}>????????????</Text>
                      <Text style={styles.detailText}>
                        {receiverDetail?.applyDto?.realName == null ? receiverDetail?.applyDto?.creatorId : receiverDetail?.applyDto?.realName}
                      </Text>
                    </View>
                    <View style={[theme.styles.rowSpaceBetween, {marginBottom: 12}]}>
                      <Text style={[styles.detailLabel, {alignSelf: 'flex-start'}]}>?????? ??????</Text>
                      <View>
                        {receiverDetail?.applyingGoodsDto?.map((item, index) => (
                          <Text key={index} style={[styles.detailText, {marginBottom: 8}]}>
                            {item.goodsName} (1???)
                          </Text>
                        ))}
                      </View>
                    </View>
                    {nanumDetailInfo?.nanumMethod == 'M' ? (
                      <View style={[theme.styles.rowSpaceBetween, {marginBottom: 20}]}>
                        <Text style={[styles.detailLabel, {alignSelf: 'flex-start'}]}>??????</Text>
                        <View>
                          <Text style={[styles.detailText, styles.postcodeText]}>???) {receiverDetail?.applyDto?.address1}</Text>
                          <Text style={styles.detailText}>{receiverDetail?.applyDto?.address2}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={[theme.styles.rowSpaceBetween, {marginBottom: 12}]}>
                        <Text style={[styles.detailLabel, {alignSelf: 'flex-start'}]}>?????? ?????????</Text>
                        <View>
                          <Text style={[styles.detailText, styles.postcodeText]}>{receiverDetail?.applyDto?.acceptDate?.slice(0, 16)}</Text>
                        </View>
                      </View>
                    )}
                    {receiverDetail?.applyDto?.acceptedYn == 'Y' ? (
                      <View style={[theme.styles.rowSpaceBetween, {marginBottom: 12}]}>
                        <Text style={[styles.detailLabel, {alignSelf: 'flex-start'}]}>?????? ?????????</Text>
                        <Text style={[styles.detailText, styles.postcodeText]}>{receiverDetail?.applyDto?.acceptDate?.slice(0, 16)}</Text>
                      </View>
                    ) : null}

                    {/* ????????? (???????????? ???????????? ????????? ?????????) */}
                    {nanumDetailInfo?.nanumMethod == 'M' ? (
                      <View style={[theme.styles.rowSpaceBetween, {marginBottom: 20}]}>
                        <Text style={styles.detailLabel}>?????????</Text>
                        <Text style={styles.detailText}>{receiverDetail?.applyDto?.phoneNumber}</Text>
                      </View>
                    ) : null}

                    {/* ????????????, ????????? ??????, ?????? ?????? ?????? ?????? */}
                    {nanumDetailInfo?.nanumMethod == 'M' ? (
                      unsongYn == true ? (
                        //????????? && ????????? ?????? ??????
                        <View style={styles.unsongButton}>
                          <Text style={{color: theme.gray700}}>????????? ?????? ??????</Text>
                        </View>
                      ) : //????????? && ????????? ?????? ??? && ?????? ???????????? ??????
                      receiverDetail?.applyDto?.nanumCancelYn == 'Y' ? (
                        <View style={styles.unsongButton}>
                          <Text style={{color: theme.gray700}}>?????? ??????</Text>
                        </View>
                      ) : (
                        //????????? && ????????? ?????? ??? && ?????? ??????
                        <View style={[theme.styles.rowSpaceBetween, {marginBottom: 24}]}>
                          <Pressable
                            style={[styles.buttonMedium, styles.cancelButton]}
                            onPress={() => {
                              setParticipantAccountIdx(receiverDetail?.applyDto.accountIdx)
                              toggleCancelModalShow()
                            }}>
                            <Text style={styles.cancelText}>????????????</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.buttonMedium, styles.trackingButton]}
                            onPress={() => {
                              setParticipantAccountIdx(receiverDetail?.applyDto.accountIdx)
                              toggleAddressModalShow()
                            }}>
                            <Text style={styles.trackingText}>????????? ??????</Text>
                          </Pressable>
                        </View>
                      )
                    ) : receiverDetail?.applyDto?.acceptedYn == 'Y' ? (
                      //???????????? && ?????? ??????
                      <View style={styles.unsongButton}>
                        <Text style={{color: theme.gray700}}>?????? ??????</Text>
                      </View>
                    ) : // ???????????? && ?????? ???
                    receiverDetail?.applyDto?.misacceptedYn == 'N' ? (
                      // ???????????? ????????? ???????????? ??????
                      receiverDetail?.applyDto?.nanumCancelYn == 'Y' ? (
                        <View style={styles.unsongButton}>
                          <Text style={{color: theme.gray700}}>?????? ??????</Text>
                        </View>
                      ) : (
                        <View style={{marginBottom: 20}}>
                          <View style={[theme.styles.rowSpaceBetween, {marginBottom: 24}]}>
                            <Pressable
                              style={[styles.buttonMedium, styles.cancelButton]}
                              onPress={() => {
                                setParticipantAccountIdx(receiverDetail?.applyDto.accountIdx)
                                toggleCancelModalShow()
                              }}>
                              <Text style={styles.cancelText}>????????????</Text>
                            </Pressable>
                            <Pressable
                              style={[styles.buttonMedium, styles.trackingButton]}
                              onPress={() => {
                                setParticipantAccountIdx(receiverDetail?.applyDto.accountIdx)
                                toggleCheckFinishedModalShow()
                              }}>
                              <Text style={styles.trackingText}>?????? ??????</Text>
                            </Pressable>
                          </View>

                          <Pressable
                            onPress={() => {
                              setParticipantAccountIdx(receiverDetail?.applyDto.accountIdx)
                              toggleNotTakenModalShow()
                            }}>
                            <Text style={{color: theme.main}}>?????? ??????????????????? </Text>
                          </Pressable>
                        </View>
                      )
                    ) : (
                      // ???????????? && ?????????
                      <View style={[styles.unsongButton, {borderColor: red}]}>
                        <Text style={{color: theme.red}}>?????????</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          ) : (
            receiverInfoList?.map(
              (item, index) =>
                (itemFilter == '????????????' || (itemFilter == '????????????' && item.acceptedYn == 'Y') || (itemFilter == '?????????' && item.acceptedYn == 'N')) && (
                  <View
                    key={item.accountIdx}
                    style={[theme.styles.rowFlexStart, {paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.gray200}]}>
                    <View style={{alignItems: 'center', marginRight: 9}}>
                      <Text style={[theme.styles.text14, {marginBottom: 2, color: theme.gray700}]}>{index + 1}</Text>
                      {item.selected ? <CheckboxIcon onPress={() => onPressCheckbox(index)} /> : <EmptyCheckboxIcon onPress={() => onPressCheckbox(index)} />}
                    </View>
                    <View style={{justifyContent: 'space-between', flex: 1}}>
                      <View style={[theme.styles.rowFlexStart, {marginBottom: 6}]}>
                        <Text style={{fontSize: 12, lineHeight: 16}}>{item.creatorId}</Text>
                        {item.acceptedYn == 'Y' && (
                          <View style={[theme.styles.rowFlexStart]}>
                            <Text style={[{color: theme.gray500}, {fontSize: 10, lineHeight: 16, marginHorizontal: 4, fontFamily: 'Pretendard-Bold'}]}>|</Text>
                            <Text style={[styles.acceptedYnText]}>????????????</Text>
                          </View>
                        )}
                      </View>
                      <View style={[theme.styles.rowFlexStart]}>
                        {item.goodsNum == 1 ? (
                          <Text style={[{fontFamily: 'Pretendard-Medium', fontSize: 16, color: theme.gray700}]}> {item.goodsFirst} </Text>
                        ) : (
                          <Text style={[{fontFamily: 'Pretendard-Medium', fontSize: 16, color: theme.gray700}]}>
                            {item.goodsFirst} ??? {item.goodsNum - 1} ???
                          </Text>
                        )}
                      </View>
                    </View>
                    <Pressable style={[theme.styles.rowFlexStart]} onPress={() => onPressViewDetail(index)}>
                      <Text>?????? ??????</Text>
                      <RightArrowBoldIcon size={20} onPress={() => onPressViewDetail(index)} />
                    </Pressable>
                  </View>
                ),
            )
          )}
        </View>
      </ScrollView>

      <FloatingBottomButton label="?????? ?????????" enabled={sendNoticeButtonEnabled()} onPress={onPressSendNotice} />
      <BottomSheet modalVisible={bottomSheetModalVisible} setModalVisible={setBottomSheetModalVisible}>
        <HoldingSharingBottomSheetContent itemFilter={itemFilter} setItemFilter={setItemFilter} />
      </BottomSheet>

      {/* ?????? */}

      <DeleteModal deleteModalVisible={deleteModalVisible} setDeleteModalVisible={setDeleteModalVisible} nanumIdx={nanumIdx} />
      {/* ???????????? */}

      <CancelModal
        nanumIdx={nanumIdx}
        accountIdx={participantAccountIdx!}
        isVisible={cancelModalShow}
        toggleIsVisible={toggleCancelModalShow}
        nanumGoodsDtoList={receiverDetail?.nanumGoodsDto}></CancelModal>

      <AddressModal
        nanumIdx={nanumIdx}
        accountIdx={participantAccountIdx!}
        isVisible={addressModalShow}
        toggleIsVisible={toggleAddressModalShow}
        accountIdxList={accountIdxList}
        selectedAccountIdx={currentAccountIdx!}
        setUnsongYn={setUnsongYn}
        setRefresh={setRefreshing}
      />
      {/* ????????? ?????? */}
      <NotTakenModal
        nanumIdx={nanumIdx}
        accountIdx={participantAccountIdx!}
        isVisible={notTakenModalShow}
        toggleIsVisible={toggleNotTakenModalShow}
        onRefresh={onRefresh}></NotTakenModal>
      {/* ?????? ??????  api ??????*/}
      <CheckFinishedModal
        nanumIdx={nanumIdx}
        accountIdx={participantAccountIdx!}
        isVisible={checkFinishedModalShow}
        toggleIsVisible={toggleCheckFinishedModalShow}
        onRefresh={onRefresh}></CheckFinishedModal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  closeNanumButtonFalse: {
    backgroundColor: theme.white,
    borderColor: theme.main,
  },
  closeNanumButtonTrue: {
    backgroundColor: theme.white,
    borderColor: theme.gray500,
  },
  closeNanumButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 20,
  },
  emptyResultView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  acceptedYnText: {
    color: theme.main,
    fontSize: 12,
    lineHeight: 16,
  },
  trackingText: {
    fontFamily: 'Pretendard-Bold',
    color: theme.main,
  },
  cancelText: {
    color: theme.gray700,
  },
  trackingButton: {
    backgroundColor: theme.main50,
    borderColor: theme.main,
  },
  cancelButton: {
    borderColor: theme.gray500,
  },
  buttonMedium: {
    width: BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 4,
  },
  unsongButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderColor: theme.gray500,
    borderWidth: 1,
    borderRadius: 4,
  },
  postcodeText: {
    marginBottom: 8,
    textAlign: 'right',
  },
  detailLabel: {
    fontSize: 16,
    color: theme.gray500,
  },
  detailText: {
    fontSize: 16,
    color: theme.gray700,
  },
  receiverDetailDate: {
    color: theme.gray500,
  },
  menuModalButton: {
    height: 40,
    padding: 10,
    justifyContent: 'center',
    zIndex: 1,
  },

  endSharingBtnText: {
    color: theme.main,
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  endSharingBtnText2: {
    color: theme.gray500,
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
})
