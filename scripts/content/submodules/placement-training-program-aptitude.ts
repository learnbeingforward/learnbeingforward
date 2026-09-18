import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "placement-training-program",
  submodules: [
    // ───────────────────────── Quantitative Aptitude ─────────────────────────
    {
      moduleTitle: "Quantitative Aptitude",
      subModuleTitle: "Number systems",
      overview:
        "Number systems questions form the backbone of almost every placement aptitude test because the shortcuts they teach — divisibility rules, HCF/LCM, remainder cyclicity, unit-digit tricks — get reused inside percentage, time-speed-distance, and data interpretation problems later. Unlike topics that reward memorized formulas alone, number systems reward pattern recognition: recognizing that a huge power's unit digit repeats every 2-4 steps, or that a factorial's trailing zeros depend only on how many times 5 divides into it, turns an intractable-looking question into a 20-second calculation. This sub-module builds the core toolkit — classification and divisibility, HCF/LCM and their word-problem applications, remainder and cyclicity shortcuts, unit-digit and trailing-zero techniques, and base conversion — with every rule demonstrated on a real worked number so the technique, not just the definition, sticks. Because these problems appear in nearly every test as quick, calculator-free questions, speed and accuracy here directly raise your overall score.",
      sections: [
        {
          heading: "Classification of Numbers and Divisibility Rules",
          body: "Placement tests lean heavily on divisibility rules because they let you answer 'is this divisible by X' without doing the full division. The rules worth memorizing cold: divisible by 2 (last digit even), by 3 (digit sum divisible by 3), by 4 (last two digits divisible by 4), by 5 (ends in 0 or 5), by 8 (last three digits divisible by 8), by 9 (digit sum divisible by 9), and by 11 (alternating digit sum from the right divisible by 11, including 0).",
          bullets: [
            "Check 396528 for divisibility by 4, 8, 9, and 11: last two digits 28 → 28/4=7, divisible by 4. Last three digits 528 → 528/8=66, divisible by 8. Digit sum 3+9+6+5+2+8=33, NOT divisible by 9 (33 isn't a multiple of 9). Alternating sum from the right: 8-2+5-6+9-3=11, divisible by 11 (11 itself counts).",
          ],
        },
        {
          heading: "HCF and LCM: Prime Factorization and Word Problems",
          body: "HCF (highest common factor) is found by multiplying the lowest power of every common prime factor; LCM (lowest common multiple) is found by multiplying the highest power of every prime factor appearing in any of the numbers. The two are linked by the identity HCF × LCM = product of the two numbers — a fast way to check your work or find one value if the other three are known. LCM word problems (things repeating together, like bells or traffic lights) are extremely common.",
          bullets: [
            "36 = 2² × 3², 60 = 2² × 3 × 5. HCF = 2² × 3 = 12. LCM = 2² × 3² × 5 = 180. Check: 12 × 180 = 2160 = 36 × 60. ✓",
            "Three bells ring every 12, 18, and 24 minutes. They rang together at 9:00 AM — when next? LCM(12,18,24): 12=2²×3, 18=2×3², 24=2³×3 → LCM=2³×3²=72 minutes. Next together ring: 10:12 AM.",
          ],
        },
        {
          heading: "Remainder Theorems and Cyclicity",
          body: "When a power is too large to compute directly, find the cyclicity of the base's remainders modulo the divisor and reduce the exponent modulo the cycle length. This converts an unmanageable calculation like 2¹⁰⁰ mod 7 into a small lookup.",
          bullets: [
            "Find the remainder when 2¹⁰⁰ is divided by 7. Powers of 2 mod 7 cycle: 2¹=2, 2²=4, 2³=1 (mod 7) — cycle length 3. 100 mod 3 = 1 (since 99 is divisible by 3). So 2¹⁰⁰ mod 7 = 2¹ mod 7 = 2.",
          ],
        },
        {
          heading: "Unit Digit Shortcuts for Large Powers",
          body: "Unit digits of powers cycle with a period of at most 4 (digits 4 and 9 cycle in 2, digits 2,3,7,8 cycle in 4, and 0,1,5,6 never change). Find the base's cycle, reduce the exponent modulo the cycle length (using the cycle length itself, not 0, when the remainder is 0), and read off the matching position.",
          bullets: [
            "Find the unit digit of 7¹²³. Cycle of 7: 7¹=7, 7²=49(9), 7³=343(3), 7⁴=2401(1) — period 4. 123 mod 4 = 3 (120 is divisible by 4). Third position in the cycle (7,9,3,1) is 3. Unit digit = 3.",
          ],
        },
        {
          heading: "Factorials and Trailing Zeros",
          body: "Trailing zeros in n! come only from factors of 10, i.e., pairs of 2 and 5 — and since factors of 2 are always more abundant than factors of 5 in a factorial, the zero count is simply the total power of 5 dividing n!, found by summing floor(n/5) + floor(n/25) + floor(n/125) + ... until the term is 0.",
          bullets: [
            "Trailing zeros in 100!: floor(100/5)=20, floor(100/25)=4, floor(100/125)=0. Total = 20+4 = 24 trailing zeros.",
          ],
        },
        {
          heading: "Base Conversion",
          body: "Converting decimal to binary (or any base b) uses repeated division: divide by b, record the remainder, repeat on the quotient, and read the remainders bottom-to-top. Converting binary back to decimal is the reverse — multiply each bit by its positional power of 2 and sum.",
          bullets: [
            "Convert 156 to binary: 156÷2=78 r0, 78÷2=39 r0, 39÷2=19 r1, 19÷2=9 r1, 9÷2=4 r1, 4÷2=2 r0, 2÷2=1 r0, 1÷2=0 r1. Reading remainders bottom-up: 10011100. Check: 128+16+8+4=156. ✓",
          ],
        },
        {
          heading: "Number of Factors and Sum of Factors",
          body: "For N = p₁^a × p₂^b × p₃^c (prime factorization), the total count of factors is (a+1)(b+1)(c+1), and the sum of all factors is the product of the geometric series for each prime: (1+p₁+...+p₁^a)(1+p₂+...+p₂^b)... This is a fast, purely formulaic technique that avoids listing factors by hand.",
          bullets: [
            "180 = 2² × 3² × 5¹. Number of factors = (2+1)(2+1)(1+1) = 3×3×2 = 18. Sum of factors = (1+2+4)(1+3+9)(1+5) = 7×13×6 = 546.",
          ],
        },
      ],
      commonPitfalls: [
        "Applying the divisibility-by-4 rule (last 2 digits) to check divisibility by 8, forgetting it needs the last 3 digits.",
        "Confusing HCF and LCM word problems — 'find when events coincide' always needs LCM, 'find the largest measure that divides evenly' always needs HCF.",
        "Forgetting the HCF × LCM = product identity, which is the fastest way to sanity-check an answer or solve for a missing number.",
        "Using the wrong cyclicity length — forgetting that when the exponent is exactly divisible by the cycle length, you use the LAST term of the cycle, not a 'remainder 0' term.",
        "Miscounting trailing zeros by including powers of 2 as well as 5 — only floor(n/5)+floor(n/25)+... matters since 2s are never the bottleneck.",
        "In base conversion, reading the remainders top-to-bottom instead of bottom-to-top, which reverses the answer.",
      ],
      keyTakeaways: [
        "Memorize divisibility rules for 2, 3, 4, 5, 8, 9, and 11 — they replace long division with a 5-second check.",
        "HCF × LCM = product of the two numbers; LCM solves 'coincide/repeat together' problems, HCF solves 'largest common measure' problems.",
        "Reduce huge exponents using cyclicity: find the repeat period of unit digits or remainders, then use exponent mod period.",
        "Trailing zeros in n! = floor(n/5) + floor(n/25) + floor(n/125) + ... (sum until the term becomes 0).",
        "Number of factors of p₁^a·p₂^b·... is (a+1)(b+1)...; sum of factors is the product of each prime's geometric series.",
        "For base conversion, repeated division and reading remainders bottom-up is faster and less error-prone than trial and error.",
      ],
      links: [
        { label: "IndiaBix — Number System Aptitude Questions", url: "https://www.indiabix.com/aptitude/number-system/" },
        { label: "GeeksforGeeks — Aptitude Questions and Answers", url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Quantitative Aptitude",
      subModuleTitle: "Percentages & ratios",
      overview:
        "Percentages and ratios are the most frequently reused concepts across the entire aptitude syllabus — profit/loss, data interpretation, mixtures, and even time-speed-distance problems are often percentage or ratio problems wearing a different costume. The single biggest scoring opportunity here is also the single biggest trap: successive percentage changes do not add linearly, and most students lose easy marks assuming a 20% rise followed by a 20% fall nets to zero when it actually nets to a 4% loss. This sub-module covers percentage-to-fraction fluency, the successive-change formula, the crucial distinction between percentage points and percentage change, ratio and proportion mechanics, combining ratios across a shared term, and the alligation method for mixture problems — all worked through with real numbers so the shortcuts are internalized, not just memorized as formulas to forget under exam pressure.",
      sections: [
        {
          heading: "Percentage Basics and Fast Conversion",
          body: "A percentage is just a fraction out of 100, and the fastest way to compute 'X% of Y' is to convert the percentage into its simplest fraction (10%=1/10, 12.5%=1/8, 25%=1/4, 33.33%=1/3) and multiply — much faster than long multiplication with decimals, especially under time pressure.",
          bullets: [
            "Find 15% of 340 without a calculator: 340 × 15/100 = 340 × 3/20 = 51.",
          ],
        },
        {
          heading: "Successive Percentage Change — The Non-Additive Trap",
          body: "When a value undergoes two percentage changes a% and b% in sequence, the net percentage change is NOT (a+b)%. The correct formula is: net% = a + b + (ab/100), where a loss is entered as a negative value. This single formula prevents the most common percentage error in placement tests.",
          bullets: [
            "20% increase followed by a 20% decrease: net% = 20 + (-20) + (20 × -20)/100 = 0 - 4 = -4%. Net result is a 4% DECREASE, not 0%.",
            "10% increase followed by another 10% increase: net% = 10 + 10 + (10×10)/100 = 20 + 1 = 21%, not 20%.",
          ],
        },
        {
          heading: "Percentage Points vs Percentage Change",
          body: "A rate moving from 5% to 8% has risen by 3 percentage points, but the percentage increase (relative change) is (3/5)×100 = 60%. News reports and exam questions frequently exploit this ambiguity, so always check whether a question asks for the absolute point difference or the relative percentage change.",
          bullets: [
            "An interest rate rises from 5% to 8%: point increase = 3 percentage points; percentage increase = 3/5 × 100 = 60%. These are very different numbers answering different questions.",
          ],
        },
        {
          heading: "Ratio and Proportion Fundamentals",
          body: "A ratio a:b:c divides a total into (a+b+c) equal parts, and each share is (that term's ratio value) × (total ÷ sum of ratio terms). Proportion problems (a:b :: c:d, so ad=bc) let you solve for an unknown term by cross-multiplication.",
          bullets: [
            "Divide ₹750 among A, B, C in the ratio 2:3:5. Total parts = 10, so 1 part = ₹75. A = 150, B = 225, C = 375. Check: 150+225+375=750. ✓",
          ],
        },
        {
          heading: "Combining Two Ratios With a Common Term",
          body: "When two ratios share a common variable (e.g., A:B and B:C), scale both ratios so the shared term matches (using the LCM of its two values), then merge them into a single three-term ratio.",
          bullets: [
            "A:B = 2:3 and B:C = 4:5. LCM of B's values (3 and 4) is 12. Scale A:B = 2:3 → 8:12, and B:C = 4:5 → 12:15. Combined: A:B:C = 8:12:15.",
          ],
        },
        {
          heading: "Maintaining Constant Value: Inverse Percentage Adjustment",
          body: "When price and quantity have an inverse relationship (expenditure = price × quantity must stay fixed), a price increase of x% requires a quantity reduction of [x/(100+x)]×100 percent to keep total expenditure unchanged — not a reduction of x% itself, which is a very common error.",
          bullets: [
            "Sugar price rises 25%. To keep monthly sugar expenditure unchanged, reduce consumption by [25/(100+25)]×100 = 20%, not 25%.",
          ],
        },
        {
          heading: "Alligation for Mixture Problems",
          body: "The alligation rule finds the ratio in which two ingredients of different values must be mixed to get a desired average value: ratio = (higher value − mean value) : (mean value − lower value).",
          bullets: [
            "Mix tea costing ₹40/kg with tea costing ₹60/kg to get a mixture costing ₹52/kg. Ratio = (60−52):(52−40) = 8:12 = 2:3. So mix cheaper:costlier in ratio 3:2 (cheaper tea gets the larger share, since the mean is closer to the cheaper price).",
          ],
        },
      ],
      commonPitfalls: [
        "Adding successive percentage changes directly (20% up then 20% down = 0%) instead of using net% = a+b+ab/100 — the correct answer here is a 4% net loss.",
        "Confusing percentage points with percentage change — a rate moving from 5% to 8% is a 3-point rise but a 60% relative increase.",
        "Reducing consumption by the same percentage as a price increase to 'keep expenditure constant,' instead of using the inverse formula x/(100+x)×100.",
        "Combining two ratios without first scaling the shared term to a common value via LCM.",
        "Forgetting that a ratio must be simplified to lowest terms, or misreading 'divided in ratio' as 'divided equally.'",
        "In alligation, swapping which quantity gets the larger share — the ingredient closer in value to the mean gets the LARGER portion.",
      ],
      keyTakeaways: [
        "Net successive % change = a + b + (ab/100); never simply add two percentage changes.",
        "Percentage point difference ≠ percentage change — always check which one a question is asking for.",
        "To hold expenditure constant after a price change of x%, adjust quantity by x/(100+x)×100%, not by x% itself.",
        "Convert percentages to simple fractions (25%=1/4, 12.5%=1/8) for fast mental multiplication.",
        "Combine ratios by scaling the shared term to its LCM before merging.",
        "Alligation ratio = (higher − mean) : (mean − lower); the value closer to the mean gets the bigger share.",
      ],
      links: [
        { label: "IndiaBix — Percentage Aptitude Questions", url: "https://www.indiabix.com/aptitude/percentage/" },
        { label: "IndiaBix — Ratio and Proportion", url: "https://www.indiabix.com/aptitude/ratio-and-proportion/" },
      ],
    },
    {
      moduleTitle: "Quantitative Aptitude",
      subModuleTitle: "Time, speed & distance",
      overview:
        "Time-speed-distance (TSD) problems test the same core relationship — distance = speed × time — in progressively disguised forms: relative speed between moving bodies, average speed over unequal time or distance segments, trains crossing objects of their own length, boats moving with or against a current, and circular-track races. Nearly every failure on this topic traces back to one of two errors: forgetting to convert units consistently (km/h vs m/s) or applying a simple average where a weighted or harmonic average is actually required. This sub-module builds fluency with the core formula and its unit conversions, then works through every major disguised variant — relative speed, average speed, trains, boats and streams, and races — with a fully worked numerical example for each, so that recognizing which variant a word problem represents becomes automatic rather than something to puzzle out under time pressure.",
      sections: [
        {
          heading: "Core Formula and Unit Conversion",
          body: "Distance = Speed × Time underlies every problem in this topic, but most errors come from inconsistent units. Converting km/h to m/s multiplies by 5/18; converting m/s to km/h multiplies by 18/5. Locking this conversion factor in as a reflex avoids a huge share of careless errors.",
          bullets: [
            "Convert 72 km/h to m/s: 72 × 5/18 = 20 m/s. Convert 20 m/s back to km/h: 20 × 18/5 = 72 km/h. ✓",
          ],
        },
        {
          heading: "Relative Speed: Same Direction vs Opposite Direction",
          body: "When two bodies move toward each other, their speeds add (relative speed = s1+s2) and the time to meet = distance/(s1+s2). When moving in the same direction, relative speed is the difference (s1−s2), used for 'catching up' problems.",
          bullets: [
            "Two trains 120 km apart move toward each other at 60 km/h and 40 km/h. Time to meet = 120/(60+40) = 1.2 hours = 72 minutes.",
            "A is 20 km ahead of B; A moves at 60 km/h and B chases at 40 km/h in the same direction. Time for B to catch up = 20/(60−40) = 1 hour.",
          ],
        },
        {
          heading: "Average Speed Is a Harmonic Mean, Not a Simple Average",
          body: "When equal DISTANCES are covered at two different speeds, average speed = 2×s1×s2/(s1+s2) — the harmonic mean, which is always less than the simple average of the two speeds. (If equal TIME is spent at each speed instead, the simple average is correct — the distinction matters.)",
          bullets: [
            "A travels half the distance at 60 km/h and the other half at 40 km/h. Average speed = 2×60×40/(60+40) = 4800/100 = 48 km/h — NOT the simple average of 50 km/h.",
          ],
        },
        {
          heading: "Trains Crossing Poles, Platforms, and Each Other",
          body: "A train crossing a stationary point (pole/man) travels its own length; crossing a platform, it travels its own length PLUS the platform's length. When two trains cross each other, use relative speed (sum if opposite directions, difference if same direction) and total length = sum of both train lengths.",
          bullets: [
            "A 150 m train crosses a pole in 10 seconds: speed = 150/10 = 15 m/s = 54 km/h.",
            "The same train (150 m, 15 m/s) crosses a 250 m platform: total distance = 400 m, time = 400/15 ≈ 26.7 seconds.",
            "A 100 m train and a 150 m train run toward each other at 40 km/h and 50 km/h. Relative speed = 90 km/h = 25 m/s; total length = 250 m; time to cross = 250/25 = 10 seconds.",
          ],
        },
        {
          heading: "Boats and Streams",
          body: "If boat speed in still water is b and stream speed is s, downstream speed = b+s and upstream speed = b−s. Round-trip problems require calculating each leg's time separately (distance/downstream speed, then distance/upstream speed) and summing — they cannot be averaged directly.",
          bullets: [
            "Boat speed in still water = 10 km/h, stream speed = 2 km/h. Downstream = 12 km/h, upstream = 8 km/h. For a 24 km trip each way: downstream time = 24/12 = 2 h, upstream time = 24/8 = 3 h. Total round trip = 5 hours.",
          ],
        },
        {
          heading: "Races and Head Starts",
          body: "'A gives B a start of x meters in a race of d meters' means when A finishes d meters, B has covered (d−x) meters in the same time — giving the speed ratio of A:B directly as d:(d−x).",
          bullets: [
            "A can give B a start of 20 m in a 100 m race (both finish together). Speed ratio A:B = 100:80 = 5:4.",
          ],
        },
        {
          heading: "Circular Track Meeting Problems",
          body: "On a circular track of length L, two runners moving in the same direction meet again after time = L/(s1−s2); moving in opposite directions, they meet after time = L/(s1+s2). This is structurally identical to the linear relative-speed rule, just wrapped around a loop.",
          bullets: [
            "Two runners on a 300 m circular track run in the same direction at 5 m/s and 3 m/s. They meet again after 300/(5−3) = 150 seconds.",
          ],
        },
      ],
      commonPitfalls: [
        "Forgetting to convert km/h to m/s (or vice versa) before combining with a distance given in a different unit.",
        "Averaging two speeds arithmetically when equal DISTANCE (not equal time) was covered at each speed — this needs the harmonic mean, 2s1s2/(s1+s2).",
        "Forgetting to add the platform's length to the train's own length when computing platform-crossing time.",
        "Using the sum of speeds for same-direction 'catching up' problems instead of the difference.",
        "In boats and streams, averaging upstream and downstream speed directly instead of calculating each leg's time separately when distances are equal but speeds differ.",
        "Misreading a race 'start' or 'beats by' statement and inverting the resulting speed ratio.",
      ],
      keyTakeaways: [
        "Lock in the conversion: km/h × 5/18 = m/s, and m/s × 18/5 = km/h.",
        "Opposite-direction relative speed adds; same-direction relative speed subtracts.",
        "Average speed for EQUAL DISTANCES is the harmonic mean 2s1s2/(s1+s2), always less than the simple average.",
        "Train crossing a platform: distance = train length + platform length; crossing a pole: distance = train length only.",
        "Boats and streams: downstream = b+s, upstream = b−s; compute each leg's time separately for round trips.",
        "A 'start of x in a race of d' gives speed ratio d:(d−x).",
      ],
      links: [
        { label: "IndiaBix — Time and Distance Aptitude Questions", url: "https://www.indiabix.com/aptitude/time-and-distance/" },
        { label: "IndiaBix — Boats and Streams", url: "https://www.indiabix.com/aptitude/boats-and-streams/" },
      ],
    },
    {
      moduleTitle: "Quantitative Aptitude",
      subModuleTitle: "Profit & loss",
      overview:
        "Profit and loss questions test whether a candidate can correctly identify which value — cost price, marked price, or selling price — a given percentage is calculated against, since mixing these up is the single most common source of wrong answers on this topic. A markup is always applied to cost price, a discount is always applied to marked price, and profit/loss percentage is always calculated against cost price — three different bases that must never be confused. This sub-module works through the standard CP-SP-profit% relationship, the marked-price-and-discount combination (including the classic 'successive markup then discount' trap), false-weight dishonest-dealer problems, multi-stage transactions, partnership profit-sharing, and CP problems that include overhead expenses — each with a complete numerical solution so the underlying base-value logic, not just the final formula, becomes second nature.",
      sections: [
        {
          heading: "Core CP-SP-Profit% Relationship",
          body: "Profit = SP − CP, and Profit% is always calculated on Cost Price: Profit% = (Profit/CP)×100. Loss% follows the same logic with Loss = CP − SP. Memorizing 'percentage is on CP, always' prevents the most common error on this topic.",
          bullets: [
            "CP = ₹800, SP = ₹920. Profit = ₹120. Profit% = 120/800 × 100 = 15%.",
          ],
        },
        {
          heading: "Marked Price, Discount, and the Successive-Change Trap",
          body: "Marked price (MP) is set above CP by a markup percentage; the actual selling price after a discount is applied to MP, not to CP. A markup followed by a discount is a successive percentage change (see the Percentages sub-module) and must never be treated as canceling out.",
          bullets: [
            "A shopkeeper marks goods up 40% then gives a 25% discount. Let CP = 100. MP = 140. SP = 140 × 0.75 = 105. Net profit% = 5% — not a wash, despite the discount percentage exceeding the markup by nothing obvious at a glance.",
          ],
        },
        {
          heading: "False Weight (Dishonest Dealer) Problems",
          body: "When a dealer sells at cost price but uses a weight less than what's claimed, the dealer's real profit% = (True weight − Used weight)/(Used weight) × 100 — the profit comes purely from the weight shortfall, not from any price markup.",
          bullets: [
            "A dealer claims to sell at cost price but uses a 900 g weight for a claimed 1 kg. Real profit% = (1000−900)/900 × 100 = 11.11%.",
          ],
        },
        {
          heading: "Successive Transactions (Buying and Reselling)",
          body: "When an item changes hands more than once, each sale's profit/loss percentage applies to that transaction's own CP (the previous SP), not to the original CP — chain the transactions sequentially rather than adding percentages.",
          bullets: [
            "A buys an item for ₹1000 and sells to B at 20% profit: SP to B = ₹1200. B then sells to C at a 10% loss: SP to C = 1200 × 0.9 = ₹1080. Overall, ₹1000 became ₹1080 — a net 8% profit over the two transactions (not 20%−10%=10%).",
          ],
        },
        {
          heading: "Partnership Profit Sharing",
          body: "When partners invest different amounts for different durations, profit is shared in the ratio of (investment × time) for each partner, not simply the investment ratio alone.",
          bullets: [
            "A invests ₹5000 for 12 months, B invests ₹6000 for 8 months. Ratio = (5000×12):(6000×8) = 60000:48000 = 5:4. If total profit is ₹9000, A gets ₹5000 and B gets ₹4000.",
          ],
        },
        {
          heading: "Reverse Problems: Finding MP or CP From SP",
          body: "Many exam questions give the final SP and a discount or profit percentage and ask you to work backward to MP or CP — this requires dividing by (1 ± percentage), not multiplying, since the percentage was originally applied forward to the unknown value.",
          bullets: [
            "An item sells for ₹450 after a 10% discount. MP × 0.9 = 450, so MP = 450/0.9 = ₹500.",
          ],
        },
        {
          heading: "Cost Price Including Overhead Expenses",
          body: "Real CP for profit% calculations must include all expenses incurred before sale (repairs, transport, packaging) — using only the purchase price and ignoring overheads understates the true cost base and overstates the profit percentage.",
          bullets: [
            "An article is bought for ₹1200, with ₹300 spent on repairs, then sold for ₹1800. True CP = 1200+300 = ₹1500. Profit = 1800−1500 = ₹300. Profit% = 300/1500 × 100 = 20% (not 300/1200 = 25%, which ignores the overhead).",
          ],
        },
      ],
      commonPitfalls: [
        "Calculating discount on CP instead of MP, or markup on SP instead of CP — always: markup is on CP, discount is on MP.",
        "Assuming a markup% and a larger discount% of the same numeric value cancel to a net loss — always compute using net% = a+b+ab/100.",
        "In false-weight problems, calculating profit% on the claimed weight instead of the actually-used (smaller) weight.",
        "Adding profit and loss percentages across successive transactions instead of chaining each one onto the previous SP.",
        "Using investment amount alone for partnership profit-sharing, ignoring the time each partner's capital was invested.",
        "Forgetting to include overhead/incidental expenses in CP before calculating profit percentage.",
        "When working backward from SP to find MP or CP, subtracting the percentage instead of dividing by (1 ± percentage/100).",
      ],
      keyTakeaways: [
        "Profit% and Loss% are always calculated on Cost Price — never on SP or MP.",
        "Markup applies to CP to get MP; discount applies to MP to get SP — two different base values, never interchange them.",
        "False-weight profit% = (claimed weight − used weight)/(used weight) × 100.",
        "Chain successive transactions sequentially (each SP becomes the next CP) rather than adding percentages.",
        "Partnership profit ratio = (investment × time) for each partner, not investment alone.",
        "To reverse-solve for MP/CP from a known SP, divide by (1 ± rate/100), don't just subtract the percentage.",
      ],
      links: [
        { label: "IndiaBix — Profit and Loss Aptitude Questions", url: "https://www.indiabix.com/aptitude/profit-and-loss/" },
        { label: "Investopedia — Gross Profit Margin", url: "https://www.investopedia.com/terms/g/grossprofitmargin.asp" },
      ],
    },
    {
      moduleTitle: "Quantitative Aptitude",
      subModuleTitle: "Data interpretation",
      overview:
        "Data interpretation (DI) questions test whether a candidate can extract and compute accurately from tables, bar graphs, pie charts, line graphs, and short caselets under time pressure — the underlying arithmetic is usually simple, but the challenge is reading the right numbers off the right chart and knowing when to approximate versus calculate exactly. Most points are lost not from wrong formulas but from misreading axis scales, using the wrong base year for a percentage change, or spending too long on an exact calculation when a rounded estimate would eliminate three of four answer options instantly. This sub-module covers each major chart type with a fully worked numeric example, plus dedicated coverage of approximation techniques for speed and cross-category averaging, since DI sets are usually timed as a block and reward a consistent, fast reading-and-computing method over raw calculation speed alone.",
      sections: [
        {
          heading: "Reading Tables Accurately",
          body: "Table-based DI tests careful reading above all — identify the correct row/column intersection, and for 'percentage change' questions always divide by the EARLIER year's value (the base), not the later one.",
          bullets: [
            "A company's sales (in ₹ lakh) were: 2019: 120, 2020: 150, 2021: 135, 2022: 180. Percentage change from 2021 to 2022 = (180−135)/135 × 100 = 33.33%.",
          ],
        },
        {
          heading: "Bar Graphs and Share of Total",
          body: "Bar graphs commonly ask for one category's share of the total across all bars — sum every bar first, then divide the target bar by that sum.",
          bullets: [
            "Five products A–E have sales of 40, 60, 50, 70, 30 (in units). Total = 250. Product D's share = 70/250 × 100 = 28%.",
          ],
        },
        {
          heading: "Pie Charts: Degrees, Percentages, and Absolute Values",
          body: "A pie chart's full circle is 360° = 100%, so any sector's percentage = (sector degrees/360)×100, and converting to an absolute value requires multiplying that percentage by the given total.",
          bullets: [
            "A 72° sector represents 72/360 × 100 = 20% of the total.",
            "If total students = 500 and the Engineering sector spans 90°, students in Engineering = 90/360 × 500 = 125.",
          ],
        },
        {
          heading: "Line Graphs and Trend Questions",
          body: "Line graphs are typically used for average, trend, and rate-of-change questions across a sequence of points — read each point carefully off the y-axis before summing, since misreading even one point shifts the average.",
          bullets: [
            "A line graph shows daily temperatures over 5 days: 20, 22, 19, 25, 23 (°C). Average = (20+22+19+25+23)/5 = 109/5 = 21.8°C.",
          ],
        },
        {
          heading: "Caselet-Based DI",
          body: "Caselets present data as a short paragraph rather than a chart, requiring you to first extract the relevant numbers into a mental (or scratch-paper) table before answering — treat this as a two-step process: extraction, then calculation.",
          bullets: [
            "A shop sold Pen A: 200 units at ₹10, Pen B: 150 units at ₹15, Pen C: 100 units at ₹20. Total revenue = 2000+2250+2000 = ₹6250. Pen B's revenue share = 2250/6250 × 100 = 36%.",
          ],
        },
        {
          heading: "Approximation Techniques for Speed",
          body: "When answer options are far apart, round the numbers to the nearest convenient value before dividing — this gets close enough to eliminate wrong options in a fraction of the time an exact calculation would take.",
          bullets: [
            "Estimate 4875/62 quickly: round to 4900/60 ≈ 81.7. The exact value (≈78.6) is close enough that if the options are 40, 79, 120, and 200, the approximation immediately identifies 79 without long division.",
          ],
        },
        {
          heading: "Comparing Averages and Ratios Across Categories",
          body: "Questions that ask you to compare two data series (e.g., two companies' profits over several years) usually reduce to computing each series' average and then forming a ratio — do each average separately before comparing, rather than trying to compare running totals.",
          bullets: [
            "Company X's profits over 3 years: 100, 120, 140 (avg = 120). Company Y's profits: 90, 110, 130 (avg = 110). Ratio of average profits X:Y = 120:110 = 12:11.",
          ],
        },
      ],
      commonPitfalls: [
        "Calculating a percentage change using the later year as the base instead of the earlier (original) year.",
        "Misreading a bar or line graph's y-axis scale, especially when it doesn't start at zero or uses non-uniform gridlines.",
        "Converting a pie chart sector to a percentage using the wrong total (forgetting the full circle is 360°, not 100).",
        "Spending time on exact long division in a DI set when the answer options are far enough apart for approximation to work.",
        "In caselets, answering from memory of the paragraph instead of re-extracting the exact numbers needed for that specific question.",
        "Comparing two data series by eyeballing totals instead of computing and comparing actual averages or ratios.",
      ],
      keyTakeaways: [
        "Percentage change always divides by the earlier (base) value, never the later value.",
        "Pie chart sector % = (degrees/360) × 100; multiply by the given total to get absolute values.",
        "A category's share of a bar/pie total = that category's value ÷ sum of all categories.",
        "Approximate aggressively when answer options are far apart — exact precision wastes time DI sets don't allow.",
        "In caselets, extract numbers into a mini-table first, then compute — don't calculate from memory of the prose.",
        "Compute each series' own average before forming a comparison ratio between two data sets.",
      ],
      links: [
        { label: "IndiaBix — Data Interpretation Questions", url: "https://www.indiabix.com/aptitude/data-interpretation/" },
        { label: "GeeksforGeeks — Aptitude Questions and Answers", url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/" },
      ],
    },

    // ───────────────────────── Logical Reasoning ─────────────────────────
    {
      moduleTitle: "Logical Reasoning",
      subModuleTitle: "Puzzles",
      overview:
        "Logical puzzles — ranking, distribution, floor-based, and box/grid arrangements — test systematic deduction under a strict set of constraints rather than raw calculation, and the biggest score difference between candidates comes from HOW they organize the clues, not from any special mathematical ability. Attempting to hold every clue in your head at once is what causes candidates to freeze; the fix is external representation — a grid, a number line, or a simple table — filled in step by step, applying the most restrictive (most specific) clue first. This sub-module walks through the core puzzle families with fully solved examples: a preference-matching grid, a linear ranking puzzle, a distribution puzzle with algebraic constraints, a floor-based puzzle, a box/position puzzle, conditional (if-then) chain deduction, and a time-management approach for puzzle sets, which are usually worth several questions each and reward getting the setup right once.",
      sections: [
        {
          heading: "Grid Method for Preference-Matching Puzzles",
          body: "When each of several people is matched to exactly one item from a set (fruit, subject, sport), draw a grid of people vs items and mark each clue as a confirmed match, an elimination, or leave blank — apply the most specific clues (direct matches) before the exclusionary ones, since a single confirmed match often forces several others by elimination.",
          bullets: [
            "Aisha, Bala, Chetan, Divya each like exactly one of mango, apple, grape, banana. Clues: Aisha doesn't like mango or banana; Bala likes grape; Chetan doesn't like apple; Divya likes mango. Since Divya=mango, Aisha (not mango, not banana, grape taken by Bala) must like apple. Chetan (not apple, apple already taken anyway) gets the only fruit left: banana. Final: Aisha–apple, Bala–grape, Chetan–banana, Divya–mango.",
          ],
        },
        {
          heading: "Linear Ranking Puzzles",
          body: "Ranking puzzles (1st to last place) are solved by first placing any absolutely-fixed clues (e.g., 'X is ranked 2nd'), then working through relative clues ('immediately above/below') against the remaining open slots.",
          bullets: [
            "Five students P, Q, R, S, T are ranked 1 (best) to 5 (worst). Clues: R is ranked 2nd; S is ranked last (5th); Q is immediately above T. Remaining open ranks for P, Q, T are {1, 3, 4}. The only consecutive pair within {1,3,4} is (3,4), so Q=3, T=4, leaving P=1. Final order: P, R, Q, T, S.",
          ],
        },
        {
          heading: "Distribution Puzzles With Algebraic Constraints",
          body: "Distribution puzzles (items shared among people with relative-quantity clues) are often fastest solved by assigning a variable to the smallest unknown and expressing every other quantity in terms of it, then solving the resulting equation from the total.",
          bullets: [
            "20 chocolates are split among P, Q, R such that P gets 4 more than Q, and R gets twice as many as P. Let Q = x. Then P = x+4, R = 2(x+4). Sum: x + (x+4) + 2(x+4) = 20 → 4x + 12 = 20 → x = 2. So Q=2, P=6, R=12 (check: 2+6+12=20 ✓).",
          ],
        },
        {
          heading: "Floor-Based Puzzles",
          body: "Floor puzzles (people living on numbered floors) work like ranking puzzles but with the added twist of 'above/below' language mapping directly to higher/lower floor numbers — fix the anchor clues first (specific floor, topmost/bottommost), then work outward.",
          bullets: [
            "Six floors (1=bottom to 6=top), six people A–F. Clues: A is on floor 3; C is on the topmost floor (6); D is immediately below C (floor 5); B is one floor above A (floor 4). That leaves floors 1 and 2 for E and F — genuinely undetermined without a further clue, which is common: not every puzzle resolves every person, and a well-set question only asks about what CAN be determined.",
          ],
        },
        {
          heading: "Box and Position Puzzles",
          body: "Box or position-in-a-row puzzles (cars in parking slots, boxes on a shelf) follow the same discipline as ranking puzzles: place absolute-position clues first (an exact slot number or 'at an end'), then use relative clues to fill in what remains.",
          bullets: [
            "5 positions in a row (1 to 5, left to right): Red is at position 3. Blue is immediately right of Red (so Blue=4). Green is at an end (1 or 5). Black is not at an end. White is at position 1. Since White=1, Green (must be an end, and 1 is taken) must be 5. The only non-end slot left, 2, goes to Black. Final: White, Black, Red, Blue, Green.",
          ],
        },
        {
          heading: "Chain Deduction With Conditional (If-Then) Statements",
          body: "Some puzzles present a chain of conditional statements rather than positions — the technique is to trace the chain forward from whatever fact is confirmed true, applying each 'if-then' link in sequence until you reach the final conclusion.",
          bullets: [
            "'If it rains, the match is postponed. If the match is postponed, the team practices indoors. It rained today.' Chain: rain → postponed → indoor practice. Conclusion: the team practiced indoors today.",
          ],
        },
        {
          heading: "Time Management for Puzzle Sets",
          body: "Puzzle sets are usually worth 3-5 questions tied to one setup, so the setup time is amortized across all of them — investing an extra 60-90 seconds to build a correct, complete grid up front is almost always worth it, versus rushing the setup and having to redo work when a contradiction appears midway.",
          bullets: [
            "If a puzzle takes 3 minutes to set up correctly but then yields 5 quick questions at under 30 seconds each, total time is about 5.5 minutes for 5 marks — far better than guessing at an incomplete or contradictory setup and losing several of those marks.",
          ],
        },
      ],
      commonPitfalls: [
        "Trying to solve a multi-person puzzle mentally without drawing a grid or table, leading to lost track of earlier deductions.",
        "Applying clues in the order they're written instead of applying the most restrictive (absolute-position) clues first.",
        "Misreading 'immediately above/below' as simply 'above/below' (any distance), which allows too many possibilities and causes contradictions later.",
        "Assuming every person/position in a puzzle must be fully determinable — some puzzles genuinely leave 2 people interchangeable if no clue distinguishes them.",
        "Not double-checking a completed grid against every original clue before answering, missing a clue that was overlooked mid-solve.",
        "Spending too little time on setup and guessing at questions once a contradiction appears, instead of re-checking clue placement order.",
      ],
      keyTakeaways: [
        "Always externalize a multi-constraint puzzle into a grid, table, or number line — never solve it purely in your head.",
        "Apply absolute/fixed clues (exact position, 'topmost', 'at an end') before relative clues ('immediately above', 'next to').",
        "'Immediately above/below/left/right' means directly adjacent; plain 'above/below/left/right' allows any distance.",
        "Not every puzzle fully determines every element — some ambiguity between two people can be a legitimate, intended outcome.",
        "For distribution puzzles, assign a variable to the smallest unknown and express the rest algebraically in terms of it.",
        "Invest adequate setup time on puzzle sets — the cost is amortized across several linked questions.",
      ],
      links: [
        { label: "IndiaBix — Logical Reasoning Puzzles", url: "https://www.indiabix.com/logical-reasoning/puzzles/" },
        { label: "GeeksforGeeks — Logical Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Logical Reasoning",
      subModuleTitle: "Seating arrangements",
      overview:
        "Seating arrangement questions extend puzzle-solving to a specific, heavily-tested format: linear rows, circular tables, and double rows, each with their own conventions for how 'left', 'right', 'facing', and 'opposite' should be interpreted. The single biggest source of wrong answers is applying linear-row intuition to circular or facing-inward/outward arrangements, where left and right flip depending on which way people face — a mechanical rule, not guesswork, resolves this correctly every time. This sub-module builds a consistent notation and diagramming habit, covers linear arrangements (including counting from left vs right), circular arrangements (facing center vs facing outward), double-row arrangements where two rows face each other, the critical distinction between 'left of' and 'immediately left of,' and how to work through negative ('is not') constraints — all through fully solved examples.",
      sections: [
        {
          heading: "Linear Arrangement Basics",
          body: "In a row of n people, 'kth from the left' and 'kth from the right' refer to different positions unless explicitly stated — position from the right = n − (rank from right) + 1. Always convert to one consistent numbering system before solving.",
          bullets: [
            "6 people sit in a row, all facing north. B sits 3rd from the left (position 3). E sits 2nd from the right — using position = n−rank+1 = 6−2+1 = 5, E is at position 5. A sits immediately left of B, so A is at position 2.",
          ],
        },
        {
          heading: "Circular Arrangements: Facing Center vs Facing Outward",
          body: "For people seated facing the CENTER of a circular table, moving clockwise corresponds to a person's LEFT and moving anticlockwise corresponds to their RIGHT — this feels counterintuitive but is the standard convention, and it fully reverses if the people instead face AWAY from the center.",
          bullets: [
            "6 people sit around a table facing the center, seats numbered 1–6 clockwise. Q is at seat 1. R is opposite Q (3 seats apart in a 6-seat circle) → R is at seat 4. P is immediately to Q's right — since facing center, 'right' = anticlockwise — so P is at seat 6.",
          ],
        },
        {
          heading: "Diagramming Technique",
          body: "Draw the row or circle as blank slots first, place every absolute-position clue, then work relative clues outward from those anchors — updating the diagram after each deduction (rather than trying to hold intermediate states mentally) prevents the single most common source of seating-arrangement errors: losing track of an earlier placement.",
        },
        {
          heading: "Double Row Arrangements",
          body: "When two rows face each other (e.g., Row 1 facing south, Row 2 facing north), positions are typically compared using each row's own physical left-to-right numbering, and 'opposite' pairs the same position-numbers across rows — the rows facing each other means viewer-perspective left/right differs between the two rows, so always anchor to physical, not viewer, position numbers.",
          bullets: [
            "Row 1 (facing south): P, Q, R, S at positions 1–4 (left to right). Row 2 (facing north): W, X, Y, Z, each seated opposite someone in Row 1. W is opposite Q (position 2) → W is in Row 2's position 2. X is opposite S (position 4) → X is in Row 2's position 4. Y and Z occupy positions 1 and 3, order undetermined without a further clue.",
          ],
        },
        {
          heading: "'Left Of' vs 'Immediately Left Of'",
          body: "'A is to the left of B' only means A is somewhere to B's left (any distance) — it does not fix adjacency. 'A is immediately to the left of B' fixes A directly next to B. Misreading one for the other is the single most common seating-arrangement error and can allow (or wrongly eliminate) many valid arrangements.",
          bullets: [
            "In a row of 5, 'C is to the left of D' alone allows several arrangements (C could be in position 1, 2, 3, or 4 relative to D anywhere further right). 'C is immediately to the left of D' fixes them as an adjacent CD block, sharply reducing the possibilities.",
          ],
        },
        {
          heading: "Working Through Negative ('Is Not') Constraints",
          body: "Negative clues ('X is not at an end', 'Y is not adjacent to Z') are best applied AFTER positive clues have narrowed the open slots, since a negative clue only eliminates options rather than fixing a position — applying them too early with too many open slots wastes time checking cases that get resolved anyway by later positive clues.",
          bullets: [
            "5 seats. H is at an end (seat 1 or 5). F is not at an end and sits exactly in the middle (seat 3). G is not adjacent to F, so G ≠ seat 2 and G ≠ seat 4 → G must be seat 5 (if H=1) or seat 1 (if H=5). This narrows the remaining two people to the two leftover seats.",
          ],
        },
        {
          heading: "Common Traps in Direction-Based Seating",
          body: "The exact same relative clue ('P is to the right of Q') produces a different physical arrangement depending on whether people face inward or outward, and whether the row faces the reader or faces away — always establish the facing direction from the question stem before applying any left/right clue, and re-derive the convention rather than assuming it matches a previous question's setup.",
        },
      ],
      commonPitfalls: [
        "Applying viewer's left/right instead of the seated person's own left/right when a direction is not explicitly the reader's perspective.",
        "Forgetting that for people facing the CENTER of a circle, clockwise = their left and anticlockwise = their right (reversed for facing outward).",
        "Treating 'X is to the left of Y' as adjacency when only 'immediately to the left' guarantees that.",
        "In double-row arrangements, comparing viewer-perspective positions across the two rows instead of each row's own physical left-to-right numbering.",
        "Applying negative ('is not') constraints before positive/absolute constraints, wasting time on cases that get eliminated anyway.",
        "Not re-deriving the facing convention for each new question, carrying over an assumption from a previous, differently-configured puzzle.",
      ],
      keyTakeaways: [
        "Position from the right in a row of n = n − rank + 1; always convert to one consistent numbering before solving.",
        "Facing the center of a circle: clockwise = left, anticlockwise = right (reversed if facing outward).",
        "'Left/right of' allows any distance; 'immediately left/right of' fixes strict adjacency — never conflate the two.",
        "In double rows facing each other, match physical (not viewer) position numbers across rows for 'opposite' pairs.",
        "Place absolute-position clues on the diagram first, then relative clues, then negative constraints last.",
        "Update a drawn diagram step by step rather than tracking placements mentally.",
      ],
      links: [
        { label: "IndiaBix — Seating Arrangement Questions", url: "https://www.indiabix.com/logical-reasoning/seating-arrangement/" },
        { label: "GeeksforGeeks — Logical Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Logical Reasoning",
      subModuleTitle: "Blood relations",
      overview:
        "Blood relation questions test whether a candidate can build and traverse a family tree correctly across generations, often disguised through coded symbols (+, −, ×, ÷ standing for relations) or riddle-style phrasing ('pointing to a photograph...') designed to hide a simple relationship behind confusing wording. The core skill is mechanical, not clever — draw the family tree with a generation-line notation as each clue arrives, and the answer falls out by reading the tree rather than trying to hold the relationship chain in your head. This sub-module covers basic relation-term notation, multi-generation tree building, coded (symbolic) blood relations, the classic gender-ambiguity traps that catch students off guard, complex multi-generation puzzles, a quick-reference relation table, and the well-known 'pointing to a photograph' riddle format, each worked through to a definite answer.",
      sections: [
        {
          heading: "Basic Relation Terms and Tree Notation",
          body: "Build a simple tree using generation levels (older generation on top, younger below) connected by relation labels — this converts a string of stated relations into a visual structure that's easy to read the final answer from, rather than re-deriving the chain from scratch for each question about the same family.",
          bullets: [
            "'A is B's father. B is C's mother.' Draw A (top) connected down to B, and B connected down to C, with C's gender unspecified. A is C's maternal grandfather (father of C's mother).",
          ],
        },
        {
          heading: "Generation Tree Building Across Multiple Clues",
          body: "As clues accumulate, keep adding to the same tree rather than starting a fresh mental calculation for each new statement — most errors happen when a student tries to re-derive earlier relationships from memory instead of reading them off an already-built diagram.",
          bullets: [
            "'P is Q's mother. R is P's father. S is R's wife.' Tree: R and S (grandparent generation) → P (their child) → Q (P's child). S, being R's wife, is P's mother, making S Q's grandmother (maternal, since P is Q's mother).",
          ],
        },
        {
          heading: "Coded Blood Relations (Symbol-Based)",
          body: "Symbol-coded questions define operators (commonly +, −, ×, ÷) for specific relations at the start of the question — translate each symbol into its relation word first, then build the tree exactly as with plain-language clues.",
          bullets: [
            "Given: A+B means A is B's mother; A−B means A is B's brother; A×B means A is B's father; A÷B means A is B's sister. Evaluate 'P × R + S': P×R means P is R's father. R+S means R is S's mother (so R is female). Combining: P is the father of R, and R is the mother of S — so P is S's maternal grandfather.",
          ],
        },
        {
          heading: "Gender Ambiguity and Classic Traps",
          body: "Many blood relation riddles hinge on a subtle logical trick rather than a long chain — reading the statement literally and carefully, rather than assuming a 'typical' relationship, is essential.",
          bullets: [
            "'Pointing to a man, a woman said: \"His mother is the only daughter of my mother.\"' The only daughter of the woman's mother is the woman herself (she has no sisters). So 'his mother' = the woman. The woman is the man's mother.",
          ],
        },
        {
          heading: "Complex Multi-Generation Puzzles",
          body: "When a question spans three or more generations, build the tree top-down (oldest generation first) and resolve the final relationship by tracing the shortest path between the two people asked about, naming each intermediate relation as you go.",
          bullets: [
            "'A is the son of B. B is the sister of C. C is the mother of D.' B is C's sister, and C is D's mother, so B is D's (maternal) aunt. A is B's son, so A is D's cousin (specifically, the son of D's maternal aunt).",
          ],
        },
        {
          heading: "Quick-Reference Relation Chains",
          body: "Certain compound relations recur constantly and are worth memorizing directly rather than re-deriving each time.",
          bullets: [
            "Mother's/father's brother = uncle; mother's/father's sister = aunt; uncle's/aunt's child = cousin; spouse's brother = brother-in-law; spouse's sister = sister-in-law; father's father = paternal grandfather; mother's father = maternal grandfather.",
          ],
        },
        {
          heading: "The 'Pointing to a Photograph' Riddle Format",
          body: "This classic format always describes a relationship of the speaker to a person in a photo, and the trick is almost always in correctly identifying who 'my grandfather's only son' or similar phrases actually refers to — usually the speaker's own father, unless the wording explicitly rules that out.",
          bullets: [
            "'Pointing to a photograph, a man said: \"She is the daughter of my grandfather's only son.\"' The speaker's grandfather's only son is the speaker's own father (assuming the standard convention that the speaker isn't referring to himself). So 'she' is the speaker's father's daughter — his sister.",
          ],
        },
      ],
      commonPitfalls: [
        "Trying to hold a multi-step relation chain in your head instead of drawing a generation tree as each clue arrives.",
        "Assuming a gender for an ambiguous relation term (e.g., 'sibling', 'cousin', 'child') that the question never actually specifies.",
        "Misreading 'only son'/'only daughter' clues, which are often the key trick identifying the speaker or a specific relative directly.",
        "In coded (symbolic) relation questions, forgetting to first translate every symbol into its relation word before building the tree.",
        "Losing track of which generation level a person belongs to in a 3+ generation puzzle, leading to an off-by-one-generation error.",
        "Assuming 'brother' or 'sister' when the question only established a parent-child or sibling-of-parent relationship without confirming gender.",
      ],
      keyTakeaways: [
        "Always draw a generation-based family tree as clues arrive — never try to resolve blood relations purely mentally.",
        "In coded/symbolic questions, translate every symbol to its relation word first, then build the tree exactly as usual.",
        "'Only son'/'only daughter' clues are almost always the key that identifies a specific person (often the speaker or a parent) precisely.",
        "Memorize the standard compound-relation chains (uncle, aunt, cousin, in-laws, grandparents) to skip re-deriving them each time.",
        "In photograph/riddle-style questions, default to the standard convention that the speaker is describing a relative other than themselves unless stated otherwise.",
        "Trace the shortest path between the two people asked about in a multi-generation tree, naming each link along the way.",
      ],
      links: [
        { label: "IndiaBix — Blood Relation Test", url: "https://www.indiabix.com/logical-reasoning/blood-relation-test/" },
        { label: "GeeksforGeeks — Logical Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Logical Reasoning",
      subModuleTitle: "Syllogisms",
      overview:
        "Syllogism questions test formal logical inference using categorical statements — All, No, Some, and Some...not — and whether a proposed conclusion follows NECESSARILY from the given statements, regardless of whether it happens to be true in the real world. The Venn diagram method is the single most reliable technique because it forces you to consider every geometrically possible arrangement of the categories rather than relying on intuition, which frequently fails on syllogisms because they're deliberately designed to trigger plausible-but-invalid conclusions. This sub-module covers the four statement types, the Venn diagram method, the rules of valid conversion between statement types, how to handle 'some' statements with multiple possibility cases, complementary/either-or conclusion pairs, multi-statement chains, and the most common distractor-conclusion patterns that catch students who reason from real-world plausibility instead of strict logical necessity.",
      sections: [
        {
          heading: "The Four Categorical Statement Types",
          body: "Every syllogism statement is one of four types: A (All X are Y — universal affirmative), E (No X is Y — universal negative), I (Some X are Y — particular affirmative), or O (Some X are not Y — particular negative). Correctly classifying each given statement is the first step before any diagram or inference.",
        },
        {
          heading: "The Venn Diagram Method",
          body: "Draw the categories as circles and test whether the proposed conclusion holds in EVERY valid diagram consistent with the premises — if even one valid diagram breaks the conclusion, it does not follow necessarily.",
          bullets: [
            "'All cats are animals. All animals are living beings.' Draw cats as a small circle fully inside a larger 'animals' circle, itself fully inside 'living beings.' In every such diagram, cats are also inside living beings — so 'All cats are living beings' is a VALID conclusion.",
          ],
        },
        {
          heading: "Rules of Conversion (Immediate Inference)",
          body: "Some statement types convert validly to a related form and others don't: 'No A is B' validly converts to 'No B is A'. 'All A are B' does NOT convert to 'All B are A', but does validly convert to the weaker 'Some B is A' (since A is assumed non-empty).",
          bullets: [
            "'All roses are flowers.' Valid conversion: 'Some flowers are roses.' INVALID conversion: 'All flowers are roses' (there could be flowers that aren't roses).",
          ],
        },
        {
          heading: "Handling 'Some' Statements: Possibility Cases",
          body: "Two particular ('I' type, 'Some...') premises never yield a valid conclusion between their end terms, because the shared middle term isn't 'distributed' (fully accounted for) in either premise, leaving the relationship between the end terms genuinely undetermined.",
          bullets: [
            "'Some doctors are engineers. Some engineers are teachers.' Conclusion 'Some doctors are teachers' does NOT follow — draw two different valid Venn diagrams (one where the doctor-engineers and teacher-engineers overlap, one where they don't) to see the conclusion isn't forced in every case.",
          ],
        },
        {
          heading: "Complementary Pairs and Either-Or Conclusions",
          body: "When neither of two candidate conclusions (typically an I-type and an E-type statement about the same two terms) follows individually, but the premises guarantee that at least one of them MUST be true, the pair is called complementary and the correct answer is 'either conclusion I or conclusion II follows.'",
        },
        {
          heading: "Multi-Statement Chains",
          body: "With three or more linked statements, chain the categories through each 'All' or 'No' relationship step by step — a chain of All-statements preserves full inclusion, and one negative (No) link anywhere in the chain makes the final relationship exclusionary.",
          bullets: [
            "'All mobiles are gadgets. All gadgets are electronic. No electronic item is cheap.' Chain: mobiles ⊂ gadgets ⊂ electronic, and electronic ∩ cheap = ∅. Therefore mobiles ∩ cheap = ∅ — 'No mobile is cheap' is a VALID conclusion.",
          ],
        },
        {
          heading: "Common Distractor-Conclusion Patterns",
          body: "The most common trap is assuming 'Some A are not B' implies 'No A is B' — it does not, since some A could still be B even while some are not.",
          bullets: [
            "'Some students are not girls' does NOT mean 'No student is a girl' — plenty of students could still be girls; the statement only guarantees at least one student who isn't.",
          ],
        },
      ],
      commonPitfalls: [
        "Judging a conclusion by real-world plausibility instead of strict logical necessity across every valid Venn diagram.",
        "Assuming 'All A are B' converts to 'All B are A' — it only validly converts to 'Some B is A'.",
        "Expecting a definite conclusion from two 'Some' (I-type) premises, when in most cases no valid conclusion follows.",
        "Confusing 'Some A are not B' with 'No A is B' — the former allows some A to still be B.",
        "Missing complementary (either-or) conclusion pairs by checking each candidate conclusion only in isolation.",
        "Losing track of which statement type (A/E/I/O) a given sentence maps to before starting the Venn diagram.",
      ],
      keyTakeaways: [
        "Classify every statement as A (All), E (No), I (Some), or O (Some...not) before diagramming.",
        "A conclusion is valid only if it holds in EVERY Venn diagram consistent with the premises, not just the most 'natural' one.",
        "'All A are B' only converts validly to 'Some B is A', never to 'All B are A'.",
        "Two 'Some' (I-type) premises almost never yield a valid conclusion between the end terms.",
        "'Some A are not B' never implies 'No A is B' — this is the single most common syllogism trap.",
        "Check for complementary (either-or) conclusion pairs whenever neither individual conclusion follows on its own.",
      ],
      links: [
        { label: "IndiaBix — Logical Deduction (Syllogism) Questions", url: "https://www.indiabix.com/logical-reasoning/logical-deduction/" },
        { label: "GeeksforGeeks — Logical Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Logical Reasoning",
      subModuleTitle: "Coding-decoding",
      overview:
        "Coding-decoding questions establish an artificial rule for transforming letters, numbers, or words, show one worked example of the rule in action, and then ask you to apply (or reverse) that same rule to a new input — the entire skill is pattern extraction from a single example, then mechanical, careful application. Common rule families include letter shifting (Caesar-style), numeric substitution, word-for-word substitution codes, coordinate/grid codes, and mixed patterns where odd and even positions shift differently — and the most common error is applying the discovered rule inconsistently rather than failing to find it. This sub-module works through each rule family with a fully solved example, including how to decode (reverse-apply) a rule, since decoding questions appear just as often as encoding ones and require running the pattern backward.",
      sections: [
        {
          heading: "Letter Shifting (Caesar-Style) Codes",
          body: "The most common coding rule shifts every letter forward or backward by a fixed number of positions in the alphabet — identify the shift from the given example word, then apply the identical shift to the new word.",
          bullets: [
            "If CAT is coded as DBU, each letter shifted forward by 1 (C→D, A→B, T→U). Using the same rule, DOG codes as: D→E, O→P, G→H → EPH.",
          ],
        },
        {
          heading: "Numeric Substitution Codes",
          body: "Numeric codes typically assign each letter its alphabetical position (A=1...Z=26) and then apply a further arithmetic operation (doubling, adding a constant) — extract both steps from the example before applying them to the new word.",
          bullets: [
            "If A=1, B=2, ..., Z=26, and each value is then doubled: CAT → C=3→6, A=1→2, T=20→40. Coded as 6-2-40.",
          ],
        },
        {
          heading: "Word-for-Word Substitution Codes",
          body: "Some questions code entire sentences, assigning each word an arbitrary code word — the technique is to find words common to two or more coded sentences and match them against the words common to the corresponding plain sentences.",
          bullets: [
            "'red is blue' is coded 'pa ta la'. 'blue is sky' is coded 'la ta ka'. The word common to both plain sentences is 'is'; the code word common to both coded sentences is 'ta'. So 'ta' means 'is'.",
          ],
        },
        {
          heading: "Matrix (Coordinate/Grid) Codes",
          body: "Grid-based codes place letters into a numbered row-column matrix, and each letter is represented by its (row, column) coordinate pair — once the grid layout is given or inferred from an example, decoding is a direct lookup.",
        },
        {
          heading: "Decoding: Running the Rule Backward",
          body: "Decoding questions give you the coded word and the rule (or an example pair) and ask for the original word — apply the inverse operation of whatever the encoding did (shift backward instead of forward, halve instead of double).",
          bullets: [
            "If EDUCATION is coded as FEVDBUJPO (each letter shifted forward by 1), decode GSJFOE by shifting each letter BACKWARD by 1: G→F, S→R, J→I, F→E, O→N, E→D → FRIEND.",
          ],
        },
        {
          heading: "Symbol-for-Letter Codes",
          body: "When a question provides a fixed key mapping symbols to letters (e.g., @ = A, # = B, % = C), decoding or encoding is a direct substitution using that key — the only real risk is a careless lookup error under time pressure, so double-check each symbol against the key rather than relying on memory after the first few.",
        },
        {
          heading: "Mixed and Position-Dependent Patterns",
          body: "The hardest coding questions apply different rules to different positions in a word (e.g., letters in odd positions shift +1, letters in even positions shift −1) — identify this by checking whether a single uniform shift explains the given example; if it doesn't fit cleanly, test position-dependent rules next.",
          bullets: [
            "If a single shift doesn't explain a given example word consistently across all letters, check whether odd-position letters and even-position letters are shifting by different amounts — a common design for higher-difficulty coding questions.",
          ],
        },
      ],
      commonPitfalls: [
        "Applying an inconsistent shift value across the letters of a word instead of double-checking the SAME shift explains every letter in the given example first.",
        "Forgetting to reverse the operation (shift backward, halve instead of double) when a question asks you to decode rather than encode.",
        "In word-substitution codes, matching the wrong pair of words between two coded sentences instead of finding the genuinely common word.",
        "Assuming a single uniform rule when the pattern is actually position-dependent (different rule for odd vs even letter positions).",
        "Misreading the alphabet position of a letter near the end (like X, Y, Z) and wrapping around incorrectly without checking whether the rule intends wrap-around at all.",
        "Not verifying the discovered rule against the FULL given example word before applying it to the new word, missing a rule that only partially fits.",
      ],
      keyTakeaways: [
        "Extract the coding rule strictly from the given example — verify it explains every letter/element before applying it elsewhere.",
        "Decoding is simply running the encoding rule in reverse (shift backward instead of forward, halve instead of double).",
        "In sentence/word-substitution codes, match the word common to two plain sentences against the code word common to their coded versions.",
        "If a uniform shift doesn't fit the example cleanly, test position-dependent (odd/even) rules next.",
        "Numeric letter codes usually combine an alphabet-position step (A=1...Z=26) with a further arithmetic operation — identify both separately.",
        "Double-check symbol/grid lookups against the given key each time rather than relying on memory partway through.",
      ],
      links: [
        { label: "IndiaBix — Coding-Decoding Questions", url: "https://www.indiabix.com/logical-reasoning/coding-decoding/" },
        { label: "GeeksforGeeks — Logical Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/logical-reasoning-questions-and-answers/" },
      ],
    },

    // ───────────────────────── Verbal Reasoning ─────────────────────────
    {
      moduleTitle: "Verbal Reasoning",
      subModuleTitle: "Reading comprehension",
      overview:
        "Reading comprehension (RC) tests whether a candidate can extract main ideas, tone, and specific facts from a passage accurately and quickly — under placement-test time pressure, the real skill being tested is disciplined reading strategy and answer elimination, not raw reading speed or vocabulary alone. The most common way strong readers still lose marks is answering from a vague memory of the passage instead of returning to the specific line the question is based on, and falling for options that are 'too broad,' 'too narrow,' or a plausible-sounding statement the passage never actually made. This sub-module covers skimming vs detailed reading strategy, identifying main idea and tone, distinguishing directly-stated facts from valid inferences, vocabulary-in-context questions, author's purpose, time budgeting for an RC set, and the classic wrong-answer patterns to eliminate quickly.",
      sections: [
        {
          heading: "Skimming vs Detailed Reading Strategy",
          body: "Skim the passage first (30-45 seconds) to grasp its overall structure and main idea, then read each question and return to the specific relevant portion of the passage for detailed reading — reading every word closely on the first pass wastes time on details that may not even be asked about.",
          bullets: [
            "Passage: 'Over the last decade, renewable energy costs have fallen sharply, with solar panel prices dropping nearly 80%. This decline has made solar competitive with fossil fuels in many regions, even without subsidies.' A 30-second skim is enough to identify the main idea: falling solar costs have made it price-competitive with fossil fuels.",
          ],
        },
        {
          heading: "Identifying Main Idea and Tone",
          body: "The main idea is usually stated or strongly implied in the first or last sentence of a paragraph; tone is judged from specific word choices (e.g., 'sharply', 'remarkably' suggest a more emphatic, positive tone than neutral factual reporting would use).",
          bullets: [
            "In the solar-energy passage above, words like 'sharply' and 'competitive... even without subsidies' signal an informative, mildly optimistic tone — not a critical or skeptical one.",
          ],
        },
        {
          heading: "Directly-Stated Facts vs Valid Inferences",
          body: "A direct question can be answered by pointing to an exact sentence in the passage; an inference question asks for something reasonably implied but never explicitly stated — inference answers must be strongly supported by the text, not merely 'possible.'",
          bullets: [
            "Direct question: 'By how much have solar prices dropped?' Answer: nearly 80% (explicitly stated). Inference question: 'What can be inferred about future solar adoption?' Reasonable inference: adoption is likely to increase further, since solar is now price-competitive without subsidies — this isn't stated outright but follows directly from what is.",
          ],
        },
        {
          heading: "Vocabulary-in-Context Questions",
          body: "These ask for a word's meaning AS USED in the passage, which may differ from its most common dictionary definition — always re-read the sentence containing the word and substitute each answer option back in to see which preserves the sentence's meaning.",
          bullets: [
            "In the passage, 'sharply' (as in 'costs have fallen sharply') means 'significantly/steeply,' not the more literal sense of 'in a sharp, pointed manner.'",
          ],
        },
        {
          heading: "Author's Purpose and Passage Type",
          body: "Distinguish whether a passage is primarily informative (reporting facts neutrally), persuasive (arguing for a viewpoint), or descriptive/narrative — this affects how to interpret tone questions and which conclusions the passage actually supports versus merely mentions.",
        },
        {
          heading: "Time Management for an RC Set",
          body: "A typical passage with 5 questions should take roughly 6-7 minutes total: about 60-90 seconds to skim-read the passage, then roughly 45-60 seconds per question including the time to re-locate the relevant sentence and eliminate wrong options.",
        },
        {
          heading: "Elimination Strategy for Tricky Options",
          body: "Most wrong options in RC fall into recognizable patterns: too broad (goes beyond what the passage actually claims), too narrow (true but misses the passage's main point), reverses the passage's actual claim, or introduces information never mentioned at all — scanning options for these patterns before re-checking the passage often eliminates 2-3 options immediately.",
          bullets: [
            "For a question on the solar passage asking 'what does the passage suggest', an option claiming solar is now CHEAPER than fossil fuels everywhere is too broad (the passage says 'competitive in many regions', not universally cheaper) — a classic eliminable overreach.",
          ],
        },
      ],
      commonPitfalls: [
        "Reading every word of the passage in painstaking detail on the first pass instead of skimming for structure first.",
        "Answering from a vague memory of the passage instead of returning to the exact relevant sentence for each question.",
        "Selecting an inference option that is merely 'possible' rather than one strongly and directly supported by the passage's actual wording.",
        "Choosing a vocabulary-in-context answer based on the word's most common dictionary meaning instead of its meaning in that specific sentence.",
        "Selecting an option that is 'too broad' — technically related to the passage but overstating what it actually claims.",
        "Running out of time on early passages by over-analyzing every line instead of allocating a fixed time budget per passage.",
      ],
      keyTakeaways: [
        "Skim first for structure and main idea (30-60 seconds), then return to specific lines only as each question requires.",
        "Inference answers must be strongly supported by the text, not merely plausible or consistent with it.",
        "Vocabulary-in-context questions require substituting the word's contextual meaning, not its default dictionary sense.",
        "Watch for 'too broad,' 'too narrow,' 'reversed,' and 'not mentioned' as the four classic wrong-answer patterns.",
        "Budget roughly 45-60 seconds per question after the initial skim, and don't let one passage consume the whole section's time.",
        "Author's tone is judged from specific word choices, not from the topic of the passage alone.",
      ],
      links: [
        { label: "IndiaBix — Verbal Ability: Comprehension", url: "https://www.indiabix.com/verbal-ability/comprehension/" },
        { label: "GeeksforGeeks — Verbal Ability Questions and Answers", url: "https://www.geeksforgeeks.org/verbal-ability-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Verbal Reasoning",
      subModuleTitle: "Sentence correction",
      overview:
        "Sentence correction questions test grammatical accuracy directly — subject-verb agreement, tense consistency, parallel structure, pronoun clarity, modifier placement, correct prepositions/idioms, and concise phrasing — by presenting a flawed sentence and asking for the grammatically correct version. The key skill is spotting the SPECIFIC error category quickly rather than vaguely sensing 'something sounds off,' since most placement tests structure wrong options around one clear, nameable grammar rule rather than stylistic preference. This sub-module works through the seven error categories that account for the overwhelming majority of sentence-correction questions, with a broken sentence and its fix shown side by side for each, so the pattern-recognition (not just the rule) becomes fast and automatic under time pressure.",
      sections: [
        {
          heading: "Subject-Verb Agreement",
          body: "The verb must agree in number with the TRUE grammatical subject, not with a noun that happens to sit closer to the verb (often inside a prepositional phrase) — this is the single most tested sentence-correction error.",
          bullets: [
            "Incorrect: 'The list of items are on the table.' (verb wrongly agrees with 'items' instead of the true subject 'list'.) Correct: 'The list of items is on the table.'",
          ],
        },
        {
          heading: "Tense Consistency",
          body: "Within a single sentence describing related events, the tenses must logically align — mixing past continuous with present tense for events that should be in the same timeframe is a common, easily-spotted error.",
          bullets: [
            "Incorrect: 'She was studying for two hours when the phone rings.' Correct: 'She was studying for two hours when the phone rang.' (both verbs describe the past).",
          ],
        },
        {
          heading: "Parallelism",
          body: "Items in a list or comparison must share the same grammatical form (all gerunds, all infinitives, all nouns) — mixing forms within one list is a very common and easily fixed error.",
          bullets: [
            "Incorrect: 'He likes swimming, to run, and cycling.' Correct: 'He likes swimming, running, and cycling.' (all three items now share the -ing gerund form).",
          ],
        },
        {
          heading: "Pronoun Reference and Ambiguity",
          body: "A pronoun (he, him, his, it, they) must clearly refer to exactly one possible noun — if a sentence has two candidates the pronoun could plausibly refer to, it's ambiguous and needs rewriting, often by replacing the pronoun with the actual name.",
          bullets: [
            "Incorrect (ambiguous): 'When Raj met Arjun, he gave him his book.' (unclear who 'he', 'him', and 'his' refer to). Correct: 'Raj gave Arjun his own book.' or restructure with explicit names.",
          ],
        },
        {
          heading: "Modifiers: Dangling and Misplaced",
          body: "A modifying phrase at the start of a sentence must logically describe the very next noun that follows it — if it doesn't (a 'dangling modifier'), the sentence technically describes something nonsensical.",
          bullets: [
            "Incorrect: 'Walking through the park, the flowers looked beautiful.' (this literally says the flowers were walking). Correct: 'Walking through the park, I thought the flowers looked beautiful.'",
          ],
        },
        {
          heading: "Idioms and Prepositions",
          body: "Certain words pair with fixed, non-negotiable prepositions by idiomatic convention rather than logical rule — these have to be memorized as fixed phrases rather than derived from general grammar rules.",
          bullets: [
            "Incorrect: 'He is good in mathematics.' Correct: 'He is good at mathematics.' (the fixed idiom is 'good at', not 'good in').",
          ],
        },
        {
          heading: "Redundancy and Conciseness",
          body: "Phrases that repeat the same meaning twice ('reason...because', 'return back', 'free gift') should be trimmed to their single clearest form — correctness questions frequently include an option that fixes the grammar but leaves redundant phrasing, which is still the wrong choice if a cleaner option exists.",
          bullets: [
            "Incorrect (redundant): 'The reason why he failed is because he didn't study.' Correct: 'He failed because he didn't study.' (removes the redundant 'the reason why...is because' construction entirely).",
          ],
        },
      ],
      commonPitfalls: [
        "Matching the verb to the nearest noun (often inside a prepositional phrase) instead of the true grammatical subject.",
        "Mixing tenses within a sentence describing events that should share the same timeframe.",
        "Listing items in different grammatical forms (gerund, infinitive, noun) within the same list or comparison instead of keeping them parallel.",
        "Leaving a pronoun ambiguous when two nouns in the sentence could both plausibly be its referent.",
        "Placing a modifying phrase where it grammatically describes the wrong noun (dangling/misplaced modifiers).",
        "Guessing prepositions by logic instead of recalling the fixed idiomatic pairing ('good at', not 'good in').",
        "Choosing an option that's grammatically correct but still redundant when a more concise correct option is available.",
      ],
      keyTakeaways: [
        "Find the TRUE subject before checking verb agreement — ignore nouns inside prepositional phrases between subject and verb.",
        "Keep all items in a list or comparison in the same grammatical form (parallelism).",
        "A pronoun must have exactly one clear possible referent — rewrite with a name if there's any ambiguity.",
        "A modifying phrase at a sentence's start must describe the very next noun that follows it.",
        "Prepositions in idioms are fixed by convention ('good at', 'interested in') and must be memorized, not derived logically.",
        "Between two grammatically correct options, prefer the more concise one that removes redundancy.",
      ],
      links: [
        { label: "Purdue OWL — Grammar Resources", url: "https://owl.purdue.edu/owl/general_writing/grammar/index.html" },
        { label: "IndiaBix — Verbal Ability: Spotting Errors", url: "https://www.indiabix.com/verbal-ability/spotting-errors/" },
      ],
    },
    {
      moduleTitle: "Verbal Reasoning",
      subModuleTitle: "Vocabulary",
      overview:
        "Vocabulary questions — synonyms, antonyms, analogies, one-word substitution, idioms, and fill-in-the-blank usage — test both raw word knowledge and the ability to reason about meaning from word roots and context when a word is unfamiliar. Rote memorization of word lists has diminishing returns; a much higher-leverage strategy is learning common prefixes, suffixes, and roots (bene-, mal-, -ology, ambi-) that unlock the meaning of dozens of related words at once, combined with elimination techniques for analogy and substitution questions. This sub-module covers root-based synonym/antonym reasoning, analogy relationship types, one-word substitution, idioms and phrases, contextual fill-in-the-blank usage, and a reference set of commonly confused word pairs that appear repeatedly across placement tests.",
      sections: [
        {
          heading: "Synonyms and Antonyms Through Word Roots",
          body: "Recognizing a common Latin or Greek root lets you infer the meaning of an unfamiliar word from a familiar one sharing that root, and often lets you deduce its antonym from the opposite root.",
          bullets: [
            "Root 'bene-' (good): benevolent, beneficial, benefactor all relate to 'good/well'. The antonym of 'benevolent' uses the opposite root 'mal-' (bad): malevolent.",
          ],
        },
        {
          heading: "Analogies: Identifying the Relationship Type",
          body: "Analogy questions (A:B :: C:?) require first naming the exact relationship between A and B (part-to-whole, cause-effect, person-to-workplace, tool-to-user) before searching for an option that shares that same relationship, not just a loosely related word.",
          bullets: [
            "'Doctor : Hospital :: Teacher : ?' Relationship: person to their typical workplace. Answer: School.",
          ],
        },
        {
          heading: "One-Word Substitution",
          body: "These questions ask for the single word that means an entire descriptive phrase — building a working list of the most commonly tested substitutions (person who studies X, place where X happens, fear of X) covers most exam appearances.",
          bullets: [
            "'A person who studies birds' = Ornithologist. 'A person who can speak many languages' = Polyglot. 'One who loves books' = Bibliophile.",
          ],
        },
        {
          heading: "Idioms and Phrases",
          body: "Idioms cannot be interpreted literally, so they must be learned as fixed units of meaning — practicing them in example sentences (not just as isolated definitions) makes them easier to recall correctly under test conditions.",
          bullets: [
            "'To let the cat out of the bag' = to reveal a secret (unintentionally). Example: 'She let the cat out of the bag about the surprise party.'",
          ],
        },
        {
          heading: "Contextual Usage (Fill in the Blank)",
          body: "Fill-in-the-blank vocabulary questions require judging which word fits the sentence's LOGICAL direction, often signaled by a contrast word ('but', 'although') or a supporting word ('and', 'because') elsewhere in the sentence.",
          bullets: [
            "'The evidence was ______ enough to convict him.' Choosing between 'conclusive' and 'inconclusive' depends entirely on the rest of the sentence's implied outcome — if the sentence continues '...and the jury reached a unanimous guilty verdict,' the answer must be 'conclusive'.",
          ],
        },
        {
          heading: "Commonly Confused Word Pairs",
          body: "A recurring set of similar-looking or similar-sounding word pairs is tested repeatedly across placement vocabulary sections, and memorizing this specific set has outsized returns relative to broader vocabulary study.",
          bullets: [
            "Affect (verb, to influence) vs Effect (noun, a result): 'The rain will affect the match; the effect was a delay.'",
            "Stationary (not moving) vs Stationery (writing materials): 'The car remained stationary; she bought stationery for the office.'",
            "Principal (main; or head of school) vs Principle (a fundamental rule): 'The principal explained the school's core principle.'",
          ],
        },
        {
          heading: "Building a Root/Prefix/Suffix Reference",
          body: "A small, memorized set of roots and affixes unlocks a disproportionately large vocabulary because most 'unfamiliar' exam words are combinations of common parts.",
          bullets: [
            "'-ology' (study of): biology, psychology. 'ambi-' (both): ambidextrous, ambiguous. 'un-'/'in-'/'dis-' (negation): unclear, inaccurate, disagree. 'philo-' (love of): philosophy, philanthropist.",
          ],
        },
      ],
      commonPitfalls: [
        "Memorizing isolated word lists without learning the roots/prefixes that would let you infer dozens of related words at once.",
        "In analogies, picking an option that's loosely related to C instead of one that shares the EXACT same relationship type as A:B.",
        "Interpreting an idiom literally instead of recalling its fixed figurative meaning.",
        "In fill-in-the-blank questions, ignoring a contrast word ('but', 'although') that flips the logical direction the blank needs to fill.",
        "Confusing commonly paired look-alike words (affect/effect, stationary/stationery, principal/principle) under time pressure.",
        "Choosing a synonym that is only loosely related in general topic rather than precisely matching the target word's shade of meaning.",
      ],
      keyTakeaways: [
        "Learn common roots and affixes (bene-, mal-, -ology, ambi-, un-/in-/dis-) — they unlock many related words at once.",
        "In analogies, name the exact relationship between the first pair before searching for a matching option.",
        "Learn idioms as fixed figurative units in example sentences, never by literal word-for-word interpretation.",
        "Watch for contrast words ('but', 'although', 'however') in fill-in-the-blank questions — they signal the blank should be a logical opposite.",
        "Keep a memorized list of commonly confused word pairs (affect/effect, stationary/stationery, principal/principle).",
        "One-word substitutions cluster around recurring patterns (person who studies X, fear of X, place where X happens) — learn the pattern, not just individual words.",
      ],
      links: [
        { label: "Vocabulary.com — Word Lists and Definitions", url: "https://www.vocabulary.com/" },
        { label: "IndiaBix — Verbal Ability: Synonyms", url: "https://www.indiabix.com/verbal-ability/synonyms/" },
      ],
    },
    {
      moduleTitle: "Verbal Reasoning",
      subModuleTitle: "Critical reasoning",
      overview:
        "Critical reasoning questions present a short argument — a set of facts (premises) leading to a conclusion — and ask you to identify its underlying assumption, strengthen or weaken it, spot its logical flaw, or distinguish what can be validly inferred from what the argument merely assumes. The core discipline is separating an argument into its explicit parts (premise, conclusion) and its implicit part (the unstated assumption bridging them), because most questions are really testing whether you can find that hidden bridge, not whether you agree with the conclusion. This sub-module covers argument structure, strengthen/weaken mechanics, the assumption-negation technique for verifying a true assumption, the inference-vs-assumption distinction, common logical flaws (especially correlation-vs-causation), bold-face role-identification questions, and cause-effect reasoning — each grounded in a fully worked example argument.",
      sections: [
        {
          heading: "Argument Structure: Premise, Conclusion, Assumption",
          body: "Every critical reasoning argument has stated premises (facts given), a conclusion (the claim being argued for), and at least one unstated assumption (a claim that must be true for the premises to actually support the conclusion) — identifying all three explicitly is the first step for any question type in this topic.",
          bullets: [
            "'Company X's sales increased after it launched a new ad campaign. Therefore, the ad campaign caused the sales increase.' Premise: sales rose after the campaign. Conclusion: the campaign caused the rise. Assumption: no other factor (seasonal demand, a competitor's price hike) caused the increase instead.",
          ],
        },
        {
          heading: "Strengthen and Weaken Questions",
          body: "To weaken a causal argument, introduce a plausible alternative cause for the same outcome; to strengthen it, rule out alternative causes or provide direct evidence linking the stated cause to the effect.",
          bullets: [
            "Weakens the ad-campaign argument: 'All companies in the sector, including competitors who ran no campaign, saw similar sales increases that quarter due to a holiday season.' Strengthens it: 'An A/B test showed customers exposed to the ad bought significantly more than a similar group not exposed to it.'",
          ],
        },
        {
          heading: "The Assumption-Negation Technique",
          body: "To verify whether a candidate assumption is truly necessary for an argument, negate it (assume its opposite is true) — if the conclusion falls apart under the negation, the assumption was indeed necessary; if the conclusion still stands, it wasn't a required assumption.",
          bullets: [
            "Negate 'no other factor caused the increase' → 'another factor (seasonal demand) DID cause the increase.' Under this negation, the conclusion ('the campaign caused the increase') collapses — confirming this was indeed a necessary assumption of the original argument.",
          ],
        },
        {
          heading: "Inference vs Assumption: The Key Distinction",
          body: "An assumption is an unstated premise the argument NEEDS to be valid (it comes before the conclusion, logically); an inference is a new conclusion that can be validly drawn FROM the stated facts (it comes after, as a further deduction) — these are frequently confused but test opposite directions of reasoning.",
        },
        {
          heading: "Identifying Logical Flaws",
          body: "Common flaws include hasty generalization (concluding a universal rule from too few examples), circular reasoning (the conclusion restates a premise), and false cause (assuming correlation implies causation) — naming the specific flaw type, not just sensing something is wrong, is what the question is actually testing.",
          bullets: [
            "'Every swan I've seen is white, so all swans must be white.' Flaw: hasty generalization — a limited personal sample is treated as proof of a universal rule (and is factually wrong, since black swans exist).",
          ],
        },
        {
          heading: "Bold-Face and Evaluate-the-Argument Questions",
          body: "Bold-face questions highlight two sentences within a passage and ask you to identify each one's logical ROLE (is it the main conclusion, a supporting premise, an opposing viewpoint the author rebuts, or background context) — read the whole passage first to establish its overall structure before assigning roles to the bolded parts.",
        },
        {
          heading: "Cause-Effect vs Mere Correlation",
          body: "Two things happening together (correlation) does not prove one caused the other — a third, unstated factor may be driving both, and critical reasoning questions frequently test whether you can spot this specific flaw.",
          bullets: [
            "'Ice cream sales and drowning incidents both rise in summer.' This is correlation, not causation — the real common cause is hot weather, which independently increases both ice cream purchases and swimming (and therefore drowning risk).",
          ],
        },
      ],
      commonPitfalls: [
        "Evaluating an argument's conclusion based on whether it seems true in the real world, rather than whether the given premises actually support it.",
        "Confusing an assumption (needed BEFORE the conclusion is valid) with an inference (a new claim drawn AFTER from the stated facts).",
        "Choosing a 'strengthen' option that merely restates the conclusion instead of one that rules out an alternative explanation.",
        "Weakening an argument with an irrelevant fact instead of one that introduces a genuine alternative cause for the same outcome.",
        "Treating correlation between two events as automatic proof that one caused the other.",
        "Skipping the assumption-negation check and guessing at an assumption option based on how 'reasonable' it sounds alone.",
      ],
      keyTakeaways: [
        "Break every argument into premise(s), conclusion, and unstated assumption before answering any question type about it.",
        "To weaken a causal claim, introduce a plausible alternative cause; to strengthen it, rule out alternatives or add direct supporting evidence.",
        "Use the assumption-negation test: if negating a candidate assumption destroys the conclusion, it was a necessary assumption.",
        "Assumptions are needed BEFORE the conclusion follows; inferences are valid NEW claims drawn AFTER from the stated facts.",
        "Correlation is not causation — always consider whether a third factor could explain both observed events.",
        "Name the specific logical flaw (hasty generalization, false cause, circular reasoning) rather than just sensing the argument is weak.",
      ],
      links: [
        { label: "MindTools — Critical Thinking Skills", url: "https://www.mindtools.com/ao8m8mp/critical-thinking" },
        { label: "GeeksforGeeks — Verbal Ability Questions and Answers", url: "https://www.geeksforgeeks.org/verbal-ability-questions-and-answers/" },
      ],
    },

    // ───────────────────────── Non-Verbal Reasoning ─────────────────────────
    {
      moduleTitle: "Non-Verbal Reasoning",
      subModuleTitle: "Series completion",
      overview:
        "Series completion questions — number series, letter series, alphanumeric series, and figure series — test pattern recognition by presenting a sequence with one clear underlying rule and asking you to find the next term, an odd term, or a deliberately wrong term planted in the sequence. The reliable method is always the same: compute the difference (or ratio) between consecutive terms first, and if that doesn't reveal a clean pattern, check for an alternating two-step rule or a polynomial (n²-based) pattern before assuming the series is unsolvable. This sub-module works through number series with constant and increasing differences, letter series with alphabet-position jumps, alphanumeric combinations, figure series described conceptually, odd-one-out detection, alternating two-step series, and wrong-number-in-the-series questions — each solved completely with the underlying rule stated explicitly.",
      sections: [
        {
          heading: "Number Series: Difference and Ratio Patterns",
          body: "Start by computing the difference between consecutive terms; if that sequence of differences is itself constant or follows a simple pattern (like consecutive odd numbers), the rule is revealed. If differences don't work, try ratios (each term ×/÷ a constant or increasing factor).",
          bullets: [
            "2, 5, 10, 17, 26, ? — differences: 3, 5, 7, 9 (consecutive odd numbers, increasing by 2 each time). Next difference = 11. Next term = 26 + 11 = 37.",
          ],
        },
        {
          heading: "Letter Series",
          body: "Letter series follow the same difference-based logic, but the 'difference' is measured in alphabet positions (A=1, B=2, ... Z=26) rather than numeric value.",
          bullets: [
            "A, C, F, J, O, ? — position gaps: +2, +3, +4, +5, +6. O is the 15th letter; +6 gives the 21st letter, U. So the next term is U.",
          ],
        },
        {
          heading: "Alphanumeric Series",
          body: "These combine a letter pattern and a number pattern running in parallel within the same sequence — solve each sub-pattern (letters, numbers) independently, since they usually follow separate, simpler rules.",
          bullets: [
            "A1, C3, E5, G7, ? — letters skip one each time (+2 position: A→C→E→G→I) and numbers increase by 2 (odd numbers: 1,3,5,7→9). Next term: I9.",
          ],
        },
        {
          heading: "Figure Series",
          body: "Figure series apply the same 'find the transformation rule' logic to shapes instead of numbers or letters — common transformations include rotation by a fixed angle, addition/removal of an element, or a shape cycling through a fixed set of positions — and the correct next figure must continue that exact same transformation, not just look visually similar to the others.",
        },
        {
          heading: "Odd One Out in a Series",
          body: "Odd-one-out questions give several terms where all but one follow a clear rule — first establish the rule from the majority of terms, then check each term against it to isolate the outlier.",
          bullets: [
            "2, 4, 8, 16, 30, 64 — the rule is powers of 2 (2,4,8,16,32,64). Every term fits except 30, which should be 32. 30 is the odd one out.",
          ],
        },
        {
          heading: "Alternating (Two-Step) Series",
          body: "Some series apply two different operations alternately (e.g., ×2 then −1, repeating) rather than one constant operation — if a single consistent difference or ratio doesn't fit, test whether alternating terms follow two separate, interleaved rules.",
          bullets: [
            "3, 6, 5, 10, 9, 18, 17, ? — pattern alternates ×2 and −1: 3×2=6, 6−1=5, 5×2=10, 10−1=9, 9×2=18, 18−1=17, 17×2=34. Next term = 34.",
          ],
        },
        {
          heading: "Finding the Wrong Number in a Series",
          body: "These questions present a full series with one term deliberately altered — find the underlying rule (often n², n²+1, or similar) using the terms that clearly fit, then compute what the flawed term SHOULD be to identify and correct it.",
          bullets: [
            "5, 10, 17, 26, 37, 50, 64 — the rule is n²+1 for n=2,3,4,5,6,7,8: 5,10,17,26,37,50,65. The given series has 64 instead of 65 — 64 is the wrong number.",
          ],
        },
      ],
      commonPitfalls: [
        "Only checking for a constant difference and giving up if it isn't found, instead of also checking ratios, alternating patterns, or polynomial (n²) rules.",
        "In letter series, forgetting to convert letters to their numeric alphabet position before computing gaps.",
        "In alphanumeric series, trying to find one combined rule instead of solving the letter and number sub-patterns separately.",
        "In odd-one-out questions, establishing the rule from a minority of terms (including the actual outlier) instead of the clear majority.",
        "Missing an alternating two-step pattern by only testing a single constant operation between all consecutive terms.",
        "In wrong-number questions, assuming the LAST term is always the error instead of testing the rule against every term.",
      ],
      keyTakeaways: [
        "Always start with differences between consecutive terms; if that fails, test ratios, then alternating two-step rules, then n²-based patterns.",
        "Convert letters to alphabet positions (A=1...Z=26) before analyzing letter-series gaps.",
        "Alphanumeric series usually hide two independent, simpler sub-patterns (letters and numbers) rather than one combined rule.",
        "Establish a series rule from its clear majority of terms before testing which single term breaks it.",
        "Alternating series apply two different operations in a repeating two-step cycle — test this whenever a single operation doesn't fit.",
        "Figure series require identifying the exact transformation rule (rotation angle, added element), not just visual similarity to prior figures.",
      ],
      links: [
        { label: "IndiaBix — Non-Verbal Reasoning: Series", url: "https://www.indiabix.com/non-verbal-reasoning/series/" },
        { label: "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Non-Verbal Reasoning",
      subModuleTitle: "Pattern recognition",
      overview:
        "Pattern recognition questions — figure analogies, classification (odd-figure-out), matrix completion, figure counting, embedded figures, and rule-based rotation/reflection sequences — test visual-logical reasoning independent of language or numbers, evaluating whether a candidate can identify the single consistent transformation or shared attribute governing a set of figures. As with number series, the reliable approach is to explicitly name the rule (rotation by X degrees, addition of a line, a shared count of sides) rather than relying on a figure simply 'looking right,' since distractor options are deliberately designed to look plausible at a glance while violating the actual rule. This sub-module works through each major pattern-recognition question type with a concrete, fully reasoned example, including two solvable figure-counting problems worked with an exact count.",
      sections: [
        {
          heading: "Figure Analogies",
          body: "Figure analogies (Figure A : Figure B :: Figure C : ?) require identifying the exact transformation from A to B (a rotation, an added element, a color/shading change, a size change) and applying that same transformation to C — exactly like word analogies, but with a visual transformation instead of a semantic relationship.",
        },
        {
          heading: "Classification (Odd Figure Out)",
          body: "Classification questions give several figures where all but one share a specific attribute (number of sides, number of lines of symmetry, presence of curved vs straight lines) — identify the shared attribute among the majority first, then find which figure breaks it.",
          bullets: [
            "Four figures have 4, 4, 4, and 3 sides respectively. The shared attribute among three of them is '4 sides'; the figure with 3 sides is the odd one out.",
          ],
        },
        {
          heading: "Matrix (3×3 Grid) Figure Completion",
          body: "Matrix questions arrange figures in a 3×3 grid where a consistent rule operates across each row and/or column (e.g., rotation increasing by a fixed angle moving left to right, or an element count increasing by one moving top to bottom) — verify the rule against at least two complete rows or columns before predicting the missing figure, since a rule that fits only one row may be coincidental.",
        },
        {
          heading: "Figure Counting (Triangles, Lines)",
          body: "Counting problems (how many triangles/lines/squares in a figure) require systematically counting the smallest individual units first, then all valid larger combinations formed by joining adjacent smaller units — undercounting combined regions is the most common error.",
          bullets: [
            "Triangle ABC has a single line drawn from vertex A to a point D on side BC. This creates: triangle ABD, triangle ACD, and the original triangle ABC itself — 3 triangles in total, not just the 2 smaller ones.",
          ],
        },
        {
          heading: "Embedded Figures",
          body: "Embedded figure questions ask you to find a simple shape (like a specific triangle or quadrilateral) hidden within the outline of a more complex figure — the reliable technique is to trace the simple shape's exact outline mentally and check if all of its edges exist somewhere within the complex figure's lines, ignoring extra lines that aren't part of that specific shape.",
        },
        {
          heading: "Rule-Based Rotation and Reflection Sequences",
          body: "A sequence of figures rotating or reflecting by a fixed, consistent amount at each step is solved by measuring the exact angle or transformation between the first two figures, then applying that same fixed increment forward to find the next figure in the sequence.",
          bullets: [
            "A shape rotates 45° clockwise at each step in a sequence. If the sequence shows positions at 0°, 45°, 90°, 135°, the next figure in the sequence must be positioned at 180°.",
          ],
        },
        {
          heading: "Grouping Figures by Shared Attribute",
          body: "Beyond simple side-counting, classification questions can group by lines of symmetry, whether a figure is open or closed, or whether it's made of straight lines only vs includes a curve — always check MULTIPLE possible shared attributes before settling on one, since the first attribute you notice isn't always the one that correctly isolates the odd figure.",
        },
      ],
      commonPitfalls: [
        "Picking a figure that 'looks similar' at a glance instead of explicitly naming and verifying the exact transformation rule.",
        "In matrix (3×3) questions, confirming a rule against only one row or column instead of checking it holds across at least two.",
        "Undercounting figure-counting problems by missing larger triangles/shapes formed by combining smaller adjacent ones.",
        "In classification questions, fixating on the first shared attribute noticed (like color) when the actual distinguishing rule is a different attribute (like symmetry or side count).",
        "In embedded-figure questions, allowing extra lines in the complex figure to distract from tracing the exact target shape's outline.",
        "Assuming a rotation/reflection sequence's increment from only the first two figures without confirming it holds for a third given figure too.",
      ],
      keyTakeaways: [
        "Always name the exact transformation rule (rotation angle, added element, attribute change) rather than judging by visual similarity alone.",
        "Verify a matrix (3×3 grid) rule against at least two rows or columns before predicting the missing figure.",
        "In figure counting, count the smallest units first, then systematically count all larger combinations formed by adjacent units.",
        "Check multiple candidate shared attributes (sides, symmetry, open/closed, curved/straight) in classification questions before picking the odd one out.",
        "For embedded figures, trace the target shape's exact outline and verify every edge exists within the complex figure.",
        "Confirm a rotation/reflection sequence's fixed increment against more than just the first two figures when a third is given.",
      ],
      links: [
        { label: "IndiaBix — Non-Verbal Reasoning: Classification", url: "https://www.indiabix.com/non-verbal-reasoning/classification/" },
        { label: "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/" },
      ],
    },
    {
      moduleTitle: "Non-Verbal Reasoning",
      subModuleTitle: "Mirror & water images",
      overview:
        "Mirror image and water image questions test whether a candidate can correctly apply two distinct, mechanical geometric transformations — a left-right flip (mirror, as in a vertical mirror placed beside an object) and a top-bottom flip (water image, as in a reflection in a pool below an object) — to letters, numbers, clocks, and calendar dates. The two transformations are frequently confused with each other because both are 'reflections,' but they flip along different axes and therefore produce different results on the same input, especially for asymmetric characters and clock times. This sub-module covers the mechanics of each transformation, dedicated formulas for mirror and water images of clock times (a very common question type), how digits and letters behave differently under each flip, symmetry-axis identification, and combined two-step problems.",
      sections: [
        {
          heading: "Mirror Image Basics: Left-Right Reversal",
          body: "A mirror placed vertically beside an object reverses left and right: the order of characters in a word reverses (last character appears first), and each individual character's shape also flips horizontally — characters with a vertical line of symmetry (like A, H, I, M, O, T, U, V, W, X, Y) look unchanged, while others (like B, C, D, E, F, G, J, K, L, N, P, Q, R, S, Z) look visibly different or unrecognizable.",
          bullets: [
            "Mirror image of 'MATHS': since M, A, T, H are all vertically symmetric letters, and reading order reverses, the mirror image reads as the letters in reverse order (S, H, T, A, M), with S also flipping shape since it isn't vertically symmetric.",
          ],
        },
        {
          heading: "Water Image Basics: Top-Bottom Inversion",
          body: "A water (or 'reflection in a pool') image flips an object top-to-bottom instead of left-to-right — the left-right ORDER of characters stays the same, but each character's shape flips vertically, so only characters with a horizontal line of symmetry (like B, C, D, E, H, I, K, O, X) look unchanged.",
        },
        {
          heading: "Mirror Image of Clock Times (Formula-Based)",
          body: "The mirror image of a clock face reflects the entire dial left-right, which is equivalent to subtracting the shown time from 11 hours 60 minutes (i.e., from a base of 11:60).",
          bullets: [
            "Mirror image of 3:15: 11:60 − 3:15 = 8:45. So a clock reading 3:15 shows 8:45 in its mirror reflection.",
          ],
        },
        {
          heading: "Water Image of Clock Times (Formula-Based)",
          body: "The water image of a clock face reflects the dial top-to-bottom, equivalent to subtracting the shown time from a base of 6:00 (adding 12 hours first if the result would be negative).",
          bullets: [
            "Water image of 3:15: 6:00 − 3:15 = 2:45. So a clock reading 3:15 shows 2:45 in its water reflection.",
          ],
        },
        {
          heading: "Mirror and Water Images of Numbers",
          body: "For digits, only 0, 1, and 8 are symmetric enough to look unchanged under either type of flip; the safest way to reason about multi-digit numbers made purely of these digits is that a mirror image reverses their ORDER (since it's a left-right flip), while a water image keeps their order the same (since it's a top-bottom flip, not left-right).",
          bullets: [
            "Mirror image of '1801' (all self-symmetric digits): reading order reverses → '1081'. Water image of '108' (all self-symmetric digits): order stays the same since only vertical position flips → '108'.",
          ],
        },
        {
          heading: "Symmetry Axis Identification",
          body: "Before attempting a mirror or water image question on a letter or figure, identify whether it has a vertical line of symmetry (relevant for mirror images), a horizontal line of symmetry (relevant for water images), or neither — this quickly tells you whether the character will look unchanged, flipped, or entirely different.",
          bullets: [
            "Letter 'H' has both a vertical and a horizontal line of symmetry, so it looks identical in both its mirror and water image. Letter 'F' has neither, so it looks different (and effectively unrecognizable as a normal letter) in both.",
          ],
        },
        {
          heading: "Combined Mirror + Water Image Problems",
          body: "Some questions ask for the mirror image of an object's water image (or vice versa) — apply the two transformations strictly in the stated order, treating the output of the first transformation as the input to the second.",
          bullets: [
            "Find the mirror image of the water image of 4:20. Step 1 (water image): 6:00 − 4:20 = 1:40. Step 2 (mirror image of that result): 11:60 − 1:40 = 10:20. Final answer: 10:20.",
          ],
        },
      ],
      commonPitfalls: [
        "Confusing mirror image (left-right flip, reverses character ORDER) with water image (top-bottom flip, order stays the SAME).",
        "Using the mirror-time formula (11:60 − time) when the question actually asks for a water image, or vice versa.",
        "Assuming all digits/letters look unchanged under a flip, instead of checking each character's specific symmetry axis.",
        "In a combined mirror+water question, applying the two transformations in the wrong order.",
        "Forgetting to add 12 hours when a water-image time subtraction would otherwise produce a negative result.",
        "Assuming a character symmetric about one axis (say, vertical) is automatically also symmetric about the other (horizontal) axis.",
      ],
      keyTakeaways: [
        "Mirror image = left-right flip: character order reverses, and each character's shape flips horizontally.",
        "Water image = top-bottom flip: character order stays the same, and each character's shape flips vertically.",
        "Mirror image of a clock time = 11:60 − given time. Water image of a clock time = 6:00 − given time (add 12h if negative).",
        "Only digits 0, 1, 8 and select letters (A, H, I, M, O, T, U, V, W, X, Y for vertical symmetry) look unchanged under a flip.",
        "For combined mirror+water problems, apply the transformations strictly in the order stated, using the first result as the next input.",
        "Always check a character's specific symmetry axis (vertical for mirror, horizontal for water) rather than assuming both.",
      ],
      links: [
        { label: "IndiaBix — Non-Verbal Reasoning: Mirror Images", url: "https://www.indiabix.com/non-verbal-reasoning/mirror-images/" },
        { label: "IndiaBix — Non-Verbal Reasoning: Water Images", url: "https://www.indiabix.com/non-verbal-reasoning/water-images/" },
      ],
    },
    {
      moduleTitle: "Non-Verbal Reasoning",
      subModuleTitle: "Cubes & dice",
      overview:
        "Cube and dice questions test 3D spatial visualization — deducing hidden opposite faces from multiple dice views, solving cube-painting and cube-cutting problems, folding a flat net into a 3D cube, counting cubes in a stacked arrangement, and reasoning about dice rotation and mirror-identical dice. Unlike other non-verbal topics, these questions reward a small set of exact, checkable rules (the standard-die sum-of-7 rule, the common-face deduction method for non-standard dice, and the systematic corner/edge/face/internal counting formulas for cube-cutting) far more than raw spatial intuition, so memorizing and practicing the rules directly outperforms trying to visualize everything from scratch each time. This sub-module works through each rule with a complete, verified numerical example, including the classic painted-cube cutting problem worked to an exact count.",
      sections: [
        {
          heading: "Standard Dice: The Sum-of-7 Opposite-Face Rule",
          body: "On a STANDARD die (the kind used in board games), opposite faces always sum to 7: 1 is opposite 6, 2 is opposite 5, and 3 is opposite 4. This rule applies ONLY to standard dice — non-standard dice (with letters, symbols, or a different number arrangement) must be solved using the deduction method below instead.",
        },
        {
          heading: "Non-Standard Dice: The Common-Face Deduction Method",
          body: "For dice with arbitrary symbols/numbers (not guaranteed to follow sum-of-7), deduce opposite faces from multiple throws using this rule: if two different throws of the same die share exactly two visible faces in common, then the two NON-common (differing) faces from those throws must be opposite each other.",
          bullets: [
            "Three throws of a die show: Throw 1: faces 1, 2, 3. Throw 2: faces 1, 3, 4. Throw 3: faces 1, 4, 5. Comparing Throw 1 & 2 (common faces 1, 3): the non-common faces 2 and 4 are opposite. Comparing Throw 2 & 3 (common faces 1, 4): the non-common faces 3 and 5 are opposite. That leaves faces 1 and 6 (the only face never shown) as the remaining opposite pair.",
          ],
        },
        {
          heading: "Cube Painting and Cutting Problems",
          body: "A classic problem: a cube is painted on all 6 outer faces, then cut into n³ smaller identical cubes. Corner cubes (3 faces painted) = always 8 (the 8 corners of any cube). Edge cubes (2 faces painted) = 12 × (n−2) (12 edges, each with (n−2) non-corner small cubes along it). Face-center cubes (1 face painted) = 6 × (n−2)² (6 faces). Fully internal cubes (0 faces painted) = (n−2)³.",
          bullets: [
            "A cube is painted on all faces and cut into 64 smaller cubes (so n=4, since 4³=64). 3-face-painted (corners) = 8. 2-face-painted (edges) = 12×(4−2) = 24. 1-face-painted (face centers) = 6×(4−2)² = 6×4 = 24. 0-face-painted (internal) = (4−2)³ = 8. Check: 8+24+24+8 = 64. ✓",
          ],
        },
        {
          heading: "Folding a Net Into a Cube",
          body: "For a net drawn as a straight strip of 4 connected squares (which folds into the 4 side faces of a cube, forming a loop), the 1st and 3rd squares in the strip become opposite faces, and the 2nd and 4th squares become opposite faces — because folding a 4-square strip into a closed loop wraps the 1st and 3rd (and 2nd and 4th) around to face away from each other.",
        },
        {
          heading: "Counting Cubes in a 3D Stacked Arrangement",
          body: "For a solid n×n×n arrangement of unit cubes with the entire outer surface painted, the same corner/edge/face/internal formulas from the cube-cutting problem apply directly, since a painted stack and a painted-then-cut cube are geometrically identical setups.",
          bullets: [
            "A 3×3×3 stack of 27 unit cubes has its entire outer surface painted. Corners (3 faces) = 8. Edges (2 faces) = 12×(3−2) = 12. Face centers (1 face) = 6×(3−2)² = 6. Internal (0 faces) = (3−2)³ = 1. Check: 8+12+6+1 = 27. ✓",
          ],
        },
        {
          heading: "Dice Rotation Tracking",
          body: "When a die rolls (tips over one of its edges) in a stated direction, track each face's new position systematically: rolling FORWARD over the front-bottom edge moves top→front, front→bottom, bottom→back, back→top (the left and right faces stay unchanged).",
          bullets: [
            "A standard die shows 1 on top and 2 on the front (so, by the sum-of-7 rule, the bottom is 6 and the back is 5). After rolling forward once: new top = old back = 5; new front = old top = 1. The die now shows 5 on top and 1 on the front.",
          ],
        },
        {
          heading: "Identical vs Mirror-Image (Different) Dice",
          body: "Two dice images showing the same three numbers around one corner represent the SAME die only if those three numbers appear in the same rotational (clockwise or anticlockwise) order in both images; if the order is reversed between the two images, they are mirror images of each other and represent genuinely DIFFERENT dice — a frequently tested trap in 'which of these dice is the same as the given one' questions.",
        },
      ],
      commonPitfalls: [
        "Applying the sum-of-7 shortcut to a non-standard die (with letters, symbols, or unusual numbering) where it does not apply.",
        "In the common-face deduction method, comparing throws that share fewer or more than exactly two common faces, making the deduction invalid.",
        "In cube-cutting problems, forgetting the (n−2) adjustment for edge and face-center cube counts, or using n instead of (n−2) for internal cubes.",
        "Misapplying the net-folding rule to a net shape that isn't a simple 4-square strip (more complex nets need step-by-step mental folding instead).",
        "Tracking dice rotation by only updating the top and front faces and forgetting that the bottom and back faces also move.",
        "Assuming two dice images with the same three visible numbers are identical without checking whether the rotational (clockwise/anticlockwise) order actually matches.",
      ],
      keyTakeaways: [
        "Standard dice: opposite faces sum to 7 (1-6, 2-5, 3-4) — this rule applies ONLY to standard numbered dice.",
        "For non-standard dice, use the common-face method: if two throws share exactly two faces, their non-common faces are opposite.",
        "Cube-cutting formulas (for an n×n×n cut): corners=8, edges=12(n−2), face-centers=6(n−2)², internal=(n−2)³.",
        "A 4-square net strip folds so that the 1st/3rd squares become opposite faces, and the 2nd/4th squares become opposite faces.",
        "Rolling a die forward cycles top→front→bottom→back→top; rolling sideways cycles the corresponding side faces instead.",
        "Two dice showing the same numbers are identical only if those numbers share the same rotational order — a reversed order means mirror-image (different) dice.",
      ],
      links: [
        { label: "IndiaBix — Non-Verbal Reasoning: Cubes and Dice", url: "https://www.indiabix.com/non-verbal-reasoning/cubes-and-dice/" },
        { label: "GeeksforGeeks — Non-Verbal Reasoning Questions and Answers", url: "https://www.geeksforgeeks.org/non-verbal-reasoning-questions-and-answers/" },
      ],
    },
  ],
};

export default data;
