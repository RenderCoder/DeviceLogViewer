const tagIt = (tag, tagLength) => {
    const tagMaxLength = tagLength || 12 // 预定义 tag 字符串最大长度
    const padString = ' ' // 前后填充字符
    const padStartLength = Math.floor((tagMaxLength - tag.length)/2)
    const padEndLength = tagMaxLength - tag.length - padStartLength

    // console.log(padStartLength, tag.length, padEndLength)

    tag = tag.padStart(padStartLength + tag.length, padString)
    // console.log(tag)
    tag = tag.padEnd(tagMaxLength, padString)
    // console.log(tag)
    tag = `[ ${tag} ]`
    return tag
}

const test = () => {
    console.log(tagIt('xxs'))
    console.log(tagIt('hello, world'))
    console.log(tagIt('ok'))
    console.log(tagIt('bijiabo'))
}
// test()

module.exports = tagIt