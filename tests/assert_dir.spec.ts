/*
 * @japa/assert
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { Assert } from '@japa/assert'
import { rm, mkdir } from 'node:fs/promises'

import '../src/assert.js'
import { FileSystem } from '../src/file_system.js'
import { BASE_PATH } from '../tests_helpers/index.js'

test.group('Assert | dirExists', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when directory is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.dirExists('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' directory to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('succeed when directory exists', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar/baz.txt', 'hello world')
    await assert.doesNotRejects(() => customAssert.dirExists('foo/bar'))
  })
})

test.group('Assert | dirNotExists', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when directory exists', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hello world')

    try {
      await customAssert.dirNotExists('foo')
    } catch (error) {
      assert.equal(error.message, `expected 'foo' directory to not exist`)
      assert.equal(error.operator, 'notExists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('succeed when directory is missing', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await assert.doesNotRejects(() => customAssert.dirNotExists('foo'))
  })
})

test.group('Assert | hasFiles', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when directory does not have expected files', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')

    try {
      await customAssert.hasFiles(['foo/bar.txt', 'foo/baz.txt'])
    } catch (error) {
      assert.equal(
        error.message,
        `expected file system to have [ 'foo/bar.txt', 'foo/baz.txt' ] files`
      )
      assert.equal(error.operator, 'deepStrictEqual')
      assert.deepEqual(error.actual, ['foo/bar.txt'])
      assert.isTrue(error.showDiff)
      assert.deepEqual(error.expected, ['foo/bar.txt', 'foo/baz.txt'])
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('succeed when all files exists', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')
    await customAssert.fs.create('foo/baz.txt', 'hi world')

    await assert.doesNotRejects(() => customAssert.hasFiles(['foo/bar.txt', 'foo/baz.txt']))
  })
})

test.group('Assert | doesNotHaveFiles', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when directory has any one file', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')

    try {
      await customAssert.doesNotHaveFiles(['foo/bar.txt', 'foo/baz.txt'])
    } catch (error) {
      assert.equal(error.message, `expected file system to not have [ 'foo/bar.txt' ] files`)
      assert.equal(error.operator, 'deepStrictNotEqual')
      assert.deepEqual(error.actual, ['foo/bar.txt', 'foo/baz.txt'])
      assert.isTrue(error.showDiff)
      assert.deepEqual(error.expected, ['foo/bar.txt'])
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('succeed when all files are missing', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await assert.doesNotRejects(() => customAssert.doesNotHaveFiles(['foo/bar.txt', 'foo/baz.txt']))
  })
})

test.group('Assert | dirIsEmpty', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when filesystem is not empty', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')

    try {
      await customAssert.dirIsEmpty()
    } catch (error) {
      assert.equal(error.message, `expected file system base directory to be empty`)
      assert.equal(error.operator, 'deepStrictEqual')
      assert.deepEqual(error.actual, ['foo/bar.txt'])
      assert.isTrue(error.showDiff)
      assert.deepEqual(error.expected, [])
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when sub-directory is not empty', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')

    try {
      await customAssert.dirIsEmpty('foo')
    } catch (error) {
      assert.equal(error.message, `expected 'foo' directory to be empty`)
      assert.equal(error.operator, 'deepStrictEqual')
      assert.deepEqual(error.actual, ['bar.txt'])
      assert.isTrue(error.showDiff)
      assert.deepEqual(error.expected, [])
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when sub-directory is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.dirIsEmpty('foo')
    } catch (error) {
      assert.equal(error.message, `expected 'foo' directory to exist`)
      assert.equal(error.operator, 'exists')
      assert.deepEqual(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.deepEqual(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('succeed when filesystem root is empty', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await assert.doesNotRejects(() => customAssert.dirIsEmpty())
  })

  test('succeed when sub-directory is empty', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await mkdir(join(BASE_PATH, 'foo'), { recursive: true })
    await assert.doesNotRejects(() => customAssert.dirIsEmpty('foo'))
  })
})

test.group('Assert | dirIsNotEmpty', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when filesystem is empty', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.dirIsNotEmpty()
    } catch (error) {
      assert.equal(error.message, `expected file system base directory to be not empty`)
      assert.equal(error.operator, 'deepStrictNotEqual')
      assert.deepEqual(error.actual, [])
      assert.isFalse(error.showDiff)
      assert.deepEqual(error.expected, [])
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when sub-directory is empty', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')
    await customAssert.fs.remove('foo/bar.txt')

    try {
      await customAssert.dirIsNotEmpty('foo')
    } catch (error) {
      assert.equal(error.message, `expected 'foo' directory to be not empty`)
      assert.equal(error.operator, 'deepStrictNotEqual')
      assert.deepEqual(error.actual, [])
      assert.isFalse(error.showDiff)
      assert.deepEqual(error.expected, [])
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when sub-directory is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.dirIsNotEmpty('foo')
    } catch (error) {
      assert.equal(error.message, `expected 'foo' directory to exist`)
      assert.equal(error.operator, 'exists')
      assert.deepEqual(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.deepEqual(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('succeed when sub-directory is not empty', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')
    await assert.doesNotRejects(() => customAssert.dirIsNotEmpty('foo'))
  })

  test('succeed when filesystem source is not empty', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar.txt', 'hello world')
    await assert.doesNotRejects(() => customAssert.dirIsNotEmpty())
  })
})
