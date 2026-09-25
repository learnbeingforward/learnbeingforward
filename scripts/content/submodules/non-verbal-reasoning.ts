import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  "courseSlug": "non-verbal-reasoning",
  "submodules": [
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Series completion",
      "overview": "Series completion questions — number series, letter series, alphanumeric series, and figure series — test pattern recognition by presenting a sequence with one clear underlying rule and asking you to find the next term, an odd term, or a deliberately wrong term planted in the sequence. The reliable method is always the same: compute the difference (or ratio) between consecutive terms first, and if that doesn't reveal a clean pattern, check for an alternating two-step rule or a polynomial (n²-based) pattern before assuming the series is unsolvable. This sub-module works through number series with constant and increasing differences, letter series with alphabet-position jumps, alphanumeric combinations, figure series described conceptually, odd-one-out detection, alternating two-step series, and wrong-number-in-the-series questions — each solved completely with the underlying rule stated explicitly.",
      "sections": [
        {
          "heading": "Number Series: Difference and Ratio Patterns",
          "body": "Start by computing the difference between consecutive terms; if that sequence of differences is itself constant or follows a simple pattern (like consecutive odd numbers), the rule is revealed. If differences don't work, try ratios (each term ×/÷ a constant or increasing factor).",
          "bullets": [
            "2, 5, 10, 17, 26, ? — differences: 3, 5, 7, 9 (consecutive odd numbers, increasing by 2 each time). Next difference = 11. Next term = 26 + 11 = 37."
          ]
        },
        {
          "heading": "Letter Series",
          "body": "Letter series follow the same difference-based logic, but the 'difference' is measured in alphabet positions (A=1, B=2, ... Z=26) rather than numeric value.",
          "bullets": [
            "A, C, F, J, O, ? — position gaps: +2, +3, +4, +5, +6. O is the 15th letter; +6 gives the 21st letter, U. So the next term is U."
          ]
        },
        {
          "heading": "Alphanumeric Series",
          "body": "These combine a letter pattern and a number pattern running in parallel within the same sequence — solve each sub-pattern (letters, numbers) independently, since they usually follow separate, simpler rules.",
          "bullets": [
            "A1, C3, E5, G7, ? — letters skip one each time (+2 position: A→C→E→G→I) and numbers increase by 2 (odd numbers: 1,3,5,7→9). Next term: I9."
          ]
        },
        {
          "heading": "Figure Series",
          "body": "Figure series apply the same 'find the transformation rule' logic to shapes instead of numbers or letters — common transformations include rotation by a fixed angle, addition/removal of an element, or a shape cycling through a fixed set of positions — and the correct next figure must continue that exact same transformation, not just look visually similar to the others."
        },
        {
          "heading": "Odd One Out in a Series",
          "body": "Odd-one-out questions give several terms where all but one follow a clear rule — first establish the rule from the majority of terms, then check each term against it to isolate the outlier.",
          "bullets": [
            "2, 4, 8, 16, 30, 64 — the rule is powers of 2 (2,4,8,16,32,64). Every term fits except 30, which should be 32. 30 is the odd one out."
          ]
        },
        {
          "heading": "Alternating (Two-Step) Series",
          "body": "Some series apply two different operations alternately (e.g., ×2 then −1, repeating) rather than one constant operation — if a single consistent difference or ratio doesn't fit, test whether alternating terms follow two separate, interleaved rules.",
          "bullets": [
            "3, 6, 5, 10, 9, 18, 17, ? — pattern alternates ×2 and −1: 3×2=6, 6−1=5, 5×2=10, 10−1=9, 9×2=18, 18−1=17, 17×2=34. Next term = 34."
          ]
        },
        {
          "heading": "Finding the Wrong Number in a Series",
          "body": "These questions present a full series with one term deliberately altered — find the underlying rule (often n², n²+1, or similar) using the terms that clearly fit, then compute what the flawed term SHOULD be to identify and correct it.",
          "bullets": [
            "5, 10, 17, 26, 37, 50, 64 — the rule is n²+1 for n=2,3,4,5,6,7,8: 5,10,17,26,37,50,65. The given series has 64 instead of 65 — 64 is the wrong number."
          ]
        }
      ],
      "commonPitfalls": [
        "Only checking for a constant difference and giving up if it isn't found, instead of also checking ratios, alternating patterns, or polynomial (n²) rules.",
        "In letter series, forgetting to convert letters to their numeric alphabet position before computing gaps.",
        "In alphanumeric series, trying to find one combined rule instead of solving the letter and number sub-patterns separately.",
        "In odd-one-out questions, establishing the rule from a minority of terms (including the actual outlier) instead of the clear majority.",
        "Missing an alternating two-step pattern by only testing a single constant operation between all consecutive terms.",
        "In wrong-number questions, assuming the LAST term is always the error instead of testing the rule against every term."
      ],
      "keyTakeaways": [
        "Always start with differences between consecutive terms; if that fails, test ratios, then alternating two-step rules, then n²-based patterns.",
        "Convert letters to alphabet positions (A=1...Z=26) before analyzing letter-series gaps.",
        "Alphanumeric series usually hide two independent, simpler sub-patterns (letters and numbers) rather than one combined rule.",
        "Establish a series rule from its clear majority of terms before testing which single term breaks it.",
        "Alternating series apply two different operations in a repeating two-step cycle — test this whenever a single operation doesn't fit.",
        "Figure series require identifying the exact transformation rule (rotation angle, added element), not just visual similarity to prior figures."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Series",
          "url": "https://www.indiabix.com/non-verbal-reasoning/series/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Pattern recognition",
      "overview": "Pattern recognition questions — figure analogies, classification (odd-figure-out), matrix completion, figure counting, embedded figures, and rule-based rotation/reflection sequences — test visual-logical reasoning independent of language or numbers, evaluating whether a candidate can identify the single consistent transformation or shared attribute governing a set of figures. As with number series, the reliable approach is to explicitly name the rule (rotation by X degrees, addition of a line, a shared count of sides) rather than relying on a figure simply 'looking right,' since distractor options are deliberately designed to look plausible at a glance while violating the actual rule. This sub-module works through each major pattern-recognition question type with a concrete, fully reasoned example, including two solvable figure-counting problems worked with an exact count.",
      "sections": [
        {
          "heading": "Figure Analogies",
          "body": "Figure analogies (Figure A : Figure B :: Figure C : ?) require identifying the exact transformation from A to B (a rotation, an added element, a color/shading change, a size change) and applying that same transformation to C — exactly like word analogies, but with a visual transformation instead of a semantic relationship."
        },
        {
          "heading": "Classification (Odd Figure Out)",
          "body": "Classification questions give several figures where all but one share a specific attribute (number of sides, number of lines of symmetry, presence of curved vs straight lines) — identify the shared attribute among the majority first, then find which figure breaks it.",
          "bullets": [
            "Four figures have 4, 4, 4, and 3 sides respectively. The shared attribute among three of them is '4 sides'; the figure with 3 sides is the odd one out."
          ]
        },
        {
          "heading": "Matrix (3×3 Grid) Figure Completion",
          "body": "Matrix questions arrange figures in a 3×3 grid where a consistent rule operates across each row and/or column (e.g., rotation increasing by a fixed angle moving left to right, or an element count increasing by one moving top to bottom) — verify the rule against at least two complete rows or columns before predicting the missing figure, since a rule that fits only one row may be coincidental."
        },
        {
          "heading": "Figure Counting (Triangles, Lines)",
          "body": "Counting problems (how many triangles/lines/squares in a figure) require systematically counting the smallest individual units first, then all valid larger combinations formed by joining adjacent smaller units — undercounting combined regions is the most common error.",
          "bullets": [
            "Triangle ABC has a single line drawn from vertex A to a point D on side BC. This creates: triangle ABD, triangle ACD, and the original triangle ABC itself — 3 triangles in total, not just the 2 smaller ones."
          ]
        },
        {
          "heading": "Embedded Figures",
          "body": "Embedded figure questions ask you to find a simple shape (like a specific triangle or quadrilateral) hidden within the outline of a more complex figure — the reliable technique is to trace the simple shape's exact outline mentally and check if all of its edges exist somewhere within the complex figure's lines, ignoring extra lines that aren't part of that specific shape."
        },
        {
          "heading": "Rule-Based Rotation and Reflection Sequences",
          "body": "A sequence of figures rotating or reflecting by a fixed, consistent amount at each step is solved by measuring the exact angle or transformation between the first two figures, then applying that same fixed increment forward to find the next figure in the sequence.",
          "bullets": [
            "A shape rotates 45° clockwise at each step in a sequence. If the sequence shows positions at 0°, 45°, 90°, 135°, the next figure in the sequence must be positioned at 180°."
          ]
        },
        {
          "heading": "Grouping Figures by Shared Attribute",
          "body": "Beyond simple side-counting, classification questions can group by lines of symmetry, whether a figure is open or closed, or whether it's made of straight lines only vs includes a curve — always check MULTIPLE possible shared attributes before settling on one, since the first attribute you notice isn't always the one that correctly isolates the odd figure."
        }
      ],
      "commonPitfalls": [
        "Picking a figure that 'looks similar' at a glance instead of explicitly naming and verifying the exact transformation rule.",
        "In matrix (3×3) questions, confirming a rule against only one row or column instead of checking it holds across at least two.",
        "Undercounting figure-counting problems by missing larger triangles/shapes formed by combining smaller adjacent ones.",
        "In classification questions, fixating on the first shared attribute noticed (like color) when the actual distinguishing rule is a different attribute (like symmetry or side count).",
        "In embedded-figure questions, allowing extra lines in the complex figure to distract from tracing the exact target shape's outline.",
        "Assuming a rotation/reflection sequence's increment from only the first two figures without confirming it holds for a third given figure too."
      ],
      "keyTakeaways": [
        "Always name the exact transformation rule (rotation angle, added element, attribute change) rather than judging by visual similarity alone.",
        "Verify a matrix (3×3 grid) rule against at least two rows or columns before predicting the missing figure.",
        "In figure counting, count the smallest units first, then systematically count all larger combinations formed by adjacent units.",
        "Check multiple candidate shared attributes (sides, symmetry, open/closed, curved/straight) in classification questions before picking the odd one out.",
        "For embedded figures, trace the target shape's exact outline and verify every edge exists within the complex figure.",
        "Confirm a rotation/reflection sequence's fixed increment against more than just the first two figures when a third is given."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Classification",
          "url": "https://www.indiabix.com/non-verbal-reasoning/classification/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Mirror & water images",
      "overview": "Mirror image and water image questions test whether a candidate can correctly apply two distinct, mechanical geometric transformations — a left-right flip (mirror, as in a vertical mirror placed beside an object) and a top-bottom flip (water image, as in a reflection in a pool below an object) — to letters, numbers, clocks, and calendar dates. The two transformations are frequently confused with each other because both are 'reflections,' but they flip along different axes and therefore produce different results on the same input, especially for asymmetric characters and clock times. This sub-module covers the mechanics of each transformation, dedicated formulas for mirror and water images of clock times (a very common question type), how digits and letters behave differently under each flip, symmetry-axis identification, and combined two-step problems.",
      "sections": [
        {
          "heading": "Mirror Image Basics: Left-Right Reversal",
          "body": "A mirror placed vertically beside an object reverses left and right: the order of characters in a word reverses (last character appears first), and each individual character's shape also flips horizontally — characters with a vertical line of symmetry (like A, H, I, M, O, T, U, V, W, X, Y) look unchanged, while others (like B, C, D, E, F, G, J, K, L, N, P, Q, R, S, Z) look visibly different or unrecognizable.",
          "bullets": [
            "Mirror image of 'MATHS': since M, A, T, H are all vertically symmetric letters, and reading order reverses, the mirror image reads as the letters in reverse order (S, H, T, A, M), with S also flipping shape since it isn't vertically symmetric."
          ]
        },
        {
          "heading": "Water Image Basics: Top-Bottom Inversion",
          "body": "A water (or 'reflection in a pool') image flips an object top-to-bottom instead of left-to-right — the left-right ORDER of characters stays the same, but each character's shape flips vertically, so only characters with a horizontal line of symmetry (like B, C, D, E, H, I, K, O, X) look unchanged."
        },
        {
          "heading": "Mirror Image of Clock Times (Formula-Based)",
          "body": "The mirror image of a clock face reflects the entire dial left-right, which is equivalent to subtracting the shown time from 11 hours 60 minutes (i.e., from a base of 11:60).",
          "bullets": [
            "Mirror image of 3:15: 11:60 − 3:15 = 8:45. So a clock reading 3:15 shows 8:45 in its mirror reflection."
          ]
        },
        {
          "heading": "Water Image of Clock Times (Formula-Based)",
          "body": "The water image of a clock face reflects the dial top-to-bottom, equivalent to subtracting the shown time from a base of 6:00 (adding 12 hours first if the result would be negative).",
          "bullets": [
            "Water image of 3:15: 6:00 − 3:15 = 2:45. So a clock reading 3:15 shows 2:45 in its water reflection."
          ]
        },
        {
          "heading": "Mirror and Water Images of Numbers",
          "body": "For digits, only 0, 1, and 8 are symmetric enough to look unchanged under either type of flip; the safest way to reason about multi-digit numbers made purely of these digits is that a mirror image reverses their ORDER (since it's a left-right flip), while a water image keeps their order the same (since it's a top-bottom flip, not left-right).",
          "bullets": [
            "Mirror image of '1801' (all self-symmetric digits): reading order reverses → '1081'. Water image of '108' (all self-symmetric digits): order stays the same since only vertical position flips → '108'."
          ]
        },
        {
          "heading": "Symmetry Axis Identification",
          "body": "Before attempting a mirror or water image question on a letter or figure, identify whether it has a vertical line of symmetry (relevant for mirror images), a horizontal line of symmetry (relevant for water images), or neither — this quickly tells you whether the character will look unchanged, flipped, or entirely different.",
          "bullets": [
            "Letter 'H' has both a vertical and a horizontal line of symmetry, so it looks identical in both its mirror and water image. Letter 'F' has neither, so it looks different (and effectively unrecognizable as a normal letter) in both."
          ]
        },
        {
          "heading": "Combined Mirror + Water Image Problems",
          "body": "Some questions ask for the mirror image of an object's water image (or vice versa) — apply the two transformations strictly in the stated order, treating the output of the first transformation as the input to the second.",
          "bullets": [
            "Find the mirror image of the water image of 4:20. Step 1 (water image): 6:00 − 4:20 = 1:40. Step 2 (mirror image of that result): 11:60 − 1:40 = 10:20. Final answer: 10:20."
          ]
        }
      ],
      "commonPitfalls": [
        "Confusing mirror image (left-right flip, reverses character ORDER) with water image (top-bottom flip, order stays the SAME).",
        "Using the mirror-time formula (11:60 − time) when the question actually asks for a water image, or vice versa.",
        "Assuming all digits/letters look unchanged under a flip, instead of checking each character's specific symmetry axis.",
        "In a combined mirror+water question, applying the two transformations in the wrong order.",
        "Forgetting to add 12 hours when a water-image time subtraction would otherwise produce a negative result.",
        "Assuming a character symmetric about one axis (say, vertical) is automatically also symmetric about the other (horizontal) axis."
      ],
      "keyTakeaways": [
        "Mirror image = left-right flip: character order reverses, and each character's shape flips horizontally.",
        "Water image = top-bottom flip: character order stays the same, and each character's shape flips vertically.",
        "Mirror image of a clock time = 11:60 − given time. Water image of a clock time = 6:00 − given time (add 12h if negative).",
        "Only digits 0, 1, 8 and select letters (A, H, I, M, O, T, U, V, W, X, Y for vertical symmetry) look unchanged under a flip.",
        "For combined mirror+water problems, apply the transformations strictly in the order stated, using the first result as the next input.",
        "Always check a character's specific symmetry axis (vertical for mirror, horizontal for water) rather than assuming both."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Mirror Images",
          "url": "https://www.indiabix.com/non-verbal-reasoning/mirror-images/"
        },
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Water Images",
          "url": "https://www.indiabix.com/non-verbal-reasoning/water-images/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Cubes & dice",
      "overview": "Cube and dice questions test 3D spatial visualization — deducing hidden opposite faces from multiple dice views, solving cube-painting and cube-cutting problems, folding a flat net into a 3D cube, counting cubes in a stacked arrangement, and reasoning about dice rotation and mirror-identical dice. Unlike other non-verbal topics, these questions reward a small set of exact, checkable rules (the standard-die sum-of-7 rule, the common-face deduction method for non-standard dice, and the systematic corner/edge/face/internal counting formulas for cube-cutting) far more than raw spatial intuition, so memorizing and practicing the rules directly outperforms trying to visualize everything from scratch each time. This sub-module works through each rule with a complete, verified numerical example, including the classic painted-cube cutting problem worked to an exact count.",
      "sections": [
        {
          "heading": "Standard Dice: The Sum-of-7 Opposite-Face Rule",
          "body": "On a STANDARD die (the kind used in board games), opposite faces always sum to 7: 1 is opposite 6, 2 is opposite 5, and 3 is opposite 4. This rule applies ONLY to standard dice — non-standard dice (with letters, symbols, or a different number arrangement) must be solved using the deduction method below instead."
        },
        {
          "heading": "Non-Standard Dice: The Common-Face Deduction Method",
          "body": "For dice with arbitrary symbols/numbers (not guaranteed to follow sum-of-7), deduce opposite faces from multiple throws using this rule: if two different throws of the same die share exactly two visible faces in common, then the two NON-common (differing) faces from those throws must be opposite each other.",
          "bullets": [
            "Three throws of a die show: Throw 1: faces 1, 2, 3. Throw 2: faces 1, 3, 4. Throw 3: faces 1, 4, 5. Comparing Throw 1 & 2 (common faces 1, 3): the non-common faces 2 and 4 are opposite. Comparing Throw 2 & 3 (common faces 1, 4): the non-common faces 3 and 5 are opposite. That leaves faces 1 and 6 (the only face never shown) as the remaining opposite pair."
          ]
        },
        {
          "heading": "Cube Painting and Cutting Problems",
          "body": "A classic problem: a cube is painted on all 6 outer faces, then cut into n³ smaller identical cubes. Corner cubes (3 faces painted) = always 8 (the 8 corners of any cube). Edge cubes (2 faces painted) = 12 × (n−2) (12 edges, each with (n−2) non-corner small cubes along it). Face-center cubes (1 face painted) = 6 × (n−2)² (6 faces). Fully internal cubes (0 faces painted) = (n−2)³.",
          "bullets": [
            "A cube is painted on all faces and cut into 64 smaller cubes (so n=4, since 4³=64). 3-face-painted (corners) = 8. 2-face-painted (edges) = 12×(4−2) = 24. 1-face-painted (face centers) = 6×(4−2)² = 6×4 = 24. 0-face-painted (internal) = (4−2)³ = 8. Check: 8+24+24+8 = 64. ✓"
          ]
        },
        {
          "heading": "Folding a Net Into a Cube",
          "body": "For a net drawn as a straight strip of 4 connected squares (which folds into the 4 side faces of a cube, forming a loop), the 1st and 3rd squares in the strip become opposite faces, and the 2nd and 4th squares become opposite faces — because folding a 4-square strip into a closed loop wraps the 1st and 3rd (and 2nd and 4th) around to face away from each other."
        },
        {
          "heading": "Counting Cubes in a 3D Stacked Arrangement",
          "body": "For a solid n×n×n arrangement of unit cubes with the entire outer surface painted, the same corner/edge/face/internal formulas from the cube-cutting problem apply directly, since a painted stack and a painted-then-cut cube are geometrically identical setups.",
          "bullets": [
            "A 3×3×3 stack of 27 unit cubes has its entire outer surface painted. Corners (3 faces) = 8. Edges (2 faces) = 12×(3−2) = 12. Face centers (1 face) = 6×(3−2)² = 6. Internal (0 faces) = (3−2)³ = 1. Check: 8+12+6+1 = 27. ✓"
          ]
        },
        {
          "heading": "Dice Rotation Tracking",
          "body": "When a die rolls (tips over one of its edges) in a stated direction, track each face's new position systematically: rolling FORWARD over the front-bottom edge moves top→front, front→bottom, bottom→back, back→top (the left and right faces stay unchanged).",
          "bullets": [
            "A standard die shows 1 on top and 2 on the front (so, by the sum-of-7 rule, the bottom is 6 and the back is 5). After rolling forward once: new top = old back = 5; new front = old top = 1. The die now shows 5 on top and 1 on the front."
          ]
        },
        {
          "heading": "Identical vs Mirror-Image (Different) Dice",
          "body": "Two dice images showing the same three numbers around one corner represent the SAME die only if those three numbers appear in the same rotational (clockwise or anticlockwise) order in both images; if the order is reversed between the two images, they are mirror images of each other and represent genuinely DIFFERENT dice — a frequently tested trap in 'which of these dice is the same as the given one' questions."
        }
      ],
      "commonPitfalls": [
        "Applying the sum-of-7 shortcut to a non-standard die (with letters, symbols, or unusual numbering) where it does not apply.",
        "In the common-face deduction method, comparing throws that share fewer or more than exactly two common faces, making the deduction invalid.",
        "In cube-cutting problems, forgetting the (n−2) adjustment for edge and face-center cube counts, or using n instead of (n−2) for internal cubes.",
        "Misapplying the net-folding rule to a net shape that isn't a simple 4-square strip (more complex nets need step-by-step mental folding instead).",
        "Tracking dice rotation by only updating the top and front faces and forgetting that the bottom and back faces also move.",
        "Assuming two dice images with the same three visible numbers are identical without checking whether the rotational (clockwise/anticlockwise) order actually matches."
      ],
      "keyTakeaways": [
        "Standard dice: opposite faces sum to 7 (1-6, 2-5, 3-4) — this rule applies ONLY to standard numbered dice.",
        "For non-standard dice, use the common-face method: if two throws share exactly two faces, their non-common faces are opposite.",
        "Cube-cutting formulas (for an n×n×n cut): corners=8, edges=12(n−2), face-centers=6(n−2)², internal=(n−2)³.",
        "A 4-square net strip folds so that the 1st/3rd squares become opposite faces, and the 2nd/4th squares become opposite faces.",
        "Rolling a die forward cycles top→front→bottom→back→top; rolling sideways cycles the corresponding side faces instead.",
        "Two dice showing the same numbers are identical only if those numbers share the same rotational order — a reversed order means mirror-image (different) dice."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Cubes and Dice",
          "url": "https://www.indiabix.com/non-verbal-reasoning/cubes-and-dice/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Paper Folding & Cutting",
      "overview": "Paper folding and cutting questions test spatial visualization of what happens when a hole is punched or a shape is cut into a sheet of paper that has been folded one or more times, and the sheet is then unfolded flat again. Every question in this family reduces to one idea: each fold line acts as a mirror, and any hole or cut made through the folded layers is reflected across every fold line it crosses when the paper is opened back out. The number of times a mark is duplicated depends on how many layers of paper the punch or cut passed through, which in turn depends on how many folds separate that point from the sheet's original single-layer form. This sub-module builds the fold-as-mirror method from a single fold up through double (quarter) folds and diagonal folds, covers the special case of a hole placed exactly on a crease, extends the same logic to cuts rather than punched holes, and shows how to count the resulting number of holes without redrawing the whole sheet.",
      "sections": [
        {
          "heading": "The Core Principle: Every Fold Is a Mirror Line",
          "body": "Treat each fold as a mirror placed along the crease: whatever is punched or cut through the folded stack gets reflected across that crease when the paper reopens. If a sheet is folded once and a hole is punched anywhere except exactly on the fold, the hole exists in 2 layers of paper, so unfolding produces 2 holes that are mirror images of each other across the fold line — same distance from the crease, on opposite sides.",
          "bullets": [
            "A rectangular sheet is folded in half along its vertical midline (left edge onto right edge). A hole is punched 3 cm from the folded edge (the crease), 2 cm down from the top. Unfolding gives 2 holes, both 2 cm from the top, one 3 cm to the left of the original center line and one 3 cm to the right — a mirror pair across the vertical midline."
          ]
        },
        {
          "heading": "Double (Quarter) Folds and the Four-Copy Rule",
          "body": "Folding a sheet twice — once vertically, once horizontally — produces 4 layers, so a single hole punched through all 4 layers at a point away from both creases reflects across both fold lines and appears 4 times when fully unfolded, positioned symmetrically in all four quadrants of the original sheet.",
          "bullets": [
            "A square sheet is folded in half top-to-bottom, then in half again left-to-right, leaving a small square packet with the original center at one corner. A hole is punched at the OUTER corner of this packet (the corner diagonally farthest from the original center). Unfolding reveals 4 holes, one near each of the original square's 4 corners, symmetric about both the vertical and horizontal midlines."
          ]
        },
        {
          "heading": "The Special Case: A Hole Placed Exactly on a Fold Line",
          "body": "If a hole lands exactly ON a crease rather than away from it, that crease can't duplicate it (there's nothing on the other side of that particular fold to reflect it into, since the hole already straddles the line) — so a hole on one fold line, in a double-fold packet, produces only 2 copies instead of 4.",
          "bullets": [
            "Same double-fold packet as above (folded top-to-bottom, then left-to-right). This time the hole is punched exactly on the crease that was the vertical fold, but away from the horizontal crease. Unfolding gives only 2 holes (not 4), both lying exactly on the original sheet's vertical midline, mirrored top-to-bottom across the horizontal fold."
          ]
        },
        {
          "heading": "Cutting a Notch from a Folded Edge",
          "body": "Cutting (rather than punching) a small triangular or semicircular notch out of the folded edge itself removes material from both layers at once along that edge — when unfolded, the two mirrored notch-halves join into a single complete symmetric shape straddling the original fold line, rather than two separate holes.",
          "bullets": [
            "A square sheet is folded in half (left onto right). A small triangular notch is cut out of the middle of the folded (creased) edge, with the triangle's flat side lying along the crease. Unfolding shows one complete diamond (rhombus)-shaped hole centered exactly on the sheet's original vertical midline — the two mirrored half-triangles have joined into one whole shape."
          ]
        },
        {
          "heading": "Multiple Holes in One Folded Packet",
          "body": "When more than one hole is punched into the same folded packet, apply the mirroring rule to each hole independently and then combine the results — every hole away from all creases multiplies by 2 for each fold it survives, and the total hole count is the sum of each hole's individual multiplication.",
          "bullets": [
            "A sheet folded twice (4 layers) has TWO holes punched at different points, both away from every crease. Each hole individually produces 4 copies on unfolding (per the four-copy rule), so the total is 4 + 4 = 8 holes scattered across the sheet in two sets of 4 mirror-symmetric points."
          ]
        },
        {
          "heading": "Diagonal Folds",
          "body": "When a square is folded along its diagonal (corner to corner) instead of along the midline, the crease itself is the diagonal line, and the same mirroring principle applies — but the reflection axis is now that diagonal rather than a horizontal or vertical line, so a hole's mirrored position must be measured perpendicular to the diagonal, not perpendicular to an edge.",
          "bullets": [
            "A square sheet is folded once along its main diagonal (bringing one corner onto the opposite corner) to form a triangle. A hole is punched close to the folded (hypotenuse) edge but off it. Unfolding gives 2 holes, symmetric about the diagonal line — both equally close to the diagonal but on opposite sides of it, not opposite sides of a horizontal or vertical line."
          ]
        },
        {
          "heading": "Unfolding in Reverse Order",
          "body": "When a sheet has been folded in a specific sequence (fold 1, then fold 2, then fold 3), mentally unfold it in the exact REVERSE order (undo fold 3 first, then fold 2, then fold 1) — reflecting across the most recent crease first, since that crease is the outermost layer of the folded packet and must be opened before the earlier creases become accessible.",
          "bullets": [
            "A rectangle is folded left-to-right (fold 1), then the resulting shape is folded top-to-bottom (fold 2), and a hole is punched. To find the unfolded pattern, first undo fold 2 (reflect the hole top-to-bottom to get 2 holes), THEN undo fold 1 (reflect both of those left-to-right to get 4 holes total) — undoing in the wrong order would place the intermediate reflection relative to the wrong edge."
          ]
        }
      ],
      "commonPitfalls": [
        "Forgetting that a hole placed exactly ON a fold line produces half as many copies as a hole placed away from every crease.",
        "Applying the four-copy rule to every hole regardless of position, without checking whether the hole actually lies on one of the two fold lines.",
        "Treating a cut made across a folded edge as if it produces two separate holes instead of one joined symmetric shape.",
        "Mirroring a hole's position perpendicular to a sheet edge when the actual fold was diagonal, ignoring that the true mirror axis is the diagonal crease.",
        "Unfolding the creases in the same order they were folded instead of the reverse order.",
        "Losing track of which corner or edge of the small folded packet corresponds to which corner or edge of the original full sheet.",
        "Assuming the number of holes always equals 2× the number of folds, rather than 2^(number of folds) for a hole away from every crease."
      ],
      "keyTakeaways": [
        "Every fold is a mirror line: a hole or cut away from all creases doubles for each fold it passes through, giving 2^(number of folds) copies.",
        "A hole placed exactly on one fold line is only reflected by the OTHER folds, so it produces half as many copies as usual.",
        "A cut made across a folded edge joins into one complete symmetric shape when unfolded, not separate mirrored holes.",
        "Diagonal folds mirror perpendicular to the diagonal crease, not perpendicular to a horizontal or vertical edge.",
        "Always unfold mentally in reverse order — undo the last fold made first, then work backward to the first fold.",
        "Sketch or label each crease as you go so you don't lose track of which small-packet corner maps to which original-sheet corner."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Paper Folding",
          "url": "https://www.indiabix.com/non-verbal-reasoning/paper-folding/"
        },
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Paper Cutting",
          "url": "https://www.indiabix.com/non-verbal-reasoning/paper-cutting/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Embedded Figures",
      "overview": "Embedded (or 'hidden') figure questions show a simple target shape — often a specific triangle, quadrilateral, or a combination like a triangle overlapping a rectangle — and ask which of several larger, more cluttered figures contains that exact shape hidden within its lines. The complex figures are deliberately drawn with extra crossing lines, extra shapes, and near-miss outlines so that a shape which looks 'close enough' at a glance often differs in one key detail — an extra line, a missing vertex, a slightly different angle. The reliable method is to reduce the target shape to its defining, checkable features (number of sides, whether any side is noticeably longer/shorter than the others, whether an angle is roughly a right angle or acute) and then trace that specific combination through the complex figure's lines only, ignoring every line that isn't needed. This sub-module builds that feature-checklist method with fully worked examples.",
      "sections": [
        {
          "heading": "Reducing the Target Shape to a Checklist",
          "body": "Before scanning any complex figure, describe the target shape in words as a short checklist: number of sides, any side that is clearly the longest or shortest, whether it contains a right angle, and its rough overall proportion (tall and narrow, wide and flat, roughly equal-sided). This checklist becomes the test applied to every candidate figure.",
          "bullets": [
            "Target shape: a right-angled triangle where one leg is roughly twice the length of the other. Checklist: 3 sides; exactly one right angle; the two legs forming that right angle are unequal, with one about double the other; the hypotenuse is the longest side. Any embedded triangle failing even one item (e.g., an equilateral triangle, or a right triangle with equal legs) is rejected immediately."
          ]
        },
        {
          "heading": "Tracing Technique: Follow Only the Needed Lines",
          "body": "Within a complex figure, place a finger (or mentally trace) starting at one plausible vertex of the target shape and follow only the lines that would form its outline, actively ignoring every other line that crosses through — extra lines in embedded-figure puzzles exist purely to distract and are never part of the hidden shape unless they coincide with it.",
          "bullets": [
            "A complex figure is a large triangle divided by two internal lines crossing near its center, creating a small quadrilateral in the middle. To check if that central quadrilateral matches a target 'square-ish' shape, trace only its 4 bounding segments — the two internal crossing lines plus two segments of the outer triangle's sides — while ignoring the rest of the outer triangle's outline."
          ]
        },
        {
          "heading": "Vertex Counting as a Fast Filter",
          "body": "Before fully tracing a candidate, do a fast count: identify how many distinct line intersections (vertices) would be needed to close the target shape, and check whether that many suitably-placed intersection points even exist near each other in the complex figure — if not, that entire region can be eliminated without a detailed trace.",
          "bullets": [
            "Target shape needs 4 vertices forming a quadrilateral. A candidate complex figure has a region where only 3 lines intersect near each other (giving at most 3 usable vertices in that area) — that region is eliminated instantly without needing to check angles or side lengths."
          ]
        },
        {
          "heading": "Watching for Near-Miss Distractors",
          "body": "The most common wrong-answer trap is a shape in the complex figure that matches the target in side COUNT but not in proportions or angle — e.g., a triangle with the right number of sides but drawn noticeably more equilateral, or a quadrilateral that is a parallelogram when the target was specifically a shape with one right angle.",
          "bullets": [
            "Target: a quadrilateral with exactly one right angle (like an L-corner shape) and two unequal pairs of sides. A complex figure contains a 4-sided region that LOOKS similar but has two pairs of parallel sides (a parallelogram, no right angle) — despite having 4 sides like the target, it fails the 'right angle' checklist item and must be rejected."
          ]
        },
        {
          "heading": "Embedded Figures Formed by Overlap",
          "body": "Some target shapes are formed not from a single traced outline but from the overlapping region of two figures (e.g., the shape common to both an oval and a rectangle drawn over each other) — for these, identify the target's outline as the boundary where both original shapes' edges alternate, then search the complex figure for that same alternating boundary pattern.",
          "bullets": [
            "Target: the lens-shaped overlap of two circles. Look for a complex figure containing two curved arcs (each a piece of a different circle) meeting at two points to enclose a lens shape — a complex figure with only straight lines cannot contain this target regardless of how similar it looks, since curved boundaries are a non-negotiable feature."
          ]
        },
        {
          "heading": "Rotated or Mirrored Embedded Figures",
          "body": "The target shape may be embedded in the complex figure at a different rotation or as a mirror image, not necessarily in its originally shown orientation — before rejecting a candidate region, mentally rotate or flip your checklist's expectations (a right angle stays a right angle under rotation; side-length ratios stay the same under rotation and reflection) rather than only searching for the shape in its exact original orientation.",
          "bullets": [
            "Target: a right triangle with the right angle at the bottom-left, legs pointing up and right. A complex figure contains a same-sized, same-proportioned right triangle but rotated 90° so the right angle is at the top-left. Since side-length ratios and the right angle are rotation-invariant, this IS a valid match — rejecting it for 'facing the wrong way' would be an error."
          ]
        },
        {
          "heading": "Worked Full Example: Finding a Star Inside a Web of Lines",
          "body": "Given a target 5-pointed star outline and a complex figure made of several overlapping triangles creating a web of crossing lines, trace only the 10 line segments needed to form a 5-pointed star's outline (5 outer points, 5 inner concave vertices), verifying that each of the 10 required segments exists as an unbroken line in the complex figure — if even one segment is missing or interrupted by a gap, that candidate fails.",
          "bullets": [
            "A complex figure shows 3 overlapping triangles arranged so their edges cross and form a small 5-pointed star shape at the center, exactly where all 3 triangles overlap. Tracing the star's 10-segment outline confirms every segment is a genuine unbroken line from one of the 3 triangles — this candidate is a valid embedded figure. A second candidate figure has the same star outline but one of its 5 outer points is formed by a gap (a dotted, not solid, line) — this candidate is rejected."
          ]
        }
      ],
      "commonPitfalls": [
        "Accepting a shape that matches the target's side count but not its proportions or angles (a near-miss distractor).",
        "Getting distracted by extra lines in the complex figure that aren't part of the traced target outline.",
        "Rejecting a valid match only because it appears rotated or mirrored relative to the target's shown orientation.",
        "Skipping the checklist step and judging matches purely by overall visual impression.",
        "Missing a target shape formed by the overlap/boundary of two different figures rather than a single traced outline.",
        "Not verifying that every required segment is a continuous, unbroken line — accepting a shape with a gap or dotted segment.",
        "Spending equal time on every candidate instead of using the fast vertex-count filter to eliminate obviously wrong regions first."
      ],
      "keyTakeaways": [
        "Reduce the target shape to a short checklist (side count, longest/shortest side, right angle or not) before scanning any candidate.",
        "Trace only the lines needed for the target outline; ignore every other line in the complex figure.",
        "Use a quick vertex/intersection count to eliminate regions that can't possibly form the target before doing a detailed trace.",
        "A valid match may be rotated or mirrored from the target's shown orientation — angle and side-ratio checks still apply.",
        "Reject near-miss shapes that match side count but fail on angle type or side-length ratio.",
        "For overlap-based targets, look for the correct alternating-boundary pattern, including curved edges if the target has them."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Spotting Embedded Figures",
          "url": "https://www.indiabix.com/non-verbal-reasoning/spotting-embedded-figures/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Figure Classification",
      "overview": "Figure classification (odd-figure-out) questions present a set of 4-5 figures where a clear majority share one specific, nameable property, and ask you to identify the single figure that breaks it. This sub-module goes deeper than the brief classification coverage in 'Pattern recognition' by working through the full range of properties non-verbal classification tests actually use — side count, symmetry, open vs. closed, rotation relationships within the set, shading/fill pattern, element count, and compound (two-property) rules — each with a fully worked set of figures and the exact reasoning that isolates the odd one.",
      "sections": [
        {
          "heading": "Single-Property Classification: Side Count",
          "body": "The simplest classification rule groups figures purely by number of sides or number of line segments — scan all figures, tally each one's side count, and the figure with a side count that appears only once (while the others share a common count) is the odd one out.",
          "bullets": [
            "Five figures have side counts 5, 5, 6, 5, 5 (a pentagon, pentagon, hexagon, pentagon, pentagon). Four are pentagons (5 sides); the hexagon (6 sides) is the odd one out."
          ]
        },
        {
          "heading": "Symmetry-Based Classification",
          "body": "When all figures have the same side count, check the number of lines of symmetry each one has — figures can look structurally similar (same number of sides) yet differ in symmetry because their sides/angles aren't arranged evenly, so this property catches distractors that survive a pure side-count check.",
          "bullets": [
            "Four quadrilaterals all have 4 sides. Three are squares (4 lines of symmetry each); one is a generic (irregular) quadrilateral with no lines of symmetry at all despite also having 4 sides. The irregular quadrilateral is the odd one out, even though the side-count check alone wouldn't have caught it."
          ]
        },
        {
          "heading": "Open vs. Closed Figures",
          "body": "Some sets mix figures that form a fully closed boundary (every line connects back to form an enclosed region) with one figure that has a gap — a break in the outline where two ends don't meet — making it an open figure; this is checked by mentally tracing the full outline and confirming it returns to its starting point.",
          "bullets": [
            "Four star-like figures are shown. Three have their outlines fully closed (tracing the outline returns to the start). One has a small gap between two of its points where the lines don't quite meet, leaving it open. That open figure is the odd one out."
          ]
        },
        {
          "heading": "Shading and Fill Pattern",
          "body": "When shape and side count are identical across all figures, check the fill: is the figure fully shaded (solid black), unshaded (outline only), or partially shaded (e.g., only one section filled) — and if partial, whether the shaded portion is in a consistent relative position (like always the top half) across the majority.",
          "bullets": [
            "Four identical circles are divided into 4 equal quadrants. In three circles, the top-left quadrant is shaded. In the fourth, the top-right quadrant is shaded instead. All four have identical shape and an identical AMOUNT of shading (one quadrant), so only the POSITION of the shaded region reveals the odd one out."
          ]
        },
        {
          "heading": "Rotation Relationships Within the Set",
          "body": "In some sets, every figure is actually the SAME base figure rotated by different amounts — these aren't odd-shape questions but odd-rotation questions, where four figures are related to each other by clean rotation angles (like 0°, 90°, 180°, 270°) and the odd one is at an angle that breaks that clean set, or is a mirror image rather than a rotation.",
          "bullets": [
            "Four arrow-shaped figures point up, right, down, and left respectively (rotations of 0°, 90°, 180°, 270° of the same arrow). A fifth figure looks like it points left too, but on close inspection it's the mirror image of the 'left' arrow (its internal notch is on the wrong side) rather than a true 90°-step rotation. That mirrored figure is the odd one out."
          ]
        },
        {
          "heading": "Element Count Classification",
          "body": "Figures built from repeated small elements (dots, small circles, short lines within a larger boundary) are classified by counting those elements — the outer shape may be identical across all figures, with only the internal element count differing for the odd one.",
          "bullets": [
            "Four identical pentagons each contain small dots inside them: 3, 3, 3, and 4 dots respectively. All four pentagons look identical from the outside; only the dot count reveals that the 4-dot pentagon is the odd one out."
          ]
        },
        {
          "heading": "Compound (Two-Property) Rules",
          "body": "The hardest classification sets require TWO properties to hold simultaneously for a figure to belong to the majority group (e.g., 'has 4 sides AND is fully shaded') — check each property independently across all figures first, since a figure can fail on just one of the two properties and still be the unique odd one out.",
          "bullets": [
            "Four figures: three are shaded triangles, one is an UNSHADED triangle, and separately one of the shaded ones is actually a shaded quadrilateral. Testing 'triangle' alone: only the quadrilateral fails, since all others (including the unshaded one) are triangles — the unshaded triangle merely fails the separate 'shaded' property. Since three figures share BOTH properties (triangle AND shaded) and each of the other two fails a different single property, the figure failing the more fundamental shape property — the shaded quadrilateral — is the intended odd one out."
          ]
        },
        {
          "heading": "Verifying the Rule Against the Full Majority",
          "body": "After spotting a candidate rule from 2-3 figures, always check it against every remaining figure in the set before finalizing an answer — a rule that happens to fit 3 out of 5 figures by coincidence is not reliable; a genuine classification rule should cleanly fit 4 out of 5 (or however many are in the set minus one).",
          "bullets": [
            "A candidate rule 'all figures have exactly one curved side' fits figures 1, 2, and 3. Checking figure 4 shows it also has one curved side (rule holds, 4/5 fit). Figure 5 has zero curved sides (all straight) — confirmed as the odd one out, since the rule now cleanly covers a full majority of 4, not just 3."
          ]
        }
      ],
      "commonPitfalls": [
        "Stopping at the first shared property noticed (like side count) without checking whether it's the property that actually isolates a unique odd figure.",
        "Confusing 'same side count, different symmetry' figures as identical because they look superficially similar.",
        "Missing a small gap that makes a figure open rather than closed, especially in cluttered or star-shaped figures.",
        "In shading questions, comparing only the AMOUNT shaded and missing that the POSITION of the shaded region is the actual distinguishing property.",
        "Treating a mirror-image figure as a valid rotation of the base figure in rotation-relationship sets.",
        "In compound-rule sets, finalizing an answer after checking only one of the two required properties.",
        "Accepting a candidate rule that fits only a bare 3-out-of-5 figures instead of verifying it cleanly covers a full 4-out-of-5 majority."
      ],
      "keyTakeaways": [
        "Check properties in a deliberate order — side count, then symmetry, then open/closed, then shading, then element count — rather than settling on the first one noticed.",
        "A rule is only valid once verified against every figure in the set, not just the first two or three.",
        "Watch for figures that are mirror images rather than true rotations when a set is built from one rotated base figure.",
        "In shading-based sets, compare both the AMOUNT and the POSITION of shaded regions.",
        "Compound rules require checking two properties independently — a figure can be the odd one out by failing just one of them.",
        "A genuine classification rule should cleanly fit a full majority (all but one figure), not just a coincidental few."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Classification",
          "url": "https://www.indiabix.com/non-verbal-reasoning/classification/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Figure Matrix",
      "overview": "Figure matrix questions arrange figures in a 2×2 or 3×3 grid governed by a consistent transformation rule and ask for the single missing figure. This sub-module goes beyond the brief matrix coverage in 'Pattern recognition' to build a complete method: distinguishing row-wise rules from column-wise rules, handling grids where both apply simultaneously, spotting whole-grid (Sudoku-like) constraints, tracking combined transformations (rotation plus element changes together), and using answer-choice elimination as a final check. Each concept is demonstrated with a fully worked grid solved to an exact missing figure.",
      "sections": [
        {
          "heading": "The 2×2 Matrix: Simplest Case",
          "body": "A 2×2 matrix shows 3 figures filling 3 of the 4 cells, with the 4th (usually bottom-right) missing — the rule usually links the two figures in the top row to each other by one transformation, and the same transformation (or a related one) must connect the bottom row, so first identify the top-row transformation and then apply it to the bottom-left figure to derive the answer.",
          "bullets": [
            "Top-left is a small circle, top-right is a large circle (the transformation: circle grows larger). Bottom-left is a small square. Applying the same 'grows larger' transformation, the missing bottom-right cell must be a large square."
          ]
        },
        {
          "heading": "3×3 Matrix: Row-Wise Rules",
          "body": "In a 3×3 matrix governed by a row rule, each of the 3 rows independently follows the same transformation pattern moving left to right (such as 'number of sides increases by one moving right'), and this pattern must be confirmed using the two complete rows before being applied to find the missing figure in the incomplete third row.",
          "bullets": [
            "Row 1: triangle (3 sides), square (4 sides), pentagon (5 sides). Row 2: square (4 sides), pentagon (5 sides), hexagon (6 sides). Both rows confirm 'sides increase by 1 moving right.' Row 3 begins with a pentagon (5 sides) and a hexagon (6 sides); the missing third cell must be a 7-sided heptagon."
          ]
        },
        {
          "heading": "3×3 Matrix: Column-Wise Rules",
          "body": "Some matrices instead follow a rule down each COLUMN rather than across each row (e.g., 'shading increases by one section moving downward') — always test both row-wise and column-wise before deciding which axis the rule follows, since applying a column rule's logic across rows (or vice versa) gives a wrong answer even if a pattern superficially seems to fit.",
          "bullets": [
            "Column 1 (top to bottom): unshaded circle, half-shaded circle, fully-shaded circle. Column 2: unshaded square, half-shaded square, fully-shaded square. This confirms a column rule: 'shading increases moving down,' independent of row position. Column 3 shows an unshaded triangle and a half-shaded triangle; the missing bottom cell must be a fully-shaded triangle."
          ]
        },
        {
          "heading": "Matrices With Both Row AND Column Rules",
          "body": "The most demanding matrices apply one rule across rows and a DIFFERENT, independent rule down columns simultaneously — the missing figure must satisfy both rules at once, so solve for what the row rule predicts and what the column rule predicts separately, then confirm they agree on the same final figure.",
          "bullets": [
            "Row rule: shape rotates 90° clockwise moving right. Column rule: one small dot is added inside the shape moving down. The missing bottom-right cell must show the bottom-left cell's shape rotated 90° clockwise (row prediction) with one more dot than the middle-right cell (column prediction) — both predictions must describe the same single figure for the answer to be valid."
          ]
        },
        {
          "heading": "Diagonal and Whole-Grid Rules",
          "body": "Occasionally the rule isn't row- or column-based at all, but instead governs the entire grid as a set — for instance, each of the 3 distinct shapes and each of the 3 distinct shading patterns must appear exactly once in every row and every column (a Sudoku-like constraint) — for these, use elimination: list which shape/shading types are already used in the missing cell's row and column, and the missing figure must be the one type not yet present in either.",
          "bullets": [
            "A 3×3 grid uses exactly 3 shapes (circle, square, triangle) and 3 shadings (none, half, full), with each combination appearing once per row and column overall. The missing cell's row already contains a circle and a square (so it must be a triangle), and its column already contains 'none' and 'full' shading (so it must be 'half' shaded). The answer: a half-shaded triangle."
          ]
        },
        {
          "heading": "Combined Transformations: Rotation Plus Addition",
          "body": "Higher-difficulty matrices combine two transformation types acting on the SAME figure moving in one direction — most often a rotation angle changing together with an element being added or removed — track each transformation as a separate, independent tally (angle in one column, element count in another) rather than trying to see both at once.",
          "bullets": [
            "Moving left to right in a row: cell 1 is an arrow pointing up with 1 dot beside it; cell 2 is the same arrow rotated 90° clockwise (now pointing right) with 2 dots; cell 3 continues both patterns — rotated a further 90° clockwise (now pointing down) with 3 dots. The missing figure in the next row, following the identical dual pattern, must show the correct cumulative rotation AND the correct cumulative dot count for its position."
          ]
        },
        {
          "heading": "Using Answer-Choice Elimination",
          "body": "Once the rule is identified but the exact appearance of the missing figure feels uncertain, use the answer options as a checklist — eliminate any option that violates even one confirmed property of the rule (wrong side count, wrong shading amount, wrong rotation angle), since exam distractor options are deliberately built to satisfy some but not all of the confirmed properties.",
          "bullets": [
            "The confirmed rule requires the missing figure to have 5 sides, be half-shaded, and be rotated 45° from the cell above it. Option A has 5 sides and correct rotation but is fully shaded — eliminated. Option B has 5 sides and half-shading but 0° rotation — eliminated. Option C matches all three confirmed properties — selected."
          ]
        },
        {
          "heading": "Worked Full Example: Solving a 3×3 Matrix End to End",
          "body": "Combine the full method on one grid: scan rows first, scan columns second, check for a whole-grid constraint third, and only after confirming which rule(s) actually hold, derive and verify the missing figure against those rules.",
          "bullets": [
            "Row 1: 1 triangle, 2 triangles, 3 triangles (count increases by 1 moving right — confirmed row rule). Row 2: 1 square, 2 squares, 3 squares (same count rule, different shape). Row 3: 1 pentagon, 2 pentagons, and a missing third cell. Applying the confirmed row rule (count increases by 1, same shape as the rest of the row) gives the answer: 3 pentagons."
          ]
        }
      ],
      "commonPitfalls": [
        "Assuming every matrix is row-based without also testing whether the actual rule runs column-wise instead.",
        "Confirming a row or column rule using only ONE complete row/column instead of at least two before predicting the missing figure.",
        "In grids with both a row rule and a column rule, satisfying only one of the two rules and ignoring the other.",
        "Missing a whole-grid Sudoku-style constraint and instead forcing a simpler row or column rule that doesn't actually fit.",
        "In combined-transformation matrices, tracking rotation and element-count changes together instead of as two separate, independent tallies.",
        "Picking an answer option that satisfies most but not all of the confirmed rule's properties.",
        "Not re-verifying the derived answer against BOTH its row and its column before finalizing, in matrices where both apply."
      ],
      "keyTakeaways": [
        "Test both row-wise and column-wise rules before assuming which axis the pattern runs along.",
        "Confirm any candidate rule against at least two full rows or columns before applying it to the missing cell.",
        "Some matrices require BOTH a row rule and a column rule to hold simultaneously for the missing figure.",
        "Watch for whole-grid Sudoku-style constraints where each shape/shading type must appear exactly once per row and column.",
        "Track combined transformations (rotation + element count) as separate tallies, not as one blended impression.",
        "Use answer options as an elimination checklist — reject any option that fails even one confirmed rule property."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Figure Matrix",
          "url": "https://www.indiabix.com/non-verbal-reasoning/figure-matrix/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Counting Figures (Triangles & Squares)",
      "overview": "Counting-figures questions ask exactly how many triangles, squares, or rectangles exist within a given composite figure, and are deceptively hard because the smallest visible pieces are never the full answer — larger figures formed by combining adjacent smaller pieces must also be counted. This sub-module builds a fully systematic method (smallest units first, then every valid combination), applies it to the classic cevian-triangle problem, the six-pointed star, n×n square-counting grids, tilted (diamond) squares formed by midpoint lines, and composite figures that mix triangles and rectangles together — each worked to an exact, verified final count.",
      "sections": [
        {
          "heading": "The Systematic Method: Count Smallest Units, Then All Combinations",
          "body": "For any counting-figures question, first identify and count the smallest, indivisible regions in the figure (the pieces that can't be split further by any drawn line), then systematically count every larger figure formed by combining 2, 3, or more of those adjacent smallest regions — the total count is the sum of the smallest-unit count plus every valid combination count, never just the smallest units alone.",
          "bullets": [
            "A rectangle is divided by one vertical line into 2 equal smaller rectangles. Smallest units: 2. Combinations: the 2 smaller rectangles combined recreate the original whole rectangle: 1 more. Total rectangles in the figure = 2 + 1 = 3, not just 2."
          ]
        },
        {
          "heading": "Counting Triangles Formed by Multiple Lines from One Vertex",
          "body": "When several lines are drawn from a single vertex of a triangle to different points along the opposite side, the smallest triangles are the ones between consecutive lines, and every combination of adjacent smallest triangles (2 together, 3 together, and so on up to all of them) forms another valid, larger triangle sharing that same apex.",
          "bullets": [
            "Triangle ABC has two lines drawn from vertex A to points D and E on side BC, with points in order B, D, E, C. Smallest triangles: ABD, ADE, AEC (3 triangles). Pairs of adjacent smallest triangles: ABD+ADE = ABE, and ADE+AEC = ADC (2 more triangles). All three combined: ABC itself (1 more). Total = 3 + 2 + 1 = 6 triangles."
          ]
        },
        {
          "heading": "Counting Triangles in a Six-Pointed Star",
          "body": "A six-pointed star (formed by two overlapping equilateral triangles, one pointing up and one pointing down) contains two categories of triangles: the 6 small point triangles at each of the star's outer tips, and the 2 large triangles whose overlap actually forms the star shape — giving a standard total of 8 triangles for the basic figure.",
          "bullets": [
            "The 6-pointed star has 6 small tip triangles (one per point) plus the 2 large triangles (the original upward-pointing and downward-pointing triangles whose overlap created the star). Total = 6 + 2 = 8 triangles. A common mistake is counting only the 6 small tips and forgetting the 2 large overlapping ones that are also complete, valid triangles."
          ]
        },
        {
          "heading": "Counting All Squares in an n×n Grid",
          "body": "A grid of n×n unit squares contains squares of every size from 1×1 up to n×n, and the count of squares of each size k×k is (n−k+1)², so the total number of squares of all sizes is the sum n² + (n−1)² + ... + 1².",
          "bullets": [
            "A 3×3 grid (9 unit squares) contains: 3×3 size squares: (3−3+1)² = 1. 2×2 size squares: (3−2+1)² = 4. 1×1 size squares: (3−1+1)² = 9. Total = 1 + 4 + 9 = 14 squares of all sizes, not just the 9 visible unit squares."
          ]
        },
        {
          "heading": "Counting Tilted (Diamond) Squares",
          "body": "When a figure includes lines connecting the midpoints of a square's sides (forming an inner diamond shape), that diamond is itself a valid square (rotated 45°) and must be counted separately from the axis-aligned squares — its sides are equal in length and its angles are all 90°, satisfying the definition of a square despite its tilted orientation.",
          "bullets": [
            "A single square has its 4 side-midpoints connected to form an inner diamond. Squares present: the original outer square (1) plus the tilted inner diamond-square (1) = 2 squares total. Overlooking the diamond because it 'looks like a diamond, not a square' is a common undercount."
          ]
        },
        {
          "heading": "Squares vs. Rectangles: Don't Overcount",
          "body": "When a question specifically asks for the number of SQUARES (not rectangles), every candidate figure must have all 4 sides equal — a grid or divided figure typically also contains many non-square rectangles (like a 1×2 block), and these must be explicitly excluded even though they were 'formed' by the same combination method used to find squares.",
          "bullets": [
            "A 1×2 grid of unit squares (2 small unit squares side by side) contains 2 unit squares (1×1, valid squares) but the overall 1×2 combined region is a rectangle, not a square (unequal sides), and must NOT be added to the square count even though it's a valid combined figure."
          ]
        },
        {
          "heading": "Counting Both Triangles and Squares in One Composite Figure",
          "body": "Composite figures (a shape built from multiple basic elements together) require running the triangle-count method and the square-count method as two fully separate passes over the same figure, since a line segment can simultaneously be part of both a triangle and a square/rectangle depending on which combination is being counted.",
          "bullets": [
            "A rectangle has one diagonal drawn (splitting it into 2 triangles) AND a vertical line down its middle (splitting it into 2 smaller rectangles, each also crossed partially by the diagonal). Triangles: the 2 halves from the diagonal, plus 2 smaller triangles formed where the vertical line crosses the diagonal = 4 triangles total. Rectangles: the 2 halves from the vertical line, plus the original whole rectangle = 3 rectangles total."
          ]
        },
        {
          "heading": "Worked Full Example: A Pentagon With All Diagonals Drawn",
          "body": "For any unfamiliar composite figure, apply the same universal method regardless of overall shape: label every distinct intersection point, list every smallest enclosed region, then methodically test every combination of 2 or more adjacent smallest regions against the target shape's definition before counting it.",
          "bullets": [
            "A pentagon has all 5 of its diagonals drawn, creating a smaller pentagon in the center along with 5 small triangles at the points and 5 slightly larger triangles between them. Counting only 'triangles that touch an outer vertex' undercounts — the full systematic method also finds triangles formed by combining a small point-triangle with an adjacent larger one, giving additional valid triangles beyond the visually obvious ones."
          ]
        }
      ],
      "commonPitfalls": [
        "Counting only the smallest visible units and forgetting the larger figures formed by combining adjacent smaller ones.",
        "In multi-cevian triangle problems, missing the combination triangles (pairs, triples) and counting only the immediately adjacent smallest triangles.",
        "In a six-pointed star, counting only the 6 small tip triangles and forgetting the 2 large overlapping triangles that form the star itself.",
        "Using the n×n square-counting formula on a grid that isn't actually square (unequal rows and columns), where the formula doesn't directly apply.",
        "Overlooking tilted (rotated 45°, diamond-oriented) squares formed by midpoint-connecting lines.",
        "Including non-square rectangles when a question specifically asks only for squares.",
        "In composite figures, using triangle-counting logic and square-counting logic in a single combined pass instead of two separate, careful passes."
      ],
      "keyTakeaways": [
        "Always count smallest units first, then systematically count every valid combination of adjacent units — never stop at the smallest units alone.",
        "For triangles sharing one apex, combinations of adjacent smallest triangles (pairs, triples, all together) are themselves valid larger triangles.",
        "A standard six-pointed star has 8 triangles: 6 small tips plus 2 large overlapping ones.",
        "An n×n grid contains n² + (n−1)² + ... + 1² total squares of all sizes, not just the n² unit squares.",
        "Tilted (diamond-oriented) squares from midpoint-connecting lines are still valid squares and must be counted.",
        "When a question asks for squares specifically, exclude any combined region that is a non-square rectangle."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Construction of Squares and Triangles",
          "url": "https://www.indiabix.com/non-verbal-reasoning/construction-of-squares-and-triangles/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Dot Situation",
      "overview": "Dot-situation questions show a base figure with 2 or 3 overlapping shapes (commonly a circle, a triangle, and a square) and a single dot placed somewhere inside the overlapping regions, then ask which of several answer options — each redrawing the same shapes in a different overlap arrangement — has a dot placed in the region satisfying the same inside/outside relationship to every shape. The reliable method is to convert the dot's position into an inside/outside code for each shape individually, since that code (not the dot's visual position on the page) is what must be matched across differently-arranged options. This sub-module builds that region-code method from a single base figure through the full 3-shape case, a Venn-diagram mental model, and the simpler verbal-condition variant where the code is given directly in words.",
      "sections": [
        {
          "heading": "Reading the Base Figure's Dot Position",
          "body": "A dot-situation question typically shows a base figure with 2 or 3 overlapping shapes and a single dot placed somewhere within the overlapping regions — the first step is to determine, for EACH shape individually, whether the dot lies inside or outside that shape's boundary, ignoring the other shapes for the moment.",
          "bullets": [
            "A base figure has a circle, a triangle, and a square all overlapping. The dot sits in a region that is inside the circle's boundary, inside the triangle's boundary, but outside the square's boundary entirely. Checked one shape at a time: circle = inside, triangle = inside, square = outside."
          ]
        },
        {
          "heading": "Translating the Dot's Position Into a Region Code",
          "body": "Convert the inside/outside check for each shape into a compact code (such as circle: Yes, triangle: Yes, square: No) — this code is the actual answer requirement, completely independent of how the shapes happen to be arranged or overlap in the drawing, and it's what must be matched in the answer options, not the dot's visual position on the page.",
          "bullets": [
            "From the previous example (circle: inside, triangle: inside, square: outside), the region code is (C+, T+, S−) — meaning 'inside circle AND inside triangle AND outside square.' Any candidate figure with a dot satisfying exactly this code is correct, regardless of where that region physically appears in that candidate's drawing."
          ]
        },
        {
          "heading": "Why the Answer Options Look Different From the Base Figure",
          "body": "Each answer option redraws the same 3 shapes but in a different relative arrangement or overlap pattern than the base figure — this is intentional, and it means you cannot simply look for 'the same visual spot' in each option; you must re-derive the inside/outside status for each shape fresh, in each option, using the region code as your only guide.",
          "bullets": [
            "The base figure has the triangle mostly overlapping the circle's left side. Option B instead draws the triangle overlapping the circle's right side, with the square positioned differently too. Despite the different layout, Option B is still evaluated by the same rule: find the region, if any, that is inside the circle, inside the triangle, and outside the square — matching the code, not the picture's layout."
          ]
        },
        {
          "heading": "Systematic Region Mapping for Three Overlapping Shapes",
          "body": "Three overlapping shapes create up to 7 distinct internal regions (each shape alone, each pair's exclusive overlap, and the region common to all three) plus the space outside all shapes — methodically identify all regions present in a given figure by checking each one against all 3 shapes before deciding which single region matches the required code.",
          "bullets": [
            "In a given answer option, checking the region where the triangle and square overlap (but the circle does not reach) gives the code (C−, T+, S+) — this does NOT match the required (C+, T+, S−) code from the earlier example, so this region is rejected even though it's a valid overlap region in the figure."
          ]
        },
        {
          "heading": "Worked Example: Matching a Code Across Multiple Options",
          "body": "Apply the full method end to end: state the required code from the base figure, then check each option's available regions against that code, eliminating options that have no region satisfying it and confirming the one option that does.",
          "bullets": [
            "Required code: (C+, T+, S−). Option A's regions include only (C+, T+, S+), (C−, T+, S−), and (C+, T−, S−) — none match. Option B includes a region (C+, T+, S−) exactly where its circle and triangle overlap outside the square's boundary — this matches, so Option B is the correct answer."
          ]
        },
        {
          "heading": "Pure Verbal-Condition Dot Situations",
          "body": "A variant skips the base figure entirely and instead states the condition directly in words (for example: 'in which figure does a dot lie inside the triangle and the square, but outside the circle') — treat this exactly like a pre-derived region code and search the options the same way, without needing a base figure to reverse-engineer the code from.",
          "bullets": [
            "Condition given in words: 'dot inside triangle and circle, outside square.' This is directly the code (Circle+, Triangle+, Square−) — skip the base-figure derivation step entirely and go straight to checking each option's regions against this code."
          ]
        },
        {
          "heading": "Using a Venn-Diagram Mental Model",
          "body": "Thinking of the 3 shapes as a standard 3-circle Venn diagram (even when they're drawn as different shapes like a triangle and square) makes region identification far more reliable than trying to judge positions visually — mentally label regions using set logic (only-A, A-and-B-only, all-three, and so on) exactly as you would for a probability or set-theory Venn diagram.",
          "bullets": [
            "Treating circle=A, triangle=B, square=C, the required region (C+, T+, S−) is exactly the Venn-diagram region 'A∩B, excluding C' — the part of A and B's overlap that does not also fall inside C. Searching for this specific Venn region in each option is more reliable than trying to eyeball dot positions."
          ]
        },
        {
          "heading": "The Simpler Two-Shape Case",
          "body": "With only 2 overlapping shapes, there are just 4 possible regions (inside both, inside only the first, inside only the second, outside both) — this simpler case is worth solving explicitly first if it appears, since the same systematic logic scales up directly to the 3-shape case.",
          "bullets": [
            "Two overlapping shapes, a circle and a square. Required condition: dot inside the square but outside the circle. This is the region code (Circle−, Square+) — the crescent-shaped part of the square that does not overlap the circle. Any option whose square-only (non-overlapping) region contains the dot satisfies this."
          ]
        }
      ],
      "commonPitfalls": [
        "Trying to match the dot's visual position on the page instead of deriving and matching its inside/outside code for each shape.",
        "Forgetting to re-derive the region code fresh for each answer option, since shapes are rearranged differently in each one.",
        "Checking only 2 of the 3 shapes' inside/outside status and missing a mismatch on the third shape.",
        "Confusing a pairwise overlap region (like circle-and-triangle-only) with the full three-way overlap region.",
        "In verbal-condition variants, misreading which shapes should be 'inside' versus 'outside' in the stated condition.",
        "Assuming a region that looks visually similar in size or position to the base figure's dot region is automatically the same code."
      ],
      "keyTakeaways": [
        "Convert the dot's position into an inside/outside code for each shape individually — this code, not the visual position, is what must be matched.",
        "Each answer option rearranges the shapes differently; re-derive the code fresh in every option rather than pattern-matching the picture.",
        "Model 3 overlapping shapes as a Venn diagram with up to 7 distinct regions to identify overlaps systematically.",
        "Verbal-condition dot situations give the code directly in words — skip straight to matching regions in the options.",
        "Always check ALL shapes in the code (not just 2 of 3) before confirming a region match.",
        "Master the simpler 2-shape (4-region) case first; the 3-shape (7-region) case uses the identical logic."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Dot Situation",
          "url": "https://www.indiabix.com/non-verbal-reasoning/dot-situation/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Grouping of Images",
      "overview": "Grouping-of-images (grouping identical figures) questions give a jumbled set of figures — usually the same handful of distinct base shapes repeated at different rotations and sizes — and ask you to sort them into groups where every figure in a group is truly the same shape, just rotated or resized, while figures that only look superficially similar but are structurally different (especially mirror images) must be kept separate. This sub-module builds a rotation-invariant comparison method: tracking turn sequences to detect true rotations versus mirror images, using a fixed reference feature to track orientation consistently, and handling figures with internal details like arrows or shading whose relative position must also match.",
      "sections": [
        {
          "heading": "The Core Task: Sorting by True Identity, Not Surface Appearance",
          "body": "Grouping-of-images questions give a jumbled set of figures — usually the same handful of distinct base shapes repeated at different rotations and sizes — and ask you to sort them into groups where every figure in a group is actually the SAME shape (just rotated or resized), while figures that only look superficially similar but are structurally different must be kept separate.",
          "bullets": [
            "Nine arrow-like figures are given. Visually they all look like 'a bent arrow,' but structurally there are only 3 distinct bend angles among them (some bend at 90°, some at 120°, some at 60°), each appearing 3 times at different rotations. The correct grouping is 3 groups of 3, sorted by bend angle, not by which way each arrow currently points."
          ]
        },
        {
          "heading": "Rotation-Invariant Comparison",
          "body": "To check if two figures are the same shape rotated differently, compare properties that don't change under rotation — the sequence of angles going around the shape, the relative lengths of its sides in order, and how many 'arms' or protrusions it has — rather than comparing their orientation on the page, which is expected to differ within a valid group.",
          "bullets": [
            "Two zigzag figures each have 3 straight segments. Figure X's segments turn left, then right, then left (reading from one end to the other). Figure Y, rotated 180° from X, still turns left, then right, then left when read consistently from the same relative end — confirming they're the same shape, just rotated."
          ]
        },
        {
          "heading": "Detecting Mirror Images (Which Are NOT the Same Figure)",
          "body": "A mirror-image version of a shape is NOT considered identical for grouping purposes even though it has the same angles and side lengths — check this by tracing the shape's sequence of turns (left-turn vs. right-turn at each bend) in a consistent direction; a true rotation preserves the exact left/right turn sequence, while a mirror image reverses every left turn to a right turn and vice versa.",
          "bullets": [
            "Figure X's zigzag turns left, then right, then left (reading clockwise from one end). A candidate Figure Z has the same 3 segment lengths and angles, but reading it the same way gives right, then left, then right — the exact reverse sequence. Figure Z is a MIRROR image of X, not a rotation, and must NOT be grouped with it."
          ]
        },
        {
          "heading": "Using a Reference Feature to Track Orientation",
          "body": "Pick one distinguishing feature on the base shape (like its longest side, or a small notch/arrow marking) and use it as a fixed reference point when comparing figures — mentally rotate each candidate figure until its reference feature aligns with the reference feature of a known group member, then check whether the rest of the shape lines up too.",
          "bullets": [
            "A shape has one side noticeably longer than the other three. Using that longest side as the reference, rotate a candidate figure mentally until its longest side points in the same direction as the reference figure's longest side — if every other feature then lines up exactly, they're the same shape; if not, they're different."
          ]
        },
        {
          "heading": "Grouping Figures With Internal Details",
          "body": "When figures include internal details (an arrow inside a shape, a shaded portion, a small dot), those details must maintain the SAME relative position to the outer shape's reference feature across the whole group — an outer shape that matches perfectly but has its internal arrow pointing toward a different relative side is a different figure for grouping purposes, not the same one misdrawn.",
          "bullets": [
            "Two identical pentagons each contain an internal arrow. In the reference figure, the arrow points from the center toward the longest side. In a candidate figure with the same pentagon outline, the arrow instead points toward the shortest side. Despite the identical outer pentagon, this candidate belongs to a DIFFERENT group because its internal detail's relative position doesn't match."
          ]
        },
        {
          "heading": "Worked Full Example: Sorting 9 Figures Into 3 Groups of 3",
          "body": "Work through a full sort methodically: pick any ungrouped figure as a reference, use its rotation-invariant properties (turn sequence, relative side lengths, reference feature) to find its 2 matches among the remaining figures, remove all 3 from the pool, and repeat with a fresh reference figure from what's left.",
          "bullets": [
            "9 figures are given: 3 are '4-pointed star' shapes at various rotations, 3 are 'plus-sign' shapes at various rotations, and 3 are 'pinwheel' shapes (which look star-like at a glance but have curved, not straight, blade edges). Picking one star as reference and checking turn-sequence and edge-type (straight vs curved) correctly separates the 3 true stars from the 3 pinwheels, which a quick glance might otherwise lump together as the same shape."
          ]
        },
        {
          "heading": "Distinguishing Near-Identical Decoys",
          "body": "The most common trap figure in a grouping set differs from a true group member in exactly one small way — one side very slightly shorter, one angle very slightly wider, or one extra small element — designed to be caught only by careful comparison of the specific measurable features, not by a quick visual scan.",
          "bullets": [
            "Two 'house-shaped' pentagons (a square with a triangular roof) look identical at a glance. Careful comparison shows one has a roof triangle that's a true equilateral shape (all angles 60°), while the decoy's roof is slightly flatter (a wider, shorter triangle) — a difference easy to miss without directly comparing the roof's proportions, not just its general silhouette."
          ]
        }
      ],
      "commonPitfalls": [
        "Grouping figures by rough visual similarity instead of verifying rotation-invariant properties like turn sequence and relative side lengths.",
        "Accidentally grouping a mirror image with its true rotational match, since mirror images share angles and side lengths but reverse the turn sequence.",
        "Ignoring internal details (arrows, shading, dots) and matching only on the outer silhouette.",
        "Missing that an internal detail's relative position (not just its presence) must match across a group.",
        "Being fooled by a decoy figure that differs by only one slightly altered angle or side length.",
        "Not using a fixed reference feature to track orientation, leading to inconsistent 'by eye' comparisons across many rotated figures."
      ],
      "keyTakeaways": [
        "Compare figures using rotation-invariant properties (turn sequence, relative side lengths) rather than their orientation on the page.",
        "A mirror image reverses the left/right turn sequence and is NOT the same figure for grouping purposes, even with identical angles and lengths.",
        "Internal details (arrows, shading, dots) must match in both presence AND relative position to the shape's reference feature.",
        "Use one clear reference feature (longest side, a notch) to mentally align and compare rotated candidates consistently.",
        "Sort methodically: fully resolve one group at a time using a fresh reference figure from the remaining pool.",
        "Watch for decoy figures differing by only one small, easy-to-miss measurement rather than an obviously different shape."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Grouping Identical Figures",
          "url": "https://www.indiabix.com/non-verbal-reasoning/grouping-identical-figures/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Non-Verbal Analogies",
      "overview": "Non-verbal analogy questions (Figure A is to Figure B as Figure C is to ?) require identifying the exact transformation that turns A into B and then applying that identical transformation to C to derive the answer. This sub-module goes deeper than the brief analogy coverage in 'Pattern recognition' by working through every major analogy sub-type — single transformations (rotation, reflection, resize), element addition/removal counted precisely, shading and fill-position changes, two-step combined transformations, and categorical (non-transformational) analogies based on a shared property rather than a geometric change — plus a verification step for when a derived answer doesn't match any given option.",
      "sections": [
        {
          "heading": "The Basic Method: Derive the Rule From A:B First",
          "body": "Every non-verbal analogy is solved by first determining the EXACT transformation that turns figure A into figure B, stated explicitly (not just 'it changed somehow'), and only then applying that same exact transformation to figure C to derive the answer — never look at the answer options before pinning down the A→B rule precisely.",
          "bullets": [
            "Figure A is a small unshaded triangle; figure B is a large shaded triangle (same shape, but bigger and now filled in). The A→B rule: 'increase size AND add full shading.' Figure C is a small unshaded square. Applying the identical rule: the answer must be a large, fully shaded square."
          ]
        },
        {
          "heading": "Single-Transformation Analogies: Rotation and Reflection",
          "body": "The simplest analogies change exactly one geometric property between A and B — most often a rotation by a fixed angle or a left-right/top-bottom flip — identify the transformation type and its exact amount (the angle, or which axis it's flipped across) before applying it to C.",
          "bullets": [
            "Figure A is an L-shape with its corner at the bottom-left. Figure B is the same L-shape rotated 90° clockwise (corner now at top-left). The rule: 'rotate 90° clockwise.' Figure C is a T-shape with its stem pointing down. Applying the same rotation: the answer is the T-shape rotated 90° clockwise, with its stem now pointing left."
          ]
        },
        {
          "heading": "Element Addition or Removal Analogies",
          "body": "Some analogies keep the outer shape constant but change the number of internal elements (dots, small lines, smaller embedded shapes) between A and B — count the exact change (added 2 dots, removed 1 line) rather than just noting 'more' or 'fewer,' since the exact count must transfer precisely to C.",
          "bullets": [
            "Figure A is a circle with 1 dot inside; figure B is the same circle with 3 dots inside (an increase of exactly 2 dots). Figure C is a square with 2 dots inside. Applying 'add exactly 2 dots': the answer is a square with 4 dots inside — not just 'more dots than C,' but precisely 2 more."
          ]
        },
        {
          "heading": "Shading and Fill-Pattern Analogies",
          "body": "Shading-based analogies change which portion of a figure is filled between A and B — describe the shading change in exact positional terms (which specific section becomes shaded) rather than just 'shading changed,' since the position of the new shading must also transfer correctly to C.",
          "bullets": [
            "Figure A is a circle with its left half unshaded; figure B is the same circle with its RIGHT half now shaded instead (the shading moved from left to right, a 180° shift). Figure C is a square with its top half shaded. Applying 'shade shifts 180° (opposite side)': the answer is a square with its bottom half shaded instead."
          ]
        },
        {
          "heading": "Two-Step Combined Analogies",
          "body": "Higher-difficulty analogies apply two independent transformations from A to B simultaneously (such as a rotation AND an element count change together) — isolate and state each transformation separately, then apply both, independently, to figure C rather than trying to see the combined change as a single vague impression.",
          "bullets": [
            "Figure A is an arrow pointing up with 1 star beside it. Figure B is the same arrow rotated 90° clockwise (now pointing right) with 2 stars beside it. Two rules: 'rotate 90° clockwise' AND 'add 1 star.' Figure C is an arrow pointing left with 3 stars. Applying both rules independently: rotate 90° clockwise (arrow now points up) AND add 1 star (4 stars total) — the answer is an up-pointing arrow with 4 stars."
          ]
        },
        {
          "heading": "Categorical (Non-Transformational) Analogies",
          "body": "Not every analogy is a geometric transformation — some pair figures by a shared CATEGORY instead, such as 'both are made only of curved lines,' and the answer must belong to the same category as C rather than being a transformed version of C's specific shape.",
          "bullets": [
            "Figure A (a circle) relates to figure B (an oval) by the shared category 'made only of curved lines, no straight sides.' Figure C is a wavy S-shape (also purely curved). Since no rotation or resize rule fits A→B at all, the correct approach recognizes this as a category match: the answer must be any shape made only of curved lines, not a specific transformed version of C."
          ]
        },
        {
          "heading": "Verifying the Rule Against the Options, Not Just Deriving It",
          "body": "After deriving a rule from A:B and applying it to C, always check the derived answer against the actual answer options provided — if no option matches exactly, the originally derived rule was likely wrong or incomplete, and the A:B pair should be re-examined for an additional property that was initially overlooked.",
          "bullets": [
            "Derived rule from A:B: 'rotate 90°.' Applying to C predicts a specific rotated figure, but no answer option matches it exactly — re-examining A and B reveals a SECOND change also occurred (the shape also got slightly larger), a detail missed on the first pass. Reapplying both 'rotate 90°' AND 'enlarge' to C now matches one of the given options correctly."
          ]
        },
        {
          "heading": "Worked Full Example: A:B::C:? With Two Properties",
          "body": "Combine the full method: state the rule from A to B precisely (including every property that changed, not just the most obvious one), apply every part of that rule to C, and confirm the result against the answer choices before finalizing.",
          "bullets": [
            "A: a small unshaded pentagon. B: a small SHADED pentagon rotated 72°. Two changes: 'add full shading' AND 'rotate 72°.' C: a large unshaded hexagon. Applying both changes: shading gives a large shaded hexagon; the 72° rotation is then applied to that shaded hexagon too. The final answer is a large, fully shaded hexagon rotated 72° from C's original orientation."
          ]
        }
      ],
      "commonPitfalls": [
        "Looking at the answer options before precisely deriving the exact A→B transformation rule.",
        "Stating a rule vaguely ('it got different') instead of naming the exact rotation angle, element count change, or shading position.",
        "Missing that an analogy combines TWO transformations at once and applying only the more obvious one.",
        "Assuming a categorical (property-based) analogy must be a geometric transformation, and searching for a nonexistent rotation/resize rule instead.",
        "Not re-checking a derived answer against the actual options, and missing a second overlooked transformation as a result.",
        "In element-count analogies, noting only the direction of change ('more dots') instead of the exact number changed.",
        "In shading analogies, describing the change only as 'more shaded' instead of specifying exactly which section became shaded."
      ],
      "keyTakeaways": [
        "Always derive the exact A→B transformation rule first, stated precisely, before looking at any answer option.",
        "Check for combined (two-property) transformations — rotation AND element count, or shading AND size — rather than assuming just one change.",
        "Categorical analogies group by a shared property, not a transformation; don't force a rotation/resize rule where none exists.",
        "State element-count and shading changes with exact numbers and positions, not vague direction words.",
        "If a derived answer doesn't match any option, re-examine A:B for a second, overlooked property before concluding the question is flawed.",
        "Apply every part of a multi-part rule independently to C, then combine the results into one final figure."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Analogy",
          "url": "https://www.indiabix.com/non-verbal-reasoning/analogy/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Rotation of Figures",
      "overview": "Rotation-of-figures questions test whether a candidate can precisely track a figure's angle and direction of turn — determining how much and which way a figure has rotated, telling a genuine rotation apart from a mirror image that merely looks similar, and applying a confirmed rotation step forward through a sequence or to a missing figure. This sub-module builds a reference-feature method for tracking rotation reliably: measuring angle and direction from one distinctive feature, using the turn-sequence test to catch mirror images, rotating figures with off-center internal markings and multi-part compound shapes correctly, and confirming a multi-step sequence's rotation angle against three or more figures rather than just two.",
      "sections": [
        {
          "heading": "Reading Rotation Direction and Angle",
          "body": "Every rotation question specifies (or implies from a shown pair) a direction — clockwise or anticlockwise — and an angle; determine both explicitly by tracking one distinctive point or feature of the figure from its starting position to its new position, and measuring how far around the circle it swept, in which direction.",
          "bullets": [
            "A figure's single marked corner starts pointing due north (straight up). After rotation, that same corner points due east (directly right). Moving from north to east sweeps 90° in the CLOCKWISE direction (north → east is clockwise; north → west would have been anticlockwise for the same 90°)."
          ]
        },
        {
          "heading": "Verifying a True Rotation vs. a Mirror Image",
          "body": "A figure that has been rotated preserves its exact internal left/right handedness — tracing its outline in one direction produces the same sequence of turns before and after rotation; a mirror image instead reverses that turn sequence, which is the definitive test for telling a genuine rotation apart from a mirror image that merely looks similar.",
          "bullets": [
            "An L-shaped figure's outline, traced clockwise from its longest edge, goes: straight, turn-right, straight, turn-left, straight, turn-right (back to start). A candidate 'rotated' version, traced the same way, gives: straight, turn-LEFT, straight, turn-RIGHT, straight, turn-left — the reversed sequence. This candidate is a mirror image, not a valid rotation, despite matching angles and side lengths."
          ]
        },
        {
          "heading": "Rotating Figures With Internal Asymmetric Markings",
          "body": "When a figure has an internal marking placed off-center, that marking must rotate together with the entire outer figure by the identical angle and direction — check that the marking's position relative to the outer shape's reference feature stays constant before and after rotation.",
          "bullets": [
            "A square has a small arrow inside pointing toward its top-right corner. After a 90° clockwise rotation of the whole square, the arrow must now point toward what was the top-LEFT corner before rotation (since that corner has rotated into the top-right position) — the arrow's relationship to 'the corner nearest it' stays fixed; its compass-direction label changes."
          ]
        },
        {
          "heading": "Multi-Step Rotation Sequences",
          "body": "A sequence showing a figure at 3 or more stages, each rotated a fixed amount further than the last, is solved by first confirming the SAME fixed angle and direction applies between every consecutive pair shown, then extending that same fixed step to find the next figure in the sequence.",
          "bullets": [
            "A sequence shows a figure at 0°, then rotated to 60°, then to 120° (each step +60° clockwise, confirmed by checking both gaps in the sequence). The next figure in the sequence must be at 180° — the same figure, rotated a further 60° clockwise from the 120° position."
          ]
        },
        {
          "heading": "Finding the Odd Figure via Inconsistent Rotation",
          "body": "In a set of figures that are supposed to all be the same base shape at different rotations, the odd one out is typically the one that is either a mirror image (reversed turn sequence) or rotated by an angle that doesn't match the clean, consistent rotation pattern used by the rest of the set.",
          "bullets": [
            "Four figures are the same arrow shape at rotations of 0°, 90°, 180°, and 270° (clean 90° steps). A fifth figure appears to be the same arrow, but careful angle measurement shows it's actually at 100°, not a clean 90°-multiple — this figure is the odd one out, since it breaks the consistent rotation-step pattern even though it looks superficially close to the 90° position."
          ]
        },
        {
          "heading": "Rotation of Non-Symmetric Compound Figures",
          "body": "For compound figures made of multiple distinct parts, rotate the ENTIRE compound as one rigid unit — the attachment point and relative angle between the two parts must stay exactly fixed throughout the rotation, since rotating the parts independently would produce an invalid, physically incorrect result.",
          "bullets": [
            "A compound figure has a small triangle attached to the top of a circle, pointing straight up. After rotating the whole compound 90° clockwise, the triangle must now point directly right (attached at the same relative point on the circle's edge, which has itself moved 90° clockwise) — not still pointing up, and not detached from its original attachment point."
          ]
        },
        {
          "heading": "Using a Fixed Reference Point to Track Rotation",
          "body": "Before rotating any figure mentally, pick one unambiguous reference feature (the longest side, a uniquely shaped protrusion, a single marked vertex) and track ONLY that feature's new position and direction — attempting to track the entire figure's overall 'look' at once is unreliable and leads to errors, especially for complex or near-symmetric shapes.",
          "bullets": [
            "A five-sided figure has four similar-looking sides and one distinctly shorter fifth side. Using that short side as the sole reference point, track where it ends up after the stated rotation, then reconstruct the rest of the figure's expected position relative to it — far more reliable than trying to track all 5 sides simultaneously."
          ]
        },
        {
          "heading": "Worked Full Example: Confirming a Rotation Across a Full Set",
          "body": "Combine the full method: identify the reference feature, measure the angle and direction between the first two figures using that reference, verify the same angle and direction holds for a third given figure, and only then apply it forward to find a missing or next figure.",
          "bullets": [
            "A reference notch on a hexagon starts at the top (12 o'clock position). In the second figure, the notch is at the 4 o'clock position (120° clockwise). In a third given figure, the notch is at the 8 o'clock position (a further 120° clockwise, confirming the consistent +120° clockwise step). Applying the same step forward: the next figure's notch must be back at the 12 o'clock position (a full 360° cycle completed)."
          ]
        }
      ],
      "commonPitfalls": [
        "Judging a rotated figure by overall visual similarity instead of tracking one exact reference feature's angle and direction.",
        "Mistaking a mirror image for a valid rotation because angles and side lengths match, without checking the turn sequence.",
        "Forgetting that an internal marking must rotate together with the outer shape by the identical angle and direction.",
        "Assuming a multi-step rotation sequence's angle from only the first two figures without checking it against a third given figure.",
        "In compound figures, rotating the individual parts independently instead of rotating the whole rigid unit together.",
        "Mistaking a figure rotated by a close-but-not-exact angle as fitting a consistent rotation-step pattern.",
        "Losing track of direction (clockwise vs anticlockwise) partway through a multi-step sequence."
      ],
      "keyTakeaways": [
        "Track one clear reference feature's exact angle and direction of movement rather than judging rotation by overall visual impression.",
        "A true rotation preserves the figure's left/right turn sequence; a mirror image reverses it — this is the definitive test.",
        "Internal markings rotate together with the outer shape by the identical angle and direction, not independently.",
        "Confirm a multi-step sequence's fixed rotation angle against at least three consecutive figures, not just the first two.",
        "Rotate compound figures as one single rigid unit, keeping attachment points and relative angles between parts fixed.",
        "The odd figure in a rotation set is often a mirror image, or an angle that's close to but not exactly on the consistent rotation step."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Rule Detection",
          "url": "https://www.indiabix.com/non-verbal-reasoning/rule-detection/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Missing Figure Completion",
      "overview": "Missing-figure completion questions show one large figure with a chunk cut out — usually a clean rectangular or wedge-shaped notch — and ask which of several candidate pieces correctly fills the gap. Unlike figure-matrix questions, there is no grid of separate cells; instead a single figure's internal pattern, symmetry, lines, or borders must be continued smoothly across the missing region. This sub-module builds a complete method: continuing an internal pattern, using symmetry to derive the mirror-image piece, tracing lines and curves across the gap at the correct position and angle, completing radial (wheel-like) and border patterns, and using outline-fit and detail elimination as final filters before selecting an answer.",
      "sections": [
        {
          "heading": "The Core Skill: Continuing the Figure's Internal Pattern",
          "body": "A missing-piece completion question shows one large figure with a chunk cut out and asks which candidate piece correctly fills that gap — the guiding principle is that the missing piece must continue whatever pattern, lines, or design elements run through the rest of the figure, not merely fit the gap's outline shape.",
          "bullets": [
            "A figure is a grid of horizontal stripes, with one rectangular notch missing from the middle. Even though several candidate pieces are the exact right rectangular size and shape to physically fit the notch, only the one showing horizontal stripes at the correct spacing and alignment actually completes the pattern correctly."
          ]
        },
        {
          "heading": "Symmetry-Based Completion",
          "body": "When the overall figure has an obvious line of symmetry and the missing piece is on one side of that line, the correct piece is simply the mirror image of the corresponding intact region on the OTHER side of the symmetry line — locate that mirroring region first before considering any answer option.",
          "bullets": [
            "A butterfly-like figure is symmetric left-to-right, with a notch missing from the lower-right wing. The corresponding lower-LEFT wing (intact) shows a specific curved pattern with 2 small circles. The correct missing piece must be the mirror image of that exact lower-left pattern — 2 small circles in mirrored positions, following the same curve reflected left-to-right."
          ]
        },
        {
          "heading": "Line and Curve Continuation Across the Gap",
          "body": "For figures built from continuous lines or curves that pass through the missing region, trace each line from where it enters the gap on one side and determine exactly where and at what angle it must exit on the other side — the correct piece must connect these entry and exit points smoothly, matching both position and angle, not just position alone.",
          "bullets": [
            "A diagonal line enters the missing notch from the top-left corner of the gap, heading down-and-right at a consistent angle. It must exit the gap's boundary at the bottom-right corner, continuing at that SAME angle. A candidate piece where the line bends partway through, or exits at the wrong point, is incorrect even if the line generally 'looks like it connects.'"
          ]
        },
        {
          "heading": "Radial or Repeating Pattern Completion",
          "body": "In circular or wheel-like figures made of a repeating wedge pattern around a center point, the missing wedge must repeat the exact same internal design as every other wedge in the figure, rotated to the correct angular position — count the total number of wedges and the angle each spans to determine precisely what the missing wedge's design and orientation must be.",
          "bullets": [
            "A circular figure is divided into 8 equal wedges (45° each), 7 of which show an identical small triangle pointing toward the center. The missing 8th wedge must show that same small triangle, pointing toward the center, correctly oriented for its position in the circle — not pointing outward or at a random angle."
          ]
        },
        {
          "heading": "Border and Edge Pattern Continuation",
          "body": "When a figure has a decorative border or edge pattern running along its perimeter and the missing piece includes part of that border, the border pattern's spacing and shape must continue seamlessly across the gap at exactly the same rhythm as the border on either side of the missing piece.",
          "bullets": [
            "A rectangular figure has a dashed-line border with dashes evenly spaced every 1 cm running along the top edge. The missing piece covers a 3 cm stretch of that top edge. The correct piece must show exactly 3 dashes at 1 cm spacing, correctly positioned to align with the dashes immediately before and after the gap — a piece with only 2 dashes, or unevenly spaced dashes, breaks the border rhythm."
          ]
        },
        {
          "heading": "Checking the Piece's Outline Shape Matches the Gap",
          "body": "Before evaluating any internal pattern details, first confirm that a candidate piece's outer outline shape and size actually match the gap's outline exactly — a piece with perfect internal pattern-matching but a slightly wrong outline shape cannot be the correct answer regardless of how well its pattern seems to continue.",
          "bullets": [
            "The gap in a figure is a perfect right-angled rectangular notch. One candidate piece has beautifully matching internal stripes but has a very slightly rounded top-right corner. Despite the excellent internal pattern match, this piece is rejected on outline grounds alone — the gap requires a sharp right angle, not a rounded one."
          ]
        },
        {
          "heading": "Eliminating Options With Wrong Internal Details",
          "body": "Use the answer options as an elimination checklist just as in matrix questions: reject any option with an internal detail count, color, or shading that doesn't match what the surrounding pattern requires, even if only one small detail is off — exam distractors are commonly built to be correct in every way except one deliberately altered detail.",
          "bullets": [
            "The required piece must show 2 small dots and diagonal hatching. Option A has 2 dots but no hatching — eliminated. Option B has hatching but 3 dots instead of 2 — eliminated. Option C has exactly 2 dots and matching diagonal hatching — selected."
          ]
        },
        {
          "heading": "Worked Full Example: Completing a Symmetric Mandala Figure",
          "body": "Combine border, radial, and symmetry checks together for complex figures: first identify the overall symmetry or repetition type, then trace lines/borders into the gap, then filter candidate pieces by outline fit, and finally eliminate on internal detail mismatches.",
          "bullets": [
            "A circular mandala figure has 6-fold radial symmetry (6 identical wedges) AND each wedge is itself left-right symmetric. The missing wedge's design is derived from any of the other 5 intact wedges. A candidate piece matching that wedge's design but mirrored the wrong way (breaking the wedge's own internal left-right symmetry) is rejected, even though it matches the overall radial repetition — both layers of symmetry must be satisfied simultaneously."
          ]
        }
      ],
      "commonPitfalls": [
        "Selecting a piece purely because its outline shape fits the gap, without checking whether its internal pattern actually continues correctly.",
        "Missing that a line entering the gap must exit at both the correct position AND the correct angle, not just anywhere on the far boundary.",
        "In radial (wheel/mandala) figures, using the wrong wedge count or angle, leading to an incorrectly oriented missing wedge.",
        "In border-pattern gaps, getting the dash/element count right but the spacing or alignment wrong relative to the border on either side.",
        "Accepting a piece with a slightly wrong outline shape because its internal pattern otherwise looks right.",
        "Checking only one layer of symmetry (radial OR mirror) in figures that actually require both to hold simultaneously.",
        "Not using full elimination against ALL confirmed details, stopping as soon as a piece matches just one or two of the required features."
      ],
      "keyTakeaways": [
        "The missing piece must continue the figure's actual pattern (lines, repetition, symmetry), not just physically fit the gap's outline.",
        "For symmetric figures, the correct piece is the mirror image of the corresponding intact region across the symmetry line.",
        "Lines and curves must connect across the gap at both the correct position AND the correct angle.",
        "In radial/wheel figures, count total wedges and angle-per-wedge to determine the missing wedge's exact required orientation.",
        "Always verify outline shape and size fit BEFORE evaluating internal pattern details.",
        "Use full elimination against every confirmed detail (count, position, angle, shading), not just the first one or two that seem to match."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Completion of Incomplete Pattern",
          "url": "https://www.indiabix.com/non-verbal-reasoning/completion-of-incomplete-pattern/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Non-Verbal Reasoning",
      "subModuleTitle": "Figure Formation & Analysis",
      "overview": "Figure formation and analysis questions give 3-5 separate irregular pieces and ask which target shape can be exactly formed by fitting all the given pieces together edge-to-edge, with no gaps and no overlaps — plus the reverse task, given a complete figure, identifying which set of pieces it was originally made from. This sub-module builds a systematic assembly method: matching edge lengths before anything else, using total area as a fast elimination filter, testing pieces rotated and flipped from their shown orientation, checking angle compatibility at every join, and confirming a finished assembly has zero leftover gaps or overlaps.",
      "sections": [
        {
          "heading": "The Core Task: Assembling Given Pieces Into a Target Shape",
          "body": "Figure-formation questions show 3-5 separate irregular pieces and ask which target shape can be exactly formed by fitting all the given pieces together edge-to-edge, with no gaps and no overlaps — the reliable approach is to treat it like a puzzle: check compatibility systematically rather than trying to 'eyeball' whether pieces look like they'd fit a target's silhouette.",
          "bullets": [
            "Three pieces are given: a right triangle, a square, and a smaller right triangle. A target option shows a larger rectangle. Checking systematically: the square provides one clean edge matching the rectangle's height, and the two right triangles' hypotenuses can join to form the rectangle's remaining length exactly — confirming these 3 pieces do form that rectangle."
          ]
        },
        {
          "heading": "Matching Edge Lengths Before Anything Else",
          "body": "Before considering how pieces might visually arrange, measure each piece's edges against the other pieces' edges and against the target shape's edges — two pieces can only be joined along edges of EQUAL length, so any piece with no edge matching any other piece's edge length cannot be validly joined to it at all.",
          "bullets": [
            "Piece A has edges of relative lengths 3, 4, 5 (a right triangle). Piece B has edges of relative lengths 3, 3, 3, 3 (a square). Piece A's '3' edge and Piece B's '3' edge are compatible for joining; Piece A's '4' or '5' edges have no match on Piece B and cannot be the shared join edge between these two specific pieces."
          ]
        },
        {
          "heading": "Checking Total Area Consistency",
          "body": "As a fast filter before detailed assembly, roughly estimate whether the combined area of all the given pieces plausibly equals the target shape's area — if the pieces are visibly too small (or too large) in total to cover the target shape, that target option can be eliminated immediately without attempting a detailed fit.",
          "bullets": [
            "Three small pieces, each roughly the size of a small triangle, are given. One target option is a large hexagon clearly several times bigger than the combined size of the 3 pieces. This option is eliminated on area grounds alone — no valid arrangement of 3 small pieces can cover a much larger target shape."
          ]
        },
        {
          "heading": "Rotating and Flipping Pieces to Test Fit",
          "body": "Pieces are not restricted to their originally shown orientation — any piece may need to be rotated or flipped (mirrored) to fit correctly into the target shape, so when a piece doesn't seem to fit in its given orientation, systematically test it rotated by 90°, 180°, 270°, and also flipped, before concluding it doesn't belong in that arrangement.",
          "bullets": [
            "A trapezoid piece is shown with its longer parallel side at the bottom. In its given orientation, it doesn't fit against the other pieces to complete the target shape. Flipping it upside down allows its slanted edges to align correctly with the adjacent pieces — the piece was usable all along, just not in its originally displayed orientation."
          ]
        },
        {
          "heading": "Using Angle Compatibility at Joins",
          "body": "Beyond matching edge lengths, the ANGLES at a joined corner must also add up correctly to match the target shape's actual corner angle at that point — two pieces with matching edge lengths but incompatible angles at the join will leave a gap or an overlap at that corner even though the edge itself lines up.",
          "bullets": [
            "Two pieces join along a matching edge. At one end of that edge, Piece A contributes a 50° angle and Piece B contributes a 40° angle, summing to exactly 90° — matching the target shape's right-angle corner at that point, confirming a valid, gap-free join."
          ]
        },
        {
          "heading": "Eliminating Piece Sets With Leftover or Missing Area",
          "body": "After a tentative assembly, check for two failure signs: leftover overlapping material, or an uncovered gap inside the target's boundary — a valid formation has zero overlap and zero gaps, using every part of every given piece exactly once.",
          "bullets": [
            "A tentative assembly of 4 pieces into a target square leaves a small triangular gap uncovered in one corner. This confirms the 4 given pieces do NOT correctly form that target square — either a different target option is correct, or the pieces must be rearranged to eliminate that specific gap."
          ]
        },
        {
          "heading": "The Reverse Task: Breaking a Given Figure Into Its Source Pieces",
          "body": "The reverse question type gives one complete figure and asks which set of separate pieces it was originally cut from — apply the identical checks in reverse: the candidate piece set's total area must equal the given figure's area, and the pieces' edges must be capable of reconstructing every edge and angle of the given figure exactly.",
          "bullets": [
            "A given figure is an irregular pentagon. One candidate piece set (a triangle plus a quadrilateral) has a combined area matching the pentagon's area, and their edges/angles can be arranged to reconstruct the pentagon's exact outline. A second candidate set (two triangles) has the right total area but no valid edge-matching arrangement reconstructs the pentagon's specific angles — the first set is correct, not the second."
          ]
        },
        {
          "heading": "Worked Full Example: Assembling Four Pieces Into a Target Arrow",
          "body": "Combine every check in sequence for a full assembly problem: filter by total area first, filter by edge-length compatibility second, test rotations/flips third, and confirm angle compatibility and zero gaps/overlap last, before finalizing which target shape the given pieces form.",
          "bullets": [
            "Four pieces (two right triangles and two rectangles) are given, with a target option shaped like a thick arrow. Area check passes. Edge check passes: each piece has at least one edge matching an adjacent piece's edge. Rotation test: one rectangle must be rotated 90° to align with the arrow's shaft. Angle check: all joined corners sum correctly to the arrow's actual corner angles. No gaps or overlaps remain — confirming these 4 pieces correctly form the target arrow shape."
          ]
        }
      ],
      "commonPitfalls": [
        "Judging whether pieces fit a target shape by overall visual impression instead of systematically checking edge lengths, area, and angles.",
        "Forgetting that pieces may need to be rotated or flipped (mirrored) from their originally shown orientation to fit correctly.",
        "Matching edge LENGTHS between two pieces while ignoring whether the ANGLES at that join actually sum correctly for a gap-free fit.",
        "Not eliminating an obviously wrong target option early using a fast total-area comparison before attempting a detailed assembly.",
        "Accepting a tentative assembly that has a small leftover gap or overlap, rather than treating any gap/overlap as an automatic disqualification.",
        "In the reverse (breakdown) task, matching only the total area of a candidate piece set without confirming its edges can actually reconstruct the given figure's exact angles.",
        "Assuming every given piece must be used in a simple perimeter order rather than testing multiple possible join combinations."
      ],
      "keyTakeaways": [
        "Check compatibility systematically: total area first (fast elimination), then edge-length matching, then angle compatibility at each join.",
        "Any piece may need rotation or flipping (mirroring) from its shown orientation — don't reject a piece as non-fitting too early.",
        "Matching edge lengths alone isn't enough; the angles at each join must also sum correctly to match the target's actual corners.",
        "A valid formation has zero leftover gaps and zero overlaps, using every part of every piece exactly once.",
        "For the reverse (breakdown) task, apply the identical area/edge/angle checks in reverse to confirm a candidate piece set.",
        "Use a fast area comparison to eliminate obviously mismatched target options before attempting a full detailed assembly."
      ],
      "links": [
        {
          "label": "IndiaBix — Non-Verbal Reasoning: Figure Formation and Analysis",
          "url": "https://www.indiabix.com/non-verbal-reasoning/figure-formation-and-analysis/"
        },
        {
          "label": "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/"
        }
      ]
    }
  ]
};

export default data;
