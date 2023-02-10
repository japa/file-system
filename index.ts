/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@japa/runner' {
  interface TestContext {
    fs: FileSystem
  }
}

import cuid from 'cuid'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PluginFn } from '@japa/runner'
import { fileURLToPath } from 'node:url'

import './src/assert'
import { FileSystem } from './src/file_system'

/**
 * The filesystem plugin for Japa
 */
export function fileSystem(options?: { basePath?: string | URL; autoClean?: boolean }) {
  const normalizeOptions = Object.assign(
    { basePath: join(tmpdir(), cuid()), autoClean: true },
    options
  )

  /**
   * Create the base root path for the file system class
   */
  const baseRoot =
    typeof normalizeOptions.basePath === 'string'
      ? normalizeOptions.basePath
      : fileURLToPath(normalizeOptions.basePath)

  const fsPlugin: PluginFn = function (_, __, { TestContext }) {
    TestContext.created((ctx) => {
      /**
       * Share fs property with context
       */
      ctx.fs = new FileSystem(baseRoot)

      /**
       * Share fs property with assert module
       */
      ctx.assert.fs = ctx.fs

      /**
       * Register auto clean hook
       */
      if (normalizeOptions.autoClean) {
        ctx.cleanup(() => ctx.fs.cleanup())
      }
    })
  }

  return fsPlugin
}

export type { EntryInfo } from 'readdirp'
export type { WriteFileOptions } from 'fs-extra'
