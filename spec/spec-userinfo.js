describe('userinfo', () => {
  it('should allow userinfo on its own', () => {
    expect('//user:password@').toMatchUriKeysInAllModes({
      origin: '//user:password@',
      authority: 'user:password@',
      userinfo: 'user:password',
      username: 'user',
      password: 'password',
    });
  });

  it('should end at userinfo-delimiting @', () => {
    expect('//user:password@host').toMatchUriKeysInAllModes({
      username: 'user',
      password: 'password',
      host: 'host',
    });
  });

  it('should be precluded by resource-delimiting char before @', () => {
    const chars = ['/', '\\', '?', '#'];

    chars.forEach(char => {
      expect(`//user:pass${char}word@`).toMatchUriKeysInAllModes({
        username: '',
        password: '',
        hostname: 'user',
        port: 'pass',
        resource: `${char}word@`,
      });
    });
  });

  it('should be precluded by end of string before @', () => {
    expect('//user:password').toMatchUriKeysInAllModes({
      username: '',
      password: '',
      hostname: 'user',
      port: 'password',
    });
    expect('//user:pass:word').toMatchUriKeysInAllModes({
      username: '',
      password: '',
      hostname: 'user',
      port: 'pass',
      resource: ':word',
    });
  });

  it('should allow empty userinfo', () => {
    expect('//:@host').toMatchUriKeysInAllModes({
      username: '',
      password: '',
      host: 'host',
    });
    expect('//@host').toMatchUriKeysInAllModes({
      username: '',
      password: '',
      host: 'host',
    });
    // leading in friendly mode
    expect(parseUri('@host', 'friendly')).toMatchUriKeys({
      username: '',
      password: '',
      host: 'host',
    });
  });

  describe('username', () => {
    it('should allow username without password', () => {
      expect('//user@host').toMatchUriKeysInAllModes({
        username: 'user',
        password: '',
        host: 'host',
      });
    });

    it('[friendly mode] should allow leading username', () => {
      const uri = 'user@sub.domain.tld:1';
      const userinfoResult = {
        username: 'user',
        password: '',
        host: 'sub.domain.tld:1',
      };

      expect(parseUri(uri, 'default')).not.toMatchUriKeys(userinfoResult);
      expect(parseUri(uri, 'friendly')).toMatchUriKeys(userinfoResult);
    });
  });

  describe('password', () => {
    it('should allow password without username', () => {
      expect('//:password@host').toMatchUriKeysInAllModes({
        username: '',
        password: 'password',
        host: 'host',
      });
    });

    it('should allow empty password', () => {
      expect('//user:@host').toMatchUriKeysInAllModes({
        username: 'user',
        password: '',
        host: 'host',
      });
    });

    it('should not allow leading password', () => {
      // can't include leading password in friendly mode because that would turn username into protocol
      expect('user:password@sub.domain.tld:1').not.toMatchUriKeysInAllModes({password: 'password'});
      expect(':password@sub.domain.tld:1').not.toMatchUriKeys({password: 'password'});
    });

    it('should allow : in password', () => {
      expect('//user:pass:word@').toMatchUriKeysInAllModes({password: 'pass:word'});
      expect('//user::password@').toMatchUriKeysInAllModes({password: ':password'});
    });
  
    it('should allow @ in password', () => {
      expect('//user:pass@word@').toMatchUriKeysInAllModes({password: 'pass@word'});
      expect('//user:@password@').toMatchUriKeysInAllModes({password: '@password'});
      expect('//user:password@@').toMatchUriKeysInAllModes({password: 'password@'});
    });
  });
});
