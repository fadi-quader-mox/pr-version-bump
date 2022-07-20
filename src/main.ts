import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const octokit = github.getOctokit(GITHUB_TOKEN)
  const {context} = github
  const pullRequest = context?.payload?.pull_request
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(pullRequest, null, 2))
}

void run()
