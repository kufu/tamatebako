# stylelint-config-smarthr

[![npm version](https://badge.fury.io/js/stylelint-config-smarthr.svg)](https://badge.fury.io/js/stylelint-config-smarthr)
[![CircleCI](https://circleci.com/gh/kufu/stylelint-config-smarthr.svg?style=shield)](https://circleci.com/gh/kufu/stylelint-config-smarthr)

A sharable stylelint config for SmartHR.
This is intended to use for a project with styled-components.

## Install

```sh
yarn add --dev stylelint stylelint-config-standard stylelint-config-styled-components postcss-styled-syntax // install peerDependencies
yarn add --dev stylelint-config-smarthr
```

## How to use

Add a following `.stylelintrc` in your project.

```json
{
  "extends": [
    "stylelint-config-smarthr"
  ]
}
```
