# parseUri

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]

`parseUri` is a mighty but tiny JavaScript URI/URN/URL parser that splits any URI into its parts (all of which are optional). Its combination of accuracy, comprehensiveness, and brevity is unrivaled (< 1KB min/gzip, with no dependencies).

## Breaking changes

Version 2 was a major, breaking change that might require updating URI part names in your code and/or providing `'friendly'` as a second argument to preserve the previous default handling of relative paths. See details in the [v2 release notes](https://github.com/slevithan/parseuri/releases/tag/v2.0.0), and compare results with v1.2.2 on the [demo page](https://slevithan.github.io/parseuri/demo/?compareV1=true&friendlyMode=true). Version 3 was a minor update published on npm as pure ESM.

## Compared to the `URL` constructor

`parseUri` includes several advantages over JavaScript’s built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL):

* It gives you many additional properties (`authority`, `userinfo`, `subdomain`, `domain`, `tld`, `resource`, `directory`, `filename`, `suffix`) that aren’t available from `URL`.
* `URL` throws e.g. if not given a protocol, and in many other cases of valid (but not supported) and invalid URIs. `parseUri` makes a best case effort even with partial or invalid URIs and is extremely good with edge cases.
* `URL`’s rules don’t allow correctly handling many non-web protocols. For example, `URL` doesn’t throw on any of `'git://localhost:1234'`, `'ssh://myid@192.168.1.101'`, or `'t2ab:///path/entry'`, but it also doesn’t get their details correct since it treats everything after `<non-web-protocol>:` up to `?` or `#` as part of the `pathname`.
* `parseUri` includes a “friendly” parsing mode (in addition to its default mode) that handles human-friendly URLs like `'example.com/file.html'` as expected.
* `parseUri` supports providing a list of second-level domains that should be treated as part of the top-level domain (ex: `co.uk`).

Conversely, `parseUri` is single-purpose and doesn’t apply normalization.

