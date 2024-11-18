import axios from 'axios'

const botUrl =
  'https://open.feishu.cn/open-apis/bot/v2/hook/585188bd-d07a-4f2d-8091-2b974d7d66c6'

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
      href
    })
  })

  return obj
}
export const send = msgList => {
  const content = listToRichText(msgList)

  const params = {
    msg_type: 'post',
    content
  }

  // console.log('# params ->', JSON.stringify(content))
  return axios.post(botUrl, params).then(({ data }) => {
    console.log('# push result ->', data)
  })
}
