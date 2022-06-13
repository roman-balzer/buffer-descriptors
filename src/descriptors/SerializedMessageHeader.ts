import * as convertBuffer from '../converter'
import { LengthChunk, SubDescriptorChunk } from '../descriptor-types'

interface HiHeader {
  msgId: number
  lengthBytes: number
}
export interface SerializedMessageHeader {
  hiHeader: HiHeader
  contentLength: number
}
export type SerializedMessageHeaderFlat = HiHeader & Omit<SerializedMessageHeader, 'hiHeader'>

export interface SerializedMessage {
  header: SerializedMessageHeaderFlat
}

const HiHeaderDescriptor: LengthChunk<SerializedMessageHeader, any> = {
  type: 'length',
  name: 'hiHeader',
  length: 2,
  transform: (buffer: Buffer) => {
    const asNumber = convertBuffer.toNumber(buffer)
    const lengthBytes = asNumber & 0b0000_0000_0000_0011
    const msgId = (asNumber & 0b1111_1111_1111_1100) >> 2
    return { msgId, lengthBytes } as HiHeader
  },
}

const MessageLength: LengthChunk<SerializedMessageHeader, any> = {
  type: 'length',
  name: 'contentLength',
  length: {
    valueFrom: 'hiHeader',
    transform: (buffer: Buffer) => {
      const asNumber = convertBuffer.toNumber(buffer)
      const lenType = asNumber & 0b0000_0000_0000_0011
      return lenType
    },
  },
  transform: (buffer: Buffer) => convertBuffer.toNumber(buffer),
}

export const DescribeSerializedMessageHeader: SubDescriptorChunk<
  any,
  SerializedMessageHeader,
  SerializedMessageHeaderFlat
> = {
  type: 'sub_descriptor',
  name: 'header',
  subDescriptor: [HiHeaderDescriptor, MessageLength],
  transform: obj => ({ ...obj.hiHeader, contentLength: obj.contentLength }),
}
