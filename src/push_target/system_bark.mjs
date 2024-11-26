import qs from 'qs'
import axios from 'axios'

import options from '../options.js'

const { originUrl, barkKey } = options

const pushUrl = 'https://api.day.app'

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

const reqFunc = data => {
  const querys = { ...setupData(data), ...defaultPushOptions }

  const arr = barkKey.map(key => {
    const url = `${pushUrl}/${key}${qs.parse(querys, { addQueryPrefix: true })}`

    return axios.get(url).then(({ data }) => {
      console.log('# push result ->', { key, ...data })
    })
  })
  return Promise.allSettled(arr)
}

const toRunReqArr = reqArr => {
  if (!reqArr.length) return

  let index = 0
  const { func, args } = reqArr[index]

  const promiseThenFunc = () => {
    index += 1
    const reqObj = reqArr[index]
    if (reqObj) {
      const { func, args } = reqObj
      return func(args).then(promiseThenFunc)
    }
    return new Promise(resolve => {
      resolve()
    })
  }
  return func(args).then(promiseThenFunc)
}

export const send = msgList => {
  const reqArr = msgList.map(i => ({ func: reqFunc, args: i }))
  toRunReqArr(reqArr)
}
