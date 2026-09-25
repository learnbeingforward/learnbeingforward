import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  "courseSlug": "logical-reasoning",
  "submodules": [
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Puzzles",
      "overview": "Logical puzzles — ranking, distribution, floor-based, and box/grid arrangements — test systematic deduction under a strict set of constraints rather than raw calculation, and the biggest score difference between candidates comes from HOW they organize the clues, not from any special mathematical ability. Attempting to hold every clue in your head at once is what causes candidates to freeze; the fix is external representation — a grid, a number line, or a simple table — filled in step by step, applying the most restrictive (most specific) clue first. This sub-module walks through the core puzzle families with fully solved examples: a preference-matching grid, a linear ranking puzzle, a distribution puzzle with algebraic constraints, a floor-based puzzle, a box/position puzzle, conditional (if-then) chain deduction, and a time-management approach for puzzle sets, which are usually worth several questions each and reward getting the setup right once.",
      "sections": [
        {
          "heading": "Grid Method for Preference-Matching Puzzles",
          "body": "When each of several people is matched to exactly one item from a set (fruit, subject, sport), draw a grid of people vs items and mark each clue as a confirmed match, an elimination, or leave blank — apply the most specific clues (direct matches) before the exclusionary ones, since a single confirmed match often forces several others by elimination.",
          "bullets": [
            "Aisha, Bala, Chetan, Divya each like exactly one of mango, apple, grape, banana. Clues: Aisha doesn't like mango or banana; Bala likes grape; Chetan doesn't like apple; Divya likes mango. Since Divya=mango, Aisha (not mango, not banana, grape taken by Bala) must like apple. Chetan (not apple, apple already taken anyway) gets the only fruit left: banana. Final: Aisha–apple, Bala–grape, Chetan–banana, Divya–mango."
          ]
        },
        {
          "heading": "Linear Ranking Puzzles",
          "body": "Ranking puzzles (1st to last place) are solved by first placing any absolutely-fixed clues (e.g., 'X is ranked 2nd'), then working through relative clues ('immediately above/below') against the remaining open slots.",
          "bullets": [
            "Five students P, Q, R, S, T are ranked 1 (best) to 5 (worst). Clues: R is ranked 2nd; S is ranked last (5th); Q is immediately above T. Remaining open ranks for P, Q, T are {1, 3, 4}. The only consecutive pair within {1,3,4} is (3,4), so Q=3, T=4, leaving P=1. Final order: P, R, Q, T, S."
          ]
        },
        {
          "heading": "Distribution Puzzles With Algebraic Constraints",
          "body": "Distribution puzzles (items shared among people with relative-quantity clues) are often fastest solved by assigning a variable to the smallest unknown and expressing every other quantity in terms of it, then solving the resulting equation from the total.",
          "bullets": [
            "20 chocolates are split among P, Q, R such that P gets 4 more than Q, and R gets twice as many as P. Let Q = x. Then P = x+4, R = 2(x+4). Sum: x + (x+4) + 2(x+4) = 20 → 4x + 12 = 20 → x = 2. So Q=2, P=6, R=12 (check: 2+6+12=20 ✓)."
          ]
        },
        {
          "heading": "Floor-Based Puzzles",
          "body": "Floor puzzles (people living on numbered floors) work like ranking puzzles but with the added twist of 'above/below' language mapping directly to higher/lower floor numbers — fix the anchor clues first (specific floor, topmost/bottommost), then work outward.",
          "bullets": [
            "Six floors (1=bottom to 6=top), six people A–F. Clues: A is on floor 3; C is on the topmost floor (6); D is immediately below C (floor 5); B is one floor above A (floor 4). That leaves floors 1 and 2 for E and F — genuinely undetermined without a further clue, which is common: not every puzzle resolves every person, and a well-set question only asks about what CAN be determined."
          ]
        },
        {
          "heading": "Box and Position Puzzles",
          "body": "Box or position-in-a-row puzzles (cars in parking slots, boxes on a shelf) follow the same discipline as ranking puzzles: place absolute-position clues first (an exact slot number or 'at an end'), then use relative clues to fill in what remains.",
          "bullets": [
            "5 positions in a row (1 to 5, left to right): Red is at position 3. Blue is immediately right of Red (so Blue=4). Green is at an end (1 or 5). Black is not at an end. White is at position 1. Since White=1, Green (must be an end, and 1 is taken) must be 5. The only non-end slot left, 2, goes to Black. Final: White, Black, Red, Blue, Green."
          ]
        },
        {
          "heading": "Chain Deduction With Conditional (If-Then) Statements",
          "body": "Some puzzles present a chain of conditional statements rather than positions — the technique is to trace the chain forward from whatever fact is confirmed true, applying each 'if-then' link in sequence until you reach the final conclusion.",
          "bullets": [
            "'If it rains, the match is postponed. If the match is postponed, the team practices indoors. It rained today.' Chain: rain → postponed → indoor practice. Conclusion: the team practiced indoors today."
          ]
        },
        {
          "heading": "Time Management for Puzzle Sets",
          "body": "Puzzle sets are usually worth 3-5 questions tied to one setup, so the setup time is amortized across all of them — investing an extra 60-90 seconds to build a correct, complete grid up front is almost always worth it, versus rushing the setup and having to redo work when a contradiction appears midway.",
          "bullets": [
            "If a puzzle takes 3 minutes to set up correctly but then yields 5 quick questions at under 30 seconds each, total time is about 5.5 minutes for 5 marks — far better than guessing at an incomplete or contradictory setup and losing several of those marks."
          ]
        }
      ],
      "commonPitfalls": [
        "Trying to solve a multi-person puzzle mentally without drawing a grid or table, leading to lost track of earlier deductions.",
        "Applying clues in the order they're written instead of applying the most restrictive (absolute-position) clues first.",
        "Misreading 'immediately above/below' as simply 'above/below' (any distance), which allows too many possibilities and causes contradictions later.",
        "Assuming every person/position in a puzzle must be fully determinable — some puzzles genuinely leave 2 people interchangeable if no clue distinguishes them.",
        "Not double-checking a completed grid against every original clue before answering, missing a clue that was overlooked mid-solve.",
        "Spending too little time on setup and guessing at questions once a contradiction appears, instead of re-checking clue placement order."
      ],
      "keyTakeaways": [
        "Always externalize a multi-constraint puzzle into a grid, table, or number line — never solve it purely in your head.",
        "Apply absolute/fixed clues (exact position, 'topmost', 'at an end') before relative clues ('immediately above', 'next to').",
        "'Immediately above/below/left/right' means directly adjacent; plain 'above/below/left/right' allows any distance.",
        "Not every puzzle fully determines every element — some ambiguity between two people can be a legitimate, intended outcome.",
        "For distribution puzzles, assign a variable to the smallest unknown and express the rest algebraically in terms of it.",
        "Invest adequate setup time on puzzle sets — the cost is amortized across several linked questions."
      ],
      "links": [
        {
          "label": "IndiaBix — Logical Reasoning Puzzles",
          "url": "https://www.indiabix.com/logical-reasoning/puzzles/"
        },
        {
          "label": "GeeksforGeeks — Logical Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Seating arrangements",
      "overview": "Seating arrangement questions extend puzzle-solving to a specific, heavily-tested format: linear rows, circular tables, and double rows, each with their own conventions for how 'left', 'right', 'facing', and 'opposite' should be interpreted. The single biggest source of wrong answers is applying linear-row intuition to circular or facing-inward/outward arrangements, where left and right flip depending on which way people face — a mechanical rule, not guesswork, resolves this correctly every time. This sub-module builds a consistent notation and diagramming habit, covers linear arrangements (including counting from left vs right), circular arrangements (facing center vs facing outward), double-row arrangements where two rows face each other, the critical distinction between 'left of' and 'immediately left of,' and how to work through negative ('is not') constraints — all through fully solved examples.",
      "sections": [
        {
          "heading": "Linear Arrangement Basics",
          "body": "In a row of n people, 'kth from the left' and 'kth from the right' refer to different positions unless explicitly stated — position from the right = n − (rank from right) + 1. Always convert to one consistent numbering system before solving.",
          "bullets": [
            "6 people sit in a row, all facing north. B sits 3rd from the left (position 3). E sits 2nd from the right — using position = n−rank+1 = 6−2+1 = 5, E is at position 5. A sits immediately left of B, so A is at position 2."
          ]
        },
        {
          "heading": "Circular Arrangements: Facing Center vs Facing Outward",
          "body": "For people seated facing the CENTER of a circular table, moving clockwise corresponds to a person's LEFT and moving anticlockwise corresponds to their RIGHT — this feels counterintuitive but is the standard convention, and it fully reverses if the people instead face AWAY from the center.",
          "bullets": [
            "6 people sit around a table facing the center, seats numbered 1–6 clockwise. Q is at seat 1. R is opposite Q (3 seats apart in a 6-seat circle) → R is at seat 4. P is immediately to Q's right — since facing center, 'right' = anticlockwise — so P is at seat 6."
          ]
        },
        {
          "heading": "Diagramming Technique",
          "body": "Draw the row or circle as blank slots first, place every absolute-position clue, then work relative clues outward from those anchors — updating the diagram after each deduction (rather than trying to hold intermediate states mentally) prevents the single most common source of seating-arrangement errors: losing track of an earlier placement."
        },
        {
          "heading": "Double Row Arrangements",
          "body": "When two rows face each other (e.g., Row 1 facing south, Row 2 facing north), positions are typically compared using each row's own physical left-to-right numbering, and 'opposite' pairs the same position-numbers across rows — the rows facing each other means viewer-perspective left/right differs between the two rows, so always anchor to physical, not viewer, position numbers.",
          "bullets": [
            "Row 1 (facing south): P, Q, R, S at positions 1–4 (left to right). Row 2 (facing north): W, X, Y, Z, each seated opposite someone in Row 1. W is opposite Q (position 2) → W is in Row 2's position 2. X is opposite S (position 4) → X is in Row 2's position 4. Y and Z occupy positions 1 and 3, order undetermined without a further clue."
          ]
        },
        {
          "heading": "'Left Of' vs 'Immediately Left Of'",
          "body": "'A is to the left of B' only means A is somewhere to B's left (any distance) — it does not fix adjacency. 'A is immediately to the left of B' fixes A directly next to B. Misreading one for the other is the single most common seating-arrangement error and can allow (or wrongly eliminate) many valid arrangements.",
          "bullets": [
            "In a row of 5, 'C is to the left of D' alone allows several arrangements (C could be in position 1, 2, 3, or 4 relative to D anywhere further right). 'C is immediately to the left of D' fixes them as an adjacent CD block, sharply reducing the possibilities."
          ]
        },
        {
          "heading": "Working Through Negative ('Is Not') Constraints",
          "body": "Negative clues ('X is not at an end', 'Y is not adjacent to Z') are best applied AFTER positive clues have narrowed the open slots, since a negative clue only eliminates options rather than fixing a position — applying them too early with too many open slots wastes time checking cases that get resolved anyway by later positive clues.",
          "bullets": [
            "5 seats. H is at an end (seat 1 or 5). F is not at an end and sits exactly in the middle (seat 3). G is not adjacent to F, so G ≠ seat 2 and G ≠ seat 4 → G must be seat 5 (if H=1) or seat 1 (if H=5). This narrows the remaining two people to the two leftover seats."
          ]
        },
        {
          "heading": "Common Traps in Direction-Based Seating",
          "body": "The exact same relative clue ('P is to the right of Q') produces a different physical arrangement depending on whether people face inward or outward, and whether the row faces the reader or faces away — always establish the facing direction from the question stem before applying any left/right clue, and re-derive the convention rather than assuming it matches a previous question's setup."
        }
      ],
      "commonPitfalls": [
        "Applying viewer's left/right instead of the seated person's own left/right when a direction is not explicitly the reader's perspective.",
        "Forgetting that for people facing the CENTER of a circle, clockwise = their left and anticlockwise = their right (reversed for facing outward).",
        "Treating 'X is to the left of Y' as adjacency when only 'immediately to the left' guarantees that.",
        "In double-row arrangements, comparing viewer-perspective positions across the two rows instead of each row's own physical left-to-right numbering.",
        "Applying negative ('is not') constraints before positive/absolute constraints, wasting time on cases that get eliminated anyway.",
        "Not re-deriving the facing convention for each new question, carrying over an assumption from a previous, differently-configured puzzle."
      ],
      "keyTakeaways": [
        "Position from the right in a row of n = n − rank + 1; always convert to one consistent numbering before solving.",
        "Facing the center of a circle: clockwise = left, anticlockwise = right (reversed if facing outward).",
        "'Left/right of' allows any distance; 'immediately left/right of' fixes strict adjacency — never conflate the two.",
        "In double rows facing each other, match physical (not viewer) position numbers across rows for 'opposite' pairs.",
        "Place absolute-position clues on the diagram first, then relative clues, then negative constraints last.",
        "Update a drawn diagram step by step rather than tracking placements mentally."
      ],
      "links": [
        {
          "label": "IndiaBix — Seating Arrangement Questions",
          "url": "https://www.indiabix.com/logical-reasoning/seating-arrangement/"
        },
        {
          "label": "GeeksforGeeks — Logical Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Blood relations",
      "overview": "Blood relation questions test whether a candidate can build and traverse a family tree correctly across generations, often disguised through coded symbols (+, −, ×, ÷ standing for relations) or riddle-style phrasing ('pointing to a photograph...') designed to hide a simple relationship behind confusing wording. The core skill is mechanical, not clever — draw the family tree with a generation-line notation as each clue arrives, and the answer falls out by reading the tree rather than trying to hold the relationship chain in your head. This sub-module covers basic relation-term notation, multi-generation tree building, coded (symbolic) blood relations, the classic gender-ambiguity traps that catch students off guard, complex multi-generation puzzles, a quick-reference relation table, and the well-known 'pointing to a photograph' riddle format, each worked through to a definite answer.",
      "sections": [
        {
          "heading": "Basic Relation Terms and Tree Notation",
          "body": "Build a simple tree using generation levels (older generation on top, younger below) connected by relation labels — this converts a string of stated relations into a visual structure that's easy to read the final answer from, rather than re-deriving the chain from scratch for each question about the same family.",
          "bullets": [
            "'A is B's father. B is C's mother.' Draw A (top) connected down to B, and B connected down to C, with C's gender unspecified. A is C's maternal grandfather (father of C's mother)."
          ]
        },
        {
          "heading": "Generation Tree Building Across Multiple Clues",
          "body": "As clues accumulate, keep adding to the same tree rather than starting a fresh mental calculation for each new statement — most errors happen when a student tries to re-derive earlier relationships from memory instead of reading them off an already-built diagram.",
          "bullets": [
            "'P is Q's mother. R is P's father. S is R's wife.' Tree: R and S (grandparent generation) → P (their child) → Q (P's child). S, being R's wife, is P's mother, making S Q's grandmother (maternal, since P is Q's mother)."
          ]
        },
        {
          "heading": "Coded Blood Relations (Symbol-Based)",
          "body": "Symbol-coded questions define operators (commonly +, −, ×, ÷) for specific relations at the start of the question — translate each symbol into its relation word first, then build the tree exactly as with plain-language clues.",
          "bullets": [
            "Given: A+B means A is B's mother; A−B means A is B's brother; A×B means A is B's father; A÷B means A is B's sister. Evaluate 'P × R + S': P×R means P is R's father. R+S means R is S's mother (so R is female). Combining: P is the father of R, and R is the mother of S — so P is S's maternal grandfather."
          ]
        },
        {
          "heading": "Gender Ambiguity and Classic Traps",
          "body": "Many blood relation riddles hinge on a subtle logical trick rather than a long chain — reading the statement literally and carefully, rather than assuming a 'typical' relationship, is essential.",
          "bullets": [
            "'Pointing to a man, a woman said: \"His mother is the only daughter of my mother.\"' The only daughter of the woman's mother is the woman herself (she has no sisters). So 'his mother' = the woman. The woman is the man's mother."
          ]
        },
        {
          "heading": "Complex Multi-Generation Puzzles",
          "body": "When a question spans three or more generations, build the tree top-down (oldest generation first) and resolve the final relationship by tracing the shortest path between the two people asked about, naming each intermediate relation as you go.",
          "bullets": [
            "'A is the son of B. B is the sister of C. C is the mother of D.' B is C's sister, and C is D's mother, so B is D's (maternal) aunt. A is B's son, so A is D's cousin (specifically, the son of D's maternal aunt)."
          ]
        },
        {
          "heading": "Quick-Reference Relation Chains",
          "body": "Certain compound relations recur constantly and are worth memorizing directly rather than re-deriving each time.",
          "bullets": [
            "Mother's/father's brother = uncle; mother's/father's sister = aunt; uncle's/aunt's child = cousin; spouse's brother = brother-in-law; spouse's sister = sister-in-law; father's father = paternal grandfather; mother's father = maternal grandfather."
          ]
        },
        {
          "heading": "The 'Pointing to a Photograph' Riddle Format",
          "body": "This classic format always describes a relationship of the speaker to a person in a photo, and the trick is almost always in correctly identifying who 'my grandfather's only son' or similar phrases actually refers to — usually the speaker's own father, unless the wording explicitly rules that out.",
          "bullets": [
            "'Pointing to a photograph, a man said: \"She is the daughter of my grandfather's only son.\"' The speaker's grandfather's only son is the speaker's own father (assuming the standard convention that the speaker isn't referring to himself). So 'she' is the speaker's father's daughter — his sister."
          ]
        }
      ],
      "commonPitfalls": [
        "Trying to hold a multi-step relation chain in your head instead of drawing a generation tree as each clue arrives.",
        "Assuming a gender for an ambiguous relation term (e.g., 'sibling', 'cousin', 'child') that the question never actually specifies.",
        "Misreading 'only son'/'only daughter' clues, which are often the key trick identifying the speaker or a specific relative directly.",
        "In coded (symbolic) relation questions, forgetting to first translate every symbol into its relation word before building the tree.",
        "Losing track of which generation level a person belongs to in a 3+ generation puzzle, leading to an off-by-one-generation error.",
        "Assuming 'brother' or 'sister' when the question only established a parent-child or sibling-of-parent relationship without confirming gender."
      ],
      "keyTakeaways": [
        "Always draw a generation-based family tree as clues arrive — never try to resolve blood relations purely mentally.",
        "In coded/symbolic questions, translate every symbol to its relation word first, then build the tree exactly as usual.",
        "'Only son'/'only daughter' clues are almost always the key that identifies a specific person (often the speaker or a parent) precisely.",
        "Memorize the standard compound-relation chains (uncle, aunt, cousin, in-laws, grandparents) to skip re-deriving them each time.",
        "In photograph/riddle-style questions, default to the standard convention that the speaker is describing a relative other than themselves unless stated otherwise.",
        "Trace the shortest path between the two people asked about in a multi-generation tree, naming each link along the way."
      ],
      "links": [
        {
          "label": "IndiaBix — Blood Relation Test",
          "url": "https://www.indiabix.com/logical-reasoning/blood-relation-test/"
        },
        {
          "label": "GeeksforGeeks — Logical Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Syllogisms",
      "overview": "Syllogism questions test formal logical inference using categorical statements — All, No, Some, and Some...not — and whether a proposed conclusion follows NECESSARILY from the given statements, regardless of whether it happens to be true in the real world. The Venn diagram method is the single most reliable technique because it forces you to consider every geometrically possible arrangement of the categories rather than relying on intuition, which frequently fails on syllogisms because they're deliberately designed to trigger plausible-but-invalid conclusions. This sub-module covers the four statement types, the Venn diagram method, the rules of valid conversion between statement types, how to handle 'some' statements with multiple possibility cases, complementary/either-or conclusion pairs, multi-statement chains, and the most common distractor-conclusion patterns that catch students who reason from real-world plausibility instead of strict logical necessity.",
      "sections": [
        {
          "heading": "The Four Categorical Statement Types",
          "body": "Every syllogism statement is one of four types: A (All X are Y — universal affirmative), E (No X is Y — universal negative), I (Some X are Y — particular affirmative), or O (Some X are not Y — particular negative). Correctly classifying each given statement is the first step before any diagram or inference."
        },
        {
          "heading": "The Venn Diagram Method",
          "body": "Draw the categories as circles and test whether the proposed conclusion holds in EVERY valid diagram consistent with the premises — if even one valid diagram breaks the conclusion, it does not follow necessarily.",
          "bullets": [
            "'All cats are animals. All animals are living beings.' Draw cats as a small circle fully inside a larger 'animals' circle, itself fully inside 'living beings.' In every such diagram, cats are also inside living beings — so 'All cats are living beings' is a VALID conclusion."
          ]
        },
        {
          "heading": "Rules of Conversion (Immediate Inference)",
          "body": "Some statement types convert validly to a related form and others don't: 'No A is B' validly converts to 'No B is A'. 'All A are B' does NOT convert to 'All B are A', but does validly convert to the weaker 'Some B is A' (since A is assumed non-empty).",
          "bullets": [
            "'All roses are flowers.' Valid conversion: 'Some flowers are roses.' INVALID conversion: 'All flowers are roses' (there could be flowers that aren't roses)."
          ]
        },
        {
          "heading": "Handling 'Some' Statements: Possibility Cases",
          "body": "Two particular ('I' type, 'Some...') premises never yield a valid conclusion between their end terms, because the shared middle term isn't 'distributed' (fully accounted for) in either premise, leaving the relationship between the end terms genuinely undetermined.",
          "bullets": [
            "'Some doctors are engineers. Some engineers are teachers.' Conclusion 'Some doctors are teachers' does NOT follow — draw two different valid Venn diagrams (one where the doctor-engineers and teacher-engineers overlap, one where they don't) to see the conclusion isn't forced in every case."
          ]
        },
        {
          "heading": "Complementary Pairs and Either-Or Conclusions",
          "body": "When neither of two candidate conclusions (typically an I-type and an E-type statement about the same two terms) follows individually, but the premises guarantee that at least one of them MUST be true, the pair is called complementary and the correct answer is 'either conclusion I or conclusion II follows.'"
        },
        {
          "heading": "Multi-Statement Chains",
          "body": "With three or more linked statements, chain the categories through each 'All' or 'No' relationship step by step — a chain of All-statements preserves full inclusion, and one negative (No) link anywhere in the chain makes the final relationship exclusionary.",
          "bullets": [
            "'All mobiles are gadgets. All gadgets are electronic. No electronic item is cheap.' Chain: mobiles ⊂ gadgets ⊂ electronic, and electronic ∩ cheap = ∅. Therefore mobiles ∩ cheap = ∅ — 'No mobile is cheap' is a VALID conclusion."
          ]
        },
        {
          "heading": "Common Distractor-Conclusion Patterns",
          "body": "The most common trap is assuming 'Some A are not B' implies 'No A is B' — it does not, since some A could still be B even while some are not.",
          "bullets": [
            "'Some students are not girls' does NOT mean 'No student is a girl' — plenty of students could still be girls; the statement only guarantees at least one student who isn't."
          ]
        }
      ],
      "commonPitfalls": [
        "Judging a conclusion by real-world plausibility instead of strict logical necessity across every valid Venn diagram.",
        "Assuming 'All A are B' converts to 'All B are A' — it only validly converts to 'Some B is A'.",
        "Expecting a definite conclusion from two 'Some' (I-type) premises, when in most cases no valid conclusion follows.",
        "Confusing 'Some A are not B' with 'No A is B' — the former allows some A to still be B.",
        "Missing complementary (either-or) conclusion pairs by checking each candidate conclusion only in isolation.",
        "Losing track of which statement type (A/E/I/O) a given sentence maps to before starting the Venn diagram."
      ],
      "keyTakeaways": [
        "Classify every statement as A (All), E (No), I (Some), or O (Some...not) before diagramming.",
        "A conclusion is valid only if it holds in EVERY Venn diagram consistent with the premises, not just the most 'natural' one.",
        "'All A are B' only converts validly to 'Some B is A', never to 'All B are A'.",
        "Two 'Some' (I-type) premises almost never yield a valid conclusion between the end terms.",
        "'Some A are not B' never implies 'No A is B' — this is the single most common syllogism trap.",
        "Check for complementary (either-or) conclusion pairs whenever neither individual conclusion follows on its own."
      ],
      "links": [
        {
          "label": "IndiaBix — Logical Deduction (Syllogism) Questions",
          "url": "https://www.indiabix.com/logical-reasoning/logical-deduction/"
        },
        {
          "label": "GeeksforGeeks — Logical Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Coding-decoding",
      "overview": "Coding-decoding questions establish an artificial rule for transforming letters, numbers, or words, show one worked example of the rule in action, and then ask you to apply (or reverse) that same rule to a new input — the entire skill is pattern extraction from a single example, then mechanical, careful application. Common rule families include letter shifting (Caesar-style), numeric substitution, word-for-word substitution codes, coordinate/grid codes, and mixed patterns where odd and even positions shift differently — and the most common error is applying the discovered rule inconsistently rather than failing to find it. This sub-module works through each rule family with a fully solved example, including how to decode (reverse-apply) a rule, since decoding questions appear just as often as encoding ones and require running the pattern backward.",
      "sections": [
        {
          "heading": "Letter Shifting (Caesar-Style) Codes",
          "body": "The most common coding rule shifts every letter forward or backward by a fixed number of positions in the alphabet — identify the shift from the given example word, then apply the identical shift to the new word.",
          "bullets": [
            "If CAT is coded as DBU, each letter shifted forward by 1 (C→D, A→B, T→U). Using the same rule, DOG codes as: D→E, O→P, G→H → EPH."
          ]
        },
        {
          "heading": "Numeric Substitution Codes",
          "body": "Numeric codes typically assign each letter its alphabetical position (A=1...Z=26) and then apply a further arithmetic operation (doubling, adding a constant) — extract both steps from the example before applying them to the new word.",
          "bullets": [
            "If A=1, B=2, ..., Z=26, and each value is then doubled: CAT → C=3→6, A=1→2, T=20→40. Coded as 6-2-40."
          ]
        },
        {
          "heading": "Word-for-Word Substitution Codes",
          "body": "Some questions code entire sentences, assigning each word an arbitrary code word — the technique is to find words common to two or more coded sentences and match them against the words common to the corresponding plain sentences.",
          "bullets": [
            "'red is blue' is coded 'pa ta la'. 'blue is sky' is coded 'la ta ka'. The word common to both plain sentences is 'is'; the code word common to both coded sentences is 'ta'. So 'ta' means 'is'."
          ]
        },
        {
          "heading": "Matrix (Coordinate/Grid) Codes",
          "body": "Grid-based codes place letters into a numbered row-column matrix, and each letter is represented by its (row, column) coordinate pair — once the grid layout is given or inferred from an example, decoding is a direct lookup."
        },
        {
          "heading": "Decoding: Running the Rule Backward",
          "body": "Decoding questions give you the coded word and the rule (or an example pair) and ask for the original word — apply the inverse operation of whatever the encoding did (shift backward instead of forward, halve instead of double).",
          "bullets": [
            "If EDUCATION is coded as FEVDBUJPO (each letter shifted forward by 1), decode GSJFOE by shifting each letter BACKWARD by 1: G→F, S→R, J→I, F→E, O→N, E→D → FRIEND."
          ]
        },
        {
          "heading": "Symbol-for-Letter Codes",
          "body": "When a question provides a fixed key mapping symbols to letters (e.g., @ = A, # = B, % = C), decoding or encoding is a direct substitution using that key — the only real risk is a careless lookup error under time pressure, so double-check each symbol against the key rather than relying on memory after the first few."
        },
        {
          "heading": "Mixed and Position-Dependent Patterns",
          "body": "The hardest coding questions apply different rules to different positions in a word (e.g., letters in odd positions shift +1, letters in even positions shift −1) — identify this by checking whether a single uniform shift explains the given example; if it doesn't fit cleanly, test position-dependent rules next.",
          "bullets": [
            "If a single shift doesn't explain a given example word consistently across all letters, check whether odd-position letters and even-position letters are shifting by different amounts — a common design for higher-difficulty coding questions."
          ]
        }
      ],
      "commonPitfalls": [
        "Applying an inconsistent shift value across the letters of a word instead of double-checking the SAME shift explains every letter in the given example first.",
        "Forgetting to reverse the operation (shift backward, halve instead of double) when a question asks you to decode rather than encode.",
        "In word-substitution codes, matching the wrong pair of words between two coded sentences instead of finding the genuinely common word.",
        "Assuming a single uniform rule when the pattern is actually position-dependent (different rule for odd vs even letter positions).",
        "Misreading the alphabet position of a letter near the end (like X, Y, Z) and wrapping around incorrectly without checking whether the rule intends wrap-around at all.",
        "Not verifying the discovered rule against the FULL given example word before applying it to the new word, missing a rule that only partially fits."
      ],
      "keyTakeaways": [
        "Extract the coding rule strictly from the given example — verify it explains every letter/element before applying it elsewhere.",
        "Decoding is simply running the encoding rule in reverse (shift backward instead of forward, halve instead of double).",
        "In sentence/word-substitution codes, match the word common to two plain sentences against the code word common to their coded versions.",
        "If a uniform shift doesn't fit the example cleanly, test position-dependent (odd/even) rules next.",
        "Numeric letter codes usually combine an alphabet-position step (A=1...Z=26) with a further arithmetic operation — identify both separately.",
        "Double-check symbol/grid lookups against the given key each time rather than relying on memory partway through."
      ],
      "links": [
        {
          "label": "IndiaBix — Coding-Decoding Questions",
          "url": "https://www.indiabix.com/logical-reasoning/coding-decoding/"
        },
        {
          "label": "GeeksforGeeks — Logical Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Direction Sense",
      "overview": "Direction sense questions trace a person or object moving through a sequence of straight-line movements and turns, then ask for the final direction from the start, the shortest distance back to the start, or the direction of one point relative to another. The entire topic reduces to one skill: plotting each movement on an imaginary (or actually drawn) compass grid, with North up, East right, South down, West left, and correctly applying what 'left turn' and 'right turn' mean relative to the direction currently being faced — not relative to the compass. Most errors come from skipping the diagram and trying to track direction changes mentally, which falls apart after 3-4 turns. This sub-module covers compass basics and turn rules, net-displacement and the Pythagorean shortest-distance shortcut, shadow-based direction problems, clock-hand direction problems, multi-turn path tracing, and how to read final relative-direction questions (e.g., 'in which direction is the person from the starting point') off a completed diagram.",
      "sections": [
        {
          "heading": "Compass Basics and Turn Rules",
          "body": "Fix North as up, South as down, East as right, West as left on your diagram. A RIGHT turn rotates your facing direction 90° clockwise from whatever you currently face; a LEFT turn rotates it 90° anticlockwise. Crucially, 'left' and 'right' are always relative to the direction the person is CURRENTLY facing, not fixed compass directions — someone facing South who turns 'left' ends up facing East, not West.",
          "bullets": [
            "A person starts facing North, turns right (now facing East), then turns right again (now facing South). Two successive right turns from North always land you facing South — a useful shortcut: two rights = a 180° reversal, four rights (or four lefts) return you to the original facing."
          ]
        },
        {
          "heading": "Plotting Movements and Net Displacement",
          "body": "Treat each straight-line movement as a vector in the current facing direction and plot it step by step on a simple x-y grid (East/West = x-axis, North/South = y-axis), keeping a running (x, y) coordinate from the start. The final answer to 'how far and in which direction from the start' is read directly off this final coordinate.",
          "bullets": [
            "A man walks 3 km North, then 4 km East. Plot: start (0,0) → after North leg (0,3) → after East leg (4,3). He is now 4 km East and 3 km North of the start. Straight-line distance from start = √(3²+4²) = √25 = 5 km (Pythagorean shortcut, since the two legs are perpendicular)."
          ]
        },
        {
          "heading": "The Pythagorean Shortest-Distance Shortcut",
          "body": "Whenever the net East-West displacement and net North-South displacement are both non-zero, the straight-line ('shortest distance' or 'as the crow flies') distance from start to end is the hypotenuse of a right triangle formed by those two net displacements — always collapse a multi-leg path down to just its net East-West and net North-South totals before applying this, rather than trying to compute distance leg by leg.",
          "bullets": [
            "A man walks 6 km East, 8 km South, 6 km West. Net East-West: 6 East − 6 West = 0. Net North-South: 8 South. So he ends up exactly 8 km South of the start — the two equal East and West legs cancel out, and the shortest distance is simply 8 km (no Pythagorean step needed since one net component is zero)."
          ]
        },
        {
          "heading": "Shadow-Based Direction Problems",
          "body": "These rely on one fixed fact: in the morning, the sun rises in the East, so a person's shadow falls toward the West (behind them, opposite the sun); in the evening, the sun is in the West, so the shadow falls toward the East. Establish the time of day from the question stem first, since it fully determines the shadow's direction.",
          "bullets": [
            "'In the morning, Raj's shadow falls exactly behind Suresh.' Morning shadows point West, so Suresh is standing to the West of Raj (the shadow falls in the direction away from the sun, i.e., West, landing on/behind Suresh) — meaning Suresh is West of Raj."
          ]
        },
        {
          "heading": "Clock-Hand Direction Problems",
          "body": "Some direction questions use a clock face as a compass proxy: at 12 the minute/hour hand points 'North' (or another stated direction), and the question asks which direction the hour hand points at a different time, using the fact that a clock face is divided into 12 equal 30° sectors.",
          "bullets": [
            "At 12 o'clock, the hour hand points North. What direction does it point at 6 o'clock? The hour hand has moved exactly halfway around the 12-hour face (6 hours = 180°), so it now points South (directly opposite North)."
          ]
        },
        {
          "heading": "Multi-Turn Path Tracing",
          "body": "For paths with 4 or more turns, the diagram is not optional — draw each leg with its length labeled, and mark the facing direction after every turn using the two-rights/two-lefts = reversal shortcut to catch arithmetic slips as you go, since a single missed turn direction compounds into a completely wrong final position.",
          "bullets": [
            "Starting facing East: turn right (facing South), walk 5 km; turn right (facing West), walk 5 km; turn right (facing North), walk 5 km. Three consecutive right turns from East land you facing North, and since each leg is equal length, this traces three sides of a square — the person now stands directly North of a point 5 km West of the start, i.e., diagonally related to the original position along the fourth, unwalked side."
          ]
        },
        {
          "heading": "Reading Final Relative-Direction Questions",
          "body": "Once the final (x, y) coordinate relative to the start is known, reading off the compass direction is a direct lookup: positive x = East, negative x = West, positive y = North, negative y = South, and a point with both a non-zero x and y component lies in an intercardinal direction (e.g., North-East, South-West) — state it as such rather than only giving distance."
        }
      ],
      "commonPitfalls": [
        "Treating 'left' and 'right' turns as fixed compass directions instead of relative to the direction currently being faced.",
        "Skipping the diagram for a 3+ turn path and trying to track the final facing direction mentally.",
        "Applying the Pythagorean shortcut directly to multi-leg distances without first collapsing the path to net East-West and net North-South displacement.",
        "Getting the shadow direction backward — forgetting that a morning shadow points West (away from the Eastern sunrise), not toward it.",
        "Forgetting that two successive turns in the same rotational direction (left-left or right-right) always produce a 180° reversal, and re-deriving it the long way each time.",
        "Confusing 'distance traveled' (sum of all leg lengths) with 'shortest distance from start' (the straight-line hypotenuse), which the question usually asks for.",
        "Losing track of sign (positive/negative) on the x-y grid when a later leg reverses an earlier one, undercounting net displacement."
      ],
      "keyTakeaways": [
        "Always plot movements on an (x, y) grid: East/West on the x-axis, North/South on the y-axis, tracking net displacement.",
        "Left and right turns rotate the CURRENT facing direction 90°; they are never fixed compass directions.",
        "Two consecutive same-direction turns (left-left or right-right) always produce a 180° reversal — a fast shortcut for multi-turn paths.",
        "Shortest distance from start = √(net East-West² + net North-South²) — only after collapsing the full path to net components.",
        "Morning shadows point West; evening shadows point East — this single fact resolves nearly all shadow-based direction questions.",
        "'Total distance walked' and 'shortest distance from start' are different quantities — check which one the question is actually asking for."
      ],
      "links": [
        {
          "label": "IndiaBix — Direction Sense Test",
          "url": "https://www.indiabix.com/logical-reasoning/direction-sense-test/"
        },
        {
          "label": "GeeksforGeeks — Direction Sense Test Questions",
          "url": "https://www.geeksforgeeks.org/direction-sense-test-reasoning-questions/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Ranking & Ordering",
      "overview": "Ranking and ordering questions establish a linear order among people or items (by rank in class, height, age, marks, or arrival order) using a mix of absolute positions, relative comparisons, and 'from-both-ends' clues, then ask for a specific rank, a total count, or a comparison between two people. Unlike full seating puzzles, these are usually solvable with a couple of core formulas plus careful bookkeeping of who is compared to whom, rather than a full grid. The two recurring skills are converting between 'rank from top' and 'rank from bottom' using the total-count formula, and correctly chaining comparative statements ('taller than', 'scored more than') into a single ordered list. This sub-module covers the from-both-ends formula, total-count-from-two-ranks problems, chaining comparative clues, handling ties and 'just above/below' language, combining ranking with numeric gaps, and common group/sub-group ranking scenarios.",
      "sections": [
        {
          "heading": "The From-Both-Ends Formula",
          "body": "For a person ranked at position R from the top in a group of total size N, their rank from the bottom is (N − R + 1). This single formula underlies almost every 'rank from top vs rank from bottom' question, and the safest approach is to always convert every given rank to 'rank from top' before comparing people, so you're never mixing two different reference directions.",
          "bullets": [
            "In a class of 40 students, Meena is ranked 12th from the top. Her rank from the bottom = 40 − 12 + 1 = 29th. Conversely, if a rank from the bottom is given as 29th, rank from top = 40 − 29 + 1 = 12th — the formula is symmetric."
          ]
        },
        {
          "heading": "Finding Total Count From Two Given Ranks",
          "body": "When a single person's rank from the top and rank from the bottom are BOTH given, the total group size is found with N = (rank from top) + (rank from bottom) − 1, since that person is counted once but appears in both counts.",
          "bullets": [
            "Arjun is 15th from the top and 22nd from the bottom in his class. Total students = 15 + 22 − 1 = 36. (The '−1' avoids double-counting Arjun himself, who is included in both the 15 counted from the top and the 22 counted from the bottom.)"
          ]
        },
        {
          "heading": "Counting Between Two Ranked People",
          "body": "To find how many people lie strictly between two people whose ranks (measured the same direction) are known, subtract the ranks and subtract 1 more to exclude both endpoints.",
          "bullets": [
            "P is 8th from the top and Q is 19th from the top (same class, same direction). Number of people strictly between them = 19 − 8 − 1 = 10."
          ]
        },
        {
          "heading": "Chaining Comparative Clues Into a Single Order",
          "body": "When clues compare pairs ('A scored more than B', 'C is taller than A but shorter than D'), build a single ordered list incrementally, inserting each new person relative to the ones already placed rather than tracking pairwise comparisons separately — a person mentioned in multiple clues acts as the anchor connecting different parts of the chain.",
          "bullets": [
            "'B scored more than A. C scored more than B but less than D. E scored less than A.' Chain from highest to lowest: D > C > B > A > E. (D is highest since C < D and C > B > A > E places everyone below C except D.)"
          ]
        },
        {
          "heading": "Handling Ties and 'Just Above/Below' Language",
          "body": "'Just above' or 'immediately above' in rank means adjacent rank (no gap), exactly like 'immediately left of' in seating puzzles — a plain 'above' or 'better than' allows any gap. When a question explicitly allows ties (two people sharing a rank), treat rank as a set-based count rather than assuming every rank number is used exactly once.",
          "bullets": [
            "'Rita is ranked immediately above Sam. Sam is 14th.' Since 'immediately above' means adjacent with no gap, Rita is ranked 13th (one position better, i.e., numerically lower, than 14th)."
          ]
        },
        {
          "heading": "Ranking Combined With Numeric Gaps",
          "body": "Some questions give a numeric gap between ranks rather than 'immediately above' — e.g., 'there are 5 people between X and Y' — which must be converted to a rank difference of 6 (5 people between plus 1 for X or Y's own position) before use in the from-both-ends or total-count formulas.",
          "bullets": [
            "'There are 5 people between X (ranked 10th from the top) and Y.' If Y is below X, Y's rank = 10 + 5 + 1 = 16th from the top (5 people in between, plus Y's own next position)."
          ]
        },
        {
          "heading": "Sub-Group Ranking Scenarios",
          "body": "When a rank is given within a sub-group (e.g., 'rank among boys') as well as an overall rank, keep the two rank systems clearly separate on paper — do not mix a sub-group rank into an overall-group formula, since they are counted against different total sizes."
        }
      ],
      "commonPitfalls": [
        "Mixing 'rank from top' and 'rank from bottom' values in the same calculation without converting them to one common direction first.",
        "Forgetting the '−1' correction when computing total group size from a person's two given ranks (from top and from bottom).",
        "Treating 'above' or 'better than' as adjacency when only 'immediately above/below' guarantees no gap between ranks.",
        "Miscounting 'people between two ranks' by forgetting to subtract 1 to exclude the two endpoint ranks themselves.",
        "Converting a 'number of people between X and Y' clue into a rank difference without adding 1 for the endpoint's own position.",
        "Confusing an overall-group rank with a sub-group rank (e.g., rank among boys vs rank in the whole class) and applying one formula to both.",
        "Building a comparative order clue by clue without anchoring around a person common to multiple clues, causing the chain to fragment."
      ],
      "keyTakeaways": [
        "Rank from bottom = N − (rank from top) + 1, where N is the total group size — the single formula behind most ranking questions.",
        "When both ranks (top and bottom) for one person are given, total count N = rank-from-top + rank-from-bottom − 1.",
        "People strictly between two same-direction ranks = (higher rank number) − (lower rank number) − 1.",
        "'Immediately above/below' means adjacent rank (no gap); plain 'above/below' allows any gap — never conflate the two.",
        "Convert 'X people between A and B' to a rank difference of X + 1 before plugging into any formula.",
        "Keep sub-group ranks (e.g., among boys) and overall-group ranks in clearly separate systems — never combine them directly."
      ],
      "links": [
        {
          "label": "IndiaBix — Ranking Test",
          "url": "https://www.indiabix.com/logical-reasoning/ranking-test/"
        },
        {
          "label": "GeeksforGeeks — Logical Reasoning Questions and Answers",
          "url": "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Data Sufficiency",
      "overview": "Data sufficiency questions present a question and two (sometimes three) numbered statements, and ask NOT for the answer to the question but whether the given statement(s) provide ENOUGH information to answer it definitively — a subtle but critical shift in what's being evaluated. The standard answer choices test each statement's sufficiency independently before considering them together: statement I alone is sufficient; statement II alone is sufficient; both together are needed but neither alone suffices; either alone is sufficient; or the statements together are still not sufficient. The single biggest mistake candidates make is actually solving the underlying question using outside assumptions or 'typical' values instead of strictly checking whether the given information pins down one unique answer. This sub-module covers the standard answer-choice format, the correct testing order, numeric sufficiency examples, geometry-style sufficiency, combining statements, and the classic trap of assuming unstated 'reasonable' values.",
      "sections": [
        {
          "heading": "The Standard Answer-Choice Format",
          "body": "Nearly all data sufficiency questions use a fixed answer template: (A) Statement I alone is sufficient, but II alone is not; (B) Statement II alone is sufficient, but I alone is not; (C) Both statements together are sufficient, but neither alone is; (D) Either statement alone is sufficient; (E) Even both statements together are not sufficient. Memorizing this exact structure lets you fill in a small A/B/C/D/E truth table as you test each statement, rather than reasoning about sufficiency from scratch each time."
        },
        {
          "heading": "The Correct Testing Order: Independence First",
          "body": "ALWAYS test Statement I completely alone (as if Statement II didn't exist), then test Statement II completely alone (as if Statement I didn't exist), and only THEN, if neither alone suffices, test them together — testing them together first is the most common procedural error, since it can make an insufficient single statement look sufficient by borrowing information it isn't entitled to use alone.",
          "bullets": [
            "Question: 'What is the value of x?' Statement I: 'x is a positive integer less than 3.' Statement II: 'x is an even number.' Statement I alone: x could be 1 or 2 — not sufficient (two possible values). Statement II alone: x could be any even number — not sufficient. Together: x is a positive integer less than 3 AND even → x = 2 uniquely. Answer: (C), both together are sufficient, but neither alone is."
          ]
        },
        {
          "heading": "Numeric Sufficiency: One Unique Value vs a Range",
          "body": "A statement is sufficient only if it narrows the answer to exactly ONE possible value (for a 'what is the value of' question) or definitively resolves a yes/no question in every case it allows — a statement that narrows the range but still leaves 2 or more valid possibilities is NOT sufficient, even if it feels close.",
          "bullets": [
            "Question: 'Is n an even number?' Statement I: 'n is divisible by 4.' Every multiple of 4 is even, so this ALWAYS answers 'yes' — sufficient, even though it doesn't tell you the exact value of n. A yes/no data sufficiency question only needs a definitive yes or definitive no in every case, not a unique numeric value."
          ]
        },
        {
          "heading": "Geometry-Style Sufficiency",
          "body": "For geometry questions ('what is the area of the triangle'), a statement is sufficient only if it pins down enough independent measurements or relationships to compute a single numeric answer — a statement establishing a shape is 'right-angled' without giving any side lengths, for instance, narrows the shape but does not by itself yield a numeric area.",
          "bullets": [
            "Question: 'What is the area of rectangle ABCD?' Statement I: 'The length is 8.' Not sufficient alone (no width). Statement II: 'The perimeter is 28.' Not sufficient alone (perimeter alone doesn't fix both length and width uniquely without more). Together: length = 8, perimeter = 2(8+width) = 28 → width = 6, area = 48. Answer: (C)."
          ]
        },
        {
          "heading": "Recognizing 'Either Statement Alone Is Sufficient' (D)",
          "body": "Answer (D) applies when Statement I ALONE is enough to answer the question definitively, AND Statement II ALONE is also independently enough — these are two separate, self-contained sufficiency checks, not a case where the two statements say the same thing (they might use entirely different facts and both still work).",
          "bullets": [
            "Question: 'Is x positive?' Statement I: 'x² = 9 and x is odd' (this alone forces x = 3, since −3 is odd too — wait, need x>0 test: actually if x is odd and x²=9, x=3 or x=−3, both odd, so NOT sufficient alone). A cleaner example: Statement I: 'x = 5.' Statement II: 'x − 2 = 3.' Each alone fully determines x = 5, hence positive — answer (D)."
          ]
        },
        {
          "heading": "Combining Statements Correctly (C) vs Neither Sufficing (E)",
          "body": "Only move to 'combine both' after confirming each fails alone. When combined, check whether the intersection of what each statement allows narrows to exactly one answer (→ C) or still leaves more than one possibility even together (→ E) — E is a valid, common answer, and questions deliberately include it as a trap for candidates who assume combining always helps.",
          "bullets": [
            "Question: 'What is the value of xy?' Statement I: 'x = 4.' Statement II: 'y > 0.' Statement I alone: y unknown, not sufficient. Statement II alone: x unknown, not sufficient. Together: x=4, y is any positive number — xy could be 4, 8, 40, anything positive. Still not a single value. Answer: (E)."
          ]
        },
        {
          "heading": "The Trap of Assuming 'Reasonable' Outside Values",
          "body": "Data sufficiency strictly forbids using any information not explicitly given or standard mathematical/logical fact — assuming a 'typical' age, a 'usual' number of children, or that a variable is a positive integer when this isn't stated, are all invalid shortcuts that produce a wrong sufficiency verdict; if the statement doesn't restrict a variable's sign, parity, or type, all valid possibilities must be considered, including negative numbers, fractions, and zero where applicable."
        }
      ],
      "commonPitfalls": [
        "Testing the two statements together before checking each one completely alone, which can make an insufficient statement look sufficient.",
        "Actually solving for the answer to the underlying question using outside 'reasonable' assumptions, instead of strictly checking sufficiency.",
        "Assuming a variable must be a positive integer when the statement never restricts its sign, parity, or type.",
        "Treating a yes/no question as needing a unique numeric value, when a statement that guarantees a definitive yes (or definitive no) in every case is already sufficient.",
        "Selecting (C) reflexively whenever neither statement works alone, without checking whether combining them still leaves multiple possible answers (which would be (E)).",
        "Confusing (D) — each statement independently sufficient — with statements that merely restate the same fact in different words.",
        "Forgetting to check that a geometry statement fixes ALL required independent measurements, not just some of them, before calling it sufficient."
      ],
      "keyTakeaways": [
        "Data sufficiency asks whether the information is ENOUGH to answer definitively — never actually 'solve' using outside assumptions.",
        "Always test Statement I alone, then Statement II alone, and only combine them if both fail individually.",
        "For yes/no questions, a statement is sufficient if it guarantees the SAME answer (always yes, or always no) in every allowed case.",
        "For 'what is the value' questions, sufficiency means narrowing to exactly one possible value — a narrowed range with 2+ values is still insufficient.",
        "(E) — not sufficient even together — is a legitimate, commonly correct answer; don't assume combining statements always resolves the question.",
        "Never assume unstated properties (positive, integer, even) about a variable unless the statement or standard convention explicitly establishes it."
      ],
      "links": [
        {
          "label": "IndiaBix — Data Sufficiency Questions",
          "url": "https://www.indiabix.com/logical-reasoning/data-sufficiency/"
        },
        {
          "label": "GeeksforGeeks — Data Sufficiency",
          "url": "https://www.geeksforgeeks.org/data-sufficiency-aptitude-questions/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Statements & Assumptions",
      "overview": "Statements-and-assumptions questions give a statement (often an advertisement, policy announcement, or argument) followed by one or more numbered assumptions, and ask which assumption is 'implicit' — that is, a belief the speaker MUST take for granted for the statement to make sense, even though it isn't written down. An assumption is not just any true or plausible-sounding fact; it must be something the argument genuinely DEPENDS on, such that if it were false, the statement would fall apart or make no sense. The standard test for this is the negation test: negate the candidate assumption and check whether the original statement is weakened or becomes illogical — if the statement stays perfectly reasonable even under the negation, that candidate was never a true assumption. This sub-module covers the definition and negation test, distinguishing assumptions from restatements and general knowledge, common assumption patterns in advertisements and notices, and several fully worked question sets.",
      "sections": [
        {
          "heading": "What Counts as an Implicit Assumption",
          "body": "An assumption is an UNSTATED premise that the statement's speaker must believe to be true for their statement, suggestion, or action to be logically sound — it is not something explicitly said (that would just be a stated fact) and not something the statement merely implies as a conclusion (that would be an inference). The assumption sits BEHIND the statement, propping it up.",
          "bullets": [
            "Statement: 'Buy brand X toothpaste — recommended by dentists.' Implicit assumption: 'At least some customers trust dentist recommendations when choosing a toothpaste.' Without this belief, citing a dentist recommendation as a selling point would make no sense as an advertising strategy."
          ]
        },
        {
          "heading": "The Negation Test",
          "body": "To verify whether a candidate is a genuine assumption, negate it (assume it is FALSE) and re-read the original statement — if the statement now seems pointless, illogical, or self-contradictory, the candidate WAS a necessary assumption. If the statement still makes perfect sense even with the candidate negated, that candidate was never actually assumed.",
          "bullets": [
            "Statement: 'The school has decided to introduce a bus service so that students living far away can attend regularly.' Candidate assumption: 'Some students currently face difficulty attending due to distance.' Negate it: 'No students face difficulty due to distance' — under this negation, introducing a bus service for that reason makes no sense. So the candidate IS a valid assumption (it passes the negation test)."
          ]
        },
        {
          "heading": "Assumptions vs Restatements and General Knowledge",
          "body": "A common wrong-answer trap restates a fact already given in the statement (not an assumption, since it's already explicit) or cites a general truth about the world that the argument doesn't actually rely on — the negation test catches both: negating a restatement usually directly contradicts the given statement (making it look 'too obviously true' to be the intended trap), while negating an unrelated general truth leaves the original statement completely unaffected.",
          "bullets": [
            "Statement: 'Enrollment in the evening batch has doubled this year, so the institute plans to open a second evening batch.' Candidate: 'Evening batches are generally popular with working professionals' (general knowledge, not something this specific decision depends on) — negate it: even if evening batches weren't generally popular, THIS institute's doubled enrollment alone still justifies opening a second batch. So this candidate is NOT a necessary assumption, despite sounding plausible."
          ]
        },
        {
          "heading": "Common Assumption Patterns in Advertisements",
          "body": "Advertisements almost always assume that (a) at least some portion of the target audience will be influenced by the specific claim being made, and (b) the feature being advertised is something the audience doesn't already universally have or know — these two patterns cover a large fraction of advertisement-based assumption questions.",
          "bullets": [
            "Ad: '50% extra free, only this month!' Assumption: 'At least some customers are motivated to buy more when offered a limited-time quantity bonus.' (Not an assumption: 'All customers are motivated by discounts' — 'all' is too strong; ads only need SOME customers to respond, so an 'all'-worded option usually overstates the necessary assumption.)"
          ]
        },
        {
          "heading": "Common Assumption Patterns in Policy/Notice Statements",
          "body": "Notices and policy statements ('The library will now close at 6 PM instead of 8 PM') typically assume that the new arrangement is feasible/implementable and that it will not defeat the very purpose the institution serves — checking whether the assumption is about FEASIBILITY (can this actually be done) or about the stated goal not being undermined is a fast way to categorize the assumption.",
          "bullets": [
            "Notice: 'All employees must swipe their ID cards to enter the office from Monday.' Assumption: 'ID card swipe machines are available and functioning for all employees' — without this being true, the policy as stated couldn't actually be carried out."
          ]
        },
        {
          "heading": "Multiple-Assumption Questions (I and II)",
          "body": "When two numbered assumptions are given and the answer choices ask whether 'only I', 'only II', 'both', or 'neither' is implicit, apply the negation test to each INDEPENDENTLY — do not let your judgment on one assumption bias your reading of the other, since it's common for exactly one of the two to pass and the other to be a plausible-sounding overreach.",
          "bullets": [
            "Statement: 'Company X has asked all its employees to work from home twice a week to reduce office costs.' Assumption I: 'Employees have the infrastructure (internet, workspace) to work from home.' Assumption II: 'Employees prefer working from home over the office.' Negate I: if employees had no home infrastructure, the policy couldn't function — I is a valid assumption. Negate II: even if employees didn't prefer it, the company could still mandate it for cost reasons — II is NOT necessary. Answer: only I is implicit."
          ]
        },
        {
          "heading": "Working Through a Full Example",
          "body": "Combine the negation test with a check for overly strong ('all', 'always', 'only') wording, since assumption questions frequently offer a correctly-themed but too-strongly-worded distractor alongside the correctly-scoped answer.",
          "bullets": [
            "Statement: 'Please switch off the lights when leaving the room to save electricity.' Assumption A: 'Lights left on consume electricity unnecessarily.' Assumption B: 'Everyone who reads this notice will always comply.' A passes the negation test (if lights didn't consume extra electricity when left on, the notice would be pointless). B fails — the notice doesn't depend on 100% compliance to make sense as a request; it's a reasonable hope, not a load-bearing assumption. Answer: A only."
          ]
        }
      ],
      "commonPitfalls": [
        "Treating a widely-held but unstated belief as an assumption when the argument doesn't actually depend on it (it passes as 'plausible' but fails the negation test).",
        "Selecting an option that merely restates a fact already given in the statement instead of identifying a genuinely implicit, unstated premise.",
        "Choosing an assumption worded with 'all/always/only/never' when the statement only requires a weaker, partial version of that belief to hold.",
        "Skipping the negation test and instead judging assumptions by gut feel, which is unreliable on deliberately similar-sounding answer choices.",
        "Confusing an assumption (something believed to make the statement work) with a conclusion or inference (something that follows FROM the statement).",
        "Assuming general world knowledge is automatically a valid assumption, even when the specific argument doesn't actually rely on that general fact.",
        "Letting judgment on one numbered assumption (I) bias the independent negation test applied to another (II) in the same question."
      ],
      "keyTakeaways": [
        "An assumption is an unstated belief the statement DEPENDS on — not a restated fact, not general knowledge, and not a conclusion drawn from the statement.",
        "Apply the negation test: if negating the candidate makes the original statement illogical or pointless, it IS a valid assumption.",
        "Advertisements typically assume only that SOME of the audience will respond to the claim — reject options overstated with 'all' or 'every'.",
        "Policy/notice statements typically assume either feasibility of implementation or that the goal isn't undermined — categorize the assumption accordingly.",
        "In multi-assumption (I/II) questions, apply the negation test to each option completely independently.",
        "Prefer the more narrowly and weakly worded assumption over a stronger one when both pass the negation test — arguments usually need only the minimal belief."
      ],
      "links": [
        {
          "label": "IndiaBix — Statement and Assumption",
          "url": "https://www.indiabix.com/logical-reasoning/statement-and-assumption/"
        },
        {
          "label": "GeeksforGeeks — Statement and Assumption",
          "url": "https://www.geeksforgeeks.org/statement-and-assumption/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Statements & Conclusions",
      "overview": "Statements-and-conclusions questions give one or more factual statements and one or more numbered conclusions, asking whether each conclusion 'follows' logically and necessarily from the statement(s) alone — using ONLY the information given, never outside knowledge, personal opinion, or real-world plausibility. This is the same strict-necessity discipline used in syllogisms, but applied to plain-language factual statements rather than formal All/No/Some categories, and it frequently trips up candidates who let real-world knowledge override what the statement actually says. The standard answer format asks whether only conclusion I follows, only II, both, either, or neither. This sub-module covers the core 'follows strictly from the given data' rule, the distinction between a conclusion and an assumption, handling numerical/comparative statements, either-or (complementary) conclusion pairs, multi-statement combinations, and the classic trap of conclusions that are true in reality but not derivable from the statement as written.",
      "sections": [
        {
          "heading": "The Core Rule: Follows Strictly From Given Data Only",
          "body": "A conclusion 'follows' only if it can be derived using nothing but the words of the statement(s) plus basic logic — real-world truth, common sense, or outside facts about the subject matter are irrelevant and must be deliberately set aside, even when a conclusion happens to also be true in reality.",
          "bullets": [
            "Statement: 'All the mangoes in this basket are ripe.' Conclusion: 'The mangoes in this basket are sweet.' Even though ripe mangoes are usually sweet in real life, the statement never mentions sweetness — this conclusion does NOT follow from the given statement alone."
          ]
        },
        {
          "heading": "Conclusion vs Assumption: The Key Difference",
          "body": "A conclusion is derived by moving FORWARD from the statement (what can we validly infer), while an assumption is something that must be true BEHIND the statement for it to make sense in the first place (see the Statements & Assumptions sub-module) — a conclusion restates or logically extends given information, whereas an assumption fills a gap the statement leaves silent.",
          "bullets": [
            "Statement: 'Ravi always carries an umbrella when it rains.' Valid conclusion: 'If it is raining and Ravi is outside, he likely has an umbrella with him' (a direct extension). This is different from an assumption like 'Ravi owns an umbrella,' which the statement takes for granted rather than concludes."
          ]
        },
        {
          "heading": "Numerical and Comparative Statement Conclusions",
          "body": "When statements give numeric or comparative facts, a conclusion follows only if it's a direct, unavoidable consequence of the given numbers — a conclusion requiring an extra numeric assumption (like an average, a 'most likely' value, or an unstated total) does not strictly follow.",
          "bullets": [
            "Statement: 'There are 30 students in a class; 18 are girls.' Conclusion: 'There are 12 boys in the class.' This DOES follow strictly (30 − 18 = 12, pure arithmetic on given numbers). Conclusion: 'More girls than boys attended a recent trip.' This does NOT follow — attendance at a trip is never mentioned."
          ]
        },
        {
          "heading": "Either-Or (Complementary) Conclusion Pairs",
          "body": "Just as in syllogisms, when neither of two conclusions follows individually, but the statement guarantees that at least one of the two possibilities MUST be true (they're mutually exclusive and jointly exhaustive given the statement), the correct answer is 'either I or II follows.'",
          "bullets": [
            "Statement: 'Either the train is late, or it has already departed.' Conclusion I: 'The train is late.' Conclusion II: 'The train has already departed.' Neither follows individually (we don't know which), but the statement guarantees one of the two is true — so 'either I or II follows' is correct."
          ]
        },
        {
          "heading": "Multi-Statement Combinations",
          "body": "When multiple statements are given together, a conclusion may follow from combining them even if it doesn't follow from any single statement alone — check whether the conclusion can be chained through the statements the same way a multi-step syllogism chain works, using each statement as one link.",
          "bullets": [
            "Statement 1: 'All members of the committee are professors.' Statement 2: 'Dr. Rao is a member of the committee.' Conclusion: 'Dr. Rao is a professor.' This follows validly by chaining: Dr. Rao ∈ committee (statement 2), committee ⊂ professors (statement 1), therefore Dr. Rao ∈ professors."
          ]
        },
        {
          "heading": "The Classic Trap: True in Reality, But Not Derivable",
          "body": "The single most common wrong answer selects a conclusion that's plausible or factually true in the real world but isn't actually supported by the specific wording of the given statement — always re-read the statement's exact wording before confirming a conclusion, checking specifically whether the conclusion introduces any claim, comparison, or category the statement never made.",
          "bullets": [
            "Statement: 'The new policy has reduced traffic accidents in the city by 20% this year.' Conclusion: 'The new policy is effective at improving road safety.' This sounds obviously true, but strictly, the statement only reports a correlation (accidents dropped after the policy) — it doesn't state the policy CAUSED the drop, so a strict-conclusion question may correctly judge this as not following, depending on how narrowly 'effective' is being tested."
          ]
        }
      ],
      "commonPitfalls": [
        "Judging a conclusion by whether it sounds true in real life instead of whether it's strictly derivable from the statement's own wording.",
        "Confusing a conclusion (forward inference from the statement) with an assumption (unstated premise behind the statement).",
        "Introducing an extra unstated numeric assumption (like an average or 'most') when only exact given numbers support a conclusion.",
        "Missing an either-or (complementary) conclusion pair by evaluating each candidate conclusion only in isolation.",
        "Failing to chain multiple given statements together when a conclusion only follows from combining them, not from either statement alone.",
        "Accepting a causal conclusion ('X caused Y') when the statement only supports a correlational or sequential fact.",
        "Overlooking that a conclusion restating the statement in different words still 'follows' — rejecting it for sounding 'too obvious.'"
      ],
      "keyTakeaways": [
        "A conclusion must follow STRICTLY from the given statement's wording alone — real-world plausibility is irrelevant and must be set aside.",
        "Conclusions move forward from the statement (inference); assumptions sit behind it (unstated premise) — never conflate the two.",
        "Numeric conclusions must be exact, direct consequences of given numbers — no averages, estimates, or unstated totals allowed.",
        "Check for either-or (complementary) conclusion pairs whenever two candidates are mutually exclusive and together cover all given possibilities.",
        "A conclusion can follow from combining multiple statements even when it doesn't follow from any single one alone — chain them.",
        "Be wary of causal-sounding conclusions when the statement only reports a correlation or a sequence of events."
      ],
      "links": [
        {
          "label": "IndiaBix — Statement and Conclusion",
          "url": "https://www.indiabix.com/logical-reasoning/statement-and-conclusion/"
        },
        {
          "label": "GeeksforGeeks — Statement and Conclusion",
          "url": "https://www.geeksforgeeks.org/statement-and-conclusion/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Course of Action",
      "overview": "Course of action questions present a problem or situation and one or more numbered suggested actions, asking which action(s) would be a sensible, practical, and feasible step toward addressing that specific problem — not toward some broader or ideal goal. Unlike conclusion questions (which ask what logically FOLLOWS from a statement), course of action questions ask what should be DONE, and the correct answer must satisfy two independent tests: it must follow reasonably from the problem as stated, and it must be practically implementable/administratively feasible, not merely a nice-sounding aspiration. This sub-module covers the two-part sufficiency test (relevance + feasibility), distinguishing a real course of action from a vague suggestion or a restatement of the problem, handling multi-action (I and II) questions, common patterns in administrative/policy problems, and the classic trap of overly extreme or disproportionate actions.",
      "sections": [
        {
          "heading": "The Two-Part Test: Relevance and Feasibility",
          "body": "A valid course of action must pass BOTH tests: (1) it addresses the specific problem described — not a different, related problem — and (2) it is practically implementable with reasonably available means, not something vague, extreme, or requiring resources/authority the situation doesn't establish exist.",
          "bullets": [
            "Problem: 'Absenteeism among factory workers has risen sharply in the last quarter.' Action: 'The factory should investigate the reasons for increased absenteeism and address the root causes.' This passes both tests — it directly targets the stated problem and is a standard, implementable administrative step. A failing alternative: 'The factory should shut down operations' — this is feasible in principle but wildly disproportionate to the stated problem (relevance test fails, since it doesn't sensibly address absenteeism specifically)."
          ]
        },
        {
          "heading": "Distinguishing a Real Action From a Restatement",
          "body": "A common wrong-answer trap simply restates the problem in imperative form ('the problem should be solved') without specifying any actual step — this fails the test because it provides no genuine course of action, just a hope that the problem goes away.",
          "bullets": [
            "Problem: 'Sales in the northern region have dropped by 30% this quarter.' Weak non-action: 'Sales in the northern region should improve.' (This just restates the desired outcome, not a step to achieve it.) Valid action: 'The company should conduct a market survey in the northern region to identify the cause of the sales decline.' (This specifies an actual, implementable step.)"
          ]
        },
        {
          "heading": "Multi-Action (I and II) Questions",
          "body": "When two numbered actions are given, apply the two-part test to each INDEPENDENTLY — it's common for both to be individually valid non-conflicting steps (answer: both follow), for only one to be proportionate, or for the two to be mutually exclusive alternatives (in which case 'either I or II' may be the intended answer if the problem doesn't favor one over the other).",
          "bullets": [
            "Problem: 'A bridge has developed cracks and is unsafe for heavy vehicles.' Action I: 'Heavy vehicles should be barred from using the bridge until repairs are completed.' Action II: 'The bridge should be immediately repaired by a structural engineering team.' Both are relevant and feasible, and they aren't mutually exclusive (one is an immediate safety measure, the other a fix) — both actions follow."
          ]
        },
        {
          "heading": "Common Patterns in Administrative/Policy Problems",
          "body": "Government and institutional 'course of action' problems frequently have a standard correct-answer shape: investigate the cause, take a proportionate corrective/preventive administrative step, or enforce an existing rule more strictly — actions that call for something outside the administration's typical authority (declaring an emergency, changing a law unilaterally) are usually distractors.",
          "bullets": [
            "Problem: 'Several students have been caught copying in the final exams this year.' Reasonable action: 'The examination authority should tighten invigilation and enforce stricter anti-copying measures in future exams.' Disproportionate distractor: 'All exams for the affected batch should be cancelled permanently' — too extreme and not a measured administrative response to the stated problem."
          ]
        },
        {
          "heading": "The Trap of Overly Extreme or Disproportionate Actions",
          "body": "An action that would technically 'solve' the problem but at a wildly disproportionate cost, or that addresses a much broader issue than what was actually described, should be rejected — course of action questions specifically test whether a candidate can judge PROPORTIONALITY, not just logical connection to the topic.",
          "bullets": [
            "Problem: 'A single employee has been consistently arriving late this month.' Disproportionate action: 'The company should revise its attendance policy for all employees.' Proportionate action: 'The manager should discuss the lateness directly with that employee and understand the reason.' The disproportionate option treats an individual issue as an organization-wide one."
          ]
        },
        {
          "heading": "Actions Requiring Unstated Authority or Resources",
          "body": "Reject an action that assumes a level of authority, budget, or resource availability the passage never establishes — a locally-scoped problem (one school, one branch office) shouldn't be 'solved' by an action that requires national policy change or resources clearly beyond that scope, unless the statement explicitly grants that authority.",
          "bullets": [
            "Problem: 'One particular branch of a bank has been receiving frequent customer complaints about long queues.' Action within scope: 'That branch should add an additional counter during peak hours.' Action outside scope: 'The bank should redesign its national branch network' — this exceeds what a single branch's queue problem calls for or what the passage's stated authority (branch-level) can act on."
          ]
        }
      ],
      "commonPitfalls": [
        "Selecting an action that would technically fix the problem but is wildly disproportionate in scale or cost to what was actually described.",
        "Accepting a restated version of the desired outcome ('the problem should be solved') as if it were an actual, specific course of action.",
        "Choosing an action that requires authority, budget, or resources the passage never establishes as available at the stated level (branch, individual, department).",
        "Judging relevance alone without separately checking feasibility, or vice versa — both tests must pass independently.",
        "Treating an individual-level problem (one employee, one incident) as requiring an organization-wide policy action.",
        "In multi-action (I/II) questions, assuming the two actions are automatically mutually exclusive when they may both be valid, complementary steps.",
        "Selecting an action addressing a broader or different problem than the one specifically described in the passage."
      ],
      "keyTakeaways": [
        "A valid course of action must pass two independent tests: relevance to the SPECIFIC stated problem, and practical feasibility.",
        "Reject actions that merely restate the desired outcome without specifying an actual, implementable step.",
        "Reject disproportionate actions — the scale of the response should match the scale of the problem as described.",
        "Reject actions requiring authority or resources beyond what the passage establishes exists at the relevant level.",
        "In multi-action questions, test each action independently; both can validly follow if they're relevant, feasible, and non-conflicting.",
        "Standard administrative course-of-action answers usually mean investigate the cause, take a proportionate corrective step, or better enforce an existing rule."
      ],
      "links": [
        {
          "label": "IndiaBix — Course of Action",
          "url": "https://www.indiabix.com/logical-reasoning/course-of-action/"
        },
        {
          "label": "GeeksforGeeks — Course of Action Reasoning",
          "url": "https://www.geeksforgeeks.org/course-of-action-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Input-Output Reasoning",
      "overview": "Input-output (machine input) questions show a starting line of words and/or numbers, then a sequence of 'steps' where the machine rearranges and/or transforms the items according to a FIXED but unstated rule, with each step's output shown — and the question asks either for a specific intermediate step's output or for the original input given a later step. The entire skill is pattern extraction across the shown steps: comparing step 1 to step 2, and step 2 to step 3, to isolate exactly what changed (usually one item's position, or one item's value) at each step, then extending or reversing that same rule. This sub-module covers word-rearrangement machines (usually sorted alphabetically or by word length, one item moved per step), number-rearrangement machines (sorted by value, with an arithmetic operation sometimes also applied), mixed word-number machines, identifying the step-to-step sorting direction, working backward from a given step to find the original input, and how to recognize when a step has 'completed' (no further change).",
      "sections": [
        {
          "heading": "Reading the Step Structure",
          "body": "Before attempting to find the rule, line up every given step vertically, one row per step, so item positions can be compared column by column across consecutive rows — trying to compare steps by reading them left to right in prose, rather than aligned vertically, is the most common reason candidates miss the actual rule.",
          "bullets": [
            "Input: 62 train 18 forest 45 apple. Step I: 18 62 train forest 45 apple. Step II: 18 45 62 train forest apple. Aligning these vertically shows: numbers are being sorted in ascending order and moved to the front, one at a time, per step — by Step II, the two smallest numbers (18, 45) have both moved to the front-left."
          ]
        },
        {
          "heading": "Word-Rearrangement Machines",
          "body": "The most common word-machine rule sorts words alphabetically (or by word length, ascending or descending) and moves the correctly-positioned word to one end per step — identify whether it's alphabetical or length-based by checking the FIRST word moved in step I against all the given words.",
          "bullets": [
            "Input: forest apple train jungle. Step I: apple forest train jungle. Comparing to the input, 'apple' moved to the front. Since 'apple' is alphabetically first among all four words, the rule is: bring the alphabetically-earliest remaining word to the front, one word per step."
          ]
        },
        {
          "heading": "Number-Rearrangement Machines With Arithmetic Twists",
          "body": "Some number machines don't just reorder values but also apply an arithmetic operation (add a constant, multiply by 2) to each number as it's moved — verify this by checking whether the moved number's VALUE changed between steps, not just its position; if unchanged, it's a pure sort, if changed, extract the exact operation from the one example given.",
          "bullets": [
            "Input: 12 45 7 30. Step I: 7 12 45 30 (7, the smallest, moved to the front — ascending sort). Step II: 7 14 45 30 (12 was already next in sorted order, so only its value changed: 12→14, a +2 applied when a number is relocated that step). Step III: 7 14 32 45 (30 moved into position 3, becoming 32 with the same +2). The rule: sort ascending one number at a time, adding 2 to a number's value exactly when it's the one being placed that step."
          ]
        },
        {
          "heading": "Mixed Word-and-Number Machines",
          "body": "When a line contains both words and numbers, the machine typically processes them as two independent streams (e.g., words move to the left end sorted alphabetically while numbers move to the right end sorted numerically, or vice versa) — treat the word-positions and number-positions as two separate mini-machines and solve each stream's rule independently before combining.",
          "bullets": [
            "Input: 25 zebra 8 apple. Step I: apple 25 zebra 8. Step II: apple zebra 25 8. Words (apple, zebra) are migrating leftward in alphabetical order while numbers (25, 8) are migrating rightward — two independent streams, sorted in opposite directions, converging from opposite ends."
          ]
        },
        {
          "heading": "Determining the Sort Direction (Ascending vs Descending)",
          "body": "Compare only the FIRST item moved (step I vs input) against the full original list — if the smallest/alphabetically-first item moved, the sort is ascending; if the largest/alphabetically-last item moved, it's descending. Do not assume ascending by default, since descending-order machines are equally common and deliberately included as a trap for that assumption.",
          "bullets": [
            "Input: 30 5 18 42. Step I: 42 30 5 18. The item moved to the front, 42, is the LARGEST number in the list — so the rule is descending order, moving the largest remaining number to the front each step (opposite of the more commonly assumed ascending default)."
          ]
        },
        {
          "heading": "Working Backward: Finding the Original Input",
          "body": "When only a middle or final step is given and the question asks for the original input, run the discovered rule in reverse: identify which item was moved in the LAST shown step transition and undo exactly that one movement (and any associated arithmetic) to reconstruct the previous step, repeating until reaching step 0 (input).",
          "bullets": [
            "If the fully-sorted final step reads: apple forest jungle train (alphabetical, one word moved to the front per step, 4 words total means 3 steps to fully sort), and you know 'train' was the LAST word moved (in step III), then in step II 'train' must still have been in its ORIGINAL relative position among the unsorted remainder — reconstructing step by step backward, undoing the most recent move first."
          ]
        },
        {
          "heading": "Recognizing When Sorting Has Completed",
          "body": "A machine stops applying its rule once every item has reached its final sorted position — recognize completion by checking whether one more application of the discovered rule would produce any change; if applying it again to the last shown step produces an identical row, that step is indeed the final, fully-sorted output and no further steps exist."
        }
      ],
      "commonPitfalls": [
        "Comparing steps by reading them in prose instead of aligning them vertically column by column, missing the exact single change per step.",
        "Assuming the sort direction is always ascending without checking whether the first moved item was actually the smallest/alphabetically-first or the largest/last.",
        "Missing an arithmetic operation applied alongside repositioning (assuming a pure sort when values are also changing between steps).",
        "In mixed word-number lines, trying to find one unified rule instead of recognizing two independent streams (words and numbers) sorted separately.",
        "Working backward from a later step without first correctly identifying which single item was moved in the most recent step transition.",
        "Not verifying the discovered rule against EVERY given step (not just the first one) before applying it to answer the actual question.",
        "Assuming a machine always moves items to the front, when some machines move the sorted item to the back/end instead."
      ],
      "keyTakeaways": [
        "Always align every given step vertically to compare item positions column by column — never compare steps by reading them as prose.",
        "Determine sort direction (ascending/descending) by checking whether the FIRST moved item is the smallest/first or largest/last in the original list.",
        "Check whether item VALUES change (not just positions) between steps — some machines apply arithmetic alongside repositioning.",
        "In mixed word-and-number lines, solve the word-stream and number-stream rules independently — they usually don't share one combined rule.",
        "To reconstruct an earlier step from a later one, undo the single most recent move (and any arithmetic) first, then work backward step by step.",
        "Verify a discovered rule against every given step before extending it forward or backward to answer the question."
      ],
      "links": [
        {
          "label": "IndiaBix — Input Output Reasoning",
          "url": "https://www.indiabix.com/logical-reasoning/input-output/"
        },
        {
          "label": "GeeksforGeeks — Input Output Reasoning",
          "url": "https://www.geeksforgeeks.org/input-output-based-reasoning/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Number & Letter Series",
      "overview": "Series questions show a sequence of numbers, letters, or a mix of both following one consistent hidden rule, and ask for the next term, a missing term, or which term breaks the pattern (the 'odd one out' in a series). The core skill is trying a small, ordered checklist of standard rule types — constant difference, constant ratio, difference-of-differences, alternating rules, and squares/cubes-based patterns — against the FIRST few terms until one fits every given term, rather than guessing randomly. This sub-module works through arithmetic (constant-difference) series, geometric (constant-ratio) series, second-order (difference-of-differences) series, alternating/interleaved series, letter series using alphabet position numbers, mixed number-letter series, and wrong-term-in-series identification.",
      "sections": [
        {
          "heading": "Arithmetic (Constant Difference) Series",
          "body": "The simplest and most common series type adds (or subtracts) the same fixed amount at every step — always check this first by computing the difference between each pair of consecutive given terms; if every difference is identical, the rule is confirmed and extending it is direct.",
          "bullets": [
            "3, 8, 13, 18, 23, ? Differences: 5, 5, 5, 5 (constant). Next term = 23 + 5 = 28."
          ]
        },
        {
          "heading": "Geometric (Constant Ratio) Series",
          "body": "If differences are NOT constant, check whether the RATIO between consecutive terms is constant instead (each term = previous term × a fixed multiplier) — this is the second standard check after arithmetic fails.",
          "bullets": [
            "5, 15, 45, 135, ? Ratios: 15/5=3, 45/15=3, 135/45=3 (constant ratio of 3). Next term = 135 × 3 = 405."
          ]
        },
        {
          "heading": "Second-Order (Difference-of-Differences) Series",
          "body": "When the first-level differences themselves form a pattern (rather than being constant), take the differences of those differences — a series with steadily increasing gaps (2, 3, 4, 5...) or matching a squares/triangular-number pattern is the classic signal to check this next.",
          "bullets": [
            "2, 3, 5, 8, 12, 17, ? First differences: 1, 2, 3, 4, 5 (increasing by 1 each time — an arithmetic pattern in the differences themselves). Next difference = 6, so next term = 17 + 6 = 23."
          ]
        },
        {
          "heading": "Alternating / Interleaved Series",
          "body": "Some series interleave two independent sub-series at alternating positions (all odd-indexed terms form one pattern, all even-indexed terms form another) — split the series into two separate lists (odd positions, even positions) and find each sub-series' own rule independently.",
          "bullets": [
            "1, 10, 4, 20, 7, 30, 10, ? Odd positions (1st,3rd,5th,7th...): 1, 4, 7, 10 — arithmetic, +3 each time. Even positions (2nd,4th,6th,8th...): 10, 20, 30, ? — arithmetic, +10 each time, so next even-position term = 40. The requested 8th term is even-positioned: 40."
          ]
        },
        {
          "heading": "Squares, Cubes, and Prime-Based Series",
          "body": "When plain arithmetic/geometric/difference checks fail, test whether the terms match a squares sequence (1,4,9,16,25...), cubes sequence (1,8,27,64...), or consecutive primes (2,3,5,7,11...) — recognizing these standard numeric families quickly is largely a matter of having them memorized rather than deriving them from scratch each time.",
          "bullets": [
            "1, 4, 9, 16, 25, ? Recognize these as perfect squares: 1², 2², 3², 4², 5². Next term = 6² = 36."
          ]
        },
        {
          "heading": "Letter Series Using Alphabet Position Numbers",
          "body": "Convert each letter to its alphabet position (A=1, B=2, ... Z=26), solve the resulting NUMBER series using the same checklist above (constant difference, ratio, second-order), then convert the answer's position number back to a letter.",
          "bullets": [
            "B, D, F, H, ? Convert to positions: 2, 4, 6, 8, ? — constant difference of 2. Next position = 10, which converts back to the letter J."
          ]
        },
        {
          "heading": "Mixed Number-Letter Series",
          "body": "Mixed series combine a number pattern and a letter pattern in alternating or paired positions — same approach as alternating series: separate the numeric terms from the letter terms into two independent streams, solve each with the standard checklist, then recombine to answer.",
          "bullets": [
            "A1, C3, E5, G7, ? Letters (A, C, E, G) skip one letter each time (alphabet positions 1, 3, 5, 7 — constant difference of 2), so next letter position = 9 = I. Numbers (1, 3, 5, 7) are simply the odd numbers, constant difference of 2, next = 9. Combined next term: I9."
          ]
        },
        {
          "heading": "Finding the Wrong Term in a Series",
          "body": "For 'find the term that does NOT fit' questions, apply the same rule-checklist to the term-to-term differences or ratios across the WHOLE series — the one transition that breaks an otherwise-consistent pattern identifies which single term is wrong, and the 'corrected' value can be inferred from the surrounding consistent pattern.",
          "bullets": [
            "2, 4, 8, 16, 30, 64. Ratios: 4/2=2, 8/4=2, 16/8=2, 30/16=1.875 (breaks pattern!), 64/30≈2.13 (also off). The consistent doubling pattern (×2 each time) is broken exactly at 30 — the correct term should have been 32 (16×2), making 30 the wrong term in the series."
          ]
        }
      ],
      "commonPitfalls": [
        "Jumping to guess the next term from a partial pattern before checking it against EVERY given term in the series.",
        "Only checking constant difference and giving up, without testing constant ratio or second-order (difference-of-differences) patterns.",
        "Missing an alternating/interleaved series structure and trying to find one rule that fits every term in original order, when two separate sub-series are interleaved.",
        "Forgetting to convert letters to their alphabet-position numbers before applying numeric series rules, and instead trying to spot letter patterns visually.",
        "Not recognizing standard sequences (squares, cubes, primes) quickly, wasting time re-deriving a difference pattern that doesn't actually exist.",
        "In 'find the wrong term' questions, checking only differences when the underlying pattern is actually ratio-based, or vice versa.",
        "Wrapping alphabet positions incorrectly around Z (26) without checking whether the specific question intends wrap-around at all."
      ],
      "keyTakeaways": [
        "Work through a standard checklist in order: constant difference, constant ratio, second-order differences, alternating sub-series, then squares/cubes/primes.",
        "Convert letters to alphabet-position numbers (A=1...Z=26) before applying any numeric series rule, then convert the answer back.",
        "For alternating/interleaved series, split into odd-position and even-position sub-series and solve each independently.",
        "Memorize squares, cubes, and small primes to recognize these series families instantly instead of re-deriving them.",
        "Always verify a candidate rule against ALL given terms, not just the first two or three, before extending it.",
        "For 'find the wrong term,' locate exactly which single transition breaks an otherwise-consistent difference or ratio pattern."
      ],
      "links": [
        {
          "label": "IndiaBix — Number Series",
          "url": "https://www.indiabix.com/logical-reasoning/number-series/"
        },
        {
          "label": "GeeksforGeeks — Letter and Number Series",
          "url": "https://www.geeksforgeeks.org/verbal-reasoning-number-series/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Classification (Odd One Out)",
      "overview": "Classification questions present a group of words, numbers, or letter-groups and ask which one does NOT belong with the rest — the skill is identifying the single shared property that links the majority of items, since the 'odd one out' is simply whichever item fails that specific shared property, not just any item that seems generally different. The trap is that groups are deliberately designed so multiple plausible categorization rules exist, and only one rule cleanly separates exactly one item from the rest — testing a candidate rule against ALL items (not just a couple) is what confirms it's the intended one. This sub-module covers meaning-based (semantic) classification, numeric classification (primes, squares, multiples, digit-sum patterns), letter-pattern classification, two-step classification traps, and how to handle groups where more than one rule seems to almost work.",
      "sections": [
        {
          "heading": "Meaning-Based (Semantic) Classification",
          "body": "The most common word-classification rule groups items by a shared category or relationship (all are types of X, all are parts of Y) — identify the category shared by at least 3 of the 4 given items first, then check which single item falls outside that specific category, even if it belongs to some OTHER plausible category.",
          "bullets": [
            "Rose, Lotus, Lily, Mango. Rose, Lotus, and Lily are all flowers; Mango is a fruit. Odd one out: Mango. (Even though all four are 'living things that grow on plants,' that broader rule doesn't isolate just one item — the correct rule must be the one that leaves exactly one outlier.)"
          ]
        },
        {
          "heading": "Numeric Classification: Primes, Squares, and Multiples",
          "body": "For number groups, systematically test standard numeric properties in order: is the group all prime, all perfect squares, all multiples of some fixed number, or all following a digit-sum pattern — testing these known categories quickly is faster than searching for an ad-hoc pattern.",
          "bullets": [
            "4, 9, 16, 20, 25. Testing perfect squares: 4=2², 9=3², 16=4², 25=5² — all perfect squares except 20. Odd one out: 20."
          ]
        },
        {
          "heading": "Numeric Classification: Digit-Sum and Divisibility Patterns",
          "body": "When primes/squares/multiples don't cleanly separate one item, check the sum of digits of each number, or whether each number is divisible by a specific small number (3, 7, 11) — some classification sets are deliberately built around one of these less-obvious properties.",
          "bullets": [
            "21, 33, 42, 47, 63. Testing divisibility by 3: 21=3×7, 33=3×11, 42=3×14, 63=3×21 all divisible by 3, but 47 is prime and not divisible by 3. Odd one out: 47."
          ]
        },
        {
          "heading": "Letter-Pattern Classification",
          "body": "Letter-group classification (e.g., 'ABD, EGI, KMO, PRT') typically hinges on a consistent gap pattern between letters within each group (converted to alphabet position numbers) — convert every group to numbers first, find the consistent internal gap pattern shared by most groups, then spot which group's gap pattern differs.",
          "bullets": [
            "ABD (1,2,4 — gaps of +1,+2), EGI (5,7,9 — gaps of +2,+2), KMO (11,13,15 — gaps of +2,+2), PRT (16,18,20 — gaps of +2,+2). Three groups share the +2,+2 gap pattern; ABD has gaps +1,+2 instead. Odd one out: ABD."
          ]
        },
        {
          "heading": "Two-Step Classification Traps",
          "body": "Some classification sets require checking TWO properties in sequence — a first property that most items share plus a second, more specific property that further narrows it — jumping to a conclusion after only the first check can produce a wrong answer if that first property doesn't cleanly isolate a single item.",
          "bullets": [
            "8, 27, 64, 100, 125. First check, perfect cubes: 8=2³, 27=3³, 64=4³, 125=5³ — four items are perfect cubes, and 100 is not (100 is 10², a perfect square instead). The first check (cubes) already isolates exactly one item cleanly, confirming 100 as the odd one out without needing a second-layer check."
          ]
        },
        {
          "heading": "When Multiple Rules Seem to Almost Work",
          "body": "If two different candidate rules each seem to isolate a DIFFERENT single item as the outlier, the correct rule is the one that is more specific and mechanical (a precise numeric/positional property) rather than a loose thematic one — prefer a rule backed by exact arithmetic or letter-position math over a vaguer 'these feel similar' categorization, since exam-set answers are built on the precise rule."
        }
      ],
      "commonPitfalls": [
        "Stopping at the first plausible-sounding shared category without checking it against every item in the group.",
        "Choosing a broad, loose category (e.g., 'all are living things') that fails to isolate exactly one outlier, instead of a narrower one that does.",
        "In numeric classification, checking only one standard property (like primes) and giving up instead of also testing squares, multiples, and digit-sum patterns.",
        "In letter-group classification, comparing letters directly instead of converting to alphabet-position numbers first to spot the gap pattern.",
        "Missing a two-step classification where a second, more specific property is needed after an initial property narrows but doesn't fully isolate the outlier.",
        "Preferring a vaguer thematic rule over a more precise mechanical (arithmetic/positional) rule when both seem to partially apply.",
        "Assuming the odd one out must be numerically the largest or smallest, rather than actually testing the shared property."
      ],
      "keyTakeaways": [
        "Find the property shared by AT LEAST three of the items first, then confirm exactly one item fails that specific property.",
        "For numbers, systematically test primes, perfect squares, perfect cubes, multiples, and digit-sum/divisibility patterns in turn.",
        "For letter groups, convert to alphabet-position numbers and compare internal gap patterns rather than eyeballing the letters.",
        "When multiple candidate rules each isolate a different outlier, prefer the more precise, mechanical (numeric/positional) rule.",
        "Some sets require a two-step check — an initial property that narrows the group, then a second, more specific property.",
        "Always test a candidate classification rule against every item in the group, not just two or three, before finalizing the answer."
      ],
      "links": [
        {
          "label": "IndiaBix — Classification",
          "url": "https://www.indiabix.com/logical-reasoning/classification/"
        },
        {
          "label": "GeeksforGeeks — Classification Reasoning",
          "url": "https://www.geeksforgeeks.org/classification-reasoning-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Logical Reasoning",
      "subModuleTitle": "Calendar & Clock Problems",
      "overview": "Calendar problems ask for the day of the week on a given date (or how a repeating date pattern shifts across years), using the 'odd days' method built on the fact that the days of the week repeat with a period of 7 and a normal year contains exactly 1 extra ('odd') day beyond 52 complete weeks (2 odd days for a leap year). Clock problems ask about the angle between the hour and minute hands at a given time, or when the hands next align/oppose, using the fixed facts that the minute hand moves 6° per minute and the hour hand moves 0.5° per minute. Both topics are formula-driven rather than puzzle-driven, and speed comes from having the core formulas and the odd-days-per-century reference table memorized cold. This sub-module covers the odd-days method and leap-year rules, finding the day of the week for any date, recurring-date-shift patterns, the clock-angle formula, hands-coincide and hands-opposite problems, and faulty (fast/slow) clock adjustments.",
      "sections": [
        {
          "heading": "The Odd Days Concept and Leap Year Rule",
          "body": "An 'odd day' is the remainder of days beyond complete weeks in a given period. A normal (non-leap) year has 365 days = 52 weeks + 1 day, so it contributes 1 odd day; a leap year (366 days) contributes 2 odd days. A year is a leap year if divisible by 4, EXCEPT century years (ending in 00), which must be divisible by 400 to be leap years (so 2000 was a leap year, but 1900 was not).",
          "bullets": [
            "Is 2024 a leap year? 2024 ÷ 4 = 506 exactly, and it's not a century year, so yes, 2024 is a leap year (366 days, 2 odd days). Is 1900 a leap year? It's a century year, and 1900 ÷ 400 is not exact, so NO, 1900 is not a leap year despite being divisible by 4."
          ]
        },
        {
          "heading": "Odd Days Reference Table for Longer Periods",
          "body": "For century-scale calculations, memorize: 100 years = 5 odd days, 200 years = 3 odd days, 300 years = 1 odd day, 400 years = 0 odd days (since 400 years contains exactly 97 leap years, making the total days an exact multiple of 7) — this 400-year-cycle fact is why the Gregorian calendar repeats its day-pattern every 400 years.",
          "bullets": [
            "400 years always contributes 0 odd days: (400×365 + 97 leap days) = 146097 days, and 146097 ÷ 7 = 20871 exactly — no remainder, confirming the 400-year cycle repeats the calendar exactly."
          ]
        },
        {
          "heading": "Finding the Day of the Week for a Given Date",
          "body": "Standard method: compute total odd days from a known reference point (often January 1, year 1, which is defined as a Monday) up to the day before the target date, take that total mod 7, and map the remainder (0=Sunday, 1=Monday, ... 6=Saturday) to get the day of the week — in practice, most problems give a nearby known reference date to calculate FROM, rather than starting from year 1.",
          "bullets": [
            "If January 1, 2023 was a Sunday, what day is January 1, 2024? 2023 is not a leap year, contributing 1 odd day. Sunday + 1 odd day = Monday. So January 1, 2024 was a Monday."
          ]
        },
        {
          "heading": "Recurring Date-Shift Patterns",
          "body": "For 'same date, different year' questions, add the odd days contributed by each intervening year (checking each for leap-year status) and shift the known day of the week by that total mod 7 — this is a direct extension of the day-of-week method, just applied to a multi-year gap.",
          "bullets": [
            "If 15th August 2021 was a Sunday, what day is 15th August 2025? Years in between contributing odd days: 2021→2022 (1, not leap), 2022→2023 (1), 2023→2024 (2, 2024 is leap), 2024→2025 (1) = total 5 odd days. Sunday + 5 = Friday. So 15th August 2025 is a Friday."
          ]
        },
        {
          "heading": "The Clock-Angle Formula",
          "body": "The minute hand moves 360°/60 min = 6° per minute. The hour hand moves 360°/(12×60) = 0.5° per minute. The angle between them at H hours and M minutes is |30×H − 5.5×M| degrees (taking the result mod 360, and using the smaller of the angle or 360-minus-the-angle if it exceeds 180°) — this single formula covers virtually every 'angle between hands at a given time' question.",
          "bullets": [
            "What is the angle between the hands at 3:40? |30×3 − 5.5×40| = |90 − 220| = 130°. Since 130° < 180°, that's already the smaller angle: 130°."
          ]
        },
        {
          "heading": "Hands Coincide or Are Opposite",
          "body": "The hands coincide (0°) roughly every 65 5/11 minutes (not exactly every 60, since the hour hand also moves), and are exactly opposite (180°) roughly every 65 5/11 minutes as well, offset by a half-cycle — use the same angle formula, setting it equal to 0° (coincide) or 180° (opposite) and solving for M given H.",
          "bullets": [
            "At what time between 4 and 5 o'clock are the hands exactly opposite (180°)? |30×4 − 5.5×M| = 180 → 120 − 5.5M = ±180. Taking 120 − 5.5M = −180 → 5.5M = 300 → M = 54.54 (54 and 6/11 minutes). So the hands are opposite at approximately 4:54:33."
          ]
        },
        {
          "heading": "Faulty (Fast/Slow) Clock Adjustments",
          "body": "A clock that gains or loses time runs at a different effective rate than a correct clock — if a clock gains M minutes every H hours of ACTUAL time, its effective rate is (H×60 + M) minutes of clock-time per H×60 minutes of real time; use this ratio to convert between the faulty clock's reading and real elapsed time.",
          "bullets": [
            "A clock gains 10 minutes every 24 hours. In real 24 hours (1440 minutes), the faulty clock shows 1450 minutes. If the faulty clock shows exactly 24 hours have passed (1440 clock-minutes), real time elapsed = 1440 × (1440/1450) ≈ 1430.07 real minutes — very slightly less than 24 real hours, since the clock is running fast and reaches '24:00' before real time does."
          ]
        }
      ],
      "commonPitfalls": [
        "Applying the divisible-by-4 leap year rule to century years without checking the divisible-by-400 exception (e.g., wrongly treating 1900 as a leap year).",
        "Forgetting that a leap year contributes 2 odd days, not 1, when calculating across a span that includes a leap year.",
        "Miscounting which years in a date-shift range are leap years, especially when the range crosses a century boundary.",
        "Forgetting to reduce the hour value to a 12-hour or correct decimal-hour basis before applying the clock-angle formula (e.g., using 15 instead of 3 for 3 PM without adjusting).",
        "Taking the raw output of the angle formula without checking whether it exceeds 180° and needs to be subtracted from 360° to get the actual (smaller) angle asked for.",
        "Assuming clock hands coincide exactly every 60 minutes instead of the correct ~65 5/11 minutes, due to the hour hand's own continuous movement.",
        "In faulty-clock problems, applying the gain/loss ratio in the wrong direction (converting real time to clock time when the question asks the reverse, or vice versa)."
      ],
      "keyTakeaways": [
        "A century year (ending in 00) is a leap year only if divisible by 400, overriding the normal divisible-by-4 rule.",
        "Odd days per year: 1 for a normal year, 2 for a leap year — always check leap-year status for every year spanned.",
        "400 years always contribute exactly 0 odd days — the basis of the Gregorian calendar's 400-year repeat cycle.",
        "Clock-angle formula: |30H − 5.5M| degrees, adjusted to the smaller angle (≤180°) if the raw result exceeds 180°.",
        "Clock hands coincide or oppose roughly every 65 5/11 minutes, not every 60 — because the hour hand keeps moving too.",
        "For faulty clocks, convert between real time and clock-shown time using the ratio of actual elapsed time to clock-time elapsed, based on the stated gain/loss rate."
      ],
      "links": [
        {
          "label": "IndiaBix — Calendar",
          "url": "https://www.indiabix.com/aptitude/calendar/"
        },
        {
          "label": "GeeksforGeeks — Clock Aptitude Questions",
          "url": "https://www.geeksforgeeks.org/clock-based-questions-aptitude/"
        }
      ]
    }
  ]
};

export default data;
