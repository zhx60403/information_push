import ora from 'ora'
import inquirer from 'inquirer'
import cloneDeep from 'lodash/cloneDeep.js'

import { originUrl, sendChoices } from './base.mjs'
import sendList from './push_target/index.mjs'
import pageScript from './page_script.mjs'

let isInited = false
let pushPlatform = []
const send = list => {
  pushPlatform.forEach(key => {
    sendList[key](list)
  })
}

let oldList = []

const filterOldList = list =>
  list.filter(({ href }) => !oldList.some(i => i.href === href))

let filterKeyword = ''
const filterListByKeyword = list =>
  list.filter(
    ({ title }) => title && filterKeyword.some(i => title.includes(i))
  )

const main = () => {
  pageScript(originUrl).then(list => {
    let pushList = filterOldList(list)
    if (filterKeyword) pushList = filterListByKeyword(pushList)

    if (pushList.length) {
      oldList = [...oldList, ...cloneDeep(pushList)]
      isInited && send(pushList)
      isInited = true
    }
  })
}

const startTask = () => {
  // TODO: 随机刷新时间，防止检测
  const refreshTimeList = [5000, 8000, 10000, 20000]

  main()
  setInterval(() => {
    main()
  }, 10000)
}

const taskOption = [
  {
    type: 'checkbox',
    name: 'choices',
    message: '请选择一个推送平台：',
    choices: sendChoices
  },
  {
    type: 'input',
    name: 'keyword',
    message:
      '请输入过滤关键字，多个关键字用 | 分开，例如：京东|淘宝|拼多多，默认为空：',
    default: ''
  }
]

const spinner = ora('推送任务运行中...')
spinner.color = 'yellow'

inquirer.prompt(taskOption).then(({ choices, keyword }) => {
  pushPlatform = choices
  filterKeyword = keyword.split('|')
  spinner.start()
  startTask()
})
