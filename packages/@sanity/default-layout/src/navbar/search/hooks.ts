import searchFn from 'part:@sanity/base/search'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {concat, of, Subject, timer} from 'rxjs'
import {distinctUntilChanged, catchError, map, mergeMapTo, switchMap} from 'rxjs/operators'
import {ResultItem} from './types'

const searchOrEmpty = (queryStr: string) => {
  return queryStr === '' ? of([]) : searchFn(queryStr)
}

interface State {
  data: ResultItem[]
  error: Error | null
  isLoaded: boolean
  isLoading: boolean
}

interface Search extends State {
  query: (searchTerm: string) => void
}

export function useSearch(): Search {
  const searchTermSubject = useMemo<Subject<string>>(() => new Subject<string>(), [])
  const [state, setState] = useState<State>({
    data: null,
    error: null,
    isLoaded: false,
    isLoading: false
  })

  useEffect(() => {
    const searchTerm$ = searchTermSubject.asObservable()
    const searchResults$ = searchTerm$.pipe(
      distinctUntilChanged(),
      switchMap((searchTerm: string) =>
        concat(
          of({data: null, error: null, isLoaded: false, isLoading: true}),
          timer(100).pipe(
            mergeMapTo(searchOrEmpty(searchTerm)),
            map((data: ResultItem[]) => ({data, error: null, isLoaded: true, isLoading: false}))
          )
        )
      ),
      catchError((error: Error, caught$) =>
        concat(of({data: null, error, isLoaded: false, isLoading: false}), caught$)
      )
    )

    const sub = searchResults$.subscribe(setState)

    return () => sub.unsubscribe()
  }, [searchTermSubject])

  const query = useCallback(
    (searchTerm: string) => {
      searchTermSubject.next(searchTerm)
    },
    [searchTermSubject]
  )

  return {...state, query}
}
