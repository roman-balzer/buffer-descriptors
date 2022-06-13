interface ChunkTemplate<Format> {
  name: keyof Format
  debug?: boolean
  condition?: ConditionField<Format>
}

export interface ConditionField<Format> {
  dependingOn: keyof Format //
  check: (buffer: Buffer) => boolean
}

export interface VariableLength<Format> {
  valueFrom: keyof Format
  transform: (buffer: Buffer) => number
}

/**
 * This chunk describes a buffer with a certain length. This *length* must be a number or an object
 * which describes which previous chunk contains the length to use. The name of the previous chunk
 * and how to transform it to an number can be provided in the *length* field.
 */
export interface LengthChunk<Format, Result> extends ChunkTemplate<Format> {
  type: 'length'
  transform?: (buffer: Buffer) => Result
  length: number | VariableLength<Format>
}

/**
 * This chunk describes a buffer which represents an array with a certain amount. This *amount* must
 * be a number or an object which describes which previous chunk contains the amout to use.
 * Since it's an its an array type, a descriptor (not chunk) has to be provided for the elements contained in the array.
 */
export interface ArrayChunk<Format, ArrayFormat, Result> extends ChunkTemplate<Format> {
  type: 'array'
  arrayFormat: BufferDescriptor<ArrayFormat>
  amount: number | VariableLength<Format>
}

/**
 * This chunk describes a Buffer whose Descriptor is depending on a previous chunk. The transform
 * function will return a Descriptor, which will be used inside a SubDescriptorChunk
 */
export interface DescriptorLookupChunk<Format> extends ChunkTemplate<Format> {
  type: 'descriptor_lookup'
  lookup: {
    descriptorFrom: keyof Format
    transform: (buffer: Buffer) => BufferDescriptor<any> | undefined
  }
}

/**
 * This chunk describes a SubDescriptor. For instance a StringSubFormat with length and text field.
 */
export interface SubDescriptorChunk<Format, SubFormat, Result> extends ChunkTemplate<Format> {
  type: 'sub_descriptor'
  subDescriptor: BufferDescriptor<SubFormat>
  transform?: (obj: SubFormat) => Result
}

/**
 * This descriptor will  grow until the stopCondition function returns true.
 */
export interface StopConditionChunk<Format, Result> extends ChunkTemplate<Format> {
  type: 'stop_condition'
  stopCondition: (b: Buffer) => boolean
  transform: (b: Buffer) => Result
}

// Any type here is okay here
export type ChunkDescriptor<T> =
  | LengthChunk<T, any>
  | SubDescriptorChunk<T, any, any>
  | DescriptorLookupChunk<T>
  | ArrayChunk<T, any, any>
  | StopConditionChunk<T, any>

export type BufferDescriptor<T> = ChunkDescriptor<T>[]
