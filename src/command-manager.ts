import * as core from '@actions/core'
import {EOL} from 'os'
import {spawn, execSync} from 'child_process'

export interface ICommandManager {
  run(command: string, args: string[]): Promise<any>
  runSync(command: string, args: string[]): string | Buffer
}

export const createCommandManager = (workspace: string): ICommandManager => {
  return new CommandManager(workspace)
}

class CommandManager implements ICommandManager {
  private readonly workspace: string
  constructor(workspace: string) {
    this.workspace = workspace
  }

  async run(command, args): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {cwd: this.workspace})
      let isDone = false
      const errorMessages: any[] = []
      child.on('error', (error) => {
        core.error(error)
        if (!isDone) {
          isDone = true
          reject(error)
        }
      })

      child.stderr.on('data', (chunk) => errorMessages.push(chunk))
      child.on('exit', (code) => {

        if (isDone) return

        if (code === 0) {
          void resolve(errorMessages)
        } else {
          core.error(`${command} ${args.join(', ')}`)
          const error = new Error(
            `${errorMessages.join('')}${EOL}${command} exited with code ${code}`
          )
          reject(error)
        }
      })
    })
  }

  runSync(command, args): string {
    const fullCommand = [command, ...args].join(' ')
    return execSync(fullCommand, {encoding: 'utf8', timeout: 10000}).toString()
  }
}
