// fallback check of a collection of URIs
describe('URI collection', () => {
  const uris = [
    {
      uri: 'protocol://username:password@subdomain.domain.tld:port/directory/filename.suffix?query#fragment',
      expected: {
        href: 'protocol://username:password@subdomain.domain.tld:port/directory/filename.suffix?query#fragment',
        origin: 'protocol://username:password@subdomain.domain.tld:port',
        protocol: 'protocol',
        authority: 'username:password@subdomain.domain.tld:port',
        userinfo: 'username:password',
        username: 'username',
        password: 'password',
        host: 'subdomain.domain.tld:port',
        hostname: 'subdomain.domain.tld',
        subdomain: 'subdomain',
        domain: 'domain.tld',
        tld: 'tld',
        port: 'port',
        resource: '/directory/filename.suffix?query#fragment',
        pathname: '/directory/filename.suffix',
        directory: '/directory/',
        filename: 'filename.suffix',
        suffix: 'suffix',
        query: 'query',
        fragment: 'fragment',
      },
    },
    {
      uri: 'http://examplé.org/rosé',
      expected: {
        href: 'http://examplé.org/rosé',
        origin: 'http://examplé.org',
        protocol: 'http',
        authority: 'examplé.org',
        userinfo: '',
        username: '',
        password: '',
        host: 'examplé.org',
        hostname: 'examplé.org',
        subdomain: '',
        domain: 'examplé.org',
        tld: 'org',
        port: '',
        resource: '/rosé',
        pathname: '/rosé',
        directory: '/',
        filename: 'rosé',
        suffix: '',
        query: '',
        fragment: '',
      },
    },
    {
      uri: 'http://xn--exampl-gva.org/ros%C3%A9',
      expected: {
        hostname: 'xn--exampl-gva.org',
        pathname: '/ros%C3%A9',
      },
    },
    {
      uri: 'https://example.com/?query=@evil.com',
      expected: {
        hostname: 'example.com',
        query: 'query=@evil.com',
      },
    },
    {
      uri: 'https://example.com/?x=шеллы',
      expected: {
        query: 'x=шеллы',
      },
    },
    {
      uri: 'https://example.com/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B',
      expected: {
        query: 'x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B',
      },
    },
    {
      uri: 'ssh://myid@192.168.1.101:443',
      expected: {
        protocol: 'ssh',
        username: 'myid',
        hostname: '192.168.1.101',
        port: '443',
      }
    },
    {
      uri: 'https://[2001:db8:85a3::7334%en1]:80/ipv6-with-zone-identifier',
      expected: {
        hostname: '[2001:db8:85a3::7334%en1]',
        port: '80',
      },
    },
    {
      uri: 'git+ssh://localhost:1234',
      expected: {
        protocol: 'git+ssh',
        hostname: 'localhost',
        port: '1234',
      },
    },
    {
      uri: 'file://host/dir/file',
      expected: {
        protocol: 'file',
        hostname: 'host',
        directory: '/dir/',
        filename: 'file',
      },
    },
    {
      uri: 'file:///dir/file',
      expected: {
        protocol: 'file',
        hostname: '',
        directory: '/dir/',
        filename: 'file',
      },
    },
  ];

  it('should match expected results for a collection of URIs in default mode', () => {
    uris.forEach(uri => {
      expect(parseUri(uri.uri, 'default')).toMatchUriKeys({
        href: uri.uri,
        ...uri.expected,
      })
    });
  });
});
