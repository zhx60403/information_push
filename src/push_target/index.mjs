import { send as sendToBotForFeishu } from './feishu.mjs'
import { send as sendToSystemForBark } from './system_bark.mjs'

const exportObj = { sendToBotForFeishu, sendToSystemForBark }

export default exportObj