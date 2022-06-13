import { Describe, parseBuffer, BufferDescriptor } from '../src/index'

var buf = Buffer.from([97, 98, 99, 100, 101, 102, 0])

interface NumberList {
  length: number
  first: number
  second: number
  rest: number
  rest2: number
}

const NumberListDescriptor: BufferDescriptor<NumberList> = [
  Describe.number.char('length'),
  Describe.number.short('first'),
  Describe.number.char('second'),
  Describe.number.char('rest'),
  Describe.number.customLength('rest2', 2),
]

parseBuffer(buf, NumberListDescriptor) // ?
