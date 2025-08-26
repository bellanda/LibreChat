import { preprocessLaTeX, processLaTeX } from './latex';

describe('processLaTeX', () => {
  test('returns the same string if no LaTeX patterns are found', () => {
    const content = 'This is a test string without LaTeX';
    expect(processLaTeX(content)).toBe(content);
  });

  test('converts inline LaTeX expressions correctly', () => {
    const content = 'This is an inline LaTeX expression: \\(x^2 + y^2 = z^2\\)';
    const expected = 'This is an inline LaTeX expression: $x^2 + y^2 = z^2$';
    expect(processLaTeX(content)).toBe(expected);
  });

  test('converts block LaTeX expressions correctly', () => {
    const content = 'This is a block LaTeX expression: \\[E = mc^2\\]';
    const expected = 'This is a block LaTeX expression: $$E = mc^2$$';
    expect(processLaTeX(content)).toBe(expected);
  });

  test('converts mixed LaTeX expressions correctly', () => {
    const content = 'Inline \\(a + b = c\\) and block \\[x^2 + y^2 = z^2\\]';
    const expected = 'Inline $a + b = c$ and block $$x^2 + y^2 = z^2$$';
    expect(processLaTeX(content)).toBe(expected);
  });

  test('escapes dollar signs followed by a digit or space and digit', () => {
    const content = 'Price is $50 and $ 100';
    const expected = 'Price is \\$50 and \\$ 100';
    expect(processLaTeX(content)).toBe(expected);
  });

  test('handles strings with no content', () => {
    const content = '';
    expect(processLaTeX(content)).toBe('');
  });

  test('does not alter already valid inline Markdown LaTeX', () => {
    const content = 'This is a valid inline LaTeX: $x^2 + y^2 = z^2$';
    expect(processLaTeX(content)).toBe(content);
  });

  test('does not alter already valid block Markdown LaTeX', () => {
    const content = 'This is a valid block LaTeX: $$E = mc^2$$';
    expect(processLaTeX(content)).toBe(content);
  });

  test('correctly processes a mix of valid Markdown LaTeX and LaTeX patterns', () => {
    const content = 'Valid $a + b = c$ and LaTeX to convert \\(x^2 + y^2 = z^2\\)';
    const expected = 'Valid $a + b = c$ and LaTeX to convert $x^2 + y^2 = z^2$';
    expect(processLaTeX(content)).toBe(expected);
  });

  test('correctly handles strings with LaTeX and non-LaTeX dollar signs', () => {
    const content = 'Price $100 and LaTeX \\(x^2 + y^2 = z^2\\)';
    const expected = 'Price \\$100 and LaTeX $x^2 + y^2 = z^2$';
    expect(processLaTeX(content)).toBe(expected);
  });

  test('ignores non-LaTeX content enclosed in dollar signs', () => {
    const content = 'This is not LaTeX: $This is just text$';
    expect(processLaTeX(content)).toBe(content);
  });

  test('correctly processes complex block LaTeX with line breaks', () => {
    const complexBlockLatex = `Certainly! Here's an example of a mathematical formula written in LaTeX:

    \\[
    \\sum_{i=1}^{n} \\left( \\frac{x_i}{y_i} \\right)^2
    \\]
    
    This formula represents the sum of the squares of the ratios of \\(x\\) to \\(y\\) for \\(n\\) terms, where \\(x_i\\) and \\(y_i\\) represent the values of \\(x\\) and \\(y\\) for each term.
    
    LaTeX is a typesetting system commonly used for mathematical and scientific documents. It provides a wide range of formatting options and symbols for expressing mathematical expressions.`;
    const expectedOutput = `Certainly! Here's an example of a mathematical formula written in LaTeX:

    $$
    \\sum_{i=1}^{n} \\left( \\frac{x_i}{y_i} \\right)^2
    $$
    
    This formula represents the sum of the squares of the ratios of $x$ to $y$ for $n$ terms, where $x_i$ and $y_i$ represent the values of $x$ and $y$ for each term.
    
    LaTeX is a typesetting system commonly used for mathematical and scientific documents. It provides a wide range of formatting options and symbols for expressing mathematical expressions.`;
    expect(processLaTeX(complexBlockLatex)).toBe(expectedOutput);
  });

  describe('processLaTeX with code block exception', () => {
    test('ignores dollar signs inside inline code', () => {
      const content = 'This is inline code: `$100`';
      expect(processLaTeX(content)).toBe(content);
    });

    test('ignores dollar signs inside multi-line code blocks', () => {
      const content = '```\n$100\n# $1000\n```';
      expect(processLaTeX(content)).toBe(content);
    });

    test('processes LaTeX outside of code blocks', () => {
      const content =
        'Outside \\(x^2 + y^2 = z^2\\) and inside code block: ```\n$100\n# $1000\n```';
      const expected = 'Outside $x^2 + y^2 = z^2$ and inside code block: ```\n$100\n# $1000\n```';
      expect(processLaTeX(content)).toBe(expected);
    });

    test('does not escape currency symbols like R$, US$, EUR$', () => {
      const content = 'A arrecadação foi de R$ 20 bilhões, US$ 100 milhões e EUR$ 50 milhões.';
      expect(processLaTeX(content)).toBe(content);
    });

    test('handles mixed currency symbols and standalone dollar signs', () => {
      const content = 'R$ 100 and standalone $200 and US$ 300';
      const expected = 'R$ 100 and standalone \\$200 and US$ 300';
      expect(processLaTeX(content)).toBe(expected);
    });

    test('preserves common currency prefixes', () => {
      const content = 'Prices: R$ 50, US$ 100, CAD$ 75, AUD$ 80, EUR$ 60';
      expect(processLaTeX(content)).toBe(content);
    });

    test('handles currency with decimals and commas', () => {
      const content =
        'A equipe econômica estima arrecadar R$ 20,5 bilhões em 2025 e R$ 41 bilhões em 2026';
      expect(processLaTeX(content)).toBe(content);
    });

    test('handles currency with spaces and various formats', () => {
      const content = 'Valores: R$ 1.000,50 e US$ 2,500.75 e EUR$ 3 456,89';
      expect(processLaTeX(content)).toBe(content);
    });

    test('handles currency with markdown formatting', () => {
      const content =
        'Arrecadação de **R$ 20 bilhões** para cerca de R$ 6 bilhões** a **R$ 7 bilhões';
      expect(processLaTeX(content)).toBe(content);
    });

    test('handles currency with special unicode characters', () => {
      const content = 'IOF de cerca de R$ 20 bilhões\\ue203Segundo a equipe econômica';
      expect(processLaTeX(content)).toBe(content);
    });

    test('handles complex real-world example', () => {
      const content =
        'governo reduziu a arrecadação com a alta do IOF de cerca de **R$ 20 bilhões** para cerca de R$ 6 bilhões** a **R$ 7 bilhões';
      expect(processLaTeX(content)).toBe(content);
    });
  });
});

