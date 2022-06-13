import { TextDecoder } from "util"

export const toHexString = (arr: Uint8Array) => {
  const numArr = toNumberArray(arr)
  const strHexArr = numArr.map(num => {
    const str = num.toString(16)
    return str.length < 2 ? '0' + str : str
  })
  return strHexArr.join('').toUpperCase()
}

export const toString = (arr: Uint8Array) => {
  let utf8decoder = new TextDecoder()
  return utf8decoder.decode(arr)
}

export const toNumberArray = (arr: Uint8Array) => {
  const collector: number[] = []
  arr.forEach(num => collector.push(num))
  return collector
}
