Code Studio Piskel
======

[![Travis Status](https://api.travis-ci.org/code-dot-org/piskel.png?branch=master)](https://travis-ci.org/code-dot-org/piskel)

This is a custom version of the excellent [Piskel Editor](https://github.com/juliandescottes/piskel) by [@juliandescottes](https://github.com/juliandescottes) and [@grosbouddha](https://github.com/grosbouddha), designed for embedded use with the Code.org Code Studio learning platform.  For more information on using or developing Piskel, please see [the main repository](https://github.com/juliandescottes/piskel).

This project is published on npm as [@code-dot-org/piskel](https://www.npmjs.com/package/@code-dot-org/piskel).

## Using this package

Install the package from npm:

```
npm install @code-dot-org/piskel
```

This will install the release build of Piskel to `node_modules/@code-dot-org/piskel`.  The application root is at `node_modules/@code-dot-org/piskel/dest/prod`.  You can run the static version of Piskel by opening `index.html` in that folder.

A `piskel-root` utilty is also installed at `node_modules/.bin/piskel-root` that prints the absolute path to the application root.  It's recommended that you depend on this utility in any build scripts to be resilient against future changes to the internal layout of the Piskel package.

## Local Development Setup

Note: To run local integration tests you should install CasperJS 1.0.2 (not included as a dependency in this repo) and make sure it has access to PhantomJS 1.9.2 (downloaded to node_modules/.bin on `npm install` but not necessarily in your PATH).

## Local Development Between code-dot-org and forked piskel repo
If you want the Code.org repo to point to the local version of the Piskel you are working on, your apps package must be linked to a local development copy of the Piskel repository with a complete dev build. 

**[You can also find the steps below in apps/Gruntfile.js of the code-dot-org repo](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/Gruntfile.js)**

### The Steps:
1. `git clone https://github.com/code-dot-org/piskel.git <new-directory>`
2. `cd <new-directory>`
3. `npm install && grunt build-dev`
4. `npm link`
5. `cd <code-dot-org apps directory>`
6. `npm link @code-dot-org/piskel`
7. rerun your previous command	

You can do all of this in one command. Where `cd piskel` is the cloned piskel repo: 
- `cd piskel && npm install && grunt build-dev && npm link && cd ../code-dot-org/apps && npm link @code-dot-org/piskel`

## Contributing
**More on contributing can be found in the [main Piskel repo](https://github.com/piskelapp/piskel/wiki#contributing)**

### Prerequisite
To build Piskel, you need to :
- install node and grunt-cli npm install grunt-cli -g.
- clone the repository https://github.com/juliandescottes/piskel.git
- run npm install

### Grunt build targets
#### serve
`grunt serve` will:
- build the application
- start a server on port 9001 (serving `dest` folder)
- open a browser on `http://localhost:9001`
- watch for changes, and rebuild the application if needed

#### Note: Using `grunt serve --force`
- If you try grunt serve and it is aborted due to warnings do `grunt serve --force`

## Publishing a new version

This repository depends on a Node version >=7. Please use Node >=7 when building and updating
new releases of this Piskel to NPM.

To publish a new version to npm switch to the master branch, use `npm login` to sign in as an account with access to the `@code-dot-org` scope, then `npm version [major|minor|patch]` for the appropriate version bump.  This will do the following:

* Run linting and tests to verify your local repo.
* Rebuild the release package.
* Bump the version, adding a corresponding commit and version tag.
* Push the commit and tag to github.
* Publish the new release package to npm.

## Internationalization (i18n)
The Piskel UI can support different languages by setting the `window.piskel_locale` to a four letter locale code, i.e. `en_us`, `es_mx`, etc.

The available strings are in `i18n/locales` directory and each locale has its own file. For example: `en_us.json` where `en` is English and `us` is United States
Note that en_us.json should contain all available strings because this is the locale other languages will fallback to if a translation from English doesn't exist.

The strings for all the languages are loaded into `window.piskel_locales` and the language specific strings can be accessed using the four letter locale code. For example:
```
var i18n = window.piskel_locales[window.piskel_locale];
console.log(i18n.simplePenDrawingTool());
```

The JSON files are converted to Javascript files during the build in `tasks/build-i18n.js`.  The [MessageFormat](http://messageformat.github.io/messageformat/) library is used to convert the static JSON strings into Javascript functions so dynamic content can be injected into the strings.

## License

Code Studio Piskel is Copyright 2016 Code.org

Piskel is Copyright 2016 Julian Descottes

Both are licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