describe('preprocessLaTeX', () => {
  test('returns the same string if no LaTeX patterns are found', () => {
    const content = 'This is a test string without LaTeX or dollar signs';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('returns the same string if no dollar signs are present', () => {
    const content = 'This has LaTeX \\(x^2\\) and \\[y^2\\] but no dollars';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('preserves valid inline LaTeX delimiters \\(...\\)', () => {
    const content = 'This is inline LaTeX: \\(x^2 + y^2 = z^2\\)';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('preserves valid block LaTeX delimiters \\[...\\]', () => {
    const content = 'This is block LaTeX: \\[E = mc^2\\]';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('preserves valid double dollar delimiters', () => {
    const content = 'This is valid: $$x^2 + y^2 = z^2$$';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('converts single dollar delimiters to double dollars', () => {
    const content = 'Inline math: $x^2 + y^2 = z^2$';
    const expected = 'Inline math: $$x^2 + y^2 = z^2$$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('converts multiple single dollar expressions', () => {
    const content = 'First $a + b = c$ and second $x^2 + y^2 = z^2$';
    const expected = 'First $$a + b = c$$ and second $$x^2 + y^2 = z^2$$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes currency dollar signs', () => {
    const content = 'Price is $50 and $100';
    const expected = 'Price is \\$50 and \\$100';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes currency with spaces', () => {
    const content = '$50 is $20 + $30';
    const expected = '\\$50 is \\$20 + \\$30';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes currency with commas', () => {
    const content = 'The price is $1,000,000 for this item.';
    const expected = 'The price is \\$1,000,000 for this item.';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes currency with decimals', () => {
    const content = 'Total: $29.50 plus tax';
    const expected = 'Total: \\$29.50 plus tax';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('converts LaTeX expressions while escaping currency', () => {
    const content = 'LaTeX $x^2$ and price $50';
    const expected = 'LaTeX $$x^2$$ and price \\$50';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles Goldbach Conjecture example', () => {
    const content = '- **Goldbach Conjecture**: $2n = p + q$ (every even integer > 2)';
    const expected = '- **Goldbach Conjecture**: $$2n = p + q$$ (every even integer > 2)';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('does not escape already escaped dollar signs', () => {
    const content = 'Already escaped \\$50 and \\$100';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('does not convert already escaped single dollars', () => {
    const content = 'Escaped \\$x^2\\$ should not change';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('escapes mhchem commands', () => {
    const content = '$\\ce{H2O}$ and $\\pu{123 J}$';
    const expected = '$$\\\\ce{H2O}$$ and $$\\\\pu{123 J}$$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles empty string', () => {
    expect(preprocessLaTeX('')).toBe('');
  });

  test('handles complex mixed content', () => {
    const content = `Valid double $$y^2$$
Currency $100 and $200
Single dollar math $x^2 + y^2$
Chemical $\\ce{H2O}$
Valid brackets \\[z^2\\]`;
    const expected = `Valid double $$y^2$$
Currency \\$100 and \\$200
Single dollar math $$x^2 + y^2$$
Chemical $$\\\\ce{H2O}$$
Valid brackets \\[z^2\\]`;
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles multiple equations with currency', () => {
    const content = `- **Euler's Totient Function**: $\\phi(n) = n \\prod_{p|n} \\left(1 - \\frac{1}{p}\\right)$
- **Total Savings**: $500 + $200 + $150 = $850`;
    const expected = `- **Euler's Totient Function**: $$\\phi(n) = n \\prod_{p|n} \\left(1 - \\frac{1}{p}\\right)$$
- **Total Savings**: \\$500 + \\$200 + \\$150 = \\$850`;
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles inline code blocks', () => {
    const content = 'Outside $x^2$ and inside code: `$100`';
    const expected = 'Outside $$x^2$$ and inside code: `$100`';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles multiline code blocks', () => {
    const content = '```\n$100\n$variable\n```\nOutside $x^2$';
    const expected = '```\n$100\n$variable\n```\nOutside $$x^2$$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('preserves LaTeX expressions with special characters', () => {
    const content = 'The set is defined as $\\{x | x > 0\\}$.';
    const expected = 'The set is defined as $$\\{x | x > 0\\}$$.';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles complex physics equations', () => {
    const content = `- **Schrödinger Equation**: $i\\hbar\\frac{\\partial}{\\partial t}|\\psi\\rangle = \\hat{H}|\\psi\\rangle$
- **Einstein Field Equations**: $G_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$`;
    const expected = `- **Schrödinger Equation**: $$i\\hbar\\frac{\\partial}{\\partial t}|\\psi\\rangle = \\hat{H}|\\psi\\rangle$$
- **Einstein Field Equations**: $$G_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$$`;
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles financial calculations with currency', () => {
    const content = `- **Simple Interest**: $A = P + Prt = $1,000 + ($1,000)(0.05)(2) = $1,100$
- **ROI**: $\\text{ROI} = \\frac{$1,200 - $1,000}{$1,000} \\times 100\\% = 20\\%$`;
    const expected = `- **Simple Interest**: $$A = P + Prt = \\$1,000 + (\\$1,000)(0.05)(2) = \\$1,100$$
- **ROI**: $$\\text{ROI} = \\frac{\\$1,200 - \\$1,000}{\\$1,000} \\times 100\\% = 20\\%$$`;
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('does not convert partial or malformed expressions', () => {
    const content = 'A single $ sign should not be converted';
    const expected = 'A single $ sign should not be converted';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles nested parentheses in LaTeX', () => {
    const content =
      'Matrix determinant: $\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_{i=1}^n a_{i,\\sigma(i)}$';
    const expected =
      'Matrix determinant: $$\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_{i=1}^n a_{i,\\sigma(i)}$$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('preserves spacing in equations', () => {
    const content = 'Equation: $f(x) = 2x + 3$ where x is a variable.';
    const expected = 'Equation: $$f(x) = 2x + 3$$ where x is a variable.';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles LaTeX with newlines inside should not be converted', () => {
    const content = `This has $x
y$ which spans lines`;
    const expected = `This has $x
y$ which spans lines`;
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles multiple dollar signs in text', () => {
    const content = 'Price $100 then equation $x + y = z$ then another price $50';
    const expected = 'Price \\$100 then equation $$x + y = z$$ then another price \\$50';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles complex LaTeX with currency in same expression', () => {
    const content = 'Calculate $\\text{Total} = \\$500 + \\$200$';
    const expected = 'Calculate $$\\text{Total} = \\$500 + \\$200$$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('preserves already escaped dollars in LaTeX', () => {
    const content = 'The formula $f(x) = \\$2x$ represents cost';
    const expected = 'The formula $$f(x) = \\$2x$$ represents cost';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles adjacent LaTeX and currency', () => {
    const content = 'Formula $x^2$ costs $25';
    const expected = 'Formula $$x^2$$ costs \\$25';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles LaTeX with special characters and currency', () => {
    const content = 'Set $\\{x | x > \\$0\\}$ for positive prices';
    const expected = 'Set $$\\{x | x > \\$0\\}$$ for positive prices';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('does not escape currency symbols like R$, US$, EUR$', () => {
    const content = 'A arrecadação foi de R$ 20 bilhões, US$ 100 milhões e EUR$ 50 milhões.';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('handles mixed currency symbols and standalone dollar signs', () => {
    const content = 'R$ 100 and standalone $200 and US$ 300';
    const expected = 'R$ 100 and standalone \\$200 and US$ 300';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('preserves common currency prefixes', () => {
    const content = 'Prices: R$ 50, US$ 100, CAD$ 75, AUD$ 80, EUR$ 60';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('handles currency with decimals and commas', () => {
    const content =
      'A equipe econômica estima arrecadar R$ 20,5 bilhões em 2025 e R$ 41 bilhões em 2026';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('handles currency with spaces and various formats', () => {
    const content = 'Valores: R$ 1.000,50 e US$ 2,500.75 e EUR$ 3 456,89';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('handles currency with markdown formatting', () => {
    const content =
      'Arrecadação de **R$ 20 bilhões** para cerca de R$ 6 bilhões** a **R$ 7 bilhões';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('handles currency with special unicode characters', () => {
    const content = 'IOF de cerca de R$ 20 bilhões\\ue203Segundo a equipe econômica';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('handles complex real-world example', () => {
    const content =
      'governo reduziu a arrecadação com a alta do IOF de cerca de **R$ 20 bilhões** para cerca de R$ 6 bilhões** a **R$ 7 bilhões';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('does not convert when closing dollar is preceded by backtick', () => {
    const content = 'The error "invalid $lookup namespace" occurs when using `$lookup` operator';
    const expected = 'The error "invalid $lookup namespace" occurs when using `$lookup` operator';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles mixed backtick and non-backtick cases', () => {
    const content = 'Use $x + y$ in math but `$lookup` in code';
    const expected = 'Use $$x + y$$ in math but `$lookup` in code';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes currency amounts without commas', () => {
    const content =
      'The total amount invested is $1157.90 (existing amount) + $500 (new investment) = $1657.90.';
    const expected =
      'The total amount invested is \\$1157.90 (existing amount) + \\$500 (new investment) = \\$1657.90.';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles large currency amounts', () => {
    const content = 'You can win $1000000 or even $9999999.99!';
    const expected = 'You can win \\$1000000 or even \\$9999999.99!';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes currency with many decimal places', () => {
    const content = 'Bitcoin: $0.00001234, Gas: $3.999, Rate: $1.234567890';
    const expected = 'Bitcoin: \\$0.00001234, Gas: \\$3.999, Rate: \\$1.234567890';
    expect(preprocessLaTeX(content)).toBe(expected);
  });
});
