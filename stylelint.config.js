/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    // Allow Tailwind CSS v4 import syntax
    'import-notation': null,
    // Allow Tailwind CSS v4 at-rules
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'theme',
          'variants',
          'responsive',
          'screen',
          'utility',
          'component',
          'import'
        ]
      }
    ],

    // Allow custom properties (CSS variables)
    'custom-property-empty-line-before': [
      'always',
      {
        except: ['after-custom-property', 'first-nested'],
        ignore: ['after-comment', 'inside-single-line-block']
      }
    ],

    // Modern CSS features
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'screen']
      }
    ],

    // Color format - prefer modern formats
    'color-function-notation': 'modern',
    'alpha-value-notation': 'number',
    'color-hex-length': null, // Allow both short and long hex

    // Property ordering for better readability
    'order/properties-order': [
      // Positioning
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',

      // Display & Box Model
      'display',
      'flex',
      'flex-direction',
      'flex-wrap',
      'flex-flow',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'justify-content',
      'align-items',
      'align-content',
      'align-self',
      'order',
      'grid',
      'grid-template',
      'grid-template-rows',
      'grid-template-columns',
      'grid-template-areas',
      'grid-auto-rows',
      'grid-auto-columns',
      'grid-auto-flow',
      'grid-column',
      'grid-row',
      'grid-area',
      'gap',
      'row-gap',
      'column-gap',

      // Box model
      'box-sizing',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',

      // Border
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-top',
      'border-right',
      'border-bottom',
      'border-left',
      'border-radius',

      // Background
      'background',
      'background-color',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-clip',
      'background-origin',
      'background-attachment',
      'background-blend-mode',

      // Typography
      'color',
      'font',
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'font-variant',
      'line-height',
      'letter-spacing',
      'word-spacing',
      'text-align',
      'text-decoration',
      'text-transform',
      'white-space',

      // Visual
      'opacity',
      'visibility',
      'overflow',
      'overflow-x',
      'overflow-y',
      'clip-path',
      'filter',
      'backdrop-filter',
      'box-shadow',
      'text-shadow',

      // Transforms & Animation
      'transform',
      'transform-origin',
      'animation',
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-delay',
      'animation-iteration-count',
      'animation-direction',
      'animation-fill-mode',
      'animation-play-state',
      'transition',
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',

      // Misc
      'cursor',
      'pointer-events',
      'user-select',
      'content'
    ],

    // Disable rules that conflict with Tailwind CSS
    'declaration-block-no-redundant-longhand-properties': null,
    'no-descending-specificity': null,

    // Modern CSS best practices
    'selector-class-pattern': null, // Allow Tailwind's utility classes
    'value-keyword-case': ['lower', { ignoreKeywords: ['currentColor'] }],

    // PostCSS compatibility
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local']
      }
    ],

    // Allow empty sources (for Tailwind @import)
    'no-empty-source': null,

    // Media queries
    'media-feature-range-notation': 'context',

    // Performance
    'max-nesting-depth': 3,

    // Comments
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['stylelint-commands', 'after-comment']
      }
    ]
  },

  // Support different file types
  overrides: [
    {
      files: ['**/*.html'],
      customSyntax: 'postcss-html'
    }
  ],

  // Ignore patterns
  ignoreFiles: ['node_modules/**', '.next/**', 'build/**', 'dist/**', 'coverage/**', '**/*.min.css']
};

export default config;
