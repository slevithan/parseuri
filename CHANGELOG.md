# v2.1.0

**Improvements**

- Added JSDoc TypeScript definitions.
- Added support for removing second-level domain extensions by calling `setSld` with an empty object.
- For better predictability, removed the built-in but extremely limited second-level domain list that was included for illustrative purposes. Consider using [this list](https://github.com/slevithan/parseuri/blob/1f681a19829339035457ad922ce27fb22b0acaf7/src/index.js#L117-L119) if you need SLD support.

# v2.0.0

This is a major, breaking change that comes 17 years after v1.2.2. It updates `parseUri`’s API, adds new features, includes bug/security fixes, adds tests, uses modern JavaScript, becomes a truly universal URI parser, and remains tiny.

**Breaking Changes**

- Renamed many URI part properties to better mach the built-in `URL` object and other URI libraries: `source`➜`href`, `userInfo`➜`userinfo`, `host`➜`hostname`, `relative`➜`resource`, `path`➜`pathname`, `file`➜`filename`, `anchor`➜`fragment`, `queryKey`➜`queryParams`.
- Updated `queryParams` to be returned as a `URLSearchParams` object, with support for multiple query keys with the same name.
- Now uses what used to be called strict parsing mode by default.
- The parsing mode is now specified via an argument (options: `'default'`, `'friendly'`).
- Friendly parsing mode (formerly called loose mode) is now consistent with default mode in considering `'/entry'` to include `{filename: 'entry'}` rather than treating `'entry'` as part of `directory`.
- Removed `parseUri.options` properties, including the ability to rename URI keys or provide a non-standard query parser.

**Improvements**

- Added six additional URI parts to result objects: `origin`, `host`, `subdomain`, `domain`, `tld`, `suffix`.
  - `tld` includes limited/extensible support for second-level domains.
- Added support for IPv6 addresses.
- Improved handling for web protocol (`http`, `https`, `ws`, `wss`, `ftp`) and protocol-relative URLs, for better parsing accuracy and security.
- Improved handling for URNs.
- Added an extensive test suite.
- Added a demo page for testing and comparison with v1, the built-in `URL` constructor, and URI.js.

**Bug Fixes**

- Fixed an issue where an `@` sign in the resource led to incorrect parsing.
- Fixed numerous additional edge cases with atypical/invalid URIs.
