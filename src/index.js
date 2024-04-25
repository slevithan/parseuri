//! parseUri 2.1.0; Steven Levithan; MIT License
/* A mighty but tiny URI/URN/URL parser; splits any URI into its parts (all of which are optional).
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
Also supports IPv4/IPv6 addresses, URNs, and many edge cases not shown here. Supports providing a
list of second-level domains that should be treated as part of the top-level domain (ex: co.uk) */

/**
 * @typedef {Object} ParseUriObject
 * @prop {string} href
 * @prop {string} origin
 * @prop {string} protocol
 * @prop {string} authority
 * @prop {string} userinfo
 * @prop {string} username
 * @prop {string} password
 * @prop {string} host
 * @prop {string} hostname
 * @prop {string} subdomain
 * @prop {string} domain
 * @prop {string} tld
 * @prop {string} port
 * @prop {string} resource
 * @prop {string} pathname
 * @prop {string} directory
 * @prop {string} filename
 * @prop {string} suffix
 * @prop {string} query
 * @prop {string} fragment
 * @prop {URLSearchParams} queryParams
 */

/**
 * Splits any URI into its parts.
 * @param {string} uri
 * @param {'default' | 'friendly'} [mode] Parsing mode. Default follows official URI rules.
 * Friendly handles human-friendly URLs like `'example.com/index.html'` as expected.
 * @returns {ParseUriObject} Object with URI parts, plus `queryParams`.
 */
function parseUri(uri, mode = 'default') {
  uri = uri.trim();
  const {groups} = cache.parser[mode].exec(uri);
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
    ...(cache.tlds?.exec(result.hostname)?.groups),
    queryParams: new URLSearchParams(`?${result.query}`),
  });
}

const blankUrnProps = {
  directory: '',
  filename: '',
  suffix: '',
};

function getParser(mode) {
  // forward and backslashes have lost all meaning for web protocols (http, https, ws, wss, ftp)
  // and protocol-relative URLs. also handle multiple colons in protocol delimiter for security
  const authorityDelimiter = String.raw`(?:(?:(?<=^(?:https?|wss?|ftp):):*|^:+)[\\/]*|^[\\/]{2,}|//)`;
  const authority = {
    default: {start: `(?<hasAuth>${authorityDelimiter}`, end: ')?'},
    friendly: {start: `(?<hasAuth>${authorityDelimiter}?)`, end: ''},
  };
  // see `free-spacing-regex.md`
  return RegExp(String.raw`^(?<origin>(?:(?<protocol>[a-z][^\s:@\\/?#.]*):)?${authority[mode].start}(?<authority>(?:(?<userinfo>(?<username>[^:@\\/?#]*)(?::(?<password>[^\\/?#]*))?)?@)?(?<host>(?<hostname>\d{1,3}(?:\.\d{1,3}){3}(?=[:\\/?#]|$)|\[[a-f\d]{0,4}(?::[a-f\d]{0,4}){2,7}(?:%[^\]]*)?\]|(?<subdomain>[^:\\/?#]*?)\.??(?<domain>(?:[^.:\\/?#]*\.)?(?<tld>[^.:\\/?#]*))(?=[:\\/?#]|$))?(?::(?<port>[^:\\/?#]*))?))${authority[mode].end})(?<resource>(?<pathname>(?<directory>(?:[^\\/?#]*[\\/])*)(?<filename>(?:[^.?#]+|\.(?![^.?#]+(?:[?#]|$)))*(?:\.(?<suffix>[^.?#]+))?))(?:\?(?<query>[^#]*))?(?:\#(?<fragment>.*))?)`, 'i');
}

const cache = {
  parser: {
    default: getParser('default'),
    friendly: getParser('friendly'),
  },
};

/**
 * Set second-level domains recognized as part of the TLD (ex: co.uk).
 * @example
 * setTlds({
 *   au: 'com edu gov id net org',
 *   uk: 'co gov me net org sch',
 * });
 * @param {Object} obj Object with TLDs as keys and their SLDs as space-separated strings.
 */
function setTlds(obj) {
  const entries = Object.entries(obj);
  let parser;
  if (entries.length) {
    const tlds = entries.map(([key, value]) => `(?:${value.trim().replace(/\s+/g, '|')})\\.${key}`).join('|');
    parser = RegExp(`^(?<subdomain>.*?)\\.??(?<domain>(?:[^.]*\\.)?(?<tld>${tlds}))$`, 'is');
  }
  cache.tlds = parser;
}
// Note: The URI.js library has a robust list that can be used directly by `setTlds`:
// > <script src="https://cdn.jsdelivr.net/npm/urijs@1.19.11/src/SecondLevelDomains.js"></script>
// > <script>parseUri.setTlds(SecondLevelDomains.list)</script>

export {parseUri, setTlds};
