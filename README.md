# parseUri 2.0.0

`parseUri` is a mighty but tiny URI/URN/URL parser that splits any URI into its parts (all of which are optional). Its combination of accuracy, flexibility, and brevity is unrivaled (1KB min/gzip, with no dependencies).

## Compared to built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)

* `URL` throws e.g. if not given a protocol, and in many other cases of valid (but not supported) and invalid URIs. `parseUri` makes a best case effort even with partial or invalid URIs and is extremely good with edge cases.
* `URL`’s rules don’t allow correctly handling non-web protocols. For example, `URL` doesn’t throw on any of `'git://localhost:1234'`, `'ssh://myid@192.168.1.101'`, or `'t2ab:///path/entry'`, but it also doesn’t get their details correct since it treats everything after `<non-web-protocol>:` up to `?` or `#` as part of the `pathname`.
* `parseUri` gives you many additional properties (`authority`, `userinfo`, `subdomain`, `domain`, `tld`, `resource`, `directory`, `filename`, `suffix`) that aren’t available from `URL`.
* `parseUri` includes partial (extensible) support for second-level domains like in `'//example.co.uk'`.

Conversely, `parseUri` is single-purpose and doesn’t do normalization. But of course you can pass URIs through a normalizer separately, if you need that. Or, if you wanted to create an exceptionally lightweight normalizer, `parseUri` would be a great base to build on top of. 😊

## Results / URI parts

Returns an object with 20 URI part properties plus `queryParams`, a [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object that includes `.get(key)`, `.getAll(key)`, etc. Here’s an example of what each part contains:

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

`parseUri` additionally supports IPv4 and IPv6 addresses, URNs, and many edge cases not shown here.

## Parsing modes

`parseUri` has two parsing modes: `'default'` and `'friendly'`. Default mode follows official URI rules. Friendly mode doesn’t require `'<protocol>:'`, `':'`, or `'//'` to signal the start of an authority, which allows handling human-friendly URLs like `'example.com/index.html'` as expected. For completeness, note that this change has several effects:

- It allows starting a URI with an authority (as noted above).
- Since the web protocols `http`, `https`, `ftp`, `ws`, and `wss` don’t require `'//'`, this also means that friendly mode extends this behavior to non-web protocols.
- It precludes friendly mode from properly handling relative paths (that don’t start from root `'/'`) such as `'dir/file.html'`.

## Usage examples

```js
let uri = parseUri('https://a.b.example.com:80/@user/a/my.img.jpg?q=x&q=#start');

uri.protocol === 'https';
uri.host === 'a.b.example.com:80';
uri.hostname === 'a.b.example.com';
uri.subdomain === 'a.b';
uri.domain === 'example.com';
uri.port === '80';
uri.resource === '/@user/a/my.img.jpg?q=x&q=#start';
uri.pathname === '/@user/a/my.img.jpg';
uri.directory === '/@user/a/';
uri.filename === 'my.img.jpg';
uri.suffix === 'jpg';
uri.query === 'q=x&q=';
uri.fragment === 'start';
uri.queryParams.get('q') === 'x';
uri.queryParams.getAll('q'); // → ['x', '']
// also available: href, origin, authority, userinfo, username, password, tld

uri = parseUri('./file.html?a=1');

uri.directory === './';
uri.filename === 'file.html';
uri.query === 'a=1';

// friendly mode allows starting with an authority
uri = parseUri('example.com/index.html', 'friendly');

uri.hostname === 'example.com';
uri.directory === '/';
uri.filename === 'index.html';

// compare the friendly mode example above with default mode
uri = parseUri('example.com/index.html');

uri.hostname === '';
uri.directory === 'example.com/';
uri.filename === 'index.html';

// IPv4 address
uri = parseUri('ssh://myid@192.168.1.101');

uri.protocol === 'ssh';
uri.username ==== 'myid';
uri.hostname === '192.168.1.101';
uri.domain === '';

// IPv6 address
uri = parseUri('https://[2001:db8:85a3::7334]:80?q=x');

uri.hostname === '[2001:db8:85a3::7334]';
uri.port === '80';
uri.domain === '';
uri.query === 'q=x';

// URN
uri = parseUri('mailto:first@example.com,second@example.com?subject=Subscribe&body=Sign%20me%20up!');

uri.protocol === 'mailto';
uri.hostname === '';
uri.pathname === 'first@example.com,second@example.com';
uri.queryParams.get('subject') === 'Subscribe';
uri.queryParams.get('body') === 'Sign me up!';

/* Also supports e.g.:
https://[2001:db8:85a3::7334%en1]/ipv6-with-zone-identifier
git://localhost:1234
file:///path/file
tel:+1-800-555-1212
urn:uuid:c5542ab6-3d96-403e-8e6b-b8bb52f48d9a?q=x
*/
```

Use `parseUri`’s [demo page](https://slevithan.github.io/parseuri/demo/) to easily test and compare results.
