import * as core from '@actions/core'
import * as github from '@actions/github'
import * as chProcess from 'child_process'

import {getPackageJson, getSemverLabel, writePackageJson} from './utils'
import {WorkspaceEnv} from './WorkspaceEnv'
import {SEM_VERSIONS} from './constans'

async function run(): Promise<void> {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
  const GITHUB_ACTOR = process.env.GITHUB_ACTOR || ''
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || ''
  const originalGitHubWorkspace = process.env['GITHUB_WORKSPACE'] || './'
  const {context} = github
  const pullRequest = context?.payload?.pull_request
  if (!pullRequest) return

  const labels: string[] =
    pullRequest?.labels.map(label => label?.name.trim()) ?? []
  const semverLabel: string = getSemverLabel(labels)
  core.info(`semver ${semverLabel}`)
  if (!semverLabel) {
    core.setFailed(
      `❌ Invalid version labels, please provide one of these labels: ${SEM_VERSIONS.join(
        ', '
      )}`
    )
    return
  }
  const defaultBranch = pullRequest?.base.repo.default_branch
  const currentBranch = pullRequest?.head.ref
  core.info(`currentBranch: ${currentBranch}`)
  core.info(`defaultBranch: ${defaultBranch}`)
  const workspaceEnv: WorkspaceEnv = new WorkspaceEnv(originalGitHubWorkspace)
  await workspaceEnv.run('git', ['pull', 'origin', currentBranch, '--ff-only'])
  const currentPkg = (await getPackageJson(originalGitHubWorkspace)) as any
  const currentBranchVersion = currentPkg.version
  await workspaceEnv.run('git', ['checkout', defaultBranch])
  const newVersion = chProcess
    .execSync(`npm version --git-tag-version=false ${semverLabel}`)
    .toString()
    .trim()
    .replace(/^v/, '')

  core.debug(`newVersion: ${newVersion}`)
  await workspaceEnv.run('git', ['fetch'])
  core.info(`currentBranchVersion: ${currentBranchVersion}`)
  core.info(`newVersion: ${newVersion}`)
  if (newVersion === currentBranchVersion) {
    core.info('✅ Version is already bumped! Skipping..')
    return
  }
  await workspaceEnv.run('git', [
    'checkout',
    currentBranch,
    '--progress',
    '--force'
  ])
  currentPkg.version = newVersion
  writePackageJson(originalGitHubWorkspace, currentPkg)
  await workspaceEnv.setGithubUsernameAndPassword(
    GITHUB_ACTOR,
    `${GITHUB_ACTOR}@users.noreply.github.com`
  )
  const remoteRepo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`
  await workspaceEnv.run('git', [
    'commit',
    '-a',
    '-m',
    `"chore: auto bump version to ${newVersion}"`
  ])
  core.info(`🔄 Pushing new version to branch ${currentBranch}`)
  await workspaceEnv.run('git', ['push', remoteRepo])
  core.info(`✅ Version bumped to ${newVersion}`)
}

void run()
