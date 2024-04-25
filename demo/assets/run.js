const URIPartsMap = {
  href: {
    desc: 'The full (trimmed) URI',
    parseUriV1: 'source',
    uriJs: 'href',
    urlStandard: 'href',
  },
  origin: {
    desc: 'Combines protocol and authority',
    parseUriV1: null,
    uriJs: 'origin',
    urlStandard: 'origin', // excludes userinfo
  },
  protocol: {
    desc: 'Also called the scheme',
    parseUriV1: 'protocol',
    uriJs: 'protocol', // alias: `scheme`
    urlStandard: 'protocol', // includes trailing ':'
  },
  authority: {
    desc: 'Combines userinfo and host',
    parseUriV1: 'authority',
    uriJs: 'authority',
    urlStandard: null,
  },
  userinfo: {
    desc: 'Combines username and password. Deprecated by RFC3986.',
    parseUriV1: 'userInfo', // different casing
    uriJs: 'userinfo',
    urlStandard: null,
  },
  username: {
    parseUriV1: 'user',
    uriJs: 'username',
    urlStandard: 'username',
  },
  password: {
    parseUriV1: 'password',
    uriJs: 'password',
    urlStandard: 'password',
  },
  host: {
    desc: 'Combines hostname and port',
    parseUriV1: null,
    uriJs: 'host',
    urlStandard: 'host',
  },
  hostname: {
    desc: 'Where to send the request',
    parseUriV1: 'host',
    uriJs: 'hostname',
    urlStandard: 'hostname',
  },
  subdomain: {
    parseUriV1: null,
    uriJs: 'subdomain',
    urlStandard: null,
  },
  domain: {
    desc: 'Includes tld',
    parseUriV1: null,
    uriJs: 'domain',
    urlStandard: null,
  },
  tld: {
    desc: 'Top-level domain (ex: com from example.com). Can include second-level domain (ex: co.uk) if a list is provided.',
    parseUriV1: null,
    uriJs: 'tld',
    urlStandard: null,
  },
  port: {
    parseUriV1: 'port',
    uriJs: 'port',
    urlStandard: 'port', // removes if [80, 443] and protocol is [http, https]
  },
  resource: {
    desc: 'Combines pathname, query, and fragment',
    parseUriV1: 'relative',
    uriJs: 'resource',
    urlStandard: null,
  },
  pathname: {
    desc: 'Combines directory and filename',
    parseUriV1: 'path',
    uriJs: 'pathname', // alias: `path`
    urlStandard: 'pathname',
  },
  directory: {
    parseUriV1: 'directory',
    uriJs: 'directory', // excludes trailing "/" unless directory is root
    urlStandard: null,
  },
  filename: {
    desc: 'Includes suffix',
    parseUriV1: 'file',
    uriJs: 'filename',
    urlStandard: null,
  },
  suffix: {
    desc: 'File extension (ex: jpg from photo.jpg)',
    parseUriV1: null,
    uriJs: 'suffix',
    urlStandard: null,
  },
  query: {
    desc: 'Excludes the leading ?',
    parseUriV1: 'query',
    uriJs: 'query', // also: `search` (but then includes leading '?')
    urlStandard: 'search', // includes leading '?'
  },
  fragment: {
    desc: 'Excludes the leading #. This is used by the client and isn’t sent to the server.',
    parseUriV1: 'anchor',
    uriJs: 'fragment', // also: `hash` (but then includes leading '#')
    urlStandard: 'hash', // includes leading '#'
  },
  queryParams: {
    desc: 'Object to easily access URL-decoded query parameters',
    parseUriV1: 'queryKey',
    uriJs: 'query(true)',
    urlStandard: 'searchParams',
  },
};

const libs = {
  oldVersion: 'v1.2.2',
  uriJs: 'URI.js',
  urlStandard: '<code>URL</code>',
};

const outputMsg = {
  empty: '<span class="comparison-desc">empty</span>',
  equalsDefault: '<span class="comparison-desc">same as default</span>',
  equalsDefaultAll: '<span class="comparison-desc">all same as default</span>',
  error: `<span class="no-wrap comparison-status">${svgIconHtml('warning')} throws</span>`,
  unavailable: `<span class="no-wrap comparison-status">${svgIconHtml('x')} ⁿ/ₐ</span>`,
};

