import type { CourseContentData } from "./types";

const data: CourseContentData = {
  courseSlug: "placement-training-program",
  modules: [
    {
      moduleTitle: "Java Fundamentals",
      sections: [
        {
          heading: "Syntax & Data Types",
          body: "Java is a statically-typed, compiled language — every variable's type is fixed at declaration and checked before the program ever runs, which catches many bugs at compile time that a dynamically-typed language would only catch (or silently mishandle) at runtime. Java's primitive types (int, double, boolean, char, etc.) hold raw values directly and are not objects, while reference types (String, arrays, and any class) hold a reference to an object on the heap. Understanding this distinction explains a lot of Java's behavior, including why comparing objects with == checks reference identity, not value equality (use .equals() for that).",
        },
        {
          heading: "Control Flow",
          body: "Control flow statements — if/else, switch, for, while, do-while — determine the order code executes in. A for loop is the natural choice when the number of iterations is known upfront (like iterating a fixed-size array); a while loop suits situations where the loop should continue based on a condition that isn't a simple counter (like reading input until a sentinel value appears). Java's enhanced for-each loop (for (Type item : collection)) is preferred whenever you don't need the index itself, since it's shorter and eliminates an entire class of off-by-one indexing bugs.",
        },
        {
          heading: "Object-Oriented Programming Basics",
          body: "Java is built around four core OOP principles, each solving a real design problem:",
          bullets: [
            "Encapsulation — bundling data and the methods that operate on it inside a class, and hiding internal state behind private fields with public getter/setter methods, so external code can't put an object into an invalid state directly.",
            "Inheritance — a class can extend another, inheriting its fields and methods, used to model an 'is-a' relationship (a SavingsAccount is a kind of Account).",
            "Polymorphism — code written against a parent type can work with any subtype without modification, since a subtype can be used anywhere its parent type is expected.",
            "Abstraction — exposing only what's necessary through interfaces or abstract classes, hiding implementation detail the caller doesn't need to know about.",
          ],
        },
        {
          heading: "Arrays & Strings",
          body: "Arrays hold a fixed number of elements of the same type, indexed from 0; once created, an array's length can never change (Java's ArrayList, covered in the next module, is the resizable alternative built on top of arrays). Strings in Java are immutable — every operation that appears to modify a String (like concatenation) actually creates a new String object, leaving the original unchanged. This immutability is a frequent source of confusion for beginners (why doesn't str.toUpperCase() change str itself?) and also the reason repeated string concatenation in a loop is inefficient — StringBuilder exists specifically to build up a string efficiently without creating a new object on every append.",
        },
        {
          heading: "Exception Handling",
          body: "Exceptions represent errors that occur during program execution — Java forces you to acknowledge and handle certain error conditions (checked exceptions, like IOException) at compile time, while others (unchecked/runtime exceptions, like NullPointerException) are not required to be explicitly caught but still occur if the code has a bug. The try/catch/finally structure lets you attempt an operation, handle specific failure types differently, and guarantee cleanup code runs (finally) whether or not an exception occurred. Catching an exception only to silently ignore it (an empty catch block) is one of the most common and dangerous anti-patterns in Java code — it hides real bugs from ever surfacing.",
        },
      ],
      links: [
        { label: "Oracle — The Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/" },
        { label: "GeeksforGeeks — Java Programming Language", url: "https://www.geeksforgeeks.org/java/" },
        { label: "freeCodeCamp YouTube Channel", url: "https://www.youtube.com/@freecodecamp" },
      ],
    },
    {
      moduleTitle: "Java Intermediate",
      sections: [
        {
          heading: "Collections Framework",
          body: "The Java Collections Framework provides ready-made, well-tested data structures instead of every developer building their own. ArrayList is a resizable array, good for indexed access and iteration; LinkedList is efficient for frequent insertions/removals in the middle of a list; HashMap stores key-value pairs with fast (average O(1)) lookup by key but no guaranteed order; TreeMap keeps keys sorted at the cost of slower operations; HashSet stores unique values with fast membership checks. Choosing the right collection for a task — based on whether you need ordering, uniqueness, or key-based lookup — is a core practical skill, not just memorizing the API.",
        },
        {
          heading: "Generics",
          body: "Generics let a class or method work with any type while still getting compile-time type checking — List<String> is checked by the compiler to only ever contain Strings, catching type errors before the program runs rather than as a runtime ClassCastException the way pre-generics Java code (or an untyped language) would. Writing your own generic methods (using a type parameter like <T>) lets you write one algorithm — say, finding the maximum element in a list — that works correctly and safely across any comparable type, without duplicating the code for each type.",
        },
        {
          heading: "Multithreading Basics",
          body: "A thread is an independent path of execution within a program; multithreading lets a program do multiple things concurrently — respond to user input while processing data in the background, for example. Java's Thread class and Runnable interface are the basic building blocks, but shared mutable state accessed from multiple threads without coordination causes race conditions — unpredictable bugs that occur only when threads happen to interleave in a particular unlucky order. The synchronized keyword ensures only one thread can execute a block of code at a time, which is the most basic (though not the only) tool for preventing race conditions on shared data.",
        },
        {
          heading: "File I/O",
          body: "Java's I/O classes read and write data to files and other sources. The modern, recommended approach uses the java.nio.file package (Files, Paths) for most common operations — reading a whole file's lines, writing text to a file — which is simpler and less error-prone than the older java.io streams API for typical use cases. Whichever API is used, files represent an external resource that must be properly closed after use; try-with-resources (try (var reader = ...) { ... }) automatically closes resources when the block exits, even if an exception is thrown, and should be the default pattern for any file or stream handling.",
        },
        {
          heading: "JDBC Basics",
          body: "JDBC (Java Database Connectivity) is the standard API for Java programs to connect to and query relational databases like MySQL. The core flow: establish a Connection using a database URL and credentials, create a PreparedStatement with the SQL query (using placeholders for any user-supplied values, never concatenating them directly into the SQL string — this is what prevents SQL injection), execute it, and process the returned ResultSet row by row. Understanding raw JDBC, even though most real projects use a higher-level ORM on top of it, makes it much easier to understand what an ORM is actually doing underneath and to debug when something goes wrong at the database layer.",
        },
      ],
      links: [
        { label: "Oracle — The Java Tutorials: Collections", url: "https://docs.oracle.com/javase/tutorial/collections/" },
        { label: "Baeldung — Java Guides", url: "https://www.baeldung.com/" },
        { label: "GeeksforGeeks — Java Programming Language", url: "https://www.geeksforgeeks.org/java/" },
      ],
    },
    {
      moduleTitle: "Java Advanced",
      sections: [
        {
          heading: "Design Patterns",
          body: "Design patterns are well-established, reusable solutions to recurring software design problems — a shared vocabulary for structuring code. A few patterns come up constantly in real Java code:",
          bullets: [
            "Singleton — ensures a class has only one instance, globally accessible (used carefully, since overuse creates hidden global state).",
            "Factory — centralizes object creation logic, so callers ask for 'an object that does X' without knowing the exact concrete class being instantiated.",
            "Observer — lets objects subscribe to and get notified of events/changes in another object, the foundation of most event-handling systems.",
            "Strategy — encapsulates interchangeable algorithms behind a common interface, letting behavior be swapped at runtime without changing the code that uses it.",
          ],
        },
        {
          heading: "Streams & Lambdas",
          body: "Lambda expressions (introduced in Java 8) let you write small, anonymous functions inline — (a, b) -> a + b — instead of verbose anonymous inner classes. The Stream API builds on lambdas to process collections in a functional, declarative style: list.stream().filter(x -> x > 10).map(x -> x * 2).collect(Collectors.toList()) reads as a pipeline of transformations rather than a manual loop with mutable accumulator variables. This style tends to produce more concise, less error-prone code for common data-processing tasks — though understanding the equivalent imperative loop underneath still matters for debugging performance issues.",
        },
        {
          heading: "Advanced Concurrency",
          body: "Beyond basic synchronized blocks, the java.util.concurrent package provides higher-level, safer concurrency tools: ExecutorService manages a pool of threads for you rather than manually creating and managing Thread objects; ConcurrentHashMap provides a thread-safe map without needing to manually synchronize every access; CompletableFuture represents a value that will be available asynchronously, letting you chain dependent asynchronous operations cleanly. Reaching for these higher-level tools instead of hand-rolled synchronization is almost always the right call in real production code — hand-written concurrent code is notoriously easy to get subtly wrong.",
        },
        {
          heading: "Building a Capstone Application",
          body: "The capstone project for this module brings together OOP design, collections, exception handling, and (where relevant) concurrency and streams into one cohesive application — the kind of project that demonstrates not just knowing individual Java features, but knowing how to combine them into a coherent, well-structured program. Emphasis is placed on clean class design (each class with one clear responsibility), proper exception handling at the boundaries where things can actually fail (file I/O, user input, database calls), and code that a reviewer unfamiliar with the project could read and understand without extensive explanation.",
        },
      ],
      links: [
        { label: "Refactoring Guru — Design Patterns", url: "https://refactoring.guru/design-patterns" },
        { label: "Baeldung — Java Guides", url: "https://www.baeldung.com/" },
        { label: "Oracle — The Java Tutorials: Concurrency", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/" },
      ],
    },
    {
      moduleTitle: "DSA Fundamentals",
      sections: [
        {
          heading: "Arrays & Strings, Revisited for Problem-Solving",
          body: "In a DSA context, arrays and strings are the raw material almost every coding interview problem starts from. Common patterns worth internalizing: the two-pointer technique (using two indices moving through an array, often from opposite ends, to solve problems in one pass instead of nested loops), and the sliding window technique (maintaining a moving subrange of an array/string to solve problems about contiguous subsequences efficiently). Recognizing which pattern a problem is asking for — often signaled by phrases like 'contiguous subarray' or 'pair that sums to X' — is a large part of solving array/string problems quickly under interview time pressure.",
        },
        {
          heading: "Linked Lists",
          body: "A linked list stores elements as a chain of nodes, each holding a value and a reference to the next node, rather than in one contiguous block of memory like an array. This makes insertion and deletion at a known position O(1) (just relinking pointers) instead of an array's O(n) (shifting every subsequent element), at the cost of losing O(1) random access by index — you have to walk from the head to reach any given position. Classic linked list interview problems (reversing a list, detecting a cycle, finding the middle element) are really exercises in careful pointer manipulation, and drawing the pointers out on paper before coding is a genuinely effective technique, not just a beginner's crutch.",
        },
        {
          heading: "Stacks & Queues",
          body: "A stack is Last-In-First-Out (LIFO) — the most recently added element is the first removed, like a stack of plates. A queue is First-In-First-Out (FIFO) — elements are removed in the order they were added, like a line of people. Stacks show up naturally in problems involving nested/matching structures (balanced parentheses, undo functionality, function call tracking) and in implementing depth-first search. Queues show up in problems involving processing order (task scheduling) and are the natural structure for breadth-first search, where you need to explore nodes level by level rather than depth by depth.",
        },
        {
          heading: "Recursion",
          body: "A recursive function solves a problem by calling itself on a smaller version of the same problem, with a base case that stops the recursion. Every recursive solution needs both pieces clearly defined: what's the smallest version of the problem that can be answered directly (the base case), and how does solving a smaller version help solve the larger one (the recursive case)? Recursion maps naturally onto problems with a self-similar, tree-like structure (traversing trees, generating combinations/permutations, divide-and-conquer algorithms) — trying to force those same problems into a purely iterative solution is often far more complex than the recursive version.",
        },
        {
          heading: "Time/Space Complexity",
          body: "Big-O notation describes how an algorithm's running time or memory use grows as input size grows, ignoring constant factors — it answers 'how does this scale,' not 'exactly how many milliseconds does this take.' Common complexities, from best to worst: O(1) constant, O(log n) logarithmic (like binary search), O(n) linear, O(n log n) (like efficient sorting), O(n²) quadratic (like a naive nested-loop comparison), O(2ⁿ) exponential (like naive recursive Fibonacci without memoization). Being able to look at a piece of code — especially nested loops and recursive calls — and state its Big-O complexity is one of the most consistently tested skills in technical interviews, precisely because it reveals whether a candidate understands why a solution will or won't scale.",
        },
      ],
      links: [
        { label: "GeeksforGeeks — Data Structures", url: "https://www.geeksforgeeks.org/data-structures/" },
        { label: "NeetCode — DSA Roadmap & Practice", url: "https://neetcode.io/" },
        { label: "Visualgo — Visualizing Data Structures & Algorithms", url: "https://visualgo.net/" },
      ],
    },
    {
      moduleTitle: "DSA Advanced",
      sections: [
        {
          heading: "Trees & Graphs",
          body: "A tree is a hierarchical structure of nodes with no cycles, where each node (except the root) has exactly one parent — binary trees (each node has at most two children) and binary search trees (left subtree values smaller, right subtree values larger, enabling fast search) are the most commonly tested variants. A graph generalizes further, allowing any node to connect to any other node, with or without cycles, directed or undirected — representing anything from social networks to road maps to dependency chains. Traversal is the fundamental operation on both: depth-first search (DFS, using recursion or an explicit stack) explores as far as possible down one path before backtracking; breadth-first search (BFS, using a queue) explores level by level, which is what makes it the right choice whenever you need the shortest path in an unweighted graph.",
        },
        {
          heading: "Dynamic Programming",
          body: "Dynamic programming (DP) solves problems by breaking them into overlapping subproblems, solving each subproblem once, and reusing (rather than recomputing) that result whenever it's needed again — either by storing results in a table as you go (bottom-up/tabulation) or by caching recursive calls' results (top-down/memoization). The signal that a problem might need DP: a naive recursive solution that recomputes the exact same subproblem many times (classic example: naive recursive Fibonacci recalculates fib(3) repeatedly across different branches of the recursion tree). DP is widely considered the hardest interview topic precisely because recognizing the subproblem structure of a new problem takes real practice — the individual technique, once recognized, is usually mechanical.",
        },
        {
          heading: "Greedy Algorithms",
          body: "A greedy algorithm builds a solution by always making the choice that looks best at the current step, without reconsidering that choice later — and for some problems, this locally-optimal approach provably produces a globally optimal result (classic examples: activity selection, certain scheduling problems, Dijkstra's shortest-path algorithm). The catch is that greedy doesn't work for every problem — proving a greedy approach is actually correct for a given problem (rather than just producing a plausible-looking answer that happens to be wrong on some input) is itself a skill, and when in doubt, it's worth testing a greedy solution against a brute-force one on small examples before trusting it.",
        },
        {
          heading: "Sorting/Searching at Scale",
          body: "Beyond knowing that sorting algorithms exist, understanding their tradeoffs matters: merge sort and heapsort guarantee O(n log n) in all cases but merge sort needs O(n) extra space; quicksort is typically faster in practice with good average-case performance but has a worst case of O(n²) on adversarial input; and for nearly-sorted or small data, simpler O(n²) algorithms can actually outperform the 'better' O(n log n) ones due to lower constant overhead. Binary search — repeatedly halving a sorted search space — achieves O(log n) lookup, but only works on sorted data, which is itself a common reason to sort data upfront even when sorting isn't the end goal.",
        },
        {
          heading: "Mock Coding Tests",
          body: "Timed mock tests mirroring real placement coding rounds are where the fundamentals and advanced topics get pressure-tested together under realistic constraints. Beyond solving the problem correctly, mock tests build the specific skill of managing time across multiple problems — recognizing quickly when an approach isn't working and needs to be abandoned, rather than sinking the whole time budget into one problem. Reviewing wrong or slow answers afterward, specifically identifying whether the gap was conceptual (didn't know the technique) or execution (knew the technique but made an implementation mistake), is what actually improves performance round over round — simply doing more problems without that review tends to plateau quickly.",
        },
      ],
      links: [
        { label: "NeetCode — DSA Roadmap & Practice", url: "https://neetcode.io/" },
        { label: "GeeksforGeeks — Data Structures & Algorithms", url: "https://www.geeksforgeeks.org/data-structures/" },
        { label: "Visualgo — Visualizing Data Structures & Algorithms", url: "https://visualgo.net/" },
      ],
    },
    {
      moduleTitle: "Quantitative Aptitude",
      sections: [
        {
          heading: "Number Systems",
          body: "Number system questions test fluency with integers, factors, multiples, divisibility rules, and remainders — the building blocks nearly every other quant topic builds on. Fast divisibility checks (a number is divisible by 3 if its digit sum is divisible by 3; by 9 similarly; by 4 if its last two digits form a number divisible by 4) save significant time versus doing full division, and are worth memorizing cold rather than re-deriving under time pressure.",
        },
        {
          heading: "Percentages & Ratios",
          body: "Percentage and ratio problems are really the same underlying relationship expressed differently, and most placement-test questions in this area are word problems requiring translating a real-world scenario into the correct equation. A percentage increase followed by an equal percentage decrease does not return to the original value (e.g. a 20% increase followed by a 20% decrease results in a net 4% decrease) — this specific 'gotcha' appears constantly in aptitude tests specifically because it trips up people relying on intuition instead of working the actual numbers.",
        },
        {
          heading: "Time, Speed & Distance",
          body: "These problems rest on one core relationship — distance = speed × time — applied across scenarios like relative speed (two objects moving toward or away from each other), average speed (which is NOT simply the average of two speeds when time, not distance, is held constant across the two legs — a very common trap), and problems involving trains, boats/streams (where current speed adds or subtracts from the boat's own speed depending on direction), and circular tracks.",
        },
        {
          heading: "Profit & Loss",
          body: "Profit and loss problems apply percentage reasoning to buying/selling scenarios: profit or loss is always calculated as a percentage of the cost price, not the selling price, unless a question explicitly states otherwise — a distinction that changes the answer and is a frequent source of errors when read too quickly. Marked price, discount, and successive discounts (which combine the same way successive percentage changes do, not by simply adding the two discount percentages) round out the core vocabulary this topic is tested with.",
        },
        {
          heading: "Data Interpretation",
          body: "Data interpretation questions present information as tables, bar charts, pie charts, or line graphs and ask questions requiring you to extract and combine specific values — testing accurate reading under time pressure as much as calculation. The practical strategy: read the question being asked before diving into the chart, so you know exactly which numbers to look for instead of trying to absorb the whole chart upfront; and for pie charts specifically, remember that segments show proportions, so converting to actual values requires knowing (or calculating) the total.",
        },
      ],
      links: [
        { label: "IndiaBIX — Aptitude Practice", url: "https://www.indiabix.com/aptitude/questions-and-answers/" },
        { label: "GeeksforGeeks — Quantitative Aptitude", url: "https://www.geeksforgeeks.org/quantitative-aptitude-questions-and-answers/" },
        { label: "PrepInsta — Placement Aptitude Prep", url: "https://prepinsta.com/" },
      ],
    },
    {
      moduleTitle: "Logical Reasoning",
      sections: [
        {
          heading: "Puzzles",
          body: "Logic puzzles present a set of constraints (statements that must all be simultaneously true) and ask you to determine the one arrangement or set of facts satisfying every constraint at once. The most reliable approach is systematic elimination: build a grid or table of every possibility, and work through constraints one at a time, ruling out combinations that violate each one, rather than trying to jump to the answer by intuition — intuition is exactly what these puzzles are designed to mislead.",
        },
        {
          heading: "Seating Arrangements",
          body: "Seating arrangement problems (linear and circular) test the same systematic constraint-satisfaction skill as general puzzles, with the added wrinkle of spatial relationships — 'to the left of,' 'immediately next to,' 'opposite' (in circular arrangements). Drawing the arrangement out and updating it as each clue is applied, rather than trying to hold it all in your head, is the single most effective technique for solving these accurately under time pressure.",
        },
        {
          heading: "Blood Relations",
          body: "Blood relation questions chain together family relationship statements ('A is B's mother's brother') and ask you to determine the final relationship between two people. The practical technique is drawing a simple family tree diagram as each relationship is stated, rather than trying to track the chain mentally — these problems are specifically designed to overload working memory if attempted without a visual aid, and become mechanical once drawn out.",
        },
        {
          heading: "Syllogisms",
          body: "Syllogisms present two or more statements (premises) and ask which conclusions necessarily follow. The key skill is distinguishing between what must be true given the premises versus what merely could be true or sounds plausible — syllogism questions are deliberately constructed with tempting-but-invalid conclusions. Venn diagrams are the standard tool: drawing out each premise as overlapping/separate circles makes it visually clear which conclusions are actually guaranteed by the diagram versus which just seem intuitively likely.",
        },
        {
          heading: "Coding-Decoding",
          body: "Coding-decoding questions establish a pattern that transforms letters, numbers, or words (e.g. each letter shifted forward by a fixed number of positions in the alphabet) and ask you to apply or reverse that pattern. The approach is to identify the transformation rule from the given example first — checking it against every letter/number in the example, not just the first one — before applying that same confirmed rule to the new case being asked about.",
        },
      ],
      links: [
        { label: "IndiaBIX — Logical Reasoning Practice", url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/" },
        { label: "GeeksforGeeks — Logical Reasoning", url: "https://www.geeksforgeeks.org/logical-reasoning/" },
        { label: "PrepInsta — Placement Aptitude Prep", url: "https://prepinsta.com/" },
      ],
    },
    {
      moduleTitle: "Verbal Reasoning",
      sections: [
        {
          heading: "Reading Comprehension",
          body: "Reading comprehension tests both understanding and speed simultaneously. A reliable approach: skim the passage first for overall structure and main idea rather than reading every word closely on the first pass, then read the questions, then return to the specific parts of the passage relevant to each question for a closer read. Answers to 'inference' questions (as opposed to direct fact-lookup questions) must be supportable by what's actually stated in the passage — not by outside knowledge or what seems generally reasonable, a distinction that trips up strong readers who over-rely on background knowledge.",
        },
        {
          heading: "Sentence Correction",
          body: "Sentence correction questions test grammar rules applied to real sentences: subject-verb agreement (a singular subject takes a singular verb, even when other plural nouns appear nearby and create a false sense of a plural subject), consistent tense within a sentence, correct use of prepositions, and parallel structure in lists ('she likes reading, writing, and to swim' breaks parallelism — it should be 'reading, writing, and swimming'). Reading the corrected sentence back in full, not just the changed portion, catches errors introduced by a fix that solves one problem while breaking something else in the sentence.",
        },
        {
          heading: "Vocabulary",
          body: "Vocabulary questions (synonyms, antonyms, fill-in-the-blank word choice) reward both direct knowledge and the ability to infer a word's meaning from context and word roots when it's unfamiliar. Recognizing common prefixes/suffixes (like 'bene-' meaning good, '-phobia' meaning fear) can narrow down an unfamiliar word's general meaning even without having seen that exact word before — a genuinely useful technique on test day when a completely unfamiliar word appears.",
        },
        {
          heading: "Critical Reasoning",
          body: "Critical reasoning questions present a short argument and ask you to identify its underlying assumption, what would strengthen or weaken it, or a logical flaw in its reasoning. The core skill is separating the argument's actual logical structure (premise → conclusion) from the surface topic — two arguments about completely different subjects can share the identical underlying flawed logical structure, and recognizing that structure is what these questions are really testing, not subject-matter knowledge.",
        },
      ],
      links: [
        { label: "IndiaBIX — Verbal Ability Practice", url: "https://www.indiabix.com/verbal-ability/questions-and-answers/" },
        { label: "GeeksforGeeks — Verbal Ability", url: "https://www.geeksforgeeks.org/verbal-ability-questions-and-answers/" },
        { label: "PrepInsta — Placement Aptitude Prep", url: "https://prepinsta.com/" },
      ],
    },
    {
      moduleTitle: "Non-Verbal Reasoning",
      sections: [
        {
          heading: "Series Completion",
          body: "Series completion questions present a sequence of shapes or figures following a hidden rule and ask what comes next. The systematic approach: check each figure against the previous one for a consistent, single type of change — rotation by a fixed angle, an added/removed element, a consistent shading pattern, or a repeating cycle of a small number of distinct figures — rather than trying to see the whole pattern at once. Most series use exactly one consistent transformation rule; if a hypothesis doesn't hold for all pairs in the sequence, it's the wrong rule, not an exception.",
        },
        {
          heading: "Pattern Recognition",
          body: "Pattern recognition questions (matrix completion, figure grouping) ask you to identify what property groups a set of figures together, or what's missing from a grid following row/column rules. The technique that works consistently: examine rows and columns of a matrix separately for their own individual pattern (since many matrix questions apply a different rule down each column, or a compounding rule across both dimensions at once) rather than searching for one single rule across the whole grid immediately.",
        },
        {
          heading: "Mirror & Water Images",
          body: "Mirror image questions ask what a figure looks like reflected in a vertical mirror (left-right reversed); water image questions ask for a horizontal reflection (up-down reversed, as if reflected in still water below the figure). The most reliable technique, especially for figures containing letters or numbers, is checking each individual element's orientation after reflection separately, since a full-figure reflection needs to be applied consistently to every component — errors usually come from correctly flipping the overall figure but forgetting to also flip small details inside it.",
        },
        {
          heading: "Cubes & Dice",
          body: "Cube and dice questions test 3D spatial visualization — given a few views of a cube or a net (unfolded cube layout), determine what's on a hidden face, or how many smaller cubes have a given number of painted faces after a larger cube is cut up. The systematic technique for net-folding questions: identify which faces are opposite each other on the net first (opposite faces are never adjacent on a correctly-folded cube), since that single fact — established once — answers most of the specific questions asked about that cube.",
        },
      ],
      links: [
        { label: "IndiaBIX — Non-Verbal Reasoning Practice", url: "https://www.indiabix.com/non-verbal-reasoning/questions-and-answers/" },
        { label: "GeeksforGeeks — Non-Verbal Reasoning", url: "https://www.geeksforgeeks.org/non-verbal-reasoning/" },
        { label: "PrepInsta — Placement Aptitude Prep", url: "https://prepinsta.com/" },
      ],
    },
    {
      moduleTitle: "Communication",
      sections: [
        {
          heading: "Verbal & Non-Verbal Communication",
          body: "Effective communication is more than word choice — tone, pace, and clarity of verbal delivery, combined with non-verbal signals like posture, eye contact, and facial expression, together determine how a message actually lands, often more than the literal words used. In a professional or interview setting specifically, awareness of non-verbal habits (a tendency to look away when nervous, filler words like 'um' filling every pause) is the first step to consciously improving them, since most people are genuinely unaware of their own habits until specifically recorded or told.",
        },
        {
          heading: "Email & Business Writing",
          body: "Professional written communication has its own conventions distinct from casual writing: a clear, specific subject line, a direct statement of purpose in the opening line rather than burying it in the third paragraph, appropriately formal tone without being stiff, and a clear call-to-action or next step at the close. Proofreading before sending — reading the message once specifically for tone (does this read as intended, or could it land as curt/rude?) separately from a pass checking for typos — catches two different categories of mistake that a single read-through tends to miss.",
        },
        {
          heading: "Public Speaking Basics",
          body: "Public speaking anxiety is close to universal, and structure is what reliably reduces it in practice, not eliminating nerves entirely. A simple, reusable structure — a clear opening that states what you'll cover, a body organized into a small number of distinct points (three is a common, effective number), and a closing that reinforces the main takeaway — gives a speaker a mental map to follow even under nervous pressure, which matters more for actually getting through a talk well than any specific delivery technique.",
        },
      ],
      links: [
        { label: "Toastmasters International — Public Speaking Resources", url: "https://www.toastmasters.org/" },
        { label: "Harvard Business Review — Communication", url: "https://hbr.org/topic/subject/communication" },
        { label: "Indeed Career Guide — Communication Skills", url: "https://www.indeed.com/career-advice/career-development/communication-skills" },
      ],
    },
    {
      moduleTitle: "Group Discussion",
      sections: [
        {
          heading: "GD Structure & Etiquette",
          body: "A group discussion is evaluated on both content and behavior — evaluators are watching how candidates interact, not only what they say. Basic etiquette matters more than most candidates expect: not interrupting others mid-sentence, actively listening rather than only waiting for a turn to speak, and acknowledging a previous speaker's point before adding your own ('Building on what X said...') demonstrates collaborative thinking, which is often exactly what a GD round is designed to assess.",
        },
        {
          heading: "Forming Arguments",
          body: "A strong contribution in a GD states a clear point, backs it with a specific reason or example (not just an assertion), and stays relevant to the actual topic rather than drifting into a tangentially related point. Quality of contribution consistently matters more than quantity — one well-reasoned, on-topic point that moves the discussion forward is worth more to an evaluator than several vague or repetitive comments made just to be seen speaking.",
        },
        {
          heading: "Handling Disagreement",
          body: "Disagreeing productively in a GD means challenging a point, not the person who made it — phrases like 'I see it differently because...' keep the disagreement about ideas rather than becoming personal or confrontational. Staying calm and articulate when directly challenged by another participant, rather than becoming defensive or raising your voice, is itself one of the specific behaviors evaluators are watching for, since it signals how a candidate might handle disagreement in a real workplace.",
        },
        {
          heading: "Time Management in GDs",
          body: "A group discussion typically runs 10-15 minutes among several participants, so airtime is genuinely scarce and needs deliberate management. Practical tactics: speaking early (within the first few exchanges) to establish presence rather than waiting for a 'perfect' moment that may never come, keeping individual contributions reasonably concise rather than monopolizing time, and being ready to actively bring in a quieter participant's view if a natural opening arises — the latter specifically signals group-oriented, collaborative behavior that many evaluators explicitly look for.",
        },
      ],
      links: [
        { label: "Indeed Career Guide — Group Discussion Tips", url: "https://www.indeed.com/career-advice" },
        { label: "PrepInsta — Group Discussion Topics & Tips", url: "https://prepinsta.com/" },
        { label: "Harvard Business Review — Communication", url: "https://hbr.org/topic/subject/communication" },
      ],
    },
    {
      moduleTitle: "Interview Preparation",
      sections: [
        {
          heading: "HR Interview Questions",
          body: "HR interview questions ('Tell me about yourself,' 'Why should we hire you,' 'Where do you see yourself in five years') aren't asking for a life story or generic answer — they're testing self-awareness, communication clarity, and genuine fit for the specific role. A strong 'tell me about yourself' answer is a tight, structured 60-90 second narrative connecting relevant background to the specific role being interviewed for — not an unstructured chronological biography starting from childhood, which is a very common mistake under nervous pressure.",
        },
        {
          heading: "Technical Interview Strategy",
          body: "In technical interviews, how you approach a problem is evaluated alongside whether you reach the correct final answer. The expected process: clarify the problem and any ambiguous requirements before writing any code, think out loud so the interviewer can follow your reasoning (a candidate who solves a problem in total silence gives an interviewer far less to evaluate positively, even with a correct final answer), discuss the time/space complexity of your approach, and test the solution against edge cases (empty input, single element, duplicates) before declaring it done.",
        },
        {
          heading: "Body Language",
          body: "Interview body language communicates confidence and engagement independent of what's actually being said: steady (not constant, unbroken) eye contact, an upright but relaxed posture, and controlled hand gestures all read as confidence to an interviewer, while looking away for extended periods, slouching, or fidgeting can undercut even a strong verbal answer. As with public speaking, most people are unaware of their own specific habits until a recorded mock interview makes them visible — which is exactly why mock interviews with recorded playback are a core part of this module.",
        },
        {
          heading: "Salary Negotiation Basics",
          body: "Salary negotiation for an entry-level or campus placement role is typically narrower in scope than a lateral hire's, but the fundamentals still apply: research the realistic market range for the role and location before the conversation happens (not after an offer is on the table), let the employer state a number first when possible rather than anchoring low by naming a figure yourself, and negotiate specific, researched terms rather than a vague general request for 'more.' Even where negotiation room is limited (common for large-batch campus hiring with fixed pay bands), understanding the full compensation structure — base pay, any joining bonus, benefits — matters for evaluating an offer accurately.",
        },
      ],
      links: [
        { label: "Indeed Career Guide — Interview Tips", url: "https://www.indeed.com/career-advice/interviewing" },
        { label: "GeeksforGeeks — Technical Interview Preparation", url: "https://www.geeksforgeeks.org/interview-preparation/" },
        { label: "Harvard Business Review — Negotiation", url: "https://hbr.org/topic/subject/negotiation-strategies" },
      ],
    },
    {
      moduleTitle: "Resume Building",
      sections: [
        {
          heading: "ATS-Friendly Formatting",
          body: "Many companies filter incoming resumes through an Applicant Tracking System (ATS) before a human ever reads them — software that parses the resume text and screens for relevant keywords and structure. ATS-friendly formatting means: a standard, single-column layout (multi-column layouts and text inside images/graphics often parse incorrectly or get skipped entirely), standard section headings ('Experience,' 'Education,' 'Skills' rather than creative alternatives an ATS may not recognize), and a simple, widely-compatible file format (typically PDF or .docx, following the specific employer's stated preference).",
        },
        {
          heading: "Highlighting Projects",
          body: "For students without extensive work experience, projects are often the strongest content on a resume — but only if described in a way that conveys real substance rather than a vague title. A strong project entry states what was built, the specific technologies/skills used, and — critically — the result or impact, not just the activity ('Built a full-stack attendance tracking app used by 200+ students across 3 colleges' communicates far more than 'Worked on a web application').",
        },
        {
          heading: "Quantifying Achievements",
          body: "Wherever genuinely possible, achievements should include a number that gives a reader real scale — percentage improvement, time saved, number of users, size of a dataset processed. 'Improved page load time' is vague; 'Reduced page load time by 40% by optimizing image loading' is concrete and memorable to a reader skimming dozens of resumes. When a precise number genuinely isn't available (common for coursework or class projects), a scope indicator (team size, project duration, dataset size) still adds useful, credible concreteness.",
        },
        {
          heading: "LinkedIn Optimization",
          body: "A LinkedIn profile serves a different purpose than a resume — it's searchable by recruiters and should be optimized accordingly: a headline that states role/specialization clearly rather than just a generic job title, a complete 'About' summary written in a slightly more conversational tone than a resume allows, and skills listed that genuinely match how recruiters search (industry-standard terms, not internal jargon). Keeping the resume and LinkedIn profile broadly consistent in the facts they state — dates, titles, project descriptions — matters too, since recruiters routinely cross-check the two, and unexplained inconsistencies raise questions.",
        },
      ],
      links: [
        { label: "Indeed Career Guide — Resume Writing", url: "https://www.indeed.com/career-advice/resumes-cover-letters" },
        { label: "LinkedIn Learning — Profile Optimization", url: "https://www.linkedin.com/learning/" },
        { label: "Harvard Business Review — Resumes & Job Search", url: "https://hbr.org/topic/subject/job-search" },
      ],
    },
  ],
};

export default data;
