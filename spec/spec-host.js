describe('host', () => {
  // you can change these and all the tests should continue working
  // ------------------------------
  const hostnameStr = 'sub.domain.com';
  const portStr = '1';
  // ------------------------------

  const hostStr = `${hostnameStr}:${portStr}`;
  const hostResult = {
    host: hostStr,
    hostname: hostnameStr,
    // this basic handling for domain parts doesn't support IPv4 addresses or second-level domains
    subdomain: hostnameStr.replace(/(?:\.?[^.]*\.)?[^.\]]*$|^\[.*\]$/s, ''),
    domain: /(?:[^.]*\.)?[^.\]]*$/.exec(hostnameStr)[0],
    tld: /[^.\]]*$/.exec(hostnameStr)[0],
    // the following would give a more flexible/accurate version of the domain parts than the basic
    // regexes above, but I don't want to use `parseUri` to generate test data for its own tests:
    // ...(({subdomain, domain, tld}) => ({subdomain, domain, tld}))(parseUri(`//${hostnameStr}`)),
    port: portStr,
  };
  const emptyHostResult = {
    host: '',
    hostname: '',
    subdomain: '',
    domain: '',
    tld: '',
    port: '',
  };

  it('should allow host on its own', () => {
    expect(`//${hostStr}`).toMatchUriKeysInAllModes(hostResult);
  });

  it('[friendly mode] should allow leading host', () => {
    expect(parseUri(hostStr, 'default')).not.toMatchUriKeys(hostResult);
    expect(parseUri(hostStr, 'friendly')).toMatchUriKeys(hostResult);
  });

  it('should end at resource-delimiting char', () => {
    const chars = ['/', '\\', '?', '#'];

    chars.forEach(char => {
      expect(`//${hostStr}${char}a`).toMatchUriKeysInAllModes(hostResult);
      expect(`//${hostnameStr}${char}a`).toMatchUriKeysInAllModes({hostname: hostnameStr});
      expect(`//:${portStr}${char}a`).toMatchUriKeysInAllModes({port: portStr});
    });
  });

  it('should allow empty host', () => {
    expect(`//`).toMatchUriKeysInAllModes(emptyHostResult);
    expect(`//?a`).toMatchUriKeysInAllModes(emptyHostResult);
    expect(`//#a`).toMatchUriKeysInAllModes(emptyHostResult);
  });

  it('should allow empty host with port delimiter', () => {
    const emptyHostWithPortDelimiterResult = {
      ...emptyHostResult,
      host: ':',
    };

    expect(`//:`).toMatchUriKeysInAllModes(emptyHostWithPortDelimiterResult);
    expect(`//:/a`).toMatchUriKeysInAllModes(emptyHostWithPortDelimiterResult);
    expect(`//:?a`).toMatchUriKeysInAllModes(emptyHostWithPortDelimiterResult);
    expect(`//:#a`).toMatchUriKeysInAllModes(emptyHostWithPortDelimiterResult);
  });

  describe('with <web-protocol>', () => {
    const webProtocols = ['http', 'https', 'ftp', 'ws', 'wss'];

    it('should allow host with leading <web-protocol>://', () => {
      webProtocols.forEach(protocol => {
        expect(`${protocol}://${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      });
    });

    it('should allow host with leading <web-protocol>: and no //', () => {
      webProtocols.forEach(protocol => {
        expect(`${protocol}:${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      });
    });

    it('should allow host with multiple : after <web-protocol>', () => {
      webProtocols.forEach(protocol => {
        expect(`${protocol}::${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      });
      webProtocols.forEach(protocol => {
        expect(`${protocol}:::${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      });
      webProtocols.forEach(protocol => {
        expect(`${protocol}::://${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      });
    });

    // slashes have lost all meaning for the web protocols
    it('should allow any forward and back slashes following <web-protocol>:', () => {
      expect(`http:/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:/\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:\\/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:\\\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:///${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:\\\\\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:\\/\\/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`http:\\\\//${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });
  });

  describe('with <non-web-protocol>', () => {
    it('should allow host with leading <non-web-protocol>://', () => {
      // `URL` sets host to '' and pathname to `//${hostStr}`. this is just wrong since it prevents
      // correctly retrieving parts from e.g. 'git://localhost:1234', 'ssh://myid@192.168.1.101',
      // and 't2ab:///path/entry'
      expect(`nonwebprotocol://${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      // the first two slashes delimit the (empty) host, and the third starts the resource
      expect(`nonwebprotocol:///${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `/${hostStr}`,
      });
    });

    it('should not allow host with leading <non-web-protocol>: and no //', () => {
      expect(parseUri(`nonwebprotocol:${hostStr}`, 'default')).toMatchUriKeys({
        ...emptyHostResult,
        resource: hostStr,
      });
    });
    it('[friendly mode] should allow host with leading <non-web-protocol>: and no // and implicitly inserted //', () => {
      expect(parseUri(`nonwebprotocol:${hostStr}`, 'friendly')).toMatchUriKeys({
        ...hostResult,
        resource: '',
      });
    });

    it('should allow only one : after <non-web-protocol>', () => {
      expect(parseUri(`nonwebprotocol::${hostStr}`, 'default')).toMatchUriKeys({
        ...emptyHostResult,
        resource: `:${hostStr}`,
      });
      expect(parseUri(`nonwebprotocol:::${hostStr}`, 'default')).toMatchUriKeys({
        ...emptyHostResult,
        resource: `::${hostStr}`,
      });
      expect(parseUri(`nonwebprotocol::://${hostStr}`, 'default')).toMatchUriKeys({
        ...emptyHostResult,
        resource: `:://${hostStr}`,
      });
    });
    it('[friendly mode] should allow only one : after <non-web-protocol> and implicitly inserted //', () => {
      expect(parseUri(`nonwebprotocol::${hostStr}`, 'friendly')).toMatchUriKeys({
        ...emptyHostResult,
        host: `:${hostnameStr.replace(/:.*/s, '')}`, // `replace` in case `hostnameStr` is an IPv6 address
        port: hostnameStr.replace(/:.*/s, ''), // `replace` in case `hostnameStr` is an IPv6 address
        resource: `${hostnameStr.replace(/^[^:]+/, '')}:${portStr}`, // add part of `hostnameStr` in case it's an IPv6 address
      });
      expect(parseUri(`nonwebprotocol:::${hostStr}`, 'friendly')).toMatchUriKeys({
        ...emptyHostResult,
        host: ':',
        resource: `:${hostStr}`,
      });
      expect(parseUri(`nonwebprotocol::://${hostStr}`, 'friendly')).toMatchUriKeys({
        ...emptyHostResult,
        host: ':',
        resource: `://${hostStr}`,
      });
    });

    // `URL` agrees, but URI.js allows any combination of (only) two forward and back slashes to
    // delimit the host
    it('should not allow nonstandard slashes following <non-web-protocol>:', () => {
      expect(`nonwebprotocol:/${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `/${hostStr}`,
      });
      expect(`nonwebprotocol:\\${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `\\${hostStr}`,
      });
      expect(`nonwebprotocol:/\\${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `/\\${hostStr}`,
      });
      expect(`nonwebprotocol:\\/${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `\\/${hostStr}`,
      });
      expect(`nonwebprotocol:\\\\${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `\\\\${hostStr}`,
      });
      expect(`nonwebprotocol:\\\\\\${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `\\\\\\${hostStr}`,
      });
    });
  });

  describe('with leading :', () => {
    it('should allow host with leading ://', () => {
      expect(`://${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });
  
    it('should allow host with leading :', () => {
      expect(`:${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });
  
    it('should allow host with multiple leading :', () => {
      expect(`::${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:::${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`::://${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });

    // slashes have lost all meaning for protocol-relative URLs
    it('should allow any forward and back slashes following leading :', () => {
      expect(`:/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:/\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:\\/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:\\\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:///${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:\\\\\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:\\/\\/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`:\\\\//${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });
  });

  describe('with leading forward and back slashes', () => {
    it('should allow host with leading //', () => {
      expect(`//${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });

    it('should not allow host with single leading forward or back slash', () => {
      expect(`/${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `/${hostStr}`,
      });
      expect(`\\${hostStr}`).toMatchUriKeysInAllModes({
        ...emptyHostResult,
        resource: `\\${hostStr}`,
      });
    });

    // slashes have lost all meaning for protocol-relative URLs
    it('should allow any leading forward and back slashes if there are at least two', () => {
      expect(`/\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`\\/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`///${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`\\/\\/${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      expect(`\\\\//${hostStr}`).toMatchUriKeysInAllModes(hostResult);

      // if port/query/fragment are omitted, `URL` sets protocol to 'file:', host to '<host>', and
      // pathname to '/' (i.e. the same as `parseUri` after normalization, except the protocol).
      // with port/query/fragment, `URL` throws. URI.js matches `parseUri`.
      expect(`\\\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
      // if port/query/fragment are omitted, `URL` sets protocol to 'file:', host to '', and
      // pathname to '/<host>'.
      // with port/query/fragment, `URL` throws. URI.js matches `parseUri`.
      expect(`\\\\\\${hostStr}`).toMatchUriKeysInAllModes(hostResult);
    });
  });

  describe('hostname', () => {
    it('should allow hostname on its own', () => {
      expect(`//${hostnameStr}`).toMatchUriKeysInAllModes({hostname: hostnameStr});
    });

    it('[friendly mode] should allow leading hostname', () => {
      expect(parseUri(hostnameStr, 'default')).not.toMatchUriKeys({hostname: hostnameStr});
      expect(parseUri(hostnameStr, 'friendly')).toMatchUriKeys({hostname: hostnameStr});
    });

    it('shoud allow non-[a-z] char', () => {
      const chars = [' ', '%', '-', 'ш'];

      chars.forEach(char => {
        expect(`//${char}host`).toMatchUriKeysInAllModes({hostname: `${char}host`});
      });
    });

    describe('subdomain, domain, and tld', () => {
      it('should allow multiple subdomains', () => {
        expect('//sub.sub.dom.tld').toMatchUriKeysInAllModes({
          subdomain: 'sub.sub',
          domain: 'dom.tld',
          tld: 'tld',
        });
        expect('//sub.sub.sub.dom.tld').toMatchUriKeysInAllModes({
          subdomain: 'sub.sub.sub',
          domain: 'dom.tld',
          tld: 'tld',
        });
      });

      it('should allow single subdomain', () => {
        expect('//sub.dom.tld').toMatchUriKeysInAllModes({
          subdomain: 'sub',
          domain: 'dom.tld',
          tld: 'tld',
        });
      });

      it('should allow domain without subdomain', () => {
        expect('//dom.tld').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: 'dom.tld',
          tld: 'tld',
        });
      });

      it('should allow TLD on its own', () => {
        expect('//tld').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: 'tld',
          tld: 'tld',
        });
      });

      // hostname parsing is complex; attempt to trigger catastrophic backtracking
      it('should allow extra long TLD on its own (perf check)', () => {
        const longTld = 'superextraveryincrediblyamazinglylongtld';
        expect(`//${longTld}`).toMatchUriKeysInAllModes({tld: longTld});
      });

      it('should allow any missing segments (four levels)', () => {
        expect('//sub.sub.dom.').toMatchUriKeysInAllModes({
          subdomain: 'sub.sub',
          domain: 'dom.',
          tld: '',
        });
        expect('//sub.sub..tld').toMatchUriKeysInAllModes({
          subdomain: 'sub.sub',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//sub..dom.tld').toMatchUriKeysInAllModes({
          subdomain: 'sub.',
          domain: 'dom.tld',
          tld: 'tld',
        });
        expect('//.sub.dom.tld').toMatchUriKeysInAllModes({
          subdomain: '.sub',
          domain: 'dom.tld',
          tld: 'tld',
        });
        expect('//sub.sub..').toMatchUriKeysInAllModes({
          subdomain: 'sub.sub',
          domain: '.',
          tld: '',
        });
        expect('//sub..dom.').toMatchUriKeysInAllModes({
          subdomain: 'sub.',
          domain: 'dom.',
          tld: '',
        });
        expect('//sub...tld').toMatchUriKeysInAllModes({
          subdomain: 'sub.',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//.sub.dom.').toMatchUriKeysInAllModes({
          subdomain: '.sub',
          domain: 'dom.',
          tld: '',
        });
        expect('//.sub..tld').toMatchUriKeysInAllModes({
          subdomain: '.sub',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//..dom.tld').toMatchUriKeysInAllModes({
          subdomain: '.',
          domain: 'dom.tld',
          tld: 'tld',
        });
        expect('//sub...').toMatchUriKeysInAllModes({
          subdomain: 'sub.',
          domain: '.',
          tld: '',
        });
        expect('//.sub..').toMatchUriKeysInAllModes({
          subdomain: '.sub',
          domain: '.',
          tld: '',
        });
        expect('//..dom.').toMatchUriKeysInAllModes({
          subdomain: '.',
          domain: 'dom.',
          tld: '',
        });
        expect('//...tld').toMatchUriKeysInAllModes({
          subdomain: '.',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//...').toMatchUriKeysInAllModes({
          subdomain: '.',
          domain: '.',
          tld: '',
        });
      });
  
      it('should allow any missing segments (three levels)', () => {
        expect('//sub.dom.').toMatchUriKeysInAllModes({
          subdomain: 'sub',
          domain: 'dom.',
          tld: '',
        });
        expect('//sub..tld').toMatchUriKeysInAllModes({
          subdomain: 'sub',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//.dom.tld').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: 'dom.tld',
          tld: 'tld',
        });
        expect('//sub..').toMatchUriKeysInAllModes({
          subdomain: 'sub',
          domain: '.',
          tld: '',
        });
        expect('//.dom.').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: 'dom.',
          tld: '',
        });
        expect('//..tld').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//..').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: '.',
          tld: '',
        });
      });

      it('should allow any missing segments (two levels)', () => {
        expect('//dom.').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: 'dom.',
          tld: '',
        });
        expect('//.tld').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: '.tld',
          tld: 'tld',
        });
        expect('//.').toMatchUriKeysInAllModes({
          subdomain: '',
          domain: '.',
          tld: '',
        });
      });
    });
  });

  describe('port', () => {
    it('should allow port on its own', () => {
      expect(`//:${portStr}`).toMatchUriKeysInAllModes({port: portStr});
    });

    // `URL` removes these, URI.js doesn't
    it('should include port when it matches the protocol default', () => {
      expect('http://:80').toMatchUriKeysInAllModes({port: '80'});
      expect('https://:443').toMatchUriKeysInAllModes({port: '443'});
    });

    it('should allow empty port', () => {
      expect(`//${hostnameStr}:`).toMatchUriKeysInAllModes({
        port: '',
        resource: '',
      });
      expect(`//${hostnameStr}::`).toMatchUriKeysInAllModes({
        port: '',
        resource: ':',
      });
      expect(`//${hostnameStr}::${portStr}`).toMatchUriKeysInAllModes({
        port: '',
        resource: `:${portStr}`,
      });
    });

    it('should parse invalid ports', () => {
      // non-numeric
      expect('//:port').toMatchUriKeysInAllModes({port: 'port'});
      // TCP reserves port 0, but UDP allows it and gives it the meaning no port
      expect('//:0').toMatchUriKeysInAllModes({port: '0'});
      // valid range is 0 65535
      expect('//:65536').toMatchUriKeysInAllModes({port: '65536'});
      expect('//:100000').toMatchUriKeysInAllModes({port: '100000'});
    });
  });
});
