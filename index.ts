/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cuid from 'cuid'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PluginFn } from '@japa/runner'
import { fileURLToPath } from 'node:url'

import './src/assert.js'
import { FileSystem } from './src/file_system.js'

/**
 * The filesystem plugin for Japa
 */
export function fileSystem(basePath?: string | URL) {
  const baseRoot =
    typeof basePath === 'string'
      ? basePath
      : basePath
      ? fileURLToPath(basePath)
      : join(tmpdir(), cuid())

  const fsPlugin: PluginFn = function (_, __, { TestContext }) {
    TestContext.created((ctx) => {
      ctx.fs = new FileSystem(baseRoot)
      ctx.assert.fs = ctx.fs
    })
  }

  return fsPlugin
}

declare module '@japa/runner' {
  interface TestContext {
    fs: FileSystem
  }
}
