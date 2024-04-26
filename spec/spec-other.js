describe('fragment', () => {
  it('shoud allow fragment on its own', () => {
    expect('#hash').toMatchUriKeysInAllModes({fragment: 'hash'});
  });

  it('shoud allow # in fragment', () => {
    expect('##hash').toMatchUriKeysInAllModes({fragment: '#hash'});
    expect('#hash#').toMatchUriKeysInAllModes({fragment: 'hash#'});
    expect('#ha#sh').toMatchUriKeysInAllModes({fragment: 'ha#sh'});
  });

  it('shoud continue until end of string', () => {
    expect('#:/?').toMatchUriKeysInAllModes({fragment: ':/?'});
  });

  // this applies to trailing whitespace in any URI, not just those with a fragment
  it('shoud exclude trailing whitespace', () => {
    expect('#hash \t\n ').toMatchUriKeysInAllModes({fragment: 'hash'});
  });
});

describe('href', () => {
  const href = 'http://u:pw@host:1/path?q#h';

  it('shoud include the full input', () => {
    expect(href).toMatchUriKeysInAllModes({href});
  });

  // this applies to leading and trailing whitespace in any URI
  it('shoud exclude leading and trailing whitespace', () => {
    expect(` \t\n ${href} \t\n `).toMatchUriKeysInAllModes({href});
  });
});

describe('origin and authority', () => {
  it('should include protocol in origin and exclude resource in origin and authority', () => {
    const protocol = 'http';
    const authority = 'u:pw@host:1';
    const resource = '/path?q#h';

    expect(`${protocol}://${authority}${resource}`).toMatchUriKeysInAllModes({
      origin: `${protocol}://${authority}`,
      authority,
    });
    expect(`://${authority}${resource}`).toMatchUriKeysInAllModes({
      origin: `://${authority}`,
      authority,
    });
    expect(`:${authority}${resource}`).toMatchUriKeysInAllModes({
      origin: `:${authority}`,
      authority,
    });
    expect(`//${authority}${resource}`).toMatchUriKeysInAllModes({
      origin: `//${authority}`,
      authority,
    });
  });
});

describe('resource', () => {
  it('should include pathname, query, and fragment', () => {
    expect('http://host:1/dir/file.ext?query=x#hash').toMatchUriKeysInAllModes({resource: '/dir/file.ext?query=x#hash'});
    expect('http://host:1/dir/file.ext?query=x').toMatchUriKeysInAllModes({resource: '/dir/file.ext?query=x'});
    expect('http://host:1/dir/file.ext#hash').toMatchUriKeysInAllModes({resource: '/dir/file.ext#hash'});
    expect('http://host:1/dir/file.ext').toMatchUriKeysInAllModes({resource: '/dir/file.ext'});
    expect('http://host:1?query=x#hash').toMatchUriKeysInAllModes({resource: '?query=x#hash'});
    expect('http://host:1?query=x').toMatchUriKeysInAllModes({resource: '?query=x'});
    expect('http://host:1#hash').toMatchUriKeysInAllModes({resource: '#hash'});
  });
});

describe('parseUri', () => {
  describe('arguments', () => {
    it('should throw if URI is not a string', () => {
      const values = [
        null,
        undefined,
        1,
        true,
        false,
        [],
        {},
        /./,
        NaN,
        BigInt(1),
        Symbol(),
        () => {},
        new URL('http://host/'),
      ];

      expect(() => parseUri()).toThrow();
      values.forEach(value => {
        expect(() => parseUri(value)).toThrow();
      });
    });

    it('should use default parsing if mode is not provided', () => {
      const uri = 'dir/file';
      expect(parseUri(uri)).toEqual(parseUri(uri, 'default'));
      expect(parseUri(uri)).not.toEqual(parseUri(uri, 'friendly'));
    });

    it('should use default parsing if mode is explicit undefined', () => {
      const uri = 'dir/file';
      expect(parseUri(uri, undefined)).toEqual(parseUri(uri, 'default'));
      expect(parseUri(uri, undefined)).not.toEqual(parseUri(uri, 'friendly'));
    });

    it('should throw if mode is unrecognized', () => {
      expect(() => parseUri('', 'turbo')).toThrow();
      expect(() => parseUri('')).not.toThrow();
    });

    it('should throw if mode is null', () => {
      expect(() => parseUri('', null)).toThrow();
    });
  });

  describe('result object', () => {
    it('shoud not have unexpected props', () => {
      const uriParts = [
        'href',
        'origin',
        'protocol',
        'authority',
        'userinfo',
        'username',
        'password',
        'host',
        'hostname',
        'subdomain',
        'domain',
        'tld',
        'port',
        'resource',
        'pathname',
        'directory',
        'filename',
        'suffix',
        'query',
        'fragment',
        'queryParams',
      ];

      Object.keys(parseUri('http://u:p@sub.dom.tld:1/dir/file.ext?q=1#h')).forEach(key => {
        expect(uriParts.includes(key)).toBe(true);
      });
    });
  });
});
