const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const color = require('colors-cli')
require('colors-cli/toxic')

const cache = {
    device: null,
    baudRate: null,
}

const interaction = {
    test: {
        schema: {
            type: 'list',
            name: 'keyName',
            message: 'Here is question for test: ',
            prefix: '@',
            choices: () => ['a', 'b', 'c', 'd'],
        },
        callback: res => {
            console.log(`select: ${JSON.stringify(res)}`)
            doInteraction(interaction.test2)
        },
    },
    test2: {
        schema: {
            type: 'list',
            name: 'keyName2',
            message: 'Here is question for test2: ',
            prefix: '@',
            choices: () => ['a', 'b', 'c', 'd'],
        },
        callback: res => {
            console.log(`select: ${JSON.stringify(res)}`)
            doInteraction(interaction.test)
        },
    },
}

// 批量添加 key，用于查询
Object.keys(interaction).map(key => interaction[key].key = key)

const doInteraction = interactionItem => {
    const interactionName = interactionItem.key
    const interactionConfig = interaction[interactionName]
    if (!interactionConfig) {
        console.log('[Error] ' + `No such interaction: ${interactionName}`)
        return
    }
    inquirer.prompt([interactionConfig.schema])
        .then(interactionConfig.callback)
}


// 开始业务逻辑
const commandLine = {}

// 开始显示选择项
commandLine.start = () => {
    doInteraction(interaction.test)
}

commandLine.setup = () => {
    commandLine.start()
}



commandLine.setup()