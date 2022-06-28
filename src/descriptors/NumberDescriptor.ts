import * as convertBuffer from '../converter'
import { LengthChunk, StopConditionChunk } from '../descriptor-types'
import { FilterKeys } from '../utils'

const CHAR_LENGTH = 1
const SHORT_LENGTH = 2
const INT_LENGTH = 4
const DOUBLE_LENGTH = 8

export function describeNumberBase<Format>(
  name: FilterKeys<Format, number | undefined>,
  length: number,
  debug?: boolean
): LengthChunk<Format, number> {
  return {
    type: 'length',
    name,
    debug: debug || false,
    length,
    transform: convertBuffer.toNumber,
  }
}

const SHORT_MAX_VALUE = 32767
const UNSIGNED_SHORT_MAX_VALUE = 65536
const INT_MAX_VALUE = 2147483647
const UNSIGNED_INT_MAX_VALUE = 4294967296
const decodeVarInt = (b: Buffer) => b.reduceRight((acc, curr) => 128 * (acc - 1) + curr, 1)
export function describeVariableNumberBase<Format>(
  name: FilterKeys<Format, number | undefined>,
  maxLength: 'short' | 'int',
  debug?: boolean
): StopConditionChunk<Format, number> {
  return {
    type: 'stop_condition',
    name,
    stopCondition: (buffer: Buffer) => {
      const bufferToNum = convertBuffer.toNumber(buffer)
      if (maxLength === 'short' && buffer.length > 3)
        throw new Error('Data exceeds maximum length of VarShort')
      if (maxLength === 'int' && buffer.length > 5) throw new Error('Data exceeds maximum length of VarInt')
      const hasNext = (bufferToNum & 0b10000000) > 0
      return !hasNext
    },
    debug: debug || false,
    transform: (b: Buffer) => {
      const dec = decodeVarInt(b)
      return maxLength === 'short' && dec > SHORT_MAX_VALUE
        ? dec - UNSIGNED_SHORT_MAX_VALUE
        : maxLength === 'int' && dec > INT_MAX_VALUE
        ? dec - UNSIGNED_INT_MAX_VALUE
        : dec
    },
  }
}

export const DescribeNumber = {
  int: <F>(name: FilterKeys<F, number | undefined>, debug?: boolean) =>
    describeNumberBase<F>(name, INT_LENGTH, debug),
  short: <F>(name: FilterKeys<F, number | undefined>, debug?: boolean) =>
    describeNumberBase<F>(name, SHORT_LENGTH, debug),
  double: <F>(name: FilterKeys<F, number | undefined>, debug?: boolean) =>
    describeNumberBase<F>(name, DOUBLE_LENGTH, debug),
  char: <F>(name: FilterKeys<F, number | undefined>, debug?: boolean) =>
    describeNumberBase<F>(name, CHAR_LENGTH, debug),
  customLength: describeNumberBase,
  varNumber: <F>(name: FilterKeys<F, number | undefined>, debug?: boolean) =>
    describeVariableNumberBase<F>(name, 'short', debug),
}
