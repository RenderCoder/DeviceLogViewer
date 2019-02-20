const WebSocket = require('ws')
const color = require('colors-cli')
require('colors-cli/toxic')
const logContent = require('./log')

const port = 3333
const wss = new WebSocket.Server({ port })

const setup = () => {
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            // console.log('received: %s', message)
            let tags = ['APP']
            let content = ''
            try {
                message = JSON.parse(message)
                let currentType = ''
                switch (message.topic) {
                    case '/thing/properties':
                        currentType = 'Device Props'
                        content = `${JSON.stringify(message.data.items).green}    ${JSON.stringify(message.data)}`
                        break;
                
                    default:
                        currentType = message.topic
                        content = message
                        break;
                }
                tags.push(currentType)
            } catch (error) {
                content = error
                tags.push('Parse JSON Error')
            }
            logContent(content, tags)
        })

        // ws.send('something')
    })

    console.log('[Start]'.green.bold, ` Websocket server at port:${port}`)
}

module.exports = {
    setup,
}
