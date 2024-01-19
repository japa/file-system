/*
 * @japa/assert
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Assert } from '@japa/assert'
import { rm } from 'node:fs/promises'

import '../src/assert.js'
import { FileSystem } from '../src/file_system.js'
import { BASE_PATH } from '../tests_helpers/index.js'

test.group('Assert | fileExists', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileExists('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('pass assertion when file exists', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hello world')
    await assert.doesNotReject(() => customAssert.fileExists('foo/bar'))
  })
})

test.group('Assert | fileNotExists', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file exists', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hello world')

    try {
      await customAssert.fileNotExists('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to not exist`)
      assert.equal(error.operator, 'notExists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('pass assertion when file is missing', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await assert.doesNotReject(() => customAssert.fileNotExists('foo/bar'))
  })
})

test.group('Assert | fileEquals', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileEquals('foo/bar', 'hello world')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when file contents are different', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')

    try {
      await customAssert.fileEquals('foo/bar', 'hello world')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file contents to equal 'hello world'`)
      assert.equal(error.operator, 'strictEqual')
      assert.equal(error.actual, 'hi world')
      assert.equal(error.expected, 'hello world')
      assert.isTrue(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('work fine when file contents are the same', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hello world')
    await assert.doesNotReject(() => customAssert.fileEquals('foo/bar', 'hello world'))
  })
})

test.group('Assert | fileContains', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileContains('foo/bar', 'hello world')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.equal(error.expected, '')
      assert.isFalse(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when file contents does not have expected substring', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')

    try {
      await customAssert.fileContains('foo/bar', 'hello')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file contents to contain 'hello'`)
      assert.equal(error.operator, 'containsSubset')
      assert.equal(error.actual, 'hi world')
      assert.equal(error.expected, 'hello')
      assert.isTrue(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when file contents does not match a regular expression', async ({
    assert,
  }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')

    try {
      await customAssert.fileContains('foo/bar', /hello/)
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file contents to match /hello/`)
      assert.equal(error.operator, 'strictEqual')
      assert.isFalse(error.showDiff)
      assert.equal(error.actual, 'hi world')
      assert.deepEqual(error.expected, /hello/)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('work fine when file contents contains substring', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hello world')
    await assert.doesNotReject(() => customAssert.fileContains('foo/bar', 'world'))
  })

  test('work fine when file contents matches a regular expression', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hello world')
    await assert.doesNotReject(() => customAssert.fileContains('foo/bar', /world/))
  })
  test('check file for multiple matching strings', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create(
      'foo/bar',
      `
      const a = 'foo'
      a.toUpperCase()
    `
    )
    await assert.doesNotReject(() =>
      customAssert.fileContains('foo/bar', [`const a = 'foo'`, 'a.toUpperCase()'])
    )
  })
})

test.group('Assert | fileSameAs', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileSameAs('foo/bar', 'foo/baz')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when other file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')

    try {
      await customAssert.fileSameAs('foo/bar', 'foo/baz')
    } catch (error) {
      assert.equal(error.message, `expected comparing file 'foo/baz' to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when both files contents are different', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')
    await customAssert.fs.create('foo/baz', 'hello world')

    try {
      await customAssert.fileSameAs('foo/bar', 'foo/baz')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file contents to equal 'hello world'`)
      assert.equal(error.operator, 'strictEqual')
      assert.equal(error.actual, 'hi world')
      assert.isTrue(error.showDiff)
      assert.equal(error.expected, 'hello world')
      assert.equal(customAssert.assertions.total, 1)
    }
  })
})

test.group('Assert | fileIsEmpty', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileIsEmpty('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when file has contents', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')

    try {
      await customAssert.fileIsEmpty('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to be empty`)
      assert.equal(error.operator, 'strictEqual')
      assert.equal(error.actual, 'hi world')
      assert.equal(error.expected, '')
      assert.isTrue(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('work fine when file is empty', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', '')
    await assert.doesNotReject(() => customAssert.fileIsEmpty('foo/bar', 'hello world'))
  })
})

test.group('Assert | fileIsNotEmpty', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileIsNotEmpty('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.isFalse(error.showDiff)
      assert.equal(error.expected, '')
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when file is empty', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', '')

    try {
      await customAssert.fileIsNotEmpty('foo/bar')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to be not empty`)
      assert.equal(error.operator, 'notStrictEqual')
      assert.equal(error.actual, '')
      assert.equal(error.expected, '')
      assert.isFalse(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('work fine when file is empty', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', '')
    await assert.doesNotReject(() => customAssert.fileIsEmpty('foo/bar', 'hello world'))
  })
})

test.group('Assert | fileNotContains', (group) => {
  group.each.setup(() => {
    return () => rm(BASE_PATH, { recursive: true, force: true, maxRetries: 10 })
  })

  test('report error when file is missing', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    try {
      await customAssert.fileNotContains('foo/bar', 'hello world')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file to exist`)
      assert.equal(error.operator, 'exists')
      assert.equal(error.actual, '')
      assert.equal(error.expected, '')
      assert.isFalse(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('report error when file contents contains the unexpected string', async ({ assert }) => {
    assert.plan(6)

    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create('foo/bar', 'hi world')

    try {
      await customAssert.fileNotContains('foo/bar', 'world')
    } catch (error) {
      assert.equal(error.message, `expected 'foo/bar' file contents to not contain 'world'`)
      assert.equal(error.operator, 'containsSubset')
      assert.equal(error.actual, 'hi world')
      assert.equal(error.expected, 'world')
      assert.isFalse(error.showDiff)
      assert.equal(customAssert.assertions.total, 1)
    }
  })

  test('check file for multiple matching strings', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create(
      'foo/bar',
      `
      const a = 'foo'
      a.toUpperCase()
    `
    )
    await assert.doesNotReject(() =>
      customAssert.fileNotContains('foo/bar', [`const b = 'foo'`, 'b.toUpperCase()'])
    )
  })

  test('fail when file contains one of the unexpected values', async ({ assert }) => {
    const customAssert = new Assert()
    customAssert.fs = new FileSystem(BASE_PATH)

    await customAssert.fs.create(
      'foo/bar',
      `
      const a = 'foo'
      a.toUpperCase()
    `
    )
    await assert.rejects(
      () => customAssert.fileNotContains('foo/bar', [`const b = 'foo'`, 'a.toUpperCase()']),
      `expected 'foo/bar' file contents to not contain 'a.toUpperCase()'`
    )
  })
})