const colorClass = {
  success: 'success',
  similar: 'similar',
  neutral: 'neutral',
  different: 'different',
};

function svgIconHtml(icon) {
  return `<svg class="svg-icon"><use xlink:href="#${icon}-icon"/></svg>`;
}

function getPartDesc(part) {
  const desc = URIPartsMap[part].desc;
  return desc ? `<span class="part-desc"><abbr title="${desc}">&nbsp;${svgIconHtml('info')}</abbr></span>` : '';
}

function getQueryKeyValue(value) {
  // URI.js uses null for keys not followed by '='
  return value === null ? 'null' : `'${value}'`;
}

function getQueryKeyKey(key) {
  return /^[$_\p{L}][$_\p{L}\d]*$/u.test(key) ? key : `'${key}'`;
}

// convert `URLSearchParams` (potential for multiple keys with same name) or URI `Object` to HTML string
function urlSearchParamsToHtml(searchParams) {
  let str = '<span class="query-params">';
  if (searchParams instanceof URLSearchParams) {
    str += '<span class="object-type">URLSearchParams</span>&lt;';
  // parseUri V1 and URI.js use a simple object
  } else {
    str += '{';
    searchParams = Object.entries(searchParams);
  }
  for (let [key, value] of searchParams) {
    // URI.js uses arrays for values when multiple values are provided for the same key
    if (Array.isArray(value)) {
      value = `[${value.map(getQueryKeyValue).join(', ')}]`;
    } else {
      value = getQueryKeyValue(value);
    }
    str += htmlEncode(`${getQueryKeyKey(key)}:${value}, `);
  }
  if (str.slice(-2) === ', ') {
    str = str.slice(0, -2);
  }
  str += `${searchParams instanceof URLSearchParams ? '>' : '}'}</span>`;
  return str;
}

function htmlEncode(value) {
  if (typeof value === 'string') {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }
  return value;
}

function htmlEncodeObjValues(obj) {
  return objMap(obj, htmlEncode);
}

function objMap(obj, fn) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)])
  );
}

function prepareParseUriObj(str, mode = 'default') {
  const extendTlds = document.getElementById('extendTlds').checked;
  parseUri.setTlds(extendTlds ? SecondLevelDomains.list : {});
  const obj = parseUri(str, mode);
  return {
    ...htmlEncodeObjValues(obj),
    rawQueryParams: obj.queryParams,
    queryParams: urlSearchParamsToHtml(obj.queryParams),
  };
}

function prepareParseUriV1Obj(str, mode = 'default') {
  parseUriV1_2_2.options.strictMode = mode === 'default';
  const obj = parseUriV1_2_2(str);
  const result = {};

  for (const [key, value] of Object.entries(URIPartsMap)) {
    result[key] = htmlEncode(obj[value.parseUriV1]) ?? outputMsg.unavailable;
  }
  result.rawQueryParams = result.queryParams;
  result.queryParams = urlSearchParamsToHtml(result.queryParams);
  return result;
}

function prepareUrlStandardObj(str) {
  if (!URL.canParse(str)) {
    return getErrorResultObj();
  }

  const result = {};
  const url = new URL(str);
  for (const [key, value] of Object.entries(URIPartsMap)) {
    result[key] = htmlEncode(url[value.urlStandard]) ?? outputMsg.unavailable;
  }
  result.rawQueryParams = result.queryParams;
  result.queryParams = urlSearchParamsToHtml(result.queryParams);
  return result;
}

function uriJsCanParse(str) {
  try {
    // error triggered by invalid input, e.g. non-numeric port
    URI(str);
  } catch (e) {
    return false;
  }
  return true;
}

function prepareUriJsObj(str) {
  if (!uriJsCanParse(str)) {
    return getErrorResultObj();
  }

  const result = {};
  const uri = URI(str);
  for (const [key, value] of Object.entries(URIPartsMap)) {
    // special handling because we have to call the key's function with an argument (true)
    if (key === 'queryParams') {
      const queryObj = uri.query(true);
      result.rawQueryParams = queryObj;
      result[key] = urlSearchParamsToHtml(queryObj);
    } else {
      result[key] = value.uriJs ? htmlEncode(uri[value.uriJs]()) : outputMsg.unavailable;
    }
  }
  return result;
}

