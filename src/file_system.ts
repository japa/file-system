/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import readDir from 'readdirp'
import { pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import Macroable from '@poppinss/macroable'
import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import {
  type StatOptions,
  type WriteFileOptions,
  constants,
  RmOptions,
  MakeDirectoryOptions,
} from 'node:fs'

import type { JSONFileOptions } from './types.js'

/**
 * File system abstraction on top of `fs-extra` with a fixed basePath
 */
export class FileSystem extends Macroable {
  /**
   * Base URL to the directory for reading and writing
   * files
   */
  baseUrl: URL

  /**
   * Base path to the directory for reading and writing
   * files
   */
  basePath: string

  constructor(basePath: string) {
    super()
    this.basePath = basePath
    this.baseUrl = pathToFileURL(`${this.basePath}/`)
  }

  #makePath(filePath: string) {
    return join(this.basePath, filePath)
  }

  /**
   * Cleanup directory
   */
  async cleanup(options?: RmOptions) {
    return rm(this.basePath, { recursive: true, force: true, maxRetries: 10, ...options })
  }

  /**
   * Creates a directory inside the root of the filesystem
   * path. You may use this method to create nested
   * directories as well.
   */
  mkdir(dirPath: string, options?: MakeDirectoryOptions) {
    return mkdir(this.#makePath(dirPath), { recursive: true, ...options })
  }

  /**
   * Create a new file
   */
  async create(filePath: string, contents: string, options?: WriteFileOptions) {
    const absolutePath = this.#makePath(filePath)
    await mkdir(dirname(absolutePath), { recursive: true })
    return writeFile(this.#makePath(filePath), contents, options)
  }

  /**
   * Remove a file
   */
  async remove(filePath: string, options?: RmOptions) {
    return rm(this.#makePath(filePath), { recursive: true, force: true, maxRetries: 2, ...options })
  }

  /**
   * Check if the root of the filesystem exists
   */
  async rootExists() {
    try {
      await access(this.basePath, constants.F_OK)
      return true
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false
      }
      throw error
    }
  }

  /**
   * Check if a file exists
   */
  async exists(filePath: string) {
    try {
      await access(this.#makePath(filePath), constants.F_OK)
      return true
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false
      }
      throw error
    }
  }

  /**
   * Returns file contents
   */
  async contents(filePath: string) {
    return readFile(this.#makePath(filePath), 'utf-8')
  }

  /**
   * Dumps file contents to the stdout
   */
  async dump(filePath: string) {
    console.log('------------------------------------------------------------')
    console.log(`file path => "${filePath}"`)
    console.log(`contents => "${await this.contents(filePath)}"`)
  }

  /**
   * Returns stats for a file
   */
  async stats(filePath: string, options?: StatOptions) {
    return stat(this.#makePath(filePath), options)
  }

  /**
   * Recursively reads files from a given directory
   */
  readDir(dirPath?: string): Promise<readDir.EntryInfo[]> {
    return dirPath
      ? readDir.promise(this.#makePath(dirPath), { type: 'files' })
      : readDir.promise(this.basePath, { type: 'files' })
  }

  /**
   * Create a json file
   */
  async createJson(filePath: string, contents: any, options?: JSONFileOptions) {
    if (options && typeof options === 'object') {
      const { replacer, spaces, ...rest } = options
      return this.create(filePath, JSON.stringify(contents, replacer, spaces), rest)
    }

    return this.create(filePath, JSON.stringify(contents), options)
  }

  /**
   * Read and parse a json file
   */
  async contentsJson(filePath: string) {
    const contents = await readFile(this.#makePath(filePath), 'utf-8')
    return JSON.parse(contents)
  }
}
