describe('hostname: special cases', () => {
  describe('second-level domain', () => {
    afterEach(() => {
      parseUri.setSld({});
    });

    it('should allow modifying recognized second-level domains via setSld', () => {
      parseUri.setSld({
        uk: 'co gov me net org sch',
        au: 'com edu gov id net org',
      });

      expect('//example.co.uk').toMatchUriKeysInAllModes({
        subdomain: '',
        domain: 'example.co.uk',
        tld: 'co.uk',
      });
      expect('//www.example.gov.uk').toMatchUriKeysInAllModes({
        subdomain: 'www',
        domain: 'example.gov.uk',
        tld: 'gov.uk',
      });
      expect('//sub1.sub2.example.com.au').toMatchUriKeysInAllModes({
        subdomain: 'sub1.sub2',
        domain: 'example.com.au',
        tld: 'com.au',
      });
    });

    it('should not modify domain levels when not using a recognized second-level domain', () => {
      parseUri.setSld({
        uk: 'co gov me net org sch',
        au: 'com edu gov id net org',
      });

      expect('//example.co.au').toMatchUriKeysInAllModes({
        subdomain: 'example',
        domain: 'co.au',
        tld: 'au',
      });
    });

    it('should replace recognized second-level domains via setSld with a new object', () => {
      parseUri.setSld({
        uk: 'co gov me net org sch',
        au: 'com edu gov id net org',
      });
      parseUri.setSld({
        pet: 'duck platypus',
      });

      expect('//example.platypus.pet').toMatchUriKeysInAllModes({
        subdomain: '',
        domain: 'example.platypus.pet',
        tld: 'platypus.pet',
      });
      expect('//example.co.uk').toMatchUriKeysInAllModes({
        subdomain: 'example',
        domain: 'co.uk',
        tld: 'uk',
      });
    });

    it('should remove recognized second-level domains via setSld with an empty object', () => {
      parseUri.setSld({
        uk: 'co gov me net org sch',
        au: 'com edu gov id net org',
      });
      parseUri.setSld({});

      expect('//example.co.uk').toMatchUriKeysInAllModes({
        subdomain: 'example',
        domain: 'co.uk',
        tld: 'uk',
      });
    });
  });

  describe('IPv4 address', () => {
    it('should allow IPv4 address and not include domain parts in result', () => {
      const ips = [
        '192.168.1.1',
        '1.2.3.4',
      ];

      ips.forEach(ip => {
        expect(`//${ip}`).toMatchUriKeysInAllModes({
          host: ip,
          hostname: ip,
          subdomain: '',
          domain: '',
          tld: '',
          port: '',
        });
        expect(`//${ip}:1`).toMatchUriKeysInAllModes({
          host: `${ip}:1`,
          hostname: ip,
          subdomain: '',
          domain: '',
          tld: '',
          port: '1',
        });
      });
    });

    it('should require IPv4 address for IPv4 address handling', () => {
      const invalidIps = [
        '1.2.3.4.5',
        '1.2.3.1000',
        '1.2.3.4-',
        '1.2.3.4a',
        '-1.2.3.4',
        'a1.2.3.4',
        '2001:0db8:85a3:0042:1000:8a2e:0370:7334',
        // square brackets only allowed for IPv6
        '[192.168.1.1]',
      ];

      invalidIps.forEach(invalidIp => {
        expect(`//${invalidIp}`).not.toMatchUriKeysInAllModes({domain: ''});
      });
    });
  });

  describe('IPv6 address', () => {
    it('should allow IPv6 address and not include domain parts in result', () => {
      const ips = [
        '[2001:0db8:85a3:0042:1000:8a2e:0370:7334]',
        '[2001:0db8::7334]',
        '[e8::7]',
        '[::]',
      ];

      ips.forEach(ip => {
        expect(`//${ip}`).toMatchUriKeysInAllModes({
          host: ip,
          hostname: ip,
          subdomain: '',
          domain: '',
          tld: '',
          port: '',
        });
        expect(`//${ip}:1`).toMatchUriKeysInAllModes({
          host: `${ip}:1`,
          hostname: ip,
          subdomain: '',
          domain: '',
          tld: '',
          port: '1',
        });
      });
    });

    it('should allow IPv6 address with zone identifier', () => {
      const ipWithZoneIdentifier = '[fe80::abcd%en1]';

      expect(`//${ipWithZoneIdentifier}`).toMatchUriKeysInAllModes({
        host: ipWithZoneIdentifier,
        hostname: ipWithZoneIdentifier,
        subdomain: '',
        domain: '',
        tld: '',
        port: '',
      });
    });

    it('should require IPv6 address for IPv6 address handling', () => {
      const invalidIps = [
        '[2001:0db8:85a3:0042:1000:8a2e:0370:7334:80]',
        '[e8:7]',
        '[:]',
        '[]',
        '[192.168.1.1]',
      ];

      invalidIps.forEach(invalidIp => {
        expect(`//${invalidIp}`).not.toMatchUriKeysInAllModes({domain: ''});
      });
    });

    it('should require enclosure in a single set of square brackets for IPv6 address handling', () => {
      const unenclosedIps = [
        '2001:0db8::7334',
        '[[2001:0db8::7334]]',
        '[2001:0db8::7334',
        '2001:0db8::7334]',
        '[]2001:0db8::7334',
        '2001:0db8::7334[]',
        '[2001]0db8::7334',
      ];

      unenclosedIps.forEach(unenclosedIp => {
        expect(`//${unenclosedIp}`).not.toMatchUriKeysInAllModes({domain: ''});
      });
    });
  });

  describe('URN', () => {
    it('should allow URN and not include dir/file parts in result', () => {
      const urns = [
        'urn:example:foo',
        'urn:uuid:c5542ab6-3d96-403e-8e6b-b8bb52f48d9a?q=x',
        'urn:oasis:names:specification:docbook:dtd:xml:4.1.2',
        'urn:isbn:0-486-27557-4',
        'tel:+1-816-555-1212',
        'mailto:first@example.com,second@example.com?subject=Subscribe&body=Sign%20me%20up!',
        'data:text/html,<h1>Hi</h1>?q=x',
        'test:/resource',
      ];

      urns.forEach(urn => {
        const resource = urn.replace(/^[^:]+:/, ''); // remove protocol
        expect(parseUri(urn, 'default')).toMatchUriKeys({
          protocol: /^[^:]+/.exec(urn)[0],
          authority: '',
          resource,
          pathname: resource.replace(/\?([^?]+)$/, ''), // remove query
          directory: '',
          filename: '',
          suffix: '',
          query: resource.replace(/^[^?]+\??/, ''), // remove pathname and optional '?'
        });
      });
    });

    it('[friendly mode] should not use URN handling due to authorty from implicitly inserted //', () => {
      expect(parseUri('urn:example:foo', 'friendly')).toMatchUriKeys({
        protocol: 'urn',
        authority: 'example:foo',
        hostname: 'example',
        port: 'foo',
        resource: '',
      });
      expect(parseUri('data:text/html,<h1>Hi</h1>?q=x', 'friendly')).toMatchUriKeys({
        protocol: 'data',
        authority: 'text',
        resource: `/html,<h1>Hi</h1>?q=x`,
        pathname: '/html,<h1>Hi</h1>',
        directory: '/html,<h1>Hi</',
        filename: 'h1>',
        suffix: '',
        query: 'q=x',
      });
    });

    it('[friendly mode] should not use URN handling due to empty but participating authority from implicitly inserted //', () => {
      expect(parseUri('test:/resource', 'friendly')).toMatchUriKeys({
        protocol: 'test',
        authority: '',
        resource: `/resource`,
        pathname: '/resource',
        directory: '/',
        filename: 'resource',
        suffix: '',
      });
    });
  });
});