function getErrorResultObj() {
  return Object.fromEntries(
    Object.keys(URIPartsMap).map(key => [key, outputMsg.error])
  );
}

function colorForKey(a, b, normalizedA) {
  if (a === b) return colorClass.success;
  if (b === outputMsg.unavailable) return colorClass.neutral;
  if (b === outputMsg.error) return colorClass.neutral;
  if (normalizedA === b && a !== b) return colorClass.similar;
  return colorClass.different;
}

function colorForUrlStandardKeyByKey(key, a, b, normalizedA) {
  if (key === 'protocol') {
    if (`${normalizedA}:` === b) return colorClass.similar;
  } else if (key === 'query') {
    if (`?${normalizedA}` === b) return colorClass.similar;
  } else if (key === 'fragment') {
    if (`#${normalizedA}` === b) return colorClass.similar;
  }
  return colorForKey(a, b, normalizedA);
}

function colorForUriJsKeyByKey(key, a, b, normalizedA) {
  if (key === 'directory') {
    if (normalizedA === `${b}/`) return colorClass.similar;
  }
  return colorForKey(a, b, normalizedA);
}

function objToUrlSearchParams(obj) {
  let q = '';
  for (let [key, value] of Object.entries(obj)) {
    q += `&${key}=${
      // URI.js uses arrays for values when multiple values are provided for the same key
      // URI.js uses null for keys not followed by '='
      Array.isArray(value) ? value.join(`&${key}=`) : (value || '')
    }`;
  }
  return new URLSearchParams(`?${q}`);
}

function colorForQueryParams(aQueryObj, bQueryObj) {
  // gives different string representations for `URLSearchParams` and `Object`
  let searchParamsStrA = urlSearchParamsToHtml(aQueryObj);
  let searchParamsStrB = urlSearchParamsToHtml(bQueryObj);

  if (searchParamsStrA === searchParamsStrB) {
    return colorClass.success;
  }

  if (!(aQueryObj instanceof URLSearchParams)) {
    aQueryObj = objToUrlSearchParams(aQueryObj);
    searchParamsStrA = urlSearchParamsToHtml(aQueryObj);
  }
  if (!(bQueryObj instanceof URLSearchParams)) {
    bQueryObj = objToUrlSearchParams(bQueryObj);
    searchParamsStrB = urlSearchParamsToHtml(bQueryObj);
  }

  if (searchParamsStrA === searchParamsStrB) {
    return colorClass.similar;
  }

  return colorClass.different;
}

function getKeyColor(key, a, b, normalizedA, options = {lib: null}) {
  if (
    key === 'queryParams' &&
    b[key] !== outputMsg.error
  ) {
    return colorForQueryParams(a.rawQueryParams, b.rawQueryParams);
  }
  if (options.lib) {
    const colorForKeyByKeyFn = {
      [libs.urlStandard]: colorForUrlStandardKeyByKey,
      [libs.uriJs]: colorForUriJsKeyByKey,
    }[options.lib];
    return colorForKeyByKeyFn(key, a[key], b[key], normalizedA[key]);
  }
  return colorForKey(a[key], b[key], normalizedA[key]);
}

function getFriendlyModeBadgeColor(key, a, b) {
  if (key === 'queryParams') {
    return colorForQueryParams(a.rawQueryParams, b.rawQueryParams);
  }
  return colorClass.different;
}

function printUriPart(part, options) {
  const classes = [];
  // this is a hack to be checking values here, but real URI-part values are HTML-encoded at this
  // point so they would never match
  if (!(part === outputMsg.error || part === outputMsg.unavailable)) {
    classes.push('uri-part');
  }
  if (options?.isV1Value) {
    classes.push('comparison-value');
  }
  return part ? `<span class="${classes.join(' ')}">${part}</span>` : outputMsg.empty;
}

