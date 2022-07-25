import {existsSync, writeFileSync} from 'fs'
import * as path from 'path'
import {SEM_VERSIONS} from './constants'
import {execSync} from 'child_process'

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
  writeFileSync(pathToPackage, JSON.stringify(newPackageJson, null, 2))
}

export function getSemverLabel(labels: string[]): string {
  const versions = labels.filter(label => SEM_VERSIONS.includes(label))
  if (versions.length !== 1) return ''

  return versions[0]
}

export function generateNewVersion(semverLabel): string {
  return execSync(`npm version --git-tag-version=false ${semverLabel}`)
    .toString()
    .trim()
    .replace(/^v/, '')
}
