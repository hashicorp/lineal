/**
 * Copyright IBM Corp. 2020, 2026
 */

export default {
  extends: 'recommended',
  checkHbsTemplateLiterals: false,
  overrides: [
    {
      files: '**/demo-app/**/*.{ts,js,gts,gjs}',
      rules: {
        'no-bare-strings': false,
        // Sir, this is a ~Wendy's~ test app, inline styles are useful for brevity.
        'no-inline-styles': false,
      },
    },
    {
      files: '**/docs/**/*.{ts,js,gts,gjs}',
      rules: {
        'no-bare-strings': false,
        'no-inline-styles': false,
        'style-concatenation': false,
      },
    },
    {
      files: '**/tests/**/*.{ts,js,gts,gjs}',
      rules: {
        'no-bare-strings': false,
        // Sir, this is a ~Wendy's~ test app, inline styles are useful for brevity.
        'no-inline-styles': false,
      },
    },
  ],
};
