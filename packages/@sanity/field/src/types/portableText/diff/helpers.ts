import {ArrayDiff, ObjectDiff, StringDiff} from '../../../diff'
import {startCase} from 'lodash'
import {ChildMap, PortableTextBlock, PortableTextChild, SpanTypeSchema} from './types'
import {SchemaType, ObjectSchemaType} from '../../../types'

export const UNKNOWN_TYPE_NAME = '_UNKOWN_TYPE_'

export function isPTSchemaType(schemaType: SchemaType) {
  return schemaType.jsonType === 'object' && schemaType.name === 'block'
}
export function isHeader(node: PortableTextBlock) {
  return !!node.style && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.style)
}

export function createChildMap(blockDiff: ObjectDiff, schemaType: ObjectSchemaType) {
  // Create a map from span to diff
  const block = (diffDidRemove(blockDiff)
    ? blockDiff.fromValue
    : blockDiff.toValue) as PortableTextBlock
  const childMap: ChildMap = {}
  const children = block.children || []
  children.forEach(child => {
    let summary: string[] = []
    // Fallback type for renderer (unkown types)
    if (typeof child !== 'object' || typeof child._type !== 'string') {
      child._type = UNKNOWN_TYPE_NAME
    }
    const cSchemaType = getChildSchemaType(schemaType.fields, child)
    const cDiff = findChildDiff(blockDiff, child)

    if (cDiff) {
      const textDiff = cDiff.fields.text as StringDiff
      if (textDiff && textDiff.isChanged) {
        if (textDiff.action === 'changed') {
          summary.push(`Changed '${textDiff.fromValue}' to  '${textDiff.toValue}'`)
        } else {
          const text = textDiff.toValue || textDiff.fromValue
          summary.push(
            `${startCase(textDiff.action)}${text ? '' : ' (empty) '} text ${
              text ? `'${text}'` : ''
            }`
          )
        }
      }
      if (isAddMark(cDiff, cSchemaType)) {
        const marks = cDiff.fields.marks.toValue
        summary.push(`Added mark ${(Array.isArray(marks) ? marks : []).join(', ')}`)
      }
      if (isAddAnnotation(cDiff, cSchemaType) || isRemoveAnnotation(cDiff, cSchemaType)) {
        const mark =
          (Array.isArray(cDiff.fields.marks.toValue) && cDiff.fields.marks.toValue[0]) || ''
        const type = (block.markDefs || []).find(def => def._key === mark)
        summary.push(`Added annotation to text '${child.text}' (${type ? type._type : 'unknown'})`)
      }
      if (isAddInlineObject(cDiff) || isChangeInlineObject(cDiff) || isRemoveInlineObject(cDiff)) {
        summary.push(`${startCase(cDiff.action)} inline object`)
      }
    }
    if (cDiff && summary.length === 0) {
      summary.push(`Unkown diff ${JSON.stringify(cDiff)}`)
    }

    childMap[child._key] = {
      diff: cDiff,
      child,
      schemaType: cSchemaType,
      summary
    }
  })
  return childMap
}

export function findChildDiff(diff: ObjectDiff, child: PortableTextChild): ObjectDiff {
  const childrenDiff = diff.fields.children as ArrayDiff
  return childrenDiff.items
    .filter(
      item => item.diff.isChanged && (item.diff.toValue === child || item.diff.fromValue === child)
    )
    .map(item => item.diff)
    .map(childDiff => childDiff as ObjectDiff)[0]
}

function isAddInlineObject(cDiff: ObjectDiff) {
  return (
    cDiff.type === 'object' &&
    cDiff.isChanged &&
    cDiff.action === 'added' &&
    cDiff.fromValue === undefined &&
    !childIsSpan(cDiff.toValue as PortableTextChild)
  )
}

function isChangeInlineObject(cDiff: ObjectDiff) {
  return (
    cDiff.type === 'object' &&
    cDiff.isChanged &&
    cDiff.action === 'changed' &&
    cDiff.fromValue !== undefined &&
    !childIsSpan(cDiff.toValue as PortableTextChild)
  )
}

function isRemoveInlineObject(cDiff: ObjectDiff) {
  return (
    cDiff.type === 'object' &&
    cDiff.isChanged &&
    cDiff.action === 'removed' &&
    cDiff.toValue === undefined &&
    !childIsSpan(cDiff.fromValue as PortableTextChild)
  )
}

