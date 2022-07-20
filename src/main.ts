import * as core from '@actions/core'
import * as github from '@actions/github'
import {getPackageJson} from './utils'
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
  const defaultBranchPackage: PackageJson = await getPackageJson(
    originalGitHubWorkspace
  )
  const defaultBranchVersion = defaultBranchPackage.version
  // eslint-disable-next-line no-console
  console.log('defaultBranch: ', defaultBranch)
  // eslint-disable-next-line no-console
  console.log('currentBranch: ', currentBranch)
  // eslint-disable-next-line no-console
  console.log('labels: ', labels.join(', '))
  // eslint-disable-next-line no-console
  console.log('defaultBranchVersion: ', defaultBranchVersion)
  // eslint-disable-next-line no-console
  console.log('currentVersion: ', currentBranchVersion)
  // console.log(JSON.stringify(pullRequest, null, 2));
}

void run()
