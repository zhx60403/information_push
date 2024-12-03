import axios from 'axios'

import options from '../options.js'

const { originUrl, feishuBotKey } = options

const botUrl = `https://open.feishu.cn/open-apis/bot/v2/hook/${feishuBotKey}`

const listToText = list => {
  return list
    .map(
      ({ href, title }) =>
        `标题：${title} /n 地址：<a href=${originUrl}${href}>点我跳转</a> /n`
    )
    .join('/n')
}

const listToRichText = list => {
  const content = []
  const obj = {
    post: {
      zh_cn: {
        title: '🐏毛来了',
        content: [content]
      }
    }
  }
  list.forEach(({ href, title: text }) => {
    content.push({
      tag: 'a',
      text,
      href: `${originUrl}${href}`
    })
  })

  return {
    msg_type: 'post',
    content: obj
  }
}

const listToCardData = list => ({
  msg_type: 'interactive',
  card: {
    type: 'template',
    data: {
      template_id: 'AAqjzST5WylIf',
      template_version_name: '1.0.1',
      card_header_title: '羊毛来啦~',
      template_variable: {
        information_list: list.map(({ href, title: text }) => ({
          text,
          href: `${originUrl}${href}`
        }))
      }
    }
  }
})

const msgTypeGetParamsMap = {
  text: listToText,
  richText: listToRichText,
  card: listToCardData
}

export const send = (msgList, msgType = 'card') => {
  const params = msgTypeGetParamsMap[msgType](msgList)

  // console.log('# params ->', JSON.stringify(content))
  return axios
    .post(botUrl, params)
    .then(({ data }) => {
      console.log('# push result ->', data)
    })
    .catch(({ code, status }) => {
      console.error('# 推送到飞书出现错误', code, status)
    })
}
