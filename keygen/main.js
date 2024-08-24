const cons = document.getElementById('console')
const inpChatId = document.getElementById('chat-id')
const selGames = document.getElementById('games')
const btns = document.getElementsByTagName('button')


addOpt({ name: 'All Games' })
games.forEach(addOpt)
function addOpt(game) {
  const option = document.createElement('option')
  option.textContent = game.name
  option.value = game.name
  selGames.appendChild(option)
}


function print(text, isErr = false) {
  const msg = document.createElement('div')
  msg.classList.add('console-message')
  msg.textContent = text
  if (isErr) msg.style = 'color:red'
  cons.appendChild(msg)
}


async function sendToTg(chatId, msg) {
  const params = new URLSearchParams({ 'chat_id': chatId, 'text': msg, 'parse_mode': 'markdown' }).toString()
  return await fetch('https://api.telegram.org/bot6913573730:AAFVolt3EleV_Uq96Cj8lm8xUEd4Tn8XpPA/sendMessage?' + params)
}


async function genKeys(keyCount) {
  if (!keyCount) return print('Неверное кол-во ключей', true)
  if (!inpChatId.value) return print('Нужен chat_id!')
  
  selGames.disabled = true
  inpChatId.disabled = true
  for (b of btns) b.disabled = true
  
  if (selGames.value == 'All Games') games.forEach(start)
  else start(games.find(g => g.name == selGames.value))
  
  async function start(game) {
    const index = games.indexOf(game) + 1
    print(`[${index}] Генерация... ${game.name} (${keyCount})`)
    const time1 = Date.now()
    keys = await _genKeys(game, keyCount)
    const time2 = Date.now()
    const seconds = (time2-time1)/1000
    const timetext = `${Math.floor(seconds/60)}m ${Math.round(seconds%60)}s`
    print(`[${index}] ${keys.length}/${keyCount} ключей ${game.name} (${timetext})`)
    if (!keys.length) return
    let text = `*${game.name}* _(${timetext})_\n`
    keys.forEach(k => text += '`'+k+'`\n')
    const resp = await sendToTg(inpChatId.value, text)
    if (resp.ok) print(`[${index}] Отправлено в Телеграм!`)
    else print((await resp.json()).description, true)
  }
}


async function getChatId() {
  inpChatId.disabled = true
  const url = 'https://api.telegram.org/bot6913573730:AAFVolt3EleV_Uq96Cj8lm8xUEd4Tn8XpPA/getUpdates'
  const response = await fetch(url)
  const data = await response.json()
  const chat = data.result.at(-1).message.chat
  inpChatId.value = chat.id
  print(`Бибизяна будет отправлять ключи пользователю: "@${chat.username}"`)
  print('Чтобы Бибизяна отправлял ключи тебе, напиши Бибизяне любое сообщение и нажми "Получить" еще раз')
  inpChatId.disabled = false
}