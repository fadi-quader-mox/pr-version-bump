import * as core from '@actions/core'
import * as github from '@actions/github'
import * as chProcess from 'child_process'

import {getPackageJson, writePackageJson} from './utils'
import {PackageJson} from './types'
import {WorkspaceEnv} from './WorkspaceEnv'

async function run(): Promise<void> {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const octokit = github.getOctokit(GITHUB_TOKEN)
  const originalGitHubWorkspace = process.env['GITHUB_WORKSPACE'] || './'
  const {context} = github
  const pullRequest = context?.payload?.pull_request
  const defaultBranch = pullRequest?.base.repo.default_branch
  const currentBranch = pullRequest?.head.ref

  const workspaceEnv: WorkspaceEnv = new WorkspaceEnv(originalGitHubWorkspace)
  const labels: string[] = pullRequest?.labels.map(label => label?.name)
  const currentPkg: PackageJson = await getPackageJson(originalGitHubWorkspace)
  const currentBranchVersion = currentPkg.version
  await workspaceEnv.run('git', ['checkout', defaultBranch])
  // eslint-disable-next-line no-console
  console.log('defaultBranch: ', defaultBranch)
  // eslint-disable-next-line no-console
  console.log('currentBranch: ', currentBranch)
  // eslint-disable-next-line no-console
  console.log('labels: ', labels.join(', '))
  const newVersion = chProcess
    .execSync(`npm version --git-tag-version=false ${'patch'}`)
    .toString()
    .trim()
    .replace(/^v/, '')

  // eslint-disable-next-line no-console
  console.log('newVersion: ', newVersion)
  // if (newVersion === currentBranchVersion) {
  //   // eslint-disable-next-line no-console
  //   console.log('Version is already bumpled! Skipping..')
  // }
  //
  await workspaceEnv.run('git', ['checkout', currentBranch])
  //
  currentPkg.version = newVersion

  writePackageJson(originalGitHubWorkspace, currentPkg)
  const currentPkg1: PackageJson = await getPackageJson(originalGitHubWorkspace)
  // eslint-disable-next-line no-console
  console.log('newPkgVersion: ', currentPkg1.version)
  //
  // await workspaceEnv.run('git', [
  //   'commit',
  //   '-a',
  //   '-m',
  //   `chore: bump version to ${newVersion}`
  // ])
  // const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
  // await workspaceEnv.run('git', ['push', remoteRepo])
  // // eslint-disable-next-line no-console
  // console.log(`Bumped version to ${newVersion}`)
  // // console.log(JSON.stringify(pullRequest, null, 2));
}

void run()
