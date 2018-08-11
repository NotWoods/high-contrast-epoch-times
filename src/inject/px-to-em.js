// @ts-check

/**
 * Iterate through the stylesheets in a document and replace pixel font sizes
 * with em based values. Afterwards, do the same for all elements with inline
 * styles.
 */
function pxToEm() {
  for (let i = 0; i < document.styleSheets.length; i++) {
    const styleSheet = /** @type {CSSStyleSheet} */ (document.styleSheets[i]);
    try {
      processRules(styleSheet.cssRules);
    } catch (err) {
      if (err.name !== "SecurityError") throw err;
      else console.warn(i, err);
    }
  }

  /** @type {NodeListOf<HTMLElement>} */
  const inlineStyles = document.querySelectorAll('[style*="px"]');
  for (const { style } of inlineStyles) {
    const newValues = calculateNewSizes(style.fontSize, style.lineHeight);
    Object.assign(style, newValues);
  }
}

/**
 * Process a list of CSS rules, either from a style sheet or from a grouping
 * CSS rule (such as @media).
 * @param {CSSRuleList} rules
 */
function processRules(rules) {
  for (let j = 0; j < rules.length; j++) {
    const rule = rules[j];
    switch (rule.type) {
      case CSSRule.STYLE_RULE:
        const { style } = /** @type {CSSStyleRule} */ (rule);
        processStyle(style);
        break;
      case CSSRule.MEDIA_RULE:
        const { cssRules } = /** @type {CSSGroupingRule} */ (rule);
        processRules(cssRules);
        break;
    }
  }
}

/**
 * Process a CSS style rule by replacing pixel font sizes with em based sizes.
 * Line heights are also updated to use ems if nessecary.
 * @param {CSSStyleDeclaration} style Object representing the styles from a CSS
 * rule.
 */
function processStyle(style) {
  if (style.cssText.includes("px")) {
    const { fontSize, lineHeight } = calculateNewSizes(
      style.getPropertyValue("font-size"),
      style.getPropertyValue("line-height")
    );

    if (fontSize) style.setProperty("font-size", fontSize);
    if (lineHeight) style.setProperty("line-height", lineHeight);
  }
}

/**
 * Calculate new font size to replace pixel sizes with em based sizes.
 * Returns an object with new values.
 * @param {string} fontSize
 * @param {string} lineHeight
 */
function calculateNewSizes(fontSize, lineHeight) {
  /** @type {{ fontSize?: string, lineHeight?: string }} */
  let result = {};

  if (fontSize && fontSize.endsWith("px")) {
    const fontSizeValue = parseFloat(fontSize);

    if (lineHeight && lineHeight.endsWith("px")) {
      const lineHeightValue = parseFloat(lineHeight);
      const relativeLineHeight = lineHeightValue / fontSizeValue;
      result.lineHeight = `${relativeLineHeight}em`;
    }

    const relativeFontSize = fontSizeValue / 16;
    result.fontSize = `${relativeFontSize}em`;
  }

  return result;
}

pxToEm();
