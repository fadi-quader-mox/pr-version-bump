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

  async diffFiles(): Promise<string[]> {
    const changedFiles = await this.commandManager.run('git', [
      'diff',
      '--ignore-all-space',
      '--ignore-blank-lines'
    ])
    return changedFiles as string[]
  }
}
