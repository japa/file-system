/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { rm } from 'node:fs/promises'
import { FileSystem } from '../src/file_system.js'
import { BASE_PATH } from '../tests_helpers/index.js'

test.group('File system', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
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

  test('can extend file system class', async ({ assert }) => {
    //@ts-ignore
    FileSystem.macro('createHelloFile', function (this: Assert, path: string, name: string) {
      return this.createJson(path, { hello: name })
    })

    const fs = new FileSystem(BASE_PATH)

    // @ts-ignore
    await fs.createHelloFile('foo.json', 'jul')
    assert.deepEqual(await fs.contentsJson('foo.json'), { hello: 'jul' })
  })
})
