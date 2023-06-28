/*
 * @japa/file-system
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import slash from 'slash'
import { Assert } from '@japa/assert'
import { FileSystem } from './file_system.js'

declare module '@japa/assert' {
  interface Assert {
    /**
     * The file system instance is required by the assertion methods
     */
    fs: FileSystem

    /**
     * Assert file exists at a given path
     */
    fileExists(filePath: string, message?: string): Promise<void>

    /**
     * Assert file does not exists at a given path
     */
    fileNotExists(filePath: string, message?: string): Promise<void>

    /**
     * Assert file contents to equals a string value
     */
    fileEquals(filePath: string, contents: string, message?: string): Promise<void>

    /**
     * Assert file contents to contain a substring or match a regular
     * expression
     */
    fileContains(filePath: string, substring: string | RegExp, message?: string): Promise<void>

    /**
     * Assert file contents to be same as other file's content
     */
    fileSameAs(filePath: string, otherFilePath: string, message?: string): Promise<void>

    /**
     * Assert file to exist and be empty
     */
    fileIsEmpty(filePath: string, message?: string): Promise<void>

    /**
     * Assert file to be not empty
     */
    fileIsNotEmpty(filePath: string, message?: string): Promise<void>

    /**
     * Assert directory exists at a given path
     */
    dirExists(dirPath: string, message?: string): Promise<void>

    /**
     * Assert directory does not exists at a given path
     */
    dirNotExists(dirPath: string, message?: string): Promise<void>

    /**
     * Assert all the mentioned files exists
     */
    hasFiles(filesToExpect: string[], message?: string): Promise<void>

    /**
     * Assert all the mentioned files does not exists
     */
    doesNotHaveFiles(filesToBeMissing: string[], message?: string): Promise<void>

    /**
     * Assert a given directory to have no files
     */
    dirIsEmpty(directoryPath?: string, message?: string): Promise<void>

    /**
     * Assert a given directory to have atleast one file
     */
    dirIsNotEmpty(directoryPath?: string, message?: string): Promise<void>
  }
}

Assert.macro('fileExists', async function (this: Assert, filePath: string, message?: string) {
  this.incrementAssertionsCount()

  const hasFile = await this.fs.exists(filePath)
  this.evaluate(hasFile, 'expected #{this} file to exist', {
    thisObject: filePath,
    expected: '',
    actual: '',
    showDiff: false,
    prefix: message,
    operator: 'exists',
  })
})

Assert.macro('fileNotExists', async function (this: Assert, filePath: string, message?: string) {
  this.incrementAssertionsCount()

  const hasFile = await this.fs.exists(filePath)
  this.evaluate(!hasFile, 'expected #{this} file to not exist', {
    thisObject: filePath,
    expected: '',
    actual: '',
    showDiff: false,
    prefix: message,
    operator: 'notExists',
  })
})

Assert.macro(
  'fileEquals',
  async function (this: Assert, filePath: string, contents: string, message?: string) {
    this.incrementAssertionsCount()

    const hasFile = await this.fs.exists(filePath)
    if (!hasFile) {
      this.evaluate(hasFile, 'expected #{this} file to exist', {
        thisObject: filePath,
        expected: '',
        actual: '',
        showDiff: false,
        prefix: message,
        operator: 'exists',
      })

      return
    }

    const onDiskContents = await this.fs.contents(filePath)
    this.evaluate(onDiskContents === contents, 'expected #{this} file contents to equal #{exp}', {
      thisObject: filePath,
      expected: contents,
      actual: onDiskContents,
      prefix: message,
      operator: 'strictEqual',
    })
  }
)

