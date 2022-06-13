
# Buffer Descriptors

This library provides ways to describe the format of a buffers. 
These descriptors can be quite easy like describing number or strings with fixed or 
variable lengths, but also provides the possibility to describe quite complex ones, 
like arrays, subformats or stopConditions and lookups. 
The created descriptor can then be used to parse the buffers according to the descriptor.

## Installation

```bash
  npm install buffer-descriptors
```
    
## Usage/Examples

```typescript
import { BufferDescriptor, Describe, SerializedMessage, parseBuffer } from 'buffer-descriptors'
import { Channel } from '../somewhere'

export interface ChatMessage extends SerializedMessage {
  channel: Channel
  msg: string
  timestamp: number
  fingerprint: string
  senderId: number
  senderName: string
  prefix: string
  senderAccountId: number
}

export const ChatDescriptor: BufferDescriptor<ChatMessage> = [
  Describe.header,
  Describe.number.char('channel'), 
  Describe.string.subFormat('msg'),
  Describe.number.int('timestamp'),
  Describe.string.subFormat('fingerprint'),
  Describe.number.double('senderId'),
  Describe.string.subFormat('senderName'),
  Describe.string.subFormat('prefix'),
  Describe.number.int('senderAccountId'),
]

parseBuffer(myBuffer, ChatDescriptor)

```


## Documentation
### Predefined Descriptors
* Number
    * number.char
    * number.short
    * number.int
    * number.double
    * number.customLength
* String
    * string.fixed
    * string.variable
    * string.chunk - shortcut for length and string
* Array
    * array.fixed
    * array.variable
    * array.chunk  - shortcut for length and array
    * array.fromFixedLength - if needing actual length instead of amount
* boolean
* unknown
* unknownBuffer
* header - `{  msgId: number, lengthBytes: number, contentLength: number }`
* withCondition - wrapper to add conditions

### Write own descriptors

See `src/descriptors-types.ts` for docs on the different types of descriptors. Use these interfaces
to write your own descriptors. Or check `src/descriptors/*` for the predefined descriptors, to see
how these are written.


#### Example
```typescript
interface BufferWithString {
    stringLength: number
    myString: string
}

const StringLengthChunk: LengthChunk<BufferWithString, number> = {
  type: 'length',
  name: 'stringLength',
  transform: toNumber,
  length: 2,
}

const StringChunk: LengthChunk<BufferWithString, string> = {
  type: 'length',
  name: 'myString',
  transform: toText,
  length: {
    valueFrom: "stringLength",
    transform: toNumber,
  },
}

const dsc: BufferDescriptor<BufferWithString> = [StringLengthChunk, StringChunk]

```
## Optimizations

Feel free to open an issue, if you feel something is missing. 