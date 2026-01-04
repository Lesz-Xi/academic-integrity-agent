# Linear Algebra Essentials Study Sheet
## Formative Assessment Prep | January 7, 2026

---

## 1. Linear Systems: Definitions

### What is a Linear System?
A **linear system** is a collection of linear equations involving the same set of variables.

**Example (2 equations, 2 unknowns):**
```
x + 2y = 5
3x - y = 4
```

### Matrix Representation
Any linear system can be written as an **augmented matrix** `[A|b]`:
```
| 1   2 | 5 |
| 3  -1 | 4 |
```
- Left side = **coefficient matrix** (A)
- Right side = **constants vector** (b)

---

## 2. Solution Categories (CRITICAL)

### Three Possible Outcomes:

| Type | Condition | Geometric Meaning | Matrix Signature |
|------|-----------|-------------------|------------------|
| **Unique Solution** | Exactly one solution exists | Lines intersect at one point | No free variables, consistent |
| **Infinite Solutions** | Infinitely many solutions | Lines overlap (same line) | Free variables exist, consistent |
| **No Solution** | No solution exists | Lines are parallel | Row of form `[0 0 ... 0 | c]` where c ≠ 0 |

### Quick Recognition Rules:
- **Unique**: Every column (except last) has a pivot
- **Infinite**: Consistent, but at least one column lacks a pivot → free variable
- **No Solution**: A row like `[0 0 0 | 5]` (contradiction: 0 = 5)

---

## 3. Gaussian Elimination (Core Method)

### Goal
Transform augmented matrix to **Row Echelon Form (REF)** using elementary row operations.

### Three Elementary Row Operations
1. **Swap** two rows: R₁ ↔ R₂
2. **Scale** a row by a non-zero constant: kR₁ → R₁
3. **Add** a multiple of one row to another: R₁ + kR₂ → R₁

### Step-by-Step Process

**Step 1: Identify the Pivot**
- Find the leftmost non-zero entry in the first row (this is your pivot)
- If the pivot position is 0, swap with a row below that has a non-zero entry

**Step 2: Create Zeros Below the Pivot**
- Use row operations to make all entries below the pivot = 0

**Step 3: Move to the Next Row**
- Repeat for the submatrix (ignore rows/columns already processed)

**Step 4: Continue Until REF**
- Stop when all rows below each pivot are zeros

### Example: 3×3 System
```
| 1   2   1 | 2 |        | 1   2   1 | 2 |        | 1   2   1 | 2 |
| 2   6   1 | 7 |   →    | 0   2  -1 | 3 |   →    | 0   2  -1 | 3 |
| 1   1   4 | 3 |        | 0  -1   3 | 1 |        | 0   0  2.5| 2.5|
   (original)          (R2-2R1, R3-R1)           (R3+0.5R2)
```

---

## 4. REF vs RREF

### Row Echelon Form (REF)
Requirements:
- All zero rows at the bottom
- Leading entry (pivot) of each row is RIGHT of the pivot above it
- All entries below a pivot are 0

### Reduced Row Echelon Form (RREF)
Additional requirements:
- Every pivot = 1
- Every entry ABOVE a pivot is also 0

### RREF Example:
```
| 1  0  0 | 3 |
| 0  1  0 | 2 |
| 0  0  1 | 1 |
```
This directly gives the solution: x=3, y=2, z=1

---

## 5. Pivot Positions

### Definition
A **pivot position** is a location in the matrix where a leading 1 appears in RREF.

### Why Pivots Matter:
- **Pivot columns** → basic variables (determined uniquely)
- **Non-pivot columns** → free variables (can be any value)

### Example:
```
| 1  2  0  3 | 5 |
| 0  0  1  4 | 2 |
| 0  0  0  0 | 0 |
```
- Pivot positions: column 1, column 3
- Free variables: column 2 (x₂), column 4 (x₄)
- This system has **infinite solutions**

---

## 6. Back Substitution

After reaching REF, solve from **bottom to top**:

1. Solve the last equation for its variable
2. Substitute into the equation above
3. Repeat until all variables are found

**Example:**
```
x + 2y + z = 2
    2y - z = 3
       2.5z = 2.5
```
- From row 3: z = 1
- Substitute into row 2: 2y - 1 = 3 → y = 2
- Substitute into row 1: x + 4 + 1 = 2 → x = -3

---

## 7. Special Cases

### Case 1: Row Swap Needed
If a pivot position is 0, swap with a row below:
```
| 0  2  1 | 3 |        | 1  1  3 | 5 |
| 1  1  3 | 5 |   →    | 0  2  1 | 3 |
```

### Case 2: Infinite Solutions (Parametric Form)
When free variables exist, express solution in terms of parameters:
```
x₁ = 5 - 2t
x₂ = t        (free variable, t ∈ ℝ)
x₃ = 2
```

### Case 3: No Solution
Contradiction row appears:
```
| 1  2  3 | 4 |
| 0  0  0 | 5 |  ← This means 0 = 5 (impossible!)
```

---

## 8. Matrix Operations Quick Reference

### Addition/Subtraction
- Must have **same dimensions**
- Add/subtract corresponding entries

### Scalar Multiplication
- Multiply every entry by the scalar

### Matrix Multiplication (A × B)
- **Dimension rule**: (m×n) × (n×p) = (m×p)
- Entry (i,j) = dot product of row i of A with column j of B
- **NOT COMMUTATIVE**: AB ≠ BA in general

### Transpose (Aᵀ)
- Swap rows and columns
- (Aᵀ)ᵀ = A

---

## 9. Common Mistakes to Avoid ⚠️

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| Not checking for row swaps | Pivot might be 0 | Always check if swap needed |
| Forgetting to carry the augmented column | Changes the solution | Always include the rightmost column in operations |
| Stopping at REF for unique solution | Still need back substitution | Continue to RREF or use back-sub |
| Assuming AB = BA | Matrix multiplication is NOT commutative | Always check order |
| Misidentifying solution type | Confusing free variables with no solution | Look for contradiction rows |

---

## 10. Quick Self-Test Questions

1. What are the three types of solutions for a linear system?
2. In Gaussian elimination, what do you do if the pivot position is 0?
3. How do you identify a "no solution" case from the augmented matrix?
4. What's the difference between REF and RREF?
5. If a 3×4 augmented matrix (3 equations, 3 unknowns) has pivots in columns 1 and 3 only, how many free variables exist?

---

## Key Formulas Summary

```
Elementary Row Operations:
  Rᵢ ↔ Rⱼ        (swap)
  kRᵢ → Rᵢ       (scale, k ≠ 0)
  Rᵢ + kRⱼ → Rᵢ  (replace)

Matrix Multiplication Dimensions:
  (m × n) · (n × p) = (m × p)

Inconsistent System Indicator:
  [0  0  ...  0 | c]  where c ≠ 0
```

---

*Last updated: January 1, 2026*
*Source: Mapúa Malayan Colleges Mindanao Lectures, Howard Anton & Chris Rorres*
