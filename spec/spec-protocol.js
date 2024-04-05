describe('protocol', () => {
  it('should allow protocol on its own', () => {
    expect('http:').toMatchUriKeysInAllModes({protocol: 'http'});
    expect('http://').toMatchUriKeysInAllModes({protocol: 'http'});
  });

  it('should allow any known or unknown protocol', () => {
    const protocols = ['file', 'blob', 'ftp', 'urn', 'imadethisup'];
    protocols.forEach(protocol => {
      expect(`${protocol}:`).toMatchUriKeysInAllModes({protocol});
    });
  });

  it('should allow any casing', () => {
    expect('HTTP:').toMatchUriKeysInAllModes({protocol: 'HTTP'});
    expect('Http:').toMatchUriKeysInAllModes({protocol: 'Http'});
  });

  // this applies to leading whitespace in any URI, not just those with a protocol
  it('should ignore leading whitespace', () => {
    expect(' \t\n http:').toMatchUriKeysInAllModes({protocol: 'http'});
  });

  it('should not allow non-leading whitespace', () => {
    expect('h ttp:').toMatchUriKeysInAllModes({protocol: ''});
    expect('h\tttp:').toMatchUriKeysInAllModes({protocol: ''});
    expect('h\nttp:').toMatchUriKeysInAllModes({protocol: ''});

    // the value ends up in different places depending on parsing mode
    expect(parseUri('h ttp:', 'default')).toMatchUriKeys({protocol: '', resource: 'h ttp:'});
    expect(parseUri('h ttp:', 'friendly')).toMatchUriKeys({protocol: '', authority: 'h ttp:'});
  });

  it('should end at :', () => {
    // colons are complex because they delimit protocols, passwords, and ports,
    // and can appear in IPv6 addresses (including as the first char) and any
    // part of a resource
    expect(':ftp').toMatchUriKeysInAllModes({protocol: ''});
    expect('f:tp').toMatchUriKeysInAllModes({protocol: 'f'});
    expect('f:t:p').toMatchUriKeysInAllModes({protocol: 'f'});
  });

  it('should not allow URI-delimiting char', () => {
    const chars = ['@', '/', '\\', '?', '#'];

    chars.forEach(char => {
      expect(`${char}http:`).toMatchUriKeysInAllModes({protocol: ''});
      expect(`h${char}ttp:`).toMatchUriKeysInAllModes({protocol: ''});
    });
  });

  it('should not allow leading non-[a-z] char', () => {
    expect('.http:').toMatchUriKeysInAllModes({protocol: ''});
    expect('-http:').toMatchUriKeysInAllModes({protocol: ''});
    expect('+ssh:').toMatchUriKeysInAllModes({protocol: ''});
    expect('2tab:').toMatchUriKeysInAllModes({protocol: ''});
  });

  it('should allow non-leading non-[a-z] char', () => {
    expect('view-source:').toMatchUriKeysInAllModes({protocol: 'view-source'});
    expect('git+ssh:').toMatchUriKeysInAllModes({protocol: 'git+ssh'});
    expect('t2ab:').toMatchUriKeysInAllModes({protocol: 't2ab'});
  });

  it('should not allow non-leading dot', () => {
    // protocol always excludes dot for consistency with friendly mode (which needs to exclude it
    // to handle 'example.com:port' without a preceeding '//' or ':')
    expect('h.ttp:').toMatchUriKeysInAllModes({protocol: ''});
  });

  // `URL` treats single-letter protocols as part of the pathname and sets protocol to 'file:'.
  // in other words it treats the protocol as a drive letter in a file system path. URI.js doesn't.
  it('should allow single-letter protocol', () => {
    expect('c:').toMatchUriKeysInAllModes({protocol: 'c'});
  });
});
