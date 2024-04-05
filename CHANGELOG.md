# v2.0.0

**Breaking Changes**

- Renamed many URI part properties to better mach the built-in `URL` object and other URI libraries: `source`➜`href`, `userInfo`➜`userinfo`, `host`➜`hostname`, `relative`➜`resource`, `path`➜`pathname`, `file`➜`filename`, `anchor`➜`fragment`, `queryKey`➜`queryParams`.
- Updated `queryParams` to be returned as a `URLSearchParams` object, with support for multiple query keys with the same name.
- Now uses what used to be called strict parsing mode by default.
- The parsing mode is now specified via an argument. Options: `'default'`, `'friendly'`.
- Friendly (formerly called loose) parsing mode is now consistent with default mode in considering `'/entry'` to include `{filename: 'entry'}` rather than treating `'entry'` as part of `directory`.
- Removed `parseUri.options` properties, including the ability to rename URI keys or provide a non-standard query parser.

**Improvements**
- Added six additional URI parts to result objects: `origin`, `host`, `subdomain`, `domain`, `tld`, `suffix`.
  - `tld` includes basic/extensible support for second-level domains.
- Added support for IPv6 addresses.
- Improved handling for web protocol (`http`, `https`, `ftp`, `ws`, `wss`) and protocol-relative URLs, for better parsing accuracy and security.
- Improved handling for URNs.
- Added an extensive test suite.
- Added a demo page for testing and comparison with v1, the built-in `URL` constructor, and URI.js.

**Bug Fixes**
- Fixed an issue where an `@` sign in the resource led to incorrect parsing.
- Fixed numerous additional edge cases with atypical and invalid URIs.
