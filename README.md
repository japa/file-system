@japa/file-system
> File system plugin for Japa

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url] [![snyk-image]][snyk-url]

The file system plugin allows you to easily manage files and directories during tests and write assertions against them.

#### [Complete API documentation](https://japa.dev/docs/plugins/file-system)

## Installation
You can install the plugin from the npm packages registry as follows.

```sh
npm i -D @japa/file-system
```

## Usage
The next step is registering the plugin inside the `plugins` array.

```ts
import { fileSystem } from '@japa/file-system'

configure({
  plugins: [fileSystem()]
})
```

Once the plugin has been registered, you can access the `fs` property from the test context. The `fs` property exposes the helper functions to **read** and **write** files. For example:

```ts
test('read rc file', async ({ fs }) => {
  await fs.write('rc.json', JSON.stringify({
    foo: 'bar'
  }))

  await runMethodThatNeedsRcFile()
})
```

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/japa/file-system/test.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/japa/file-system/actions/workflows/test.yml "Github action"

[npm-image]: https://img.shields.io/npm/v/@japa/file-system/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@japa/file-system/v/latest "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/japa/file-system?style=for-the-badge

[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/japa/file-system?label=Snyk%20Vulnerabilities&style=for-the-badge
[snyk-url]: https://snyk.io/test/github/japa/file-system?targetFile=package.json "snyk"
