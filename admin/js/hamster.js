// const { Api, TelegramClient } = telegram
// const { StringSession } = telegram.sessions
// 23070622
// 02c378a2f2985fbf469b4e82ee63cb55

async function hamster(print) {
    const tokenLS = localStorage.getItem('hamster_token')
    const token = tokenLS ? tokenLS : await tg.getHamsterToken()

    const accountInfo = (await getData('auth/account-info')).accountInfo
    const config = await getData('clicker/config')
    const upgrades = await getData('clicker/upgrades-for-buy')
    const tasks = (await getData('clicker/list-tasks')).tasks
    const clickerUser = (await getData('clicker/sync')).clickerUser

    let balance = Math.floor(clickerUser.balanceCoins)

    // ПРИВЕТ
    print(`Привет, ${accountInfo.name}.`)
    print(`Баланс: ${short(balance)}.`)
    // await sleep(DELAY)

    // ШИФР
    if (!config.dailyCipher.isClaimed) {
        const _cipher = config.dailyCipher.cipher
        const cipher = atob(_cipher.slice(0, 3) + _cipher.slice(4))
        const isClaimed = (await getData('clicker/claim-daily-cipher', { cipher })).dailyCipher.isClaimed
        if (isClaimed) print('Шифр: выполнено.')
        else print('Шифр: ошибка при выполнении.')
    }

    // МИНИ-ИГРА
    const _candles = config.dailyKeysMiniGames.Candles
    if (!_candles.isClaimed) {
        const cooldown = _candles.remainSecondsToNextAttempt
        const miniGameId = _candles.id
        if (cooldown > 0) {
            const delay = cooldown + 5 + Math.random() * 5
            print(`Мини-игра: ожидание КД ${Math.round(delay)}с...`)
            await sleep(delay * 1000)
        }
        print('Мини-игра: игра началась.')
        const candles = (await getData('clicker/start-keys-minigame', { miniGameId })).dailyKeysMiniGames
        const cipher = await getCipherMinigame(accountInfo.id, candles)
        const delay = Math.random() * 30 + 25
        print(`Мини-игра: эмуляци игры ${Math.round(Math.round(delay))}с...`)
        await sleep(delay * 1000)
        const isClaimed = (await getData('clicker/claim-daily-keys-minigame', { cipher, miniGameId })).dailyKeysMiniGames
        if (isClaimed.isClaimed) print('Мини-игра: выполнено.')
        else print('Мини-игра: ошибка при выполнении.')
    }

    // ЗАДАНИЕ
    for (const task of tasks) {
        if (!task.isCompleted) {
            const isCompleted = (await getData('clicker/check-task', { taskId: task.id })).task.isCompleted
            if (isCompleted) print('Задание: выполнено.')
            else print('Задание: ошибка при выполнении.')
        }
    }

    // КОМБО
    const myDailyCombo = upgrades.dailyCombo.upgradeIds
    if (myDailyCombo.length < 3) {
        const combo = DATA.combo
        const expires = Date.now() - (combo.expires * 1000)
        if (expires > 0) print(`Комбо: истекло ${Math.floor(expires / 1000 / 60)}м назад.`)
        else {
            const dailyComboIds = combo.combo.filter(id => (myDailyCombo.indexOf(id) < 0))
            const dailyCombo = upgrades.upgradesForBuy.filter(card => dailyComboIds.indexOf(card.id) > -1)
            for (const i in dailyCombo) {
                const card = dailyCombo[i]
                if (balance > card.price) {
                    if (card.cooldownSeconds > 0) {
                        const delay = card.cooldownSeconds + 5 + Math.random() * 5
                        print(`Комбо: ожидание КД "${card.name}" (${short(card.price)}) ${Math.round(delay)}s...`)
                        await sleep(delay * 1000)
                    } else {
                        print(`Комбо: покупка "${card.name}" (${short(card.price)})...`)
                        await getData('clicker/buy-upgrade', { timestamp: Date.now(), upgradeId: card.id })
                        balance -= card.price
                        print(`Баланс: ${short(balance)}.`)
                        if (i != dailyCombo.length - 1) await sleep(5000)
                        else {
                            const isClaimed = (await getData('clicker/claim-daily-combo')).dailyCombo.isClaimed
                            if (isClaimed) print('Комбо: выполнено.')
                            else print('Комбо: ошибка при выполнении.')
                        }
                    }
                } else print(`Комбо: недостаточно средств "${card.name}" (${short(card.price)}).`)
            }
        }
    }

    // ПРОМОКОД
    const getPromos = (await getData('clicker/get-promos'))
    const promos = getPromos.promos
    const states = getPromos.states
    const appTokens = DATA.games
    // print(states)

    for (const promo of promos) {
        const state = states.find(state => state.promoId == promo.promoId)

        const _appToken = appTokens.find(appToken => appToken.promoId == promo.promoId)
        const appToken = _appToken ? _appToken.appToken : promo.promoId

        const count = state ? (promo.keysPerDay - state.receiveKeysToday) : promo.keysPerDay

        if (count > 0) {
            print(`Промокод: генерация ${promo.title.en}...`)
            // const multiBar = new cliProgress.MultiBar({ clearOnComplete: true, hideCursor: true, format: '[{bar}] {a} {v}/{t}', })
            const keys = (await generatePromo(appToken, promo.promoId, count, { update: () => { } }))
            // multiBar.stop()
            for (const i in keys) {
                const promoCode = keys[i]
                if (promoCode) {
                    const data = (await getData('clicker/apply-promo', { promoCode }))
                    if (data.reward) print('Промокод: ключ активирован.')
                    else print(`Промокод: ошибка при активации: ${data.error_code}`)
                    if (i != keys.length - 1) await sleep((3 + Math.random() * 2) * 1000)
                }
            }
        }
    }

    print(`Пока, ${accountInfo.name}.`)





    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time))
    }

    function short(num) {
        let str = String(num)
        let l = str.length
        let a = Math.floor(l / 3)
        let b = l % 3
        let o = ['K', 'M', 'B']
        if (a > 0 && !(a == 1 && b == 0)) {
            if (b == 0) { b = 3; a-- }
            let c = str.slice(0, b)
            let d = str.slice(b, b + 2)
            let i = o.at(a - 1)
            let s = `${c}.${d}${i ? i : 'x' + a}`
            return s
        } else return str
    }

    async function getData(url, body = {}) {
        try {
            const response = await fetch('https://api.hamsterkombatgame.io/' + url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(body) })
            if (response.ok) return await response.json()
            else return response.ok
        } catch (err) {
            throw new Error(err)
        }
    }

    async function getCipherMinigame(userId, candles) {
        const score = 0
        const miniGameId = candles.id
        const timestamp = parseInt(String(new Date(candles.startDate).getTime()).slice(0, 10))
        const magicIndex = timestamp % 8
        let cStartDate = ''
        for (let i = 0; i < 10; i++) {
            if (i == magicIndex) cStartDate += '0'
            else cStartDate += String(Math.floor((Math.random() * 10)))
        }
        const cScore = (timestamp + score) * 2
        const hash = await crypto.subtle.digest("SHA-256", (new TextEncoder()).encode(`R1cHard_AnA1${cScore}G1ve_Me_y0u7_Pa55w0rD`))
        const sig = btoa(String.fromCharCode(...new Uint8Array(hash)))
        const data = `${cStartDate}|${userId}|${miniGameId}|${cScore}|${sig}`
        return btoa(data)
    }

    async function generatePromo(appToken, promoId, count) {
        const DELAY = 20000
        const ATTEMPTS = 20
        function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
        function generateClientId() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16) }) }
        async function login(clientId, appToken) {
            try {
                const response = await fetch('https://api.gamepromo.io/promo/login-client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appToken: appToken, clientId: clientId, clientOrigin: 'deviceid' }) })
                if (!response.ok) return
                const data = await response.json()
                return data.clientToken
            } catch (err) { return console.error(err) }
        }
        async function emulateProgress(clientToken, promoId) {
            try {
                const response = await fetch('https://api.gamepromo.io/promo/register-event', { method: 'POST', headers: { 'Authorization': `Bearer ${clientToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ promoId: promoId, eventId: generateClientId(), eventOrigin: 'undefined' }) })
                if (!response.ok) return
                const data = await response.json()
                return data.hasCode
            } catch (err) { return console.error(err) }
        }
        async function generateKey(clientToken, promoId) {
            try {
                const response = await fetch('https://api.gamepromo.io/promo/create-code', { method: 'POST', headers: { 'Authorization': `Bearer ${clientToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ promoId: promoId }) })
                if (!response.ok) return
                const data = await response.json()
                return data.promoCode
            } catch (err) { return console.error(err) }
        }
        async function keygen() {
            // const bar = multiBar.create(100, 0)
            const clientId = generateClientId()
            // bar.update(0, { v: 0, t: 1, a: 'Авторизация', })
            const clientToken = await login(clientId, appToken)
            if (!clientToken) return
            // bar.update(100, { v: 1, t: 1, a: 'Авторизация', })
            await sleep(DELAY)
            for (let i = 0; i < ATTEMPTS; i++) {
                // bar.update(100 / ATTEMPTS * (i + 1), { v: i + 1, t: ATTEMPTS, a: 'Эмуляция события' })
                const progress = await emulateProgress(clientToken, promoId)
                if (progress) break
                await sleep(DELAY)
            }
            await sleep(1000)
            // bar.update(0, { v: 0, t: 1, a: 'Генерация' })
            const key = await generateKey(clientToken, promoId)
            // bar.update(100, { v: 1, t: 1, a: 'Генерация' })
            return key
        }
        const keyPromises = []
        for (let i = 0; i < count; i++) {
            keyPromises.push(keygen())
            await sleep(1000)
        }
        const keys = await Promise.all(keyPromises)
        return keys
    }
}