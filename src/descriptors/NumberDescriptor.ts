import * as convertBuffer from '../converter'
import { LengthChunk } from '../descriptor-types'
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
}
