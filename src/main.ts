import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  generateNewVersion,
  getPackageJson,
  getSemverLabel,
  writePackageJson
} from './utils'
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
  core.debug(`defaultBranch: ${defaultBranch}`)
  const currentBranch = pullRequest?.head.ref
  core.debug(`currentBranch: ${currentBranch}`)
  const workspaceEnv: WorkspaceEnv = new WorkspaceEnv(originalGitHubWorkspace)
  await workspaceEnv.run('git', ['fetch'])
  const currentPkg = (await getPackageJson(originalGitHubWorkspace)) as any
  const currentBranchVersion = currentPkg.version
  await workspaceEnv.checkout(defaultBranch)
  const newVersion = generateNewVersion(semverLabel)
  core.info(`Current version: ${currentBranchVersion}`)
  core.info(`New version: ${newVersion}`)
  if (newVersion === currentBranchVersion) {
    core.info('✅ Version is already bumped! No action needed..')
    return
  }

  await workspaceEnv.checkout(currentBranch)
  currentPkg.version = newVersion
  writePackageJson(originalGitHubWorkspace, currentPkg)
  await workspaceEnv.setGithubUsernameAndPassword(
    GITHUB_ACTOR,
    `${GITHUB_ACTOR}@users.noreply.github.com`
  )
  const remoteRepo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`
  await workspaceEnv.commit(`(chore): auto bump version to ${newVersion}`)
  core.info(`🔄 Pushing new version to branch ${currentBranch}`)
  await workspaceEnv.run('git', ['push', remoteRepo])
  core.info(`✅ Version bumped to ${newVersion}`)
}

void run()
