import * as core from '@actions/core'
import * as github from '@actions/github'
import {getPackageJson} from './utils'
import {PackageJson} from './types'

async function run(): Promise<void> {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const octokit = github.getOctokit(GITHUB_TOKEN)

  const {context} = github
  const pullRequest = context?.payload?.pull_request
  const defaultBranch = pullRequest?.base.repo.default_branch
  // const currentBranch = pullRequest?.head.ref
  const currentBranch = process.env.GITHUB_REF_NAME ?? ''
  const labels: string[] = pullRequest?.labels.map(label => label?.name)
  const currentPkg: PackageJson = await getPackageJson()
  const currentVersion = currentPkg.version
  // eslint-disable-next-line no-console
  console.log('defaultBranch: ', defaultBranch)
  // eslint-disable-next-line no-console
  console.log('currentBranch: ', currentBranch)
  // eslint-disable-next-line no-console
  console.log('labels: ', labels.join(', '))
  // eslint-disable-next-line no-console
  console.log('currentVersion: ', currentVersion)
  // console.log(JSON.stringify(pullRequest, null, 2));
}

void run()
