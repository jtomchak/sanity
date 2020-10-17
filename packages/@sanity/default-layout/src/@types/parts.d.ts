/* eslint-disable import/export */

// import {Observable} from 'rxjs'
type Observable<T = any> = any

type Schema = {icon?: React.ComponentType; name: string; title: string}

declare module 'sanity:versions' {
  const versions: {[key: string]: string}
  export default versions
}

declare module 'config:sanity' {
  const config: {project: {basePath?: string; name?: string}}
  export const project: {basePath?: string; name?: string}

  export default config
}

declare module 'config:@sanity/default-layout' {
  const defaultLayoutConfig: {
    toolSwitcher?: {
      hidden?: string[]
      order?: string[]
    }
  }
  export default defaultLayoutConfig
}

/*
 * @sanity/default-layout
 */

declare module 'part:@sanity/default-layout/branding-style'

declare module 'part:@sanity/default-layout/sidecar?' {
  export const isSidecarEnabled: () => boolean | undefined
  export const SidecarLayout: React.ComponentType | undefined
  export const SidecarToggleButton: React.ComponentType | undefined
}

/*
 * @sanity/base
 */

declare module 'part:@sanity/base/app-loading-screen' {
  export {default} from '@sanity/base/src/components/AppLoadingScreen'
}

declare module 'all:part:@sanity/base/absolutes' {
  const components: React.ComponentType[]
  export default components
}

declare module 'part:@sanity/base/location' {
  export {default} from '@sanity/base/src/datastores/location'
}

declare module 'part:@sanity/base/login-wrapper?' {
  const LoginWrapper:
    | React.ComponentType<{
        LoadingScreen: React.ReactNode
      }>
    | undefined
  export default LoginWrapper
}

declare module 'part:@sanity/base/router' {
  export * from '@sanity/base/src/router'
}

declare module 'all:part:@sanity/base/tool' {
  const tools: {
    canHandleIntent?: (intent: any, params: any, state: any) => any
    component?: React.ComponentType
    getIntentState?: (intent: any, params: any, state: any, payload: any) => any
    name: string
    title: string
    router?: any
  }[]
  export default tools
}

declare module 'part:@sanity/base/user' {
  export * from '@sanity/base/src/datastores/user'
  export {default} from '@sanity/base/src/datastores/user'
}

declare module 'part:@sanity/base/settings' {
  const x: {
    forNamespace: (
      key: string
    ) => {
      forKey: (
        k: string
      ) => {
        listen: () => Observable<boolean>
        set: (val: boolean) => void
      }
    }
  }
  export default x
}

declare module 'part:@sanity/base/brand-logo?' {
  const BrandLogo: React.ComponentType | undefined
  export default BrandLogo
}

declare module 'part:@sanity/base/schema' {
  const schema: {
    _validation: {
      path: Array<string | number | {_key: string}>
      problems: {message: string; severity: string}[]
    }[]
    get: (name: string) => Schema
  }
  export default schema
}

declare module 'part:@sanity/base/schema?' {
  const schema:
    | {
        _validation: {
          path: Array<string | number | {_key: string}>
          problems: {message: string; severity: string}[]
        }[]
        get: (name: string) => Schema
      }
    | undefined
  export default schema
}

declare module 'part:@sanity/base/preview?' {
  const preview: React.ComponentType<{
    layout: 'default'
    status: React.ReactNode
    type: Schema
    value: any
  }>
  export default preview
}

declare module 'part:@sanity/base/util/draft-utils' {
  export * from '@sanity/base/src/util/draftUtils'
}

declare module 'part:@sanity/base/search' {
  export {default} from '@sanity/base/src/search'
}

declare module 'part:@sanity/base/version-checker' {
  export {default} from '@sanity/base/src/components/VersionChecker'
}

declare module 'part:@sanity/base/util/document-action-utils' {
  export * from '@sanity/base/src/actions/utils/legacy_documentActionUtils'
}

declare module 'part:@sanity/base/new-document-structure?' {
  const newDocumentStructure: any | undefined
  export default newDocumentStructure
}

declare module 'part:@sanity/base/client' {
  export {default} from '@sanity/base/src/client'
}

declare module 'part:@sanity/base/authentication-fetcher' {
  const fetcher: any
  export default fetcher
}