You can compare with `URL`’s results on the [demo page](https://slevithan.github.io/parseuri/demo/?urlStandard=true).

## Results / URI parts

Returns an object with 20 URI parts as properties plus `queryParams`, a [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object that includes methods `get(key)`, `getAll(key)`, etc.

Here’s an example of what each part contains:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  href                                                    │
├────────────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│                             origin                             │                resource                 │
├──────────┬─┬───────────────────────────────────────────────────┼──────────────────────┬───────┬──────────┤
│ protocol │ │                     authority                     │       pathname       │ query │ fragment │
│          │ ├─────────────────────┬─────────────────────────────┼───────────┬──────────┤       │          │
│          │ │      userinfo       │            host             │ directory │ filename │       │          │
│          │ ├──────────┬──────────┼──────────────────────┬──────┤           ├─┬────────┤       │          │
│          │ │ username │ password │       hostname       │ port │           │ │ suffix │       │          │
│          │ │          │          ├───────────┬──────────┤      │           │ ├────────┤       │          │
│          │ │          │          │ subdomain │  domain  │      │           │ │        │       │          │
│          │ │          │          │           ├────┬─────┤      │           │ │        │       │          │
│          │ │          │          │           │    │ tld │      │           │ │        │       │          │
"  https   ://   user   :   pass   @ sub1.sub2 . dom.com  : 8080   /p/a/t/h/  a.html    ?  q=1  #   hash   "
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> If this chart isn’t appearing correctly, view it on [GitHub](https://github.com/slevithan/parseuri/blob/main/README.md#results--uri-parts).

`parseUri` additionally supports IPv4 and IPv6 addresses, URNs, and many edge cases not shown here. See the extensive [tests](https://slevithan.github.io/parseuri/spec/). References include [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) and [WHATWG URL](https://url.spec.whatwg.org/).

## Parsing modes

`parseUri` has two parsing modes (default and friendly), specified via an optional second argument:

```js
// Default mode
parseUri(uri);
// Also default mode
parseUri(uri, 'default');
// Friendly mode
parseUri(uri, 'friendly');
```

The default mode follows official URI standards, whereas friendly mode handles human-friendly URLs like `'example.com/file.html'` as expected. Results are identical for any URI that starts with `<protocol>://`, `<web-protocol>:`, `:`, `//`, `/`, `\`, `?`, or `#`.

To be precise, the only difference is that friendly mode doesn’t require `<protocol>:`, `:`, `//`, or other repeating slashes to signal the start of an authority. This has the following effects:

- It allows starting a URI with an authority, such as `'example.com'`.
- It therefore precludes proper handling for relative paths (without a leading `/` or `\`) such as `'dir/file.html'`. Friendly mode considers this example to start with hostname `dir`.
- It avoids requiring `//` after a non-web protocol.
  - The “web protocols” are `http`, `https`, `ws`, `wss`, and `ftp`. They never require `//`, and friendly mode extends this handling to non-web protocols.

You can compare results of the default and friendly modes on the [demo page](https://slevithan.github.io/parseuri/demo/?friendlyMode=true).

## Examples

```js
let uri = parseUri('https://a.b.example.com:80/@user/a/my.img.jpg?q=x&q=#hash');
uri.protocol // → 'https'
uri.host // → 'a.b.example.com:80'
uri.hostname // → 'a.b.example.com'
uri.subdomain // → 'a.b'
uri.domain // → 'example.com'
uri.port // → '80'
uri.resource // → '/@user/a/my.img.jpg?q=x&q=#hash'
uri.pathname // → '/@user/a/my.img.jpg'
uri.directory // → '/@user/a/'
uri.filename // → 'my.img.jpg'
uri.suffix // → 'jpg'
uri.query // → 'q=x&q='
uri.fragment // → 'hash'
uri.queryParams.get('q') // → 'x'
uri.queryParams.getAll('q') // → ['x', '']
uri.queryParams.get('not-present') // → null
uri.queryParams.getAll('not-present') // → []
// Also available: href, origin, authority, userinfo, username, password, tld

// Relative path
uri = parseUri('dir/file.html?q=x');
uri.hostname // → ''
uri.directory // → 'dir/'
uri.filename // → 'file.html'
uri.query // → 'q=x'

// Friendly mode allows starting with an authority
uri = parseUri('example.com/file.html', 'friendly');
uri.hostname // → 'example.com'
uri.directory // → '/'
uri.filename // → 'file.html'

// IPv4 address
uri = parseUri('ssh://myid@192.168.1.101');
uri.protocol // → 'ssh'
uri.username // → 'myid'
uri.hostname // → '192.168.1.101'
uri.domain // → ''

// IPv6 address
uri = parseUri('https://[2001:db8:85a3::7334]:80?q=x');
uri.hostname // → '[2001:db8:85a3::7334]'
uri.port // → '80'
uri.domain // → ''
uri.query // → 'q=x'

// Mailto
uri = parseUri('mailto:me@my.com?subject=Hey&body=Sign%20me%20up!');
uri.protocol // → 'mailto'
uri.authority // → ''
uri.username // → ''
uri.hostname // → ''
uri.pathname // → 'me@my.com'
uri.query // → 'subject=Hey&body=Sign%20me%20up!'
uri.queryParams.get('body') // → 'Sign me up!'

// Mailto in friendly mode
uri = parseUri('mailto:me@my.com', 'friendly');
uri.protocol // → 'mailto'
uri.authority // → 'me@my.com'
uri.username // → 'me'
uri.hostname // → 'my.com'
uri.pathname // → ''

/* Also supports e.g.:
- https://[2001:db8:85a3::7334%en1]/ipv6-with-zone-identifier
- git://localhost:1234
- file:///path/file
- tel:+1-800-555-1212
- urn:uuid:c5542ab6-3d96-403e-8e6b-b8bb52f48d9a?q=x
*/
```

Test and compare results on the [demo page](https://slevithan.github.io/parseuri/demo/).

## Install and use

```bash
npm install parseuri
```

```js
import { parseUri, setTlds } from 'parseuri';
```

In browsers:

```html
<script src="https://cdn.jsdelivr.net/npm/parseuri/dist/parseuri.min.js"></script>
<script>
  console.log(parseUri('https://example.com/'));
  // If needed, use `parseUri.setTlds`
</script>
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/parseuri?color=78C372
[npm-version-href]: https://npmjs.com/package/parseuri
[npm-downloads-src]: https://img.shields.io/npm/dm/parseuri?color=78C372
[npm-downloads-href]: https://npmjs.com/package/parseuri
[bundle-src]: https://img.shields.io/bundlejs/size/parseuri?color=78C372&label=minzip
[bundle-href]: https://bundlejs.com/?q=parseuri&treeshake=[*]
