describe('query', () => {
  it('should allow query on its own', () => {
    expect('?q=x').toMatchUriKeysInAllModes({query: 'q=x'});
  });

  it('should allow multiple keys with &', () => {
    expect('?q=x&y=z').toMatchUriKeysInAllModes({query: 'q=x&y=z'});
    expect('?q=x&q=y').toMatchUriKeysInAllModes({query: 'q=x&q=y'});
    expect('?&&q=x&q=y').toMatchUriKeysInAllModes({query: '&&q=x&q=y'});
  });

  it('should allow ? in query', () => {
    expect('??').toMatchUriKeysInAllModes({query: '?'});
    expect('???').toMatchUriKeysInAllModes({query: '??'});
    expect('?q?').toMatchUriKeysInAllModes({query: 'q?'});
    expect('?q=?').toMatchUriKeysInAllModes({query: 'q=?'});
  });

  it('should allow non-[a-z] chars', () => {
    expect('? -=/ш%').toMatchUriKeysInAllModes({query: ' -=/ш%'});
  });

  it('should end at #', () => {
    expect('?#q').toMatchUriKeysInAllModes({query: ''});
    expect('?q#').toMatchUriKeysInAllModes({query: 'q'});
    expect('?q=#').toMatchUriKeysInAllModes({query: 'q='});
    expect('?q=x#&q=y').toMatchUriKeysInAllModes({query: 'q=x'});
  });

  it('should allow empty query', () => {
    expect('').toMatchUriKeysInAllModes({query: ''});
    expect('?').toMatchUriKeysInAllModes({query: ''});
  });
});

describe('queryParams', () => {
  it('shoud be a URLSearchParams object', () => {
    expect(parseUri('?q=x').queryParams).toBeInstanceOf(URLSearchParams);
  });

  it('shoud be available and empty with empty query', () => {
    const {queryParams} = parseUri('');
    expect(queryParams).toBeInstanceOf(URLSearchParams);
    expect(queryParams.size).toBe(0);
  });

  it('should allow accessing values of duplicate keys', () => {
    expect(parseUri('?q=a&q=bc&q=d').queryParams.getAll('q')).toEqual(['a', 'bc', 'd']);
  });

  it('should allow empty key values', () => {
    expect(parseUri('?q=').queryParams.get('q')).toBe('');
  });

  it('should allow unspecifed key values (no =)', () => {
    expect(parseUri('?q').queryParams.get('q')).toBe('');
  });

  it('should return null for get if key not present', () => {
    expect(parseUri('?q').queryParams.get('z')).toBeNull();
  });

  it('should return empty array for getAll if key not present', () => {
    expect(parseUri('?q').queryParams.getAll('z')).toEqual([]);
  });

  it('should allow empty key names', () => {
    expect(parseUri('?=x&=').queryParams.getAll('')).toEqual(['x', '']);
  });

  it('should allow missing keys (nothing between &)', () => {
    const {queryParams} = parseUri('?&q=&&');
    expect(queryParams.getAll('q')).toEqual(['']);
    expect(queryParams.size).toBe(1);
  });

  it('should allow ? in key names and values', () => {
    expect(parseUri('??q=x').queryParams.get('?q')).toBe('x');
    expect(parseUri('?q?=x').queryParams.get('q?')).toBe('x');
    expect(parseUri('?q=?').queryParams.get('q')).toBe('?');
  });
});
