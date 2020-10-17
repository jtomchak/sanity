import {UserAvatar} from '@sanity/base/components'
import {Button} from '@sanity/ui'
import classNames from 'classnames'
import React from 'react'
import {ToolMenu} from '../navbar/toolMenu/ToolMenu'
import {DatasetSelect} from '../datasetSelect'
import {Tool, User} from '../types'
import {HAS_SPACES} from '../util/spaces'

import styles from './SideMenu.css'

interface Props {
  activeToolName: string | null
  isOpen: boolean
  onClose: () => void
  onSignOut: () => void
  onSwitchTool: () => void
  tools: Tool[]
  user: User
}

function SideMenu(props: Props) {
  const {activeToolName, isOpen, onClose, onSignOut, onSwitchTool, tools, user} = props
  const tabIndex = isOpen ? 0 : -1

  return (
    <div className={classNames(styles.root, isOpen && styles.isOpen)}>
      <div>
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.userProfile}>
              <div className={styles.userAvatarContainer}>
                <UserAvatar size={1} userId="me" />
              </div>
              <div className={styles.userProfileText}>{user?.name || user?.email}</div>
            </div>

            <div className={styles.closeButtonContainer}>
              <Button
                icon="close"
                // icon={CloseIcon}
                mode="bleed"
                onClick={onClose}
                padding={2}
                tabIndex={tabIndex}
                title="Close menu"
              />
            </div>
          </div>

          {HAS_SPACES && (
            <div className={styles.datasetSelectContainer}>
              <DatasetSelect isVisible={isOpen} />
            </div>
          )}
        </div>

        <div className={styles.toolSwitcher}>
          <ToolMenu
            activeToolName={activeToolName}
            direction="vertical"
            isVisible={isOpen}
            onSwitchTool={onSwitchTool}
            tools={tools}
          />
        </div>

        <div className={styles.menuBottom}>
          <div className={styles.signOutButton}>
            <Button
              icon="leave"
              // icon={LeaveIcon}
              mode="bleed"
              onClick={onSignOut}
              tabIndex={tabIndex}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideMenu
