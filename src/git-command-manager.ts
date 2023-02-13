import {execSync} from 'child_process'

import {ICommandManager} from './command-manager'

const FILE_PATH_REGEX = /(\/[a-zA-Z_0-9-]+)+\.graphql/

export class GitCommandManager {
  private readonly commandManager: ICommandManager
  constructor(commandManager: ICommandManager) {
    this.commandManager = commandManager
  }

  async fetch(): Promise<void> {
    await this.commandManager.run('git', ['fetch'])
  }

  async setGithubUsernameAndPassword(
    username: string,
    email?: string
  ): Promise<void> {
    const ghEmail = email || `${username}@users.noreply.github.com`

    await Promise.all([
      this.commandManager.run('git', ['config', 'user.name', `"${username}"`]),
      this.commandManager.run('git', ['config', 'user.email', `"${ghEmail}"`])
    ])
  }

  async checkout(ref): Promise<void> {
    await this.commandManager.run('git', [
      'checkout',
      ref,
      '--progress',
      '--force'
    ])
  }

  async commit(msg: string): Promise<void> {
    await this.commandManager.run('git', ['commit', '-a', '-m', `${msg}`])
  }

  async push(ref: string): Promise<void> {
    await this.commandManager.run('git', ['push', ref])
  }

  diffFiles(ref: string, extension?: string): string[] {
    const extensionFilter = extension ? `-- '***.${extension}'` : ''

    const changedFiles = this.commandManager.runSync('git', [
      'diff',
      ref,
      '--stat',
      '--ignore-all-space',
      '--ignore-blank-lines',
      extensionFilter
    ])

    return changedFiles
      .toString()
      .split('\n')
      .map((ln) => {
        const matchedText = ln.match(FILE_PATH_REGEX)
        return matchedText?.shift() || ''
      }) // ex: src/graphql/user.graphql | 2 ++
      .filter(Boolean)
  }
}
