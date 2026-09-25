import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  "courseSlug": "quantitative-aptitude",
  "submodules": [
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Number systems",
      "overview": "Number systems questions form the backbone of almost every placement aptitude test because the shortcuts they teach — divisibility rules, HCF/LCM, remainder cyclicity, unit-digit tricks — get reused inside percentage, time-speed-distance, and data interpretation problems later. Unlike topics that reward memorized formulas alone, number systems reward pattern recognition: recognizing that a huge power's unit digit repeats every 2-4 steps, or that a factorial's trailing zeros depend only on how many times 5 divides into it, turns an intractable-looking question into a 20-second calculation. This sub-module builds the core toolkit — classification and divisibility, HCF/LCM and their word-problem applications, remainder and cyclicity shortcuts, unit-digit and trailing-zero techniques, and base conversion — with every rule demonstrated on a real worked number so the technique, not just the definition, sticks. Because these problems appear in nearly every test as quick, calculator-free questions, speed and accuracy here directly raise your overall score.",
      "sections": [
        {
          "heading": "Classification of Numbers and Divisibility Rules",
          "body": "Placement tests lean heavily on divisibility rules because they let you answer 'is this divisible by X' without doing the full division. The rules worth memorizing cold: divisible by 2 (last digit even), by 3 (digit sum divisible by 3), by 4 (last two digits divisible by 4), by 5 (ends in 0 or 5), by 8 (last three digits divisible by 8), by 9 (digit sum divisible by 9), and by 11 (alternating digit sum from the right divisible by 11, including 0).",
          "bullets": [
            "Check 396528 for divisibility by 4, 8, 9, and 11: last two digits 28 → 28/4=7, divisible by 4. Last three digits 528 → 528/8=66, divisible by 8. Digit sum 3+9+6+5+2+8=33, NOT divisible by 9 (33 isn't a multiple of 9). Alternating sum from the right: 8-2+5-6+9-3=11, divisible by 11 (11 itself counts)."
          ]
        },
        {
          "heading": "HCF and LCM: Prime Factorization and Word Problems",
          "body": "HCF (highest common factor) is found by multiplying the lowest power of every common prime factor; LCM (lowest common multiple) is found by multiplying the highest power of every prime factor appearing in any of the numbers. The two are linked by the identity HCF × LCM = product of the two numbers — a fast way to check your work or find one value if the other three are known. LCM word problems (things repeating together, like bells or traffic lights) are extremely common.",
          "bullets": [
            "36 = 2² × 3², 60 = 2² × 3 × 5. HCF = 2² × 3 = 12. LCM = 2² × 3² × 5 = 180. Check: 12 × 180 = 2160 = 36 × 60. ✓",
            "Three bells ring every 12, 18, and 24 minutes. They rang together at 9:00 AM — when next? LCM(12,18,24): 12=2²×3, 18=2×3², 24=2³×3 → LCM=2³×3²=72 minutes. Next together ring: 10:12 AM."
          ]
        },
        {
          "heading": "Remainder Theorems and Cyclicity",
          "body": "When a power is too large to compute directly, find the cyclicity of the base's remainders modulo the divisor and reduce the exponent modulo the cycle length. This converts an unmanageable calculation like 2¹⁰⁰ mod 7 into a small lookup.",
          "bullets": [
            "Find the remainder when 2¹⁰⁰ is divided by 7. Powers of 2 mod 7 cycle: 2¹=2, 2²=4, 2³=1 (mod 7) — cycle length 3. 100 mod 3 = 1 (since 99 is divisible by 3). So 2¹⁰⁰ mod 7 = 2¹ mod 7 = 2."
          ]
        },
        {
          "heading": "Unit Digit Shortcuts for Large Powers",
          "body": "Unit digits of powers cycle with a period of at most 4 (digits 4 and 9 cycle in 2, digits 2,3,7,8 cycle in 4, and 0,1,5,6 never change). Find the base's cycle, reduce the exponent modulo the cycle length (using the cycle length itself, not 0, when the remainder is 0), and read off the matching position.",
          "bullets": [
            "Find the unit digit of 7¹²³. Cycle of 7: 7¹=7, 7²=49(9), 7³=343(3), 7⁴=2401(1) — period 4. 123 mod 4 = 3 (120 is divisible by 4). Third position in the cycle (7,9,3,1) is 3. Unit digit = 3."
          ]
        },
        {
          "heading": "Factorials and Trailing Zeros",
          "body": "Trailing zeros in n! come only from factors of 10, i.e., pairs of 2 and 5 — and since factors of 2 are always more abundant than factors of 5 in a factorial, the zero count is simply the total power of 5 dividing n!, found by summing floor(n/5) + floor(n/25) + floor(n/125) + ... until the term is 0.",
          "bullets": [
            "Trailing zeros in 100!: floor(100/5)=20, floor(100/25)=4, floor(100/125)=0. Total = 20+4 = 24 trailing zeros."
          ]
        },
        {
          "heading": "Base Conversion",
          "body": "Converting decimal to binary (or any base b) uses repeated division: divide by b, record the remainder, repeat on the quotient, and read the remainders bottom-to-top. Converting binary back to decimal is the reverse — multiply each bit by its positional power of 2 and sum.",
          "bullets": [
            "Convert 156 to binary: 156÷2=78 r0, 78÷2=39 r0, 39÷2=19 r1, 19÷2=9 r1, 9÷2=4 r1, 4÷2=2 r0, 2÷2=1 r0, 1÷2=0 r1. Reading remainders bottom-up: 10011100. Check: 128+16+8+4=156. ✓"
          ]
        },
        {
          "heading": "Number of Factors and Sum of Factors",
          "body": "For N = p₁^a × p₂^b × p₃^c (prime factorization), the total count of factors is (a+1)(b+1)(c+1), and the sum of all factors is the product of the geometric series for each prime: (1+p₁+...+p₁^a)(1+p₂+...+p₂^b)... This is a fast, purely formulaic technique that avoids listing factors by hand.",
          "bullets": [
            "180 = 2² × 3² × 5¹. Number of factors = (2+1)(2+1)(1+1) = 3×3×2 = 18. Sum of factors = (1+2+4)(1+3+9)(1+5) = 7×13×6 = 546."
          ]
        }
      ],
      "commonPitfalls": [
        "Applying the divisibility-by-4 rule (last 2 digits) to check divisibility by 8, forgetting it needs the last 3 digits.",
        "Confusing HCF and LCM word problems — 'find when events coincide' always needs LCM, 'find the largest measure that divides evenly' always needs HCF.",
        "Forgetting the HCF × LCM = product identity, which is the fastest way to sanity-check an answer or solve for a missing number.",
        "Using the wrong cyclicity length — forgetting that when the exponent is exactly divisible by the cycle length, you use the LAST term of the cycle, not a 'remainder 0' term.",
        "Miscounting trailing zeros by including powers of 2 as well as 5 — only floor(n/5)+floor(n/25)+... matters since 2s are never the bottleneck.",
        "In base conversion, reading the remainders top-to-bottom instead of bottom-to-top, which reverses the answer."
      ],
      "keyTakeaways": [
        "Memorize divisibility rules for 2, 3, 4, 5, 8, 9, and 11 — they replace long division with a 5-second check.",
        "HCF × LCM = product of the two numbers; LCM solves 'coincide/repeat together' problems, HCF solves 'largest common measure' problems.",
        "Reduce huge exponents using cyclicity: find the repeat period of unit digits or remainders, then use exponent mod period.",
        "Trailing zeros in n! = floor(n/5) + floor(n/25) + floor(n/125) + ... (sum until the term becomes 0).",
        "Number of factors of p₁^a·p₂^b·... is (a+1)(b+1)...; sum of factors is the product of each prime's geometric series.",
        "For base conversion, repeated division and reading remainders bottom-up is faster and less error-prone than trial and error."
      ],
      "links": [
        {
          "label": "IndiaBix — Number System Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/number-system/"
        },
        {
          "label": "GeeksforGeeks — Aptitude Questions and Answers",
          "url": "https://www.geeksforgeeks.org/aptitude-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Percentages & ratios",
      "overview": "Percentages and ratios are the most frequently reused concepts across the entire aptitude syllabus — profit/loss, data interpretation, mixtures, and even time-speed-distance problems are often percentage or ratio problems wearing a different costume. The single biggest scoring opportunity here is also the single biggest trap: successive percentage changes do not add linearly, and most students lose easy marks assuming a 20% rise followed by a 20% fall nets to zero when it actually nets to a 4% loss. This sub-module covers percentage-to-fraction fluency, the successive-change formula, the crucial distinction between percentage points and percentage change, ratio and proportion mechanics, combining ratios across a shared term, and the alligation method for mixture problems — all worked through with real numbers so the shortcuts are internalized, not just memorized as formulas to forget under exam pressure.",
      "sections": [
        {
          "heading": "Percentage Basics and Fast Conversion",
          "body": "A percentage is just a fraction out of 100, and the fastest way to compute 'X% of Y' is to convert the percentage into its simplest fraction (10%=1/10, 12.5%=1/8, 25%=1/4, 33.33%=1/3) and multiply — much faster than long multiplication with decimals, especially under time pressure.",
          "bullets": [
            "Find 15% of 340 without a calculator: 340 × 15/100 = 340 × 3/20 = 51."
          ]
        },
        {
          "heading": "Successive Percentage Change — The Non-Additive Trap",
          "body": "When a value undergoes two percentage changes a% and b% in sequence, the net percentage change is NOT (a+b)%. The correct formula is: net% = a + b + (ab/100), where a loss is entered as a negative value. This single formula prevents the most common percentage error in placement tests.",
          "bullets": [
            "20% increase followed by a 20% decrease: net% = 20 + (-20) + (20 × -20)/100 = 0 - 4 = -4%. Net result is a 4% DECREASE, not 0%.",
            "10% increase followed by another 10% increase: net% = 10 + 10 + (10×10)/100 = 20 + 1 = 21%, not 20%."
          ]
        },
        {
          "heading": "Percentage Points vs Percentage Change",
          "body": "A rate moving from 5% to 8% has risen by 3 percentage points, but the percentage increase (relative change) is (3/5)×100 = 60%. News reports and exam questions frequently exploit this ambiguity, so always check whether a question asks for the absolute point difference or the relative percentage change.",
          "bullets": [
            "An interest rate rises from 5% to 8%: point increase = 3 percentage points; percentage increase = 3/5 × 100 = 60%. These are very different numbers answering different questions."
          ]
        },
        {
          "heading": "Ratio and Proportion Fundamentals",
          "body": "A ratio a:b:c divides a total into (a+b+c) equal parts, and each share is (that term's ratio value) × (total ÷ sum of ratio terms). Proportion problems (a:b :: c:d, so ad=bc) let you solve for an unknown term by cross-multiplication.",
          "bullets": [
            "Divide ₹750 among A, B, C in the ratio 2:3:5. Total parts = 10, so 1 part = ₹75. A = 150, B = 225, C = 375. Check: 150+225+375=750. ✓"
          ]
        },
        {
          "heading": "Combining Two Ratios With a Common Term",
          "body": "When two ratios share a common variable (e.g., A:B and B:C), scale both ratios so the shared term matches (using the LCM of its two values), then merge them into a single three-term ratio.",
          "bullets": [
            "A:B = 2:3 and B:C = 4:5. LCM of B's values (3 and 4) is 12. Scale A:B = 2:3 → 8:12, and B:C = 4:5 → 12:15. Combined: A:B:C = 8:12:15."
          ]
        },
        {
          "heading": "Maintaining Constant Value: Inverse Percentage Adjustment",
          "body": "When price and quantity have an inverse relationship (expenditure = price × quantity must stay fixed), a price increase of x% requires a quantity reduction of [x/(100+x)]×100 percent to keep total expenditure unchanged — not a reduction of x% itself, which is a very common error.",
          "bullets": [
            "Sugar price rises 25%. To keep monthly sugar expenditure unchanged, reduce consumption by [25/(100+25)]×100 = 20%, not 25%."
          ]
        },
        {
          "heading": "Alligation for Mixture Problems",
          "body": "The alligation rule finds the ratio in which two ingredients of different values must be mixed to get a desired average value: ratio = (higher value − mean value) : (mean value − lower value).",
          "bullets": [
            "Mix tea costing ₹40/kg with tea costing ₹60/kg to get a mixture costing ₹52/kg. Ratio = (60−52):(52−40) = 8:12 = 2:3. So mix cheaper:costlier in ratio 3:2 (cheaper tea gets the larger share, since the mean is closer to the cheaper price)."
          ]
        }
      ],
      "commonPitfalls": [
        "Adding successive percentage changes directly (20% up then 20% down = 0%) instead of using net% = a+b+ab/100 — the correct answer here is a 4% net loss.",
        "Confusing percentage points with percentage change — a rate moving from 5% to 8% is a 3-point rise but a 60% relative increase.",
        "Reducing consumption by the same percentage as a price increase to 'keep expenditure constant,' instead of using the inverse formula x/(100+x)×100.",
        "Combining two ratios without first scaling the shared term to a common value via LCM.",
        "Forgetting that a ratio must be simplified to lowest terms, or misreading 'divided in ratio' as 'divided equally.'",
        "In alligation, swapping which quantity gets the larger share — the ingredient closer in value to the mean gets the LARGER portion."
      ],
      "keyTakeaways": [
        "Net successive % change = a + b + (ab/100); never simply add two percentage changes.",
        "Percentage point difference ≠ percentage change — always check which one a question is asking for.",
        "To hold expenditure constant after a price change of x%, adjust quantity by x/(100+x)×100%, not by x% itself.",
        "Convert percentages to simple fractions (25%=1/4, 12.5%=1/8) for fast mental multiplication.",
        "Combine ratios by scaling the shared term to its LCM before merging.",
        "Alligation ratio = (higher − mean) : (mean − lower); the value closer to the mean gets the bigger share."
      ],
      "links": [
        {
          "label": "IndiaBix — Percentage Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/percentage/"
        },
        {
          "label": "IndiaBix — Ratio and Proportion",
          "url": "https://www.indiabix.com/aptitude/ratio-and-proportion/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Time, speed & distance",
      "overview": "Time-speed-distance (TSD) problems test the same core relationship — distance = speed × time — in progressively disguised forms: relative speed between moving bodies, average speed over unequal time or distance segments, trains crossing objects of their own length, boats moving with or against a current, and circular-track races. Nearly every failure on this topic traces back to one of two errors: forgetting to convert units consistently (km/h vs m/s) or applying a simple average where a weighted or harmonic average is actually required. This sub-module builds fluency with the core formula and its unit conversions, then works through every major disguised variant — relative speed, average speed, trains, boats and streams, and races — with a fully worked numerical example for each, so that recognizing which variant a word problem represents becomes automatic rather than something to puzzle out under time pressure.",
      "sections": [
        {
          "heading": "Core Formula and Unit Conversion",
          "body": "Distance = Speed × Time underlies every problem in this topic, but most errors come from inconsistent units. Converting km/h to m/s multiplies by 5/18; converting m/s to km/h multiplies by 18/5. Locking this conversion factor in as a reflex avoids a huge share of careless errors.",
          "bullets": [
            "Convert 72 km/h to m/s: 72 × 5/18 = 20 m/s. Convert 20 m/s back to km/h: 20 × 18/5 = 72 km/h. ✓"
          ]
        },
        {
          "heading": "Relative Speed: Same Direction vs Opposite Direction",
          "body": "When two bodies move toward each other, their speeds add (relative speed = s1+s2) and the time to meet = distance/(s1+s2). When moving in the same direction, relative speed is the difference (s1−s2), used for 'catching up' problems.",
          "bullets": [
            "Two trains 120 km apart move toward each other at 60 km/h and 40 km/h. Time to meet = 120/(60+40) = 1.2 hours = 72 minutes.",
            "A is 20 km ahead of B; A moves at 60 km/h and B chases at 40 km/h in the same direction. Time for B to catch up = 20/(60−40) = 1 hour."
          ]
        },
        {
          "heading": "Average Speed Is a Harmonic Mean, Not a Simple Average",
          "body": "When equal DISTANCES are covered at two different speeds, average speed = 2×s1×s2/(s1+s2) — the harmonic mean, which is always less than the simple average of the two speeds. (If equal TIME is spent at each speed instead, the simple average is correct — the distinction matters.)",
          "bullets": [
            "A travels half the distance at 60 km/h and the other half at 40 km/h. Average speed = 2×60×40/(60+40) = 4800/100 = 48 km/h — NOT the simple average of 50 km/h."
          ]
        },
        {
          "heading": "Trains Crossing Poles, Platforms, and Each Other",
          "body": "A train crossing a stationary point (pole/man) travels its own length; crossing a platform, it travels its own length PLUS the platform's length. When two trains cross each other, use relative speed (sum if opposite directions, difference if same direction) and total length = sum of both train lengths.",
          "bullets": [
            "A 150 m train crosses a pole in 10 seconds: speed = 150/10 = 15 m/s = 54 km/h.",
            "The same train (150 m, 15 m/s) crosses a 250 m platform: total distance = 400 m, time = 400/15 ≈ 26.7 seconds.",
            "A 100 m train and a 150 m train run toward each other at 40 km/h and 50 km/h. Relative speed = 90 km/h = 25 m/s; total length = 250 m; time to cross = 250/25 = 10 seconds."
          ]
        },
        {
          "heading": "Boats and Streams",
          "body": "If boat speed in still water is b and stream speed is s, downstream speed = b+s and upstream speed = b−s. Round-trip problems require calculating each leg's time separately (distance/downstream speed, then distance/upstream speed) and summing — they cannot be averaged directly.",
          "bullets": [
            "Boat speed in still water = 10 km/h, stream speed = 2 km/h. Downstream = 12 km/h, upstream = 8 km/h. For a 24 km trip each way: downstream time = 24/12 = 2 h, upstream time = 24/8 = 3 h. Total round trip = 5 hours."
          ]
        },
        {
          "heading": "Races and Head Starts",
          "body": "'A gives B a start of x meters in a race of d meters' means when A finishes d meters, B has covered (d−x) meters in the same time — giving the speed ratio of A:B directly as d:(d−x).",
          "bullets": [
            "A can give B a start of 20 m in a 100 m race (both finish together). Speed ratio A:B = 100:80 = 5:4."
          ]
        },
        {
          "heading": "Circular Track Meeting Problems",
          "body": "On a circular track of length L, two runners moving in the same direction meet again after time = L/(s1−s2); moving in opposite directions, they meet after time = L/(s1+s2). This is structurally identical to the linear relative-speed rule, just wrapped around a loop.",
          "bullets": [
            "Two runners on a 300 m circular track run in the same direction at 5 m/s and 3 m/s. They meet again after 300/(5−3) = 150 seconds."
          ]
        }
      ],
      "commonPitfalls": [
        "Forgetting to convert km/h to m/s (or vice versa) before combining with a distance given in a different unit.",
        "Averaging two speeds arithmetically when equal DISTANCE (not equal time) was covered at each speed — this needs the harmonic mean, 2s1s2/(s1+s2).",
        "Forgetting to add the platform's length to the train's own length when computing platform-crossing time.",
        "Using the sum of speeds for same-direction 'catching up' problems instead of the difference.",
        "In boats and streams, averaging upstream and downstream speed directly instead of calculating each leg's time separately when distances are equal but speeds differ.",
        "Misreading a race 'start' or 'beats by' statement and inverting the resulting speed ratio."
      ],
      "keyTakeaways": [
        "Lock in the conversion: km/h × 5/18 = m/s, and m/s × 18/5 = km/h.",
        "Opposite-direction relative speed adds; same-direction relative speed subtracts.",
        "Average speed for EQUAL DISTANCES is the harmonic mean 2s1s2/(s1+s2), always less than the simple average.",
        "Train crossing a platform: distance = train length + platform length; crossing a pole: distance = train length only.",
        "Boats and streams: downstream = b+s, upstream = b−s; compute each leg's time separately for round trips.",
        "A 'start of x in a race of d' gives speed ratio d:(d−x)."
      ],
      "links": [
        {
          "label": "IndiaBix — Time and Distance Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/time-and-distance/"
        },
        {
          "label": "IndiaBix — Boats and Streams",
          "url": "https://www.indiabix.com/aptitude/boats-and-streams/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Profit & loss",
      "overview": "Profit and loss questions test whether a candidate can correctly identify which value — cost price, marked price, or selling price — a given percentage is calculated against, since mixing these up is the single most common source of wrong answers on this topic. A markup is always applied to cost price, a discount is always applied to marked price, and profit/loss percentage is always calculated against cost price — three different bases that must never be confused. This sub-module works through the standard CP-SP-profit% relationship, the marked-price-and-discount combination (including the classic 'successive markup then discount' trap), false-weight dishonest-dealer problems, multi-stage transactions, partnership profit-sharing, and CP problems that include overhead expenses — each with a complete numerical solution so the underlying base-value logic, not just the final formula, becomes second nature.",
      "sections": [
        {
          "heading": "Core CP-SP-Profit% Relationship",
          "body": "Profit = SP − CP, and Profit% is always calculated on Cost Price: Profit% = (Profit/CP)×100. Loss% follows the same logic with Loss = CP − SP. Memorizing 'percentage is on CP, always' prevents the most common error on this topic.",
          "bullets": [
            "CP = ₹800, SP = ₹920. Profit = ₹120. Profit% = 120/800 × 100 = 15%."
          ]
        },
        {
          "heading": "Marked Price, Discount, and the Successive-Change Trap",
          "body": "Marked price (MP) is set above CP by a markup percentage; the actual selling price after a discount is applied to MP, not to CP. A markup followed by a discount is a successive percentage change (see the Percentages sub-module) and must never be treated as canceling out.",
          "bullets": [
            "A shopkeeper marks goods up 40% then gives a 25% discount. Let CP = 100. MP = 140. SP = 140 × 0.75 = 105. Net profit% = 5% — not a wash, despite the discount percentage exceeding the markup by nothing obvious at a glance."
          ]
        },
        {
          "heading": "False Weight (Dishonest Dealer) Problems",
          "body": "When a dealer sells at cost price but uses a weight less than what's claimed, the dealer's real profit% = (True weight − Used weight)/(Used weight) × 100 — the profit comes purely from the weight shortfall, not from any price markup.",
          "bullets": [
            "A dealer claims to sell at cost price but uses a 900 g weight for a claimed 1 kg. Real profit% = (1000−900)/900 × 100 = 11.11%."
          ]
        },
        {
          "heading": "Successive Transactions (Buying and Reselling)",
          "body": "When an item changes hands more than once, each sale's profit/loss percentage applies to that transaction's own CP (the previous SP), not to the original CP — chain the transactions sequentially rather than adding percentages.",
          "bullets": [
            "A buys an item for ₹1000 and sells to B at 20% profit: SP to B = ₹1200. B then sells to C at a 10% loss: SP to C = 1200 × 0.9 = ₹1080. Overall, ₹1000 became ₹1080 — a net 8% profit over the two transactions (not 20%−10%=10%)."
          ]
        },
        {
          "heading": "Partnership Profit Sharing",
          "body": "When partners invest different amounts for different durations, profit is shared in the ratio of (investment × time) for each partner, not simply the investment ratio alone.",
          "bullets": [
            "A invests ₹5000 for 12 months, B invests ₹6000 for 8 months. Ratio = (5000×12):(6000×8) = 60000:48000 = 5:4. If total profit is ₹9000, A gets ₹5000 and B gets ₹4000."
          ]
        },
        {
          "heading": "Reverse Problems: Finding MP or CP From SP",
          "body": "Many exam questions give the final SP and a discount or profit percentage and ask you to work backward to MP or CP — this requires dividing by (1 ± percentage), not multiplying, since the percentage was originally applied forward to the unknown value.",
          "bullets": [
            "An item sells for ₹450 after a 10% discount. MP × 0.9 = 450, so MP = 450/0.9 = ₹500."
          ]
        },
        {
          "heading": "Cost Price Including Overhead Expenses",
          "body": "Real CP for profit% calculations must include all expenses incurred before sale (repairs, transport, packaging) — using only the purchase price and ignoring overheads understates the true cost base and overstates the profit percentage.",
          "bullets": [
            "An article is bought for ₹1200, with ₹300 spent on repairs, then sold for ₹1800. True CP = 1200+300 = ₹1500. Profit = 1800−1500 = ₹300. Profit% = 300/1500 × 100 = 20% (not 300/1200 = 25%, which ignores the overhead)."
          ]
        }
      ],
      "commonPitfalls": [
        "Calculating discount on CP instead of MP, or markup on SP instead of CP — always: markup is on CP, discount is on MP.",
        "Assuming a markup% and a larger discount% of the same numeric value cancel to a net loss — always compute using net% = a+b+ab/100.",
        "In false-weight problems, calculating profit% on the claimed weight instead of the actually-used (smaller) weight.",
        "Adding profit and loss percentages across successive transactions instead of chaining each one onto the previous SP.",
        "Using investment amount alone for partnership profit-sharing, ignoring the time each partner's capital was invested.",
        "Forgetting to include overhead/incidental expenses in CP before calculating profit percentage.",
        "When working backward from SP to find MP or CP, subtracting the percentage instead of dividing by (1 ± percentage/100)."
      ],
      "keyTakeaways": [
        "Profit% and Loss% are always calculated on Cost Price — never on SP or MP.",
        "Markup applies to CP to get MP; discount applies to MP to get SP — two different base values, never interchange them.",
        "False-weight profit% = (claimed weight − used weight)/(used weight) × 100.",
        "Chain successive transactions sequentially (each SP becomes the next CP) rather than adding percentages.",
        "Partnership profit ratio = (investment × time) for each partner, not investment alone.",
        "To reverse-solve for MP/CP from a known SP, divide by (1 ± rate/100), don't just subtract the percentage."
      ],
      "links": [
        {
          "label": "IndiaBix — Profit and Loss Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/profit-and-loss/"
        },
        {
          "label": "Investopedia — Gross Profit Margin",
          "url": "https://www.investopedia.com/terms/g/grossprofitmargin.asp"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Data interpretation",
      "overview": "Data interpretation (DI) questions test whether a candidate can extract and compute accurately from tables, bar graphs, pie charts, line graphs, and short caselets under time pressure — the underlying arithmetic is usually simple, but the challenge is reading the right numbers off the right chart and knowing when to approximate versus calculate exactly. Most points are lost not from wrong formulas but from misreading axis scales, using the wrong base year for a percentage change, or spending too long on an exact calculation when a rounded estimate would eliminate three of four answer options instantly. This sub-module covers each major chart type with a fully worked numeric example, plus dedicated coverage of approximation techniques for speed and cross-category averaging, since DI sets are usually timed as a block and reward a consistent, fast reading-and-computing method over raw calculation speed alone.",
      "sections": [
        {
          "heading": "Reading Tables Accurately",
          "body": "Table-based DI tests careful reading above all — identify the correct row/column intersection, and for 'percentage change' questions always divide by the EARLIER year's value (the base), not the later one.",
          "bullets": [
            "A company's sales (in ₹ lakh) were: 2019: 120, 2020: 150, 2021: 135, 2022: 180. Percentage change from 2021 to 2022 = (180−135)/135 × 100 = 33.33%."
          ]
        },
        {
          "heading": "Bar Graphs and Share of Total",
          "body": "Bar graphs commonly ask for one category's share of the total across all bars — sum every bar first, then divide the target bar by that sum.",
          "bullets": [
            "Five products A–E have sales of 40, 60, 50, 70, 30 (in units). Total = 250. Product D's share = 70/250 × 100 = 28%."
          ]
        },
        {
          "heading": "Pie Charts: Degrees, Percentages, and Absolute Values",
          "body": "A pie chart's full circle is 360° = 100%, so any sector's percentage = (sector degrees/360)×100, and converting to an absolute value requires multiplying that percentage by the given total.",
          "bullets": [
            "A 72° sector represents 72/360 × 100 = 20% of the total.",
            "If total students = 500 and the Engineering sector spans 90°, students in Engineering = 90/360 × 500 = 125."
          ]
        },
        {
          "heading": "Line Graphs and Trend Questions",
          "body": "Line graphs are typically used for average, trend, and rate-of-change questions across a sequence of points — read each point carefully off the y-axis before summing, since misreading even one point shifts the average.",
          "bullets": [
            "A line graph shows daily temperatures over 5 days: 20, 22, 19, 25, 23 (°C). Average = (20+22+19+25+23)/5 = 109/5 = 21.8°C."
          ]
        },
        {
          "heading": "Caselet-Based DI",
          "body": "Caselets present data as a short paragraph rather than a chart, requiring you to first extract the relevant numbers into a mental (or scratch-paper) table before answering — treat this as a two-step process: extraction, then calculation.",
          "bullets": [
            "A shop sold Pen A: 200 units at ₹10, Pen B: 150 units at ₹15, Pen C: 100 units at ₹20. Total revenue = 2000+2250+2000 = ₹6250. Pen B's revenue share = 2250/6250 × 100 = 36%."
          ]
        },
        {
          "heading": "Approximation Techniques for Speed",
          "body": "When answer options are far apart, round the numbers to the nearest convenient value before dividing — this gets close enough to eliminate wrong options in a fraction of the time an exact calculation would take.",
          "bullets": [
            "Estimate 4875/62 quickly: round to 4900/60 ≈ 81.7. The exact value (≈78.6) is close enough that if the options are 40, 79, 120, and 200, the approximation immediately identifies 79 without long division."
          ]
        },
        {
          "heading": "Comparing Averages and Ratios Across Categories",
          "body": "Questions that ask you to compare two data series (e.g., two companies' profits over several years) usually reduce to computing each series' average and then forming a ratio — do each average separately before comparing, rather than trying to compare running totals.",
          "bullets": [
            "Company X's profits over 3 years: 100, 120, 140 (avg = 120). Company Y's profits: 90, 110, 130 (avg = 110). Ratio of average profits X:Y = 120:110 = 12:11."
          ]
        }
      ],
      "commonPitfalls": [
        "Calculating a percentage change using the later year as the base instead of the earlier (original) year.",
        "Misreading a bar or line graph's y-axis scale, especially when it doesn't start at zero or uses non-uniform gridlines.",
        "Converting a pie chart sector to a percentage using the wrong total (forgetting the full circle is 360°, not 100).",
        "Spending time on exact long division in a DI set when the answer options are far enough apart for approximation to work.",
        "In caselets, answering from memory of the paragraph instead of re-extracting the exact numbers needed for that specific question.",
        "Comparing two data series by eyeballing totals instead of computing and comparing actual averages or ratios."
      ],
      "keyTakeaways": [
        "Percentage change always divides by the earlier (base) value, never the later value.",
        "Pie chart sector % = (degrees/360) × 100; multiply by the given total to get absolute values.",
        "A category's share of a bar/pie total = that category's value ÷ sum of all categories.",
        "Approximate aggressively when answer options are far apart — exact precision wastes time DI sets don't allow.",
        "In caselets, extract numbers into a mini-table first, then compute — don't calculate from memory of the prose.",
        "Compute each series' own average before forming a comparison ratio between two data sets."
      ],
      "links": [
        {
          "label": "IndiaBix — Data Interpretation Questions",
          "url": "https://www.indiabix.com/aptitude/data-interpretation/"
        },
        {
          "label": "GeeksforGeeks — Aptitude Questions and Answers",
          "url": "https://www.geeksforgeeks.org/aptitude-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Simple & Compound Interest",
      "overview": "Interest problems test whether a candidate understands that money grows differently depending on whether interest is paid only on the original principal (simple interest) or on the accumulating balance (compound interest) — a distinction that becomes the source of almost every wrong answer on this topic when candidates apply SI logic to a CI question or vice versa. Beyond the basic formulas, placement tests love variations: compounding more frequently than once a year, different interest rates in successive years, and loans repaid through equal installments rather than a single lump sum. This sub-module builds the SI and CI formulas from first principles, covers the fast shortcut formulas for the difference between CI and SI over two and three years (a frequent exam favorite), and works through compounding frequency, variable rates, effective vs nominal rates, and installment-based repayment — each demonstrated with a complete worked calculation so the underlying compounding logic, not just a memorized formula, carries into any disguised version of the question.",
      "sections": [
        {
          "heading": "Simple Interest Basics",
          "body": "Simple interest is calculated only on the original principal for every period, using SI = (P × R × T)/100, where P is principal, R is the annual rate percent, and T is time in years. The total amount owed or earned is A = P + SI. Because the base for interest never changes, SI grows linearly with time — equal amounts of interest accrue in every year.",
          "bullets": [
            "Find the simple interest on ₹5000 at 8% per annum for 3 years. SI = (5000 × 8 × 3)/100 = ₹1200. Amount = 5000 + 1200 = ₹6200."
          ]
        },
        {
          "heading": "Compound Interest Basics: Amount and CI Formula",
          "body": "Compound interest is calculated on the principal PLUS all previously accumulated interest, so the base grows every period. Amount A = P(1 + R/100)ⁿ, where n is the number of compounding periods, and CI = A − P. Because interest earns interest, CI always exceeds SI for the same P, R, and T beyond the first period, and the gap widens every additional year.",
          "bullets": [
            "Find the compound interest on ₹5000 at 10% per annum for 2 years, compounded annually. A = 5000 × (1.1)² = 5000 × 1.21 = ₹6050. CI = 6050 − 5000 = ₹1050 (compare to SI for the same figures: 5000×10×2/100 = ₹1000 — CI is ₹50 more, purely from interest earning interest in year 2)."
          ]
        },
        {
          "heading": "Difference Between CI and SI: Two-Year and Three-Year Shortcuts",
          "body": "For 2 years, the CI−SI difference equals P × (R/100)² — this is exactly the interest earned on the first year's interest during the second year. For 3 years, the shortcut is CI−SI = P × R² × (300+R)/10⁶. These formulas let you skip computing both CI and SI in full when a question only asks for the difference.",
          "bullets": [
            "P = ₹8000, R = 5%, T = 2 years. Difference = 8000 × (5/100)² = 8000 × 0.0025 = ₹20. Verify: SI = 8000×5×2/100 = 800; CI: A = 8000×1.05² = 8820, CI = 820; difference = 820−800 = 20. ✓",
            "P = ₹10000, R = 10%, T = 3 years. Difference = (10000 × 10² × 310)/10⁶ = (10000×100×310)/1000000 = 310. Verify: SI = 10000×10×3/100 = 3000; CI: A = 10000×1.1³ = 13310, CI = 3310; difference = 3310−3000 = 310. ✓"
          ]
        },
        {
          "heading": "Compounding More Than Once a Year",
          "body": "When interest compounds half-yearly, halve the annual rate and double the number of periods; when it compounds quarterly, quarter the rate and quadruple the periods. The formula becomes A = P(1 + r/100)ⁿ using the ADJUSTED rate and period count, not the original annual figures.",
          "bullets": [
            "₹10000 at 10% per annum, compounded half-yearly, for 1 year: rate per half-year = 5%, periods = 2. A = 10000 × (1.05)² = 10000 × 1.1025 = ₹11025 (higher than annual compounding's ₹11000, since interest compounds more often)."
          ]
        },
        {
          "heading": "Compound Interest With Different Rates in Successive Years",
          "body": "When the rate changes each year, apply each year's growth factor sequentially rather than using a single averaged rate — the amount becomes P × (1+r₁/100) × (1+r₂/100) × (1+r₃/100)... for however many years are given.",
          "bullets": [
            "₹1000 invested for 3 years at 5%, then 6%, then 7% in successive years. A = 1000 × 1.05 × 1.06 × 1.07 = 1000 × 1.19091 = ₹1190.91. CI = ₹190.91 (using the average rate of 6% instead would incorrectly give A = 1000×1.06³ = ₹1191.02, a close but wrong shortcut)."
          ]
        },
        {
          "heading": "Effective Annual Rate vs Nominal Rate",
          "body": "The nominal (stated) annual rate understates the true annual growth once compounding happens more than once a year. The effective annual rate = (1 + r/n)ⁿ − 1, where r is the nominal rate and n is the number of compounding periods per year — this is the rate that would produce the same growth if compounded only once annually.",
          "bullets": [
            "A nominal rate of 10% compounded half-yearly has an effective annual rate = (1 + 0.10/2)² − 1 = (1.05)² − 1 = 1.1025 − 1 = 0.1025 = 10.25%, not 10%."
          ]
        },
        {
          "heading": "Installments: Repaying a Compound-Interest Loan in Equal Annual Payments",
          "body": "When a loan is repaid through equal annual installments at compound interest, each installment's present value equals installment ÷ (1+r/100)^k for the year k it's paid in; the sum of all installments' present values must equal the original loan amount. This requires DISCOUNTING future payments, not simply totaling them.",
          "bullets": [
            "A loan is repaid in 2 equal annual installments of ₹6600 each, with interest at 10% per annum. Find the loan amount. Loan = 6600/1.1 + 6600/1.1² = 6000 + 5454.55 = ₹11454.55 (simply adding 6600+6600=13200 and ignoring the time value of money is the classic wrong shortcut here)."
          ]
        }
      ],
      "commonPitfalls": [
        "Applying the simple interest formula's flat rate directly to compound interest without accounting for compounding periods.",
        "Forgetting to halve the rate and double the time period (or quarter/quadruple for quarterly compounding) when compounding happens more than once a year.",
        "Using the ORIGINAL principal instead of the previous year's amount when rates differ across successive years.",
        "Confusing nominal rate with effective annual rate, especially in compare-two-schemes questions.",
        "Applying the 3-year CI−SI difference formula when only 2 years are given (or vice versa) — the two shortcut formulas are not interchangeable.",
        "In installment problems, simply summing the installment amounts instead of discounting each one back to present value by (1+r/100)^k.",
        "Forgetting that CI always exceeds SI beyond year 1, so a CI answer smaller than the equivalent SI answer signals a calculation error."
      ],
      "keyTakeaways": [
        "SI = (P×R×T)/100; Amount = P + SI.",
        "CI: Amount = P(1+R/100)ⁿ; CI = Amount − P.",
        "CI−SI shortcut for 2 years = P(R/100)²; for 3 years = P·R²·(300+R)/10⁶.",
        "Half-yearly compounding: halve the rate, double the periods. Quarterly: quarter the rate, quadruple the periods.",
        "Effective annual rate = (1+r/n)ⁿ − 1, always ≥ the nominal rate when n > 1.",
        "For variable yearly rates, multiply successive growth factors — never average the rates.",
        "Installment repayment: each future installment must be discounted back to present value by dividing by (1+r/100) raised to its year number."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Compound Interest Formula and Problems",
          "url": "https://www.geeksforgeeks.org/maths/compound-interest/"
        },
        {
          "label": "IndiaBix — Simple Interest Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/simple-interest/"
        },
        {
          "label": "IndiaBix — Compound Interest Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/compound-interest/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Averages",
      "overview": "Averages appear constantly across placement tests, both as standalone questions and as a hidden step inside age, speed, and data-interpretation problems, yet a large share of errors come from a single careless habit: updating the sum of a group without correspondingly updating the count (or vice versa) when a value is added, removed, or replaced. Averages questions reward a specific mental model — total = average × count — used forwards and backwards depending on what's given. This sub-module covers the basic sum-total relationship, averages of consecutive numbers and arithmetic progressions, the effect of adding or removing a value, the classic 'replace one group member' problem type, weighted averages across groups of different sizes, combining two groups' averages, and age-based average traps — each demonstrated with a complete numerical solution so the total-count bookkeeping becomes automatic.",
      "sections": [
        {
          "heading": "Average Basics: The Sum-Total Relationship",
          "body": "Average = Sum of values ÷ Number of values, which rearranges to Sum = Average × Count — this rearranged form is what actually gets used in most exam questions, since the sum is rarely given directly. Every averages problem is really a bookkeeping exercise in tracking total and count correctly as they change.",
          "bullets": [
            "Find the average of 12, 15, 9, 22, and 18. Sum = 12+15+9+22+18 = 76. Average = 76/5 = 15.2."
          ]
        },
        {
          "heading": "Average of Consecutive Numbers and Arithmetic Progressions",
          "body": "For any evenly spaced (arithmetic) sequence — consecutive integers, consecutive even/odd numbers, or a general AP — the average is simply (first term + last term)/2, since the values are symmetric around the midpoint. This avoids manually summing every term.",
          "bullets": [
            "Find the average of all integers from 21 to 35 (15 numbers). Average = (21+35)/2 = 28. Sum = 28 × 15 = 420 (much faster than adding 15 numbers individually)."
          ]
        },
        {
          "heading": "Effect on Average When a Value Is Added or Removed",
          "body": "Adding a new value changes both the sum (add the new value) and the count (add 1) — the new average is (old sum + new value)/(old count + 1). Removing a value subtracts it from the sum and subtracts 1 from the count. A very common error is updating only the sum and forgetting the count also changes.",
          "bullets": [
            "8 numbers average 20 (sum = 160). A 9th number, 38, is added. New average = (160+38)/9 = 198/9 = 22.",
            "10 numbers average 25 (sum = 250). The number 40 is removed. New average of the remaining 9 = (250−40)/9 = 210/9 = 23.33."
          ]
        },
        {
          "heading": "Replacing a Group Member: Change in Average",
          "body": "When one member of a fixed-size group is replaced by another, the TOTAL change in sum equals (change in average) × (group size), and this total change equals exactly the difference between the new member's value and the old member's value. This gives a direct way to find the new (or old) member's value without recomputing every value in the group.",
          "bullets": [
            "The average weight of 20 boys is 45 kg. One boy weighing 35 kg leaves and is replaced by a new boy, after which the average becomes 45.5 kg. Total increase in sum = 20 × 0.5 = 10 kg. Since this increase equals (new boy's weight − 35), the new boy weighs 35 + 10 = 45 kg."
          ]
        },
        {
          "heading": "Weighted Average of Two or More Groups",
          "body": "When combining groups of different sizes, the combined average is NOT the simple average of the group averages — it must be weighted by each group's size: combined average = (n₁a₁ + n₂a₂)/(n₁+n₂), where n is each group's count and a is its average.",
          "bullets": [
            "Class A has 30 students averaging 70 marks; Class B has 20 students averaging 80 marks. Combined average = (30×70 + 20×80)/(30+20) = (2100+1600)/50 = 3700/50 = 74 — closer to 70 than to the midpoint 75, because the larger group (A) pulls the weighted average toward itself."
          ]
        },
        {
          "heading": "Age-Based Average Problems",
          "body": "Age-average problems usually hinge on the same replace-or-add logic as weight/marks problems, but with an added twist: including a new member (like a teacher joining a class average) changes both the count and the sum, and the increase in average must be multiplied by the NEW total count, not the old one, to find the new member's value.",
          "bullets": [
            "The average age of 30 students in a class is 12 years. When the teacher's age is also included, the average increases by 1 year. New count = 31, new average = 13, so new total = 31×13 = 403. Original total = 30×12 = 360. Teacher's age = 403 − 360 = 43 years."
          ]
        },
        {
          "heading": "Combining Averages Across Categories",
          "body": "When a question gives multiple sub-groups' individual averages and asks for an overall figure, first convert every average back into a total (using average × count), sum all the totals, sum all the counts, and only then divide — never average the averages directly unless every group is exactly the same size.",
          "bullets": [
            "Three sections of a class have 25, 30, and 20 students, with average marks 60, 70, and 65 respectively. Overall average = (25×60 + 30×70 + 20×65)/(25+30+20) = (1500+2100+1300)/75 = 4900/75 ≈ 65.33 — not the same as the simple average of 60, 70, 65, which would be 65."
          ]
        }
      ],
      "commonPitfalls": [
        "Updating only the sum (not the count) or only the count (not the sum) when a value is added to or removed from a group.",
        "Averaging two or more group averages directly instead of weighting by each group's size.",
        "In replacement problems, computing the TOTAL change correctly but forgetting to add it to the old value rather than the average.",
        "Multiplying an average's increase by the OLD count instead of the NEW (post-inclusion) count when a new member joins the group.",
        "Assuming average of consecutive numbers requires summing every term instead of using (first+last)/2.",
        "Treating 'divided among' or 'shared equally' language as an averages problem when it is actually a ratio problem, or vice versa.",
        "Forgetting that removing the highest or lowest value from a data set changes both the sum and the count, not just the sum."
      ],
      "keyTakeaways": [
        "Sum = Average × Count — the relationship used forwards or backwards depending on what the question gives.",
        "Average of consecutive/evenly spaced numbers = (first term + last term)/2.",
        "Adding or removing a value changes BOTH sum and count — update both before recomputing the average.",
        "Replacing a group member: (new value − old value) = (change in average) × (group size).",
        "Weighted average = (n₁a₁+n₂a₂+...)/(n₁+n₂+...); never average averages of unequal-sized groups directly.",
        "When a new member joins and the average shifts by d, the new member's value = old average + d × new total count.",
        "To combine several sub-group averages into one overall average, convert each back to a total first, then divide by the combined count."
      ],
      "links": [
        {
          "label": "IndiaBix — Average Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/average/"
        },
        {
          "label": "GeeksforGeeks — Aptitude Questions and Answers",
          "url": "https://www.geeksforgeeks.org/aptitude-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Ratio & Proportion (Advanced)",
      "overview": "Beyond the basic 'divide a total in a given ratio' questions covered in the Percentages & Ratios sub-module, placement tests probe a deeper toolkit: distinguishing direct from inverse proportion, continued proportion and mean/third proportionals, the componendo-dividendo algebraic shortcut, joint variation combining direct and inverse relationships, and ratio problems involving ages across time. The single most useful technique across all of these is the 'k-method' — representing an unknown ratio a:b:c as 2k:3k:5k and solving for k algebraically — which converts almost any ratio word problem into a one-variable linear equation. This sub-module works through each advanced ratio pattern with a complete worked example, building the algebraic fluency needed to recognize which technique a disguised ratio question actually requires.",
      "sections": [
        {
          "heading": "Direct and Inverse Proportion",
          "body": "In direct proportion, two quantities increase or decrease together, keeping their ratio constant (x/y = k). In inverse proportion, one quantity increases as the other decreases, keeping their PRODUCT constant (xy = k). Misidentifying which relationship applies is the most common error — 'more workers, fewer days' is inverse; 'more items, proportionally more cost' is direct.",
          "bullets": [
            "Direct: 5 kg of apples cost ₹250. Cost per kg = 50, so 8 kg costs 8×50 = ₹400.",
            "Inverse: 5 workers complete a task in 12 days. How many days would 15 workers take (same total work)? Since days ∝ 1/workers, 5×12 = 15×d ⇒ d = 4 days."
          ]
        },
        {
          "heading": "Continued Proportion, Mean Proportional, and Third Proportional",
          "body": "Three quantities a, b, c are in continued proportion if a:b = b:c, which means b² = ac — b is called the mean proportional between a and c. The third proportional to a and b is the value x such that a:b = b:x, giving x = b²/a.",
          "bullets": [
            "Mean proportional between 4 and 9 = √(4×9) = √36 = 6.",
            "Third proportional to 4 and 8: 4:8 :: 8:x ⇒ x = 8²/4 = 64/4 = 16."
          ]
        },
        {
          "heading": "Componendo and Dividendo",
          "body": "If a/b = c/d, then componendo-dividendo states (a+b)/(a−b) = (c+d)/(c−d). This rule is used to simplify equations involving sums and differences of square roots or fractions that would otherwise require messy algebra to isolate a variable.",
          "bullets": [
            "Verify with a=8, b=2, c=12, d=3 (both ratios equal 4): (a+b)/(a−b) = 10/6 = 5/3, and (c+d)/(c−d) = 15/9 = 5/3 — confirming the rule holds, which is how it's used to convert a hard-to-isolate equation into a simpler one."
          ]
        },
        {
          "heading": "The k-Method for Solving Ratio Equations",
          "body": "Whenever a ratio a:b:c is given alongside an additional condition (a sum, a difference, or a product), represent the terms as 2k, 3k, 5k (matching the given ratio) and substitute into the condition to solve for k first — then multiply back to get each actual value. This turns almost any ratio word problem into simple linear algebra.",
          "bullets": [
            "a:b:c = 2:3:5 and a+b+c = 40. Let a=2k, b=3k, c=5k. Then 10k = 40 ⇒ k = 4. So a=8, b=12, c=20."
          ]
        },
        {
          "heading": "Joint Variation: Combining Direct and Inverse Relationships",
          "body": "When a quantity y varies directly with one variable and inversely with another simultaneously, write y = k·x/z, find the constant k from one known set of values, then use it to solve for an unknown in a different scenario.",
          "bullets": [
            "y varies directly with x and inversely with z. When x=5, z=2, y=10. Find k: 10 = k×5/2 ⇒ k=4. Find y when x=8, z=4: y = 4×8/4 = 8."
          ]
        },
        {
          "heading": "Ratios Involving Ages Across Time",
          "body": "Age-ratio problems require adding or subtracting the SAME number of years to BOTH terms of the ratio when moving to a future or past time — the ratio itself changes because the years added represent a smaller relative change to the older person's age.",
          "bullets": [
            "The present ages of A and B are in the ratio 3:5. After 6 years, the ratio becomes 2:3. Let A=3x, B=5x. Then (3x+6)/(5x+6) = 2/3 ⇒ 3(3x+6) = 2(5x+6) ⇒ 9x+18 = 10x+12 ⇒ x=6. Present ages: A=18, B=30."
          ]
        },
        {
          "heading": "Duplicate, Sub-Duplicate, and Triplicate Ratios",
          "body": "The duplicate ratio of a:b is a²:b²; the sub-duplicate ratio is √a:√b; the triplicate ratio is a³:b³. These are distinct from simply doubling or tripling a ratio's terms (2a:2b), which is not a different ratio at all — a frequent point of confusion.",
          "bullets": [
            "Duplicate ratio of 3:4 = 3²:4² = 9:16.",
            "Sub-duplicate ratio of 16:25 = √16:√25 = 4:5."
          ]
        }
      ],
      "commonPitfalls": [
        "Setting up a direct-proportion equation for a scenario that is actually inversely proportional (or vice versa), especially in 'more workers/less time' style problems.",
        "Believing continued proportion means b = ac instead of the correct b² = ac.",
        "Applying componendo-dividendo with the wrong sign, e.g. using (a−b)/(a+b) instead of (a+b)/(a−b).",
        "Forgetting to solve for k first in the k-method — plugging ratio terms like 2 and 3 directly into a condition instead of 2k and 3k.",
        "Confusing the duplicate ratio (a²:b²) with simply doubling the ratio's terms (2a:2b) — these are entirely different operations.",
        "In age-ratio problems, applying the given ratio to only one term's future/past value while leaving the other term unchanged.",
        "Mixing up mean proportional (√(ac), the middle term of a 3-term continued proportion) with a simple average of a and c."
      ],
      "keyTakeaways": [
        "Direct proportion: x/y = constant; inverse proportion: x×y = constant — identify which relationship a scenario describes before setting up the equation.",
        "Mean proportional between a and c = √(ac); third proportional to a, b = b²/a.",
        "Componendo-dividendo: if a/b=c/d, then (a+b)/(a−b) = (c+d)/(c−d).",
        "Use the k-method — write ratio terms as 2k, 3k, 5k — to convert any ratio word problem into solvable linear algebra.",
        "Joint variation: y = k·x/z; find k from one known scenario, then apply it to solve for unknowns in another.",
        "Duplicate ratio = a²:b², sub-duplicate = √a:√b, triplicate = a³:b³ — none of these equal simply scaling the ratio's terms.",
        "In age-ratio problems, add/subtract the same number of years to BOTH terms before re-forming the ratio for a different time."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Ratio and Proportion",
          "url": "https://www.geeksforgeeks.org/maths/ratio-and-proportion/"
        },
        {
          "label": "IndiaBix — Ratio and Proportion Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/ratio-and-proportion/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Mixtures & Alligations",
      "overview": "Building on the basic two-ingredient alligation rule, placement tests frequently extend mixture problems into more intricate territory: repeatedly withdrawing and replacing part of a mixture with a pure ingredient (the classic milk-and-water dilution problem), mixing three or more ingredients at once, working backward from a final ratio to find how much of an ingredient must be added, and applying the alligation cross to non-price quantities like exam marks or population averages. The core alligation rule never changes — ratio = (higher value − mean) : (mean − lower value) — but recognizing which value plays which role in a disguised word problem is the real skill being tested. This sub-module works through repeated dilution, multi-ingredient mixing, reverse alligation, and non-price alligation applications with complete worked numbers, extending the foundational rule into every commonly tested variant.",
      "sections": [
        {
          "heading": "The Alligation Cross: Quick Recap",
          "body": "To mix two ingredients of different values to hit a target mean value, the ratio in which they must be combined is (higher value − mean) : (mean − lower value) — this comes directly from balancing the 'excess' and 'deficit' around the mean.",
          "bullets": [
            "Mix milk (₹50/L) with water (₹0/L) to get a mixture worth ₹40/L. Ratio milk:water = (40−0):(50−40) = 40:10 = 4:1."
          ]
        },
        {
          "heading": "Repeated Dilution: Replacing Part of a Mixture With Pure Liquid",
          "body": "When a fixed quantity is withdrawn from a vessel and replaced with a pure second liquid, and this process repeats n times, the amount of the ORIGINAL liquid remaining follows: final quantity = P × (1 − x/P)ⁿ, where P is the total volume and x is the amount withdrawn (and replaced) each time. This is not a linear reduction — each successive withdrawal removes a smaller absolute amount of the original liquid because it's more diluted.",
          "bullets": [
            "A vessel contains 40 L of pure milk. 4 L is withdrawn and replaced with water, and this is repeated 3 times in total. Milk remaining = 40 × (1 − 4/40)³ = 40 × (0.9)³ = 40 × 0.729 = 29.16 L."
          ]
        },
        {
          "heading": "Single Withdrawal-and-Replacement as a Special Case",
          "body": "A single withdrawal-and-replacement is just the n=1 case of the repeated dilution formula, and can be verified directly by simple subtraction — useful as a sanity check before trusting the formula on a multi-step version.",
          "bullets": [
            "A vessel has 20 L of pure milk. 4 L is withdrawn (leaving 16 L of milk) and replaced with 4 L of water. Direct check: 16 L milk remains. Formula check: 20 × (1 − 4/20)¹ = 20 × 0.8 = 16 L. ✓"
          ]
        },
        {
          "heading": "Mixing Three or More Ingredients",
          "body": "When quantities of three or more ingredients are already known (as a ratio), the resulting mixture's average value is simply the weighted average: Σ(quantity × value) ÷ Σ(quantity). When quantities are EQUAL, this collapses to the plain arithmetic mean of the values.",
          "bullets": [
            "Three teas costing ₹50, ₹60, and ₹65 per kg are mixed in the ratio 2:3:5. Average price = (2×50 + 3×60 + 5×65)/(2+3+5) = (100+180+325)/10 = 605/10 = ₹60.50 per kg."
          ]
        },
        {
          "heading": "Reverse Alligation: Finding the Quantity to Change a Given Ratio",
          "body": "Some problems give a mixture's current ratio and total volume, then ask how much of one ingredient must be ADDED to reach a new target ratio. Since adding pure ingredient changes only that ingredient's quantity (the other stays fixed), set up a direct equation using the unchanged term.",
          "bullets": [
            "A 24 L mixture of milk and water is in the ratio 5:1 (so 20 L milk, 4 L water). How much water must be added to make the ratio 5:3? Milk stays at 20 L. 20/(new water) = 5/3 ⇒ new water = 12 L. Water to add = 12 − 4 = 8 L."
          ]
        },
        {
          "heading": "Alligation Applied to Non-Price Averages",
          "body": "The alligation rule works identically for any weighted-average scenario, not just prices — exam marks, population growth rates, or speeds split between two sub-groups can all be alligated the same way once you identify which quantity is the 'higher value,' which is the 'lower value,' and which is the overall mean.",
          "bullets": [
            "A class's overall average score is 68. Students who passed averaged 75; students who failed averaged 40. Find the percentage of students who passed. Ratio passed:failed = (68−40):(75−68) = 28:7 = 4:1. So passed fraction = 4/5 = 80%."
          ]
        },
        {
          "heading": "Adding Pure Ingredient to an Existing Mixture",
          "body": "Adding a pure ingredient to an existing mixture increases only that ingredient's amount while the other ingredient's quantity stays fixed — this is a direct application of the reverse-alligation logic in Section 5, but framed as 'add milk' rather than 'add water,' and is common enough to warrant its own recognition.",
          "bullets": [
            "A 40 L mixture contains milk and water in the ratio 3:1 (30 L milk, 10 L water). How much pure milk must be added to change the ratio to 4:1? Water stays at 10 L. (30+x)/10 = 4/1 ⇒ 30+x = 40 ⇒ x = 10 L of milk must be added."
          ]
        }
      ],
      "commonPitfalls": [
        "Setting up the alligation cross with the subtraction order reversed — it's always (higher − mean) : (mean − lower), not the other way around.",
        "In repeated-dilution problems, subtracting the withdrawn fraction n times (linear approximation) instead of raising (1 − x/P) to the power n.",
        "Forgetting that withdrawing and replacing with water keeps the TOTAL volume constant — only the milk quantity decreases.",
        "In reverse-alligation problems, changing both terms of the ratio proportionally instead of recognizing that adding a pure ingredient only changes ONE term.",
        "Assuming a three-or-more-ingredient mixture's average is always the simple arithmetic mean, forgetting this is only true when quantities are equal.",
        "Working with ratio numbers directly as if they were actual quantities, instead of first converting the ratio into real liters/kg using the given total.",
        "Applying alligation to a scenario that requires a straightforward weighted average, adding unnecessary complexity instead of computing Σ(qty×value)/Σ(qty) directly."
      ],
      "keyTakeaways": [
        "Alligation ratio = (higher value − mean) : (mean − lower value).",
        "Repeated dilution: final quantity of original liquid = P × (1 − x/P)ⁿ, where x is withdrawn and replaced each of n times.",
        "Weighted mixture value = Σ(quantity × value) ÷ Σ(quantity); this equals the simple average only when all quantities are equal.",
        "To change a mixture's ratio by adding a pure ingredient, only that ingredient's term changes — set up the equation using the fixed term.",
        "Total volume stays constant when a portion is withdrawn and replaced with another liquid of the same volume.",
        "Alligation applies to any weighted-average scenario (marks, rates, speeds), not just prices — identify the higher value, lower value, and mean first."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Alligation or Mixture Aptitude Questions",
          "url": "https://www.geeksforgeeks.org/aptitude/aptitude-alligation-or-mixture/"
        },
        {
          "label": "IndiaBix — Alligation or Mixture Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/alligation-or-mixture/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Permutations & Combinations",
      "overview": "Permutations and combinations questions test one core judgment call above all: does the order of selection matter? Arrangements (permutations) count differently ordered outcomes as distinct, while selections (combinations) treat them as identical, and misidentifying which one a word problem needs is the single most common error on this topic. Beyond that basic distinction, placement tests layer in repeated objects (like letters in a word), circular seating, grouping constraints ('always together' or 'never together'), and 'at least one' conditions best solved through complementary counting rather than direct enumeration. This sub-module builds from the fundamental counting principle through permutations, combinations, circular arrangements, restricted arrangements, word-letter problems, and complementary counting — each with a fully worked numerical example — so that recognizing the right technique becomes a fast, reliable first step rather than a source of hesitation.",
      "sections": [
        {
          "heading": "The Fundamental Counting Principle",
          "body": "If one choice can be made in m ways and a second, independent choice can be made in n ways, the two together can be made in m × n ways — this multiplication principle extends to any number of sequential independent choices and underlies every permutation and combination formula.",
          "bullets": [
            "A restaurant offers 4 starters, 5 main courses, and 3 desserts. The number of distinct 3-course meals possible = 4 × 5 × 3 = 60."
          ]
        },
        {
          "heading": "Permutations: Arranging Distinct Objects (nPr)",
          "body": "When order matters and all objects are distinct, the number of ways to arrange r objects chosen from n is nPr = n!/(n−r)!. This is used whenever a question asks for the number of distinct SEQUENCES or ORDERINGS — such as ranking, seating in a row with labeled seats, or assigning distinct roles.",
          "bullets": [
            "In how many ways can 3 of 6 distinct books be arranged on a shelf? 6P3 = 6!/(6−3)! = 6×5×4 = 120."
          ]
        },
        {
          "heading": "Permutations With Repeated (Identical) Objects",
          "body": "When some objects being arranged are identical, the total arrangements n! must be divided by the factorial of each repeated group's count, since swapping identical items doesn't create a genuinely new arrangement: total = n!/(p!×q!×...).",
          "bullets": [
            "Find the number of distinct arrangements of the letters in the word BANANA (6 letters: B×1, A×3, N×2). Arrangements = 6!/(3!×2!) = 720/(6×2) = 720/12 = 60."
          ]
        },
        {
          "heading": "Circular Permutations",
          "body": "Arranging n distinct objects around a circle gives (n−1)! distinct arrangements, not n! — because rotating the entire circle produces the same relative arrangement, effectively fixing one object's position as a reference. If clockwise and counterclockwise arrangements are considered identical (as with a necklace), divide by an additional factor of 2.",
          "bullets": [
            "5 people are seated around a round table. Distinct seating arrangements = (5−1)! = 4! = 24. If the table were actually a symmetric necklace where flipping it over doesn't create a new arrangement, this would become 24/2 = 12."
          ]
        },
        {
          "heading": "Combinations: Selecting Without Order (nCr)",
          "body": "When order does NOT matter — selecting a committee, a team, or any unordered group — use nCr = n!/(r!(n−r)!) = nPr/r!. The division by r! removes the overcounting of the r! different orderings of the same selected group.",
          "bullets": [
            "In how many ways can a committee of 3 students be chosen from 8? 8C3 = 8!/(3!×5!) = (8×7×6)/(3×2×1) = 336/6 = 56."
          ]
        },
        {
          "heading": "Arrangements With Restrictions: Together, Never Together, and Alternating",
          "body": "For 'must be together' conditions, bundle the required group into a single unit, arrange the units, then multiply by the internal arrangements within the bundle. For 'no two of a certain type together' conditions, arrange the unrestricted objects first to create gaps, then place the restricted objects into those gaps.",
          "bullets": [
            "5 men and 3 women are to be seated in a row of 8 chairs so that no two women sit together. Arrange the 5 men first: 5! = 120 ways, creating 6 gaps (including the ends). Choose and arrange 3 of those 6 gaps for the women: 6P3 = 120. Total arrangements = 120 × 120 = 14400."
          ]
        },
        {
          "heading": "Word-Letter Arrangement Problems: Vowels Together",
          "body": "When a question requires certain letters (often vowels) to always appear together within a word arrangement, treat the group of vowels as a single block, arrange it alongside the remaining letters (dividing by any repeated-letter factorials), and separately multiply by the internal arrangements of the vowels within their block.",
          "bullets": [
            "Find the number of arrangements of the letters in OFFICE (O,F,F,I,C,E — F repeats twice) such that all 3 vowels (O,I,E) are always together. Treat the vowel block as 1 unit alongside F,F,C — giving 4 units total, arranged in 4!/2! = 12 ways (dividing by 2! for the repeated F). The 3 vowels within their block can be arranged in 3! = 6 ways. Total = 12 × 6 = 72."
          ]
        },
        {
          "heading": "'At Least One' Selections via Complementary Counting",
          "body": "For questions asking for selections with 'at least one' of a certain type, it is almost always faster to compute the total number of unrestricted selections and subtract the number of selections with NONE of that type, rather than directly summing every valid case (at least 1, at least 2, etc.).",
          "bullets": [
            "From a group of 5 men and 4 women, a committee of 4 is to be selected with at least 1 woman. Total ways (unrestricted) = 9C4 = 126. Ways with NO woman = 5C4 = 5. Ways with at least 1 woman = 126 − 5 = 121."
          ]
        }
      ],
      "commonPitfalls": [
        "Using the permutation formula (nPr) for a selection problem where order doesn't matter, or using combinations (nCr) when the question actually requires distinct orderings.",
        "Forgetting to divide by the factorial of each repeated letter's count when arranging a word with repeated letters.",
        "Using n! instead of (n−1)! for circular arrangements, and forgetting to divide by 2 when clockwise/counterclockwise arrangements are considered identical.",
        "In 'never together' problems, trying to directly count the valid arrangements instead of using total − 'together' cases, or making an error in the gap-method arrangement.",
        "Missing the complementary-counting shortcut for 'at least one' problems and instead attempting to enumerate every satisfying case directly, which is slower and more error-prone.",
        "When bundling a group as a single unit for a 'together' condition, forgetting to also multiply by the internal arrangements within that bundle.",
        "Confusing nCr with nPr/r! conceptually — forgetting WHY the division by r! happens (it removes the overcounted internal orderings of each selected group)."
      ],
      "keyTakeaways": [
        "Fundamental counting principle: sequential independent choices multiply — m ways × n ways = m×n total outcomes.",
        "nPr = n!/(n−r)! for arrangements (order matters); nCr = n!/(r!(n−r)!) = nPr/r! for selections (order doesn't matter).",
        "Circular arrangement of n distinct objects = (n−1)!; divide by 2 more if mirror-image arrangements count as identical.",
        "Word with repeated letters: total arrangements = n! ÷ (product of each repeated letter's factorial).",
        "'Together' conditions: bundle as one unit, arrange the units, then multiply by the bundle's internal arrangements.",
        "'Never together' conditions: arrange the unrestricted items first to create gaps, then place restricted items into those gaps.",
        "'At least one' is fastest via complement: total selections − selections with none of the required type."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Permutation and Combination",
          "url": "https://www.geeksforgeeks.org/maths/permutation-and-combination/"
        },
        {
          "label": "IndiaBix — Permutation and Combination Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/permutation-and-combination/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Probability",
      "overview": "Probability questions in placement tests build directly on permutations and combinations, framing 'favorable outcomes ÷ total outcomes' around familiar objects — coins, dice, cards, and colored balls in a bag — while testing whether a candidate can correctly distinguish independent from dependent events and mutually exclusive from overlapping events. The most frequent point of failure is applying the same probability to a second draw when items are NOT replaced (dependent events), or forgetting to subtract the overlap when two events can happen simultaneously. This sub-module covers the classical probability definition and sample space counting, dice and card problems, the addition rule for overlapping events, conditional probability with and without replacement, solving probability problems via combinations, and the complementary-counting shortcut for 'at least one' probability questions — each with a fully worked numerical example.",
      "sections": [
        {
          "heading": "Classical Probability and Sample Space",
          "body": "Probability of an event = (number of favorable outcomes) ÷ (total number of equally likely outcomes). The first step in any probability problem is correctly identifying the full sample space before counting favorable cases within it.",
          "bullets": [
            "A fair die is rolled once. Find the probability of getting a number greater than 4. Favorable outcomes = {5, 6}, total outcomes = {1,2,3,4,5,6}. P = 2/6 = 1/3."
          ]
        },
        {
          "heading": "Probability With a Standard Deck of Cards",
          "body": "A standard deck has 52 cards: 4 suits (hearts, diamonds, clubs, spades) of 13 cards each, including 1 ace, 3 face cards (jack, queen, king), and 9 number cards per suit. Memorizing this structure makes card-probability questions fast to set up.",
          "bullets": [
            "A card is drawn at random from a well-shuffled deck. P(drawing an ace) = 4/52 = 1/13. P(drawing a face card) = 12/52 = 3/13 (3 face cards × 4 suits)."
          ]
        },
        {
          "heading": "Probability With Dice",
          "body": "When two dice are rolled, the sample space has 36 EQUALLY LIKELY ordered outcomes (6×6), and each specific sum must be counted by listing every ordered pair that produces it — (2,6) and (6,2) are counted as two separate outcomes, not merged into one.",
          "bullets": [
            "Two fair dice are rolled. Find P(sum = 8). Favorable ordered pairs: (2,6),(3,5),(4,4),(5,3),(6,2) — 5 outcomes. P = 5/36."
          ]
        },
        {
          "heading": "The Addition Rule for Overlapping Events",
          "body": "For two events A and B that can occur together (are not mutually exclusive), P(A or B) = P(A) + P(B) − P(A and B) — the overlap must be subtracted once to avoid double-counting. If A and B cannot occur together (mutually exclusive), the overlap term is simply zero.",
          "bullets": [
            "A card is drawn from a deck. Find P(king or heart). P(king) = 4/52, P(heart) = 13/52, P(king of hearts, the overlap) = 1/52. P(king or heart) = 4/52 + 13/52 − 1/52 = 16/52 = 4/13."
          ]
        },
        {
          "heading": "Conditional Probability: With and Without Replacement",
          "body": "When items are drawn WITHOUT replacement, each subsequent draw's probability changes because the pool of remaining items has changed — multiply the sequence of changing probabilities. When items are drawn WITH replacement, the pool resets each time, so the same probability applies to every draw.",
          "bullets": [
            "A bag has 5 red and 3 blue balls (8 total). Two balls are drawn WITHOUT replacement. P(both red) = (5/8) × (4/7) = 20/56 = 5/14.",
            "Same bag, but drawn WITH replacement. P(both red) = (5/8) × (5/8) = 25/64 — noticeably different from the without-replacement case."
          ]
        },
        {
          "heading": "Solving Probability Using Combinations",
          "body": "For 'both/all specific items' probability questions, it's often faster to skip the sequential multiplication and instead compute P = C(favorable, r) ÷ C(total, r) directly — selecting r items from the favorable group divided by selecting r items from everything, which gives the same answer as the without-replacement sequential method.",
          "bullets": [
            "Same bag (5 red, 3 blue). P(both drawn balls are red) via combinations = C(5,2)/C(8,2) = 10/28 = 5/14 — matches the sequential without-replacement calculation exactly, confirming both methods are equivalent."
          ]
        },
        {
          "heading": "'At Least One' Probability via the Complement",
          "body": "For 'at least one success' probability questions, compute 1 − P(no successes at all) rather than summing P(exactly 1) + P(exactly 2) + ... — the complement approach is almost always faster and less error-prone.",
          "bullets": [
            "A fair coin is tossed 3 times. Find P(at least one head). P(no heads at all, i.e., all 3 tails) = (1/2)³ = 1/8. P(at least one head) = 1 − 1/8 = 7/8."
          ]
        }
      ],
      "commonPitfalls": [
        "Forgetting to subtract the intersection P(A and B) when events overlap, leading to double-counting in P(A or B).",
        "Applying the same probability to every draw (as in 'with replacement') when the question specifies items are drawn without replacement, where probabilities must change each draw.",
        "Merging symmetric ordered dice outcomes like (2,6) and (6,2) into a single outcome, undercounting the true sample space of 36.",
        "Confusing independent events (multiply raw probabilities directly) with dependent events (the second event's probability depends on the first event's outcome).",
        "Mixing sequential multiplication and combination-based methods within the same calculation instead of using one consistent approach.",
        "Not using the complement (1 − P(none)) for 'at least one' questions, instead attempting a much longer direct case-by-case enumeration.",
        "Forgetting the base counts: a standard deck has 52 cards, a single die has 6 faces, and two dice together have 36 ordered outcomes."
      ],
      "keyTakeaways": [
        "P(event) = favorable outcomes ÷ total equally likely outcomes in the full sample space.",
        "P(A or B) = P(A) + P(B) − P(A and B) whenever the events can occur together.",
        "Without replacement: multiply probabilities that change each draw; with replacement: the same probability applies to every draw.",
        "P(specific group of items) via combinations = C(favorable, r) ÷ C(total, r) — equivalent to, and often faster than, sequential multiplication.",
        "'At least one' probability = 1 − P(none) — always faster than summing every individual success case.",
        "Memorize base sample space sizes: 52-card deck, 6-face die, 36 ordered outcomes for two dice."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Probability Aptitude Questions",
          "url": "https://www.geeksforgeeks.org/maths/probability-questions/"
        },
        {
          "label": "IndiaBix — Probability Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/probability/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Time & Work",
      "overview": "Time and work problems test the same core insight in progressively disguised forms: work is best measured in RATE (work done per unit time), not in raw days, and rates from different workers combine by simple addition while the DAYS they take do not. The single fastest technique across this entire topic is converting everyone's individual time into a shared 'total work' figure using the LCM of the given times, which turns every worker's contribution into a clean whole-number rate. This sub-module covers the LCM-based rate method, combining multiple workers, workers joining or leaving midway, efficiency ratios, splitting wages by work contribution, the men-days(-hours) formula for comparing different workforce sizes, and alternating-day work schedules — each demonstrated with a complete worked calculation so that recognizing the right setup becomes automatic under time pressure.",
      "sections": [
        {
          "heading": "Work-Rate Basics: The LCM Method",
          "body": "Rather than working with fractions of a day, assign the total job a convenient 'total work' value equal to the LCM of all the individual completion times given in the question — this makes every worker's daily rate a clean whole number, avoiding fraction arithmetic throughout the rest of the problem.",
          "bullets": [
            "A can complete a job in 12 days, B in 18 days. Let total work = LCM(12,18) = 36 units. A's rate = 36/12 = 3 units/day. B's rate = 36/18 = 2 units/day."
          ]
        },
        {
          "heading": "Two or More People Working Together",
          "body": "When workers act simultaneously, their rates simply ADD (never their times), and the combined time to finish = total work ÷ combined rate.",
          "bullets": [
            "Using A's rate (3 units/day) and B's rate (2 units/day) from above, working together their combined rate = 5 units/day. Time to finish together = 36/5 = 7.2 days."
          ]
        },
        {
          "heading": "Workers Joining or Leaving Midway",
          "body": "When the workforce changes partway through a job, compute how much work was completed before the change, subtract it from the total to find the remaining work, and divide that remaining work by the (new) applicable rate — never apply the original combined time to the whole job.",
          "bullets": [
            "A and B (rates 3 and 2 units/day, total work 36 units) work together for 2 days, then B leaves and A finishes alone. Work done in 2 days = 5×2 = 10 units. Remaining work = 36−10 = 26 units. A alone finishes the remainder in 26/3 ≈ 8.67 days. Total time = 2 + 8.67 ≈ 10.67 days."
          ]
        },
        {
          "heading": "Efficiency Ratios",
          "body": "Efficiency and time taken are INVERSELY proportional — if worker A is k times as efficient as worker B, A takes only 1/k of the time B takes for the same job. This is a common source of error since it's tempting to assume efficiency ratio and time ratio are the same.",
          "bullets": [
            "A is twice as efficient as B, and B alone takes 20 days to finish a job. Since efficiency ratio A:B = 2:1, the TIME ratio is the inverse, 1:2 — so A takes 20/2 = 10 days."
          ]
        },
        {
          "heading": "Splitting Wages by Work Contribution",
          "body": "When multiple workers complete a job together and are paid a combined amount, the payment must be split in the ratio of their WORK contributed (i.e., their rate ratio), not by the number of days each one worked.",
          "bullets": [
            "A can do a job in 10 days, B in 15 days. Working together, they earn ₹5000 total for the job. Rate ratio A:B = 1/10 : 1/15 = 3:2 (after multiplying both by 30). A's share = 3/5 × 5000 = ₹3000. B's share = 2/5 × 5000 = ₹2000."
          ]
        },
        {
          "heading": "The Men-Days(-Hours) Formula",
          "body": "To compare different workforce sizes, durations, or working hours for the SAME total amount of work, use M₁D₁(H₁) = M₂D₂(H₂), where M is the number of workers, D is the number of days, and H is hours worked per day (included only if given).",
          "bullets": [
            "15 men can build a wall in 20 days. How many men are needed to build it in 12 days? M₁D₁ = M₂D₂ ⇒ 15×20 = M₂×12 ⇒ M₂ = 25 men.",
            "12 men working 8 hours/day finish a job in 10 days. How many days will 8 men working 6 hours/day take for the same job? M₁D₁H₁ = M₂D₂H₂ ⇒ 12×10×8 = 8×D₂×6 ⇒ 960 = 48×D₂ ⇒ D₂ = 20 days."
          ]
        },
        {
          "heading": "Alternating-Day Work Schedules",
          "body": "When workers alternate days rather than working simultaneously, compute the work done per full cycle (e.g., one day each), find how many complete cycles are needed, then handle the final partial day separately by checking whose turn it is.",
          "bullets": [
            "A can finish a job in 8 days, B in 12 days. Using total work = LCM(8,12) = 24 units, A's rate = 3/day, B's rate = 2/day. They work on alternate days starting with A. Each 2-day cycle (A then B) completes 3+2 = 5 units. After 4 full cycles (8 days): 20 units done, 4 units remain. Day 9 is A's turn (odd days are A): A completes 3 units, cumulative 23, 1 unit remains. Day 10 is B's turn: B's rate is 2 units/day, so the last 1 unit takes 1/2 day. Total time = 9.5 days."
          ]
        }
      ],
      "commonPitfalls": [
        "Adding workers' individual TIMES directly (e.g., averaging 12 and 18 days) instead of adding their RATES (1/time) to find combined performance.",
        "Forgetting to recompute the remaining work when a worker joins or leaves midway, and instead applying the original combined completion time to the whole job.",
        "Assuming efficiency ratio and time-taken ratio are the same, instead of recognizing they are inverses of each other.",
        "Splitting wages by the number of DAYS each worker worked instead of by their actual work-rate (contribution) ratio.",
        "Forgetting to include the hours-per-day factor in the men-days formula when the question specifies different working hours for each scenario.",
        "In alternating-day problems, using the wrong worker's rate for the final partial day by not checking whose turn it actually is.",
        "Using the LCM of the WRONG set of numbers (e.g., only two of three given times) when more than two workers or rates are involved."
      ],
      "keyTakeaways": [
        "Assign total work = LCM of all given individual completion times, so every rate becomes a clean whole number.",
        "Combined rate = sum of individual rates; time together = total work ÷ combined rate — never add times directly.",
        "Efficiency and time are inversely proportional: k times as efficient means 1/k the time for the same job.",
        "Wages are split in the ratio of work contributed (rate ratio), not days worked.",
        "Men-days(-hours) formula: M₁D₁(H₁) = M₂D₂(H₂) for the same total job.",
        "For joining/leaving-midway problems, compute work already done first, then divide the REMAINING work by the new applicable rate.",
        "For alternating-day schedules, compute work per full cycle first, then handle the final partial day by checking whose turn it is."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Time and Work Aptitude Questions",
          "url": "https://www.geeksforgeeks.org/aptitude/time-and-work-questions-and-answers/"
        },
        {
          "label": "IndiaBix — Time and Work Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/time-and-work/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Pipes & Cisterns",
      "overview": "Pipes and cisterns problems are structurally identical to time and work problems, with one key extension: an outlet pipe or a leak contributes a NEGATIVE rate, since it removes from the tank rather than adding to it. The same LCM-based 'assign total capacity, compute each rate' method applies directly, but candidates frequently trip up by treating an emptying pipe's rate as positive, or by not checking whether pipes combined together can ever actually fill the tank at all — a net rate of zero is a genuine possibility, not a calculation error. This sub-module covers signed rates for inlets and outlets, combined filling and emptying, partial-time pipe operation, alternating pipe schedules, leak-adjusted filling time, and multi-pipe combinations — each with a complete worked numerical example.",
      "sections": [
        {
          "heading": "Pipes as Signed Work Rates: Inlet vs Outlet",
          "body": "An inlet (filling) pipe contributes a POSITIVE rate toward the tank's capacity; an outlet (emptying) pipe or a leak contributes a NEGATIVE rate. Using the same LCM method as time and work, assign the tank a total capacity equal to the LCM of the given times, then compute each pipe's signed rate.",
          "bullets": [
            "Pipe A fills a tank in 6 hours, pipe B in 8 hours. Let capacity = LCM(6,8) = 24 units. A's rate = +4 units/hr, B's rate = +3 units/hr."
          ]
        },
        {
          "heading": "Two Filling Pipes Working Together",
          "body": "When two inlet pipes are opened together, their rates simply add, exactly as with combined workers in time-and-work problems.",
          "bullets": [
            "Using A (4 units/hr) and B (3 units/hr) from above, combined rate = 7 units/hr. Time to fill the 24-unit tank = 24/7 ≈ 3.43 hours."
          ]
        },
        {
          "heading": "Inlet and Outlet Working Together: Net Rate",
          "body": "When an inlet and an outlet pipe are open simultaneously, the net rate is the inlet's rate MINUS the outlet's rate — if this net rate is positive, the tank fills; if negative, it empties; if exactly zero, the tank's level never changes at all.",
          "bullets": [
            "Pipe A fills a tank in 6 hours; pipe C (outlet) empties it in 12 hours. Capacity = LCM(6,12) = 12 units. A's rate = +2/hr, C's rate = −1/hr. Net rate = +1/hr. Time to fill = 12/1 = 12 hours."
          ]
        },
        {
          "heading": "A Pipe Opened for Part of the Time, Then Another Joins",
          "body": "As with time-and-work, first compute the work done during the initial period at the initial rate, subtract from total capacity to get the remaining work, then divide by the new combined rate for the remaining time.",
          "bullets": [
            "Pipe A fills a tank in 6 hours, pipe B in 9 hours. A is opened alone for 2 hours, then B joins. Capacity = LCM(6,9) = 18 units. A's rate = 2/hr, B's rate = 3/hr. Work done by A alone in 2 hrs = 4 units. Remaining = 18−4 = 14 units. Combined rate once B joins = 5/hr. Additional time = 14/5 = 2.8 hours. Total time = 2 + 2.8 = 4.8 hours."
          ]
        },
        {
          "heading": "Alternate Opening of Pipes",
          "body": "When pipes are opened on alternate hours (or turns) rather than simultaneously, track cumulative work hour by hour (or cycle by cycle), exactly as in alternating-day time-and-work problems.",
          "bullets": [
            "Pipe A fills a tank in 6 hours, pipe B in 4 hours. Capacity = LCM(6,4) = 12 units. A's rate = 2/hr, B's rate = 3/hr. Opened on alternate hours starting with A: Hour 1 (A): 2, cumulative 2. Hour 2 (B): 3, cumulative 5. Hour 3 (A): 2, cumulative 7. Hour 4 (B): 3, cumulative 10. Hour 5 (A): 2, cumulative 12 — the tank fills exactly at the end of hour 5."
          ]
        },
        {
          "heading": "Cisterns With a Leak: Finding the Leak's Own Emptying Time",
          "body": "If a pipe's normal filling time is known and its ACTUAL filling time (with a leak present) is also given, the leak's own rate = (normal fill rate) − (actual combined rate). Taking the reciprocal of that difference gives the time the leak alone would take to empty a full tank.",
          "bullets": [
            "A pipe can fill a tank in 8 hours, but due to a leak it actually takes 10 hours. Normal rate = 1/8, actual combined rate = 1/10. Leak's rate = 1/8 − 1/10 = (5−4)/40 = 1/40. The leak alone would empty a full tank in 40 hours."
          ]
        },
        {
          "heading": "Multiple Inlet and Outlet Pipes Combined: The Zero-Net-Rate Trap",
          "body": "With several pipes open at once, sum all signed rates to get the net rate — but always check whether this net rate is actually positive before concluding the tank fills. A net rate of exactly zero means the tank's level never changes at all, regardless of how long the pipes stay open.",
          "bullets": [
            "Two inlet pipes fill a tank in 10 and 15 hours; one outlet pipe empties it in 6 hours. If all three are opened together, will the tank ever fill? Using LCM(10,15,6) = 30: rates = +3/30, +2/30, −5/30. Net rate = (3+2−5)/30 = 0/30 = 0. The tank never fills (or empties) — its level stays exactly where it started."
          ]
        }
      ],
      "commonPitfalls": [
        "Treating an outlet or leak's rate as positive instead of negative when combining it with inlet pipes.",
        "Adding raw times of different pipes directly instead of converting each to a rate (1/time) first.",
        "Computing a leak's own emptying time as simply (actual time − normal time) instead of correctly using the rate DIFFERENCE (1/normal − 1/actual).",
        "Assuming the tank always eventually fills whenever multiple pipes are open — a net rate of zero or negative means it never fills.",
        "In 'opened for part of the time, then joined' problems, forgetting to subtract the work already completed before dividing the remaining work by the new rate.",
        "Misreading a narrative word problem to determine which described pipe is the inlet and which is the outlet, especially when neither is explicitly labeled.",
        "In alternating-pipe problems, miscounting which pipe's turn falls on the final partial hour, causing the wrong rate to be used for the leftover work."
      ],
      "keyTakeaways": [
        "Inlet pipes contribute positive rates; outlet pipes and leaks contribute negative rates — combined rate is the signed sum.",
        "Assign the tank a total capacity equal to the LCM of all given times to make every rate a whole number, exactly as in time and work.",
        "Leak's own emptying rate = (normal fill rate) − (actual combined fill rate); take the reciprocal for the leak's own time.",
        "A net rate of exactly zero means the tank neither fills nor empties — always check this before assuming the tank fills.",
        "For 'opened alone, then joined' problems, compute work already done first, then divide the REMAINING work by the new combined rate.",
        "Pipes and cisterns use the identical LCM-and-signed-rate method as time and work — recognizing this equivalence saves setup time."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Pipes and Cistern Aptitude Questions",
          "url": "https://www.geeksforgeeks.org/aptitude/pipes-and-cistern-questions-and-answers/"
        },
        {
          "label": "IndiaBix — Pipes and Cisterns Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/pipes-and-cistern/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Boats & Streams",
      "overview": "Boats and streams problems apply the same relative-speed logic from time-speed-distance, with the water current acting as a constant that adds to the boat's own speed when moving downstream and subtracts from it when moving upstream. Beyond the basic downstream/upstream speed relationships, placement tests probe deeper variations: working backward from downstream and upstream speeds to find the boat's and stream's individual speeds, computing round-trip average speed correctly (as a harmonic mean, not a simple average), finding distance from a given total round-trip time, and solving 'time difference' word problems that reduce to a solvable quadratic equation. This sub-module works through each of these variants with a complete worked numerical example, reinforcing that boats and streams is not a separate topic so much as TSD's relative-speed framework applied to a current.",
      "sections": [
        {
          "heading": "Core Relationships: Downstream and Upstream Speed",
          "body": "If b is the boat's speed in still water and s is the stream's speed, downstream speed = b+s (current assists) and upstream speed = b−s (current resists). These two simple relationships are the foundation for every other boats-and-streams variant.",
          "bullets": [
            "A boat's speed in still water is 10 km/h and the stream flows at 2 km/h. Downstream speed = 10+2 = 12 km/h. Upstream speed = 10−2 = 8 km/h."
          ]
        },
        {
          "heading": "Finding Boat Speed and Stream Speed From Downstream/Upstream Speeds",
          "body": "When downstream and upstream speeds are given directly (rather than boat and stream speed), reverse the relationships: boat speed b = (downstream+upstream)/2, and stream speed s = (downstream−upstream)/2 — the boat speed is the average of the two, and the stream speed is half their difference.",
          "bullets": [
            "A boat covers a distance downstream at 15 km/h and the same distance upstream at 9 km/h. Boat speed = (15+9)/2 = 12 km/h. Stream speed = (15−9)/2 = 3 km/h."
          ]
        },
        {
          "heading": "Time for a Round Trip",
          "body": "For a round trip covering the same one-way distance in each direction, compute each leg's time SEPARATELY (distance ÷ that leg's speed) and add them — never average the two speeds to compute a single trip time.",
          "bullets": [
            "Using downstream speed 15 km/h and upstream speed 9 km/h from above, for a one-way distance of 30 km: time downstream = 30/15 = 2 hours, time upstream = 30/9 ≈ 3.33 hours. Total round-trip time ≈ 5.33 hours."
          ]
        },
        {
          "heading": "Average Speed for a Round Trip",
          "body": "When equal DISTANCES are covered downstream and upstream, the average speed for the whole round trip = 2 × downstream × upstream ÷ (downstream + upstream) — the harmonic mean, exactly the same principle used for average speed in time-speed-distance problems.",
          "bullets": [
            "Using downstream 15 km/h and upstream 9 km/h: average speed = 2×15×9/(15+9) = 270/24 = 11.25 km/h. Verify against Section 3's figures: total distance = 60 km, total time ≈ 5.33 hours, so 60/5.33 ≈ 11.25 km/h. ✓"
          ]
        },
        {
          "heading": "Finding Distance When Total Round-Trip Time Is Known",
          "body": "When the total time for a round trip is given instead of the distance, set up the equation d/downstream + d/upstream = total time and solve for d directly.",
          "bullets": [
            "A boat's speed in still water is 10 km/h, stream speed 2 km/h (downstream 12, upstream 8). The round trip to a place and back takes 5 hours total. Find the one-way distance. d/12 + d/8 = 5 ⇒ (2d+3d)/24 = 5 ⇒ 5d/24 = 5 ⇒ d = 24 km."
          ]
        },
        {
          "heading": "Effect of a Faster Stream on Round-Trip Time",
          "body": "A faster stream speed helps the downstream leg but hurts the upstream leg by a larger margin, so increasing stream speed generally INCREASES total round-trip time for the same distance — it does not simply cancel out or improve overall travel time.",
          "bullets": [
            "Using the same 24 km one-way distance and boat speed 10 km/h, but with stream speed doubled from 2 to 4 km/h: downstream = 14 km/h, upstream = 6 km/h. New round-trip time = 24/14 + 24/6 ≈ 1.71 + 4 = 5.71 hours — MORE than the original 5 hours, even though the stream 'helps' on the way out."
          ]
        },
        {
          "heading": "Time-Difference Word Problems",
          "body": "When a problem states the upstream leg takes a certain amount of time longer (or shorter) than the downstream leg for the same distance, set up the equation distance/(b−s) − distance/(b+s) = time difference, cross-multiply, and solve the resulting quadratic for the stream speed.",
          "bullets": [
            "A man's rowing speed in still water is 8 km/h. For a distance of 15 km each way, he takes 1 hour longer upstream than downstream. Find the stream speed. 15/(8−s) − 15/(8+s) = 1 ⇒ 15[(8+s)−(8−s)] = (8−s)(8+s) ⇒ 15×2s = 64−s² ⇒ s²+30s−64 = 0 ⇒ (discriminant = 900+256 = 1156 = 34²) ⇒ s = (−30+34)/2 = 2 km/h. Verify: downstream = 10 km/h, time = 15/10 = 1.5 h; upstream = 6 km/h, time = 15/6 = 2.5 h; difference = 1 hour. ✓"
          ]
        }
      ],
      "commonPitfalls": [
        "Averaging upstream and downstream speeds arithmetically to find round-trip average speed instead of using the harmonic mean 2×down×up/(down+up).",
        "Reversing which value is the sum and which is the difference when solving b=(down+up)/2 and s=(down−up)/2 from given downstream/upstream speeds.",
        "Assuming a faster stream always shortens round-trip time — it worsens the upstream leg more than it helps downstream, generally increasing total time.",
        "In time-difference word problems, setting up the equation with the subtraction in the wrong order (downstream time minus upstream time instead of the reverse).",
        "Treating the given 'distance' in round-trip problems as the total round-trip distance rather than the one-way distance when plugging into each leg's time.",
        "Averaging the two legs' TIMES directly instead of computing each leg's time separately and adding them for total round-trip time.",
        "Forgetting that boats and streams is the same relative-speed framework as TSD, with the stream acting as a constant additive/subtractive current."
      ],
      "keyTakeaways": [
        "Downstream speed = b+s, upstream speed = b−s ⇒ b = (down+up)/2, s = (down−up)/2.",
        "Round-trip average speed (equal one-way distances) = 2×downstream×upstream/(downstream+upstream) — the harmonic mean.",
        "For round trips, always compute each leg's time separately (distance/speed) and add — never average speeds directly.",
        "A faster stream helps downstream but hurts upstream more, so round-trip time generally increases with stream speed, not decreases.",
        "Time-difference problems (upstream time − downstream time = given difference) reduce to a solvable quadratic in stream speed after cross-multiplying.",
        "Boats and streams is structurally identical to TSD's relative-speed problems, with the current as a constant added to or subtracted from the boat's own speed."
      ],
      "links": [
        {
          "label": "IndiaBix — Boats and Streams Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/boats-and-streams/"
        },
        {
          "label": "GeeksforGeeks — Boats and Streams Aptitude Questions",
          "url": "https://www.geeksforgeeks.org/aptitude/boat-and-stream-questions-and-answers/"
        }
      ]
    },
    {
      "moduleTitle": "Quantitative Aptitude",
      "subModuleTitle": "Mensuration — Area & Volume",
      "overview": "Mensuration questions test direct application of area, surface area, and volume formulas for standard 2D and 3D shapes, but the real scoring differentiator is recognizing which formula variant a word problem actually needs — a closed cylinder's surface area differs from an open one, a cone's slant height differs from its vertical height, and 'melt and recast' problems conserve volume while 'painting' problems care about surface area. This sub-module works through 2D shape areas and perimeters, circle and sector formulas, the volume and surface area of cuboids, cylinders, cones, and spheres, the scaling rule connecting linear dimensions to area and volume, composite solids built from multiple shapes, and classic practical word problems like paths around fields and melting-and-recasting — each with a complete worked numerical example using clean, verifiable numbers.",
      "sections": [
        {
          "heading": "2D Areas and Perimeters: Rectangle, Square, Triangle, and Trapezium",
          "body": "The basic 2D formulas — rectangle area = length×width, square area = side², triangle area = ½×base×height, and trapezium area = ½×(sum of parallel sides)×height — underlie nearly every 2D mensuration question, often combined with each other in composite figures.",
          "bullets": [
            "A rectangle 12 m long and 5 m wide has area = 12×5 = 60 m² and perimeter = 2(12+5) = 34 m.",
            "A triangle with base 10 cm and height 6 cm has area = ½×10×6 = 30 cm².",
            "A trapezium with parallel sides 10 cm and 14 cm and height 5 cm has area = ½×(10+14)×5 = ½×24×5 = 60 cm²."
          ]
        },
        {
          "heading": "Circles: Circumference, Area, Sector, and Arc Length",
          "body": "Circumference = 2πr, area = πr². For a sector spanning angle θ degrees, sector area = (θ/360)×πr² and arc length = (θ/360)×2πr — both are simply the fraction of the full circle that the sector's angle represents.",
          "bullets": [
            "A circle has radius 7 cm (using π=22/7). Circumference = 2×22/7×7 = 44 cm. Area = 22/7×7² = 154 cm².",
            "A 90° sector of the same circle: sector area = (90/360)×154 = 38.5 cm². Arc length = (90/360)×44 = 11 cm."
          ]
        },
        {
          "heading": "Surface Area and Volume of Cuboids and Cubes",
          "body": "Cuboid volume = length×width×height; total surface area = 2(lw+wh+hl), summing the areas of all 6 faces. A cube is the special case where all three dimensions are equal: volume = side³, surface area = 6×side².",
          "bullets": [
            "A cuboid measuring 8 cm × 5 cm × 4 cm has volume = 8×5×4 = 160 cm³ and surface area = 2(8×5+5×4+4×8) = 2(40+20+32) = 2×92 = 184 cm².",
            "A cube of side 5 cm has volume = 5³ = 125 cm³ and surface area = 6×5² = 6×25 = 150 cm²."
          ]
        },
        {
          "heading": "Surface Area and Volume of Cylinders",
          "body": "Cylinder volume = πr²h. Curved (lateral) surface area = 2πrh. Total surface area (including both circular ends) = 2πrh + 2πr² — use the curved surface area alone for open-ended objects like pipes, and the total surface area for a fully closed solid cylinder.",
          "bullets": [
            "A cylinder has radius 7 cm and height 10 cm (π=22/7). Volume = 22/7×49×10 = 1540 cm³. Curved surface area = 2×22/7×7×10 = 440 cm². Total surface area (closed) = 440 + 2×154 = 440+308 = 748 cm²."
          ]
        },
        {
          "heading": "Surface Area and Volume of Cones and Spheres",
          "body": "Cone volume = (1/3)πr²h, and curved surface area = πrl, where l is the SLANT height (l = √(r²+h²)), not the vertical height — these are different unless the question explicitly says so. Sphere volume = (4/3)πr³, and surface area = 4πr².",
          "bullets": [
            "A cone has radius 7 cm and vertical height 24 cm. Slant height l = √(7²+24²) = √(49+576) = √625 = 25 cm. Volume = 1/3×22/7×49×24 = 1232 cm³. Curved surface area = 22/7×7×25 = 550 cm².",
            "A sphere has radius 7 cm. Volume = 4/3×22/7×343 = 1437.33 cm³. Surface area = 4×22/7×49 = 616 cm²."
          ]
        },
        {
          "heading": "Effect of Scaling Dimensions on Area and Volume",
          "body": "When every linear dimension of a solid is scaled by a factor k, surface area scales by k² and volume scales by k³ — NOT by k itself. This non-linear scaling is a frequent source of error when a question describes an enlarged or shrunk version of a shape.",
          "bullets": [
            "A cube of side 4 cm (volume 64 cm³, surface area 96 cm²) is enlarged to side 8 cm — a scale factor k=2. New volume = 64×2³ = 64×8 = 512 cm³ (matches 8³=512 ✓). New surface area = 96×2² = 96×4 = 384 cm² (matches 6×8²=384 ✓)."
          ]
        },
        {
          "heading": "Composite Solids",
          "body": "For a solid built from two or more basic shapes joined together, compute each component's volume (or surface area) separately using its own formula, then add them — being careful not to double-count any surface where the shapes join.",
          "bullets": [
            "A solid consists of a cylinder (radius 7 cm, height 10 cm) topped with a hemisphere of the same radius. Total volume = cylinder volume + hemisphere volume = 1540 + (2/3×22/7×343) = 1540 + 718.67 = 2258.67 cm³."
          ]
        },
        {
          "heading": "Practical Word Problems: Paths and Melting-Recasting",
          "body": "For a uniform-width path around a rectangular field, compute the OUTER area (field plus path on all sides) minus the field's own area. For melting-and-recasting problems, the VOLUME of metal is conserved (not its shape or surface area) — set the two shapes' volumes equal and solve for the unknown dimension.",
          "bullets": [
            "A rectangular field 30 m × 20 m has a 2 m wide path built around its outside. Outer dimensions = 34 m × 24 m, outer area = 816 m². Field area = 600 m². Path area = 816−600 = 216 m².",
            "A metallic sphere of radius 6 cm is melted and recast into a cylinder of radius 4 cm. Find the cylinder's height. Sphere volume = 4/3×π×6³ = 288π. Cylinder volume = π×4²×h = 16πh. Setting them equal: 16h = 288 ⇒ h = 18 cm."
          ]
        }
      ],
      "commonPitfalls": [
        "Using the curved surface area formula when the question actually needs total surface area (or vice versa) for a closed cylinder or similar solid.",
        "Substituting diameter where radius is required (or vice versa) in circle, cylinder, cone, or sphere formulas.",
        "Assuming volume scales the same way as area when dimensions change — area scales with k², volume scales with k³, never linearly with k.",
        "In melt-and-recast problems, equating surface areas instead of volumes — the quantity of metal (volume) is what's conserved, not the shape's surface area.",
        "Forgetting the 'outer minus inner' approach for a path around a field, or accidentally computing the field's area minus the path instead of the reverse.",
        "Confusing a cone's slant height (used for curved surface area) with its vertical height (used for volume) — they differ unless explicitly stated equal.",
        "Using π=22/7 in one part of a calculation and π=3.14 in another within the same problem, causing rounding mismatches in the final answer."
      ],
      "keyTakeaways": [
        "Circle: circumference=2πr, area=πr²; sector area=(θ/360)×πr²; arc length=(θ/360)×2πr.",
        "Cuboid: volume=l×w×h; surface area=2(lw+wh+hl). Cube: volume=side³; surface area=6×side².",
        "Cylinder: volume=πr²h; curved surface area=2πrh; total surface area=2πrh+2πr².",
        "Cone: volume=(1/3)πr²h; curved surface area=πrl where l=√(r²+h²) is the SLANT height, not vertical height.",
        "Sphere: volume=(4/3)πr³; surface area=4πr².",
        "Scaling all linear dimensions by k multiplies area by k² and volume by k³.",
        "Melt-and-recast problems conserve VOLUME, not surface area or shape — set the two volumes equal and solve."
      ],
      "links": [
        {
          "label": "GeeksforGeeks — Mensuration Formulas",
          "url": "https://www.geeksforgeeks.org/maths/mensuration/"
        },
        {
          "label": "IndiaBix — Area Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/area/"
        },
        {
          "label": "IndiaBix — Volume and Surface Area Aptitude Questions",
          "url": "https://www.indiabix.com/aptitude/volume-and-surface-area/"
        }
      ]
    }
  ]
};

export default data;
