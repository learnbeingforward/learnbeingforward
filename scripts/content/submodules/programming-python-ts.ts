import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "programming",
  submodules: [
    // ───────────────────────────── Python Programming ─────────────────────────────
    {
      moduleTitle: "Python Programming",
      subModuleTitle: "Python syntax & data types",
      overview:
        "Python's defining trait is that whitespace and a small, consistent grammar carry the structure other languages express with braces and semicolons — which makes code read almost like pseudocode, but also means small indentation mistakes become real bugs instead of style complaints. This sub-module covers the mechanics every later topic assumes: how indentation defines blocks, how variables bind dynamically to objects rather than declaring a fixed type, the core built-in types (int, float, bool, str, None) and how Python decides what's truthy, and the string and formatting tools (slicing, f-strings) used constantly in real code. Getting comfortable with dynamic typing and Python's particular truthiness rules early prevents a long tail of confusing bugs later, especially for anyone arriving with a background in a statically-typed language where these rules work differently.",
      sections: [
        {
          heading: "Indentation, Blocks, and Statements",
          body: "Python uses indentation, not braces, to delimit code blocks — every line inside an if, for, while, def, or class body must be indented consistently (4 spaces is the near-universal convention per PEP 8), and mixing tabs and spaces, or indenting inconsistently within the same block, raises an IndentationError. A colon at the end of a header line (if x:, def f():) always introduces an indented block beneath it. Statements normally end at a newline with no terminator needed, though a backslash or enclosing brackets allow a logical line to span multiple physical lines. Comments start with # and run to the end of the line; there is no single-line block-comment syntax, though a triple-quoted string left unassigned is commonly used as a multi-line docstring or comment.",
          bullets: [
            "A mix of tabs and spaces in the same file is a common source of indentation errors that look fine in one editor but fail in another.",
            "PEP 8 (the official style guide) recommends 4 spaces per indentation level and no tabs — most tooling defaults to this.",
          ],
          code: {
            language: "python",
            code:
              "# Blocks are defined purely by indentation level\nage = 20\nif age >= 18:\n    print(\"Adult\")\n    if age >= 65:\n        print(\"Senior\")\nelse:\n    print(\"Minor\")\n\n# A docstring as the first statement in a function documents it\ndef greet(name: str) -> str:\n    \"\"\"Return a friendly greeting for `name`.\"\"\"\n    return f\"Hello, {name}!\"",
          },
        },
        {
          heading: "Variables and Dynamic Typing",
          body: "A Python variable is just a name bound to an object in memory — there is no type declaration, and the same name can be rebound to a value of a completely different type later (x = 5 then x = \"five\" is legal, if usually a sign of poor naming). The type lives on the object, not the name: type(x) tells you what x currently refers to. Multiple names can be assigned in one line (a, b = 1, 2) and swapped without a temporary variable (a, b = b, a) because the right-hand side is fully evaluated into a tuple before any assignment happens. Since Python 3.6, optional type hints (name: str = \"Ana\") can annotate intent for tooling and readers, but they are not enforced at runtime — they are purely advisory.",
          bullets: [
            "Type hints (x: int) are checked by external tools like mypy, not by the Python interpreter itself at runtime.",
            "a, b = b, a is the idiomatic Python swap — no temporary variable needed.",
          ],
          code: {
            language: "python",
            code:
              "x = 5\nprint(type(x))      # <class 'int'>\nx = \"five\"\nprint(type(x))      # <class 'str'> — same name, new type, nothing enforced\n\na, b = 1, 2\na, b = b, a          # swap: a is now 2, b is now 1\nprint(a, b)          # 2 1",
          },
        },
        {
          heading: "Numeric Types and Arithmetic Operators",
          body: "Python has three built-in numeric types: int (arbitrary precision — Python ints never overflow), float (double-precision), and complex (rarely used outside scientific code). Standard arithmetic operators (+, -, *, /) work as expected, but / always returns a float even for two ints (7 / 2 == 3.5), while // performs floor (integer) division (7 // 2 == 3) and % returns the remainder. ** is the exponent operator (2 ** 10 == 1024), and because Python ints have no fixed size, 2 ** 200 computes exactly with no overflow, unlike fixed-width integer types in many other languages.",
          bullets: [
            "/ always returns a float, even 4 / 2 == 2.0 — use // when you specifically need integer division.",
            "Python ints are arbitrary-precision, so there is no int overflow to worry about, unlike C, Java, or (unboxed) languages with fixed-width integers.",
          ],
          code: {
            language: "python",
            code:
              "print(7 / 2)     # 3.5  (true division, always float)\nprint(7 // 2)    # 3    (floor division)\nprint(7 % 2)     # 1    (remainder)\nprint(2 ** 10)   # 1024 (exponentiation)\nprint(2 ** 200)  # exact, arbitrarily large — no overflow",
          },
        },
        {
          heading: "Strings: Immutability, Slicing, and f-strings",
          body: "Strings are immutable sequences of characters — every 'modification' (upper(), replace(), concatenation) returns a brand-new string rather than changing the original in place. Slicing (s[start:stop:step]) extracts a substring without mutating s, and negative indices count from the end (s[-1] is the last character). f-strings (introduced in 3.6, now the standard way to format text) embed expressions directly inside {} braces, including format specifiers for decimals, padding, and alignment, and are both faster and more readable than the older % or str.format() styles.",
          bullets: [
            "s[::-1] reverses a string via slicing — a common idiom, not a dedicated reverse() method (strings have no such method).",
            "f\"{value:.2f}\" formats a float to exactly two decimal places directly inside an f-string.",
          ],
          code: {
            language: "python",
            code:
              "name = \"Alice\"\nprice = 19.999\n\nprint(name[0])        # 'A'\nprint(name[-1])       # 'e'\nprint(name[1:4])      # 'lic'\nprint(name[::-1])     # 'ecilA'\n\nprint(f\"{name} owes ${price:.2f}\")  # Alice owes $20.00",
          },
        },
        {
          heading: "Booleans, None, and Truthiness",
          body: "bool is technically a subclass of int (True == 1 and False == 0 both hold), which is why booleans can be summed directly to count True values. None is Python's singleton 'absence of a value,' distinct from False, 0, or an empty string — always compare against it with is None, never == None, since is checks identity rather than relying on (possibly overridden) equality. In a boolean context (if, while, bool(x)), every object is truthy except a specific list of falsy values: False, None, 0, 0.0, and any empty collection (\"\", [], {}, set()) — this lets idioms like if not my_list: double as both an existence check and an emptiness check.",
          bullets: [
            "Use `x is None` / `x is not None`, never `x == None` — is checks identity, which is the correct, idiomatic test for the None singleton.",
            "sum([True, True, False, True]) == 3, since booleans behave as 1/0 in arithmetic contexts.",
          ],
          code: {
            language: "python",
            code:
              "value = None\nif value is None:\n    print(\"No value provided\")\n\nempty_list = []\nif not empty_list:\n    print(\"List is empty\")   # falsy: empty collections are falsy\n\nscores = [True, False, True, True]\nprint(sum(scores))  # 3",
          },
        },
        {
          heading: "Type Conversion and Checking",
          body: "Built-in functions int(), float(), str(), bool(), and list() convert a value to that type where a sensible conversion exists — int(\"42\") works, but int(\"abc\") raises a ValueError, so converting unvalidated input should be wrapped in a try/except. type(x) returns an object's exact class, while isinstance(x, SomeType) is almost always preferable for checks because it also respects inheritance (a bool passed to isinstance(x, int) returns True, since bool subclasses int) and accepts a tuple of types to check against several at once.",
          bullets: [
            "isinstance(x, (int, float)) checks against multiple types in one call — cleaner than chaining `or`.",
            "int(\"3.5\") raises ValueError; convert through float first — int(float(\"3.5\")) — if truncation is intended.",
          ],
          code: {
            language: "python",
            code:
              "raw = \"42\"\ntry:\n    number = int(raw)\nexcept ValueError:\n    number = None\n\nprint(isinstance(True, int))        # True — bool is a subclass of int\nprint(isinstance(3.5, (int, float)))  # True",
          },
        },
        {
          heading: "The Walrus Operator and Expression Assignment",
          body: "Introduced in Python 3.8, the walrus operator (:=) assigns a value to a name as part of a larger expression, which is especially useful for avoiding a redundant second computation inside a while loop condition or a comprehension filter. It's syntax sugar for readability and efficiency, not a new capability — anything written with := could be rewritten with an extra line of plain assignment, but the inline form keeps related logic visually together.",
          bullets: [
            "Most useful in while loops reading input/data, and in list comprehensions that filter on a computed value without recomputing it.",
          ],
          code: {
            language: "python",
            code:
              "data = [1, 4, 9, 16, 25, 36]\n\n# Keep values whose square root is a whole number greater than 3\nresults = [root for n in data if (root := n ** 0.5) > 3 and root.is_integer()]\nprint(results)  # [16.0, 25.0, 36.0]",
          },
        },
      ],
      commonPitfalls: [
        "Mixing tabs and spaces for indentation, producing errors that may not even show up consistently across editors.",
        "Using == None instead of is None to check for Python's None singleton.",
        "Assuming / performs integer division like in some other languages — in Python 3, / always returns a float; use // for floor division.",
        "Forgetting that strings are immutable, writing `s.upper()` on its own line and expecting `s` itself to change.",
        "Treating an empty string, 0, or an empty list as equivalent to None, rather than using explicit `is None` checks when None specifically matters.",
        "Calling int() or float() directly on unvalidated user input without a try/except, crashing the program on a ValueError.",
      ],
      keyTakeaways: [
        "Indentation is syntactically significant in Python — it replaces braces as the way blocks are delimited.",
        "Variables are names bound to objects; the type lives on the object, and the same name can be rebound to a different type.",
        "/ always returns a float; // performs floor division; Python ints are arbitrary-precision and never overflow.",
        "Strings are immutable — every string method returns a new string rather than mutating in place.",
        "Falsy values are False, None, 0, 0.0, and empty collections — everything else is truthy in a boolean context.",
        "Prefer isinstance() over type() for type checks, since it correctly handles inheritance (e.g., bool is a subclass of int).",
      ],
      links: [
        { label: "Python Docs — The Python Tutorial: An Informal Introduction", url: "https://docs.python.org/3/tutorial/introduction.html" },
        { label: "Python Docs — Built-in Types", url: "https://docs.python.org/3/library/stdtypes.html" },
        { label: "PEP 8 — Style Guide for Python Code", url: "https://peps.python.org/pep-0008/" },
      ],
    },
    {
      moduleTitle: "Python Programming",
      subModuleTitle: "Control flow & functions",
      overview:
        "Control flow determines the order code executes in, and functions are how that logic gets packaged into reusable, testable units — together they're the backbone of every Python program beyond a single script. This sub-module covers conditional branching, the for/while loop forms and their less-familiar loop-else clause, Python 3.10's structural pattern matching (match/case) as a cleaner alternative to long if/elif chains, and function mechanics in depth: default arguments, *args/**kwargs for flexible call signatures, variable scope and the global/nonlocal keywords, lambda expressions, and the basics of decorators — a pattern used constantly in real frameworks (Flask routes, pytest fixtures) that's worth understanding from first principles rather than treating as magic.",
      sections: [
        {
          heading: "Conditional Branching: if / elif / else",
          body: "Python's conditional statement is if, with optional elif branches for additional conditions and a final optional else for the fallback case — there is no switch statement in the classic sense (match/case, covered below, fills that role from 3.10 onward). Conditions can be chained for comparisons in a way many languages don't support: 0 <= age < 18 reads naturally and evaluates exactly as a mathematician would expect, rather than requiring two separate comparisons joined by and.",
          bullets: [
            "Chained comparisons like 0 <= x < 100 are valid Python and more readable than (0 <= x) and (x < 100).",
            "elif is Python's spelling of 'else if' — there's no separate elseif or else if keyword.",
          ],
          code: {
            language: "python",
            code:
              "def classify_age(age: int) -> str:\n    if age < 0:\n        return \"invalid\"\n    elif age < 13:\n        return \"child\"\n    elif age < 20:\n        return \"teenager\"\n    else:\n        return \"adult\"\n\nprint(classify_age(15))  # teenager",
          },
        },
        {
          heading: "Loops: for, while, range(), enumerate(), and zip()",
          body: "A for loop in Python iterates directly over any iterable (a list, string, dict, or the output of range()) rather than managing an index manually, which is both more readable and less error-prone than an index-based C-style loop. range(start, stop, step) generates a lazy sequence of integers. enumerate(iterable) yields (index, value) pairs when the index is genuinely needed, and zip(a, b) pairs up corresponding elements from multiple iterables for parallel iteration — both are idiomatic replacements for manual index bookkeeping. while loops run as long as a condition holds and are the right choice when the number of iterations isn't known in advance.",
          bullets: [
            "Prefer `for item in items` or `for i, item in enumerate(items)` over manually indexing with `for i in range(len(items))`.",
            "zip() stops at the shortest input iterable, silently dropping extra elements from longer ones.",
          ],
          code: {
            language: "python",
            code:
              "names = [\"Asha\", \"Ben\", \"Cy\"]\nscores = [88, 92, 79]\n\nfor i, name in enumerate(names, start=1):\n    print(f\"{i}. {name}\")\n\nfor name, score in zip(names, scores):\n    print(f\"{name}: {score}\")",
          },
        },
        {
          heading: "break, continue, and the Loop else Clause",
          body: "break exits a loop immediately; continue skips to the next iteration without finishing the current one. A less familiar feature is the for...else / while...else clause: the else block runs only if the loop completed without hitting a break, which makes it a clean way to express 'search and act only if nothing was found,' avoiding a separate found-flag variable.",
          bullets: [
            "The loop's else clause runs when the loop finishes normally (no break) — it does not run after a break.",
          ],
          code: {
            language: "python",
            code:
              "def find_first_even(numbers: list[int]) -> int | None:\n    for n in numbers:\n        if n % 2 == 0:\n            print(f\"Found even number: {n}\")\n            break\n    else:\n        print(\"No even number found\")\n        return None\n    return n\n\nfind_first_even([1, 3, 5, 7])   # No even number found\nfind_first_even([1, 3, 4, 7])   # Found even number: 4",
          },
        },
        {
          heading: "Structural Pattern Matching with match/case",
          body: "Python 3.10 introduced match/case, which is far more powerful than a simple switch — it can match literal values, destructure sequences and dictionaries by shape, bind matched sub-values to names, and attach guard conditions with if. It's most valuable when a long elif chain is really checking the 'shape' of a value (a tuple's length, a dict's keys) rather than a single scalar — in those cases match/case reads far more clearly than nested isinstance/len checks.",
          bullets: [
            "The underscore `_` is the wildcard pattern that matches anything, playing the role of a `default` case.",
            "Patterns can destructure directly: `case (x, y):` binds x and y from a 2-element sequence in one line.",
          ],
          code: {
            language: "python",
            code:
              "def handle_command(command: tuple) -> str:\n    match command:\n        case (\"move\", x, y):\n            return f\"Moving to ({x}, {y})\"\n        case (\"stop\",):\n            return \"Stopping\"\n        case (\"speed\", value) if value > 100:\n            return \"Speed too high!\"\n        case _:\n            return \"Unknown command\"\n\nprint(handle_command((\"move\", 3, 4)))      # Moving to (3, 4)\nprint(handle_command((\"speed\", 150)))      # Speed too high!",
          },
        },
        {
          heading: "Defining Functions: Defaults, *args, and **kwargs",
          body: "Functions are defined with def, and parameters can have default values (used when the caller omits that argument), must be listed after any non-default parameters. *args collects any extra positional arguments into a tuple, and **kwargs collects extra keyword arguments into a dict — both allow a function to accept a flexible, variable-length call signature, which is how libraries build decorators and wrapper functions that forward arguments to another function without knowing its exact signature in advance.",
          bullets: [
            "A mutable default argument (def f(items=[])) is a classic Python trap — the same list object is reused across every call that doesn't pass its own; use `items=None` and create the list inside the function instead.",
            "Keyword-only arguments can be forced by placing a bare `*` in the parameter list before them.",
          ],
          code: {
            language: "python",
            code:
              "def build_profile(name: str, *hobbies: str, **extra_info) -> dict:\n    return {\"name\": name, \"hobbies\": hobbies, **extra_info}\n\nprofile = build_profile(\"Nia\", \"chess\", \"hiking\", age=29, city=\"Nairobi\")\nprint(profile)\n# {'name': 'Nia', 'hobbies': ('chess', 'hiking'), 'age': 29, 'city': 'Nairobi'}",
          },
        },
        {
          heading: "Scope, global, and nonlocal",
          body: "A name assigned inside a function is local to that function by default, even if a name with the same spelling exists at module level — Python decides this statically by scanning the function body for any assignment to that name. To modify a module-level (global) variable from inside a function, the global keyword must declare the intent explicitly; to modify a variable from an enclosing (but not global) function in a nested function, nonlocal is used instead. Relying on either sparingly is good practice — passing values in and returning results out is almost always clearer than mutating shared state through scope keywords.",
          code: {
            language: "python",
            code:
              "counter = 0\n\ndef increment():\n    global counter\n    counter += 1\n\nincrement()\nincrement()\nprint(counter)  # 2\n\ndef make_accumulator():\n    total = 0\n    def add(amount):\n        nonlocal total\n        total += amount\n        return total\n    return add\n\nacc = make_accumulator()\nprint(acc(5))  # 5\nprint(acc(3))  # 8",
          },
        },
        {
          heading: "Lambda Functions and Higher-Order Functions",
          body: "A lambda is a small, unnamed, single-expression function — lambda x, y: x + y is exactly equivalent to a def with one return statement, just without a name and limited to one expression (no statements, no multiple lines). Lambdas are most useful as a short throwaway `key` function passed to sorted(), max(), or min(), rather than as a replacement for regular function definitions, which remain more readable for anything beyond a one-liner.",
          bullets: [
            "If a lambda needs a name to be referenced more than once, it should usually just be a regular `def` function instead.",
          ],
          code: {
            language: "python",
            code:
              "people = [(\"Ana\", 32), (\"Ben\", 24), (\"Cy\", 45)]\n\n# Sort by age (the second tuple element) using a lambda as the key\nsorted_by_age = sorted(people, key=lambda person: person[1])\nprint(sorted_by_age)  # [('Ben', 24), ('Ana', 32), ('Cy', 45)]",
          },
        },
        {
          heading: "Decorators: Wrapping Functions With Extra Behavior",
          body: "A decorator is a function that takes another function and returns a new function that wraps it with extra behavior — logging, timing, access control — without modifying the original function's own code. The @decorator_name syntax above a function definition is pure sugar for my_func = decorator_name(my_func). Writing one from scratch (rather than just using framework-provided ones) makes clear that decorators are ordinary functions and closures underneath, nothing more exotic.",
          bullets: [
            "functools.wraps should wrap the inner function to preserve the original function's __name__ and docstring — omitting it is a common, subtle decorator bug.",
          ],
          code: {
            language: "python",
            code:
              "import functools\nimport time\n\ndef timed(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        elapsed = time.perf_counter() - start\n        print(f\"{func.__name__} took {elapsed:.4f}s\")\n        return result\n    return wrapper\n\n@timed\ndef slow_square(n: int) -> int:\n    time.sleep(0.1)\n    return n * n\n\nslow_square(5)  # prints: slow_square took ~0.1000s",
          },
        },
      ],
      commonPitfalls: [
        "Using a mutable default argument (def f(items=[])) and being surprised that the same list persists and accumulates across unrelated calls.",
        "Writing manual index-based for loops (`for i in range(len(items))`) instead of iterating directly or using enumerate().",
        "Forgetting the loop's `else` clause only runs when the loop completes without a `break`, not whenever the loop 'finishes' in general.",
        "Omitting the `global` keyword when trying to reassign a module-level variable inside a function, creating an unrelated local variable instead.",
        "Writing a multi-line or multi-statement lambda attempt — lambdas are restricted to a single expression and cannot contain statements.",
        "Forgetting `functools.wraps` in a custom decorator, which silently replaces the wrapped function's `__name__` and docstring with the wrapper's.",
      ],
      keyTakeaways: [
        "Chained comparisons (0 <= x < 100) and the for/while `else` clause are idiomatic Python features with no direct equivalent in many other languages.",
        "match/case (3.10+) is for matching the *shape* of data (sequences, mappings), not just a value — it's more powerful than a simple switch.",
        "*args and **kwargs let a function accept a flexible, variable-length signature, which is how wrapper functions and decorators forward arbitrary calls.",
        "Never use a mutable object as a default argument — use None and create the mutable value inside the function body instead.",
        "global and nonlocal are the two keywords for intentionally modifying a non-local variable; absent either, assignment always creates a new local name.",
        "A decorator is just a function that takes a function and returns a (usually wrapping) function — the @ syntax is sugar for manual reassignment.",
      ],
      links: [
        { label: "Python Docs — More Control Flow Tools", url: "https://docs.python.org/3/tutorial/controlflow.html" },
        { label: "Python Docs — PEP 634: Structural Pattern Matching", url: "https://peps.python.org/pep-0634/" },
        { label: "Real Python — Primer on Python Decorators", url: "https://realpython.com/primer-on-python-decorators/" },
      ],
    },
    {
      moduleTitle: "Python Programming",
      subModuleTitle: "Data structures — lists, dicts, sets",
      overview:
        "Python's four built-in collection types — lists, tuples, dictionaries, and sets — cover the overwhelming majority of real-world data-shaping needs, and choosing the right one for a given problem (ordered and mutable vs. immutable vs. unique-only vs. key-lookup) is one of the most practically useful skills in the language. This sub-module covers each structure's core operations and performance characteristics, the list/dict/set comprehension syntax that makes Python code notably more concise than equivalent loop-based code in many other languages, and the shallow-vs-deep copy distinction that trips up even experienced developers once nested structures are involved. By the end, choosing between a list, a set, and a dict for a new piece of code should be an immediate, almost reflexive decision based on the access pattern needed.",
      sections: [
        {
          heading: "Lists: Ordered, Mutable Sequences",
          body: "A list is an ordered, mutable, heterogeneous collection — index-based access (lst[i]) and slicing (lst[a:b]) are O(1) and O(k) respectively, while searching for a value with `in` is O(n) since it scans sequentially. Lists support in-place mutation (append, insert, remove, pop, sort), which matters because several of these return None rather than a new list — calling `sorted_list = my_list.sort()` is a classic bug, since .sort() mutates in place and returns None.",
          bullets: [
            "list.append(x) adds to the end in O(1) amortized time; list.insert(0, x) is O(n) since every later element must shift.",
            ".sort() mutates in place and returns None; the built-in sorted() returns a new sorted list and leaves the original untouched.",
          ],
          code: {
            language: "python",
            code:
              "numbers = [5, 2, 8, 1]\nnumbers.append(9)          # [5, 2, 8, 1, 9]\nnumbers.sort()             # mutates in place: [1, 2, 5, 8, 9]\n\noriginal = [3, 1, 2]\nnew_list = sorted(original)  # original stays [3, 1, 2]; new_list is [1, 2, 3]",
          },
        },
        {
          heading: "List Comprehensions",
          body: "A list comprehension — [expression for item in iterable if condition] — builds a new list in a single, readable line and is generally both faster and more idiomatic than the equivalent manual loop with .append() calls. Comprehensions can nest, filter with an `if` clause, and even include a conditional expression that changes the mapped value itself (not just whether it's included), though deeply nested comprehensions should usually be rewritten as a plain loop once they stop being readable at a glance.",
          bullets: [
            "[x for x in range(10) if x % 2 == 0] filters; [x if x % 2 == 0 else -x for x in range(10)] transforms every element conditionally — these are different patterns and easy to confuse.",
          ],
          code: {
            language: "python",
            code:
              "squares = [n ** 2 for n in range(10)]\neven_squares = [n ** 2 for n in range(10) if n % 2 == 0]\nflattened = [x for row in [[1, 2], [3, 4], [5]] for x in row]\n\nprint(even_squares)  # [0, 4, 16, 36, 64]\nprint(flattened)     # [1, 2, 3, 4, 5]",
          },
        },
        {
          heading: "Tuples: Immutable, Ordered Sequences",
          body: "A tuple looks like a list but cannot be modified after creation — no append, no item assignment. That immutability makes tuples hashable (when their contents are also hashable), so they can be used as dictionary keys or set members, which plain lists cannot. Tuples are also the natural return type for a function returning multiple values, since `return a, b` implicitly packs a tuple, and the caller can unpack it directly (`x, y = get_point()`).",
          bullets: [
            "A single-element tuple needs a trailing comma: (5,) is a tuple, but (5) is just the int 5 in parentheses.",
            "Because tuples are hashable (if their elements are), they can be dict keys — lists never can be, since lists are mutable.",
          ],
          code: {
            language: "python",
            code:
              "def min_max(values: list[int]) -> tuple[int, int]:\n    return min(values), max(values)\n\nlow, high = min_max([4, 1, 9, 2])\nprint(low, high)  # 1 9\n\ndistances = {(0, 0): 0, (1, 1): 1.41}  # tuples as dict keys",
          },
        },
        {
          heading: "Dictionaries: Key-Value Mappings",
          body: "A dict maps unique, hashable keys to values with average O(1) lookup, insertion, and deletion — by far the most common structure for 'look something up by name/id' problems. Since Python 3.7, dicts preserve insertion order as a language guarantee (not just an implementation detail). .get(key, default) avoids a KeyError for a missing key (plain dict[key] raises one), and dict comprehensions ({k: v for k, v in ...}) build dictionaries with the same conciseness as list comprehensions.",
          bullets: [
            "dict[key] raises KeyError if the key is absent; .get(key, default) returns the default instead — prefer .get() when a missing key is an expected possibility.",
            "Iterating `for key, value in my_dict.items()` is the idiomatic way to get both the key and value together.",
          ],
          code: {
            language: "python",
            code:
              "inventory = {\"apples\": 50, \"bananas\": 30}\ninventory[\"cherries\"] = 15           # add a new key\nprint(inventory.get(\"grapes\", 0))    # 0 — no KeyError\n\ndoubled = {k: v * 2 for k, v in inventory.items()}\nprint(doubled)  # {'apples': 100, 'bananas': 60, 'cherries': 30}",
          },
        },
        {
          heading: "Sets: Unordered Collections of Unique Items",
          body: "A set stores unique, hashable items with no guaranteed order and offers O(1) average membership testing (`x in my_set`) — far faster than the O(n) membership check on a list once the collection grows large. Sets directly implement mathematical set operations: union (|), intersection (&), difference (-), and symmetric difference (^), which makes them the right structure for deduplication and for comparing two collections for overlap or difference.",
          bullets: [
            "set(my_list) is the standard idiom for deduplicating a list while discarding order — wrap it in list() again if order genuinely doesn't matter afterward.",
            "Sets cannot contain unhashable items (like lists or other sets) as elements, only hashable ones (numbers, strings, tuples of hashables).",
          ],
          code: {
            language: "python",
            code:
              "a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\n\nprint(a & b)   # {3, 4}        intersection\nprint(a | b)   # {1,2,3,4,5,6} union\nprint(a - b)   # {1, 2}        difference\n\ndeduped = list(set([1, 2, 2, 3, 3, 3]))  # order not guaranteed: e.g. [1, 2, 3]",
          },
        },
        {
          heading: "Choosing the Right Structure",
          body: "The choice usually comes down to the access pattern a problem actually needs: use a list when order matters and you'll mostly iterate or index sequentially; a tuple when the data is fixed-size and shouldn't change (coordinates, a database row); a dict when you need fast lookup by a meaningful key; and a set when you only care about membership and uniqueness, not order or associated values. Picking a list and then doing `if x in my_list` repeatedly inside a loop is a frequent and avoidable performance mistake — converting to a set first turns an O(n²) pattern into O(n).",
          bullets: [
            "`if x in collection` is O(n) for a list/tuple but O(1) average for a set or dict's keys — a very common, very fixable performance bug.",
          ],
        },
        {
          heading: "Shallow Copy vs. Deep Copy",
          body: "Assigning a_list = b_list copies the reference, not the data — both names point to the exact same list. list(b_list) or b_list.copy() creates a shallow copy: a new outer list, but any nested mutable objects inside it (a list of lists, for example) are still shared references to the same inner objects. To fully duplicate a nested structure so that no level shares memory with the original, copy.deepcopy() from the standard library's copy module recursively copies every nested level.",
          bullets: [
            "A shallow copy is enough when the collection holds only immutable elements (ints, strings, tuples); once it holds nested lists/dicts, a shallow copy still shares those inner objects.",
          ],
          code: {
            language: "python",
            code:
              "import copy\n\noriginal = [[1, 2], [3, 4]]\nshallow = original.copy()\ndeep = copy.deepcopy(original)\n\nshallow[0].append(99)   # mutates the SHARED inner list\nprint(original)         # [[1, 2, 99], [3, 4]] — original was affected too!\n\ndeep[1].append(100)\nprint(original)         # [[1, 2, 99], [3, 4]] — unaffected by the deep copy's change",
          },
        },
      ],
      commonPitfalls: [
        "Writing `my_list = my_list.sort()`, forgetting that .sort() mutates in place and returns None — the variable now holds None, not a sorted list.",
        "Using `dict[key]` when the key might legitimately be missing, crashing with a KeyError instead of using .get(key, default).",
        "Repeatedly checking `if x in my_list` inside a loop over a large list instead of converting to a set first for O(1) membership checks.",
        "Trying to use a list as a dictionary key or a set element, forgetting that only hashable (effectively immutable) types are allowed.",
        "Assuming `new = old.copy()` fully duplicates a nested structure — a shallow copy still shares any nested mutable objects with the original.",
        "Forgetting the trailing comma needed to make a single-element tuple: (5) is just the int 5, not a tuple.",
      ],
      keyTakeaways: [
        "Lists: ordered, mutable, O(1) index access, O(n) membership check. Use when order matters and you mostly iterate/index.",
        "Tuples: ordered, immutable, hashable if contents are — the natural choice for fixed-size records and multi-value returns.",
        "Dicts: unique hashable keys to values, O(1) average lookup, insertion-ordered since Python 3.7 — the default choice for 'look up by key.'",
        "Sets: unique, unordered, O(1) average membership test, support union/intersection/difference directly — ideal for deduplication and overlap checks.",
        "List/dict/set comprehensions are the idiomatic, usually-faster alternative to building a collection with a manual loop and repeated .append()/assignment.",
        "Shallow copies share nested mutable objects with the original; use copy.deepcopy() when a fully independent nested structure is required.",
      ],
      links: [
        { label: "Python Docs — Data Structures", url: "https://docs.python.org/3/tutorial/datastructures.html" },
        { label: "Python Docs — copy: Shallow and Deep Copy Operations", url: "https://docs.python.org/3/library/copy.html" },
        { label: "Python Docs — Mapping Types (dict)", url: "https://docs.python.org/3/library/stdtypes.html#mapping-types-dict" },
      ],
    },
    {
      moduleTitle: "Python Programming",
      subModuleTitle: "OOP in Python",
      overview:
        "Object-oriented programming in Python bundles data and the behavior that acts on it into classes, and while Python's OOP is intentionally less ceremonious than Java's or C++'s (no mandatory access modifiers, no explicit interfaces), the core ideas — encapsulation, inheritance, and polymorphism — work the same way underneath. This sub-module covers class and instance fundamentals, the instance-vs-class attribute distinction that regularly confuses newcomers, inheritance and super(), Python's convention-based (rather than enforced) approach to encapsulation via properties, the dunder methods that let custom objects integrate with built-in functions like print() and len(), duck-typing-driven polymorphism, formal abstract base classes for when an explicit contract is actually needed, and the dataclasses module that eliminates most of the boilerplate in simple data-holding classes.",
      sections: [
        {
          heading: "Classes, Objects, and __init__",
          body: "A class is a blueprint for objects; __init__ is the initializer method Python calls automatically right after a new instance is created, and is where instance attributes are typically set via self. self is the instance itself, passed automatically as the first argument to every instance method — it is a naming convention (not a keyword), though changing it is strongly discouraged since every Python developer expects it. Creating an object is just calling the class like a function: ClassName(args).",
          code: {
            language: "python",
            code:
              "class Dog:\n    def __init__(self, name: str, breed: str):\n        self.name = name\n        self.breed = breed\n\n    def bark(self) -> str:\n        return f\"{self.name} says Woof!\"\n\nrex = Dog(\"Rex\", \"Labrador\")\nprint(rex.bark())  # Rex says Woof!",
          },
        },
        {
          heading: "Instance Attributes vs. Class Attributes",
          body: "An attribute defined inside __init__ via self.x = ... belongs to that specific instance; an attribute defined directly in the class body (outside any method) is a class attribute, shared by every instance unless an instance later sets its own attribute of the same name, which shadows the class attribute for that instance only. This distinction matters most with mutable class attributes: a mutable default like a list, assigned at the class level, is shared across all instances and mutating it through one instance silently affects every other instance too.",
          bullets: [
            "A mutable class attribute (e.g. `tags = []` in the class body) is shared by every instance — mutate it via self.tags.append(...) and ALL instances see the change.",
            "Class attributes are accessible via either the class or an instance (Dog.species or rex.species); instance attributes only exist on that specific instance.",
          ],
          code: {
            language: "python",
            code:
              "class Dog:\n    species = \"Canis familiaris\"  # class attribute — shared by all instances\n\n    def __init__(self, name: str):\n        self.name = name          # instance attribute — unique per instance\n\na = Dog(\"Rex\")\nb = Dog(\"Fido\")\nprint(a.species, b.species)  # Canis familiaris Canis familiaris\n\nDog.species = \"Canis lupus familiaris\"  # changes it for every instance\nprint(a.species)  # Canis lupus familiaris",
          },
        },
        {
          heading: "Inheritance and super()",
          body: "A class can inherit from another by listing it in parentheses (class Puppy(Dog):), gaining all of the parent's methods and attributes while being free to override any of them. super() returns a proxy to the parent class, letting a subclass's overridden method call the parent's original implementation instead of fully replacing it — this is the standard way to extend __init__ in a subclass without duplicating the parent's setup logic.",
          code: {
            language: "python",
            code:
              "class Animal:\n    def __init__(self, name: str):\n        self.name = name\n\n    def speak(self) -> str:\n        return f\"{self.name} makes a sound\"\n\nclass Dog(Animal):\n    def __init__(self, name: str, breed: str):\n        super().__init__(name)   # reuse Animal's init instead of repeating it\n        self.breed = breed\n\n    def speak(self) -> str:      # override\n        return f\"{self.name} barks\"\n\nprint(Dog(\"Rex\", \"Lab\").speak())  # Rex barks",
          },
        },
        {
          heading: "Encapsulation: Naming Conventions and Properties",
          body: "Python has no true private attributes enforced by the language — a single leading underscore (_name) is a convention meaning 'internal, don't touch from outside,' and a double leading underscore (__name) triggers name-mangling (rewritten internally as _ClassName__name) to avoid accidental clashes in subclasses, but neither is truly inaccessible. The @property decorator is the idiomatic way to expose a method as if it were a plain attribute, which lets validation or computed logic run on get/set without changing the calling code's syntax from attribute access to method calls.",
          bullets: [
            "A single underscore prefix (_x) is purely a convention signaling 'internal use' — Python does not prevent external access.",
            "@property with a matching @x.setter lets `obj.x = value` run validation logic transparently, instead of requiring `obj.set_x(value)`.",
          ],
          code: {
            language: "python",
            code:
              "class Account:\n    def __init__(self, balance: float):\n        self._balance = balance\n\n    @property\n    def balance(self) -> float:\n        return self._balance\n\n    @balance.setter\n    def balance(self, value: float):\n        if value < 0:\n            raise ValueError(\"Balance cannot be negative\")\n        self._balance = value\n\nacc = Account(100)\nacc.balance = 50       # runs the setter's validation\nprint(acc.balance)     # 50 — reads like a plain attribute, runs like a method",
          },
        },
        {
          heading: "Dunder Methods: Integrating With Built-ins",
          body: "'Dunder' (double-underscore) methods let a custom class plug into Python's built-in syntax and functions. __str__ controls what str(obj) and print(obj) show (a human-readable form); __repr__ controls the unambiguous developer-facing representation shown in a REPL or debugger (and is used as a fallback if __str__ isn't defined); __eq__ controls == comparisons; __len__ lets len(obj) work. Defining these turns a custom class into something that behaves like a 'real' Python type throughout the standard library, rather than needing special-cased handling everywhere it's used.",
          bullets: [
            "If __eq__ is defined but __hash__ is not explicitly kept, instances become unhashable by default and can't be used in sets or as dict keys.",
            "A good convention: __repr__ should ideally look like valid Python code that could recreate the object.",
          ],
          code: {
            language: "python",
            code:
              "class Point:\n    def __init__(self, x: float, y: float):\n        self.x, self.y = x, y\n\n    def __str__(self) -> str:\n        return f\"({self.x}, {self.y})\"\n\n    def __repr__(self) -> str:\n        return f\"Point(x={self.x}, y={self.y})\"\n\n    def __eq__(self, other) -> bool:\n        return isinstance(other, Point) and self.x == other.x and self.y == other.y\n\np1, p2 = Point(1, 2), Point(1, 2)\nprint(p1)          # (1, 2)          — via __str__\nprint(p1 == p2)    # True            — via __eq__",
          },
        },
        {
          heading: "Polymorphism and Duck Typing",
          body: "Polymorphism means code written against one interface works correctly with many different types that implement it — in Python this is almost always achieved through duck typing ('if it walks like a duck and quacks like a duck, treat it as a duck') rather than requiring a shared formal base class: a function calling obj.speak() works with any object that has a .speak() method, regardless of its class hierarchy. This makes Python code highly flexible, but also means a typo'd or missing method surfaces only at runtime (an AttributeError), not at compile time, since there's no compiler enforcing the contract in advance.",
          code: {
            language: "python",
            code:
              "class Dog:\n    def speak(self): return \"Woof\"\n\nclass Cat:\n    def speak(self): return \"Meow\"\n\nclass Duck:\n    def speak(self): return \"Quack\"\n\nfor animal in [Dog(), Cat(), Duck()]:\n    print(animal.speak())  # works for all three — no shared base class required",
          },
        },
        {
          heading: "Abstract Base Classes",
          body: "When duck typing's implicit contract isn't strict enough — when you genuinely want to force every subclass to implement certain methods, and fail loudly at instantiation time if they don't — the abc module's ABC base class and @abstractmethod decorator provide that. A class inheriting from ABC with one or more @abstractmethod-decorated methods cannot be instantiated directly until every abstract method is overridden in a concrete subclass, giving Python something close to a formal interface when a codebase's design genuinely calls for one.",
          code: {
            language: "python",
            code:
              "from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self) -> float:\n        ...\n\nclass Circle(Shape):\n    def __init__(self, radius: float):\n        self.radius = radius\n\n    def area(self) -> float:\n        return 3.14159 * self.radius ** 2\n\n# Shape()  # TypeError: Can't instantiate abstract class Shape\nprint(Circle(2).area())  # 12.56636",
          },
        },
        {
          heading: "Dataclasses: Removing Boilerplate",
          body: "Simple classes that mostly just hold data traditionally require a lot of repetitive boilerplate: an __init__ assigning every field, a __repr__ for readable printing, and __eq__ for comparing instances by value. The @dataclass decorator (from the dataclasses module, standard since 3.7) generates all three automatically from type-annotated class-level field declarations, which keeps such classes short while still behaving like full-featured, comparison-aware objects.",
          bullets: [
            "@dataclass(frozen=True) makes instances immutable after construction, which also makes them hashable by default — useful for value-like objects.",
          ],
          code: {
            language: "python",
            code:
              "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n\np1 = Point(1, 2)\np2 = Point(1, 2)\nprint(p1)          # Point(x=1, y=2)  — __repr__ generated automatically\nprint(p1 == p2)     # True             — __eq__ generated automatically",
          },
        },
      ],
      commonPitfalls: [
        "Using a mutable class-level attribute (like a list) as if it were per-instance state, then being surprised that every instance shares the same mutations.",
        "Forgetting super().__init__(...) in a subclass's __init__, leaving the parent class's setup logic never run.",
        "Believing a single or double leading underscore makes an attribute truly private — Python only discourages external access by convention, it does not enforce it.",
        "Defining __eq__ without considering that it removes the default __hash__, making instances suddenly unusable as dict keys or in sets.",
        "Writing a full class with just __init__, a handful of fields, and manual __repr__/__eq__ when @dataclass would generate all of that automatically.",
        "Reaching for abc.ABC and @abstractmethod reflexively when plain duck typing is sufficient for the use case — ABCs add ceremony that isn't always needed in Python.",
      ],
      keyTakeaways: [
        "self is the instance, passed automatically to every instance method; __init__ runs automatically right after object creation to set up instance state.",
        "Class attributes are shared across all instances unless shadowed by an instance attribute of the same name — be careful with mutable class attributes.",
        "super() calls the parent class's version of a method, most commonly used to extend (not replace) __init__ in a subclass.",
        "Dunder methods (__str__, __repr__, __eq__, __len__, ...) are how a custom class plugs into Python's built-in syntax and functions.",
        "Python favors duck typing over formal interfaces — but abc.ABC with @abstractmethod is available when a strict contract is genuinely needed.",
        "@dataclass auto-generates __init__, __repr__, and __eq__ for classes that are primarily data containers, cutting significant boilerplate.",
      ],
      links: [
        { label: "Python Docs — Classes", url: "https://docs.python.org/3/tutorial/classes.html" },
        { label: "Python Docs — dataclasses", url: "https://docs.python.org/3/library/dataclasses.html" },
        { label: "Python Docs — abc: Abstract Base Classes", url: "https://docs.python.org/3/library/abc.html" },
      ],
    },
    {
      moduleTitle: "Python Programming",
      subModuleTitle: "File handling & standard library",
      overview:
        "Real programs read configuration, write logs, parse structured data files, and handle the inevitable error cases that come with touching the outside world — Python's standard library covers all of this without needing a single third-party package. This sub-module covers safe file handling with the with statement (context managers), reading and writing both plain text and structured formats (CSV and JSON), modern path manipulation with pathlib (which has mostly replaced the older os.path string-joining style), structured exception handling for the errors file and network operations inevitably raise, and a tour of a few other standard library modules (datetime, collections, itertools) that solve extremely common problems without installing anything extra. The unifying theme is that Python's 'batteries included' philosophy means most everyday tasks have a correct, idiomatic standard-library tool already — reaching for it is almost always better than reinventing it.",
      sections: [
        {
          heading: "Opening Files Safely With the with Statement",
          body: "open(path, mode) returns a file object, but a file opened manually must also be closed manually (file.close()) or the underlying OS resource may leak, and if an exception is raised before the close() call, it never runs at all. The with statement wraps file handling in a context manager that guarantees close() runs automatically when the block exits, even if an exception occurs inside it — this is the reason `with open(...) as f:` is the only idiomatic way to open a file in modern Python, never a bare open()/close() pair.",
          bullets: [
            "Mode strings: 'r' read (default), 'w' write (truncates existing content!), 'a' append, 'x' exclusive create (fails if the file exists), each combinable with 'b' for binary mode.",
            "'w' mode silently erases an existing file's contents before writing — a very common and destructive mistake when 'a' (append) was actually intended.",
          ],
          code: {
            language: "python",
            code:
              "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"First line\\n\")\n    f.write(\"Second line\\n\")\n# file is automatically closed here, even if an exception had occurred above",
          },
        },
        {
          heading: "Reading and Writing Text Files",
          body: "Once opened, a file object can be read in full with .read(), line by line by iterating directly over it (for line in f:, the most memory-efficient option for large files since it doesn't load the whole file at once), or as a list of lines with .readlines(). Each line read this way retains its trailing newline character, which is why stripping it with .strip() is almost always needed before using the line's content.",
          code: {
            language: "python",
            code:
              "with open(\"notes.txt\", \"r\") as f:\n    for line in f:                 # memory-efficient: one line at a time\n        print(line.strip())        # strip() removes the trailing '\\n'\n\nwith open(\"notes.txt\", \"r\") as f:\n    full_text = f.read()           # loads the entire file into memory at once",
          },
        },
        {
          heading: "Working With CSV Files",
          body: "The csv module reads and writes comma-separated (or other delimiter-separated) tabular data correctly, including edge cases like commas or quotes embedded inside a field, that a naive line.split(',') approach would mishandle. csv.DictReader reads each row directly into a dict keyed by the header row's column names, which is almost always more convenient than working with plain index-based lists of strings.",
          code: {
            language: "python",
            code:
              "import csv\n\nwith open(\"people.csv\", \"w\", newline=\"\") as f:\n    writer = csv.DictWriter(f, fieldnames=[\"name\", \"age\"])\n    writer.writeheader()\n    writer.writerow({\"name\": \"Asha\", \"age\": 29})\n    writer.writerow({\"name\": \"Ben\", \"age\": 34})\n\nwith open(\"people.csv\", \"r\", newline=\"\") as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        print(row[\"name\"], row[\"age\"])  # values come back as strings",
          },
        },
        {
          heading: "Working With JSON",
          body: "The json module converts between Python objects and JSON text: json.dumps(obj) serializes a Python dict/list into a JSON string (and json.dump(obj, file) writes it directly to a file), while json.loads(text) parses a JSON string back into Python objects (json.load(file) reads directly from a file). JSON's type system is narrower than Python's — tuples become JSON arrays (indistinguishable from lists once round-tripped), and dict keys are always coerced to strings on the way out, which can silently change integer keys into string keys.",
          bullets: [
            "json.dumps(data, indent=2) produces human-readable, pretty-printed output — useful for config files and debugging, unnecessary for machine-to-machine payloads.",
            "Round-tripping a dict with integer keys through JSON turns those keys into strings, since JSON object keys are always strings.",
          ],
          code: {
            language: "python",
            code:
              "import json\n\nconfig = {\"name\": \"MyApp\", \"version\": 2, \"features\": [\"dark_mode\", \"export\"]}\n\nwith open(\"config.json\", \"w\") as f:\n    json.dump(config, f, indent=2)\n\nwith open(\"config.json\", \"r\") as f:\n    loaded = json.load(f)\n\nprint(loaded[\"features\"])  # ['dark_mode', 'export']",
          },
        },
        {
          heading: "Modern Path Handling With pathlib",
          body: "pathlib.Path represents a filesystem path as an object with methods and overloaded operators, replacing the older style of joining path strings manually with os.path.join. The / operator joins path segments in a way that's automatically correct for the current OS (backslashes on Windows, forward slashes elsewhere), and methods like .exists(), .is_file(), .mkdir(), and .glob() cover the overwhelming majority of filesystem tasks without needing the older os module's scattered functions.",
          code: {
            language: "python",
            code:
              "from pathlib import Path\n\ndata_dir = Path(\"data\") / \"reports\"\ndata_dir.mkdir(parents=True, exist_ok=True)\n\nreport_file = data_dir / \"summary.txt\"\nreport_file.write_text(\"Q3 results look strong.\\n\")\n\nfor csv_file in data_dir.glob(\"*.csv\"):\n    print(csv_file.name)\n\nprint(report_file.exists(), report_file.suffix)  # True .txt",
          },
        },
        {
          heading: "Exception Handling for File and I/O Errors",
          body: "File and network operations fail in ways that are entirely normal, not exceptional edge cases — a file might not exist (FileNotFoundError), a path might be a directory instead of a file (IsADirectoryError), or permissions might be insufficient (PermissionError). try/except should catch the specific exception types expected, not a bare except: (which also silently swallows genuinely unexpected bugs like a NameError), and an optional finally block runs cleanup code whether or not an exception occurred.",
          bullets: [
            "Catching a bare `except:` (or even `except Exception:` too broadly) can hide real bugs — catch the specific exception type(s) you actually expect and can meaningfully handle.",
            "Custom exceptions (class MyError(Exception): pass) let application code raise and catch domain-specific errors distinctly from built-in ones.",
          ],
          code: {
            language: "python",
            code:
              "def read_config(path: str) -> dict:\n    try:\n        with open(path, \"r\") as f:\n            return json.load(f)\n    except FileNotFoundError:\n        print(f\"Config file not found at {path}, using defaults\")\n        return {}\n    except json.JSONDecodeError as e:\n        raise ValueError(f\"Config file at {path} is not valid JSON\") from e",
          },
        },
        {
          heading: "A Tour of Essential Standard Library Modules",
          body: "Beyond file I/O, a handful of standard library modules solve recurring problems so commonly that reaching for them should be automatic. datetime provides date/time arithmetic and formatting (datetime.now(), timedelta for adding/subtracting durations). collections.Counter tallies item frequencies in one line; collections.defaultdict avoids manual 'if key not in dict' initialization checks. itertools provides efficient, composable iterator building blocks (chain, combinations, groupby) for problems that would otherwise need manual nested loops.",
          code: {
            language: "python",
            code:
              "from datetime import datetime, timedelta\nfrom collections import Counter, defaultdict\n\nnow = datetime.now()\nin_a_week = now + timedelta(days=7)\n\nwords = [\"cat\", \"dog\", \"cat\", \"bird\", \"dog\", \"cat\"]\nprint(Counter(words))  # Counter({'cat': 3, 'dog': 2, 'bird': 1})\n\ngroups = defaultdict(list)\nfor word in words:\n    groups[len(word)].append(word)\nprint(dict(groups))   # {3: ['cat','dog','cat','dog','cat'], 4: ['bird']}",
          },
        },
      ],
      commonPitfalls: [
        "Opening a file with a bare open()/close() pair instead of `with open(...) as f:`, risking a leaked file handle if an exception occurs before close().",
        "Opening an existing file in 'w' mode when 'a' (append) was intended, silently truncating and losing its previous contents.",
        "Parsing CSV manually with line.split(',') instead of the csv module, breaking on any field containing a comma or quote character.",
        "Forgetting that JSON round-trips coerce dict keys to strings and turn tuples into plain arrays, then being surprised when loaded data doesn't match the original types.",
        "Catching a bare `except:` that swallows every error indiscriminately, including unrelated bugs that should have crashed loudly and been noticed.",
        "Manually joining path strings with '/' or '\\\\' instead of pathlib's Path, producing code that breaks when run on a different operating system.",
      ],
      keyTakeaways: [
        "Always open files with `with open(...) as f:` — it guarantees the file is closed even if an exception occurs inside the block.",
        "'w' mode truncates an existing file; use 'a' to append instead — a very common source of accidental data loss.",
        "Use the csv and json modules for structured data instead of manual string splitting — they correctly handle escaping and edge cases.",
        "pathlib.Path with the / operator is the modern, OS-independent way to build filesystem paths.",
        "Catch specific exception types (FileNotFoundError, json.JSONDecodeError) rather than a bare except:, which hides unrelated bugs.",
        "Standard library modules like collections (Counter, defaultdict) and itertools solve many common data-shuffling problems without any external dependency.",
      ],
      links: [
        { label: "Python Docs — Reading and Writing Files", url: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files" },
        { label: "Python Docs — pathlib: Object-Oriented Filesystem Paths", url: "https://docs.python.org/3/library/pathlib.html" },
        { label: "Python Docs — json: JSON Encoder and Decoder", url: "https://docs.python.org/3/library/json.html" },
      ],
    },

    // ───────────────────────────── TypeScript Programming ─────────────────────────────
    {
      moduleTitle: "TypeScript Programming",
      subModuleTitle: "TypeScript fundamentals & type system",
      overview:
        "TypeScript is JavaScript with a structural, static type system layered on top — it compiles down to plain JavaScript and adds no new runtime behavior, but it catches an entire category of bugs (wrong argument types, typos in property names, forgetting a null check) at compile time instead of at runtime in production. This sub-module covers the mental model that makes TypeScript click: structural (not nominal) typing, the basic type annotations for primitives, arrays, and tuples, how type inference frequently removes the need for explicit annotations, union and intersection types for combining possibilities, literal types and const assertions for precise values, the special types any/unknown/never/void and when each is appropriate, and the type narrowing patterns the compiler uses to progressively refine a type inside conditional branches.",
      sections: [
        {
          heading: "Structural Typing: Why TypeScript's Type System Feels Different",
          body: "TypeScript uses structural typing (sometimes called 'duck typing' at the type level): two types are compatible if they have the same shape, regardless of their names or where they were declared — unlike nominal type systems (Java, C#) where compatibility depends on explicit inheritance or interface declarations. This means a plain object literal satisfies an interface simply by having the right properties, with no 'implements' keyword required, which is both extremely convenient for everyday code and a source of occasional surprise when an object has more properties than an interface strictly requires but is still accepted.",
          code: {
            language: "typescript",
            code:
              "interface Point {\n  x: number;\n  y: number;\n}\n\nfunction printPoint(p: Point) {\n  console.log(`(${p.x}, ${p.y})`);\n}\n\n// No \"implements Point\" needed — this object just happens to have the right shape\nconst location = { x: 10, y: 20, label: \"Home\" };\nprintPoint(location); // valid: structurally compatible with Point",
          },
        },
        {
          heading: "Basic Types: Primitives, Arrays, and Tuples",
          body: "TypeScript's basic annotations mirror JavaScript's runtime primitives: string, number, boolean, null, and undefined. Arrays are annotated as T[] or Array<T> (both equivalent), and every element must conform to T. Tuples (readonly or mutable, [string, number]) are fixed-length arrays where each position has its own, potentially different, declared type — useful for functions that return exactly two related values, like a [value, error] pair, where plain array typing would lose that positional precision.",
          bullets: [
            "number[] and Array<number> are exactly equivalent syntaxes — pick one and stay consistent within a codebase.",
            "A tuple's length is fixed at the type level: [string, number] won't accept a third element without an explicit rest element like [string, number, ...boolean[]].",
          ],
          code: {
            language: "typescript",
            code:
              "let username: string = \"ana\";\nlet scores: number[] = [88, 92, 79];\nlet coordinate: [number, number] = [10, 20];\n\nfunction divide(a: number, b: number): [number, string | null] {\n  if (b === 0) return [0, \"Cannot divide by zero\"];\n  return [a / b, null];\n}\n\nconst [result, error] = divide(10, 2);",
          },
        },
        {
          heading: "Type Inference vs. Explicit Annotations",
          body: "TypeScript's compiler infers types automatically from initial values, return statements, and usage context in the overwhelming majority of cases, which is why idiomatic TypeScript code has far fewer explicit type annotations than beginners expect — let count = 0 is inferred as number without annotation, and a function's return type is inferred from its return statements. Explicit annotations remain valuable at public API boundaries (exported function parameters and return types) where they serve as enforced documentation, and are required when a variable's initial value doesn't give the compiler enough information (an empty array, a variable declared without immediate initialization).",
          code: {
            language: "typescript",
            code:
              "let count = 0;             // inferred: number\nlet name = \"Ana\";          // inferred: string\nconst tags = [\"a\", \"b\"];   // inferred: string[]\n\nfunction add(a: number, b: number) {\n  return a + b;             // return type inferred as number — no annotation needed\n}\n\nlet pending: string[];      // annotation required — no initializer to infer from\npending = [\"draft\"];",
          },
        },
        {
          heading: "Union and Intersection Types",
          body: "A union type (A | B) means a value could be either type, and the compiler only allows operations that are valid on both members until the type is narrowed (see below). An intersection type (A & B) means a value must satisfy both types simultaneously — all of A's properties AND all of B's properties — which is most commonly used to combine several smaller object-shape types into one richer one, rather than with primitives (string & number is an impossible type, since no value can be both at once).",
          bullets: [
            "A union of object types gives you only the properties common to ALL members until narrowed; an intersection gives you the properties of ALL members combined.",
          ],
          code: {
            language: "typescript",
            code:
              "type ID = string | number;\n\nfunction printId(id: ID) {\n  console.log(`ID: ${id}`);\n}\n\ntype Named = { name: string };\ntype Aged = { age: number };\ntype Person = Named & Aged;        // must have BOTH name and age\n\nconst p: Person = { name: \"Ben\", age: 30 };",
          },
        },
        {
          heading: "Literal Types and const Assertions",
          body: "A literal type narrows a primitive type down to one exact value — \"success\" is a type containing only the string \"success\", not any string. Literal types are most powerful combined into a union to model a closed set of allowed values (a string enum alternative that compiles to nothing extra at runtime). By default, `let status = \"success\"` widens to the general type string, but `const status = \"success\"` is inferred as the literal type \"success\" since const guarantees the value can't change. The `as const` assertion applies that same narrowing to object and array literals, locking every property down to its literal type and marking the structure readonly.",
          code: {
            language: "typescript",
            code:
              "type Status = \"idle\" | \"loading\" | \"success\" | \"error\";\n\nfunction setStatus(status: Status) { /* ... */ }\nsetStatus(\"loading\");    // ok\n// setStatus(\"done\");    // error: \"done\" is not assignable to type Status\n\nconst config = { env: \"production\", retries: 3 } as const;\n// config.env is the literal type \"production\", and config is deeply readonly",
          },
        },
        {
          heading: "any, unknown, never, and void",
          body: "any disables type checking entirely for that value — it's an escape hatch that should be used sparingly, since it silently defeats the whole point of using TypeScript wherever it appears. unknown is the type-safe alternative for genuinely unknown values (like parsed JSON or external API data): it accepts any value, but the compiler forbids using it for anything until you've narrowed it with a type check first. never represents a value that can genuinely never occur — the return type of a function that always throws, or the type of an unreachable branch in an exhaustive switch — and is useful for making the compiler enforce exhaustiveness checks. void marks a function that doesn't return a meaningful value (though it may still implicitly return undefined).",
          bullets: [
            "Prefer `unknown` over `any` for untyped external data — it forces an explicit type check or assertion before use, which `any` does not.",
            "A function typed to return `never` that doesn't actually throw or infinite-loop is a compiler-enforced promise you've broken — the compiler will catch it if a code path can return normally.",
          ],
          code: {
            language: "typescript",
            code:
              "function parseJson(text: string): unknown {\n  return JSON.parse(text);\n}\n\nconst data = parseJson('{\"id\": 1}');\n// data.id would be a compile error — must narrow `unknown` first:\nif (typeof data === \"object\" && data !== null && \"id\" in data) {\n  console.log((data as { id: number }).id);\n}\n\nfunction fail(message: string): never {\n  throw new Error(message);\n}",
          },
        },
        {
          heading: "Type Narrowing: typeof, instanceof, and Guards",
          body: "Inside a conditional branch, TypeScript's control-flow analysis automatically narrows a union type to the specific member that's possible given the check — typeof value === \"string\" narrows value to string inside that branch, value instanceof SomeClass narrows to that class, and Array.isArray(value) narrows to an array type. For narrowing custom object shapes that aren't classes, a user-defined type guard function (one whose return type is value is SomeType) lets you encapsulate a more complex check into a reusable, named function the compiler still understands as narrowing.",
          code: {
            language: "typescript",
            code:
              "function formatId(id: string | number): string {\n  if (typeof id === \"string\") {\n    return id.toUpperCase();   // narrowed to string here\n  }\n  return id.toFixed(2);        // narrowed to number here\n}\n\ninterface Cat { meow(): void; }\ninterface Dog { bark(): void; }\n\nfunction isCat(animal: Cat | Dog): animal is Cat {\n  return \"meow\" in animal;\n}\n\nfunction makeSound(animal: Cat | Dog) {\n  if (isCat(animal)) animal.meow();\n  else animal.bark();\n}",
          },
        },
      ],
      commonPitfalls: [
        "Reaching for `any` to silence a type error instead of taking a moment to model the actual type or use `unknown` with a narrowing check.",
        "Treating a union type as if it already had every member's properties available, before narrowing with a typeof/instanceof check.",
        "Forgetting that TypeScript's types are fully erased at compile time — `typeof someValue === \"SomeInterface\"` is meaningless; narrowing must use real runtime checks (typeof, instanceof, in, custom guards).",
        "Annotating every single variable explicitly even when inference already produces the correct, precise type — adding noise without adding safety.",
        "Expecting `const` alone to deeply freeze an object's properties at the type level without also using `as const`.",
        "Writing a function typed to return `never` or throw, but leaving a code path that can actually return normally, which the compiler will flag as an error.",
      ],
      keyTakeaways: [
        "TypeScript uses structural typing — type compatibility is based on shape, not declared names or inheritance.",
        "Let inference do the work for local variables; reserve explicit annotations for function parameters, return types, and ambiguous initial values.",
        "Union types (A | B) give you only the shared members until narrowed; intersection types (A & B) combine every member's requirements.",
        "Prefer `unknown` over `any` for untyped data — it forces a narrowing check before use, preserving type safety.",
        "Narrowing happens through real runtime checks the compiler recognizes: typeof, instanceof, Array.isArray, the `in` operator, and custom `is` type guards.",
        "TypeScript's types exist only at compile time and are completely erased from the emitted JavaScript — they have zero runtime cost and zero runtime presence.",
      ],
      links: [
        { label: "TypeScript Handbook — The Basics", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html" },
        { label: "TypeScript Handbook — Everyday Types", url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html" },
        { label: "TypeScript Handbook — Narrowing", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html" },
      ],
    },
    {
      moduleTitle: "TypeScript Programming",
      subModuleTitle: "Interfaces & type aliases",
      overview:
        "Interfaces and type aliases are TypeScript's two tools for giving a name to a type so it can be reused instead of repeated inline, and while they overlap significantly in capability, each has specific strengths that matter once a codebase grows. This sub-module covers defining object shapes with interfaces, the type alias syntax and the specific cases (unions, tuples, mapped/conditional types) where only a type alias will do, optional and readonly properties, the difference between extending an interface and intersecting type aliases, index signatures for dictionary-like objects, typing functions and callbacks, interface declaration merging (a capability unique to interfaces), and discriminated unions — one of the most practically useful patterns in the entire type system for modeling 'one of several distinct shapes' data safely.",
      sections: [
        {
          heading: "Defining Object Shapes With Interfaces",
          body: "An interface declares the shape a value must have — which property names exist, and what type each one must be — and is the idiomatic way to describe the contract for objects, function parameters, and class implementations. Any object (or class, via implements) satisfying that shape is considered compatible, regardless of how it was created, consistent with TypeScript's overall structural typing model.",
          code: {
            language: "typescript",
            code:
              "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction greetUser(user: User): string {\n  return `Hello, ${user.name}!`;\n}\n\nconst u: User = { id: 1, name: \"Mia\", email: \"mia@example.com\" };\nconsole.log(greetUser(u));",
          },
        },
        {
          heading: "Type Aliases: A More General Naming Tool",
          body: "A type alias (type Name = ...) can name any type — an object shape (functionally similar to an interface for this case), a union, a tuple, a primitive, or a complex mapped/conditional type. Where an interface is restricted to describing object-like and function-like shapes, a type alias is the only option for naming a union (type ID = string | number) or a tuple type, which is the most common reason to reach for `type` over `interface` in practice.",
          code: {
            language: "typescript",
            code:
              "type ID = string | number;\ntype Point = [number, number];\ntype Callback = (error: Error | null, data?: string) => void;\n\ntype UserShape = {\n  id: number;\n  name: string;\n};",
          },
        },
        {
          heading: "Optional and Readonly Properties",
          body: "A property marked with ? (email?: string) is optional — it may be omitted entirely from a conforming object, and its type inside the interface becomes string | undefined when accessed. readonly prevents a property from being reassigned after the object is created (readonly id: number), which the compiler enforces at the type level — it's a compile-time-only guarantee and has no runtime enforcement, so it doesn't prevent mutation through a type-cast or non-TypeScript code path, but it does catch accidental reassignment in ordinary TypeScript code.",
          bullets: [
            "An optional property's accessed type is implicitly unioned with undefined — always check for its presence before using it directly.",
            "readonly is a compile-time-only restriction; it does not freeze the object at runtime the way Object.freeze() does in plain JavaScript.",
          ],
          code: {
            language: "typescript",
            code:
              "interface Config {\n  readonly apiUrl: string;\n  timeout?: number;\n}\n\nconst config: Config = { apiUrl: \"https://api.example.com\" };\n// config.apiUrl = \"other\";   // error: cannot assign to 'apiUrl' because it is readonly\n\nconsole.log(config.timeout ?? 5000); // handle the optional property's possible absence",
          },
        },
        {
          heading: "Extending Interfaces vs. Intersecting Type Aliases",
          body: "An interface extends another with the extends keyword, inheriting all of its members and allowing additional ones — this reads clearly as an 'is-a, plus more' relationship and produces clean, easy-to-read error messages when something doesn't match. A type alias achieves a similar combination using an intersection (&): type Admin = User & { permissions: string[] }. Both approaches generally produce equivalent results for simple object shapes, but interface extends tends to give cleaner compiler error messages for deeply nested hierarchies, which is part of why many style guides prefer `interface` for object shapes and reserve `type` for unions and other non-object types.",
          code: {
            language: "typescript",
            code:
              "interface User {\n  id: number;\n  name: string;\n}\n\ninterface Admin extends User {\n  permissions: string[];\n}\n\nconst admin: Admin = { id: 1, name: \"Dev\", permissions: [\"read\", \"write\"] };\n\n// Equivalent using a type alias and intersection:\ntype AdminAlt = User & { permissions: string[] };",
          },
        },
        {
          heading: "Index Signatures for Dictionary-Like Objects",
          body: "When an object's exact keys aren't known in advance — a lookup table keyed by arbitrary strings, for instance — an index signature ([key: string]: ValueType) describes that every property access with a string key returns a value of that type. This is distinct from Record<string, ValueType> (a built-in utility type covered in the Generics sub-module) only in syntax; both express the same 'arbitrary string key, fixed value type' shape, and either is a reasonable style choice.",
          code: {
            language: "typescript",
            code:
              "interface WordCounts {\n  [word: string]: number;\n}\n\nconst counts: WordCounts = {};\ncounts[\"typescript\"] = 1;\ncounts[\"typescript\"] += 1;\nconsole.log(counts[\"typescript\"]); // 2\nconsole.log(counts[\"missing\"]);     // undefined at runtime, though typed as `number`",
          },
        },
        {
          heading: "Typing Functions as Properties",
          body: "A function-typed property or standalone function type is written as (params) => ReturnType, both inside an interface/type alias and as a standalone named type. This is essential for typing callbacks, event handlers, and any object that holds behavior alongside data — getting the parameter types and return type right here is what allows the compiler to catch a mismatched callback signature passed into an API, rather than only discovering it at runtime.",
          code: {
            language: "typescript",
            code:
              "interface ApiClient {\n  get(url: string): Promise<unknown>;\n  onError?: (error: Error) => void;\n}\n\ntype Comparator<T> = (a: T, b: T) => number;\n\nconst byLength: Comparator<string> = (a, b) => a.length - b.length;\n[\"ccc\", \"a\", \"bb\"].sort(byLength); // [\"a\", \"bb\", \"ccc\"]",
          },
        },
        {
          heading: "Declaration Merging (Interfaces Only)",
          body: "Declaring the same interface name more than once in the same scope merges all declarations into a single interface with every member combined — a capability unique to interfaces that type aliases deliberately do not support (redeclaring a type alias with the same name is a compile error). This is primarily useful for augmenting types from external libraries (adding a custom property to Express's Request type, for example) rather than something to rely on heavily in application code, where it can make a type's full shape harder to find by searching for a single declaration.",
          code: {
            language: "typescript",
            code:
              "interface Window {\n  myAppVersion: string;\n}\n\ninterface Window {\n  myAppFeatureFlags: string[];\n}\n\n// Merged result: Window now has BOTH myAppVersion and myAppFeatureFlags\ndeclare const win: Window;\nconsole.log(win.myAppVersion, win.myAppFeatureFlags);",
          },
        },
        {
          heading: "Discriminated Unions",
          body: "A discriminated union combines several object-shape types that share one common 'discriminant' property with a distinct literal type in each member (a kind or type field) — the compiler uses that single property to automatically narrow which full shape applies inside a conditional or switch branch, giving full, safe access to each shape's unique fields with no manual type assertions. This pattern is one of the most valuable in the whole type system for modeling state that can legitimately be 'one of several different shapes' (a loading/success/error UI state, a set of distinct event types) without resorting to a pile of optional fields and runtime undefined checks.",
          code: {
            language: "typescript",
            code:
              "type RequestState =\n  | { status: \"loading\" }\n  | { status: \"success\"; data: string[] }\n  | { status: \"error\"; message: string };\n\nfunction render(state: RequestState): string {\n  switch (state.status) {\n    case \"loading\":\n      return \"Loading...\";\n    case \"success\":\n      return `Got ${state.data.length} items`;  // `data` is safely accessible here\n    case \"error\":\n      return `Error: ${state.message}`;          // `message` is safely accessible here\n  }\n}",
          },
        },
      ],
      commonPitfalls: [
        "Trying to use `interface` to name a union type — unions require a type alias; interfaces can only describe object/function shapes.",
        "Forgetting that an optional property's accessed type includes `undefined`, and using it without a presence check or default value.",
        "Assuming `readonly` provides runtime immutability like Object.freeze() — it is a compile-time-only check with zero runtime enforcement.",
        "Declaring the same interface twice unintentionally (e.g., a typo'd duplicate) and being confused why TypeScript merges them instead of erroring, unlike a duplicate type alias.",
        "Modeling multi-shape state with a pile of optional fields instead of a discriminated union, losing the compiler's ability to narrow and check exhaustiveness.",
        "Mixing up index signatures with Record<K, V> inconsistently across a codebase when either would do — pick one convention and stay consistent.",
      ],
      keyTakeaways: [
        "Use `interface` for object/function shapes you might extend; use `type` for unions, tuples, and anything an interface structurally can't express.",
        "Optional (?) properties may be absent and are typed with an implicit `| undefined`; readonly properties can't be reassigned, but only at compile time.",
        "interface extends and type-alias intersection (&) both combine shapes — extends tends to give cleaner error messages for deep hierarchies.",
        "Index signatures ([key: string]: T) describe dictionary-like objects with arbitrary string keys and a consistent value type.",
        "Declaration merging is unique to interfaces and is mainly useful for augmenting third-party library types, not everyday application modeling.",
        "Discriminated unions with a shared literal 'kind' field let the compiler safely and exhaustively narrow between several distinct object shapes.",
      ],
      links: [
        { label: "TypeScript Handbook — Object Types", url: "https://www.typescriptlang.org/docs/handbook/2/objects.html" },
        { label: "TypeScript Handbook — Unions and Intersection Types", url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types" },
        { label: "TypeScript Handbook — Narrowing: Discriminated Unions", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" },
      ],
    },
    {
      moduleTitle: "TypeScript Programming",
      subModuleTitle: "Generics",
      overview:
        "Generics let a function, interface, or class be written once and work correctly with many different types, while still preserving full type safety — without generics, you'd either duplicate code for every type or fall back to `any` and lose type checking entirely. This sub-module builds generics from first principles: why they exist, generic functions and the type-parameter inference the compiler performs automatically at call sites, generic interfaces, type aliases, and classes, constraining a type parameter with extends so it must have certain properties, supplying default type parameters, the keyof and mapped-type machinery that powers advanced generic utilities, and the small set of built-in utility types (Partial, Pick, Omit, Record, ReturnType) that cover the overwhelming majority of real-world generic needs without writing custom type-level code.",
      sections: [
        {
          heading: "Why Generics: The Problem They Solve",
          body: "Without generics, a reusable function like 'return the first element of an array' either needs to be duplicated for every element type, or typed with `any`, which discards type safety for every caller. A generic type parameter (conventionally named T) acts as a placeholder that gets filled in with a real type at each call site, letting one function definition work correctly — and with full type checking — for arrays of numbers, strings, or any other type, all without writing it more than once.",
          code: {
            language: "typescript",
            code:
              "// Without generics: unsafe, loses all type information\nfunction firstUnsafe(arr: any[]): any {\n  return arr[0];\n}\n\n// With generics: safe, preserves the actual element type\nfunction first<T>(arr: T[]): T {\n  return arr[0];\n}\n\nconst n = first([1, 2, 3]);        // inferred as number\nconst s = first([\"a\", \"b\"]);       // inferred as string",
          },
        },
        {
          heading: "Generic Functions and Type-Parameter Inference",
          body: "A generic function declares its type parameters in angle brackets before the parameter list (function identity<T>(value: T): T), and in the vast majority of calls you never specify the type argument explicitly — the compiler infers T from the actual argument passed in, exactly as it infers ordinary variable types. Explicit type arguments (identity<string>(\"hi\")) are only needed on the rare occasion the compiler can't infer enough information from the arguments alone, such as a generic function called with no arguments that determine T.",
          code: {
            language: "typescript",
            code:
              "function wrapInArray<T>(value: T): T[] {\n  return [value];\n}\n\nconst nums = wrapInArray(5);         // inferred: number[]\nconst strs = wrapInArray(\"hello\");   // inferred: string[]\nconst explicit = wrapInArray<boolean>(true); // explicit type argument, rarely needed",
          },
        },
        {
          heading: "Generic Interfaces and Type Aliases",
          body: "Interfaces and type aliases can themselves be generic, parameterized the same way as functions, which is the standard way to describe a container or wrapper shape that holds a value of some other, caller-specified type — an API response envelope, a paginated list, a result-or-error wrapper. Supplying the type argument when using the generic interface (ApiResponse<User>) fills in every occurrence of T throughout that interface's definition with the concrete type.",
          code: {
            language: "typescript",
            code:
              "interface ApiResponse<T> {\n  data: T;\n  status: number;\n  error?: string;\n}\n\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst response: ApiResponse<User> = {\n  data: { id: 1, name: \"Zoe\" },\n  status: 200,\n};",
          },
        },
        {
          heading: "Generic Classes",
          body: "A class can declare its own type parameters (class Box<T> {}) that apply across every member — fields, method parameters, and method return types — which is how type-safe, reusable container classes (a typed Stack, Queue, or cache) are built once and specialized per-instance at construction time via the type argument supplied where the class is instantiated.",
          code: {
            language: "typescript",
            code:
              "class Stack<T> {\n  private items: T[] = [];\n\n  push(item: T): void {\n    this.items.push(item);\n  }\n\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n\n  get size(): number {\n    return this.items.length;\n  }\n}\n\nconst numberStack = new Stack<number>();\nnumberStack.push(1);\nnumberStack.push(2);\nconsole.log(numberStack.pop()); // 2, inferred as number | undefined",
          },
        },
        {
          heading: "Constraining Type Parameters With extends",
          body: "By default a generic type parameter could be anything, which means the compiler won't let you access any property on it — T extends SomeShape constrains T to only types that satisfy SomeShape, which both restricts what callers can pass in and, in exchange, lets the function body safely access any property that SomeShape guarantees. This is the standard way to write a generic function that still needs to read specific properties (like .length or .id) off its generic argument.",
          code: {
            language: "typescript",
            code:
              "interface HasLength {\n  length: number;\n}\n\nfunction logLength<T extends HasLength>(value: T): T {\n  console.log(value.length); // safe — T is guaranteed to have .length\n  return value;\n}\n\nlogLength(\"hello\");       // ok — strings have .length\nlogLength([1, 2, 3]);     // ok — arrays have .length\n// logLength(42);         // error: number doesn't have .length",
          },
        },
        {
          heading: "Default Type Parameters",
          body: "A generic type parameter can declare a default (interface Container<T = string>) that's used when the caller doesn't explicitly supply a type argument and the compiler can't infer one from context either — this keeps simple, common use cases free of boilerplate type arguments while still allowing full customization when needed.",
          code: {
            language: "typescript",
            code:
              "interface Container<T = string> {\n  value: T;\n}\n\nconst defaultContainer: Container = { value: \"uses the default string type\" };\nconst numberContainer: Container<number> = { value: 42 };",
          },
        },
        {
          heading: "keyof, typeof, and Mapped Types",
          body: "keyof T produces a union of all of T's property-name string literals, which combined with a generic function lets you write a fully type-safe 'get a property by name' helper where the key and the return type are both checked against the actual object type. typeof (in a type context, distinct from the runtime typeof operator) extracts the type of a variable or value. A mapped type ({ [K in keyof T]: ... }) transforms every property of an existing type uniformly — this is exactly the mechanism behind built-in utilities like Partial and Readonly under the hood.",
          code: {
            language: "typescript",
            code:
              "interface Person {\n  name: string;\n  age: number;\n}\n\nfunction getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\nconst person: Person = { name: \"Ivan\", age: 40 };\nconst age = getProperty(person, \"age\");   // inferred as number\n// getProperty(person, \"email\");          // error: \"email\" is not a key of Person\n\ntype ReadonlyVersion<T> = { readonly [K in keyof T]: T[K] }; // a hand-rolled mapped type",
          },
        },
        {
          heading: "Essential Built-In Generic Utility Types",
          body: "TypeScript ships a set of generic utility types built from the same mapped-type and keyof machinery, covering the overwhelming majority of everyday generic needs without writing custom type-level code: Partial<T> makes every property optional (useful for an update/patch payload), Pick<T, K> selects a subset of named properties, Omit<T, K> excludes named properties, Record<K, V> builds an object type with keys of K and values of V, and ReturnType<F> extracts a function's return type for reuse elsewhere without having to repeat it manually.",
          bullets: [
            "Partial<User> for a PATCH/update payload where every field is optional; Pick<User, 'id' | 'name'> for a trimmed-down projection; Omit<User, 'password'> to exclude a sensitive field.",
          ],
          code: {
            language: "typescript",
            code:
              "interface User {\n  id: number;\n  name: string;\n  email: string;\n  password: string;\n}\n\ntype UserUpdate = Partial<User>;                 // every field optional\ntype PublicUser = Omit<User, \"password\">;        // all fields except password\ntype UserSummary = Pick<User, \"id\" | \"name\">;    // only id and name\ntype UsersById = Record<number, User>;           // { [id: number]: User }",
          },
        },
      ],
      commonPitfalls: [
        "Writing a generic function but immediately casting its parameter to `any` inside the body, which defeats the entire purpose of making it generic.",
        "Supplying explicit type arguments everywhere out of habit, when the compiler would correctly infer them from the arguments passed in.",
        "Forgetting a constraint (T extends HasProperty) and then being unable to access any property on a generic value inside the function body.",
        "Confusing keyof (which produces a union of a type's property-name literals) with the runtime typeof operator, which inspects a value's runtime type.",
        "Reaching for a hand-written mapped type when a built-in utility (Partial, Pick, Omit, Record) already expresses exactly the same transformation.",
        "Using `any` instead of a proper generic parameter 'to make the error go away,' silently reintroducing the type-safety gap generics exist to close.",
      ],
      keyTakeaways: [
        "Generics let one definition work correctly, with full type safety, across many different types — the alternative is duplicating code or using unsafe `any`.",
        "Type-parameter inference usually eliminates the need to write explicit type arguments at a generic function's call site.",
        "T extends SomeShape constrains a type parameter so the function body can safely access properties that SomeShape guarantees.",
        "keyof T produces a union of T's property names; combined with a generic, it builds fully type-checked 'get/set by key' helpers.",
        "Mapped types ({ [K in keyof T]: ... }) transform every property of a type uniformly — it's the mechanism behind Partial, Readonly, and similar utilities.",
        "Partial, Pick, Omit, and Record cover most everyday generic object-shape transformations without writing any custom type-level code.",
      ],
      links: [
        { label: "TypeScript Handbook — Generics", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html" },
        { label: "TypeScript Handbook — Keyof Type Operator", url: "https://www.typescriptlang.org/docs/handbook/2/keyof-types.html" },
        { label: "TypeScript Handbook — Utility Types", url: "https://www.typescriptlang.org/docs/handbook/utility-types.html" },
      ],
    },
    {
      moduleTitle: "TypeScript Programming",
      subModuleTitle: "Classes & OOP in TypeScript",
      overview:
        "TypeScript extends JavaScript's classes with compile-time access control, abstract classes, and interface implementation checks — giving object-oriented code the kind of enforced structure that plain JavaScript classes only achieve through convention and discipline. This sub-module covers class fields and constructors, the public/private/protected access modifiers and the readonly modifier, inheritance with super and method overriding, abstract classes for defining a partial, extensible base, the implements keyword for enforcing an interface's shape on a class, static members, the parameter-property shorthand that collapses constructor boilerplate, getter/setter accessors, and how polymorphism plays out across a typed class hierarchy with the compiler checking every override along the way.",
      sections: [
        {
          heading: "Class Fields and Constructors",
          body: "A TypeScript class declares its fields with a type annotation (either inline with an initializer, or declared and assigned in the constructor), and the constructor runs once when a new instance is created via `new`. Fields declared without an initializer and without being assigned in every constructor path produce a compile error under strict mode (strictPropertyInitialization) — this is a real safety feature, not noise, since it catches a field that could otherwise end up undefined despite its type claiming otherwise.",
          code: {
            language: "typescript",
            code:
              "class Rectangle {\n  width: number;\n  height: number;\n\n  constructor(width: number, height: number) {\n    this.width = width;\n    this.height = height;\n  }\n\n  area(): number {\n    return this.width * this.height;\n  }\n}\n\nconst rect = new Rectangle(4, 5);\nconsole.log(rect.area()); // 20",
          },
        },
        {
          heading: "Access Modifiers: public, private, protected",
          body: "public (the default, if omitted) members are accessible from anywhere; private members are accessible only within the declaring class itself, not subclasses or external code; protected members are accessible within the declaring class and any subclass, but not from outside the hierarchy entirely. These are compile-time-only checks, erased from the emitted JavaScript — unlike the newer, genuinely runtime-private JavaScript syntax (#field), TypeScript's private modifier can technically still be accessed by bypassing the type checker (bracket notation, a type assertion), so it's a strong convention enforced during development, not an unbreakable runtime guarantee.",
          bullets: [
            "private is compile-time only; the native JavaScript `#field` syntax is truly private at runtime too, and TypeScript fully supports mixing both.",
            "protected is the right choice for members a subclass needs to use or override, but that external code should never touch directly.",
          ],
          code: {
            language: "typescript",
            code:
              "class BankAccount {\n  private balance: number;\n  protected readonly accountId: string;\n\n  constructor(initialBalance: number, accountId: string) {\n    this.balance = initialBalance;\n    this.accountId = accountId;\n  }\n\n  deposit(amount: number): void {\n    this.balance += amount;\n  }\n\n  getBalance(): number {\n    return this.balance;\n  }\n}\n\nconst acc = new BankAccount(100, \"ACC-1\");\nacc.deposit(50);\n// acc.balance;   // error: 'balance' is private and only accessible within BankAccount",
          },
        },
        {
          heading: "Inheritance, super, and Method Overriding",
          body: "A class extends another with the extends keyword, and super(...) must be called inside a derived class's constructor before accessing `this`, forwarding arguments to the parent constructor. An overriding method can call super.methodName() to invoke the parent's version of that method as part of its own implementation, rather than fully replacing it — exactly the same pattern as Python's super(), just with different syntax.",
          code: {
            language: "typescript",
            code:
              "class Animal {\n  constructor(protected name: string) {}\n\n  speak(): string {\n    return `${this.name} makes a sound`;\n  }\n}\n\nclass Dog extends Animal {\n  speak(): string {\n    return `${super.speak()}, specifically a bark`;\n  }\n}\n\nconsole.log(new Dog(\"Rex\").speak()); // \"Rex makes a sound, specifically a bark\"",
          },
        },
        {
          heading: "Abstract Classes",
          body: "An abstract class (declared with the abstract keyword) cannot be instantiated directly with `new` — it exists purely to be extended, and can declare abstract methods (abstract methodName(): ReturnType;) that have no implementation at all in the base class, forcing every concrete subclass to provide one. This is TypeScript's equivalent of Python's ABC pattern, and is the right tool when a base class should supply some shared implementation while still requiring subclasses to fill in specific pieces.",
          code: {
            language: "typescript",
            code:
              "abstract class Shape {\n  abstract area(): number;\n\n  describe(): string {\n    return `This shape has an area of ${this.area()}`;\n  }\n}\n\nclass Circle extends Shape {\n  constructor(private radius: number) {\n    super();\n  }\n\n  area(): number {\n    return Math.PI * this.radius ** 2;\n  }\n}\n\n// new Shape();          // error: cannot create an instance of an abstract class\nconsole.log(new Circle(2).describe());",
          },
        },
        {
          heading: "Implementing Interfaces",
          body: "A class declares that it satisfies an interface's shape with the implements keyword, and the compiler checks at the class declaration itself that every required member is actually present with a compatible type — catching a missing or mistyped method immediately, rather than only when some calling code tries to use it. Unlike extends (which provides actual inherited implementation), implements is a pure type-checking contract: a class can implement multiple interfaces, since there's no implementation to conflict between them.",
          code: {
            language: "typescript",
            code:
              "interface Flyable {\n  fly(): string;\n}\n\ninterface Swimmable {\n  swim(): string;\n}\n\nclass Duck implements Flyable, Swimmable {\n  fly(): string {\n    return \"Duck is flying\";\n  }\n  swim(): string {\n    return \"Duck is swimming\";\n  }\n}",
          },
        },
        {
          heading: "Static Members and Parameter Properties",
          body: "static members belong to the class itself rather than any instance, accessed via ClassName.member rather than an instance — useful for factory methods, shared counters, or constants related to the class as a whole. Parameter properties are a TypeScript-only shorthand that collapses declaring a field and assigning it in the constructor into one line: prefixing a constructor parameter with public/private/protected/readonly simultaneously declares that field and assigns the passed-in value to it, removing a very common source of constructor boilerplate.",
          code: {
            language: "typescript",
            code:
              "class Counter {\n  static instanceCount = 0;\n\n  constructor(private readonly label: string) {\n    // `private readonly label` above both declares AND assigns the field —\n    // equivalent to declaring `private readonly label: string;` and then\n    // `this.label = label;` inside the constructor body.\n    Counter.instanceCount++;\n  }\n\n  describe(): string {\n    return `${this.label} (#${Counter.instanceCount})`;\n  }\n}\n\nnew Counter(\"a\");\nnew Counter(\"b\");\nconsole.log(Counter.instanceCount); // 2",
          },
        },
        {
          heading: "Getters, Setters, and Polymorphism",
          body: "get and set accessor methods let a class expose computed or validated values with plain property syntax (obj.value instead of obj.getValue()), mirroring Python's @property pattern. Combined with a typed class hierarchy, polymorphism in TypeScript means a variable typed as a base class or interface can hold any subclass/implementing-class instance, and calling an overridden method dispatches to that specific instance's implementation — all fully type-checked, so a method call that doesn't exist on the declared base type is caught at compile time rather than surfacing as a runtime error.",
          code: {
            language: "typescript",
            code:
              "class Temperature {\n  private _celsius = 0;\n\n  get fahrenheit(): number {\n    return this._celsius * 9 / 5 + 32;\n  }\n\n  set fahrenheit(value: number) {\n    this._celsius = (value - 32) * 5 / 9;\n  }\n}\n\nconst t = new Temperature();\nt.fahrenheit = 98.6;\nconsole.log(t.fahrenheit.toFixed(1)); // 98.6 — reads/writes like a plain property",
          },
        },
      ],
      commonPitfalls: [
        "Forgetting to call super(...) before accessing `this` inside a derived class's constructor, which the compiler flags as an error.",
        "Treating TypeScript's `private` as a genuine runtime guarantee — it's compile-time only and can be bypassed with a type assertion or bracket access.",
        "Trying to instantiate an abstract class directly with `new`, or forgetting to implement one of its abstract methods in a concrete subclass.",
        "Confusing `implements` (a pure type-checking contract, no shared implementation) with `extends` (actual inherited implementation) — a class can implement many interfaces but extend only one class.",
        "Writing out full field-declare-then-assign boilerplate in a constructor when the parameter-property shorthand (private readonly x: T) would do both in one line.",
        "Defining a setter without a matching getter (or vice versa) when the intent was a fully computed, two-way property.",
      ],
      keyTakeaways: [
        "public/private/protected are compile-time-only access checks; use the native `#field` syntax if genuine runtime privacy is required.",
        "super(...) must run before `this` is used in a derived class's constructor, and super.method() calls the parent's version of an overridden method.",
        "Abstract classes can mix shared implementation with methods that force every subclass to provide their own — TypeScript's equivalent of Python's ABC.",
        "implements checks that a class satisfies an interface's shape at declaration time; a class can implement multiple interfaces but extend only one class.",
        "Parameter properties (constructor(private x: T)) collapse field declaration and assignment into the constructor's parameter list.",
        "get/set accessors expose computed or validated values through ordinary property syntax, enabling the same pattern as Python's @property.",
      ],
      links: [
        { label: "TypeScript Handbook — Classes", url: "https://www.typescriptlang.org/docs/handbook/2/classes.html" },
        { label: "TypeScript Handbook — Interfaces (implements)", url: "https://www.typescriptlang.org/docs/handbook/2/objects.html" },
        { label: "MDN — Classes (Private class features)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties" },
      ],
    },
    {
      moduleTitle: "TypeScript Programming",
      subModuleTitle: "Working with JS libraries in a typed codebase",
      overview:
        "The vast majority of real TypeScript projects depend on JavaScript libraries that were never written with TypeScript in mind, so a practical TypeScript developer needs to know how to bring type safety to code you don't control, not just code you write from scratch. This sub-module covers how @types packages (the DefinitelyTyped project) provide types for untyped JavaScript libraries, writing your own minimal .d.ts declaration files when no types exist anywhere, the declare module escape hatch for quickly unblocking an untyped import, typing callback-heavy and loosely-typed third-party APIs defensively, module augmentation for extending a library's own types, and the ESM/CommonJS interop settings that cause a disproportionate share of real-world 'why won't this import compile' confusion.",
      sections: [
        {
          heading: "Why Type Definitions Matter for JS Libraries",
          body: "A JavaScript library ships no type information at all by default — every import from it would be implicitly typed `any` without a separate source of type declarations, silently disabling type checking for anything that touches it, which defeats much of the value of using TypeScript in the first place. Type declaration (.d.ts) files solve this by describing a library's shape — its exported functions, classes, and types — without containing any actual runtime implementation, letting the compiler check your usage of the library against that description.",
        },
        {
          heading: "Installing and Using @types Packages",
          body: "The DefinitelyTyped project maintains community-written type declarations for thousands of popular untyped JavaScript packages, published under the @types npm scope — installing @types/lodash alongside lodash itself, for example, gives the compiler full type information for every lodash function with no further configuration needed. Many modern libraries now ship their own types directly in their main package (look for an included index.d.ts or a \"types\" field in package.json), making a separate @types install unnecessary — checking for bundled types first avoids installing a redundant or out-of-sync external declaration package.",
          bullets: [
            "npm install -D @types/lodash installs just the type declarations as a dev dependency — no runtime code is added to the bundle.",
            "If a package's own package.json already lists a \"types\" or \"typings\" field, it ships its own types and a separate @types package either doesn't exist or isn't needed.",
          ],
          code: {
            language: "bash",
            code:
              "npm install lodash\nnpm install -D @types/lodash\n",
          },
        },
        {
          heading: "Writing Your Own .d.ts Declaration Files",
          body: "When a library has no bundled types and no @types package exists, a minimal hand-written declaration file fills the gap — it only needs to describe the shape actually used, not the library's entire surface area, and can be expanded incrementally as more of the library gets used. Declaration files use declare to describe something that exists at runtime without providing an implementation (since the real JavaScript file already supplies that), and are typically placed in a types/ directory included via the tsconfig's include or typeRoots settings.",
          code: {
            language: "typescript",
            code:
              "// types/some-untyped-lib.d.ts\ndeclare module \"some-untyped-lib\" {\n  export function formatCurrency(amount: number, currencyCode: string): string;\n  export interface FormatOptions {\n    locale?: string;\n    decimals?: number;\n  }\n  export function format(amount: number, options?: FormatOptions): string;\n}",
          },
        },
        {
          heading: "The declare module Escape Hatch",
          body: "For a quick, temporary unblock — or a library you genuinely don't want to type properly right now — declare module \"library-name\"; with no body at all tells the compiler 'trust me, this module exists,' and every import from it is typed as `any`. This restores compilation immediately but reintroduces the exact type-safety gap TypeScript exists to close for every usage of that import, so it should be treated as a stopgap to replace with real types later, not a long-term solution for libraries used extensively throughout a codebase.",
          code: {
            language: "typescript",
            code:
              "// types/shims.d.ts — quick unblock, everything from this import becomes `any`\ndeclare module \"legacy-untyped-widget\";\n\nimport Widget from \"legacy-untyped-widget\"; // typed as `any` — no safety, but it compiles",
          },
        },
        {
          heading: "Typing Third-Party Callback-Heavy APIs Defensively",
          body: "Older JavaScript libraries frequently expose loosely-typed callback-based APIs (a callback receiving (err, result) with no strong typing on either), and even when @types exist for them, the types are sometimes wider than the library's actual guaranteed behavior. Wrapping such an API in a small, strongly-typed adapter function — written once, used everywhere — both narrows the type to what your code actually needs and gives you a single place to update if the library's real behavior turns out to differ from its declared types.",
          code: {
            language: "typescript",
            code:
              "// A loosely-typed legacy callback API, wrapped in a strongly-typed Promise adapter\nfunction readFileAsync(path: string): Promise<string> {\n  return new Promise((resolve, reject) => {\n    legacyReadFile(path, (err: Error | null, data?: string) => {\n      if (err) reject(err);\n      else resolve(data ?? \"\");\n    });\n  });\n}",
          },
        },
        {
          heading: "Module Augmentation",
          body: "Sometimes a library's own types are correct but incomplete for your use case — a plugin adds a new method to a class the library defines, and you want the compiler to know about it. Module augmentation lets you reopen an existing module's declared types and add to them, using the same declare module syntax pointed at the library's actual module name rather than a new one, combined with interface declaration merging for the specific exported type being extended.",
          code: {
            language: "typescript",
            code:
              "// Augmenting Express's Request type to add a custom `user` property\nimport \"express\";\n\ndeclare module \"express\" {\n  interface Request {\n    user?: { id: number; role: string };\n  }\n}\n\n// Now, anywhere Express's Request type is used, req.user is recognized:\n// app.get(\"/profile\", (req, res) => { console.log(req.user?.id); });",
          },
        },
        {
          heading: "Handling any From Untyped Dependencies Safely",
          body: "Even with declaration files in place, some values crossing a library boundary inevitably arrive as `any` (parsed JSON responses, dynamically-shaped config) — the practical discipline is to narrow that `any` to a specific type as early as possible after it enters your code, ideally at the exact boundary where it's received, rather than letting it propagate untyped through several layers of your own application code where it silently disables checking everywhere it touches.",
          bullets: [
            "Treat the boundary where external/untyped data enters your code as the single place to validate and narrow it — after that point, the rest of your code should work with a real, specific type.",
            "A lightweight runtime validation library (zod, io-ts) can both validate and derive a precise static type from untyped data in one step, which is more robust than a manual type assertion.",
          ],
        },
        {
          heading: "ESM vs. CommonJS Interop Settings",
          body: "A large share of confusing 'cannot find module' or 'this import has no default export' errors come from a mismatch between how a library was published (CommonJS's module.exports vs. ECMAScript Modules' export default) and the project's tsconfig interop settings. Enabling esModuleInterop allows the simpler import defaultExport from \"cjs-library\" syntax to work correctly against CommonJS libraries that don't use a true default export, and allowSyntheticDefaultImports (usually implied by esModuleInterop) silences the type-checking-only complaint about that same pattern — both should essentially always be enabled in a modern tsconfig.json targeting Node.js or bundler-based projects.",
          code: {
            language: "json",
            code:
              "{\n  \"compilerOptions\": {\n    \"esModuleInterop\": true,\n    \"allowSyntheticDefaultImports\": true,\n    \"moduleResolution\": \"bundler\",\n    \"strict\": true\n  }\n}",
          },
        },
      ],
      commonPitfalls: [
        "Not checking whether a library already bundles its own types before installing a possibly redundant or outdated separate @types package.",
        "Leaving a quick `declare module \"lib\";` shim in place long-term, silently keeping every usage of that library typed as `any` indefinitely.",
        "Letting an `any` value from an untyped dependency propagate deep into application code instead of narrowing it to a real type at the boundary where it's received.",
        "Forgetting esModuleInterop, then fighting confusing default-import errors against CommonJS libraries that don't export a true ES default.",
        "Writing an overly broad hand-rolled .d.ts file that describes far more of a library's surface than is actually used, creating maintenance burden for types that may not even be correct.",
        "Trusting a community @types package's types as infallible when the library's actual runtime behavior has quietly diverged from what the types describe (a common issue with fast-moving libraries).",
      ],
      keyTakeaways: [
        "Check for bundled types (a \"types\" field in package.json) before installing a separate @types/* package — many modern libraries ship their own.",
        "declare module \"lib\"; with no body is a stopgap that types every import from that library as `any` — replace it with real types over time, don't leave it permanently.",
        "Write only the minimal .d.ts declarations your code actually uses; expand them incrementally rather than trying to type an entire library upfront.",
        "Narrow `any` values from untyped dependencies to a specific type as close as possible to where they enter your code.",
        "Module augmentation (declare module pointed at an existing library) is the correct way to add missing properties/methods to a library's own types.",
        "esModuleInterop and allowSyntheticDefaultImports should be enabled in virtually every modern tsconfig.json to avoid CommonJS/ESM default-import friction.",
      ],
      links: [
        { label: "TypeScript Handbook — Modules: Type Declarations", url: "https://www.typescriptlang.org/docs/handbook/modules/theory.html" },
        { label: "DefinitelyTyped — @types on npm", url: "https://www.typescriptlang.org/dt/search?search=" },
        { label: "TypeScript Handbook — tsconfig: esModuleInterop", url: "https://www.typescriptlang.org/tsconfig/#esModuleInterop" },
      ],
    },
  ],
};

export default data;
