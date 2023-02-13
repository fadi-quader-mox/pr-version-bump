import { execSync } from 'child_process';

import {ICommandManager} from './command-manager'

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

  diffFiles(base: string, head: string, extension?: string): string[] {
    const extensionFilter = extension ? `-- '***.${extension}'` : ''

    const changedFiles = this.commandManager.runSync('git', [
      'diff',
      base,
      head,
      extensionFilter,
      '--name-only',
      '--ignore-all-space',
      '--ignore-blank-lines'
    ])
    console.log('changedFiles ', changedFiles)
    return []
  }
}