function buildTableStr(key, {
    parseUriObj,
    parseUriFriendlyModeObj,
    parseUriV1Obj,
    parseUriV1FriendlyModeObj,
    urlStandardObj,
    uriJsObj,
    parseUriObjNormalizedByUrlStandard,
    parseUriObjNormalizedByUriJs,
    isParseUriDefaultFriendlyEqual,
  }) {
  const isCompareV1On = !!parseUriV1Obj;
  const parseUriV1Key = URIPartsMap[key].parseUriV1;
  const urlStandardKey = URIPartsMap[key].urlStandard;
  const uriJsKey = URIPartsMap[key].uriJs;
  const firstKey = 'href';
  // can't use rowspan="0" since as of 2024-03 its not supported in mobile Safari
  const unusedObjFullColumnCell = `<td class="neutral" rowspan="${Object.keys(URIPartsMap).length}"></td>`;
  return `
    <tr>
      ${/* Key */''}
      <td class="no-wrap">
        <b>
          ${key}
          ${getPartDesc(key)}
          ${!isCompareV1On || parseUriV1Key ? '' : `<small><span class="badge success">NEW</span></small>`}
        </b>
        ${!isCompareV1On || !parseUriV1Key || key === parseUriV1Key ? '' :
          `<br><small>└ <span class="badge">${libs.oldVersion}</span> ${parseUriV1Key}</small>`
        }
        ${!urlStandardObj || key === urlStandardKey ? '' :
          `<br><small>└ <span class="badge">${libs.urlStandard}</span> ${(urlStandardKey ? urlStandardKey : outputMsg.unavailable)}</small>`
        }
        ${!uriJsObj || key === uriJsKey ? '' :
          `<br><small>└ <span class="badge">${libs.uriJs}</span> ${(uriJsKey ? uriJsKey : outputMsg.unavailable)}</small>`
        }
      </td>
      ${/* parseUri [default] */''}
      <td class="neutral">
        ${printUriPart(parseUriObj[key])}
        ${!isCompareV1On || !parseUriV1Key || parseUriV1Obj[key] === parseUriObj[key] ?
          '' :
          `<br><small><span class="badge ${getFriendlyModeBadgeColor(key, parseUriObj, parseUriV1Obj)}">${libs.oldVersion}</span></small> ${
            printUriPart(parseUriV1Obj[key], {isV1Value: true})
          }`
        }
      </td>
      ${/* parseUri [friendly] */''}
      ${parseUriFriendlyModeObj ?
        `<td class="friendly-mode ${parseUriFriendlyModeObj[key] === parseUriObj[key] ? colorClass.neutral : colorClass.different}">
          ${isParseUriDefaultFriendlyEqual ?
            outputMsg.equalsDefaultAll :
            printUriPart(parseUriFriendlyModeObj[key])
          }
          ${!isCompareV1On || !parseUriV1Key || parseUriV1FriendlyModeObj[key] === parseUriFriendlyModeObj[key] ?
            '' :
            `<br><small><span class="badge ${getFriendlyModeBadgeColor(key, parseUriFriendlyModeObj, parseUriV1FriendlyModeObj)}">${libs.oldVersion}</span></small> ${
              parseUriV1FriendlyModeObj[key] === parseUriV1Obj[key] ?
                outputMsg.equalsDefault :
                printUriPart(parseUriV1FriendlyModeObj[key], {isV1Value: true})
            }`
          }
        </td>` :
        (key === firstKey ? unusedObjFullColumnCell : '')
      }
      ${/* URL */''}
      ${urlStandardObj ?
        `<td class="${getKeyColor(key, parseUriObj, urlStandardObj, parseUriObjNormalizedByUrlStandard, {lib: libs.urlStandard})}">
          ${/* hack for origin 'null' to make it clearer that parseUri's handling is intentional */
            key === 'origin' && urlStandardObj[key] === 'null' ?
            `<abbr class="info-icon" title="parseUri doesn’t normalize results; URL sets origin to the string 'null' when protocol is not http[s]/ws[s]/ftp/file/blob">${svgIconHtml('info')}</abbr>
              ${printUriPart(urlStandardObj[key])}` :
            printUriPart(urlStandardObj[key])}
        </td>` :
        (key === firstKey ? unusedObjFullColumnCell : '')
      }
      ${/* URI.js */''}
      ${uriJsObj ?
        `<td class="${getKeyColor(key, parseUriObj, uriJsObj, parseUriObjNormalizedByUriJs, {lib: libs.uriJs})}">
          ${printUriPart(uriJsObj[key])}
        </td>` :
        (key === firstKey ? unusedObjFullColumnCell : '')
      }
    </tr>
  `;
}

