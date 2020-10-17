import {Button, Tooltip} from '@sanity/ui'
import classNames from 'classnames'
import config from 'config:sanity'
import {StateLink, useRouterState} from 'part:@sanity/base/router'
import * as sidecar from 'part:@sanity/default-layout/sidecar?'
import React, {createElement} from 'react'
import {DatasetSelect} from '../datasetSelect'
import {Tool} from '../types'
import {HAS_SPACES} from '../util/spaces'
import {Branding} from './branding'
import {LoginStatus} from './loginStatus'
import {PresenceMenu} from './presenceMenu'
import {DocumentSearch} from './search'
import {SanityStatusContainer} from './studioStatus'
import {ToolMenu} from './toolMenu'

import styles from './Navbar.css'

interface Props {
  createMenuIsOpen: boolean
  onCreateButtonClick: () => void
  onSearchClose: () => void
  onSearchOpen: () => void
  onSetLoginStatusElement: (element: HTMLDivElement) => void
  onSetSearchElement: (element: HTMLDivElement) => void
  onSwitchTool: () => void
  onToggleMenu: () => void
  onUserLogout: () => void
  searchIsOpen: boolean
  showLabel: boolean
  showToolMenu: boolean
  tools: Tool[]
}

const TOUCH_DEVICE = 'ontouchstart' in document.documentElement

// eslint-disable-next-line complexity
export default function Navbar(props: Props) {
  const {
    createMenuIsOpen,
    onCreateButtonClick,
    onToggleMenu,
    onSwitchTool,
    onUserLogout,
    onSearchOpen,
    // onSearchClose,
    onSetLoginStatusElement,
    onSetSearchElement,
    tools,
    searchIsOpen,
    showLabel,
    showToolMenu
  } = props
  const routerState = useRouterState()
  const rootState = HAS_SPACES && routerState.space ? {space: routerState.space} : {}
  const className = classNames(styles.root, showToolMenu && styles.withToolMenu)
  const searchClassName = classNames(styles.search, searchIsOpen && styles.searchIsOpen)

  return (
    <div className={className} data-search-open={searchIsOpen}>
      <div className={styles.hamburger}>
        <Button
          aria-label="Open menu"
          icon="menu"
          mode="bleed"
          onClick={onToggleMenu}
          padding={2}
          title="Open menu"
          // tone="navbar"
        />
      </div>
      <div className={styles.branding}>
        <StateLink state={rootState} className={styles.brandingLink}>
          <Branding projectName={config && config.project.name} />
        </StateLink>
      </div>
      {HAS_SPACES && (
        <div className={styles.datasetSelect}>
          <DatasetSelect isVisible={showToolMenu} tone="navbar" />
        </div>
      )}
      <div className={styles.createButton}>
        <Tooltip
          disabled={TOUCH_DEVICE}
          content={<span className={styles.createButtonTooltipContent}>Create new document</span>}
          portal
          // tone="navbar"
        >
          <Button
            aria-label="Create"
            icon="compose"
            mode="bleed"
            onClick={onCreateButtonClick}
            padding={3}
            selected={createMenuIsOpen}
            // tone="navbar"
          />
        </Tooltip>
      </div>
      <div className={searchClassName} ref={onSetSearchElement}>
        <div>
          <DocumentSearch
          // shouldBeFocused={searchIsOpen}
          // onOpen={onSearchOpen}
          // onClose={onSearchClose}
          />
        </div>
      </div>
      <div className={styles.toolSwitcher}>
        {tools.length > 1 && (
          <ToolMenu
            direction="horizontal"
            isVisible={showToolMenu}
            tools={tools}
            activeToolName={routerState.tool}
            onSwitchTool={onSwitchTool}
            showLabel={showLabel}
            // tone="navbar"
          />
        )}
      </div>
      <div className={styles.sanityStatus}>
        <SanityStatusContainer />
      </div>
      {sidecar && sidecar.isSidecarEnabled && sidecar.isSidecarEnabled() && (
        <div className={styles.helpButton}>
          {sidecar && createElement(sidecar.SidecarToggleButton)}
        </div>
      )}
      <div className={styles.presenceStatus}>
        <PresenceMenu />
      </div>
      <div className={styles.loginStatus} ref={onSetLoginStatusElement}>
        <LoginStatus onLogout={onUserLogout} />
      </div>
      <div className={styles.searchButton}>
        <Button
          icon="search"
          mode="bleed"
          onClick={onSearchOpen}
          padding={2}
          // tone="navbar"
        />
      </div>
    </div>
  )
}
