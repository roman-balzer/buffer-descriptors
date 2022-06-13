import { BufferDescriptor, ArrayChunk, SubDescriptorChunk } from '../descriptor-types'
import * as convertBuffer from '../converter'
import { DescribeNumber } from './NumberDescriptor'
import { recursivlyTransformBuffer } from '../functions'
import { FilterKeys } from '../utils'

export function describeFixedArray<Format, ArrayFormat>(
  name: FilterKeys<Format, Array<any>>,
  amount: number,
  arrayFormat: BufferDescriptor<ArrayFormat>,
  debug?: boolean
): ArrayChunk<Format, ArrayFormat, ArrayFormat[]> {
  return {
    type: 'array',
    name,
    debug: debug || false,
    amount,
    arrayFormat,
  }
}
export function describeVariableArray<Format, ArrayFormat>(
  name: FilterKeys<Format, Array<any>>,
  arrayFormat: BufferDescriptor<ArrayFormat>,
  valueFrom: keyof Format,
  debug?: boolean
): ArrayChunk<Format, ArrayFormat, ArrayFormat[]> {
  return {
    type: 'array',
    name,
    debug: debug || false,
    amount: { valueFrom, transform: convertBuffer.toNumber },
    arrayFormat,
  }
}

export interface ArrayChunkDesc<T> {
  arrayLength: number
  array: Array<T>
}
export function describeArraySubChunk<Format, ArrayFormat>(
  name: FilterKeys<Format, Array<any>>,
  format: BufferDescriptor<ArrayFormat>,
  length: 'short' | 'int',
  debug?: boolean
): SubDescriptorChunk<Format, ArrayChunkDesc<ArrayFormat>, ArrayFormat[]> {
  return {
    type: 'sub_descriptor',
    name,
    debug: debug || false,
    subDescriptor: [
      length === 'int' ? DescribeNumber.int('arrayLength') : DescribeNumber.short('arrayLength'),
      {
        type: 'array',
        name: 'array',
        arrayFormat: format,
        amount: {
          valueFrom: 'arrayLength',
          transform: convertBuffer.toNumber,
        },
      },
    ],
    transform: arrayDef => arrayDef.array,
  }
}

interface ArrayFromFixedLengthBufferSubFormat<T> {
  bufferLength: number
  array: Array<T>
}
// This is the same as a VariableLengthArray, on the contrary to the amount of element, the length of the
// overall buffer is known, and since the format of the elements, do not describe a fixed length
// the amount cannot be calculated, and therefore the buffer has to be looped recursivly.
export function describeFixedLengthBufferUnknownAmountArray<Format, EntryFormat>(
  name: FilterKeys<Format, Array<any>>,
  format: BufferDescriptor<EntryFormat>,
  override?: {
    transformVariableLength?: (buffer: Buffer) => number
  },
  debug?: boolean
): SubDescriptorChunk<Format, ArrayFromFixedLengthBufferSubFormat<EntryFormat>, EntryFormat[]> {
  return {
    type: 'sub_descriptor',
    name,
    debug: debug || false,
    subDescriptor: [
      DescribeNumber.int('bufferLength'),
      {
        type: 'length',
        name: 'array',
        transform: (b: Buffer) => recursivlyTransformBuffer(b, format),
        length: {
          valueFrom: 'bufferLength',
          transform: override?.transformVariableLength || convertBuffer.toNumber,
        },
      },
    ],
    transform: arrayDef => arrayDef.array,
  }
}

export const DescribeArray = {
  fixed: describeFixedArray,
  variable: describeVariableArray,
  chunk: describeArraySubChunk,
  fromFixedLength: describeFixedLengthBufferUnknownAmountArray,
}
