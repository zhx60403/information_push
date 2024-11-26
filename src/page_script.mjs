import axios from 'axios'
import * as cheerio from 'cheerio'

// import puppeteer from 'puppeteer'
// import playwright from 'playwright'

function fetchHTML(url) {
  try {
    return axios.get(url).then(({ data }) => data)
  } catch (error) {
    console.error(`无法获取 URL：${error}`)
  }
}

// const browser = await puppeteer.launch()
// const page = await browser.newPage()
// await page.goto(url)
// const sidebar = await page.locator(sidebarId)
// const img = await page.screenshot({ path: 'screenshot.png' })
// await browser.close()

const getInformationOfPage = url => {
  // 主要内容 .mainbox 榜单 .bangdan
  // TODO: 对主要内容和榜单做区分

  const mainClass = '.mainbox'
  const rankClass = '.bangdan'
  const sidebarId = '#sidebar'
  const newPostListClass = '.new-post'
  const articleItemClass = '.article-list'

  const getAttrList = ['href', 'title']

  return fetchHTML(url).then(html => {
    const $ = cheerio.load(html)
    const newPostListSelector = `${newPostListClass}`

    // const newPostList = $(sidebarId).find(newPostListSelector).children()
    const newPostList = $(newPostListSelector).children()

    if (newPostList.length) {
      const list = []
      newPostList.each((_, element) => {
        element.children.forEach(item => {
          if (Array.isArray(item.children) && item.children.length) {
            const listItemElement = item.children[item.children.length - 1]

            if (!listItemElement) return
            const obj = {}
            getAttrList.forEach(attrKey => {
              const val = listItemElement?.attribs?.[attrKey]
              if (val) obj[attrKey] = val
            })

            list.push(obj)
          }
        })
      })
      return list
    }
    return []
  }).catch(({ code, status }) => {
    console.error('# 获取页面错误', code, status)
  })
}

export default getInformationOfPage