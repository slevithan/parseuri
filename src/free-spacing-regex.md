Since it’s not straightforward to strip whitespace from a template literal using JavaScript minification tools, the free-spacing version of this regex pattern is preserved here for readability. To update it, change the code here first, then simply remove all whitespace within `` String.raw`...` `` before inserting the result into `index.js`.

```js
// protocol always excludes dot for consistency with friendly mode (which needs to exclude it to
// handle 'example.com:port' without a preceeding '//' or ':')
String.raw`
^
(?<origin>
  (?:
    (?<protocol>
      [a-z]
      [^\s:@\\/?#.]*
    )
    :
  )?
  ${authority[mode].start}
    (?<authority>
      (?:
        (?<userinfo>
          (?<username> [^:@\\/?#]* )
          (?:
            :
            (?<password> [^\\/?#]* )
          )?
        )?
        @
      )?
      (?<host>
        (?<hostname>
          \d{1,3} (?: \. \d{1,3} ){3}
          (?= [:\\/?#] | $ )
        |
          \[
            [a-f\d]{0,4} (?: : [a-f\d]{0,4} ){2,7}
            (?: % [^\]]* )?
          \]
        |
          (?<subdomain> [^:\\/?#]*? )
          \.??
          (?<domain>
            (?:
              [^.:\\/?#]*
              \.
            )?
            (?<tld> [^.:\\/?#]* )
          )
          (?= [:\\/?#] | $ )
        )?
        (?:
          :
          (?<port> [^:\\/?#]* )
        )?
      )
    )
  ${authority[mode].end}
)
(?<resource>
  (?<pathname>
    (?<directory>
      (?:
        [^\\/?#]*
        [\\/]
      )*
    )
    (?<filename>
      (?:
        [^.?#]+
      |
        \. (?! [^.?#]+ (?: [?#] | $ ) )
      )*
      (?:
        \.
        (?<suffix> [^.?#]+ )
      )?
    )
  )
  (?:
    \?
    (?<query> [^#]* )
  )?
  (?:
    \#
    (?<fragment> .* )
  )?
)
`.replace(/\s+/g, '');
```
