import * as core from '@actions/core'
import {EOL} from 'os'
import {spawn} from 'child_process'

export class WorkspaceEnv {
  private readonly workspace: string
  constructor(workspace: string) {
    this.workspace = workspace
  }

  async run(command, args): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {cwd: this.workspace})
      let isDone = false
      const errorMessages: any[] = []
      child.on('error', error => {
        core.error(error)
        if (!isDone) {
          isDone = true
          reject(error)
        }
      })
      child.stderr.on('data', chunk => errorMessages.push(chunk))
      child.on('exit', code => {
        if (!isDone) {
          if (code === 0) {
            void resolve(null)
          } else {
            const error = new Error(
              `${errorMessages.join(
                ''
              )}${EOL}${command} exited with code ${code}`
            )
            reject(error)
          }
        }
      })
    })
  }

  async setGithubUsernameAndPassword(
    username: string,
    email: string
  ): Promise<void> {
    await Promise.all([
      this.run('git', ['config', 'user.name', `"${username}"`]),
      this.run('git', ['config', 'user.email', `"${email}"`])
    ])
  }
}
