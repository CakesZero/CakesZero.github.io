const { Api, TelegramClient } = telegram
const { StringSession } = telegram.sessions

const tg = {
    checkLogin() {
        const apiId = localStorage.getItem('api_id')
        const apiHash = localStorage.getItem('api_hash')
        const session = localStorage.getItem('session')
        if (apiId && apiHash && session) return true
        else { console.log(apiId, apiHash, session); return false }
    },

    async login(apiId, apiHash, phoneNumber, password, getPhoneCode) {
        const stringSession = new StringSession('')
        const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, { connectionRetries: 5 })
        await client.start({
            phoneNumber: () => phoneNumber,
            password: () => password,
            phoneCode: async () => await getPhoneCode(),
            onError: err => { throw new Error(err) }
        })
        console.log('tg client logined')
        this.client = client
        const session = client.session.save()
        localStorage.setItem('api_id', apiId)
        localStorage.setItem('api_hash', apiHash)
        localStorage.setItem('session', session)
        return true
    },

    async auth() {
        const apiId = localStorage.getItem('api_id')
        const apiHash = localStorage.getItem('api_hash')
        const session = localStorage.getItem('session')
        const stringSession = new StringSession(session)
        const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, { connectionRetries: 5 })
        await client.start({ onError: err => { throw new Error(err) } })
        console.log('tg client logined')
        this.client = client
        const data = await client.getMe()
        this.user = { username: data.username, firstName: data.firstName, id: data.id }
        return true
    },

    async getHamsterToken() {
        const client = this.client
        const webView = await client.invoke(new Api.messages.RequestWebView({
            platform: 'android',
            peer: 'hamster_kombat_bot',
            bot: 'hamster_kombat_bot',
            url: 'https://hamsterkombatgame.io'
        }))
        const initDataRaw = (decodeURIComponent(webView.url.split('#tgWebAppData=')[1].split('&tgWebAppVersion')[0]))
        try {
            const response = await fetch('https://api.hamsterkombatgame.io/auth/auth-by-telegram-webapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initDataRaw })
            })
            const token = (await response.json()).authToken
            localStorage.setItem('hamster_token', token)
            return token
        } catch (err) {
            throw new Error(err)
        }
    }
}