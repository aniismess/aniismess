const WEATHER_API_KEY = process.env.WEATHER_API_KEY

import fs from 'fs'
import got from 'got'
import Qty from 'js-quantities/esm'
import { formatDistance } from 'date-fns'

let WEATHER_DOMAIN = 'http://dataservice.accuweather.com'

const emojis = {
  1: '☀️',
  2: '☀️',
  3: '🌤',
  4: '🌤',
  5: '🌤',
  6: '🌥',
  7: '☁️',
  8: '☁️',
  11: '🌫',
  12: '🌧',
  13: '🌦',
  14: '🌦',
  15: '⛈',
  16: '⛈',
  17: '🌦',
  18: '🌧',
  19: '🌨',
  20: '🌨',
  21: '🌨',
  22: '❄️',
  23: '❄️',
  24: '🌧',
  25: '🌧',
  26: '🌧',
  29: '🌧',
  30: '🥵',
  31: '🥶',
  32: '💨',
}

// Cheap, janky way to have variable bubble width
const dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
}

// Time working at PlanetScale
const today = new Date()
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
  today
)

const psTime = formatDistance(new Date(2022, 7, 1), today, {
  addSuffix: false,
})

// Today's weather
const locationKey = '204411' // YOU NEED TO REPLACE THIS WITH YOUR ACTUAL ACCUWEATHER LOCATION KEY
let url = `forecasts/v1/daily/1day/${locationKey}?apikey=${WEATHER_API_KEY}`

got(url, { prefixUrl: WEATHER_DOMAIN })
  .then((response) => {
    let json = JSON.parse(response.body)

    const degF = Math.round(json.DailyForecasts[0].Temperature.Maximum.Value)
    const degC = Math.round(Qty(`${degF} tempF`).to('tempC').scalar)
    const icon = json.DailyForecasts[0].Day.Icon

    fs.readFile('template.svg', 'utf-8', (error, data) => {
      if (error) {
        return
      }

      data = data.replace('{degF}', degF)
      data = data.replace('{degC}', degC)
      data = data.replace('{weatherEmoji}', emojis[icon])
      data = data.replace('{psTime}', psTime)
      data = data.replace('{todayDay}', todayDay)
      data = data.replace('{dayBubbleWidth}', dayBubbleWidths[todayDay])

      data = fs.writeFile('chat.svg', data, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
    })
  })
  .catch((err) => {
    // TODO: something better
    console.log(err)
  })
