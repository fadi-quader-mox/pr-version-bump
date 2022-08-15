import {existsSync, writeFileSync, appendFileSync} from 'fs'
import * as path from 'path'
import {EOL} from 'os'
import {execSync} from 'child_process'
import {SEM_VERSIONS} from './constants'

export async function getPackageJson(workspace: string): Promise<never> {
  const pathToPackage = path.join(workspace, 'package.json')
  if (!existsSync(pathToPackage))
    throw new Error("package.json could not be found in your project's root.")

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-require-imports,import/no-dynamic-require
  return require(pathToPackage)
}

export function writePackageJson(workspace: string, newPackageJson): void {
  const pathToPackage = path.join(workspace, 'package.json')
  if (!existsSync(pathToPackage))
    throw new Error("package.json could not be found in your project's root.")

  const content = `${JSON.stringify(newPackageJson, null, 2)}\n`
  writeFileSync(pathToPackage, content, 'utf8')
  // new line
  appendFileSync(pathToPackage, EOL, 'utf8')
  appendFileSync(pathToPackage, EOL, 'utf8')
}

export function getSemverLabel(labels: string[]): string {
  const versions = labels.filter((label) => SEM_VERSIONS.includes(label))
  if (versions.length !== 1) return ''

  return versions[0]
}

export function generateNewVersion(semverLabel): string {
  return execSync(`npm version --git-tag-version=false ${semverLabel}`)
    .toString()
    .trim()
    .replace(/^v/, '')
}

export function buildRemoteRepoURL(
  actor: string,
  token: string,
  repo: string
): string {
  return `https://${actor}:${token}@github.com/${repo}.git`
}
