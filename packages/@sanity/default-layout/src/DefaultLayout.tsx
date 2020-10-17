import {Box, Card, Flex} from '@sanity/ui'
import absolutes from 'all:part:@sanity/base/absolutes'
import AppLoadingScreen from 'part:@sanity/base/app-loading-screen'
import {RouteScope, useRouterState} from 'part:@sanity/base/router'
import userStore from 'part:@sanity/base/user'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import {ActionModal} from './actionModal'
import {Sidecar} from './sidecar/Sidecar'
import {NavbarContainer} from './navbar'
import {SchemaErrorReporter} from './schemaErrors/SchemaErrorReporter'
import {SideMenu} from './sideMenu'
import {RenderTool} from './tool'
import {Tool, User} from './types'
import {getNewDocumentModalActions} from './util/getNewDocumentModalActions'

import styles from './DefaultLayout.css'

interface Props {
  tools: Tool[]
}

const Navbar = styled(Card)`
  position: relative;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-bottom: 1px solid var(--card-hairline-soft-color);
  }
`

function DefaultLayout(props: Props) {
  const {tools} = props
  const routerState = useRouterState()
  const [createMenuIsOpen, setCreateMenuIsOpen] = useState(false)
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [searchIsOpen, setSearchIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const loadingScreenElementRef = useRef<HTMLDivElement | null>(null)

  const handleAnimationEnd = useCallback(() => {
    setShowLoadingScreen(false)
  }, [])

  const handleCreateButtonClick = useCallback(() => {
    setCreateMenuIsOpen(val => !val)
  }, [])

  const handleActionModalClose = useCallback(() => {
    setCreateMenuIsOpen(false)
  }, [])

  const handleToggleMenu = useCallback(() => {
    setMenuIsOpen(val => !val)
  }, [])

  const handleSwitchTool = useCallback(() => {
    setMenuIsOpen(false)
  }, [])

  const handleSearchOpen = useCallback(() => {
    setSearchIsOpen(true)
  }, [])

  const handleSearchClose = useCallback(() => {
    setSearchIsOpen(false)
  }, [])

  const handleClickCapture = useCallback(
    event => {
      // Do not handle click if the event is not within DefaultLayout (portals)
      const rootTarget = event.target.closest('[data-sanity-layout]')
      if (!rootTarget) return

      if (menuIsOpen) {
        // Close SideMenu if the user clicks outside
        const menuTarget = event.target.closest('[data-sanity-side-menu-container]')
        if (!menuTarget) {
          event.preventDefault()
          event.stopPropagation()
          handleToggleMenu()
        }
      }
    },
    [handleToggleMenu, menuIsOpen]
  )

  // Subscribe to current user
  useEffect(() => {
    const sub = userStore.currentUser.subscribe(event =>
      setUser(event.type === 'snapshot' ? event.user : null)
    )

    return () => {
      sub.unsubscribe()
    }
  }, [])

  // Subscribe to `animationend`
  useEffect(() => {
    const loadingScreenElement = loadingScreenElementRef.current

    if (loadingScreenElement && showLoadingScreen) {
      loadingScreenElement.addEventListener('animationend', handleAnimationEnd, false)
    }

    return () => {
      if (loadingScreenElement) {
        loadingScreenElement.removeEventListener('animationend', handleAnimationEnd, false)
      }
    }
  }, [handleAnimationEnd, showLoadingScreen])

  // Set loaded state after first render
  useEffect(() => {
    if (!loaded) setLoaded(true)
  }, [loaded])

  const loadingScreenHidden = loaded || document.visibilityState === 'hidden'

  return (
    <SchemaErrorReporter>
      {() => (
        <Flex
          className={styles.root}
          data-sanity-layout=""
          direction="column"
          onClickCapture={handleClickCapture}
        >
          {showLoadingScreen && (
            <div
              className={styles.loadingScreen}
              hidden={loadingScreenHidden}
              ref={loadingScreenElementRef}
            >
              <AppLoadingScreen text="Restoring Sanity" />
            </div>
          )}

          <Navbar>
            <NavbarContainer
              tools={tools}
              createMenuIsOpen={createMenuIsOpen}
              onCreateButtonClick={handleCreateButtonClick}
              onToggleMenu={handleToggleMenu}
              onSwitchTool={handleSwitchTool}
              searchIsOpen={searchIsOpen}
              // eslint-disable-next-line react/jsx-handler-names
              onUserLogout={userStore.actions.logout}
              onSearchOpen={handleSearchOpen}
              onSearchClose={handleSearchClose}
            />
          </Navbar>

          <div data-sanity-side-menu-container="">
            <SideMenu
              activeToolName={routerState?.tool}
              isOpen={menuIsOpen}
              onClose={handleToggleMenu}
              // eslint-disable-next-line react/jsx-handler-names
              onSignOut={userStore.actions.logout}
              onSwitchTool={handleSwitchTool}
              tools={tools}
              user={user}
            />
          </div>

          <Flex flex={1}>
            <Box className={styles.toolContainer} flex={1}>
              <RouteScope scope={routerState?.tool}>
                <RenderTool tool={routerState?.tool} />
              </RouteScope>
            </Box>

            <div className={styles.sidecarContainer}>
              <Sidecar />
            </div>
          </Flex>

          {createMenuIsOpen && (
            <ActionModal onClose={handleActionModalClose} actions={getNewDocumentModalActions()} />
          )}

          {absolutes.map((Abs, i) => (
            <Abs key={String(i)} />
          ))}
        </Flex>
      )}
    </SchemaErrorReporter>
  )
}

export default DefaultLayout
