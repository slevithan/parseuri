//! parseUri 2.0.0; Steven Levithan; MIT License
/* Mighty but tiny URI/URN/URL parser; splits any URI into its parts (all of which are optional).
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
Also supports IPv4 and IPv6 addresses, URNs, and many edge cases not shown here. Includes partial
(extensible) support for second-level domains like in '//example.co.uk'.
*/

/**
 * Splits any URI into its parts.
 *
 * @param {String} uri Any URI.
 * @param {String} [mode] Parsing mode: `'default'` or `'friendly'`. Default follows official URI
 *   rules. Friendly handles human-friendly URLs like `'example.com/index.html'` as expected.
 * @returns {Object} Object with URI parts. Includes `queryParams`, a `URLSearchParams` object.
 */
function parseUri(uri, mode = 'default') {
  const {groups} = cache.parser[mode].exec(uri = uri.trim());
  const result = {
    href: uri,
    ...groups,
    // URNs: if we have an authority (contained in `hasAuth`), keep dir/file, else remove because
    // they don't apply. `hasAuth` indicates participation in the match, but it could be empty
    ...(groups.protocol && groups.hasAuth == null ? blankUrnProps : null),
  };
  delete result.hasAuth;
  // replace `undefined` for non-participating capturing groups
  Object.keys(result).forEach(key => result[key] ??= '');
  return Object.assign(result, {
    queryParams: new URLSearchParams(`?${result.query}`),
    // SLDs: handle known second-level domains like '.co.uk'
    ...(cache.sld.exec(result.hostname)?.groups),
  });
}

const blankUrnProps = {
  directory: '',
  filename: '',
  suffix: '',
};

function getParser(mode) {
  // slashes and backslashes have lost meaning for the web protocols (http, https, ftp, ws, wss)
  // and protocol-relative URLs. also handle multiple colons in protocol delimiter for security
  const authorityDelimiter = String.raw`(?:(?:(?<=^(?:https?|ftp|wss?):):*|^:+)[\\/]*|^[\\/]{2,}|//)`;
  const authority = {
    default: {
      start: `(?<hasAuth>${authorityDelimiter}`,
      end: ')?',
    },
    friendly: {
      start: `(?<hasAuth>${authorityDelimiter}?)`,
      end: '',
    },
  };
  return RegExp(String.raw`^(?<origin>(?:(?<protocol>[a-z][^\s:@\\/?#.]*):)?${authority[mode].start}(?<authority>(?:(?<userinfo>(?<username>[^:@\\/?#]*)(?::(?<password>[^\\/?#]*))?)?@)?(?<host>(?<hostname>\d{1,3}(?:\.\d{1,3}){3}(?=[:\\/?#]|$)|\[[a-f\d]{0,4}(?::[a-f\d]{0,4}){2,7}(?:%[^\]]*)?\]|(?<subdomain>[^:\\/?#]*?)\.??(?<domain>(?:[^.:\\/?#]*\.)?(?<tld>[^.:\\/?#]*))(?=[:\\/?#]|$))?(?::(?<port>[^:\\/?#]*))?))${authority[mode].end})(?<resource>(?<pathname>(?<directory>(?:[^\\/?#]*[\\/])*)(?<filename>(?:[^.?#]+|\.(?![^.?#]+(?:[?#]|$)))*(?:\.(?<suffix>[^.?#]+))?))(?:\?(?<query>[^#]*))?(?:\#(?<fragment>.*))?)`, 'i');
}

const cache = {
  parser: {
    default: getParser('default'),
    friendly: getParser('friendly'),
  },
};

function setSld(obj) {
  const slds = Object.entries(obj).map(
    ([key, value]) => `(?:${value.trim().replace(/\s+/g, '|')})\\.${key}`
  ).join('|');
  // could be embedded with changes in the main regex, but keep separate for simplicity and perf
  cache.sld = RegExp(String.raw`^(?<subdomain>.*?)\.??(?<domain>(?:[^.]*\.)?(?<tld>${slds}))$`, 'is');
}

/* Adds support for a very limited set of second-level domains like '.co.uk'. This default list is
mostly for illustrative purposes; replace it if you need more extensive support. The URI.js library
has a longer list that can be used directly in `parseUri`.
```html
<script src="https://cdn.jsdelivr.net/npm/urijs@1.19.11/src/SecondLevelDomains.js">
<script>
  parseUri.setSld(SecondLevelDomains.list);
</script>
``` */
setSld({
  au: 'com edu gov id net org',
  uk: 'co gov me net org sch',
});

export {parseUri, setSld};
