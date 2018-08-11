// @ts-check

/**
 * Iterate through the stylesheets in a document and replace pixel font sizes
 * with em based values.
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
    const fontSize = style.getPropertyValue("font-size");
    if (fontSize && fontSize.endsWith("px")) {
      const fontSizeValue = parseFloat(fontSize);
      const lineHeight = style.getPropertyValue("line-height");

      if (lineHeight && lineHeight.endsWith("px")) {
        const lineHeightValue = parseFloat(lineHeight);
        const relativeLineHeight = lineHeightValue / fontSizeValue;
        style.setProperty("line-height", `${relativeLineHeight}em`);
      }

      const relativeFontSize = fontSizeValue / 16;
      style.setProperty("font-size", `${relativeFontSize}em`);
    }
  }
}

pxToEm();
