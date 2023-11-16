import * as stackTrace from 'stack-trace'
import { format } from 'winston'
const { printf } = format

const getFileAndLineNumber = () => {
    try {
        throw new Error('Dummy error to find stack trace')
    } catch (e) {
        const trace = stackTrace.parse(e)
        const cwd = process.cwd().split('src')[0]

        // index 2 should skip over this function and its immediate caller to get to the original log call
        const file = trace[2]
            .getFileName()
            .replace(cwd, '')
            .replace('file:///', '')
        const line = trace[2].getLineNumber()
        return {
            file,
            line,
        }
    }
}

const fileFormat = printf(({ level, message, timestamp, meta }) => {
    let fileInfo = ''
    if (meta) {
        const { file, line } = meta
        fileInfo = `${file}:${line}`
    }
    return `[${level}]\t[${timestamp}]\t${fileInfo}\t${message}`
})

const consoleFormat = printf(({ level, message, meta }) => {
    let fileInfo = ''
    if (meta) {
        const { file, line } = meta
        fileInfo = `${file}:${line}`
    }
    return `[${level}]\t${fileInfo}\t${message}`
})

export { getFileAndLineNumber, fileFormat, consoleFormat }
