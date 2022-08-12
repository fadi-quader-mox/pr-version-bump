## PR semver bump
GitHub action that automatically bumps the version in `package.json` in your pull request base on PR labels by comparing against the version on the main branch.
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

## Usage
