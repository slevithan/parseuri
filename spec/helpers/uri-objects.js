beforeEach(() => {
  jasmine.addMatchers({
    // only compares given keys
    toMatchUriKeys: () => {
      return {
        compare: (actual, expected) => {
          for (const [key, expectedValue] of Object.entries(expected)) {
            if (actual[key] !== expectedValue) {
              return {pass: false};
            }
          }
          return {pass: true};
        },
      };
    },
    // only compares given keys
    toMatchUriKeysInAllModes: () => {
      return {
        compare: (actual, expected) => {
          const defaultResult = parseUri(actual, 'default');
          const friendlyResult = parseUri(actual, 'friendly');
          for (const [key, expectedValue] of Object.entries(expected)) {
            if (
              defaultResult[key] !== expectedValue ||
              friendlyResult[key] !== expectedValue
            ) {
              return {pass: false};
            }
          }
          return {pass: true};
        },
      };
    },
  });
});
