/**
 * LaTeX to Unicode converter for clean text display
 * Converts common LaTeX math notation to readable plain text/Unicode
 */

// Common LaTeX symbol mappings
const LATEX_SYMBOLS: Record<string, string> = {
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
  '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
  '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
  '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
  '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
  '\\Psi': 'Ψ', '\\Omega': 'Ω',
  '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓',
  '\\cdot': '·', '\\circ': '∘', '\\bullet': '•',
  '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈',
  '\\equiv': '≡', '\\sim': '∼', '\\propto': '∝',
  '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇',
  '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\supset': '⊃',
  '\\cup': '∪', '\\cap': '∩', '\\emptyset': '∅',
  '\\forall': '∀', '\\exists': '∃', '\\neg': '¬',
  '\\wedge': '∧', '\\vee': '∨', '\\Rightarrow': '⇒', '\\Leftarrow': '⇐',
  '\\rightarrow': '→', '\\leftarrow': '←', '\\leftrightarrow': '↔',
  '\\sum': 'Σ', '\\prod': 'Π', '\\int': '∫',
  '\\sqrt': '√', '\\hat': '', '\\bar': '', '\\tilde': '~',
  '\\text': '', '\\mathbf': '', '\\mathcal': '', '\\mathbb': '',
  '\\left': '', '\\right': '', '\\big': '', '\\Big': '',
  '\\frac': '/', '\\dfrac': '/',
};

// Subscript and superscript mappings
const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
};

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'T': 'ᵀ',
};

/**
 * Clean LaTeX notation from text and convert to Unicode/plain text
 */
export function cleanLatex(text: string): string {
  let result = text;

  // Remove $$ block delimiters and $ inline delimiters
  result = result.replace(/\$\$(.*?)\$\$/gs, (_, content) => cleanLatexContent(content));
  result = result.replace(/\$(.*?)\$/g, (_, content) => cleanLatexContent(content));

  return result;
}

/**
 * Clean the content inside LaTeX delimiters
 */
function cleanLatexContent(content: string): string {
  let result = content;

  // Replace common LaTeX symbols
  for (const [latex, unicode] of Object.entries(LATEX_SYMBOLS)) {
    const escaped = latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), unicode);
  }

  // Handle subscripts: _{...} or _x
  result = result.replace(/_{([^}]+)}/g, (_, sub) => {
    return sub.split('').map((c: string) => SUBSCRIPTS[c] || c).join('');
  });
  result = result.replace(/_([a-z0-9])/gi, (_, char) => SUBSCRIPTS[char.toLowerCase()] || `_${char}`);

  // Handle superscripts: ^{...} or ^x
  result = result.replace(/\^{([^}]+)}/g, (_, sup) => {
    return sup.split('').map((c: string) => SUPERSCRIPTS[c] || c).join('');
  });
  result = result.replace(/\^([a-z0-9TnN+-])/gi, (_, char) => SUPERSCRIPTS[char] || `^${char}`);

  // Handle fractions: \frac{a}{b} -> a/b
  result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1/$2)');

  // Remove remaining backslashes from commands
  result = result.replace(/\\([a-zA-Z]+)/g, '$1');

  // Clean up extra spaces and braces
  result = result.replace(/[{}]/g, '');
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}