Assert.macro(
  'fileContains',
  async function (this: Assert, filePath: string, substring: string | RegExp, message?: string) {
    this.incrementAssertionsCount()

    const hasFile = await this.fs.exists(filePath)
    if (!hasFile) {
      this.evaluate(hasFile, 'expected #{this} file to exist', {
        thisObject: filePath,
        expected: '',
        actual: '',
        showDiff: false,
        prefix: message,
        operator: 'exists',
      })

      return
    }

    const onDiskContents = await this.fs.contents(filePath)

    /**
     * Contains a substring
     */
    if (typeof substring === 'string') {
      this.evaluate(
        onDiskContents.includes(substring),
        'expected #{this} file contents to contain #{exp}',
        {
          thisObject: filePath,
          expected: substring,
          actual: onDiskContents,
          prefix: message,
          operator: 'containsSubset',
        }
      )

      return
    }

    this.evaluate(
      substring.test(onDiskContents),
      'expected #{this} file contents to match #{exp}',
      {
        thisObject: filePath,
        expected: substring,
        actual: onDiskContents,
        prefix: message,
        showDiff: false,
        operator: 'strictEqual',
      }
    )
  }
)

Assert.macro(
  'fileSameAs',
  async function (this: Assert, filePath: string, otherFilePath: string, message?: string) {
    this.incrementAssertionsCount()

    const hasFile = await this.fs.exists(filePath)
    if (!hasFile) {
      this.evaluate(hasFile, 'expected #{this} file to exist', {
        thisObject: filePath,
        expected: '',
        actual: '',
        showDiff: false,
        prefix: message,
        operator: 'exists',
      })
      return
    }

    const hasOtherFile = await this.fs.exists(otherFilePath)
    if (!hasOtherFile) {
      this.evaluate(hasOtherFile, 'expected comparing file #{this} to exist', {
        thisObject: otherFilePath,
        expected: '',
        actual: '',
        showDiff: false,
        prefix: message,
        operator: 'exists',
      })
      return
    }

    const onDiskContents = await this.fs.contents(filePath)
    const otherFileContents = await this.fs.contents(otherFilePath)

    this.evaluate(
      onDiskContents === otherFileContents,
      'expected #{this} file contents to equal #{exp}',
      {
        thisObject: filePath,
        expected: otherFileContents,
        actual: onDiskContents,
        prefix: message,
        operator: 'strictEqual',
      }
    )
  }
)

Assert.macro('fileIsEmpty', async function (this: Assert, filePath: string, message?: string) {
  this.incrementAssertionsCount()

  const hasFile = await this.fs.exists(filePath)
  if (!hasFile) {
    this.evaluate(hasFile, 'expected #{this} file to exist', {
      thisObject: filePath,
      expected: '',
      actual: '',
      showDiff: false,
      prefix: message,
      operator: 'exists',
    })

    return
  }

  const onDiskContents = await this.fs.contents(filePath)
  this.evaluate(onDiskContents.trim() === '', 'expected #{this} file to be empty', {
    thisObject: filePath,
    expected: '',
    actual: onDiskContents,
    prefix: message,
    operator: 'strictEqual',
  })
})

Assert.macro('fileIsNotEmpty', async function (this: Assert, filePath: string, message?: string) {
  this.incrementAssertionsCount()

  const hasFile = await this.fs.exists(filePath)
  if (!hasFile) {
    this.evaluate(hasFile, 'expected #{this} file to exist', {
      thisObject: filePath,
      expected: '',
      actual: '',
      showDiff: false,
      prefix: message,
      operator: 'exists',
    })

    return
  }

  const onDiskContents = await this.fs.contents(filePath)
  this.evaluate(onDiskContents.trim() !== '', 'expected #{this} file to be not empty', {
    thisObject: filePath,
    expected: '',
    showDiff: false,
    actual: onDiskContents,
    prefix: message,
    operator: 'notStrictEqual',
  })
})

Assert.macro('dirExists', async function (this: Assert, dirPath: string, message?: string) {
  this.incrementAssertionsCount()

  const hasDir = await this.fs.exists(dirPath)
  this.evaluate(hasDir, 'expected #{this} directory to exist', {
    thisObject: dirPath,
    expected: '',
    actual: '',
    showDiff: false,
    prefix: message,
    operator: 'exists',
  })
})

