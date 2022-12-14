import React from 'react'
import {Pressable, Text, StyleSheet, ActivityIndicator} from 'react-native'
import * as theme from '../../theme'

type RoundButtonProps = {
  label: string
  onPress?: () => void
  enabled?: boolean
  style?: any
  loading?: boolean
}

export const RoundButton = ({label, onPress, style, enabled = false, loading = false}: RoundButtonProps) => {
  return (
    <Pressable
      onPress={enabled && loading == false ? onPress : undefined}
      style={[style, styles.container, enabled ? theme.styles.button : theme.styles.disabledButton]}>
      {loading ? <ActivityIndicator /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  label: {
    color: theme.white,
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
  },
})
