const load = document.getElementById('load')
const root = document.getElementById('root')

const screenMain = document.getElementById('screen-main')
const screenProfile = document.getElementById('screen-profile')
const screenList = document.getElementById('screen-list')
const screenTgAuth = document.getElementById('tg-auth')
const screenTgInfo = document.getElementById('tg-info')

const buttonProfile = document.getElementById('button-profile')
buttonProfile.onclick = () => {
    if (screenProfile.hidden) {
        screenMain.hidden = true
        screenList.hidden = true
        screenProfile.hidden = false
    } else {
        screenProfile.hidden = true
        screenList.hidden = true
        screenMain.hidden = false
    }
}




// TELEGRAM CLIENT
async function tgInit() {
    if (tg.checkLogin()) {
        const isAuth = await tg.auth()
        if (!isAuth) return alert('ошибка')
        load.remove()
        screenTgAuth.hidden = true
        screenTgInfo.hidden = false
        pagesInit()
        const user = tg.user
        const userName = document.getElementById('user-name')
        userName.textContent = user.firstName
    } else {
        load.remove()
        screenTgInfo.hidden = true
        screenTgAuth.hidden = false
        const authSubmit = document.getElementById('auth-submit')
        const authStatus = document.getElementById('auth-status')
        authSubmit.onclick = async () => {
            authSubmit.disabled = true
            const apiId = parseInt(document.getElementById('auth-api-id').value)
            const apiHash = document.getElementById('auth-api-hash').value
            const phone = document.getElementById('auth-phone').value
            const password = document.getElementById('auth-password').value
            const getCode = () => new Promise(resolve => {
                const code = document.getElementById('auth-code')
                code.disabled = false
                authSubmit.disabled = false
                const oldHandler = authSubmit.onclick
                authSubmit.onclick = () => {
                    authSubmit.disabled = true
                    authSubmit.onclick = oldHandler
                    resolve(code.value)
                }
            })
            try {
                const result = await tg.login(apiId, apiHash, phone, password, getCode)
                console.log(result)
                authSubmit.disabled = false
            } catch (err) {
                authStatus.textContent = err.message
                authSubmit.disabled = false
            }
        }
    }
}


function pagesInit() {
    const buttonList = document.getElementById('button-list')
    buttonList.onclick = () => {
        if (screenList.hidden) {
            screenMain.hidden = true
            screenProfile.hidden = true
            screenList.hidden = false
        } else {
            screenList.hidden = true
            screenProfile.hidden = true
            screenMain.hidden = false
        }
    }

    const selectHamster = document.getElementById('select-hamster')
    screenMain.innerHTML = '<h1>Выберите игру</h1>'
    selectHamster.onclick = async () => {
        const pageHamster =
            `<div id="page-hamster" class="page">
                <h1>Hamster Kombat</h1>
                <button id="hamster-start">Старт</button>
                <div id="hamster-log"></div>
            </div>`
        screenMain.innerHTML = pageHamster

        const hamsterStart = document.getElementById('hamster-start')
        const hamsterLog = document.getElementById('hamster-log')
        hamsterStart.onclick = async () => {
            hamsterStart.disabled = true
            console.log('hamster start')
            await hamster(msg => hamsterLog.innerHTML += `<p>${msg}</p>`)
            hamsterStart.disabled = false
            console.log('hamster stop')
        }
    }
}
