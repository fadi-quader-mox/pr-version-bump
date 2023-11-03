## PR Auto Version Bump
GitHub action that automatically bumps the version in `package.json` of your pull request based on PR labels. The action checks the version on main / master branch and bumps the version accordingly. So the next version will be automatically committed and pushed to your Pull Request.
This action is useful when the version **can not** be automatically bumped after a merge because the main branch is protected.

## Workflow
* The action will be triggered based on your PR's labels.
  * Currently, only these labels are supported: `major`, `minor`, `patch`.
  * if current version is `1.0.0` and the label is `minor` then version will be bumped to `1.1.0`
* The action will fail if:
  * Version was not bumped manually and no labels were provided.
  * More than one label were applied. i.e. patch, major.
* When labels change, the action will automatically trigger.
* You can still bump the version manually, but you must not apply any of the semver labels or it will fail.

## Options
### Inputs
* **GITHUB_TOKEN** (required): GitHub access token
### Outputs
* **NEXT_VERSION**: The newly bumped version

## Usage
```yaml
- name: Pull Request Semver Action
  uses: fadi-quader-mox/pr-version-bump@v1.0.0
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
It's recommended to specify the [`concurrency`](https://docs.github.com/en/actions/using-jobs/using-concurrency) property to cancel previously invoked actions in order to avoid conflicting changes.

#### Full example
```yaml
name: PR Version Bump
on:
  pull_request_target:
    types:
      - synchronize
      - edited
      - ready_for_review
      - labeled
      - reopened

jobs:
  version_bump:
    runs-on: ubuntu-latest
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
    steps:
      - uses: actions/checkout@v3
      - name: Bump version
        uses: fadi-quader-mox/pr-version-bump@v1.0.0
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
