## PR Semver Bump
GitHub action that automatically bumps the version in `package.json` of your pull request based on PR labels by comparing the versinon of your PR to the version of the main branch.
Currently. The next version will be commited and pushed to your pull request.
This action is useful when the version **can not** be automatically bumped because the branch is protected.

## Workflow
* The action will be triggered based on your PR's labels.
  * Currently, only these labels are supported: `major`, `minor`, `patch`.
  * if current version is `1.0.0` and the label is `minor` then version will be bumped to `1.1.1
* The action will fail if:
  * There are no labels provided
  * More than one label is not allowed. i.e. patch, major
* When labels change, the action will be triggered.

## Options
### Inputs
* **GITHUB_TOKEN** (required): GitHub access token
### Outputs
* **NEXT_VERSION**: The newly bumped version

## Usage
```yaml
- uses: 'actions/checkout@v3'
- name: 'PR Version Bump'
  uses: fadiquader/pr-semver-bump
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
It's recommend to use [`styfle/cancel-workflow-action@0.10.0`](https://github.com/marketplace/actions/cancel-workflow-action) to cancel previous running actions to avoid confliciting actions

#### Full example
```yaml
name: 'Bump Version'
on:
  pull_request_target:
    types:
      - synchronize
      - edited
      - ready_for_review
      - labeled

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Cancel Previous Runs
        uses: styfle/cancel-workflow-action@0.10.0
        with:
          access_token: ${{ secrets.GITHUB_TOKEN }}
      - uses: 'actions/checkout@v3'
      - name: 'PR Version Bump'
        uses: fadiquader/pr-semver-bump
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```