export function isAddMark(cDiff: ObjectDiff, cSchemaType?: SchemaType) {
  if (!cSchemaType) {
    return false
  }
  return (
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'added' &&
    Array.isArray(cDiff.fields.marks.toValue) &&
    cDiff.fields.marks.toValue.length > 0 &&
    cSchemaType.jsonType === 'object' &&
    cDiff.fields.marks.toValue.some(
      mark => typeof mark === 'string' && cSchemaType && isDecorator(mark, cSchemaType)
    )
  )
}

export function isRemoveMark(cDiff: ObjectDiff, cSchemaType?: SchemaType) {
  if (!cSchemaType) {
    return false
  }
  return (
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'removed' &&
    Array.isArray(cDiff.fields.marks.fromValue) &&
    cDiff.fields.marks.fromValue.some(
      mark => typeof mark === 'string' && cSchemaType && isDecorator(mark, cSchemaType)
    )
  )
}

function isAddAnnotation(cDiff: ObjectDiff, cSchemaType?: SchemaType) {
  if (!cSchemaType) {
    return false
  }
  return (
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'added' &&
    Array.isArray(cDiff.fields.marks.toValue) &&
    cDiff.fields.marks.toValue.length > 0 &&
    cSchemaType.jsonType === 'object' &&
    cDiff.fields.marks.toValue.some(
      mark => typeof mark === 'string' && cSchemaType && !isDecorator(mark, cSchemaType)
    )
  )
}

function isRemoveAnnotation(cDiff: ObjectDiff, cSchemaType?: SchemaType) {
  if (!cSchemaType) {
    return false
  }
  return (
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'removed' &&
    cSchemaType.jsonType === 'object' &&
    cDiff.fields.marks.fromValue &&
    Array.isArray(cDiff.fields.marks.fromValue) &&
    typeof cDiff.fields.marks.toValue !== 'undefined' &&
    cDiff.fields.marks.fromValue.some(
      mark => typeof mark === 'string' && cSchemaType && !isDecorator(mark, cSchemaType)
    )
  )
}

function getChildSchemaType(fields: any[], child: PortableTextChild) {
  const childrenField = fields.find(f => f.name === 'children')
  const cSchemaType =
    (childrenField &&
      childrenField.type &&
      childrenField.type.jsonType === 'array' &&
      (childrenField.type.of.find(type => type.name === child._type) as ObjectSchemaType)) ||
    undefined
  return cSchemaType
}

export function diffDidRemove(blockDiff: ObjectDiff) {
  const childrenDiff = blockDiff.fields.children as ArrayDiff
  return (
    blockDiff.action === 'removed' ||
    (childrenDiff &&
      childrenDiff.items.some(
        item =>
          item.diff &&
          item.diff.action === 'removed' &&
          // Don't treat as removed if only marks are removed
          !(
            item.diff.type === 'object' &&
            Object.keys(item.diff.fields).length === 1 &&
            item.diff.fields.marks
          )
      ))
  )
}

export function getDecorators(spanSchemaType: SpanTypeSchema) {
  if (spanSchemaType.decorators) {
    return spanSchemaType.decorators
  }
  return []
}

export function isDecorator(name: string, schemaType: SpanTypeSchema) {
  return getDecorators(schemaType).some(dec => dec.value === name)
}

export function childIsSpan(child: PortableTextChild) {
  const isObject = typeof child === 'object'
  return isObject && typeof child._type === 'string' && child._type === 'span'
}

export function didChangeMarksOnly(diff: ObjectDiff) {
  const from = blockToText(diff.fromValue)
  const to = blockToText(diff.toValue)
  const childrenDiff = diff.fields.children as ArrayDiff
  const hasMarkDiffs =
    !!childrenDiff &&
    childrenDiff.items.every(
      item => item.diff.isChanged && item.diff.type === 'object' && item.diff.fields.marks
    )
  return from === to && hasMarkDiffs
}

export function blockToText(block, opts = {nonTextBehavior: 'remove'}) {
  if (!block) {
    return ''
  }
  return block.children.map(child => child.text || '').join('')
}

export function prepareDiffForPortableText(diff: ObjectDiff) {
  let _diff = {...diff} // Make a copy so we don't manipulate the original diff
  // Special condition when the only change is adding marks
  const onlyMarksAreChanged = didChangeMarksOnly(_diff)
  if (onlyMarksAreChanged) {
    const childrenItem = _diff.fields.children
    if (childrenItem && childrenItem.type === 'array') {
      childrenItem.items.forEach(item => {
        if (item.diff.type === 'object') {
          const itemDiff = item.diff as ObjectDiff
          Object.keys(itemDiff.fields).forEach(key => {
            if (key !== 'marks') {
              delete itemDiff.fields[key]
            }
          })
        }
      })
    }
  }
  return _diff
}
