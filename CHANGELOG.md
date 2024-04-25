# vNext

This is a minor update, but includes a breaking change for a minor feature.

**Breaking Changes**

- Renamed `setSld` as `setTlds`, and removed the extremely limited, built-in list of top-level domains (TLDs) that was included for illustrative purposes.

**New Features**

- Can remove TLD extensions by calling `setTlds` with an empty object.
- Can provide multi-level extentions for TLDs.

**Improvements**

- Added JSDoc TypeScript definitions.
- Improved the demo page with additional options, etc.

# v2.0.0

This is a major, breaking change that comes 17 years after v1.2.2. It updates `parseUri`’s API, adds new features, includes bug/security fixes, adds tests, uses modern JavaScript, becomes a truly universal URI parser, and remains tiny.

**Breaking Changes**

- Renamed many URI part properties to better mach the built-in `URL` object and other URI libraries: `source`➜`href`, `userInfo`➜`userinfo`, `host`➜`hostname`, `relative`➜`resource`, `path`➜`pathname`, `file`➜`filename`, `anchor`➜`fragment`, `queryKey`➜`queryParams`.
- Updated `queryParams` to be returned as a `URLSearchParams` object, with support for multiple query keys with the same name.
- Now uses what used to be called strict parsing mode by default.
- The parsing mode is now specified via an argument (options: `'default'`, `'friendly'`).
- Friendly parsing mode (formerly called loose mode) is now consistent with default mode in considering `'/entry'` to include `{filename: 'entry'}` rather than treating `'entry'` as part of `directory`.
- Removed `parseUri.options` properties, including the ability to rename URI keys or provide a non-standard query parser.

**New Features**

- Added six additional URI parts to result objects: `origin`, `host`, `subdomain`, `domain`, `tld`, `suffix`.
  - `tld` includes limited/extensible support for second-level domains.

**Improvements**

- Added support for IPv6 addresses.
- Improved handling for web protocol (`http`, `https`, `ws`, `wss`, `ftp`) and protocol-relative URLs, for parsing accuracy and security.
- Improved handling for URNs.
- Added an extensive test suite.
- Added a demo page for testing and comparison with v1, the built-in `URL` constructor, and other libraries.

**Bug Fixes**

- Fixed an issue where an `@` sign in the resource led to incorrect parsing.
- Fixed numerous additional edge cases with atypical/invalid URIs.
