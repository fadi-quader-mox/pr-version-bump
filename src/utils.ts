import {existsSync} from 'fs'
import * as path from 'path'

export async function getPackageJson(): Promise<never> {
  const originalGitHubWorkspace = process.env['GITHUB_WORKSPACE'] || './'
  const pathToPackage = path.join(originalGitHubWorkspace, 'package.json')
  if (!existsSync(pathToPackage))
    throw new Error("package.json could not be found in your project's root.")

  // @ts-ignore
  return import(pathToPackage, {assert: {type: 'json'}})
}