function comparePreparedUriObjs(a, b) {
  for (const key of Object.keys(URIPartsMap)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

function run() {
  const uri = document.getElementById('uri-input').value;
  const isFriendlyModeOn = document.getElementById('friendlyMode').checked;
  const isUrlStandardOn = document.getElementById('urlStandard').checked;
  const isUriJsOn = document.getElementById('uriJs').checked;
  const isCompareV1On = document.getElementById('compareV1').checked;

  let parseUriV1Obj, parseUriFriendlyModeObj, parseUriV1FriendlyModeObj,
    isParseUriDefaultFriendlyEqual, urlStandardObj, uriJsObj, normalizedByUrlStandard,
    parseUriObjNormalizedByUrlStandard, normalizedByUriJs, parseUriObjNormalizedByUriJs;

  const parseUriObj = prepareParseUriObj(uri, 'default');
  if (isCompareV1On) {
    parseUriV1Obj = prepareParseUriV1Obj(uri, 'default');
  }

  if (isFriendlyModeOn) {
    parseUriFriendlyModeObj = prepareParseUriObj(uri, 'friendly');
    parseUriV1FriendlyModeObj = isCompareV1On && prepareParseUriV1Obj(uri, 'friendly');
    isParseUriDefaultFriendlyEqual = comparePreparedUriObjs(parseUriObj, parseUriFriendlyModeObj);
  }
  if (isUrlStandardOn) {
    urlStandardObj = isUrlStandardOn && prepareUrlStandardObj(uri);
    // normalization comparisons can misrepresent equality if somthing unexpected leads to the
    // normalized href changing the URI parts that parseUri sees
    normalizedByUrlStandard = URL.canParse(uri) ? new URL(uri).href : null;
    parseUriObjNormalizedByUrlStandard = normalizedByUrlStandard ? prepareParseUriObj(normalizedByUrlStandard, 'default') : getErrorResultObj();
  }
  if (isUriJsOn) {
    uriJsObj = isUriJsOn && prepareUriJsObj(uri);
    // have to do independent normalization because normalized output from `URL` and URI.js
    // sometimes differs
    normalizedByUriJs = uriJsCanParse(uri) ? URI(uri).href() : null;
    parseUriObjNormalizedByUriJs = normalizedByUriJs ? prepareParseUriObj(normalizedByUriJs, 'default') : getErrorResultObj();
  }

  let tableStr = '';
  for (const key of Object.keys(URIPartsMap)) {
    tableStr += buildTableStr(key, {
      parseUriObj,
      parseUriFriendlyModeObj,
      parseUriV1Obj,
      parseUriV1FriendlyModeObj,
      urlStandardObj,
      uriJsObj,
      parseUriObjNormalizedByUrlStandard,
      parseUriObjNormalizedByUriJs,
      isParseUriDefaultFriendlyEqual,
    });
  }

  const table = document.querySelector("#uri-table > tbody");
  table.innerHTML = tableStr;
}

function setInput(str) {
  const url = new URL(location);
  if (str) {
    url.searchParams.set('uri', str);
  } else {
    url.searchParams.delete('uri');
  }
  history.replaceState(null, '', url);
  run();
}

function setOption(id, checked) {
  const url = new URL(location);
  if (checked) {
    url.searchParams.set(id, checked);
  } else {
    url.searchParams.delete(id);
  }
  history.replaceState(null, '', url);
  run();
}

onload = () => {
  const q = new URL(location).searchParams;

  const options = [
    'friendlyMode',
    'urlStandard',
    'uriJs',
    'compareV1',
    'extendTlds',
  ];
  options.forEach(option => {
    if (q.get(option) === 'true') {
      document.getElementById(option).checked = true;
    }
  });

  const uri = q.get('uri') ?? '';
  document.getElementById('uri-input').value = uri;
  // don't expand the comparison table if `uri` is blank
  if (uri) {
    run();
  }
};
