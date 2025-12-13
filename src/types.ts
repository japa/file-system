/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Dirent, type WriteFileOptions } from 'node:fs'
export type EntryInfo = {
  path: string
  fullPath: string
  basename: string
  dirent: Dirent
}

export type JSONFileOptions = WriteFileOptions & {
  spaces?: number | string
  replacer?: (this: any, key: string, value: any) => any
}
