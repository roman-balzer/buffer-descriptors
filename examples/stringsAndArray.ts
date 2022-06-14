import { Describe, parseBuffer, BufferDescriptor } from '../src/index'

var buf = Buffer.from([
  97, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0,
  98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98,
  99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99,
  100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100,
  101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101,
  102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102,
  0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0,
  98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98,
  99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99,
  100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100,
  101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101,
  102, 0, 98, 99, 100, 101, 102, 0, 98, 99, 100, 101, 102, 0,
])
var buf2 = Buffer.from([
  0, 4, 0, 5, 97, 98, 99, 100, 101, 0, 5, 97, 98, 99, 100, 101, 0, 5, 97, 98, 99, 100, 101, 0, 5, 97, 98, 99,
  100, 101, 0, 5, 97, 98, 99, 100, 101,
])
var buf3 = Buffer.from([
  0, 3, 0, 4, 0, 5, 97, 97, 97, 97, 97, 0, 5, 98, 98, 98, 98, 98, 0, 5, 99, 99, 99, 99, 99, 0, 5, 100, 100,
  100, 100, 100, 0, 4, 0, 5, 97, 97, 97, 97, 97, 0, 5, 98, 98, 98, 98, 98, 0, 5, 99, 99, 99, 99, 99, 0, 5,
  100, 100, 100, 100, 100, 0, 4, 0, 5, 97, 97, 97, 97, 97, 0, 5, 98, 98, 98, 98, 98, 0, 5, 99, 99, 99, 99, 99,
  0, 5, 100, 100, 100, 100, 100,
])

export interface ConsoleCommandsListMessage {
  aliases: Array<string>
  aliases2: Array<string>
  aliases3: string
  args: Array<string>
  descriptions: Array<string>
}

export const ConsoleCommandsListMessageDescriptor: BufferDescriptor<ConsoleCommandsListMessage> = [
  Describe.header,
  Describe.array.chunk('aliases', [Describe.string.chunk('aliases')], 'short'),
  Describe.array.chunk('args', [Describe.string.chunk('args')], 'short'),
  Describe.array.chunk('descriptions', [Describe.string.chunk('descriptions')], 'short'),
]

const k1 = [Describe.string.chunk('aliases')]
// const k2 = [Describe.array.chunk('aliases', [Describe.string.fixed('aliases', 2)], 'short')]

const k3 = [Describe.array.chunk('aliases', [Describe.string.chunk('aliases')], 'short')]
const k4 = [Describe.array.flattenedChunk('aliases', Describe.string.chunk('aliases'), 'short')]
const k5 = [
  Describe.array.flattenedChunk(
    'aliases',
    Describe.array.flattenedChunk('aliases2', Describe.string.chunk('aliases3'), 'short'),
    'short'
  ),
]

// parseBuffer(buf2, k1) // ?
// parseBuffer(buf2, k2)
// parseBuffer(buf2, k3) // ?
// parseBuffer(buf2, k4) // ?
parseBuffer(buf3, k5) // ?
