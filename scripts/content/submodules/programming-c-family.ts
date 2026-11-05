import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "programming",
  submodules: [
    // ───────────────────────────── C Programming ─────────────────────────────
    {
      moduleTitle: "C Programming",
      subModuleTitle: "Syntax, variables & data types",
      overview:
        "C is the language most other imperative languages borrow their syntax and core semantics from, so getting its fundamentals exactly right pays off far beyond C itself — C++, C#, Java, and even JavaScript all inherit its statement structure, operator set, and much of its type-conversion behavior. Unlike higher-level languages, C gives you almost no safety net: the compiler won't stop you from reading an uninitialized variable, overflowing a signed integer, or truncating a float to an int, so understanding exactly what each type can hold and how values convert between types is not optional background knowledge — it's the difference between code that works and code that silently corrupts data. This sub-module covers the compilation pipeline, variable declarations and scope, the primitive type set and its platform-dependent sizes, type modifiers, implicit and explicit conversion, and the operator set, each grounded in a compilable example.",
      sections: [
        {
          heading: "Program Structure and the Compilation Pipeline",
          body:
            "A C program is built from functions, with exactly one entry point named main, and every file that uses a standard library function must #include the header that declares it. Unlike interpreted languages, C source goes through four distinct stages before it runs: the preprocessor expands #include and #define directives into plain C text, the compiler translates that text into assembly/object code, the linker resolves references between object files and library code into a single executable, and only then does the OS load and run it. Understanding these stages matters because errors surface at different points — a missing header produces a compiler warning about an undeclared function, while a missing library produces a linker error, and the two require completely different fixes.",
          bullets: [
            "gcc -c main.c produces an object file (compile only); gcc main.o -o main links it into an executable.",
            "#include <stdio.h> pulls in declarations, not the actual printf implementation — that's resolved later, at link time.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, world!\\n");\n    return 0; // 0 conventionally signals success to the OS\n}\n\n/* Compile and run:\n   gcc hello.c -o hello\n   ./hello\n*/',
          },
        },
        {
          heading: "Variables, Declarations, and Scope",
          body:
            "A declaration tells the compiler a variable's name and type; a definition also reserves storage for it — in C these usually happen together (int x;), but the distinction matters once you work across multiple files with extern. Scope determines where a name is visible: variables declared inside a block ({ }) are block-scoped and only exist from their declaration to the closing brace, variables declared outside any function are file-scoped (visible to every function below them in that file), and each function parameter is scoped to that function body. C (since C99) allows declaring variables anywhere inside a block, not only at the very top, which makes it easy to keep a variable's declaration close to its first use.",
          bullets: [
            "A variable declared inside an if block does not exist outside that block, even inside the same function.",
            "Always initialize local variables explicitly — unlike global variables (which default to 0), local variables hold indeterminate garbage until assigned.",
          ],
          code: {
            language: "c",
            code:
              "#include <stdio.h>\n\nint global_counter = 0; // file scope, auto-initialized to 0\n\nint main(void) {\n    int local_total = 10;  // block scope: visible only inside main\n    {\n        int local_total = 99; // a NEW variable, shadows the outer one in this inner block\n        printf(\"inner: %d\\n\", local_total); // 99\n    }\n    printf(\"outer: %d\\n\", local_total); // 10 — unaffected by the inner shadow\n    return 0;\n}",
          },
        },
        {
          heading: "Primitive Data Types and Their Sizes",
          body:
            "C's core primitive types are char (at least 8 bits, holds one byte), int (the natural integer size for the platform, typically 32 bits), float (single-precision IEEE 754, typically 32 bits), and double (double-precision, typically 64 bits). Critically, the C standard guarantees only MINIMUM sizes, not exact ones — int is guaranteed to be at least 16 bits but is 32 bits on virtually every modern desktop/server platform, and assuming a fixed size without checking is a classic portability bug. The sizeof operator reports the exact size (in bytes) of a type or variable on the current platform at compile time, which is the only reliable way to know a type's actual size rather than assuming it.",
          bullets: [
            "Never hard-code assumed sizes like 'an int is always 4 bytes' in portable code — use sizeof or the fixed-width types in <stdint.h> (int32_t, uint64_t, etc.) when an exact width is required.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    printf("char:   %zu byte(s)\\n", sizeof(char));\n    printf("int:    %zu byte(s)\\n", sizeof(int));\n    printf("float:  %zu byte(s)\\n", sizeof(float));\n    printf("double: %zu byte(s)\\n", sizeof(double));\n    return 0;\n}\n/* Typical output on a 64-bit machine: char 1, int 4, float 4, double 8 */',
          },
        },
        {
          heading: "Type Modifiers: signed, unsigned, short, long",
          body:
            "signed and unsigned control whether a type's top bit represents sign or extends the magnitude — an unsigned int on a 32-bit platform ranges from 0 to 4,294,967,295 instead of int's roughly ±2.1 billion, trading negative numbers for double the positive range. short and long adjust the storage size relative to int (short int is often 16 bits, long int often 32 or 64 bits depending on platform). Unsigned arithmetic wraps around on overflow by definition (well-defined modulo 2^n behavior), which makes it tempting to use for 'this can never be negative' quantities like array sizes — but that same wraparound turns an accidental subtraction below zero into a silent, enormous positive number instead of a negative one, which is a frequent source of hard-to-find bugs.",
          bullets: [
            "unsigned int x = 0; x--; does NOT trigger an error — x silently becomes 4294967295 on a 32-bit unsigned int.",
            "Signed integer overflow (unlike unsigned) is undefined behavior in C — the compiler is allowed to assume it never happens, which can produce surprising optimizations.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    unsigned int count = 0;\n    count = count - 1; // wraps around instead of going negative\n    printf("count = %u\\n", count); // 4294967295 on a typical 32-bit unsigned int\n    return 0;\n}',
          },
        },
        {
          heading: "Type Conversion: Implicit and Explicit (Casting)",
          body:
            "C automatically performs implicit conversions in mixed-type expressions via the 'usual arithmetic conversions' — the operand with the narrower/lower-ranked type is promoted to match the wider one before the operation happens, so char and short operands are promoted to int, and mixing int with double promotes the int to double. The most common pitfall is integer division: 7 / 2 evaluates entirely in integer arithmetic and truncates to 3, discarding the fractional part, even if the result is immediately assigned to a double. Explicit casts, written as (type)expression, force a conversion at a specific point and are the correct fix — casting one operand to double before dividing forces the whole expression into floating-point arithmetic.",
          bullets: [
            "7 / 2 is 3 (integer division); (double)7 / 2 or 7 / 2.0 is 3.5 (floating-point division).",
            "Casting a larger floating type down to a narrower integer type (e.g., (int)3.99) truncates toward zero — it does not round.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int a = 7, b = 2;\n    printf("%d\\n", a / b);              // 3 — integer division truncates\n    printf("%f\\n", (double)a / b);      // 3.500000 — one operand cast to double first\n    printf("%d\\n", (int)3.99);          // 3 — truncation, not rounding\n    return 0;\n}',
          },
        },
        {
          heading: "Constants and the const / #define Distinction",
          body:
            "A #define macro is a pure text-substitution performed by the preprocessor before compilation even begins — #define MAX 100 literally replaces every occurrence of MAX with 100 in the source text, so it has no type and the compiler never sees the name 'MAX' at all, only the number. A const-qualified variable (const int max = 100;) is a real, typed variable that the compiler enforces as read-only and that shows up in debuggers and error messages by name. Modern C style generally prefers const (or enum for related integer constants) over #define for simple value constants, reserving macros for cases that genuinely need text substitution or conditional compilation.",
          bullets: [
            "#define SQUARE(x) x*x is a classic macro bug: SQUARE(1+2) expands to 1+2*1+2 = 5, not 9 — always parenthesize macro parameters and the whole expansion: #define SQUARE(x) ((x)*(x)).",
            "enum { RED, GREEN, BLUE } gives a readable, typed way to name a related group of integer constants (RED=0, GREEN=1, BLUE=2 by default).",
          ],
          code: {
            language: "c",
            code:
              "#include <stdio.h>\n\n#define BAD_SQUARE(x) x*x\n#define GOOD_SQUARE(x) ((x)*(x))\n\nint main(void) {\n    const int max_attempts = 3; // typed, debugger-visible, enforced read-only\n    printf(\"%d\\n\", BAD_SQUARE(1+2));  // 5  — expands to 1+2*1+2\n    printf(\"%d\\n\", GOOD_SQUARE(1+2)); // 9  — expands to ((1+2)*(1+2))\n    printf(\"max_attempts = %d\\n\", max_attempts);\n    return 0;\n}",
          },
        },
        {
          heading: "Operators and Expression Evaluation",
          body:
            "C's operator set spans arithmetic (+ - * / %), relational (< <= > >= == !=), logical (&& || !), and bitwise (& | ^ ~ << >>) operators, each with a precedence level that determines evaluation order when operators are mixed without parentheses. Bitwise operators work on the binary representation of integers directly and are the standard way to pack multiple boolean flags into a single integer using OR to set a flag, AND to test it, and AND-with-complement to clear it — a pattern used constantly in embedded programming, graphics, and systems code. It's worth memorizing that & and | are bitwise (operate per-bit) while && and || are logical (operate on whole truth values with short-circuit evaluation) — confusing a single & for && is a common, hard-to-spot bug since both compile without error.",
          bullets: [
            "Short-circuit evaluation: in (a != 0) && (10/a > 1), the division never executes if a is 0, because && stops evaluating once the left side is false.",
            "x & 1 tests whether x is odd (checks the lowest bit); x << 1 is equivalent to multiplying x by 2 for non-negative integers.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\n#define FLAG_READ    (1 << 0) // 0001\n#define FLAG_WRITE   (1 << 1) // 0010\n#define FLAG_EXECUTE (1 << 2) // 0100\n\nint main(void) {\n    int permissions = FLAG_READ | FLAG_WRITE; // set READ and WRITE bits: 0011\n\n    if (permissions & FLAG_WRITE) {\n        printf("Write permission is set\\n");\n    }\n\n    permissions &= ~FLAG_WRITE; // clear the WRITE bit: 0001\n    printf("permissions now = %d\\n", permissions); // 1\n    return 0;\n}',
          },
        },
      ],
      commonPitfalls: [
        "Assuming int is always exactly 4 bytes across every platform instead of checking with sizeof or using <stdint.h> fixed-width types.",
        "Using unsigned for a value that can legitimately go negative in an intermediate calculation, causing silent wraparound instead of a visible negative result.",
        "Expecting integer division (7/2) to produce a fractional result without casting at least one operand to a floating type.",
        "Writing unparenthesized macro parameters (#define SQUARE(x) x*x), which breaks silently when called with an expression argument.",
        "Reading a local variable before it has been explicitly assigned a value, relying on it 'probably' being zero the way global variables are.",
        "Confusing bitwise & / | with logical && / || — both compile without error but produce very different results.",
      ],
      keyTakeaways: [
        "The compilation pipeline has four distinct stages (preprocess, compile, link, load) — knowing which stage an error comes from tells you what to fix.",
        "C only guarantees minimum type sizes, not exact ones; use sizeof or <stdint.h> types when exact width matters.",
        "Local variables are NOT auto-initialized — always assign a value before first use.",
        "Signed overflow is undefined behavior; unsigned overflow is well-defined wraparound — know which type you're working with before relying on overflow behavior.",
        "Prefer const or enum over #define for simple value constants; reserve macros for genuine text substitution.",
        "Bitwise operators (&, |, ^, ~, <<, >>) operate per-bit and are the standard tool for packing and testing flags in a single integer.",
      ],
      links: [
        { label: "cppreference — C Language Reference", url: "https://en.cppreference.com/w/c/language" },
        { label: "GeeksforGeeks — Data Types in C", url: "https://www.geeksforgeeks.org/c/c-data-types/" },
      ],
    },
    {
      moduleTitle: "C Programming",
      subModuleTitle: "Control flow & functions",
      overview:
        "Control flow statements and functions are how a C program moves beyond a single straight-line sequence of instructions — branching on conditions, repeating work, and decomposing a problem into named, reusable, independently testable pieces. C's control-flow constructs (if/else, switch, the three loop forms, break/continue) are the direct ancestors of the equivalent constructs in nearly every language used today, and its function model — pass-by-value parameters, mandatory prototypes, and the ability to take a pointer to a function itself — sets the foundation for everything from simple utility functions to callback-driven event systems. This sub-module works through conditional branching, the three loop constructs and when to choose each, structuring and calling functions correctly, how arrays behave when passed as parameters, recursion, and function pointers.",
      sections: [
        {
          heading: "Conditional Branching: if/else and switch",
          body:
            "if/else chooses between code paths based on a boolean-like condition (in C, any nonzero value is 'true' and 0 is 'false' — there was no real bool type before C99's stdbool.h). switch compares a single integer or char expression against a list of constant case labels, which is often more readable than a long if-else-if chain when testing one variable against many discrete values, but every case falls through into the next one unless a break statement stops it — intentional fallthrough is occasionally useful (grouping multiple labels for one block of code) but is a very common accidental bug when a break is simply forgotten.",
          bullets: [
            "switch only compares against compile-time constant labels (not variables or ranges) — this is a hard restriction, unlike some other languages' switch/match constructs.",
            "default (placed anywhere in the switch, though conventionally last) runs when no case matches.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int day = 3;\n    switch (day) {\n        case 1:\n        case 7:\n            printf("Weekend\\n");\n            break;\n        case 2:\n        case 3:\n        case 4:\n        case 5:\n        case 6:\n            printf("Weekday\\n");\n            break;\n        default:\n            printf("Invalid day\\n");\n    }\n    return 0;\n}',
          },
        },
        {
          heading: "Loops: for, while, and do-while",
          body:
            "for bundles initialization, condition, and increment into one line and is the natural choice when the number of iterations is known or counter-driven. while checks its condition before each iteration and is suited to loops driven by an external condition rather than a counter (reading input until EOF, for instance). do-while checks its condition AFTER executing the body once, guaranteeing at least one execution — useful for menu loops or input-validation loops that must run at least once before anything can be checked. All three support break (exit the loop immediately) and continue (skip to the next iteration's condition check).",
          bullets: [
            "for (int i = 0; i < n; i++) is idiomatic for counting exactly n times; off-by-one errors (<= instead of <) are the most common loop bug.",
            "do-while's condition is checked at the BOTTOM, so the body always runs at least once, even if the condition is false from the start.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int sum = 0;\n    for (int i = 1; i <= 5; i++) {   // runs for i = 1,2,3,4,5\n        sum += i;\n    }\n    printf("sum = %d\\n", sum); // 15\n\n    int choice;\n    do {\n        printf("Enter 1 to continue, 0 to quit: ");\n        scanf("%d", &choice);\n    } while (choice != 0 && choice != 1); // body runs at least once\n\n    return 0;\n}',
          },
        },
        {
          heading: "break, continue, and the Case Against goto",
          body:
            "break immediately exits the nearest enclosing loop or switch; continue skips the rest of the current iteration's body and jumps to the loop's condition check (or increment step, in a for loop). C also has goto, which jumps unconditionally to a labeled statement anywhere in the same function — it predates structured control flow and is almost always avoidable with proper loops and conditionals, with the one widely accepted exception being jumping to a single cleanup/error-handling label at the end of a function to avoid duplicating resource-release code across multiple early-exit points.",
          bullets: [
            "continue in a for loop still runs the increment step before re-checking the condition — it does not skip the increment.",
            "The accepted goto use case: 'goto cleanup;' to a single exit label that frees resources, avoiding repeated free()/fclose() calls at every early-return point.",
          ],
        },
        {
          heading: "Function Declaration, Definition, and Prototypes",
          body:
            "A function prototype (its return type, name, and parameter types, ending in a semicolon) must appear before a function is called unless the full definition itself appears earlier in the file — without one, older C compilers would implicitly assume a return type of int, which modern C treats as an error. Declaring prototypes in a header file and including that header is the standard way to let multiple source files call each other's functions. A function's return type describes what comes back to the caller; void means nothing is returned, and a function that reaches its closing brace without an explicit return simply returns no value (or garbage, if its return type isn't void).",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint add(int a, int b); // prototype — lets main() call add() before its definition\n\nint main(void) {\n    printf("%d\\n", add(3, 4)); // 7\n    return 0;\n}\n\nint add(int a, int b) { // definition\n    return a + b;\n}',
          },
        },
        {
          heading: "Parameter Passing: Pass-by-Value and Array Decay",
          body:
            "C always passes function arguments by value — the function receives a COPY of each argument, so modifying a parameter inside the function never affects the caller's original variable (this is why 'swap' functions in C must take pointers, covered in the Pointers sub-module). The one apparent exception is arrays: when an array is passed as a function parameter, it silently 'decays' to a pointer to its first element, so the function receives the array's address, not a copy of its contents — this is why sizeof on an array parameter inside a function always returns the size of a pointer, not the original array's size, a very common surprise for beginners.",
          bullets: [
            "void modify(int x) { x = 99; } never changes the caller's variable — x is a local copy.",
            "void modify(int arr[]) can change the caller's array contents, because arr is really a pointer to the caller's actual data.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nvoid tryToDouble(int n) {\n    n = n * 2; // only changes the local copy\n}\n\nvoid doubleArray(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        arr[i] *= 2; // modifies the CALLER\'s array, because arr decayed to a pointer\n    }\n}\n\nint main(void) {\n    int x = 5;\n    tryToDouble(x);\n    printf("x = %d\\n", x); // 5 — unchanged\n\n    int nums[3] = {1, 2, 3};\n    doubleArray(nums, 3);\n    printf("%d %d %d\\n", nums[0], nums[1], nums[2]); // 2 4 6 — changed\n    return 0;\n}',
          },
        },
        {
          heading: "Recursion",
          body:
            "A recursive function calls itself with a smaller version of the same problem, always paired with a base case that stops the recursion — without one, the function calls itself indefinitely until it exhausts the call stack and crashes with a stack overflow. Each recursive call gets its own stack frame holding its own copies of local variables and parameters, which is why recursion naturally handles problems with a tree-like or self-similar structure (factorial, Fibonacci, traversing nested data) but can be memory-expensive compared to an equivalent loop for very deep recursion depths.",
          bullets: [
            "Every recursive function needs a base case that returns without recursing further — this is the single most important thing to get right.",
            "Deep recursion (tens of thousands of calls) risks stack overflow; an iterative loop is usually preferable when depth could be large and unbounded.",
          ],
          code: {
            language: "c",
            code:
              "#include <stdio.h>\n\nunsigned long long factorial(int n) {\n    if (n <= 1) return 1;          // base case — stops the recursion\n    return n * factorial(n - 1);   // recursive case\n}\n\nint main(void) {\n    printf(\"5! = %llu\\n\", factorial(5)); // 120\n    return 0;\n}",
          },
        },
        {
          heading: "Function Pointers",
          body:
            "A function pointer stores the address of a function itself, which lets you pass a function as an argument to another function, store different behaviors in an array, or build simple callback/plugin systems — all without any special language feature beyond pointer syntax. The declaration syntax (return_type (*pointer_name)(parameter_types)) looks intimidating at first but reads the same way as any other pointer: a variable that holds an address, here the address of a function matching that exact signature. This pattern underlies qsort's comparator argument in the C standard library and is the conceptual ancestor of callbacks, delegates, and first-class functions in later languages.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\nint multiply(int a, int b) { return a * b; }\n\nint applyOperation(int a, int b, int (*op)(int, int)) {\n    return op(a, b); // calls whichever function `op` currently points to\n}\n\nint main(void) {\n    printf("%d\\n", applyOperation(3, 4, add));      // 7\n    printf("%d\\n", applyOperation(3, 4, multiply)); // 12\n    return 0;\n}',
          },
        },
      ],
      commonPitfalls: [
        "Forgetting a break in a switch statement, causing execution to fall through into the next case unintentionally.",
        "Off-by-one errors in loop bounds (using <= when < was intended, or vice versa), especially when indexing arrays.",
        "Expecting a pass-by-value function parameter to modify the caller's original variable, instead of returning the new value or taking a pointer.",
        "Confusing an array parameter's sizeof (always the size of a pointer) with the original array's full size, after it has decayed inside the function.",
        "Writing recursion without a correctly-reached base case, or with a base case that never gets hit for certain inputs, causing a stack overflow.",
        "Calling a function before its prototype or full definition is visible to the compiler, in older toolchains silently assuming an int return type.",
      ],
      keyTakeaways: [
        "switch requires compile-time constant case labels and falls through without an explicit break in each case.",
        "for suits counter-driven loops, while suits condition-driven loops, do-while guarantees at least one execution.",
        "C always passes arguments by value; arrays are the apparent exception only because they decay to a pointer, not because C passes them by reference.",
        "Every recursive function must have a base case reachable from every valid input, or it will eventually overflow the call stack.",
        "A function prototype must be visible before a function is called from elsewhere in the program.",
        "Function pointers let you pass behavior as data — the same mechanism behind callbacks in virtually every later language.",
      ],
      links: [
        { label: "cppreference — C Control Flow", url: "https://en.cppreference.com/w/c/language/statements" },
        { label: "GeeksforGeeks — Functions in C", url: "https://www.geeksforgeeks.org/c/functions-in-c/" },
      ],
    },
    {
      moduleTitle: "C Programming",
      subModuleTitle: "Pointers & memory management",
      overview:
        "Pointers are the single most defining feature of C — they expose memory addresses directly to the programmer, which is what makes C fast and close to the hardware, and also what makes it unforgiving: nearly every category of serious C bug (crashes, security vulnerabilities, memory corruption) traces back to a pointer pointing somewhere it shouldn't. Unlike garbage-collected languages, C requires the programmer to explicitly request memory from the heap with malloc/calloc/realloc and explicitly return it with free — there is no safety net if you forget, double-free, or keep using a pointer after the memory it refers to has been released. This sub-module builds pointer fundamentals from the address-of and dereference operators through pointer arithmetic, multi-level indirection, the dynamic memory allocation family, and the specific memory bugs that cause the most damage in real C programs.",
      sections: [
        {
          heading: "Pointer Basics: & and *",
          body:
            "Every variable lives at a memory address, and the & (address-of) operator retrieves that address as a pointer value. A pointer variable is declared with a type and an asterisk (int *p;), meaning 'p holds the address of an int.' The * operator, when applied to a pointer (not during declaration), dereferences it — it follows the address to read or write the value actually stored there. A pointer that doesn't yet point anywhere meaningful should be explicitly set to NULL, and dereferencing a NULL or otherwise invalid pointer is undefined behavior, typically crashing the program (a segmentation fault) rather than doing anything useful.",
          bullets: [
            "int x = 5; int *p = &x; — p now holds x's address. *p reads/writes x's value through p.",
            "Always initialize pointers (to a valid address or NULL) — an uninitialized pointer holds a garbage address that may or may not crash when dereferenced.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int x = 5;\n    int *p = &x;\n\n    printf("x = %d\\n", x);    // 5\n    printf("*p = %d\\n", *p);  // 5 — dereferencing p reads x\n\n    *p = 10; // writes through the pointer\n    printf("x = %d\\n", x);    // 10 — x itself changed\n    return 0;\n}',
          },
        },
        {
          heading: "Pointer Arithmetic and Arrays",
          body:
            "Incrementing a pointer moves it forward by exactly sizeof(the pointed-to type), not by one raw byte — p + 1 on an int* moves 4 bytes forward (on a typical platform), landing on the next int in memory, which is precisely why pointer arithmetic and array indexing are two notations for the same operation: arr[i] is defined to mean *(arr + i). This equivalence is why an array name used in an expression decays into a pointer to its first element, and why pointer arithmetic is only well-defined within (or one-past-the-end of) a single array — walking a pointer past that boundary and dereferencing it is undefined behavior even if it happens not to crash immediately.",
          bullets: [
            "arr[i] and *(arr + i) are exactly equivalent — the compiler generates identical code for both.",
            "Pointer arithmetic is only valid within a single array (or one element past its end, for loop termination checks) — never across unrelated allocations.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int arr[4] = {10, 20, 30, 40};\n    int *p = arr; // array decays to a pointer to arr[0]\n\n    for (int i = 0; i < 4; i++) {\n        printf("%d ", *(p + i)); // identical to arr[i]\n    }\n    printf("\\n"); // 10 20 30 40\n    return 0;\n}',
          },
        },
        {
          heading: "Pointers to Pointers and Multi-Level Indirection",
          body:
            "A pointer can itself be stored at an address, requiring a pointer-to-pointer (int **pp;) to hold that address — one extra level of * per extra level of indirection. This comes up whenever a function needs to modify the CALLER's pointer itself (not just the data it points to), since C's pass-by-value rules apply to pointers exactly as to any other type: a function receiving an int *p parameter gets a copy of that pointer, so reassigning p inside the function doesn't change the caller's pointer — only a int **pp parameter, dereferenced once to reach the real pointer, can do that. This pattern appears constantly in functions that allocate memory and need to hand the new pointer back to the caller.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <stdlib.h>\n\nvoid allocateAndSet(int **out, int value) {\n    *out = malloc(sizeof(int)); // modifies the CALLER\'s pointer, via one level of indirection\n    **out = value;\n}\n\nint main(void) {\n    int *p = NULL;\n    allocateAndSet(&p, 42); // pass the ADDRESS of p\n    printf("%d\\n", *p);     // 42\n    free(p);\n    return 0;\n}',
          },
        },
        {
          heading: "Dynamic Memory: malloc, calloc, realloc, free",
          body:
            "malloc(size) requests size bytes from the heap and returns a void* to the start of that block, or NULL if the allocation failed — its contents are uninitialized garbage. calloc(count, size) allocates count*size bytes and additionally zero-initializes every byte, which is useful for arrays that should start at a known value. realloc(ptr, new_size) resizes a previously allocated block, possibly moving it to a new address and copying the existing contents — the returned pointer must always be used in place of the old one, since the old pointer may now be invalid even on success. Every successful malloc/calloc/realloc must eventually be paired with exactly one call to free(ptr) once the memory is no longer needed, or the program leaks that memory for its entire remaining lifetime.",
          bullets: [
            "Always check malloc/calloc/realloc's return value for NULL before using it — allocation can and does fail, especially under memory pressure.",
            "ptr = realloc(ptr, newSize); is dangerous if realloc fails (returns NULL) — you lose the original pointer and leak it. Use a temporary variable instead.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n = 5;\n    int *arr = malloc(n * sizeof(int));\n    if (arr == NULL) {\n        fprintf(stderr, "Allocation failed\\n");\n        return 1;\n    }\n\n    for (int i = 0; i < n; i++) arr[i] = i * i;\n\n    // Grow the array to hold 10 ints, preserving existing contents\n    int *bigger = realloc(arr, 10 * sizeof(int));\n    if (bigger == NULL) {\n        free(arr); // original still valid — avoid losing it\n        return 1;\n    }\n    arr = bigger;\n\n    for (int i = 0; i < 10; i++) printf("%d ", arr[i]);\n    printf("\\n");\n\n    free(arr); // release the memory exactly once\n    return 0;\n}',
          },
        },
        {
          heading: "Common Memory Bugs: Leaks, Dangling Pointers, Double Free",
          body:
            "A memory leak happens when allocated memory is never freed and the pointer to it is lost (overwritten or goes out of scope) — the program's memory usage grows until it's killed or the system runs out of memory. A dangling pointer is one that still holds the address of memory that has already been freed; the memory may be reused for something else, so reading or writing through a dangling pointer corrupts unrelated data unpredictably rather than failing cleanly. A double free occurs when free() is called twice on the same pointer, which corrupts the heap's internal bookkeeping and is a well-known source of security vulnerabilities. The standard discipline to avoid all three: free exactly once, and immediately set the pointer to NULL afterward so any accidental later use fails loudly (dereferencing NULL crashes immediately and visibly) instead of silently.",
          bullets: [
            "After free(p);, immediately write p = NULL; — a second accidental free(p) or dereference then fails safely instead of corrupting memory.",
            "Tools like Valgrind (Linux/macOS) and AddressSanitizer (-fsanitize=address with gcc/clang) catch leaks, double-frees, and use-after-free automatically — use them routinely, not just when debugging a crash.",
          ],
        },
        {
          heading: "const with Pointers",
          body:
            "const can qualify either the pointed-to data, the pointer itself, or both, and the position of const in the declaration determines which: const int *p means 'p points to data that can't be changed through p' (but p itself can be reassigned to point elsewhere); int *const p means 'p itself can't be reassigned, but the data it points to can be modified'; const int *const p locks both. Using const int *parameter for function parameters that only read data (never write through the pointer) documents intent clearly and lets the compiler catch accidental writes.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nvoid printArray(const int *arr, int size) { // promises not to modify arr\'s contents\n    for (int i = 0; i < size; i++) {\n        printf("%d ", arr[i]);\n        // arr[i] = 0; // would be a COMPILE ERROR — arr points to const data\n    }\n    printf("\\n");\n}\n\nint main(void) {\n    int nums[3] = {1, 2, 3};\n    printArray(nums, 3);\n    return 0;\n}',
          },
        },
        {
          heading: "Pointers as Function Arguments: Simulating Pass-by-Reference",
          body:
            "Since C always passes arguments by value, the only way for a function to modify a caller's variable directly is to receive a pointer to it and dereference that pointer to write the new value — this is exactly how a correct swap() function must be written, and the same principle extends to any function that needs to produce more than one 'output' value (one via the return statement, the rest via pointer parameters that it writes through).",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main(void) {\n    int x = 1, y = 2;\n    swap(&x, &y); // pass addresses, not values\n    printf("x=%d y=%d\\n", x, y); // x=2 y=1\n    return 0;\n}',
          },
        },
      ],
      commonPitfalls: [
        "Dereferencing a pointer that was never initialized or was set to NULL, crashing with a segmentation fault.",
        "Forgetting to free() every successful malloc/calloc/realloc, leaking memory for the remaining life of the program.",
        "Using a pointer after the memory it refers to has been freed (a dangling pointer / use-after-free bug).",
        "Calling free() twice on the same pointer, corrupting the heap's internal bookkeeping.",
        "Assigning realloc's return value directly back to the original pointer variable without checking for NULL first, losing the original allocation on failure.",
        "Walking pointer arithmetic past the bounds of the array it points into, reading or writing unrelated memory.",
        "Not checking malloc/calloc's return value for NULL before dereferencing the result.",
      ],
      keyTakeaways: [
        "& retrieves an address; * dereferences a pointer to read or write the value it points to.",
        "arr[i] and *(arr + i) are exactly equivalent — array indexing is pointer arithmetic in different notation.",
        "Every successful malloc/calloc/realloc must be paired with exactly one free(); set the pointer to NULL immediately after freeing it.",
        "A dangling pointer (use-after-free) and a double free are both undefined behavior and common sources of security vulnerabilities.",
        "A pointer-to-pointer is required when a function must modify the caller's own pointer variable, not just the data it points to.",
        "const int *p protects the pointed-to data from modification through p; int *const p protects p itself from reassignment.",
      ],
      links: [
        { label: "cppreference — Pointer declaration", url: "https://en.cppreference.com/w/c/language/pointer" },
        { label: "GeeksforGeeks — Dynamic Memory Allocation in C", url: "https://www.geeksforgeeks.org/c/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/" },
      ],
    },
    {
      moduleTitle: "C Programming",
      subModuleTitle: "Arrays, strings & structures",
      overview:
        "Arrays, strings, and structures are how C organizes multiple related values into a single unit, and all three reveal more of C's low-level memory model than equivalent features in higher-level languages: a C string is nothing more than a char array with a convention (a trailing null byte) rather than a distinct built-in type, and a struct's layout in memory can include invisible padding bytes the compiler inserts for alignment. Because C provides no bounds checking on arrays and no automatic memory management for strings, nearly every serious security vulnerability in C's history traces back to misused arrays or strings — buffer overflows from strcpy, off-by-one errors in loop bounds, missing null terminators. This sub-module covers array memory layout, multidimensional arrays, C string mechanics and the standard string-handling functions, the structure type, and struct memory layout.",
      sections: [
        {
          heading: "Array Declaration and Memory Layout",
          body:
            "A C array is a fixed-size, contiguous block of memory holding elements of the same type, with no metadata stored alongside it recording its own length — the programmer is entirely responsible for tracking how many elements an array holds, usually via a separate size variable or a #define'd constant. Because arrays are contiguous, element access via arr[i] is a single pointer-arithmetic calculation (constant time), and the array's name in most expressions decays to a pointer to its first element, which is why sizeof(arr) gives the TOTAL array size in bytes only when arr is still the actual array (not a function parameter it has decayed into).",
          bullets: [
            "int arr[10]; sizeof(arr) is 40 (10 ints × 4 bytes) in the scope where arr is the real array — but decays to a pointer size once passed to a function.",
            "C performs NO bounds checking: arr[10] on a 10-element array (valid indices 0-9) reads/writes out-of-bounds memory silently, which is undefined behavior.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int arr[5] = {10, 20, 30, 40, 50};\n    printf("sizeof(arr) = %zu bytes\\n", sizeof(arr));        // 20 (5 * 4)\n    printf("number of elements = %zu\\n", sizeof(arr) / sizeof(arr[0])); // 5\n    return 0;\n}',
          },
        },
        {
          heading: "Multidimensional Arrays",
          body:
            "A 2D array (int grid[3][4];) is still, under the hood, one single contiguous block of memory arranged in row-major order — all of row 0's elements, then all of row 1's, and so on — not an array of separate pointers to separate rows (that pattern, an array of pointers, is a different and more flexible structure often used when row lengths can vary). Accessing grid[i][j] is computed as *(grid + i * NUM_COLS + j) internally, which is why the number of columns must be known (or fixed) at compile time for a true 2D array, and why nested loops iterating row-then-column match the underlying memory layout for the best cache performance.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    int grid[2][3] = {\n        {1, 2, 3},\n        {4, 5, 6}\n    };\n\n    for (int i = 0; i < 2; i++) {\n        for (int j = 0; j < 3; j++) {\n            printf("%d ", grid[i][j]);\n        }\n    }\n    printf("\\n"); // 1 2 3 4 5 6\n    return 0;\n}',
          },
        },
        {
          heading: "C Strings: char Arrays and the Null Terminator",
          body:
            "C has no dedicated string type — a C string is simply a char array whose contents end with a null byte ('\\0', value 0), and every standard string function relies on that null byte to know where the string ends. A string literal like \"hello\" automatically gets a null terminator appended by the compiler, making it 6 bytes total even though it displays 5 visible characters — forgetting to budget space for that extra byte when sizing a char buffer is one of the most common C beginner mistakes. strlen() counts characters up to (but not including) the null terminator, and does NOT include it in the returned count.",
          bullets: [
            "char name[5] = \"hello\"; is a compile error/warning — \"hello\" needs 6 bytes (5 letters + null terminator), not 5.",
            "strlen(\"hello\") returns 5, but the actual memory used is 6 bytes because of the trailing '\\0'.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char name[6] = "hello"; // exactly enough: 5 chars + \'\\0\'\n    printf("strlen = %zu\\n", strlen(name)); // 5\n    printf("sizeof = %zu\\n", sizeof(name)); // 6\n    return 0;\n}',
          },
        },
        {
          heading: "String Manipulation and the strcpy Buffer-Overflow Trap",
          body:
            "<string.h> provides strcpy, strcat, strcmp, and strlen as the core string-handling toolkit, but strcpy and strcat perform NO bounds checking on the destination buffer — if the source string is longer than the destination buffer, they happily write past its end, corrupting adjacent memory (a classic, historically exploited buffer overflow). The bounded variants strncpy and strncat accept a maximum length argument and are safer, though strncpy has its own gotcha: it does not guarantee null-termination if the source is exactly as long as (or longer than) the limit, so the destination buffer should usually be explicitly null-terminated afterward as a safety net. Comparing strings must always use strcmp (which returns 0 for equality), never == (which compares pointer addresses, not string contents).",
          bullets: [
            "if (str1 == str2) compares whether the two POINTERS are identical, not whether the strings' contents match — always use strcmp(str1, str2) == 0 instead.",
            "strncpy(dest, src, size) truncates safely but may leave dest without a null terminator if src is size characters or longer — add dest[size-1] = '\\0'; defensively.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char buffer[10];\n    strncpy(buffer, "Hello", sizeof(buffer) - 1);\n    buffer[sizeof(buffer) - 1] = \'\\0\'; // defensive null-termination\n\n    if (strcmp(buffer, "Hello") == 0) {\n        printf("Strings match\\n");\n    }\n    return 0;\n}',
          },
        },
        {
          heading: "Structures: Defining and Using struct",
          body:
            "A struct groups several related variables (possibly of different types) under one name, giving each member field its own name accessed with the dot operator (instance.field) or, through a pointer to the struct, the arrow operator (ptr->field, equivalent to (*ptr).field but far more readable). Structures are the primary way C models a single real-world 'thing' with multiple attributes — a point with x and y, a student with a name and a grade — and are passed to functions by value by default, meaning the entire structure is copied unless a pointer to it is passed instead (important for both performance on large structs and for functions that need to modify the caller's struct).",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nstruct Point {\n    int x;\n    int y;\n};\n\nvoid printPoint(const struct Point *p) { // pointer avoids copying the whole struct\n    printf("(%d, %d)\\n", p->x, p->y); // arrow operator through a pointer\n}\n\nint main(void) {\n    struct Point origin = {0, 0};\n    struct Point p1 = {3, 4};\n\n    printf("%d\\n", p1.x); // dot operator on a direct struct value\n    printPoint(&p1);\n    printPoint(&origin);\n    return 0;\n}',
          },
        },
        {
          heading: "Nested Structures and Arrays of Structures",
          body:
            "Structures can contain other structures as members (a Rectangle struct might hold two Point members for its corners), and arrays of structures are a common way to model a collection of records (a roster of Student structs). Accessing a nested field chains the dot operator (rect.topLeft.x), and iterating an array of structs with a for loop is the standard pattern for processing a list of records — each element is a full, independent copy of the struct, so modifying arr[i] never affects any other element.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    char name[30];\n    int grade;\n};\n\nint main(void) {\n    struct Student class[3] = {\n        {"Asha", 88},\n        {"Ravi", 92},\n        {"Meera", 79}\n    };\n\n    for (int i = 0; i < 3; i++) {\n        printf("%s: %d\\n", class[i].name, class[i].grade);\n    }\n    return 0;\n}',
          },
        },
        {
          heading: "typedef and Structure Padding",
          body:
            "typedef creates an alias for a type, most commonly used with structs to avoid repeating the struct keyword everywhere (typedef struct Point Point; lets you write Point p; instead of struct Point p;). Separately, the compiler often inserts invisible padding bytes between struct members to satisfy each member's alignment requirement (a 4-byte int typically must start at an address divisible by 4) — this means sizeof(struct) can be larger than the sum of its members' individual sizes, and reordering members (largest-to-smallest is a common heuristic) can sometimes reduce the total padding and shrink the struct.",
          bullets: [
            "sizeof(struct { char c; int i; }) is often 8, not 5 — 3 padding bytes are inserted after c so that i starts on a 4-byte boundary.",
            "typedef struct { int x, y; } Point; combines the definition and the alias into one statement, a very common idiom.",
          ],
          code: {
            language: "c",
            code:
              "#include <stdio.h>\n\ntypedef struct {\n    int x;\n    int y;\n} Point; // Point is now usable directly, without writing \"struct\"\n\nint main(void) {\n    Point p = {5, 10};\n    printf(\"(%d, %d)\\n\", p.x, p.y);\n    return 0;\n}",
          },
        },
      ],
      commonPitfalls: [
        "Sizing a char buffer for a string's visible length without the extra byte needed for the null terminator.",
        "Using strcpy/strcat on buffers of unknown or untrusted source length instead of the bounds-checked strncpy/strncat.",
        "Comparing C strings with == instead of strcmp(), which compares pointer addresses rather than string contents.",
        "Assuming sizeof(arr) still gives the full array size after the array has decayed into a pointer function parameter.",
        "Forgetting that a 2D array is one contiguous block in row-major order, not an array of independent row pointers.",
        "Assuming a struct's sizeof equals the exact sum of its members' sizes, ignoring compiler-inserted alignment padding.",
        "Passing a large struct by value to a function repeatedly instead of passing a pointer, incurring unnecessary copy overhead.",
      ],
      keyTakeaways: [
        "A C string is a char array ending in a '\\0' byte — always budget one extra byte of buffer space for it.",
        "strcpy/strcat perform no bounds checking; prefer strncpy/strncat and defensively null-terminate the result.",
        "String content comparison requires strcmp(); == on strings compares addresses, not contents.",
        "A 2D array is one contiguous row-major memory block, not an array of separate row pointers.",
        "struct members are accessed with . on a direct value and -> through a pointer (ptr->field is (*ptr).field).",
        "Compiler-inserted padding means sizeof(struct) can exceed the sum of its members' individual sizes.",
      ],
      links: [
        { label: "cppreference — Array declaration", url: "https://en.cppreference.com/w/c/language/array" },
        { label: "GeeksforGeeks — Structures in C", url: "https://www.geeksforgeeks.org/c/structures-in-c/" },
      ],
    },
    {
      moduleTitle: "C Programming",
      subModuleTitle: "File handling & standard library",
      overview:
        "Real programs need to persist data beyond a single run and interact with the system they run on, and C's standard library provides exactly the primitives needed for both — the stdio.h file functions for reading and writing files, and a broader standard library (string.h, stdlib.h, math.h) covering string manipulation, memory allocation, conversions, and math operations that every C program relies on rather than reimplementing. File handling in C is deliberately low-level: you explicitly open a file into a stream, explicitly choose text or binary mode, explicitly check every operation for failure, and explicitly close the stream when finished — none of it happens automatically, which makes understanding the full open-use-check-close discipline essential rather than optional. This sub-module covers file I/O fundamentals, text vs. binary modes, error handling around file operations, a tour of the standard library's other core headers, and command-line arguments.",
      sections: [
        {
          heading: "File I/O Basics: fopen, fclose, and Modes",
          body:
            "fopen(filename, mode) opens a file and returns a FILE* stream handle, or NULL if the file couldn't be opened (doesn't exist, no permission, disk full, etc.) — checking for NULL before using the returned pointer is mandatory, not optional. The mode string controls both the operation (\"r\" read, \"w\" write — truncates any existing file, \"a\" append) and whether to add 'b' for binary mode (\"rb\", \"wb\"). Every successfully opened stream must eventually be closed with fclose(stream), which flushes any buffered writes to disk and releases the underlying OS file handle — forgetting to close a file can mean buffered data never actually reaches disk, not just a resource leak.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nint main(void) {\n    FILE *fp = fopen("notes.txt", "w");\n    if (fp == NULL) {\n        perror("Failed to open notes.txt");\n        return 1;\n    }\n\n    fprintf(fp, "Line 1\\n");\n    fprintf(fp, "Line 2\\n");\n\n    fclose(fp); // flushes buffered writes and releases the file handle\n    return 0;\n}',
          },
        },
        {
          heading: "Reading and Writing: Formatted, Line-Based, and Block I/O",
          body:
            "fprintf/fscanf work like printf/scanf but target a file stream instead of standard output/input, suited to structured text data. fgets(buffer, size, stream) reads one line (up to size-1 characters, stopping at a newline) into buffer and is the safe, bounds-respecting way to read text lines — unlike the deprecated gets(), which has no way to limit how much it reads and is a classic buffer-overflow vector. fread/fwrite transfer raw blocks of bytes (often an entire struct at once) and are the standard tool for binary file I/O, taking the data pointer, the size of one element, the number of elements, and the stream.",
          bullets: [
            "Never use gets() — it has no bounds argument at all and was formally removed from the C11 standard for this reason; use fgets(buf, sizeof(buf), stdin) instead.",
            "fgets keeps the trailing newline character in the buffer (unlike scanf's %s) — strip it manually if it isn't wanted.",
          ],
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    FILE *fp = fopen("notes.txt", "r");\n    if (fp == NULL) { perror("open failed"); return 1; }\n\n    char line[100];\n    while (fgets(line, sizeof(line), fp) != NULL) {\n        line[strcspn(line, "\\n")] = \'\\0\'; // strip the trailing newline\n        printf("Read: %s\\n", line);\n    }\n\n    fclose(fp);\n    return 0;\n}',
          },
        },
        {
          heading: "Error Handling in File Operations",
          body:
            "Every file operation can fail, and C expects the programmer to check for failure explicitly rather than relying on exceptions. fopen returning NULL signals it couldn't open the file at all; feof(stream) reports whether the end of the file has been reached (but only AFTER a read has already attempted to go past the end, not before); ferror(stream) reports whether a genuine read/write error occurred, distinct from simply reaching the end of the file. perror(message) prints a human-readable description of the last system error alongside your own message, which is far more useful for debugging than a generic failure print.",
          bullets: [
            "Checking feof() BEFORE attempting a read (while (!feof(fp))) is a classic bug — it can cause one extra, spurious iteration. Check the read function's own return value instead (while (fgets(...) != NULL)).",
            "perror(\"context message\") appends the OS's actual reason (e.g., 'No such file or directory') automatically, from the errno set by the failed call.",
          ],
        },
        {
          heading: "Binary vs. Text File Modes",
          body:
            "Text mode (\"r\"/\"w\") may translate line-ending characters on some platforms (notably, Windows translates between \\n and \\r\\n), which is invisible and harmless for plain text but corrupts binary data if applied to it. Binary mode (\"rb\"/\"wb\") disables that translation and transfers bytes exactly as they are, which is mandatory for images, serialized structs, or any data where byte-for-byte fidelity matters. On POSIX systems (Linux/macOS) there's no actual difference between the two modes since no translation happens either way, but writing code as if the distinction always matters keeps it portable to Windows.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n\nstruct Record { int id; double value; };\n\nint main(void) {\n    struct Record r = {1, 3.14};\n\n    FILE *fp = fopen("data.bin", "wb"); // binary mode — no text translation\n    if (fp) {\n        fwrite(&r, sizeof(struct Record), 1, fp);\n        fclose(fp);\n    }\n\n    struct Record loaded;\n    fp = fopen("data.bin", "rb");\n    if (fp) {\n        fread(&loaded, sizeof(struct Record), 1, fp);\n        fclose(fp);\n        printf("id=%d value=%.2f\\n", loaded.id, loaded.value);\n    }\n    return 0;\n}',
          },
        },
        {
          heading: "Touring the C Standard Library",
          body:
            "Beyond stdio.h, three headers cover most everyday needs: string.h provides strlen/strcpy/strcmp/strcat and their bounded variants for text manipulation; stdlib.h provides malloc/calloc/realloc/free for dynamic memory, atoi/atof/strtol for parsing numbers out of strings, and qsort/rand for sorting and pseudo-random numbers; math.h provides floating-point functions like sqrt, pow, floor, ceil, and the trigonometric functions, and historically required linking with -lm on Linux/macOS (gcc program.c -lm) since the math implementation sometimes lives in a separate library file from the rest of the standard library.",
          bullets: [
            "atoi(\"42\") returns 42 (int) but silently returns 0 on invalid input with no way to detect the error — strtol is the safer, error-checkable alternative.",
            "qsort(array, count, elementSize, comparatorFunction) sorts any array type via a function pointer comparator, the same pattern covered in the Control Flow sub-module.",
          ],
        },
        {
          heading: "Command-Line Arguments: argc and argv",
          body:
            "A C program can receive arguments typed on the command line by declaring main with the signature int main(int argc, char *argv[]) — argc holds the count of arguments including the program's own name, and argv is an array of C strings holding each argument's text, with argv[0] always being the program's invocation name and argv[argc] guaranteed to be NULL. Numeric arguments arrive as text and must be explicitly converted (with atoi, strtol, or atof) before use in arithmetic — a very common beginner mistake is trying to add argv[1] + argv[2] directly, which adds pointer addresses rather than the numbers they represent as text.",
          code: {
            language: "c",
            code:
              '#include <stdio.h>\n#include <stdlib.h>\n\nint main(int argc, char *argv[]) {\n    if (argc != 3) {\n        fprintf(stderr, "Usage: %s <num1> <num2>\\n", argv[0]);\n        return 1;\n    }\n\n    int a = atoi(argv[1]); // must convert text -> int before arithmetic\n    int b = atoi(argv[2]);\n    printf("Sum = %d\\n", a + b);\n    return 0;\n}\n/* Run as: ./program 3 4   ->  Sum = 7 */',
          },
        },
      ],
      commonPitfalls: [
        "Not checking fopen's return value for NULL before using the stream, causing a crash on a missing or inaccessible file.",
        "Using the deprecated, unbounded gets() instead of fgets() with an explicit buffer size.",
        "Checking feof() before attempting a read instead of checking the read function's own return value, causing a spurious extra iteration.",
        "Opening binary data (images, structs) in text mode, risking silent byte corruption from newline translation on some platforms.",
        "Forgetting to fclose() an opened file, risking buffered writes never being flushed to disk.",
        "Treating argv elements as numbers directly in arithmetic without first converting them from text with atoi/strtol/atof.",
        "Using atoi for input validation when it silently returns 0 for invalid text instead of signaling an error — strtol with error checking is safer.",
      ],
      keyTakeaways: [
        "Always check fopen's return value for NULL, and always pair a successful fopen with a matching fclose.",
        "fgets with an explicit size is the safe replacement for the removed, unbounded gets().",
        "Check a read operation's own return value to detect end-of-file/errors — don't rely on feof() checked before the read.",
        "Binary mode (\"rb\"/\"wb\") prevents newline-translation corruption of non-text data; always use it for struct/image/raw-byte I/O.",
        "stdlib.h's atoi/strtol/atof convert command-line text arguments into usable numeric types before arithmetic.",
        "main(int argc, char *argv[]) is the standard way to receive command-line arguments, with argv[0] always the program name.",
      ],
      links: [
        { label: "cppreference — C File I/O", url: "https://en.cppreference.com/w/c/io" },
        { label: "GeeksforGeeks — File Handling in C", url: "https://www.geeksforgeeks.org/c/basics-file-handling-c/" },
      ],
    },

    // ───────────────────────────── C++ Programming ─────────────────────────────
    {
      moduleTitle: "C++ Programming",
      subModuleTitle: "C++ fundamentals & OOP",
      overview:
        "C++ began as 'C with Classes' and still compiles the overwhelming majority of valid C, but it layers on an enormous set of features — references, function overloading, namespaces, a safer and more expressive I/O system, and ultimately full object-oriented programming — that change idiomatic style so much that experienced C++ code often looks nothing like the C it's built on. This sub-module bridges that gap: it covers exactly what C++ adds on top of C syntax and semantics (references, overloading, default arguments, namespaces, streams) and previews the class-based OOP model that the next sub-module covers in full depth. Getting comfortable with these additions first is what makes the jump into classes, inheritance, and templates later feel like a natural extension rather than an entirely new language.",
      sections: [
        {
          heading: "From C to C++: What's New at the Language Level",
          body:
            "C++ adds true references, function and operator overloading, default function arguments, namespaces to avoid name collisions between libraries, a real bool type (built in since the start, unlike C's later stdbool.h addition), and the iostream-based cin/cout for input/output instead of printf/scanf's format-string approach. It also tightens some of C's looser rules — C++ requires every function to be declared/defined before use with no implicit-int fallback, and enforces stricter type checking around void* conversions — trading a small amount of C's flexibility for a large amount of compile-time safety.",
          bullets: [
            "bool, true, and false are built-in keywords in C++ (C only gained them via <stdbool.h> in C99, and even then as macros for _Bool).",
            "C++ requires an explicit cast when converting void* to another pointer type; C allows it implicitly.",
          ],
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nint main() {\n    bool isReady = true;\n    std::cout << "Ready: " << isReady << "\\n"; // prints 1 (bool prints as 0/1 by default)\n    return 0;\n}',
          },
        },
        {
          heading: "References vs. Pointers",
          body:
            "A reference (int &r = x;) is an alias for an existing variable — once bound, it can never be rebound to refer to anything else, and it can never be null, unlike a pointer which can be reassigned freely and can be null. References are overwhelmingly used as function parameters to avoid copying large objects while still allowing the function to read (const int&) or modify (int&) the caller's actual argument, which is more readable at the call site than pointer syntax (no & needed when calling, no * needed to use it inside the function). A reference must be initialized at the moment it's declared — there's no such thing as an uninitialized, 'null' reference waiting to be bound later.",
          bullets: [
            "A reference parameter (void f(int &x)) lets a function modify the caller's variable with plain function-call syntax — no &x at the call site, no *x inside the function.",
            "Never return a reference to a local variable — it refers to stack memory that no longer exists once the function returns, producing a dangling reference.",
          ],
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nvoid increment(int &x) { // reference parameter — modifies the caller\'s variable directly\n    x++;\n}\n\nint main() {\n    int value = 5;\n    increment(value); // no & needed at the call site\n    std::cout << value << "\\n"; // 6\n    return 0;\n}',
          },
        },
        {
          heading: "Function Overloading and Default Arguments",
          body:
            "C++ allows multiple functions to share the same name as long as their parameter lists differ in type or count — the compiler picks the best match at compile time based on the arguments supplied, a feature C does not have at all (C requires every function name to be globally unique). Default arguments let a parameter be omitted at the call site, using a specified fallback value instead — useful for optional configuration parameters without needing a whole family of overloads just to vary one setting. Default arguments must be specified from right to left (once one parameter has a default, every parameter after it must also have one).",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nint add(int a, int b) { return a + b; }\ndouble add(double a, double b) { return a + b; } // overload: different parameter types\n\nvoid greet(const std::string &name, const std::string &greeting = "Hello") {\n    std::cout << greeting << ", " << name << "!\\n";\n}\n\nint main() {\n    std::cout << add(2, 3) << "\\n";       // 5    — calls the int version\n    std::cout << add(2.5, 3.5) << "\\n";   // 6    — calls the double version\n    greet("Asha");                        // uses the default greeting "Hello"\n    greet("Ravi", "Welcome");              // overrides the default\n    return 0;\n}',
          },
        },
        {
          heading: "Classes 101: Grouping Data and Behavior",
          body:
            "A C++ class bundles data members (variables) together with member functions (behavior that operates on that data) into a single type — the central idea of encapsulation, where an object's internal state is manipulated only through a defined set of functions rather than accessed arbitrarily from anywhere in the program. Where a C struct is purely a bundle of data, a C++ class (and, in fact, a C++ struct too, which supports exactly the same features) can additionally hide data behind private access and expose only a controlled public interface. The next sub-module goes deep on constructors, inheritance, and polymorphism; this is just enough to make sense of iostream's std::cout being an object, and std::string being a class, not a primitive.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n#include <string>\n\nclass Greeter {\npublic:\n    Greeter(const std::string &name) : name_(name) {} // constructor\n    void sayHello() const { std::cout << "Hello, " << name_ << "!\\n"; }\nprivate:\n    std::string name_; // hidden from outside the class\n};\n\nint main() {\n    Greeter g("Priya");\n    g.sayHello(); // Hello, Priya!\n    return 0;\n}',
          },
        },
        {
          heading: "Namespaces and the std Namespace",
          body:
            "A namespace groups related names (classes, functions, variables) under a common prefix to prevent collisions between identically-named things from different libraries — the entire standard library lives inside namespace std, which is why std::cout and std::string need the std:: qualifier (or a using declaration) to be found. using namespace std; imports every name from std unqualified, which is convenient in small example programs but considered poor practice in headers or larger codebases, since it reintroduces exactly the name-collision risk namespaces exist to prevent; a targeted using std::cout; (importing only what's actually needed) is the safer middle ground.",
          bullets: [
            "Never write 'using namespace std;' at the top of a header file — it pollutes every file that includes that header with the entire std namespace.",
            "std::cout, std::cin, std::string, std::vector — every standard-library name is namespaced under std to avoid colliding with your own code's names.",
          ],
        },
        {
          heading: "Input/Output Streams: cin and cout",
          body:
            "C++ streams replace printf/scanf's format-string approach with a type-safe, chainable operator-based syntax: << inserts a value into an output stream (std::cout << x), and >> extracts a value from an input stream into a variable (std::cin >> x) — the compiler picks the correct formatting/parsing behavior for each type automatically via operator overloading, eliminating the entire category of printf format-specifier mismatches (like using %d for a double) that plague C. Chaining multiple << or >> calls in one statement is idiomatic and reads left to right in the order values are inserted or extracted.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nint main() {\n    int age;\n    std::string name;\n\n    std::cout << "Enter your name: ";\n    std::cin >> name;\n    std::cout << "Enter your age: ";\n    std::cin >> age;\n\n    std::cout << name << " is " << age << " years old.\\n"; // chained <<\n    return 0;\n}',
          },
        },
        {
          heading: "RAII: Resource Acquisition Is Initialization",
          body:
            "RAII is the single most important idiom in idiomatic C++: tie a resource's lifetime (memory, a file handle, a mutex lock) to an object's lifetime, acquiring the resource in the constructor and releasing it automatically in the destructor, so the resource is guaranteed to be released when the object goes out of scope — even if an exception is thrown partway through a function, something C's manual malloc/free discipline has no automatic answer for. std::string and std::vector are everyday examples: they manage their own internal heap memory via RAII, which is exactly why C++ code using them almost never calls new or delete directly. Memory management & smart pointers (a later sub-module) extends this same idea to general dynamic allocation.",
          bullets: [
            "An object's destructor runs automatically when it goes out of scope — this is the mechanism RAII relies on, and it runs even if an exception unwinds the stack.",
            "std::string, std::vector, std::ifstream, and std::lock_guard are all everyday standard-library RAII types — none of them require you to manually release anything.",
          ],
        },
      ],
      commonPitfalls: [
        "Writing 'using namespace std;' inside a header file, polluting every translation unit that includes it.",
        "Returning a reference to a local (stack) variable from a function, producing a dangling reference once the function returns.",
        "Forgetting that a reference must be initialized when declared and can never be rebound to a different variable afterward.",
        "Expecting C++ function overloading to work based on return type alone — overload resolution only considers parameter types.",
        "Mixing scanf/printf-style formatting habits into cin/cout code, missing the type-safety benefit streams actually provide.",
        "Manually managing memory with new/delete out of old C habits instead of relying on RAII types like std::string and std::vector.",
      ],
      keyTakeaways: [
        "References are non-null, non-rebindable aliases — prefer them over pointers for function parameters that don't need to be optional or reseatable.",
        "Function overloading resolves by parameter types at compile time; C has no equivalent feature.",
        "Namespaces (and the std:: prefix) prevent name collisions — avoid 'using namespace std;' in headers.",
        "cin/cout use type-safe operator overloading (<<, >>), eliminating printf/scanf's format-specifier mismatch bugs.",
        "RAII ties resource lifetime to object lifetime via constructors/destructors — it's the foundation nearly all idiomatic modern C++ resource management builds on.",
      ],
      links: [
        { label: "cppreference — C++ Language Reference", url: "https://en.cppreference.com/w/cpp/language" },
        { label: "learncpp.com — Introduction to C++", url: "https://www.learncpp.com/" },
      ],
    },
    {
      moduleTitle: "C++ Programming",
      subModuleTitle: "Classes, inheritance & polymorphism",
      overview:
        "Classes, inheritance, and polymorphism are the heart of object-oriented C++, and they're also where the language's most consequential and most frequently mis-learned rules live: when a destructor must be virtual, what the Rule of Three actually protects against, and why forgetting override on a derived method can silently produce a completely different (and wrong) function signature instead of a compile error. This sub-module goes deep on class anatomy and constructor behavior, the Rule of Three for classes that manage a resource, public inheritance and access control across a hierarchy, virtual functions and how dynamic dispatch actually works at runtime, abstract base classes, the specific danger of a non-virtual destructor, the diamond problem in multiple inheritance, and operator overloading — each anchored in a compilable example so the underlying mechanism, not just the keyword, sticks.",
      sections: [
        {
          heading: "Class Anatomy: Access Specifiers, Constructors, and Destructors",
          body:
            "A class's members default to private visibility (a struct's default to public — the only structural difference between the two keywords in C++), and public/protected/private sections can appear in any order and any number of times within a class body. A constructor (same name as the class, no return type) runs automatically when an object is created and is responsible for establishing a valid initial state; a destructor (~ClassName()) runs automatically when the object is destroyed (goes out of scope, or is deleted) and is responsible for releasing any resources the object acquired. Both are optional — the compiler generates a default (no-argument) constructor and a default destructor if none is written, but only the default constructor disappears silently the moment you define ANY constructor yourself.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nclass Account {\npublic:\n    Account(double initialBalance) : balance_(initialBalance) {\n        std::cout << "Account opened with balance " << balance_ << "\\n";\n    }\n    ~Account() {\n        std::cout << "Account closed, final balance " << balance_ << "\\n";\n    }\n    void deposit(double amount) { balance_ += amount; }\nprivate:\n    double balance_;\n};\n\nint main() {\n    Account a(100.0);\n    a.deposit(50.0);\n    return 0; // destructor runs automatically here\n}',
          },
        },
        {
          heading: "Constructor Initialization Lists and the Rule of Three",
          body:
            "Member initializer lists (ClassName(int x) : member_(x) {}) initialize members directly in the order they're DECLARED in the class (not the order listed in the initializer list — mismatched order only produces a compiler warning, which is easy to miss), and are mandatory for const members, reference members, and base-class constructors that take arguments. The Rule of Three states that if a class defines any one of a custom destructor, copy constructor, or copy-assignment operator, it almost always needs to define all three — because the default compiler-generated versions of the other two will do a shallow, member-by-member copy that's wrong for any class managing a resource like raw heap memory, leading to double-frees or dangling pointers when two objects end up pointing at the same resource.",
          bullets: [
            "If a class manually manages a raw resource (new/delete, a file handle), the compiler-generated copy constructor's default shallow copy is almost always a bug waiting to happen.",
            "Modern C++ guidance is actually the 'Rule of Zero': avoid manual resource management entirely by using RAII types (std::string, std::vector, smart pointers) as members, so the compiler-generated special members are correct by construction.",
          ],
        },
        {
          heading: "Inheritance: Base and Derived Classes",
          body:
            "class Derived : public Base establishes an is-a relationship — a Derived object contains a full Base object as its foundation and can be used anywhere a Base is expected (via a Base pointer or reference). public inheritance (overwhelmingly the most common) preserves each base member's original access level in the derived class; protected inheritance downgrades public base members to protected; private inheritance makes all inherited members private in the derived class. A derived class's constructor must initialize its base class portion, either implicitly (calling Base's default constructor) or explicitly via the initializer list when Base requires arguments.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nclass Animal {\npublic:\n    Animal(const std::string &name) : name_(name) {}\n    void sleep() const { std::cout << name_ << " is sleeping.\\n"; }\nprotected:\n    std::string name_;\n};\n\nclass Dog : public Animal {\npublic:\n    Dog(const std::string &name) : Animal(name) {} // must initialize the base class\n    void bark() const { std::cout << name_ << " says Woof!\\n"; } // protected member accessible here\n};\n\nint main() {\n    Dog d("Rex");\n    d.sleep(); // inherited from Animal\n    d.bark();  // defined in Dog\n    return 0;\n}',
          },
        },
        {
          heading: "Virtual Functions and Dynamic Dispatch",
          body:
            "Marking a base class member function virtual tells the compiler that calls to it through a base-class pointer or reference should be resolved at RUNTIME based on the object's actual (most-derived) type, not its static (declared) type — this is dynamic dispatch, and it's what makes polymorphism work: a single Animal* could point at a Dog or a Cat, and calling a virtual makeSound() on it invokes whichever override actually matches the real object. The override keyword on a derived class's overriding function is not required by the compiler but should always be used anyway — it makes the compiler verify the function genuinely overrides a matching virtual base function, catching signature mismatches (a wrong parameter type, a missing const) that would otherwise silently create an unrelated new function instead of an override.",
          bullets: [
            "Without virtual, calling a function through a Base* always calls Base's version, even if the object is actually a Derived — this is static dispatch, resolved at compile time.",
            "Always add override on every intended overriding function — it turns a silent 'accidentally created a new function' bug into a compile error.",
          ],
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nclass Shape {\npublic:\n    virtual double area() const { return 0.0; }\n    virtual ~Shape() = default; // virtual destructor — see next section\n};\n\nclass Circle : public Shape {\npublic:\n    Circle(double r) : radius_(r) {}\n    double area() const override { return 3.14159 * radius_ * radius_; }\nprivate:\n    double radius_;\n};\n\nint main() {\n    Shape *s = new Circle(2.0);\n    std::cout << s->area() << "\\n"; // 12.566... — dynamic dispatch picks Circle::area\n    delete s;\n    return 0;\n}',
          },
        },
        {
          heading: "Abstract Classes and Pure Virtual Functions",
          body:
            "A pure virtual function (virtual double area() const = 0;) has no implementation in its base class and forces every concrete derived class to provide one — a class containing at least one pure virtual function becomes an abstract class that cannot be instantiated directly, only used as a base for derived classes that implement all of its pure virtual functions. Abstract classes are how C++ expresses an interface-like contract: 'every Shape must know how to compute its own area, but Shape itself doesn't know how, because it depends entirely on which specific shape it is.'",
          code: {
            language: "cpp",
            code:
              'class Shape {\npublic:\n    virtual double area() const = 0; // pure virtual — no implementation, no body\n    virtual ~Shape() = default;\n};\n\n// Shape s; // COMPILE ERROR — cannot instantiate an abstract class\n\nclass Square : public Shape {\npublic:\n    Square(double side) : side_(side) {}\n    double area() const override { return side_ * side_; } // required implementation\nprivate:\n    double side_;\n};',
          },
        },
        {
          heading: "Virtual Destructors and Polymorphic Deletion",
          body:
            "If a base class will ever be deleted through a base-class pointer that might actually point to a derived object (exactly the Shape *s = new Circle(...); delete s; pattern above), the base class's destructor MUST be virtual — otherwise delete s only runs Shape's destructor, never Circle's, silently skipping any cleanup Circle's destructor was responsible for and producing a resource leak or worse. This single rule — 'if a class has any virtual function, give it a virtual destructor too' — is one of the most important and most frequently violated rules in C++ class design, and most style guides and static analyzers flag a non-virtual destructor in a class with virtual functions as an error-level issue, not a mere suggestion.",
          bullets: [
            "Rule of thumb: a base class intended for polymorphic use should ALWAYS declare virtual ~ClassName() = default;, even if it does nothing else special.",
            "Deleting a derived object through a non-virtual base-class destructor is undefined behavior — it typically runs only the base destructor, leaking any derived-only resources.",
          ],
        },
        {
          heading: "Multiple Inheritance and the Diamond Problem",
          body:
            "C++ allows a class to inherit from more than one base class simultaneously, which creates the classic 'diamond problem' when two base classes both inherit from a common ancestor: a derived class inheriting from both ends up with two separate copies of that common ancestor's data unless virtual inheritance (class B : virtual public A) is used to ensure only one shared copy exists. Multiple inheritance is powerful but genuinely tricky to reason about correctly, and in modern C++ it is generally reserved for mixing in small, focused interface-like abstract classes rather than combining multiple classes that each carry their own real state.",
          code: {
            language: "cpp",
            code:
              'class Animal { public: std::string name; };\nclass Swimmer : virtual public Animal {};  // virtual inheritance\nclass Flyer   : virtual public Animal {};   // shares ONE Animal, not two\nclass Duck    : public Swimmer, public Flyer {}; // diamond — resolved by virtual inheritance',
          },
        },
        {
          heading: "Operator Overloading",
          body:
            "C++ lets you define what the built-in operators mean for your own class types — overloading operator+ to add two Vector2D objects component-wise, for instance — which lets custom types participate in natural, readable expressions instead of requiring named methods like .add(other) for every operation. Overloaded operators should behave the way users intuitively expect from the built-in types (operator== should actually test equality, operator+ shouldn't have side effects), and are typically implemented as either member functions (when the left operand is always the class itself) or free functions (needed when the left operand might be a different type, like a plain number).",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nclass Vector2D {\npublic:\n    Vector2D(double x, double y) : x_(x), y_(y) {}\n    Vector2D operator+(const Vector2D &other) const {\n        return Vector2D(x_ + other.x_, y_ + other.y_);\n    }\n    void print() const { std::cout << "(" << x_ << ", " << y_ << ")\\n"; }\nprivate:\n    double x_, y_;\n};\n\nint main() {\n    Vector2D a(1, 2), b(3, 4);\n    Vector2D c = a + b; // calls operator+\n    c.print();          // (4, 6)\n    return 0;\n}',
          },
        },
      ],
      commonPitfalls: [
        "Giving a base class virtual functions but a non-virtual destructor, causing derived-class cleanup to be silently skipped on polymorphic deletion.",
        "Omitting the override keyword, so a signature mismatch creates an unrelated new function instead of a compile-time error.",
        "Relying on the compiler-generated copy constructor/assignment for a class that manually manages a raw resource, causing shallow-copy double-frees.",
        "Passing or returning a derived object by value through a base-class-typed parameter/variable, causing object slicing that discards the derived portion.",
        "Instantiating a class containing pure virtual functions by forgetting one of them is still unimplemented in a 'concrete' derived class.",
        "Using multiple inheritance without virtual inheritance when two bases share a common ancestor, duplicating that ancestor's state unexpectedly.",
      ],
      keyTakeaways: [
        "A base class used polymorphically must have a virtual destructor, or derived-class cleanup is silently skipped.",
        "Always write override on intended overriding functions — it converts silent signature-mismatch bugs into compile errors.",
        "The Rule of Three (destructor, copy constructor, copy assignment) applies to any class manually managing a resource; the Rule of Zero (avoid manual management via RAII members) is the preferred modern alternative.",
        "Pure virtual functions (= 0) make a class abstract, uninstantiable until every pure virtual function is implemented by a derived class.",
        "Virtual inheritance resolves the diamond problem by ensuring only one shared copy of a common base exists.",
        "Operator overloading should match the operator's built-in intuitive meaning, not repurpose it for unrelated behavior.",
      ],
      links: [
        { label: "cppreference — Classes", url: "https://en.cppreference.com/w/cpp/language/classes" },
        { label: "cppreference — Virtual function specifier", url: "https://en.cppreference.com/w/cpp/language/virtual" },
        { label: "isocpp.org — C++ FAQ", url: "https://isocpp.org/faq" },
      ],
    },
    {
      moduleTitle: "C++ Programming",
      subModuleTitle: "STL — containers & algorithms",
      overview:
        "The Standard Template Library (STL) is the single biggest productivity multiplier in modern C++: a battle-tested, highly optimized set of generic containers (vector, map, set, and more) and algorithms (sort, find, transform) that eliminate the need to hand-roll data structures the way C programmers routinely must. Knowing the STL well is as much about judgment as syntax — picking vector vs. list vs. deque, or map vs. unordered_map, has real, sometimes dramatic performance consequences depending on the access pattern a program actually needs. This sub-module covers the core sequence and associative containers, iterators and the invalidation rules that trip up even experienced C++ developers, the algorithms library's composable function-based design, lambda expressions as the modern way to supply custom logic to an algorithm, and practical guidance for choosing the right container.",
      sections: [
        {
          heading: "Sequence Containers: vector, deque, and list",
          body:
            "std::vector is a dynamically resizable array stored contiguously in memory, giving O(1) random access by index and excellent cache performance, but inserting or removing anywhere except the end is O(n) because every following element must shift. std::deque (double-ended queue) supports O(1) insertion/removal at both ends (unlike vector, which is only efficient at the end) at the cost of non-contiguous storage internally. std::list is a doubly-linked list giving O(1) insertion/removal anywhere once you have an iterator to the position, but O(n) random access and worse cache locality than vector — in practice, vector is the correct default choice unless you have a specific, measured reason to reach for list or deque.",
          code: {
            language: "cpp",
            code:
              '#include <vector>\n#include <iostream>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3};\n    nums.push_back(4);      // O(1) amortized — append at the end\n    nums.insert(nums.begin(), 0); // O(n) — shifts every element right\n\n    for (int n : nums) std::cout << n << " "; // 0 1 2 3 4\n    std::cout << "\\n";\n    return 0;\n}',
          },
        },
        {
          heading: "Associative Containers: map, set, and unordered_map",
          body:
            "std::map stores unique keys in sorted order (by default, ascending) with O(log n) lookup/insert/erase, implemented internally as a balanced binary search tree — iterating a map always visits keys in sorted order. std::unordered_map trades that ordering guarantee for average O(1) lookup/insert/erase via hashing, making it the right default when insertion order and key ordering don't matter and raw speed does. std::set and std::unordered_set are the equivalent structures for storing unique values with no associated mapped value, used whenever you need fast membership testing ('have I seen this value before?') without duplicates.",
          code: {
            language: "cpp",
            code:
              '#include <unordered_map>\n#include <iostream>\n\nint main() {\n    std::unordered_map<std::string, int> ages;\n    ages["Asha"] = 30;\n    ages["Ravi"] = 25;\n\n    if (ages.find("Asha") != ages.end()) {\n        std::cout << "Asha is " << ages["Asha"] << "\\n"; // Asha is 30\n    }\n\n    for (const auto &pair : ages) { // order is unspecified for unordered_map\n        std::cout << pair.first << ": " << pair.second << "\\n";\n    }\n    return 0;\n}',
          },
        },
        {
          heading: "Iterators and Iterator Invalidation",
          body:
            "An iterator is a generic 'pointer-like' object that can traverse any container uniformly — begin() returns an iterator to the first element, end() returns a sentinel one-past-the-last-element iterator, and ++it advances it — the same interface works whether the underlying container is a vector, a list, or a map. The critical gotcha is iterator invalidation: operations that resize or reallocate a container's internal storage (vector's push_back when capacity is exceeded, or erase on most containers) can invalidate some or all existing iterators, pointers, and references into that container — continuing to use an invalidated iterator is undefined behavior, and erase's own return value (a valid iterator to the next element) is the standard, safe way to keep iterating after removing an element.",
          bullets: [
            "After any vector reallocation (triggered by push_back exceeding current capacity), every previously held iterator, pointer, and reference into that vector is invalidated.",
            "it = container.erase(it); (reassigning from erase's return value) is the correct pattern for removing elements while iterating — incrementing an iterator just erased is undefined behavior.",
          ],
          code: {
            language: "cpp",
            code:
              '#include <vector>\n#include <iostream>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3, 4, 5};\n\n    // Remove all even numbers, using erase\'s return value to stay valid\n    for (auto it = nums.begin(); it != nums.end(); ) {\n        if (*it % 2 == 0) {\n            it = nums.erase(it); // erase returns the next valid iterator\n        } else {\n            ++it;\n        }\n    }\n\n    for (int n : nums) std::cout << n << " "; // 1 3 5\n    std::cout << "\\n";\n    return 0;\n}',
          },
        },
        {
          heading: "The Algorithms Library",
          body:
            "<algorithm> provides generic, container-agnostic functions that operate on a range specified by a pair of iterators (begin, end) — std::sort sorts a range in place, std::find searches linearly for a value and returns an iterator to it (or end() if not found), std::transform applies a function to every element and writes the results to a destination, and std::accumulate (in <numeric>) folds a range down to a single value (like a running sum). Because these algorithms work on iterator ranges rather than specific container types, the exact same std::sort call works identically on a vector, a deque, or a plain array — this uniformity is the core design principle of the STL.",
          code: {
            language: "cpp",
            code:
              '#include <vector>\n#include <algorithm>\n#include <numeric>\n#include <iostream>\n\nint main() {\n    std::vector<int> nums = {5, 3, 1, 4, 2};\n\n    std::sort(nums.begin(), nums.end()); // 1 2 3 4 5\n\n    auto it = std::find(nums.begin(), nums.end(), 3);\n    if (it != nums.end()) std::cout << "Found 3 at index " << (it - nums.begin()) << "\\n";\n\n    int total = std::accumulate(nums.begin(), nums.end(), 0); // sum = 15\n    std::cout << "Sum = " << total << "\\n";\n    return 0;\n}',
          },
        },
        {
          heading: "Lambda Expressions as Predicates and Comparators",
          body:
            "A lambda expression ([capture](parameters) { body }) defines an unnamed, inline function object, and is the standard modern way to supply custom comparison or filtering logic to an algorithm without writing a separate named function or functor class. The capture clause controls which outer variables the lambda can access and how ([x] captures x by value/copy, [&x] captures it by reference, [&] captures everything used by reference, [=] captures everything used by value) — getting capture-by-reference wrong when the lambda outlives the captured variable is a common source of dangling-reference bugs, exactly analogous to returning a reference to a local variable.",
          code: {
            language: "cpp",
            code:
              '#include <vector>\n#include <algorithm>\n#include <iostream>\n\nint main() {\n    std::vector<int> nums = {5, 3, 1, 4, 2};\n\n    // Sort descending using a lambda comparator\n    std::sort(nums.begin(), nums.end(), [](int a, int b) { return a > b; });\n    for (int n : nums) std::cout << n << " "; // 5 4 3 2 1\n    std::cout << "\\n";\n\n    int threshold = 3;\n    auto it = std::find_if(nums.begin(), nums.end(),\n                            [threshold](int n) { return n < threshold; }); // captures by value\n    if (it != nums.end()) std::cout << "First below threshold: " << *it << "\\n";\n    return 0;\n}',
          },
        },
        {
          heading: "Choosing the Right Container",
          body:
            "The practical default is std::vector unless a specific access pattern justifies otherwise: need fast lookup by a key, don't care about order → unordered_map/unordered_set; need sorted iteration order → map/set; need fast insertion/removal at both ends → deque; need fast insertion/removal in the MIDDLE with stable iterators to other elements → list (rare in practice). Measuring with real data and a profiler beats guessing — vector is cache-friendly enough that it frequently outperforms list even for insertions in the middle, for all but fairly large element counts, because of how much contiguous memory access benefits modern CPU caches.",
          bullets: [
            "Default to vector; only reach for another container once you have a specific, measured performance reason.",
            "map/set guarantee sorted iteration order at O(log n) operations; unordered_map/unordered_set trade that ordering away for average O(1) operations.",
          ],
        },
        {
          heading: "Range-Based for Loops and auto",
          body:
            "The range-based for loop (for (auto &elem : container)) iterates any container that provides begin()/end() without manually managing an iterator at all, and is the idiomatic default for simple traversal when the index itself isn't needed. Using auto for the element type avoids both verbose type names (std::unordered_map<std::string, std::vector<int>>::iterator) and subtle copy bugs — for (auto elem : container) copies each element, while for (auto &elem : container) binds a reference and avoids the copy (use const auto & when you don't need to modify elements, to additionally prevent accidental mutation).",
          code: {
            language: "cpp",
            code:
              '#include <vector>\n#include <string>\n#include <iostream>\n\nint main() {\n    std::vector<std::string> names = {"Asha", "Ravi", "Meera"};\n\n    for (const auto &name : names) { // reference avoids copying each string\n        std::cout << name << "\\n";\n    }\n    return 0;\n}',
          },
        },
      ],
      commonPitfalls: [
        "Continuing to use a vector iterator, pointer, or reference after an operation (push_back past capacity, erase, insert) that invalidated it.",
        "Incrementing an iterator just passed to erase() instead of reassigning from erase's return value.",
        "Defaulting to std::list for 'fast insertion' without measuring — std::vector's cache locality frequently wins even for middle insertions at realistic sizes.",
        "Using std::map when insertion-order or sorted-order isn't actually needed, paying O(log n) instead of unordered_map's average O(1).",
        "Capturing a local variable by reference in a lambda that outlives the variable's scope, producing a dangling reference when the lambda is later invoked.",
        "Calling container[key] on a map/unordered_map just to check existence — operator[] silently inserts a default-constructed entry for a missing key.",
      ],
      keyTakeaways: [
        "std::vector is the correct default container; reach for deque, list, map, or unordered_map only for a specific, justified access pattern.",
        "Operations that resize/reallocate a container can invalidate existing iterators, pointers, and references into it — know which operations do this for your chosen container.",
        "map/set guarantee sorted order at O(log n); unordered_map/unordered_set trade ordering for average O(1) operations.",
        "Algorithms in <algorithm> operate on iterator ranges, making the same function work uniformly across different container types.",
        "Lambda capture-by-reference must never outlive the captured variable — the same dangling-reference risk as returning a reference to a local.",
      ],
      links: [
        { label: "cppreference — Containers library", url: "https://en.cppreference.com/w/cpp/container" },
        { label: "cppreference — Algorithms library", url: "https://en.cppreference.com/w/cpp/algorithm" },
      ],
    },
    {
      moduleTitle: "C++ Programming",
      subModuleTitle: "Templates & generic programming",
      overview:
        "Templates are how C++ achieves generic programming — writing a single function or class that works correctly across many different types, with the compiler generating a specialized version for each type actually used, rather than relying on runtime type erasure the way some other languages' generics do. This compile-time instantiation model is both templates' greatest strength (zero runtime overhead, full type safety, aggressive optimization opportunity for the compiler) and their most common source of confusion for newcomers, especially around where template code must physically live and the sometimes-cryptic errors that come from an incompatible type being substituted in. This sub-module covers function and class templates, how type deduction works, template specialization for special-casing specific types, variadic templates for accepting an arbitrary number of arguments, constexpr for compile-time computation, and a brief, practical look at C++20 concepts for constraining what types a template accepts.",
      sections: [
        {
          heading: "Function Templates",
          body:
            "A function template (template <typename T> T myMax(T a, T b) { ... }) defines a blueprint the compiler uses to generate an actual, concrete function for each distinct type T it's called with — calling myMax(3, 5) instantiates an int version, and myMax(3.5, 2.1) instantiates a separate double version, each compiled and type-checked independently as if you'd written them by hand. This is fundamentally different from a language with type erasure: there's no single 'generic' myMax function at runtime, only however many concrete instantiations the compiler actually generated based on real call sites in your program, which is why a template that's never called with a given type never generates (or needs to compile) code for that type.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\ntemplate <typename T>\nT myMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    std::cout << myMax(3, 5) << "\\n";       // instantiates myMax<int>\n    std::cout << myMax(3.5, 2.1) << "\\n";   // instantiates myMax<double>\n    std::cout << myMax(std::string("apple"), std::string("banana")) << "\\n"; // myMax<std::string>\n    return 0;\n}',
          },
        },
        {
          heading: "Class Templates",
          body:
            "A class template parameterizes an entire class on one or more types, letting a single Stack<T> definition serve as a stack of ints, a stack of strings, or a stack of any other type — std::vector<T> itself is exactly this pattern, a class template the standard library ships rather than a built-in language feature. Member functions of a class template are themselves templates in disguise and, like function templates, are only compiled for the specific T's the class is actually instantiated with in your program, which is why class template definitions are almost always written entirely in header files rather than split into separate .cpp files the way ordinary classes are.",
          code: {
            language: "cpp",
            code:
              '#include <vector>\n#include <iostream>\n\ntemplate <typename T>\nclass Stack {\npublic:\n    void push(const T &value) { data_.push_back(value); }\n    void pop() { data_.pop_back(); }\n    const T &top() const { return data_.back(); }\n    bool empty() const { return data_.empty(); }\nprivate:\n    std::vector<T> data_;\n};\n\nint main() {\n    Stack<int> intStack;\n    intStack.push(1);\n    intStack.push(2);\n    std::cout << intStack.top() << "\\n"; // 2\n\n    Stack<std::string> stringStack;\n    stringStack.push("hello");\n    std::cout << stringStack.top() << "\\n"; // hello\n    return 0;\n}',
          },
        },
        {
          heading: "Template Type Deduction",
          body:
            "When calling a function template, the compiler usually infers (deduces) the template type parameter directly from the arguments supplied, so myMax(3, 5) doesn't need to be written as myMax<int>(3, 5) — the explicit form is only needed when the types can't be deduced unambiguously, such as when the two arguments have genuinely different types and neither should implicitly convert to the other. auto, introduced for ordinary variables, uses a closely related deduction mechanism: auto x = myMax(3, 5); infers x's type from the function's return value, which is especially useful when that return type is long or itself template-dependent.",
          bullets: [
            "myMax(3, 5.0) is a compile error (or forces an explicit myMax<double>(3, 5.0)) because the two arguments are different types and T can't be deduced as both int and double simultaneously.",
            "auto combined with a templated return type avoids having to spell out complex, nested template type names explicitly.",
          ],
        },
        {
          heading: "Template Specialization",
          body:
            "Full specialization lets you provide a completely different implementation for one specific type, overriding the generic template entirely for that case — useful when the generic logic genuinely doesn't make sense or isn't optimal for a particular type (comparing C-style char* strings with > doesn't compare their contents the way a generic myMax expects, so a specialization for char* using strcmp would fix that specific case). Partial specialization (available for class templates, not function templates) specializes for a pattern of types rather than one exact type, such as specializing a container template specifically for pointer types to add pointer-specific behavior.",
          code: {
            language: "cpp",
            code:
              '#include <cstring>\n#include <iostream>\n\ntemplate <typename T>\nT myMax(T a, T b) { return (a > b) ? a : b; }\n\n// Full specialization for const char* — compares string CONTENTS, not pointer addresses\ntemplate <>\nconst char *myMax<const char *>(const char *a, const char *b) {\n    return (std::strcmp(a, b) > 0) ? a : b;\n}\n\nint main() {\n    std::cout << myMax(3, 7) << "\\n";                 // 7 — generic version\n    std::cout << myMax("apple", "banana") << "\\n";    // banana — specialized version\n    return 0;\n}',
          },
        },
        {
          heading: "Variadic Templates",
          body:
            "A variadic template (template <typename... Args>) accepts an arbitrary, unspecified number of template arguments, which is how functions like printf-replacement logging utilities or std::make_unique can accept any number of constructor arguments of any types. Processing a parameter pack typically uses recursion (peel off one argument, recurse on the rest, with a base case for zero or one remaining argument) in pre-C++17 style, or the C++17 fold expression (args + ...) for simple cases that reduce to one operator applied across the whole pack.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\n// Base case: no arguments left\nvoid print() { std::cout << "\\n"; }\n\n// Recursive case: peel off one argument, recurse on the rest\ntemplate <typename T, typename... Rest>\nvoid print(T first, Rest... rest) {\n    std::cout << first << " ";\n    print(rest...); // recurse with one fewer argument\n}\n\nint main() {\n    print(1, "two", 3.0, \'4\'); // 1 two 3 4\n    return 0;\n}',
          },
        },
        {
          heading: "constexpr and Compile-Time Computation",
          body:
            "constexpr marks a function or variable as eligible to be evaluated entirely at compile time when its inputs are themselves compile-time constants, producing the result as part of the compiled binary with zero runtime cost — a constexpr factorial(5) can become the literal value 120 baked directly into the program, with no function call happening at runtime at all. This differs from const, which only promises a value won't change after initialization but doesn't require (or guarantee) compile-time evaluation; constexpr additionally interacts naturally with templates, since template arguments (like array sizes) must themselves be compile-time constants.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nconstexpr int factorial(int n) {\n    return (n <= 1) ? 1 : n * factorial(n - 1);\n}\n\nint main() {\n    constexpr int result = factorial(5); // computed entirely at COMPILE time\n    int arr[result];                      // valid — result is a compile-time constant\n    std::cout << result << "\\n";          // 120\n    return 0;\n}',
          },
        },
        {
          heading: "A Glimpse of Concepts (C++20)",
          body:
            "Before C++20, a template parameter with no constraints accepts ANY type, and a type that's incompatible with the template's body only produces an error deep inside the instantiated code — often a long, hard-to-parse error message pointing at internal template machinery rather than the actual mistake. Concepts let you constrain a template parameter to types satisfying specific requirements (std::integral, std::copyable, or a custom-defined concept), so an incompatible type produces a clear, immediate error at the call site instead — concepts are a readability and error-message improvement over older techniques like SFINAE and std::enable_if, without changing what templates can fundamentally do.",
          code: {
            language: "cpp",
            code:
              '#include <concepts>\n#include <iostream>\n\ntemplate <std::integral T> // constrains T to integer types only\nT doubleIt(T value) {\n    return value * 2;\n}\n\nint main() {\n    std::cout << doubleIt(21) << "\\n"; // 42 — int satisfies std::integral\n    // doubleIt(3.14); // would fail to COMPILE with a clear concept-violation message\n    return 0;\n}',
          },
        },
      ],
      commonPitfalls: [
        "Splitting a class template's member function definitions into a separate .cpp file the way ordinary classes do, causing linker errors (template definitions generally must stay visible in the header).",
        "Calling a function template with two arguments of genuinely different types and expecting automatic deduction to just 'figure it out' by converting one.",
        "Writing a variadic template's recursive case without a matching base case, causing infinite template recursion that explodes compile time or fails outright.",
        "Assuming templates behave like runtime generics with type erasure, when in fact each distinct type instantiates entirely separate compiled code (template bloat).",
        "Confusing const (no compile-time evaluation guarantee) with constexpr (eligible for compile-time evaluation) when a genuinely compile-time constant is required, such as an array size.",
        "Forgetting typename before a dependent type name inside a template body, which the compiler can't otherwise parse as a type.",
      ],
      keyTakeaways: [
        "Templates generate a separate, fully-compiled version of a function/class for each distinct type actually used — there's no runtime type erasure.",
        "Class (and function) template definitions must generally stay visible in the header, not split into a separate .cpp file.",
        "Full specialization overrides a template's behavior entirely for one specific type; partial specialization (classes only) targets a pattern of types.",
        "Variadic templates process an arbitrary number of arguments via recursion (with a required base case) or C++17 fold expressions.",
        "constexpr enables genuine compile-time computation, unlike const, which only guarantees immutability after initialization.",
        "C++20 concepts constrain template parameters to types meeting specific requirements, turning deep, cryptic instantiation errors into clear call-site errors.",
      ],
      links: [
        { label: "cppreference — Templates", url: "https://en.cppreference.com/w/cpp/language/templates" },
        { label: "cppreference — Constraints and concepts", url: "https://en.cppreference.com/w/cpp/language/constraints" },
      ],
    },
    {
      moduleTitle: "C++ Programming",
      subModuleTitle: "Memory management & smart pointers",
      overview:
        "C++ gives programmers the same raw access to heap memory that C does through new and delete, but it also provides something C fundamentally lacks: smart pointers, RAII-based wrapper types that automate memory release so that correctly-written modern C++ rarely needs to call delete explicitly at all, or worry about an exception skipping past a cleanup step. This sub-module covers the difference between stack and heap allocation, the specific failure modes of manual new/delete, RAII as the underlying principle smart pointers are built on, and then each of the three standard smart pointer types in turn — unique_ptr for exclusive ownership, shared_ptr for shared, reference-counted ownership, and weak_ptr for breaking the reference cycles shared_ptr alone can create — closing with the modern 'Rule of Zero' philosophy that treats manual memory management as a last resort rather than a default habit.",
      sections: [
        {
          heading: "Stack vs. Heap Allocation",
          body:
            "Stack-allocated objects (ordinary local variables) are automatically created when their scope begins and automatically destroyed when it ends, with no explicit action required and essentially zero overhead — this automatic lifetime is exactly what RAII and smart pointers build on. Heap-allocated objects (created with new) live until explicitly destroyed with delete, persisting beyond the scope that created them, which is necessary when an object's lifetime must outlive the function that creates it or when its size isn't known until runtime — but that same flexibility means heap memory has no automatic cleanup mechanism at all unless you build one, which is precisely the gap smart pointers fill.",
          bullets: [
            "A local std::vector<int> v; on the stack owns its data on the HEAP internally, but v itself (the handle) is destroyed automatically — this is already a simple form of RAII.",
            "Stack allocation is fast and automatic but limited in size and scope-bound; heap allocation is flexible in size and lifetime but entirely manual unless wrapped in an RAII type.",
          ],
        },
        {
          heading: "new/delete and Their Pitfalls",
          body:
            "new Type(args) allocates space for one object on the heap and runs its constructor, returning a pointer to it; delete pointer runs the object's destructor and releases the memory. new[] and delete[] are the array equivalents and must always be paired with each other, never mixed with the non-array forms — calling delete (instead of delete[]) on an array-allocated pointer is undefined behavior. Every single new must be matched by exactly one delete: forgetting it leaks memory for the program's remaining lifetime, and calling delete twice on the same pointer (a double free) corrupts the heap's internal bookkeeping, exactly as in C's malloc/free — new/delete don't actually fix any of C's manual-memory hazards, they just add constructor/destructor calls on top of the same fundamental risk.",
          code: {
            language: "cpp",
            code:
              '#include <iostream>\n\nclass Widget {\npublic:\n    Widget() { std::cout << "Widget created\\n"; }\n    ~Widget() { std::cout << "Widget destroyed\\n"; }\n};\n\nint main() {\n    Widget *w = new Widget();  // heap allocation, constructor runs\n    delete w;                   // destructor runs, memory released\n\n    int *arr = new int[5];\n    delete[] arr;                // array form MUST be used for new[]\n    return 0;\n}',
          },
        },
        {
          heading: "RAII Revisited: The Principle Smart Pointers Automate",
          body:
            "RAII ties a resource's lifetime to an object's scope: acquire the resource in the constructor, release it in the destructor, and let the language's automatic stack-unwinding guarantee the destructor runs — even if an exception is thrown partway through the enclosing function — so the resource is released exactly once, no matter how control flow exits the scope. Smart pointers are nothing more than small, generic RAII wrapper classes around a raw pointer, implementing exactly this constructor-acquires/destructor-releases pattern so that 'remembering to call delete' stops being a manual discipline you have to get right every single time and becomes something the type system guarantees automatically.",
        },
        {
          heading: "unique_ptr: Exclusive Ownership",
          body:
            "std::unique_ptr<T> owns a heap object exclusively — exactly one unique_ptr can own a given object at a time, enforced by making unique_ptr non-copyable (copying is a compile error) but movable, so ownership can be explicitly transferred (std::move(ptr)) from one unique_ptr to another, at which point the original becomes empty (nullptr). Its destructor automatically calls delete on the owned object when the unique_ptr itself goes out of scope, which means correctly-written code using unique_ptr for heap ownership never calls delete manually at all. std::make_unique<T>(args) is the preferred way to create one, since it avoids a subtle exception-safety gap that exists with new T(args) passed directly to a unique_ptr constructor in more complex expressions.",
          bullets: [
            "unique_ptr cannot be copied (attempting to do so is a compile error) — only moved, which transfers ownership and empties the source.",
            "Prefer std::make_unique<T>(args) over raw new T(args) wrapped manually — it's exception-safer and slightly more concise.",
          ],
          code: {
            language: "cpp",
            code:
              '#include <memory>\n#include <iostream>\n\nclass Widget {\npublic:\n    Widget() { std::cout << "Widget created\\n"; }\n    ~Widget() { std::cout << "Widget destroyed\\n"; }\n    void greet() { std::cout << "Hello from Widget\\n"; }\n};\n\nint main() {\n    std::unique_ptr<Widget> w = std::make_unique<Widget>();\n    w->greet();\n\n    std::unique_ptr<Widget> w2 = std::move(w); // ownership transferred; w is now empty\n    if (!w) std::cout << "w is now empty\\n";\n    w2->greet();\n    return 0; // w2\'s destructor automatically deletes the Widget — no manual delete anywhere\n}',
          },
        },
        {
          heading: "shared_ptr and Reference Counting",
          body:
            "std::shared_ptr<T> allows multiple shared_ptr instances to jointly own the same heap object, tracked via an internal, atomically-updated reference count — the object is only actually deleted once the LAST shared_ptr owning it is destroyed or reset, making it the right tool when an object's ownership genuinely needs to be shared across multiple parts of a program with no single clear owner. Copying a shared_ptr increments the count; destroying or resetting one decrements it, and the reference-counting overhead (atomic operations, for thread safety) makes shared_ptr measurably more expensive than unique_ptr — it should be reached for only when shared ownership is a genuine requirement, not used as a default 'just in case' choice.",
          code: {
            language: "cpp",
            code:
              '#include <memory>\n#include <iostream>\n\nclass Widget {\npublic:\n    ~Widget() { std::cout << "Widget destroyed\\n"; }\n};\n\nint main() {\n    std::shared_ptr<Widget> a = std::make_shared<Widget>();\n    std::cout << "use_count = " << a.use_count() << "\\n"; // 1\n    {\n        std::shared_ptr<Widget> b = a; // shares ownership — count increments\n        std::cout << "use_count = " << a.use_count() << "\\n"; // 2\n    } // b destroyed here — count decrements back to 1\n    std::cout << "use_count = " << a.use_count() << "\\n"; // 1\n    return 0; // a destroyed — count reaches 0, Widget is deleted\n}',
          },
        },
        {
          heading: "weak_ptr and Breaking Circular References",
          body:
            "Two objects holding shared_ptrs to each other create a reference cycle where each object's count never reaches zero, because each is still 'owned' by the other — neither is ever destroyed, producing a memory leak that shared_ptr's reference counting cannot detect or resolve on its own. std::weak_ptr<T> observes an object managed by a shared_ptr WITHOUT contributing to its reference count, breaking exactly this kind of cycle — a weak_ptr can't be dereferenced directly (the object might already be gone), so you must call .lock() to obtain a temporary shared_ptr (or an empty one, if the object was already destroyed) before actually using it.",
          code: {
            language: "cpp",
            code:
              '#include <memory>\n#include <iostream>\n\nstruct Child; // forward declaration\n\nstruct Parent {\n    std::shared_ptr<Child> child;\n    ~Parent() { std::cout << "Parent destroyed\\n"; }\n};\n\nstruct Child {\n    std::weak_ptr<Parent> parent; // weak_ptr avoids a reference cycle with Parent\n    ~Child() { std::cout << "Child destroyed\\n"; }\n};\n\nint main() {\n    auto parent = std::make_shared<Parent>();\n    auto child = std::make_shared<Child>();\n    parent->child = child;\n    child->parent = parent; // weak reference — does NOT increment Parent\'s use_count\n\n    if (auto p = child->parent.lock()) { // must lock() before use\n        std::cout << "Parent is still alive\\n";\n    }\n    return 0; // both Parent and Child are destroyed correctly — no cycle, no leak\n}',
          },
        },
        {
          heading: "The Rule of Zero",
          body:
            "The Rule of Zero is the modern C++ philosophy that a well-designed class should need to write NONE of the special member functions (destructor, copy/move constructor, copy/move assignment) itself, by composing it entirely out of members that already manage their own resources correctly — std::string, std::vector, unique_ptr, shared_ptr. When every member already knows how to copy, move, and destroy itself correctly, the compiler-generated versions of the class's own special members are automatically correct too, with zero manual bookkeeping and zero risk of the double-free/leak bugs that plague manual new/delete and raw-pointer-holding classes under the older Rule of Three.",
          bullets: [
            "If you find yourself writing a custom destructor just to call delete on a raw pointer member, replace that raw pointer member with a unique_ptr instead and delete the custom destructor entirely.",
            "Reach for raw new/delete only in rare, low-level cases (writing a container or smart pointer itself) — application code should essentially never call them directly in modern C++.",
          ],
        },
      ],
      commonPitfalls: [
        "Pairing new[] with delete (instead of delete[]), or new with delete[] — the array and non-array forms must always match.",
        "Forgetting a delete for every new, leaking memory for the remaining life of the program — exactly as in C, new/delete add no automatic safety by themselves.",
        "Using a raw pointer after a unique_ptr holding the same object has been moved from or has gone out of scope.",
        "Creating shared_ptr cycles (two objects each holding a shared_ptr to the other), causing a memory leak reference counting alone cannot detect.",
        "Dereferencing a weak_ptr directly instead of calling .lock() first and checking whether the returned shared_ptr is non-null.",
        "Mixing manual new/delete with smart pointers on the same raw resource, or constructing a smart pointer from a pointer that something else also owns/deletes.",
        "Defaulting to shared_ptr for everything 'just in case' instead of unique_ptr, paying unnecessary reference-counting overhead when exclusive ownership would suffice.",
      ],
      keyTakeaways: [
        "Every new must be matched by exactly one delete (and new[] by delete[]) — smart pointers exist specifically to make this automatic and exception-safe.",
        "unique_ptr models exclusive ownership: non-copyable, movable, and automatically deletes its object when it goes out of scope.",
        "shared_ptr models shared ownership via reference counting; the object is deleted only when the last owning shared_ptr is destroyed.",
        "weak_ptr observes a shared_ptr-managed object without affecting its reference count, specifically to break ownership cycles — call .lock() before use.",
        "The Rule of Zero: compose classes from members that already manage their own resources (RAII types) so the compiler-generated special members are correct automatically.",
      ],
      links: [
        { label: "cppreference — std::unique_ptr", url: "https://en.cppreference.com/w/cpp/memory/unique_ptr" },
        { label: "cppreference — std::shared_ptr", url: "https://en.cppreference.com/w/cpp/memory/shared_ptr" },
      ],
    },

    // ───────────────────────────── C# Programming ─────────────────────────────
    {
      moduleTitle: "C# Programming",
      subModuleTitle: "C# syntax & .NET basics",
      overview:
        "C# runs on the .NET platform, which means understanding a few platform-level ideas — the Common Language Runtime (CLR), Intermediate Language (IL), and just-in-time (JIT) compilation — pays off just as much as learning C# syntax itself, since they explain behavior C developers coming from C/C++ often find surprising, like automatic garbage collection and runtime type checking. This sub-module covers that compilation/execution model, basic program structure, the crucial distinction between value types and reference types (which governs copying, equality, and null-ability throughout the language), the built-in data types, string handling, and C#'s modern null-safety features — all foundational to everything built in the following sub-modules on OOP, collections, and application structure.",
      sections: [
        {
          heading: "The .NET Platform: CLR, IL, and JIT",
          body:
            "C# source code compiles not directly to machine code but to Intermediate Language (IL) — a CPU-independent bytecode stored in an assembly (a .dll or .exe file) — which the Common Language Runtime (CLR) then compiles to actual machine code at runtime via a Just-In-Time (JIT) compiler, typically the first time each method is actually called. This two-stage model is what lets the same compiled assembly run on any platform with a compatible .NET runtime installed, and is also what enables the CLR's automatic memory management (garbage collection), runtime type safety checks, and exception handling — none of which C or C++ provide automatically, since those compile all the way to native machine code with no managed runtime underneath.",
          bullets: [
            "An assembly (.dll/.exe) contains IL, not native machine code — the actual machine code is generated on the fly by the JIT at runtime.",
            "Garbage collection means you generally never call anything equivalent to C's free() or C++'s delete for ordinary managed objects — the CLR reclaims memory automatically once nothing references an object.",
          ],
        },
        {
          heading: "Basic Program Structure",
          body:
            "A C# program is organized into namespaces (for organizing related types and avoiding name collisions, directly analogous to C++ namespaces) containing classes, and every executable program needs exactly one entry point — traditionally a static Main method, though modern C# (10+) also supports 'top-level statements' that let a simple program skip the explicit class/Main boilerplate entirely for small programs and scripts. Every statement ends with a semicolon, blocks are delimited with braces, and C#'s syntax for control flow (if/else, for, while, switch) closely mirrors C and C++, making the transition from those languages comparatively smooth at the syntax level even though the runtime model underneath is very different.",
          code: {
            language: "csharp",
            code:
              '// Modern C# "top-level statements" style — no explicit class or Main needed\nConsole.WriteLine("Hello, world!");\n\n// Traditional equivalent:\n// using System;\n// namespace MyApp {\n//     class Program {\n//         static void Main(string[] args) {\n//             Console.WriteLine("Hello, world!");\n//         }\n//     }\n// }',
          },
        },
        {
          heading: "Value Types vs. Reference Types",
          body:
            "C#'s built-in numeric types, bool, char, and struct-based types are value types, stored directly wherever they're declared (a local variable, a field) and COPIED in full whenever assigned to another variable or passed to a function — modifying the copy never affects the original. Classes, arrays, and strings are reference types, where the variable actually holds a reference (an address) to the object's data on the managed heap, so assigning one reference-type variable to another copies only the reference, meaning both variables now point to the SAME underlying object, and modifying it through either variable affects both. This distinction governs copying, equality comparisons, and whether a variable can be meaningfully null (all reference types can be null; value types cannot, unless explicitly marked nullable).",
          bullets: [
            "int a = 5; int b = a; b++; leaves a unchanged — a and b are independent copies.",
            "A class instance assigned to a second variable shares the same object — modifying it through either variable is visible through both.",
          ],
          code: {
            language: "csharp",
            code:
              'struct PointStruct { public int X, Y; } // value type\nclass PointClass { public int X, Y; }   // reference type\n\nPointStruct s1 = new PointStruct { X = 1, Y = 2 };\nPointStruct s2 = s1; // full COPY\ns2.X = 99;\nConsole.WriteLine(s1.X); // 1 — s1 is untouched\n\nPointClass c1 = new PointClass { X = 1, Y = 2 };\nPointClass c2 = c1; // same OBJECT, two references to it\nc2.X = 99;\nConsole.WriteLine(c1.X); // 99 — c1 and c2 refer to the same object',
          },
        },
        {
          heading: "Data Types and var vs. Explicit Typing",
          body:
            "C#'s built-in value types include int, long, float, double, decimal (for exact base-10 arithmetic, preferred for money), bool, and char, each with a fixed, platform-independent size guaranteed by the language specification (unlike C's platform-dependent int size). The var keyword lets the compiler infer a local variable's type from its initializer expression at compile time — var count = 5; is exactly equivalent to int count = 5; with identical type safety, since var is resolved entirely at compile time, not a dynamic or loosely-typed construct the way it might appear. Style guidance generally favors var when the type is obvious from the right-hand side (reducing visual noise) and explicit typing when it improves readability for a non-obvious expression.",
          bullets: [
            "decimal is preferred over double/float for monetary values specifically because it represents base-10 fractions exactly, avoiding binary floating-point rounding error.",
            "var is resolved to a concrete, fixed type at compile time — it is NOT the same as a dynamically typed variable.",
          ],
        },
        {
          heading: "String Handling and Interpolation",
          body:
            "C# strings are immutable reference types — every operation that appears to 'modify' a string (concatenation, replacement) actually produces a brand-new string object, leaving the original unchanged, which is why repeated concatenation in a loop should use StringBuilder instead of += to avoid allocating a new string on every iteration. String interpolation ($\"text {expression} more text\") embeds expressions directly inside a string literal and is the modern, preferred alternative to manual string.Format or + concatenation, since the embedded expressions are visually right next to the text they produce.",
          code: {
            language: "csharp",
            code:
              'string name = "Priya";\nint age = 28;\n\n// Interpolated string — preferred modern style\nstring message = $"{name} is {age} years old.";\nConsole.WriteLine(message);\n\n// Building a large string efficiently in a loop\nvar sb = new System.Text.StringBuilder();\nfor (int i = 0; i < 5; i++) {\n    sb.Append(i).Append(" ");\n}\nConsole.WriteLine(sb.ToString()); // 0 1 2 3 4',
          },
        },
        {
          heading: "Nullable Types and Null-Safety",
          body:
            "Value types cannot normally be null, but appending ? (int? age = null;) makes a 'nullable value type' that can represent either a real value or the absence of one, commonly needed for optional database fields or form inputs that might be empty. Reference types (nullable by default historically) can opt into 'nullable reference types' (enabled per-project via <Nullable>enable</Nullable>), which has the compiler warn when a reference-type variable not marked with ? might be assigned or read as null without a check — a major modern C# feature for catching a large class of NullReferenceException bugs at compile time instead of at runtime. The null-conditional operator (?.) and null-coalescing operator (??) provide concise, safe ways to work with potentially-null values.",
          code: {
            language: "csharp",
            code:
              'int? maybeAge = null;\nConsole.WriteLine(maybeAge ?? -1); // ?? provides a fallback: -1\n\nstring? name = null;\nint? length = name?.Length; // ?. short-circuits to null instead of throwing\nConsole.WriteLine(length ?? 0); // 0',
          },
        },
        {
          heading: "Operators and Control Flow Basics",
          body:
            "C#'s operator set closely mirrors C/C++ (arithmetic, relational, logical, bitwise) with a few useful additions: ?? (null-coalescing, provides a default for a null value), ?. (null-conditional member access), and the pattern-matching-aware switch expression (a more concise, expression-based alternative to the traditional switch statement, introduced in C# 8). Control flow statements (if/else, for, foreach, while, do-while) work essentially as in C/C++, with foreach added specifically for iterating any collection implementing IEnumerable without manually managing an index or iterator.",
          code: {
            language: "csharp",
            code:
              'int day = 3;\nstring dayType = day switch { // switch EXPRESSION (C# 8+), not a switch statement\n    1 or 7 => "Weekend",\n    >= 2 and <= 6 => "Weekday",\n    _ => "Invalid"\n};\nConsole.WriteLine(dayType); // Weekday\n\nforeach (int n in new[] { 1, 2, 3 }) {\n    Console.Write(n + " "); // 1 2 3\n}',
          },
        },
      ],
      commonPitfalls: [
        "Assuming a struct (value type) behaves like a class when assigned or passed to a method — it's fully copied, not shared by reference.",
        "Using += to build a large string inside a loop instead of StringBuilder, allocating a new string object on every single iteration.",
        "Treating var as a dynamically-typed variable instead of understanding it's resolved to one fixed, concrete type at compile time.",
        "Forgetting that a nullable value type (int?) must be unwrapped (via .Value, ??, or a null check) before being used where a non-nullable int is expected.",
        "Using double for monetary calculations instead of decimal, introducing binary floating-point rounding error into currency amounts.",
        "Dereferencing a reference-type variable without a null check (or ?.) when nullable reference types are enabled and the compiler has already warned about it.",
      ],
      keyTakeaways: [
        "C# compiles to IL, which the CLR JIT-compiles to native code at runtime — this managed runtime is what enables automatic garbage collection.",
        "Value types are copied on assignment/passing; reference types share the same underlying object through every reference to it.",
        "var is resolved to a fixed, concrete type at compile time — it is not loosely typed or dynamic.",
        "Use decimal (not float/double) for any monetary or exact base-10 calculation.",
        "Nullable value types (T?) and nullable reference types (enabled via project settings) let the compiler catch a large class of null-related bugs before runtime.",
      ],
      links: [
        { label: "Microsoft Learn — C# language reference", url: "https://learn.microsoft.com/en-us/dotnet/csharp/" },
        { label: "Microsoft Learn — Value types and reference types", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/value-reference-types" },
      ],
    },
    {
      moduleTitle: "C# Programming",
      subModuleTitle: "OOP in C#",
      overview:
        "C# was designed as an object-oriented language from the start, and its OOP features are both more structured and more opinionated than C++'s — properties replace manual getter/setter method pairs, every class implicitly inherits from object, and polymorphism requires an explicit, deliberate pairing of virtual and override rather than C++'s easier-to-misuse implicit virtual dispatch. This sub-module covers class anatomy and C#'s signature auto-implemented properties, constructors and object initializer syntax, inheritance with the sealed/virtual/override keyword triad, interfaces versus abstract classes and when to choose each, the mechanics of overriding versus overloading, access modifiers, and static members — building the same conceptual foundation as the C++ classes sub-module, but through C#'s more guided, compiler-enforced idioms.",
      sections: [
        {
          heading: "Classes, Properties, and Auto-Implemented Properties",
          body:
            "A property looks like a public field from the outside (object.Name) but is backed by get and set accessor methods, letting a class validate, compute, or restrict access to its internal state without changing how calling code reads or writes it — this is the idiomatic C# replacement for C++'s manual getName()/setName() method pairs. An auto-implemented property (public string Name { get; set; }) lets the compiler generate a hidden backing field automatically when no custom logic is needed, and set can be restricted to private (settable only inside the class) or omitted entirely combined with constructor assignment to create an effectively read-only property.",
          code: {
            language: "csharp",
            code:
              'public class Person {\n    public string Name { get; set; }             // full read/write auto-property\n    public int Age { get; private set; }         // readable externally, settable only inside the class\n\n    public Person(string name, int age) {\n        Name = name;\n        Age = age;\n    }\n\n    public void HaveBirthday() => Age++; // can modify Age internally\n}\n\nvar p = new Person("Asha", 30);\n// p.Age = 40; // COMPILE ERROR — setter is private\np.HaveBirthday();\nConsole.WriteLine(p.Age); // 31',
          },
        },
        {
          heading: "Constructors and Object Initializers",
          body:
            "Constructors in C# work much like C++'s, running once when an object is created via new, and can be overloaded (multiple constructors with different parameter lists) with one constructor delegating to another via the this(...) initializer syntax to avoid duplicating setup logic. Object initializer syntax (new Person { Name = \"Asha\", Age = 30 }) sets public properties immediately after construction in a single expression, which is convenient for simple data-holding classes but still runs the parameterless constructor first — it is not a replacement for a constructor when validation logic or required fields are involved.",
          code: {
            language: "csharp",
            code:
              'public class Point {\n    public int X { get; set; }\n    public int Y { get; set; }\n\n    public Point() : this(0, 0) {} // delegates to the other constructor\n    public Point(int x, int y) { X = x; Y = y; }\n}\n\nvar origin = new Point();                 // uses the delegating constructor -> (0,0)\nvar p = new Point { X = 3, Y = 4 };       // object initializer syntax\nvar p2 = new Point(5, 6);                 // direct constructor call',
          },
        },
        {
          heading: "Inheritance: sealed, virtual, and override",
          body:
            "A class inherits from exactly one base class in C# (no multiple class inheritance, though interfaces fill much of that gap — see below) using a colon (class Dog : Animal). Unlike C++, where every member function is implicitly overridable unless marked final, C# methods are NOT virtual by default — a base class method must be explicitly marked virtual to allow derived classes to override it with the override keyword, and attempting override on a non-virtual base method is a compile error rather than a silent new, unrelated method (which is closer to what C++ does when override is forgotten). sealed on a class prevents any further inheritance from it, and sealed on an override prevents further overriding of that specific method in classes derived even further down the hierarchy.",
          bullets: [
            "A base method must be explicitly virtual (or abstract) before a derived class can override it — this is the opposite default from C++, and it's enforced by the compiler, not just convention.",
            "new (instead of override) on a derived method intentionally HIDES the base method rather than overriding it — a frequent, confusing beginner mistake when override was actually intended.",
          ],
          code: {
            language: "csharp",
            code:
              'public class Animal {\n    public virtual void Speak() => Console.WriteLine("Some generic sound");\n}\n\npublic class Dog : Animal {\n    public override void Speak() => Console.WriteLine("Woof!");\n}\n\nAnimal a = new Dog();\na.Speak(); // "Woof!" — dynamic dispatch via override, resolved by the OBJECT\'s real type',
          },
        },
        {
          heading: "Interfaces vs. Abstract Classes",
          body:
            "An interface declares a contract — a set of members any implementing class must provide — with no state (fields) and, traditionally, no implementation (default interface methods, added in C# 8, are a more recent, more limited exception); a class can implement any number of interfaces, which is how C# approximates multiple inheritance without its diamond-problem complications. An abstract class, by contrast, can hold real state (fields), provide some concrete (already-implemented) members alongside abstract ones that derived classes must implement, and a class can inherit from only ONE abstract (or any) class. The practical rule: use an interface to describe 'can do X' capabilities shared across otherwise-unrelated classes; use an abstract class when there's real shared state or behavior to inherit, not just a shared contract.",
          code: {
            language: "csharp",
            code:
              'public interface IFlyable {\n    void Fly(); // no implementation, no state\n}\n\npublic abstract class Bird {\n    public string Name { get; set; } // real, shared state\n    public abstract void MakeSound(); // must be implemented by derived classes\n    public void Sleep() => Console.WriteLine($"{Name} is sleeping"); // shared, concrete behavior\n}\n\npublic class Eagle : Bird, IFlyable {\n    public override void MakeSound() => Console.WriteLine("Screech!");\n    public void Fly() => Console.WriteLine($"{Name} soars high");\n}',
          },
        },
        {
          heading: "Polymorphism: Overriding vs. Overloading",
          body:
            "Overriding (override) provides a NEW implementation of an already-virtual base class member with the EXACT SAME signature, resolved at runtime based on the object's actual type — this is true polymorphism. Overloading defines MULTIPLE methods with the SAME NAME but DIFFERENT parameter lists (different types or counts) within the same class, resolved at COMPILE time based on the arguments supplied at the call site — this is a convenience feature for naming related operations consistently, not a form of runtime polymorphism at all, and confusing the two (expecting overload resolution to behave dynamically, or expecting override to allow a different signature) is a common beginner mix-up.",
          code: {
            language: "csharp",
            code:
              'public class Calculator {\n    public int Add(int a, int b) => a + b;           // overload 1\n    public double Add(double a, double b) => a + b;  // overload 2 — resolved at COMPILE time\n}\n\nvar calc = new Calculator();\nConsole.WriteLine(calc.Add(2, 3));     // 5    — calls the int overload\nConsole.WriteLine(calc.Add(2.5, 3.5)); // 6.0  — calls the double overload',
          },
        },
        {
          heading: "Access Modifiers",
          body:
            "public members are accessible from anywhere; private members (the default for class members if unspecified) are accessible only within the same class; protected members are accessible within the class and any class deriving from it; internal members are accessible anywhere within the same assembly (compiled project) but not from other assemblies/projects; protected internal combines protected and internal (accessible to derived classes OR anything in the same assembly); and private protected (accessible only to derived classes within the same assembly) is the narrowest combination. Choosing the narrowest access level that still does the job is standard practice, since it minimizes the surface area other code can depend on and later break when you refactor.",
        },
        {
          heading: "Static Members and Static Classes",
          body:
            "A static member (field, property, or method) belongs to the TYPE itself rather than to any individual instance — there's exactly one copy of a static field shared across every instance of the class, and static methods are called on the type name directly (Math.Sqrt(4)) rather than on an object instance. A static class (the whole class marked static) cannot be instantiated at all and can contain only static members — used for pure utility/helper classes with no per-instance state, like the built-in Math and Console classes. Overusing static state for things that should actually be per-instance data is a common design mistake, since it creates hidden, shared mutable state that's easy to accidentally corrupt from unrelated parts of a program.",
          code: {
            language: "csharp",
            code:
              'public static class MathUtils {\n    public static int Square(int x) => x * x; // no instance needed — called on the type itself\n}\n\npublic class Counter {\n    private static int totalInstancesCreated = 0; // shared across ALL Counter instances\n    public Counter() { totalInstancesCreated++; }\n    public static int TotalInstances => totalInstancesCreated;\n}\n\nConsole.WriteLine(MathUtils.Square(5)); // 25\nnew Counter(); new Counter();\nConsole.WriteLine(Counter.TotalInstances); // 2',
          },
        },
      ],
      commonPitfalls: [
        "Forgetting that C# methods are non-virtual by default — a base method must be marked virtual before override on a derived method is even legal.",
        "Using new instead of override on a derived method, which hides the base method instead of truly overriding it (and breaks polymorphic dispatch through a base reference).",
        "Choosing an interface when a class actually needs to share real, concrete state across its implementers — that calls for an abstract class instead.",
        "Expecting overload resolution to behave polymorphically at runtime, when it is actually resolved entirely at compile time based on static argument types.",
        "Making a field or property public when a narrower access level (private, protected, internal) would fully satisfy every real caller's needs.",
        "Storing per-instance data in a static field, creating shared mutable state that's silently corrupted by unrelated instances.",
      ],
      keyTakeaways: [
        "Properties (get/set) are C#'s idiomatic replacement for manual getter/setter method pairs, and auto-properties remove boilerplate when no custom logic is needed.",
        "C# members are non-virtual by default; virtual/override must both be explicit, and the compiler enforces the pairing (unlike C++'s easier-to-misuse implicit virtuality).",
        "Use interfaces for 'can do X' contracts shared across unrelated classes; use abstract classes when real shared state or concrete behavior needs to be inherited.",
        "Overriding is resolved at runtime based on the object's real type (true polymorphism); overloading is resolved at compile time based on argument types (not polymorphism).",
        "Always choose the narrowest access modifier that satisfies real callers, and avoid static fields for state that is genuinely per-instance.",
      ],
      links: [
        { label: "Microsoft Learn — Object-oriented programming (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/" },
        { label: "Microsoft Learn — Interfaces", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces" },
      ],
    },
    {
      moduleTitle: "C# Programming",
      subModuleTitle: "Collections & LINQ",
      overview:
        "Real programs spend an enormous amount of their logic querying, filtering, and transforming collections of data, and C# provides two complementary tools for this: the generic collections in System.Collections.Generic (List<T>, Dictionary<TKey,TValue>, and friends) for STORING data, and LINQ (Language Integrated Query) for QUERYING and transforming it with a declarative, SQL-like syntax that works uniformly across in-memory collections, databases, and XML. LINQ's deferred execution model — where a query describes WHAT to compute without actually running it until the results are iterated — is both one of its most powerful features and one of its most common sources of subtle bugs for developers who assume a query runs immediately like a regular method call. This sub-module covers the core generic collections, IEnumerable as the foundation LINQ builds on, both LINQ syntax styles, deferred execution, the most common query operators, and aggregation.",
      sections: [
        {
          heading: "Arrays and List<T>",
          body:
            "An array (int[] nums = new int[5];) has a fixed size set at creation and cannot grow or shrink afterward. List<T> is a generic, dynamically resizable collection built on top of an array internally, automatically growing its backing storage as elements are added via Add — it's the default general-purpose collection for an ordered, resizable sequence of items, directly analogous to C++'s std::vector<T>. Being generic (the <T> type parameter), List<int> and List<string> are both fully type-checked at compile time, with no boxing/unboxing overhead for value types and no risk of accidentally adding a mismatched type, unlike the older, non-generic ArrayList from early .NET versions.",
          code: {
            language: "csharp",
            code:
              'List<string> names = new List<string> { "Asha", "Ravi" };\nnames.Add("Meera");\nnames.Remove("Ravi");\n\nforeach (string name in names) {\n    Console.WriteLine(name); // Asha, Meera\n}\nConsole.WriteLine(names.Count); // 2',
          },
        },
        {
          heading: "Dictionary<TKey, TValue> and Other Generic Collections",
          body:
            "Dictionary<TKey, TValue> stores unique keys mapped to values with average O(1) lookup, insertion, and removal via hashing — directly analogous to C#'s own HashSet<T> (unique values, no mapping) and to C++'s unordered_map/unordered_set. Accessing a missing key with the indexer (dict[\"missing\"]) throws a KeyNotFoundException, so checking first with ContainsKey or using TryGetValue (which returns a bool success flag and avoids the exception entirely) is the standard, safe way to handle keys that might not be present. Queue<T> (first-in-first-out) and Stack<T> (last-in-first-out) round out the standard generic collections for specific access-order needs.",
          code: {
            language: "csharp",
            code:
              'var ages = new Dictionary<string, int> { ["Asha"] = 30, ["Ravi"] = 25 };\n\nif (ages.TryGetValue("Asha", out int age)) {\n    Console.WriteLine($"Asha is {age}"); // Asha is 30\n}\n\nif (!ages.ContainsKey("Priya")) {\n    Console.WriteLine("Priya not found"); // avoids a KeyNotFoundException\n}',
          },
        },
        {
          heading: "IEnumerable and Iterating Collections",
          body:
            "IEnumerable<T> is the fundamental interface nearly every collection in .NET implements, exposing just enough (a GetEnumerator method) to support foreach iteration — it's the common foundation that lets foreach, and LINQ itself, work identically across arrays, lists, dictionaries, and any custom collection type, without needing to know the concrete collection type at all. This is directly analogous to the C++ STL's iterator-based uniformity across different container types, and is precisely why LINQ's extension methods (Where, Select, and the rest) are defined once on IEnumerable<T> and then automatically available on every collection type that implements it.",
        },
        {
          heading: "LINQ Query Syntax vs. Method Syntax",
          body:
            "LINQ offers two equivalent syntaxes for the same underlying operations: query syntax reads like a declarative SQL-style sentence (from x in collection where condition select x), and method syntax chains extension methods with lambda expressions (collection.Where(x => condition)) — both compile down to the exact same method calls, and most real-world C# code uses method syntax for its conciseness and composability, reserving query syntax mainly for queries with multiple joins or groupings where the SQL-like structure genuinely reads more clearly.",
          code: {
            language: "csharp",
            code:
              'var numbers = new List<int> { 1, 2, 3, 4, 5, 6 };\n\n// Query syntax\nvar evensQuery = from n in numbers where n % 2 == 0 select n;\n\n// Method syntax — equivalent, and far more common in practice\nvar evensMethod = numbers.Where(n => n % 2 == 0);\n\nConsole.WriteLine(string.Join(", ", evensMethod)); // 2, 4, 6',
          },
        },
        {
          heading: "Deferred Execution: The LINQ Gotcha",
          body:
            "Most LINQ operators (Where, Select, OrderBy) don't actually run when the query is WRITTEN — they build up a description of the computation and only execute it when the results are actually enumerated (by a foreach, a call to ToList()/ToArray(), or similar) — this is deferred execution. The practical danger: if the underlying collection changes between when a deferred query is defined and when it's finally enumerated, the query sees the collection's state AT ENUMERATION TIME, not at definition time, which can produce surprising results (or an exception, if the collection was modified in a way that invalidates iteration) if you assumed the query had already 'captured' a snapshot. Calling .ToList() immediately forces eager evaluation, materializing the results into a concrete list right away and avoiding this surprise.",
          code: {
            language: "csharp",
            code:
              'var numbers = new List<int> { 1, 2, 3 };\nvar query = numbers.Where(n => n > 1); // NOT executed yet — just describes the filter\n\nnumbers.Add(4); // modifies the list BEFORE the query is enumerated\n\nforeach (int n in query) {\n    Console.Write(n + " "); // 2 3 4 — the query sees the list AS IT IS NOW, including the 4\n}\nConsole.WriteLine();\n\nvar eager = numbers.Where(n => n > 1).ToList(); // forces immediate evaluation, a real snapshot',
          },
        },
        {
          heading: "Common Query Operators: Where, Select, OrderBy, GroupBy",
          body:
            "Where filters a sequence to elements matching a predicate; Select projects (transforms) each element into a new form, often a different type entirely; OrderBy/OrderByDescending sorts by a key selector; GroupBy partitions a sequence into groups sharing a common key, producing a sequence of groups each with a Key property and its own enumerable of matching elements. These compose freely by chaining, which is the core strength of LINQ's design — a single readable chain (collection.Where(...).Select(...).OrderBy(...)) replaces what would otherwise be several nested loops with manual accumulator variables.",
          code: {
            language: "csharp",
            code:
              'var people = new List<(string Name, int Age)> {\n    ("Asha", 30), ("Ravi", 25), ("Meera", 30), ("Jay", 25)\n};\n\nvar groupedByAge = people.GroupBy(p => p.Age);\nforeach (var group in groupedByAge) {\n    Console.WriteLine($"Age {group.Key}: {string.Join(", ", group.Select(p => p.Name))}");\n}\n// Age 30: Asha, Meera\n// Age 25: Ravi, Jay',
          },
        },
        {
          heading: "Aggregation: Sum, Count, Average, Aggregate",
          body:
            "Aggregation operators collapse a sequence down to a single value: Sum, Average, Min, and Max work directly on numeric sequences (or via a selector for sequences of complex objects), Count returns the number of elements (optionally matching a predicate), and Aggregate is the general-purpose fold operation for custom accumulation logic that doesn't fit one of the built-in aggregates. First() and Single() both return one specific element but differ critically in their failure behavior: First() returns the first match or throws if the sequence is empty (FirstOrDefault() returns a default value instead of throwing), while Single() throws if there is anything other than EXACTLY one match — using the wrong one for a given situation is a common source of unexpected exceptions.",
          code: {
            language: "csharp",
            code:
              'var numbers = new List<int> { 1, 2, 3, 4, 5 };\n\nConsole.WriteLine(numbers.Sum());                         // 15\nConsole.WriteLine(numbers.Average());                     // 3\nConsole.WriteLine(numbers.Count(n => n % 2 == 0));        // 2 (count matching a predicate)\n\nint product = numbers.Aggregate(1, (acc, n) => acc * n); // custom fold: 1*1*2*3*4*5\nConsole.WriteLine(product); // 120\n\nint firstEven = numbers.FirstOrDefault(n => n > 10); // no match -> default(int) = 0, no exception\nConsole.WriteLine(firstEven); // 0',
          },
        },
      ],
      commonPitfalls: [
        "Accessing a Dictionary key with the indexer without checking ContainsKey/TryGetValue first, risking a KeyNotFoundException on a missing key.",
        "Assuming a LINQ query executes immediately when written, instead of understanding deferred execution runs it only when enumerated.",
        "Modifying a collection while a foreach (or an un-materialized LINQ query) is actively iterating over it, risking an InvalidOperationException.",
        "Using First() when FirstOrDefault() was intended (or vice versa), causing an unexpected exception on an empty/no-match sequence.",
        "Re-enumerating the same un-materialized LINQ query multiple times, silently re-running the whole query (and any underlying data fetch) each time instead of caching the result with ToList().",
        "Using Single() when multiple matches are actually possible, triggering an exception instead of the intended 'just grab one' behavior that First() provides.",
      ],
      keyTakeaways: [
        "List<T> and Dictionary<TKey,TValue> are the default generic collections for ordered sequences and key-based lookup, respectively.",
        "IEnumerable<T> is the common interface foreach and LINQ both build on, letting the same query logic work across any compliant collection type.",
        "LINQ query syntax and method syntax compile to identical calls; method syntax is far more common in everyday code.",
        "Most LINQ operators use deferred execution — the query runs only when enumerated, not when it's written; call .ToList() to force immediate evaluation.",
        "Choose First()/FirstOrDefault() vs. Single()/SingleOrDefault() deliberately based on whether more than one match is a valid, expected possibility.",
      ],
      links: [
        { label: "Microsoft Learn — LINQ (Language Integrated Query)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/" },
        { label: "Microsoft Learn — Collections (C#)", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/" },
      ],
    },
    {
      moduleTitle: "C# Programming",
      subModuleTitle: "Exception handling & delegates",
      overview:
        "Exception handling is C#'s structured mechanism for responding to runtime errors without letting them crash an entire application, and delegates are its type-safe way of treating functions as values — passing behavior around as data, the same conceptual foundation that underlies event handling, LINQ's lambda-based operators, and asynchronous callback patterns throughout .NET. The two topics pair naturally in this sub-module because robust error handling and callback-driven code are both about structuring what happens when control flow doesn't follow the straightforward, linear path — an exception interrupts normal flow to jump to a handler, and a delegate lets code decide at runtime which specific function should run in response to an event. This sub-module covers try/catch/finally mechanics, the exception class hierarchy and custom exceptions, practical exception-handling discipline, delegate fundamentals, multicast delegates and events, and the built-in Func/Action/Predicate delegate types.",
      sections: [
        {
          heading: "try/catch/finally Mechanics",
          body:
            "Code that might throw goes inside a try block; one or more catch blocks (each specifying an exception type) handle specific kinds of failure, checked in order from top to bottom, with the first matching type's catch block running; an optional finally block runs unconditionally afterward, whether or not an exception occurred, and is the standard place for cleanup code (closing a file, releasing a lock) that must happen regardless of success or failure. Multiple catch blocks for the same try let you handle different exception types differently — more specific exception types should be caught before more general ones, since C# matches the FIRST catch block whose type matches (or is a base type of) the thrown exception.",
          code: {
            language: "csharp",
            code:
              'try {\n    int[] numbers = { 1, 2, 3 };\n    Console.WriteLine(numbers[5]); // throws IndexOutOfRangeException\n}\ncatch (IndexOutOfRangeException ex) {\n    Console.WriteLine($"Index error: {ex.Message}");\n}\ncatch (Exception ex) { // more general — must come AFTER the specific catch above\n    Console.WriteLine($"Unexpected error: {ex.Message}");\n}\nfinally {\n    Console.WriteLine("Cleanup runs regardless of success or failure");\n}',
          },
        },
        {
          heading: "Exception Hierarchy and Custom Exceptions",
          body:
            "Every exception in .NET derives, directly or indirectly, from System.Exception, with common built-in subtypes including ArgumentException (and its more specific ArgumentNullException), InvalidOperationException, and IndexOutOfRangeException, each representing a distinct category of failure. Defining a custom exception (deriving from Exception, or a more specific built-in exception when appropriate) lets application code signal domain-specific failure conditions clearly — an InsufficientFundsException communicates intent far better than a generic Exception or InvalidOperationException would, both to a human reading a stack trace and to calling code that wants to catch that specific failure mode without accidentally also catching unrelated errors.",
          code: {
            language: "csharp",
            code:
              'public class InsufficientFundsException : Exception {\n    public InsufficientFundsException(string message) : base(message) {}\n}\n\npublic class Account {\n    public decimal Balance { get; private set; } = 100;\n\n    public void Withdraw(decimal amount) {\n        if (amount > Balance) {\n            throw new InsufficientFundsException($"Cannot withdraw {amount}; balance is {Balance}");\n        }\n        Balance -= amount;\n    }\n}\n\ntry {\n    new Account().Withdraw(500);\n} catch (InsufficientFundsException ex) {\n    Console.WriteLine(ex.Message);\n}',
          },
        },
        {
          heading: "Best Practices: Specific Catches and Preserving Stack Traces",
          body:
            "Catching the broadest possible type (catch (Exception ex)) and silently swallowing it (an empty catch block, or one that only logs and continues as if nothing happened) hides real bugs and makes production issues far harder to diagnose — catch only the specific exception types you can genuinely recover from, and let everything else propagate upward where it can be properly logged or surfaced. When an exception needs to be re-thrown after some handling, bare throw; (with no exception variable) preserves the original stack trace, while throw ex; resets it to the re-throw point, destroying the information about where the error ACTUALLY originated — this is a subtle but important distinction most developers get wrong the first time they encounter it.",
          bullets: [
            "An empty or logging-only catch block that swallows an exception without re-throwing or genuinely handling it is almost always a bug waiting to surface somewhere else, later, with no useful trace.",
            "throw; (bare, inside a catch block) preserves the original stack trace; throw ex; resets it — always prefer bare throw; when re-throwing.",
          ],
        },
        {
          heading: "Delegates: Defining and Invoking",
          body:
            "A delegate is a type-safe reference to a method matching a specific signature (return type and parameter list) — declaring delegate int Operation(int a, int b); defines a new delegate TYPE that can hold a reference to ANY method matching int Method(int, int), and a variable of that delegate type can then be assigned a specific method and invoked exactly like calling that method directly. This is C#'s type-safe equivalent of C's function pointers, but with the compiler fully verifying signature compatibility at compile time rather than allowing arbitrary pointer-level mismatches.",
          code: {
            language: "csharp",
            code:
              'delegate int Operation(int a, int b); // defines a delegate TYPE\n\nclass MathOps {\n    static int Add(int a, int b) => a + b;\n    static int Multiply(int a, int b) => a * b;\n}\n\nOperation op = MathOps.Add; // delegate variable holding a reference to Add\nConsole.WriteLine(op(3, 4)); // 7\n\nop = MathOps.Multiply; // reassign to a different matching method\nConsole.WriteLine(op(3, 4)); // 12',
          },
        },
        {
          heading: "Multicast Delegates and Events",
          body:
            "A delegate variable can hold references to MULTIPLE methods simultaneously (a multicast delegate) by combining them with the += operator — invoking the delegate then calls every attached method in the order they were added. This is exactly the mechanism behind C#'s event keyword, which wraps a multicast delegate with restricted access (only the declaring class can invoke/raise the event; subscribers can only += or -= their own handler, not invoke it directly or clear others' handlers) — the standard pattern for publish/subscribe notifications throughout .NET, including every UI framework's click/change event handlers.",
          code: {
            language: "csharp",
            code:
              'public class Button {\n    public event Action Clicked; // event based on the built-in Action delegate\n\n    public void SimulateClick() => Clicked?.Invoke(); // ?. guards against zero subscribers\n}\n\nvar button = new Button();\nbutton.Clicked += () => Console.WriteLine("Handler 1 responding");\nbutton.Clicked += () => Console.WriteLine("Handler 2 responding");\n\nbutton.SimulateClick();\n// Handler 1 responding\n// Handler 2 responding',
          },
        },
        {
          heading: "Lambda Expressions as Delegates",
          body:
            "Any delegate variable can be assigned a lambda expression (a concise, inline, unnamed function) instead of a reference to an existing named method — (a, b) => a + b is a lambda matching any delegate type expecting two parameters and returning their sum's type, and this is overwhelmingly the most common way delegates are actually used in modern C# code, especially as arguments to LINQ methods (Where(x => x > 0)) and event handlers for short, one-off logic that doesn't justify a separate named method.",
        },
        {
          heading: "Func<>, Action<>, and Predicate<>: Built-In Delegate Types",
          body:
            "Rather than declaring a custom delegate type for every signature you need, .NET provides three generic built-in delegate families covering the overwhelming majority of real use cases: Func<T1, ..., TResult> represents a method taking the listed parameter types and returning TResult (the LAST type parameter is always the return type); Action<T1, ...> represents a method with no return value (void); and Predicate<T> represents a method taking a T and returning bool, specifically used for filtering/testing logic (though Func<T, bool> is functionally equivalent and often used interchangeably in modern code).",
          code: {
            language: "csharp",
            code:
              'Func<int, int, int> add = (a, b) => a + b;        // takes two ints, returns an int\nAction<string> log = message => Console.WriteLine($"LOG: {message}");\nPredicate<int> isEven = n => n % 2 == 0;\n\nConsole.WriteLine(add(3, 4));   // 7\nlog("Something happened");       // LOG: Something happened\nConsole.WriteLine(isEven(10));  // True',
          },
        },
      ],
      commonPitfalls: [
        "Catching the broadest Exception type and swallowing it silently instead of catching specific, recoverable exception types and letting the rest propagate.",
        "Using throw ex; to re-throw inside a catch block, which resets the stack trace and destroys information about where the error actually originated — use bare throw; instead.",
        "Ordering catch blocks from most general to most specific, causing the general catch to always match first and the specific one to become unreachable.",
        "Forgetting the null-conditional operator (?.) when invoking an event with no subscribers, risking a NullReferenceException.",
        "Confusing Action (no return value) with Func (has a return value) and picking the wrong one for a given delegate parameter.",
        "Never unsubscribing an event handler (-=) when the subscribing object's lifetime is shorter than the publisher's, causing a memory leak by keeping the subscriber alive indefinitely.",
      ],
      keyTakeaways: [
        "catch blocks are checked top to bottom; order them from most specific to most general exception type.",
        "Bare throw; inside a catch block preserves the original stack trace; throw ex; resets it — always prefer bare throw; when re-throwing.",
        "Delegates are type-safe references to methods matching a specific signature; events are a restricted, publish/subscribe-safe wrapper around multicast delegates.",
        "Lambda expressions are the dominant modern way to supply delegate values inline, especially for LINQ and short event handlers.",
        "Func<>, Action<>, and Predicate<> cover almost every common delegate signature without needing a custom delegate type declaration.",
      ],
      links: [
        { label: "Microsoft Learn — Exceptions and exception handling", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/" },
        { label: "Microsoft Learn — Delegates", url: "https://learn.microsoft.com/en-us/dotnet/csharp/delegates-overview" },
      ],
    },
    {
      moduleTitle: "C# Programming",
      subModuleTitle: "Building console & basic .NET apps",
      overview:
        "Writing larger, real console applications moves beyond individual language features into practical project structure — how a .NET project is organized on disk, how to read and validate user input robustly, how to split code across multiple files and namespaces sensibly, how to read configuration and command-line arguments, basic file I/O, and the .NET CLI commands used to build, run, and test a project day to day. This sub-module ties together everything from the earlier C# sub-modules into the shape of an actual small application, closing out the C# module with the practical, project-level knowledge needed to go from individual language features to a working, runnable program a user can actually invoke from a terminal.",
      sections: [
        {
          heading: "Project Structure: .csproj, Program.cs, and Dependencies",
          body:
            "A .NET console project is defined by a .csproj file — an XML project file specifying the target framework (net8.0, for example), any NuGet package dependencies, and build settings — and by convention contains a Program.cs file with the application's entry point. dotnet new console creates this minimal structure automatically. Adding a third-party library is done with dotnet add package PackageName, which downloads it from NuGet and records it as a dependency in the .csproj file, after which its types become available via using statements exactly like built-in .NET types.",
          code: {
            language: "csharp",
            code:
              '// Typical minimal Program.cs (top-level statements style)\nConsole.WriteLine("Starting application...");\n\n// Typical commands run from a terminal in the project folder:\n// dotnet new console -o MyApp      (scaffolds a new console project)\n// dotnet add package Newtonsoft.Json  (adds a NuGet dependency)\n// dotnet build                      (compiles the project)\n// dotnet run                        (builds, then runs it)',
          },
        },
        {
          heading: "Console I/O and Parsing Input",
          body:
            "Console.WriteLine/Write send output to the terminal; Console.ReadLine() reads one line of text typed by the user, always returning it as a string (or null if input was redirected and reached EOF) — numeric input must be explicitly parsed with int.Parse (throws FormatException on invalid text) or the safer int.TryParse (returns a bool success flag and avoids the exception entirely), exactly mirroring the Dictionary TryGetValue pattern from the Collections sub-module. Always validating user input with TryParse rather than assuming it will always be well-formed is the single most important console-app input habit to build early.",
          code: {
            language: "csharp",
            code:
              'Console.Write("Enter your age: ");\nstring? input = Console.ReadLine();\n\nif (int.TryParse(input, out int age)) {\n    Console.WriteLine($"You are {age} years old.");\n} else {\n    Console.WriteLine("That wasn\'t a valid number.");\n}',
          },
        },
        {
          heading: "Organizing Code: Multiple Classes and Namespaces",
          body:
            "As a console application grows beyond a trivial script, splitting it into multiple files — one class per file by convention, grouped into folders that map to namespaces reflecting the project's logical structure (MyApp.Models, MyApp.Services) — keeps the codebase navigable. C# resolves types across files within the same project automatically as long as the correct using directive (or fully-qualified name) is present; there's no separate header-file declaration step the way C/C++ requires, since the compiler processes the whole project together.",
          code: {
            language: "csharp",
            code:
              '// File: Models/Student.cs\nnamespace MyApp.Models {\n    public class Student {\n        public string Name { get; set; } = "";\n        public int Grade { get; set; }\n    }\n}\n\n// File: Program.cs\nusing MyApp.Models;\n\nvar student = new Student { Name = "Asha", Grade = 90 };\nConsole.WriteLine($"{student.Name}: {student.Grade}");',
          },
        },
        {
          heading: "Command-Line Arguments and Basic Configuration",
          body:
            "A console app receives command-line arguments through the args parameter of Main (static void Main(string[] args)) or, in top-level-statements style, directly through an implicit args variable — each argument arrives as a string and, just like Console.ReadLine, must be explicitly parsed into a numeric type if arithmetic is needed. For anything beyond a couple of simple flags, structured configuration (appsettings.json read via the Microsoft.Extensions.Configuration package) is the standard, more scalable approach used in real .NET applications, though plain args parsing is entirely sufficient for small utilities and learning exercises.",
          code: {
            language: "csharp",
            code:
              '// Top-level statements: `args` is available implicitly\nif (args.Length < 2) {\n    Console.WriteLine("Usage: dotnet run <num1> <num2>");\n    return;\n}\n\nif (int.TryParse(args[0], out int a) && int.TryParse(args[1], out int b)) {\n    Console.WriteLine($"Sum = {a + b}");\n} else {\n    Console.WriteLine("Both arguments must be valid integers.");\n}\n// Run as: dotnet run 3 4   ->   Sum = 7',
          },
        },
        {
          heading: "Basic File I/O with System.IO",
          body:
            "The System.IO namespace's File class provides simple, static, synchronous methods for common whole-file operations — File.ReadAllText/File.WriteAllText for an entire file as one string, File.ReadAllLines/File.WriteAllLines for line-by-line text — which is usually sufficient for small console utilities without needing the lower-level StreamReader/StreamWriter classes that offer more control for very large files or streaming scenarios. File operations can throw (FileNotFoundException, UnauthorizedAccessException, IOException for a locked file), so wrapping them in try/catch or checking File.Exists first is standard practice, exactly mirroring the fopen-NULL-check discipline from C's file handling.",
          code: {
            language: "csharp",
            code:
              'string path = "notes.txt";\n\nFile.WriteAllLines(path, new[] { "Line 1", "Line 2", "Line 3" });\n\nif (File.Exists(path)) {\n    string[] lines = File.ReadAllLines(path);\n    foreach (string line in lines) {\n        Console.WriteLine($"Read: {line}");\n    }\n}',
          },
        },
        {
          heading: "The .NET CLI: build, run, and test",
          body:
            "dotnet build compiles the project without running it, useful for catching compile errors quickly or preparing a release build; dotnet run compiles (if needed) and immediately runs the resulting executable, the everyday command used while actively developing; dotnet test runs any test projects referencing a testing framework (xUnit, NUnit, or MSTest) in the solution. Understanding which command does what — and that dotnet run implicitly triggers a build first if the source has changed — avoids confusion when a change doesn't seem to take effect (usually because an old build was run instead of a fresh one, or a build error was silently left unaddressed).",
          bullets: [
            "dotnet run always rebuilds first if source files changed since the last build — there's rarely a need to run dotnet build separately before it during normal development.",
            "dotnet test discovers and runs test projects; it requires a referenced test framework package (xUnit is the most common default for new .NET projects).",
          ],
        },
        {
          heading: "Debugging a Console Application",
          body:
            "Breakpoints set in an IDE (Visual Studio, VS Code with the C# extension) pause execution at a specific line, letting you inspect variable values and step through code one statement at a time — far more effective for understanding a bug's actual cause than scattering Console.WriteLine calls throughout the code, though the latter remains a quick, zero-setup technique for simple cases. Unhandled exceptions in a console app print a full stack trace to the console and terminate the process, which — unlike a crash in C from undefined behavior — at least tells you exactly where and why the failure happened, a direct benefit of the CLR's managed exception model covered earlier in this module.",
        },
      ],
      commonPitfalls: [
        "Calling int.Parse on raw Console.ReadLine() input without validating it first, crashing on any non-numeric input instead of handling it gracefully with int.TryParse.",
        "Forgetting that Console.ReadLine() can return null (e.g., when input is redirected and reaches EOF), and not guarding against it before using the result.",
        "Hardcoding absolute file paths instead of relative paths or Path.Combine, breaking the moment the project is run from a different machine or working directory.",
        "Assuming dotnet build is required before every dotnet run — it's implicitly triggered when needed, so the extra step is usually unnecessary friction.",
        "Not wrapping File I/O operations in try/catch (or checking File.Exists first), crashing on a missing file or a permissions error instead of failing gracefully.",
        "Cramming all application logic into a single Program.cs file as the project grows, instead of splitting it into focused classes and namespaces early.",
      ],
      keyTakeaways: [
        "A .csproj file defines a project's target framework and dependencies; dotnet new/add/build/run/test are the everyday CLI commands for managing it.",
        "Always validate Console.ReadLine()/command-line argument input with TryParse rather than assuming it is well-formed.",
        "Split growing console applications into multiple classes and namespaces early rather than keeping everything in one Program.cs file.",
        "System.IO.File's static methods (ReadAllText, WriteAllLines, etc.) cover most simple whole-file read/write needs without extra setup.",
        "dotnet run implicitly rebuilds when source has changed, making a separate dotnet build step usually unnecessary during normal development.",
      ],
      links: [
        { label: "Microsoft Learn — Tutorial: Create a console application", url: "https://learn.microsoft.com/en-us/dotnet/core/tutorials/with-visual-studio-code" },
        { label: "Microsoft Learn — .NET CLI overview", url: "https://learn.microsoft.com/en-us/dotnet/core/tools/" },
      ],
    },
  ],
};

export default data;
