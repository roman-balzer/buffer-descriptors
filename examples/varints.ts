import { Describe, parseBuffer, BufferDescriptor } from '../src/index'

var buf = Buffer.from([0xff, 0xff, 0x1, 1, 0b0011])

buf.length // ?

interface NumberList {
  length: number
  first: number
  second: number
  rest: number
  rest2: number
}

const NumberListDescriptor: BufferDescriptor<NumberList> = [
  Describe.number.varNumber('length'),
  Describe.number.varNumber('first')
]

const x = parseBuffer(buf, NumberListDescriptor) // ?
x
