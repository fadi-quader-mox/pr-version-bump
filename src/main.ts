import * as core from '@actions/core'
import * as github from '@actions/github'
import * as chProcess from 'child_process'

import {getPackageJson, writePackageJson} from './utils'
import {WorkspaceEnv} from './WorkspaceEnv'

async function run(): Promise<void> {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
  const GITHUB_ACTOR = process.env.GITHUB_ACTOR || ''
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || ''
  const originalGitHubWorkspace = process.env['GITHUB_WORKSPACE'] || './'
  const {context} = github
  const pullRequest = context?.payload?.pull_request
  const defaultBranch = pullRequest?.base.repo.default_branch
  const currentBranch = pullRequest?.head.ref

  const workspaceEnv: WorkspaceEnv = new WorkspaceEnv(originalGitHubWorkspace)
  const labels: string[] = pullRequest?.labels.map(label => label?.name)
  const currentPkg = (await getPackageJson(originalGitHubWorkspace)) as any
  const currentBranchVersion = currentPkg.version
  await workspaceEnv.run('git', ['checkout', defaultBranch])
  const newVersion = chProcess
    .execSync(`npm version --git-tag-version=false ${'patch'}`)
    .toString()
    .trim()
    .replace(/^v/, '')

  core.debug(`newVersion: ${newVersion}`)
  if (newVersion === currentBranchVersion) {
    core.debug('Version is already bumped! Skipping..')
  }

  await workspaceEnv.run('git', ['fetch'])
  await workspaceEnv.run('git', ['checkout', currentBranch])
  currentPkg.version = newVersion
  writePackageJson(originalGitHubWorkspace, currentPkg)
  await workspaceEnv.run('git', [
    'config',
    'user.name',
    `"$(git log -n 1 --pretty=format:%an)"`
  ])
  await workspaceEnv.setGithubUsernameAndPassword(
    GITHUB_ACTOR,
    `${GITHUB_ACTOR}@users.noreply.github.com`
  )
  const remoteRepo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`
  await workspaceEnv.run('git', [
    'commit',
    '-a',
    '-m',
    `"chore: bump version to ${newVersion}"`
  ])
  core.info(`Pushing new version to branch ${currentBranch}`)
  await workspaceEnv.run('git', ['push', remoteRepo])
  core.info(`Version bumped to ${newVersion}`)
}

void run()
