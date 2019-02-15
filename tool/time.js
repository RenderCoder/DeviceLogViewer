const moment = require("moment")
require("moment-timezone")

const time = {
    get now() {
        return new Date()
    },
    get stringForNow() {
        const currentTime = moment()
            .tz("Asia/Shanghai")
            .format("YYYY/MM/DD HH:mm:ss")
        return currentTime
    },
}

// console.log(time.stringForNow)
module.exports = time