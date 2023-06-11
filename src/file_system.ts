/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs-extra'
import readDir from 'readdirp'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Macroable } from 'macroable'

/**
 * File system abstraction on top of `fs-extra` with a fixed basePath
 */
export class FileSystem extends Macroable {
  /**
   * Underlying file adapter
   */
  adapter = fs

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

  /**
   * User defined macros and getters
   */
  static macros = {}
  static getters = {}

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
  async cleanup() {
    return this.adapter.remove(this.basePath)
  }

  /**
   * Create a new file
   */
  async create(filePath: string, contents: string, options?: fs.WriteFileOptions) {
    return this.adapter.outputFile(this.#makePath(filePath), contents, options)
  }

  /**
   * Remove a file
   */
  async remove(filePath: string) {
    return this.adapter.remove(this.#makePath(filePath))
  }

  /**
   * Check if the root of the filesystem exists
   */
  async rootExists() {
    return this.adapter.pathExists(this.basePath)
  }

  /**
   * Check if a file exists
   */
  async exists(filePath: string) {
    return this.adapter.pathExists(this.#makePath(filePath))
  }

  /**
   * Returns file contents
   */
  async contents(filePath: string) {
    return this.adapter.readFile(this.#makePath(filePath), 'utf-8')
  }

  /**
   * Returns stats for a file
   */
  async stats(
    filePath: string,
    options?: fs.StatOptions & {
      bigint?: false | undefined
    }
  ) {
    return this.adapter.stat(this.#makePath(filePath), options)
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
  async createJson(filePath: string, contents: any, options?: fs.JsonOutputOptions) {
    return this.adapter.outputJSON(this.#makePath(filePath), contents, options)
  }

  /**
   * Read and parse a json file
   */
  async contentsJson(filePath: string) {
    return this.adapter.readJson(this.#makePath(filePath))
  }
}
