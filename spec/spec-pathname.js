describe('pathname', () => {
  it('shoud allow pathname on its own', () => {
    expect('/dir/file.ext').toMatchUriKeysInAllModes({
      pathname: '/dir/file.ext',
      directory: '/dir/',
      filename: 'file.ext',
      suffix: 'ext',
    });
    expect('\\dir\\file.ext').toMatchUriKeysInAllModes({
      pathname: '\\dir\\file.ext',
      directory: '\\dir\\',
      filename: 'file.ext',
      suffix: 'ext',
    });
  });

  it('shoud end at ? or #', () => {
    expect('/path?name/').toMatchUriKeysInAllModes({pathname: '/path'});
    expect('/path#name/').toMatchUriKeysInAllModes({pathname: '/path'});
  });

  it('shoud allow non-[a-z] char', () => {
    const chars = [' ', '@', ':', '%', '-', 'ш'];

    chars.forEach(char => {
      expect(`/${char}dir/${char}file`).toMatchUriKeysInAllModes({
        directory: `/${char}dir/`,
        filename: `${char}file`,
      });
    });
  });

  it('[friendly mode] shoud treat first part of relative pathname as hostname due to authority from implicitly inserted //', () => {
    expect(parseUri('host/', 'friendly')).toMatchUriKeys({
      hostname: 'host',
      pathname: '/',
    });
    expect(parseUri('./dir/', 'friendly')).toMatchUriKeys({
      hostname: '.',
      pathname: '/dir/',
    });
    expect(parseUri('../../dir/', 'friendly')).toMatchUriKeys({
      hostname: '..',
      pathname: '/../dir/',
    });
  });

  it('should allow any forward and back slashes to mark directory segments', () => {
    expect('//host/file').toMatchUriKeysInAllModes({pathname: '/file', filename: 'file'});
    expect('//host\\file').toMatchUriKeysInAllModes({pathname: '\\file', filename: 'file'});
    expect('//host/dir\\file').toMatchUriKeysInAllModes({pathname: '/dir\\file', filename: 'file'});
    expect('//host\\dir/file').toMatchUriKeysInAllModes({pathname: '\\dir/file', filename: 'file'});
  });

  describe('directory', () => {
    it('shoud allow root directory on its own', () => {
      expect('/').toMatchUriKeysInAllModes({
        pathname: '/',
        directory: '/',
        filename: '',
        suffix: '',
      });
      expect('\\').toMatchUriKeysInAllModes({
        pathname: '\\',
        directory: '\\',
        filename: '',
        suffix: '',
      });
    });

    it('shoud allow relative directory path', () => {
      const directories = [
        '',
        './',
        '../',
        '../../',
        './dir/',
        '../dir/',
        'dir/',
        'dir/dir/',
      ];
      directories.forEach(directory => {
        expect(parseUri(`${directory}file.ext`, 'default')).toMatchUriKeys({
          hostname: '',
          pathname: `${directory}file.ext`,
          directory,
          filename: 'file.ext',
          suffix: 'ext',
        });
      });
    });

    it('shoud allow dot in directory', () => {
      expect('/dir.etc/').toMatchUriKeysInAllModes({
        pathname: '/dir.etc/',
        directory: '/dir.etc/',
        filename: '',
        suffix: '',
      });
      expect('/dir.etc.wow/').toMatchUriKeysInAllModes({
        pathname: '/dir.etc.wow/',
        directory: '/dir.etc.wow/',
        filename: '',
        suffix: '',
      });
      expect('/.dir/').toMatchUriKeysInAllModes({
        pathname: '/.dir/',
        directory: '/.dir/',
        filename: '',
        suffix: '',
      });
    });

    it('shoud allow dot in directory in relative path', () => {
      expect(parseUri('.dir/', 'default')).toMatchUriKeys({
        pathname: '.dir/',
        directory: '.dir/',
        filename: '',
        suffix: '',
      });
    });

    it('should allow empty directory segments in path', () => {
      expect('//host//dir/file').toMatchUriKeysInAllModes({directory: '//dir/'});
      expect('//host///file').toMatchUriKeysInAllModes({directory: '///'});
      expect('//host///').toMatchUriKeysInAllModes({directory: '///'});
      expect('/dir//file').toMatchUriKeysInAllModes({directory: '/dir//'});
      expect('/dir///dir/').toMatchUriKeysInAllModes({directory: '/dir///dir/'});
      expect('/dir///\\dir/').toMatchUriKeysInAllModes({directory: '/dir///\\dir/'});
    });
  });

  describe('filename and suffix', () => {
    it('shoud allow relative filename path', () => {
      expect(parseUri('file.ext', 'default')).toMatchUriKeys({
        hostname: '',
        pathname: 'file.ext',
        directory: '',
        filename: 'file.ext',
        suffix: 'ext',
      });
      expect(parseUri('file', 'default')).toMatchUriKeys({
        hostname: '',
        pathname: 'file',
        directory: '',
        filename: 'file',
        suffix: '',
      });
    });

    it('shoud allow multiple dots in filename', () => {
      expect('/file.etc.ext').toMatchUriKeysInAllModes({
        pathname: '/file.etc.ext',
        directory: '/',
        filename: 'file.etc.ext',
        suffix: 'ext',
      });
    });

    it('shoud allow leading dot in filename', () => {
      expect('/.gitignore').toMatchUriKeysInAllModes({
        pathname: '/.gitignore',
        directory: '/',
        filename: '.gitignore',
        suffix: 'gitignore',
      });
      expect('/.file.gitignore').toMatchUriKeysInAllModes({
        pathname: '/.file.gitignore',
        directory: '/',
        filename: '.file.gitignore',
        suffix: 'gitignore',
      });
    });

    it('should not include suffix if no dot in filename', () => {
      expect('/file').toMatchUriKeysInAllModes({
        pathname: '/file',
        directory: '/',
        filename: 'file',
        suffix: '',
      });
      expect('/dir/file').toMatchUriKeysInAllModes({
        pathname: '/dir/file',
        directory: '/dir/',
        filename: 'file',
        suffix: '',
      });
      expect(parseUri('dir/file', 'default')).toMatchUriKeys({
        pathname: 'dir/file',
        directory: 'dir/',
        filename: 'file',
        suffix: '',
      });
    });
  });
});
