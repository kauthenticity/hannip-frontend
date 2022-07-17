import React, {useEffect, useState, useMemo} from 'react'
import {Dimensions} from 'react-native'
import {CalendarList, Calendar} from 'react-native-calendars'
import {LocaleConfig} from 'react-native-calendars'
import moment from 'moment'
import {LeftArrowCalendarIcon, RightArrowCalendarIcon} from '../utils'
import * as theme from '../../theme'

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}
LocaleConfig.defaultLocale = 'kr'

type WixCalendarProps = {
  scheduleAll: Object | undefined
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>
}
const today = moment().format('YYYY-MM-DD')

export const WixCalendar = ({scheduleAll, setSelectedDate}: WixCalendarProps) => {
  // ******************** states  ********************
  const [markedDates, setMarkedDates] = useState<any>()
  const [currentDate, setCurrentDate] = useState<any>()

  useEffect(() => {
    if (scheduleAll != undefined) {
      var tempMarkedDates: any = {
        [today]: {
          selected: true,
          customStyles: {
            container: {
              backgroundColor: theme.main,
            },
            text: {
              color: theme.white,
            },
          },
        },
      }
      Object.keys(scheduleAll).forEach(item => {
        const temp = {
          marked: true,
          dotColor: theme.secondary,
        }
        item == today ? (tempMarkedDates[item] = {...tempMarkedDates[item], temp}) : (tempMarkedDates[item] = temp)
      })

      setMarkedDates(tempMarkedDates)
    }
  }, [scheduleAll])

  return (
    <CalendarList
      horizontal={true}
      // Enable paging on horizontal, default = false
      pagingEnabled={true}
      // Set custom calendarWidth.
      calendarWidth={Dimensions.get('window').width - 20}
      theme={{
        arrowColor: theme.gray700,
        // 위에 title
        textMonthFontWeight: undefined,
        textMonthFontFamily: 'Pretendard-Bold',

        // 달력 날짜들
        textDayFontWeight: undefined,
        textDayFontFamily: 'Pretendard-Bold',

        // 요일들
        textDayHeaderFontWeight: undefined,
        textDayHeaderFontFamily: 'Pretendard-Bold',

        todayTextColor: theme.main,
        dayTextColor: theme.gray800,
        monthTextColor: theme.gray800,
        textSectionTitleColor: theme.gray800,
        selectedDayTextColor: theme.gray800,
      }}
      headerStyle={{flexDirection: 'column'}}
      style={{marginHorizontal: 0, paddingHorizontal: 0}}
      hideArrows={false}
      minDate={'2012-01-01'}
      maxDate={undefined}
      onDayPress={day => {
        if (markedDates != undefined) {
          setSelectedDate(day.dateString)
          const isIn = markedDates[day.dateString] // 이미 marked dates state에 있는지
          if (isIn) {
            setCurrentDate({
              [day.dateString]: {
                ...markedDates[day.dateString],
                selected: true,
                selectedColor: theme.gray200,
              },
            })
          } else {
            setCurrentDate({
              [day.dateString]: {
                selected: true,
                selectedColor: theme.gray200,
              },
            })
          }
        }
      }}
      onVisibleMonthsChange={day => {
        if (markedDates != undefined) {
          if (day[0].dateString == today) {
            setSelectedDate(today)
          } else {
            setSelectedDate(day[0].dateString.slice(0, 7) + '01')
          }
          setCurrentDate({
            [day[0].dateString]: {
              ...markedDates[day[0].dateString],
              selected: true,
              selectedColor: theme.gray200,
            },
          })
        }
      }}
      onMonthChange={day => {
        if (markedDates != undefined) {
          if (day.dateString == today) {
            setSelectedDate(today)
          } else {
            setSelectedDate(day.dateString.slice(0, 7) + '01')
          }
          setCurrentDate({
            [day.dateString]: {
              ...markedDates[day.dateString],
              selected: true,
              selectedColor: theme.gray200,
            },
          })
        }
      }}
      monthFormat={'yyyy.MM'}
      hideExtraDays={true}
      renderArrow={direction => (direction == 'left' ? <LeftArrowCalendarIcon /> : <RightArrowCalendarIcon />)}
      showWeekNumbers={false}
      onPressArrowLeft={subtractMonth => subtractMonth()}
      onPressArrowRight={addMonth => addMonth()}
      disableAllTouchEventsForDisabledDays={true}
      enableSwipeMonths={false}
      markedDates={{...markedDates, ...currentDate}}
      markingType={'custom'}
    />
  )
}
