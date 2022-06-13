import { LengthChunk, SubDescriptorChunk } from '../descriptor-types'
import * as transformBuffer from '../converter'
import { DescribeNumber } from './NumberDescriptor'
import { FilterKeys } from '../utils'

export interface StringSubFormat {
  length: number
  text: string
}

export const describeFixedLengthString = <Format>(
  name: FilterKeys<Format, string>,
  length: number,
  debug?: boolean
): LengthChunk<Format, string> => ({
  type: 'length',
  name,
  length,
  transform: transformBuffer.toText,
  debug: debug || false,
})

export const describeVariableLengthString = <Format>(
  name: FilterKeys<Format, string>,
  valueFrom: keyof Format,
  debug?: boolean
): LengthChunk<Format, string> => ({
  type: 'length',
  name,
  transform: transformBuffer.toText,
  debug: debug || false,
  length: {
    valueFrom,
    transform: transformBuffer.toNumber,
  },
})

export const describeStringSubFormat = <Format>(
  name: FilterKeys<Format, string>,
  length = 2,
  debug?: boolean
): SubDescriptorChunk<Format, StringSubFormat, string> => ({
  name,
  type: 'sub_descriptor',
  subDescriptor: [
    DescribeNumber.customLength('length', length), //<br/>
    describeVariableLengthString('text', 'length'),
  ],
  transform: subFormat => subFormat.text,
  debug: debug || false,
})

export const DescribeString = {
  fixed: describeFixedLengthString,
  variable: describeVariableLengthString,
  chunk: describeStringSubFormat,
}
