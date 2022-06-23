import * as convertBuffer from '../converter'
import {
  SubDescriptorChunk,
  LengthChunk,
  ChunkDescriptor,
  ConditionField,
  BufferDescriptor,
} from '../descriptor-types'
import { DescribeNumber } from './NumberDescriptor'
import { DescribeString } from './StringDescriptor'
import { DescribeArray } from './ArrayDescriptor'
import { DescribeSerializedMessageHeader } from './SerializedMessageHeader'
import { FilterKeys } from '../utils'

export function DescribeBooleanFormat<Format>(
  name: FilterKeys<Format, boolean>,
  debug?: boolean
): LengthChunk<Format, boolean> {
  return {
    type: 'length',
    name,
    debug: debug || false,
    length: 1,
    transform: buffer => convertBuffer.toNumber(buffer) >= 1,
  }
}

export interface UnknownTransformResult {
  asBoolean: boolean
  asNumber: number
  asString: string
  asHexString: string
}
export function DescribeUnknownFormat<Format>(
  name: keyof Format,
  length: number,
  debug?: boolean
): LengthChunk<Format, UnknownTransformResult> {
  return {
    type: 'length',
    name,
    debug: debug || false,
    length,
    transform: buffer => ({
      asBoolean: convertBuffer.toBoolean(buffer),
      asNumber: convertBuffer.toNumber(buffer),
      asString: convertBuffer.toText(buffer),
      asHexString: convertBuffer.toHexString(buffer),
    }),
  }
}

interface UnknownBufferSubFormat {
  length: number
  buffer: Buffer
}
export function DescribeUnknownBufferFormat<Format>(
  name: FilterKeys<Format, Buffer>,
  lengthTransform?: (b: Buffer) => number,
  debug?: boolean
): SubDescriptorChunk<Format, UnknownBufferSubFormat, Buffer> {
  return {
    type: 'sub_descriptor',
    name,
    debug: debug || false,
    subDescriptor: [
      DescribeNumber.int('length'),
      {
        type: 'length',
        name: 'buffer',
        transform: buffer => buffer,
        length: {
          valueFrom: 'length',
          transform: lengthTransform || convertBuffer.toNumber,
        },
      },
    ],
    transform: arrayDef => arrayDef.buffer,
  }
}

export function DescribeSubChunk<Format, Sub>(
  name: FilterKeys<Format, Buffer>,
  subDesc: BufferDescriptor<Sub>,
  debug?: boolean
): SubDescriptorChunk<Format, Sub, Buffer> {
  return {
    type: 'sub_descriptor',
    name,
    debug: debug || false,
    subDescriptor: subDesc,
  }
}

export const withCondition = <T>(descriptor: ChunkDescriptor<T>, condition: ConditionField<T>) => ({
  ...descriptor,
  condition,
})

export const Describe = {
  header: DescribeSerializedMessageHeader,
  number: DescribeNumber,
  string: DescribeString,
  chunk: DescribeSubChunk,
  boolean: DescribeBooleanFormat,
  array: DescribeArray,
  unknown: DescribeUnknownFormat,
  unknownBuffer: DescribeUnknownBufferFormat,
  withCondition,
}