Assert.macro('dirNotExists', async function (this: Assert, dirPath: string, message?: string) {
  this.incrementAssertionsCount()

  const hasDir = await this.fs.exists(dirPath)
  this.evaluate(!hasDir, 'expected #{this} directory to not exist', {
    thisObject: dirPath,
    expected: '',
    actual: '',
    showDiff: false,
    prefix: message,
    operator: 'notExists',
  })
})

Assert.macro('hasFiles', async function (this: Assert, files: string[], message?: string) {
  this.incrementAssertionsCount()

  const directoryFiles = await this.fs.readDir()
  const directoryFilesPaths = directoryFiles.map((file) => slash(file.path))
  const hasAllFiles = files.every((file) =>
    directoryFilesPaths.find((directoryFilePath) => directoryFilePath === file)
  )

  this.evaluate(hasAllFiles, 'expected file system to have #{exp} files', {
    thisObject: '',
    expected: files,
    actual: directoryFilesPaths,
    showDiff: true,
    prefix: message,
    operator: 'deepStrictEqual',
  })
})

Assert.macro('doesNotHaveFiles', async function (this: Assert, files: string[], message?: string) {
  this.incrementAssertionsCount()

  const directoryFiles = await this.fs.readDir()
  const directoryFilesPaths = directoryFiles.map((file) => slash(file.path))
  const doesNotHaveAllFiles = files.every(
    (file) => !directoryFilesPaths.find((directoryFilePath) => directoryFilePath === file)
  )

  this.evaluate(doesNotHaveAllFiles, 'expected file system to not have #{exp} files', {
    thisObject: '',
    expected: directoryFilesPaths,
    actual: files,
    showDiff: true,
    prefix: message,
    operator: 'deepStrictNotEqual',
  })
})

Assert.macro('dirIsEmpty', async function (this: Assert, dirPath?: string, message?: string) {
  this.incrementAssertionsCount()

  const hasDir = dirPath ? await this.fs.exists(dirPath) : true
  if (!hasDir) {
    this.evaluate(hasDir, 'expected #{this} directory to exist', {
      thisObject: dirPath,
      expected: '',
      actual: '',
      showDiff: false,
      prefix: message,
      operator: 'exists',
    })

    return
  }

  const directoryFiles = await this.fs.readDir(dirPath)
  const isEmpty = directoryFiles.length === 0

  if (!isEmpty && dirPath) {
    this.evaluate(isEmpty, 'expected #{this} directory to be empty', {
      thisObject: dirPath,
      expected: [],
      actual: directoryFiles.map(({ path }) => slash(path)),
      showDiff: true,
      prefix: message,
      operator: 'deepStrictEqual',
    })

    return
  }

  if (!isEmpty) {
    this.evaluate(isEmpty, 'expected file system base directory to be empty', {
      thisObject: '',
      expected: [],
      actual: directoryFiles.map(({ path }) => slash(path)),
      showDiff: true,
      prefix: message,
      operator: 'deepStrictEqual',
    })
  }
})

Assert.macro('dirIsNotEmpty', async function (this: Assert, dirPath?: string, message?: string) {
  this.incrementAssertionsCount()

  const hasDir = dirPath ? await this.fs.exists(dirPath) : true
  if (!hasDir) {
    this.evaluate(hasDir, 'expected #{this} directory to exist', {
      thisObject: dirPath,
      expected: '',
      actual: '',
      showDiff: false,
      prefix: message,
      operator: 'exists',
    })

    return
  }

  const directoryFiles = await this.fs.readDir(dirPath)
  const hasFiles = directoryFiles.length > 0

  if (!hasFiles && dirPath) {
    this.evaluate(hasFiles, 'expected #{this} directory to be not empty', {
      thisObject: dirPath,
      expected: [],
      actual: [],
      showDiff: false,
      prefix: message,
      operator: 'deepStrictNotEqual',
    })

    return
  }

  if (!hasFiles) {
    this.evaluate(hasFiles, 'expected file system base directory to be not empty', {
      thisObject: '',
      expected: [],
      actual: [],
      showDiff: false,
      prefix: message,
      operator: 'deepStrictNotEqual',
    })
  }
})
