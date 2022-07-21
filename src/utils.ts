import {existsSync, writeFileSync} from 'fs'
import * as path from 'path'

export async function getPackageJson(workspace: string): Promise<never> {
  const pathToPackage = path.join(workspace, 'package.json')
  if (!existsSync(pathToPackage))
    throw new Error("package.json could not be found in your project's root.")

  // @ts-ignore
  return import(pathToPackage, {assert: {type: 'json'}})
}

export function writePackageJson(workspace: string, newPackageJson): void {
  const pathToPackage = path.join(workspace, 'package.json')
  if (!existsSync(pathToPackage))
    throw new Error("package.json could not be found in your project's root.")
  writeFileSync(pathToPackage, JSON.stringify(newPackageJson, null, 2))
}
