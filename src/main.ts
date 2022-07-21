import * as core from '@actions/core'
import * as github from '@actions/github'
import * as chProcess from 'child_process'

import {getPackageJson, writePackageJson} from './utils'
import {WorkspaceEnv} from './WorkspaceEnv'

async function run(): Promise<void> {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
  const GITHUB_ACTOR = process.env.GITHUB_ACTOR || ''
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || ''
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const octokit = github.getOctokit(GITHUB_TOKEN)
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
  if (newVersion === currentBranchVersion) {
    // eslint-disable-next-line no-console
    console.log('Version is already bumpled! Skipping..')
  }

  await workspaceEnv.run('git', ['fetch'])
  await workspaceEnv.run('git', ['checkout', currentBranch])
  currentPkg.version = newVersion
  writePackageJson(originalGitHubWorkspace, currentPkg)
  const currentPkg1 = (await getPackageJson(originalGitHubWorkspace)) as any
  // eslint-disable-next-line no-console
  console.log('newPkgVersion: ', currentPkg1.version)

  const githubUsername = await workspaceEnv.run('git', [
    'log -n 1',
    '--pretty=format:%an'
  ])
  const githubEmail = await workspaceEnv.run('git', [
    'log -n 1',
    '--pretty=format:%ae'
  ])
  await workspaceEnv.run('git', ['config', 'user.name', `"${githubUsername}"`])
  await workspaceEnv.run('git', ['config', 'user.email', `"${githubEmail}"`])

  await workspaceEnv.run('git', [
    'commit',
    '-a',
    '-m',
    `chore: bump version to ${newVersion}`
  ])
  const remoteRepo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`
  await workspaceEnv.run('git', ['push', remoteRepo])
  // // eslint-disable-next-line no-console
  // console.log(`Bumped version to ${newVersion}`)
  // // console.log(JSON.stringify(pullRequest, null, 2));
}

void run()
