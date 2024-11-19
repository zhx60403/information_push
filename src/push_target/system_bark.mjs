import axios from 'axios'

import { originUrl } from '../base.mjs'

const pushUrl = 'https://api.day.app/p7RW9jDEKC9uiR7P6QrNtf'

const defaultPushOptions = {
  level: 'passive',
  icon: 'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f411.png'
}

const setupData = data => {
  data.href = `${originUrl}${data.href}`
  data.body = data.title
  data.title = '羊毛提醒'
  return data
}

export const send = msgList => {
  msgList.forEach(i => {
    const params = { ...setupData(i), ...defaultPushOptions }

    return axios.get(pushUrl, { params }).then(({ data }) => {
      console.log('# push result ->', data)
    })
  })
}
