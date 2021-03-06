import React from 'react'
import documentStore from 'part:@sanity/base/datastore/document'
import {useObservable} from './utils/useObservable'

export function useDocumentOperation(publishedDocId, docTypeName) {
  return useObservable(
    React.useMemo(() => documentStore.pair.editOperations(publishedDocId, docTypeName), [
      publishedDocId,
      docTypeName
    ])
  )
}
