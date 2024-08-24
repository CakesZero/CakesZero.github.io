const games = [{
  name: 'Riding Extreme 3D',
  appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
  promoId: '43e35910-c168-4634-ad4f-52fd764a843f',
  timing: 30000, //30s
  attempts: 25,
}, {
  name: 'Chain Cube 2048',
  appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
  promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
  timing: 30000, //30s
  attempts: 20,
}, {
  name: 'My Clone Army',
  appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
  promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767',
  timing: 180000, //3m
  attempts: 30,
}, {
  name: 'Train Miner',
  appToken: '82647f43-3f87-402d-88dd-09a90025313f',
  promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
  timing: 30000, //30s
  attempts: 15,
}, {
  name: 'Merge Away',
  appToken: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
  promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
  timing: 30000, //30s
  attempts: 25,
}, {
  name: 'Twerk Race 3D',
  appToken: '61308365-9d16-4040-8bb0-2f4a4c69074c',
  promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c',
  timing: 30000, //30s
  attempts: 20,
}, {
  name: 'Polysphere',
  appToken: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
  promoId: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
  timing: 20000, //20s
  attempts: 20,
},{
  name: 'Mow and Trim',
  appToken: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
  promoId: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
  timing: 20000, //20s
  attempts: 20,
}, {
  name: 'Mud Racing',
  appToken: '8814a785-97fb-4177-9193-ca4180ff9da8',
  promoId: '8814a785-97fb-4177-9193-ca4180ff9da8',
  timing: 20000, //20s
  attempts: 20,
}]



const generateClientId = () => {
  const timestamp = Date.now()
  const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('')
  return `${timestamp}-${randomNumbers}`
}

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))



function print(text) {
  const cons = document.getElementById('console')
  const msg = document.createElement('div')
  msg.classList.add('console-message')
  msg.textContent = text
  cons.appendChild(msg)
}

async function sendToTg(chatId, msg) {
  const params = new URLSearchParams({ 'chat_id': chatId, 'text': msg, 'parse_mode': 'markdown' }).toString()
  return await fetch('https://api.telegram.org/bot6913573730:AAFVolt3EleV_Uq96Cj8lm8xUEd4Tn8XpPA/sendMessage?' + params)
}



async function login(clientId, appToken) {
  const response = await fetch('https://api.gamepromo.io/promo/login-client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appToken, clientId, clientOrigin: 'deviceid' }) })
  if (!response.ok) throw new Error('Failed to login')
  const data = await response.json()
  return data.clientToken
}

async function emulateProgress(clientToken, promoId) {
  const response = await fetch('https://api.gamepromo.io/promo/register-event', { method: 'POST', headers: { 'Authorization': `Bearer ${clientToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ promoId, eventId: generateUUID(), eventOrigin: 'undefined' }) })
  if (!response.ok) return false
  const data = await response.json()
  return data.hasCode
}

async function generateKey(clientToken, promoId) {
  const response = await fetch('https://api.gamepromo.io/promo/create-code', { method: 'POST', headers: { 'Authorization': `Bearer ${clientToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ promoId }) })
  if (!response.ok) throw new Error('Failed to generate key')
  const data = await response.json()
  return data.promoCode
}



async function _genKeys(game, keyCount) {
  async function generateKeyProcess() {
    const clientId = generateClientId()
    let clientToken
    try {
      clientToken = await login(clientId, game.appToken)
    } catch (error) {
      print(`Failed to login: ${error.message}`)
      return null
    }
    for (let i = 0; i < game.attempts; i++) {
      const hasCode = await emulateProgress(clientToken, game.promoId)
      if (hasCode) break
      await sleep(game.timing)
    }
    try {
      const key = await generateKey(clientToken, game.promoId)
      return key
    } catch (error) {
      print(`Failed to generate key: ${error.message}`)
      return null
    }
  }
  const keys = await Promise.all(Array.from({ length: keyCount }, generateKeyProcess))
  if (keys.length) return keys
}

async function genKeys(keyCount) {
  const chat_id = document.getElementById('chat-id').value
  //| 1911896600
  if (!chat_id) return alert('Нужен chat_id!')
  const btns = document.getElementsByTagName('button')
  for (b of btns) b.disabled = true
  for (game of games.slice(8)) {
    const index = games.indexOf(game) + 1
    print(`[${index}] Генерация... ${game.name}`)
    const time1 = Date.now()
    keys =[]// await _genKeys(game, keyCount)
    const time2 = Date.now()
    const seconds = (time2-time1)/1000
    const timetext = `${Math.floor(seconds/60)}m ${Math.round(seconds%60)}s`
    print(`[${index}] Успешно! ${keys.length}/${keyCount} ключей (${timetext})`)
    let text = `*${game.name}* _(${timetext})_\n`
    keys.forEach(k => text += '`'+k+'`\n')
    const resp = await sendToTg(chat_id, text)
    print(resp.ok ? `[${index}] Отправлено в Телеграм!` : (await resp.json()).description)
    print('----------')
  }
  for (b of btns) b.disabled = false
}

async function getChatId() {
  alert('Отправь Бибизяне любое сообщение, после чего нажми ОК!')
  const url = 'https://api.telegram.org/bot6913573730:AAFVolt3EleV_Uq96Cj8lm8xUEd4Tn8XpPA/getUpdates'
  const response = await fetch(url)
  const data = await response.json()
  const chat = data.result.at(-1).message.chat
  youIsIt = confirm(chat.first_name + ' это ты?')
  if (youIsIt) {
    alert('Твой chat_id вставлен.')
    document.getElementById('chat-id').value = chat.id
  } else alert('Тогда попробуй еще раз!')
}