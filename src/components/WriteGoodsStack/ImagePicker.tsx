import React, {useCallback, useState} from 'react'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import FastImage from 'react-native-fast-image'
import Modal from 'react-native-modal'
import type {Asset} from 'react-native-image-picker'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker'
import {black, white} from '../../theme'
import AddIcon from '../../assets/icons/add_light.svg'
import {Touchable} from 'react-native'
import {useEffect} from 'react'

const IMAGE_SIZE = 70
const BORDER_SIZE = IMAGE_SIZE / 2

type ImagePickerProps = {
  images: Asset[]
  setImages: React.Dispatch<React.SetStateAction<Asset[]>>
}

type ImageModalProps = {
  isVisible: boolean
  onClose: () => void
  onImageLibraryPress: () => void
  onCameraPress: () => void
}

const ImagePreview = ({uri}: {uri: string | undefined}) => {
  return <FastImage source={{uri: uri}} style={styles.image}></FastImage>
}

const ImagePickerModal = ({isVisible, onClose, onImageLibraryPress, onCameraPress}: ImageModalProps) => {
  return (
    <Modal isVisible={isVisible} onBackButtonPress={onClose} onBackdropPress={onClose} style={styles.modal}>
      <TouchableOpacity onPress={onCameraPress} style={styles.buttonView}>
        <Text style={styles.buttonText}>camera</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onImageLibraryPress} style={styles.buttonView}>
        <Text style={styles.buttonText}>Library</Text>
      </TouchableOpacity>
    </Modal>
  )
}

const ImagePicker = ({images, setImages}: ImagePickerProps) => {
  const [pickerResponse, setPickerResponse] = useState(null)
  const [visible, setVisible] = useState<boolean>(false)

  const imageCallback = useCallback((res: any) => {
    setImages([...images, res.assets[0]])
    setVisible(false)
  }, [])

  React.useEffect(() => {
    console.log(images)
  }, [images])

  const onImageLibraryPress = useCallback(() => {
    launchImageLibrary({selectionLimit: 1, mediaType: 'photo', includeBase64: false}, imageCallback)
  }, [])

  const onCameraPress = useCallback(() => {
    launchCamera({saveToPhotos: true, mediaType: 'photo', includeBase64: false}, imageCallback)
  }, [])

  const showModal = useCallback(() => {
    setVisible(true)
  }, [])

  return (
    <View style={[styles.contianer]}>
      <Text style={[styles.title]}>이미지 선택</Text>
      <View style={[styles.imageContainer]}>
        <TouchableOpacity onPress={showModal}>
          <View style={[styles.addImage]}>
            <AddIcon width={IMAGE_SIZE * 0.3} height={IMAGE_SIZE * 0.3} fill={black} />
          </View>
        </TouchableOpacity>

        {images.map(image => (
          <ImagePreview key={image.uri} uri={image.uri} />
        ))}

        <ImagePickerModal isVisible={visible} onClose={() => setVisible(false)} onImageLibraryPress={onImageLibraryPress} onCameraPress={onCameraPress} />
      </View>
    </View>
  )
}

export default ImagePicker

const styles = StyleSheet.create({
  contianer: {
    marginVertical: 10,
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    color: black,
    marginBottom: 10,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    marginRight: 15,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: white,
    width: '80%',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',

    margin: '40%',
    borderRadius: 8,
  },
  buttonView: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: black,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: black,
  },
})
