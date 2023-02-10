/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { remove } from 'fs-extra'
import { test } from '@japa/runner'
import { FileSystem } from '../src/file_system'

// eslint-disable-next-line unicorn/prefer-module
const BASE_PATH = join(__dirname, './tmp')

test.group('File system', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('get file stats', async ({ assert }) => {
    const fs = new FileSystem(BASE_PATH)
    await fs.create('foo.txt', 'hello world')

    const stats = await fs.stats('foo.txt')
    assert.isTrue(stats.isFile())
  })

  test('cleanup filesystem root', async ({ assert }) => {
    const fs = new FileSystem(BASE_PATH)
    await fs.create('foo.txt', 'hello world')

    await fs.cleanup()
    assert.isFalse(await fs.exists('foo.txt'))
    assert.isFalse(await fs.rootExists())
  })
})
