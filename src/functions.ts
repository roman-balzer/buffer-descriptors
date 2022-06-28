import { BufferDescriptor } from './descriptor-types'
import { toHexString, toSegmentedHexString } from './converter'

function checkForDependency<T, K extends keyof T>(usedBuffers: T, dependency: K, dependent: K) {
  if (usedBuffers[dependency] === undefined) {
    throw new Error(
      `Dependency "${String(dependency)}" does not occur before "${String(dependent)}.  
      There is likely something wrong with the FormatSpecification"`
    )
  }
}

/**
 *
 * @param buffer
 * @param format
 * @returns [transformedContent , tail , currentPos]
 */
export function parseBuffer<T>(buffer: Buffer, format: BufferDescriptor<T>): [T, Buffer, number] {
  let prevChunksRaw = {} as { [key in keyof T]: Buffer }
  let prevChunksTransformed = {} as { [key in keyof T]: any }
  let currentPos = 0
  try {
    format.forEach(dsc => {
      if (dsc.debug) {
        console.log('# --------- DEBUG START aoe ---------')
        console.log('Debugging for entry', dsc)
        console.log(`Current position: ${currentPos} of ${buffer.length}`)
        // console.log('Current displayValues', transformedValues)
        console.log(`Buffer: ${toSegmentedHexString(buffer.subarray(0, 10))} ...`)
        console.log('# --------- PROCESSING ----------')
      }
      if (dsc.condition) {
        const { dependingOn, check } = dsc.condition
        checkForDependency(prevChunksRaw, dependingOn, dsc.name)
        if (!check(prevChunksRaw[dependingOn])) return
      }
      switch (dsc.type) {
        case 'length': {
          typeof dsc.length !== 'number' && checkForDependency(prevChunksRaw, dsc.length.valueFrom, dsc.name)
          const bufferLength =
            typeof dsc.length === 'number'
              ? dsc.length
              : dsc.length.transform(prevChunksRaw[dsc.length.valueFrom])

          const bufferToUse = buffer.slice(currentPos, currentPos + bufferLength)
          currentPos += bufferToUse.length
          if (bufferToUse.length > 0) {
            prevChunksRaw[dsc.name] = bufferToUse
            prevChunksTransformed[dsc.name] = dsc.transform
              ? dsc.transform(bufferToUse)
              : toHexString(bufferToUse)
          }
          break
        }
        case 'descriptor_lookup': {
          checkForDependency(prevChunksRaw, dsc.lookup.descriptorFrom, dsc.name)
          const descriptorToUse = dsc.lookup.transform(prevChunksRaw[dsc.lookup.descriptorFrom])
          if (!descriptorToUse) {
            // assuming empty field
            return
          }
          const bufferToUse = buffer.slice(currentPos, buffer.length)
          const [innerTransformedValues, bufferTail, endPos] = parseBuffer(bufferToUse, [
            {
              type: 'sub_descriptor',
              subDescriptor: descriptorToUse,
              name: dsc.name,
            },
          ])
          prevChunksTransformed[dsc.name] = innerTransformedValues[dsc.name]
          currentPos += endPos
          return
        }
        case 'sub_descriptor': {
          if (dsc.debug) {
            console.log('\t# --------- sub_descriptor START ---------')
            console.log('\tbuffer', buffer)
            console.log('\buffer.length', buffer.length)
            console.log('\bcurrentPos', currentPos)
            console.log('\t# --------- sub_descriptor END ----------')
          }
          const restBuffer = buffer.slice(currentPos, buffer.length)
          const [innerTransformedValues, bufferTail, endPos] = parseBuffer(restBuffer, dsc.subDescriptor)
          prevChunksTransformed[dsc.name] = dsc.transform
            ? dsc.transform(innerTransformedValues)
            : innerTransformedValues
          currentPos += endPos
          return
        }
        case 'array': {
          typeof dsc.amount !== 'number' && checkForDependency(prevChunksRaw, dsc.amount.valueFrom, dsc.name)
          const iterations =
            typeof dsc.amount === 'number'
              ? dsc.amount
              : dsc.amount.transform(prevChunksRaw[dsc.amount.valueFrom])

          let currPosInArrayBuffer = currentPos
          let bufferToUse = buffer.slice(currPosInArrayBuffer, buffer.length)
          let elementInArray = []
          for (let i = 0; i < iterations; i++) {
            const [innerTransformedValues, bufferTail, endPos] = parseBuffer(bufferToUse, dsc.arrayFormat)
            elementInArray.push(innerTransformedValues)
            currPosInArrayBuffer += endPos
            bufferToUse = bufferTail
          }
          prevChunksRaw[dsc.name] = buffer.slice(currentPos, currPosInArrayBuffer)
          currentPos = currPosInArrayBuffer
          prevChunksTransformed[dsc.name] = elementInArray
          break
        }
        case 'stop_condition': {
          let bufferLength = 1
          let takeBuffer = buffer.slice(currentPos, currentPos + bufferLength)
          console.log(`🚀TCL ~ file: functions.ts ~ line 115 ~ takeBuffer`, takeBuffer)
          while (dsc.stopCondition(takeBuffer) === false) {
            bufferLength++
            takeBuffer = buffer.slice(currentPos, currentPos + bufferLength)
            console.log(`🚀TCL ~ file: functions.ts ~ line 115 ~ takeBuffer`, takeBuffer)
          }
          prevChunksRaw[dsc.name] = takeBuffer
          currentPos += bufferLength
          prevChunksTransformed[dsc.name] = dsc.transform(takeBuffer)
          console.log(
            `🚀TCL ~ file: functions.ts ~ line 123 ~ prevChunksTransformed[dsc.name] `,
            prevChunksTransformed[dsc.name]
          )
          break
        }
        default:
          console.error('DescriptorSpec not supported: ', dsc)
          throw new Error('DescriptorSpec not supported: ' + JSON.stringify(dsc))
      }
      if (dsc.debug) {
        console.log('# Current displayValues - keys', Object.keys(prevChunksTransformed))
        console.log('# Current position', currentPos)
        console.log('# ---------- DEBUG END ----------')
      }
    })
  } catch (e) {
    console.error(e)
    throw e
  }
  const bufferTail = buffer.slice(currentPos, buffer.length)
  return [prevChunksTransformed, bufferTail, currentPos]
}

/**
 * This function loops through an Buffer, and transforms into values until the Buffer is empty and
 * returns an array with the transformed Values
 * @param buffer
 * @param format
 * @param transform
 * @returns Array<T> representing the transformed Values from the fixed Buffer
 */
export function recursivlyTransformBuffer<T>(
  buffer: Buffer,
  format: BufferDescriptor<T>,
  transform?: (transformedValue: T) => any
): Array<T> {
  let elementsInArray: T[] = []
  let bufferToUse = buffer
  while (bufferToUse.length > 0) {
    let [transformedValues, bufferTail] = parseBuffer<T>(bufferToUse, format)
    bufferToUse = bufferTail
    elementsInArray.push(transform ? transform(transformedValues) : transformedValues)
  }
  return elementsInArray
}
