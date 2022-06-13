export const toNumber = (hexArr: Buffer) => hexArr.reduce((acc, curr) => (acc << 8) | curr)

export const toText = (buffer: Buffer) => buffer.toString('utf-8')

export const toHexString = (buffer: Buffer) => {
  let hexString = buffer.toString('hex')
  hexString = hexString.length > 24 ? hexString.substr(0, 24 - 1) + ' ...' : hexString
  return '0x' + hexString
}

export const toSegmentedHexString = (buffer: Buffer) => {
  let hexString = buffer.toString('hex')
  hexString = hexString.length > 24 ? hexString.substr(0, 24 - 1) + ' ...' : hexString
  return hexString
    .toUpperCase()
    .match(/.{1,2}/g)
    ?.join(' ')
}

export const toBoolean = (buffer: Buffer) => toNumber(buffer) >= 1
