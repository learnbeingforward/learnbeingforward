import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "placement-training-program",
  submodules: [
    {
      moduleTitle: `Java Fundamentals`,
      subModuleTitle: `Syntax & data types`,
      overview: `Java's type system is the foundation every later topic in this program builds on, and it is also one of the most heavily quizzed areas in placement interviews because it exposes whether a candidate truly understands how the language represents data in memory. Java is statically and strongly typed: every variable has a fixed type known at compile time, and the compiler rejects most type mismatches before the program ever runs. This guide covers the eight primitive types and their exact sizes and ranges, the crucial distinction between primitives and reference types (including autoboxing and the notorious Integer cache), widening versus narrowing conversions, the rules around the final keyword, and why String is immutable and pooled the way it is. Interviewers routinely ask "what's the difference between == and .equals()" or "why does Integer.valueOf(127) == Integer.valueOf(127) return true but 128 doesn't" — this section gives you the mechanics to answer both correctly and explain why.`,
      sections: [
        {
          heading: `The Eight Primitive Types`,
          body: `Java defines exactly eight primitive types, each with a fixed size that does not vary across platforms (unlike C/C++) — this platform independence is part of Java's "write once, run anywhere" guarantee. Four are integer types of increasing width (byte, short, int, long), two are floating-point (float, double), plus char (a single UTF-16 code unit) and boolean. Primitives are stored directly on the stack (for local variables) rather than as objects on the heap, which is why they are fast and have no method calls like .toString() available on them directly. The default numeric literal type in Java is int for whole numbers and double for decimals, which is why assigning 3.14 to a float requires an explicit f suffix (3.14f) or a cast — otherwise the compiler flags a lossy-conversion error.`,
          bullets: [
            `byte: 8-bit signed, -128 to 127`,
            `short: 16-bit signed, -32,768 to 32,767`,
            `int: 32-bit signed, about -2.1 billion to 2.1 billion (default for whole-number literals)`,
            `long: 64-bit signed, needs an L suffix for literals beyond int range (e.g. 10000000000L)`,
            `float: 32-bit IEEE 754, needs an f suffix (3.14f); double: 64-bit IEEE 754, the default for decimal literals`,
            `char: 16-bit unsigned, represents a single UTF-16 code unit, e.g. 'A' or '\\u0041'`,
            `boolean: true or false only — unlike C, an int can never substitute for a boolean in Java`,
          ],
        },
        {
          heading: `Primitives vs. Reference Types, and Autoboxing`,
          body: `Every primitive has a corresponding wrapper class (int → Integer, double → Double, boolean → Boolean, and so on) that wraps the primitive value inside an object stored on the heap, giving it methods and letting it be used in generic collections, which cannot hold primitives directly. Autoboxing is the compiler's automatic conversion from a primitive to its wrapper (int → Integer) when an object is expected, and unboxing is the reverse; this happens silently, for example when you add an int to a List<Integer>. The danger is that unboxing a null wrapper throws a NullPointerException with no obvious cast in the source code, and repeated autoboxing inside tight loops creates significant object-allocation overhead compared to primitive arithmetic.`,
          code: {
            language: `java`,
            code: `List<Integer> scores = new ArrayList<>();
scores.add(95);           // autoboxed: int 95 -> Integer.valueOf(95)
int first = scores.get(0); // unboxed: Integer -> int

Integer maybeNull = null;
int crash = maybeNull;    // throws NullPointerException at unboxing`,
          },
        },
        {
          heading: `The Integer Cache and == vs .equals()`,
          body: `Because Integer, Long, Short, Byte, and Character are objects, == compares references (memory addresses), not values — this is the single most common source of a subtle bug for developers coming from languages where == compares value. The JVM caches boxed Integer values from -128 to 127 (per the Integer.valueOf spec) as a performance optimization, so two autoboxed Integers in that range that hold the same value will happen to point at the same cached object, making == appear to "work" by accident. Outside that range, == reliably returns false for two separately created Integer objects with the same value, which is exactly why interviewers love this question — it exposes whether you understand reference identity versus value equality, not just memorized behavior.`,
          bullets: [
            `Integer.valueOf(100) == Integer.valueOf(100) → true (both within the cached -128..127 range)`,
            `Integer.valueOf(200) == Integer.valueOf(200) → false (outside the cache, two distinct objects)`,
            `Integer.valueOf(100).equals(Integer.valueOf(100)) → always true — .equals() compares value`,
            `Rule of thumb: always use .equals() (or compare unboxed primitives with ==) for wrapper types, never ==`,
          ],
        },
        {
          heading: `Widening, Narrowing, and Casting`,
          body: `Widening conversions (byte → short → int → long → float → double) happen implicitly because no information can be lost, so Java performs them automatically wherever a wider type is expected. Narrowing conversions (the reverse direction, e.g. double → int) can lose data or precision, so the compiler forces an explicit cast to make the potential loss visible in the source code. Casting a double to an int truncates the fractional part rather than rounding — (int) 9.99 evaluates to 9, not 10 — and casting an out-of-range long to an int silently wraps around using two's-complement overflow rather than throwing an exception, which is a frequent source of quietly wrong results in interview code.`,
          code: {
            language: `java`,
            code: `int i = 100;
long l = i;        // widening, implicit
double d = l;       // widening, implicit

double price = 9.99;
int truncated = (int) price;   // 9, not 10 -- truncation, not rounding

long big = 3_000_000_000L;
int overflowed = (int) big;    // wraps around, NOT 3,000,000,000`,
          },
        },
        {
          heading: `String Immutability and the String Pool`,
          body: `Strings in Java are immutable — once created, a String object's contents can never change; every "mutating" method (substring, concat, replace, toUpperCase) returns a brand-new String object rather than modifying the original. This immutability is what makes String safe to share across threads without synchronization and safe to use as a HashMap key (its hashCode can be cached once). String literals are additionally interned in a special memory region called the string pool: two literals with identical text share the same object, so "abc" == "abc" is true, but new String("abc") explicitly forces heap allocation of a new object outside the pool, so new String("abc") == "abc" is false even though .equals() returns true for both.`,
          bullets: [
            `String literals are pooled and reused: "abc" == "abc" → true`,
            `new String("abc") forces a new heap object: new String("abc") == "abc" → false`,
            `.intern() manually places (or retrieves) a String in the pool`,
            `Because Strings are immutable, repeated concatenation in a loop (s += x) creates a new object every iteration — use StringBuilder instead`,
          ],
        },
        {
          heading: `Type Inference with var`,
          body: `Since Java 10, the var keyword lets the compiler infer a local variable's type from its initializer, reducing boilerplate for verbose generic types (var map = new HashMap<String, List<Integer>>();) while remaining fully statically typed — var is not dynamic typing, and the inferred type is fixed permanently at compile time. var can only be used for local variables with an initializer present (never for fields, method parameters, or return types), and it cannot be used with a null literal alone since there would be nothing to infer from. Overusing var when the right-hand side doesn't make the type obvious (e.g. var result = process();) hurts readability, so most style guides recommend it mainly when the type is already explicit in the initializer, such as constructor calls.`,
        },
        {
          heading: `final Variables and Constants`,
          body: `The final keyword applied to a variable means it can be assigned exactly once — for a primitive, that fixes its value permanently; for a reference type, it fixes which object the variable points to, but the object's own internal state can still change if that object is mutable (final List<Integer> list can still have elements added to it, even though list itself can never be reassigned). By convention, class-level constants combine static and final (public static final int MAX_USERS = 100;) so the value is shared once per class rather than duplicated per instance, and uppercase-with-underscores naming signals immutability to readers at a glance.`,
        },
      ],
      commonPitfalls: [
        `Using == to compare boxed Integer/Long/Character objects and getting inconsistent results depending on whether the value falls inside the -128..127 cache range.`,
        `Assuming (int) someDouble rounds — it truncates toward zero, so (int) 9.99 is 9, not 10.`,
        `Forgetting the L suffix on a long literal that exceeds int range, causing a compile-time "integer number too large" error or silent overflow.`,
        `Concatenating Strings with += inside a loop, unaware that each iteration allocates a brand-new String object because Strings are immutable.`,
        `Unboxing a null wrapper object (e.g. assigning a null Integer field to an int) and getting a NullPointerException with no visible cast at the crash site.`,
        `Believing new String("x") == "x" should be true because the text is identical — it compares references, and new String(...) is deliberately taken out of the pool.`,
        `Declaring a field or method parameter with var, not realizing var is legal only for local variables with an initializer.`,
      ],
      keyTakeaways: [
        `Java has exactly eight primitives with fixed, platform-independent sizes — memorize byte/short/int/long/float/double/char/boolean and their ranges.`,
        `Always compare wrapper objects with .equals(), never == — the Integer cache (-128 to 127) makes == unreliable and inconsistent.`,
        `Widening conversions are implicit and safe; narrowing conversions require an explicit cast and can truncate or overflow silently.`,
        `String is immutable — every "mutating" method returns a new object, and string literals are pooled while new String(...) is not.`,
        `var is compile-time type inference, not dynamic typing — the type is fixed forever at the point of declaration.`,
        `final on a reference variable freezes which object it points to, not the mutability of that object's internal state.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Primitive Data Types`, url: `https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html` },
        { label: `Oracle Java Tutorials — Autoboxing and Unboxing`, url: `https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html` },
        { label: `GeeksforGeeks — Java String Pool`, url: `https://www.geeksforgeeks.org/java/string-pool-java/` },
      ],
    },
    {
      moduleTitle: `Java Fundamentals`,
      subModuleTitle: `Control flow`,
      overview: `Control flow statements determine the order in which a Java program's instructions execute, and while the basic if/else and for/while constructs are near-universal across languages, Java has specific rules and modern additions — labeled break/continue, the traditional colon-based switch versus the Java 14+ arrow-based switch expression with yield — that come up constantly in both written code and whiteboard interview questions. This guide covers every branching and looping construct in Java, the difference between a switch statement (executes code, no value) and a switch expression (produces a value, exhaustive), how labeled loops let you break out of nested loops cleanly, and the classic fall-through pitfall that has caused production bugs for decades. Mastering these constructs fluently — including reading them quickly under interview time pressure — is a prerequisite for every algorithmic topic that follows in the DSA modules.`,
      sections: [
        {
          heading: `if / else if / else`,
          body: `Java evaluates conditions top to bottom, executing the first branch whose condition is true and skipping the rest — an else if chain is really a series of nested else { if (...) } blocks that Java's syntax lets you write flat. Every condition must evaluate to a boolean; unlike C, an int cannot be used directly as a condition (if (x) is a compile error unless x is a boolean), which eliminates an entire class of "assignment instead of comparison" bugs like if (x = 5) that plague C code. Braces are technically optional for single-statement bodies, but omitting them is a well-known source of bugs when a second statement is later added without noticing it falls outside the if — most style guides and linters require braces on every branch unconditionally.`,
        },
        {
          heading: `switch: Statement vs. Expression`,
          body: `The traditional switch statement matches a value against several case labels and, critically, falls through to the next case unless a break is present — this default fall-through behavior is a famous source of bugs when a break is accidentally omitted. Java 14 introduced the switch expression using arrow syntax (case X ->), which does not fall through, can return a value directly, and the compiler enforces exhaustiveness on enums and sealed types. The yield keyword returns a value from a multi-statement case block inside a switch expression, playing the role that return plays inside a method.`,
          code: {
            language: `java`,
            code: `// Traditional switch statement -- fall-through risk
switch (day) {
  case 1:
  case 7:
    System.out.println("Weekend");
    break;          // omit this and execution falls into the next case
  default:
    System.out.println("Weekday");
}

// Modern switch expression (Java 14+) -- no fall-through, returns a value
String type = switch (day) {
  case 1, 7 -> "Weekend";
  case 2, 3, 4, 5, 6 -> "Weekday";
  default -> {
    yield "Unknown";   // yield returns a value from a block case
  }
};`,
          },
        },
        {
          heading: `for, while, and do-while Loops`,
          body: `The classic for loop packs initialization, condition, and increment into one line and is the standard choice when the number of iterations is known or index-based access is needed. while checks its condition before each iteration and may run zero times; do-while checks after, guaranteeing at least one execution — a distinction that matters for menu-driven programs or input-validation loops that must run once before checking user input. The enhanced for-each loop (for (Type item : collection)) iterates any Iterable or array without manual indexing, but it gives you no access to the current index and cannot be used to remove elements safely (that requires an explicit Iterator).`,
          bullets: [
            `for (int i = 0; i < n; i++) — best when you need the index or a fixed iteration count.`,
            `while (condition) { ... } — condition checked before each iteration; may execute zero times.`,
            `do { ... } while (condition); — condition checked after; always executes at least once.`,
            `for (Type x : collection) — cleanest syntax for simple iteration, but no index and no safe removal.`,
          ],
        },
        {
          heading: `break, continue, and Labeled Loops`,
          body: `break exits the nearest enclosing loop or switch immediately; continue skips the rest of the current iteration and jumps to the loop's next condition check. Both, by default, only affect the innermost loop they're written in — to break or continue an outer loop from inside a nested loop, Java uses labels: a named identifier placed before the outer loop's declaration, referenced by break label; or continue label;. This is one of Java's less commonly used but genuinely useful features, and interviewers sometimes test it specifically because many candidates only know unlabeled break/continue.`,
          code: {
            language: `java`,
            code: `outer:
for (int i = 0; i < rows; i++) {
  for (int j = 0; j < cols; j++) {
    if (grid[i][j] == target) {
      System.out.println("Found at " + i + "," + j);
      break outer;      // exits BOTH loops immediately
    }
  }
}`,
          },
        },
        {
          heading: `The Ternary Operator`,
          body: `The conditional (ternary) operator condition ? valueIfTrue : valueIfFalse is a compact expression form of if/else that produces a value rather than executing statements, making it useful for inline assignment (int max = (a > b) ? a : b;) but a readability liability when nested or when the branches themselves are long expressions. A frequent interview gotcha involves mixing primitive types in the two branches — the ternary operator's result type follows numeric promotion rules, which can silently produce a wider or unexpected type (e.g. mixing an int and a Double branch can trigger unboxing that throws a NullPointerException if the Double is null).`,
        },
        {
          heading: `Nested Loops and Complexity Awareness`,
          body: `Nested loops — a loop inside another loop — are ubiquitous in matrix processing, brute-force comparisons, and pattern-printing problems, and each level of nesting multiplies the iteration count: two nested loops each running n times perform n² total iterations, three nested loops perform n³. Recognizing this multiplicatively at a glance, before writing a single line of code, is essential for reasoning about a solution's time complexity during an interview — control flow structure and Big-O are directly linked, and interviewers expect you to state the complexity of nested-loop code without needing to trace through it manually.`,
        },
      ],
      commonPitfalls: [
        `Forgetting break in a traditional switch statement, causing execution to silently fall through into the next case's code.`,
        `Writing if (x) where x is a non-boolean expression out of habit from C — Java rejects this at compile time, but candidates sometimes write pseudocode that assumes it works.`,
        `Omitting braces on a single-statement if/else branch, then later adding a second statement that unintentionally falls outside the conditional.`,
        `Using continue inside a nested loop when the intent was to skip the outer loop's iteration, without realizing a label is required to target the outer loop.`,
        `Confusing while and do-while, especially in input-validation code that needs to run at least once before the condition can be evaluated.`,
        `Mixing primitive and boxed types across ternary operator branches, triggering an unexpected unboxing NullPointerException.`,
        `Underestimating the complexity of triple-nested loops during an interview by not immediately recognizing O(n³) growth.`,
      ],
      keyTakeaways: [
        `Traditional switch falls through without break; the modern arrow-based switch expression (Java 14+) does not, and can directly return a value.`,
        `while checks before the loop body runs and may execute zero times; do-while checks after and always runs at least once.`,
        `Labeled break/continue are the only way to control an outer loop from inside a nested inner loop.`,
        `yield returns a value from a multi-statement block inside a switch expression, analogous to return inside a method.`,
        `Java requires boolean conditions everywhere a condition is expected — there is no implicit int-to-boolean conversion.`,
        `Nesting loops multiplies iteration counts — two nested loops over n is O(n²), three is O(n³); recognize this instantly for complexity analysis.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Control Flow Statements`, url: `https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html` },
        { label: `Oracle Java Tutorials — The switch Statement`, url: `https://docs.oracle.com/javase/tutorial/java/nutsandbolts/switch.html` },
        { label: `Baeldung — Java Switch Expressions`, url: `https://www.baeldung.com/java-switch` },
      ],
    },
    {
      moduleTitle: `Java Fundamentals`,
      subModuleTitle: `OOP basics`,
      overview: `Java is fundamentally an object-oriented language, and its four pillars — encapsulation, inheritance, polymorphism, and abstraction — are asked about in nearly every technical interview, often with a request to explain each using a concrete example rather than a textbook definition. This guide walks through how classes and objects actually work in Java's memory model, the access modifiers that enforce encapsulation, how inheritance and the super keyword let one class extend another, the crucial difference between compile-time polymorphism (overloading) and runtime polymorphism (overriding), and when to reach for an abstract class versus an interface. It closes with the equals/hashCode/toString contract, a topic that trips up even experienced developers when they override one but forget the other, silently breaking hash-based collections like HashMap and HashSet.`,
      sections: [
        {
          heading: `Classes, Objects, and Constructors`,
          body: `A class is a blueprint describing state (fields) and behavior (methods); an object is a runtime instance of that blueprint, created with new, which allocates memory on the heap and invokes a constructor. A constructor shares its name with the class, has no return type (not even void), and its job is to put the new object into a valid initial state. If no constructor is written, Java supplies a no-argument default constructor automatically — but only if zero constructors exist; the moment you write any constructor yourself, the implicit default disappears, a frequent source of "constructor not found" compile errors when a no-arg constructor is expected elsewhere (like frameworks that instantiate via reflection).`,
          code: {
            language: `java`,
            code: `public class Employee {
    private String name;
    private double salary;

    public Employee(String name, double salary) {
        this.name = name;      // 'this' disambiguates field from parameter
        this.salary = salary;
    }
}`,
          },
        },
        {
          heading: `Encapsulation and Access Modifiers`,
          body: `Encapsulation means bundling data with the methods that operate on it and restricting direct access to that data from outside the class — typically by making fields private and exposing controlled access through public getter/setter methods, which lets the class validate input or change its internal representation later without breaking callers. Java has four access levels applied to classes, fields, and methods, and interviewers routinely ask you to rank them by visibility, since "package-private" (no modifier at all) is the one candidates most often forget exists.`,
          bullets: [
            `private — visible only within the same class.`,
            `(no modifier, "package-private") — visible within the same package only.`,
            `protected — visible within the same package, plus subclasses in other packages.`,
            `public — visible everywhere.`,
          ],
        },
        {
          heading: `Inheritance and super`,
          body: `A class extends another using the extends keyword, inheriting its public and protected members and gaining the ability to add new fields/methods or override existing ones. Java supports single inheritance of classes only (a class can extend exactly one superclass) precisely to avoid the "diamond problem" ambiguity that multiple class inheritance creates — multiple inheritance of behavior is instead achieved through interfaces. The super keyword refers to the immediate superclass: super(...) calls a specific superclass constructor and must be the first statement in a subclass constructor if used, while super.method() invokes the superclass's version of an overridden method from within the override.`,
          code: {
            language: `java`,
            code: `public class Manager extends Employee {
    private int teamSize;

    public Manager(String name, double salary, int teamSize) {
        super(name, salary);      // must be the first statement
        this.teamSize = teamSize;
    }

    @Override
    public String toString() {
        return super.toString() + ", team size: " + teamSize;
    }
}`,
          },
        },
        {
          heading: `Polymorphism: Overloading vs. Overriding`,
          body: `Method overloading is compile-time (static) polymorphism: multiple methods in the same class share a name but differ in parameter list (number, type, or order), and the compiler picks which one to call based on the argument types at the call site. Method overriding is runtime (dynamic) polymorphism: a subclass redefines a method it inherited with the identical signature, and which version actually runs is decided at runtime based on the object's actual class, not the reference's declared type — this is why a Employee e = new Manager(...); e.toString() call invokes Manager's overridden version, not Employee's. The @Override annotation is not required by the compiler but should always be used, because it makes the compiler verify the signature genuinely matches a superclass method, catching accidental overloads (a typo'd parameter type) that would otherwise silently fail to override anything.`,
          bullets: [
            `Overloading: same method name, different parameter list, resolved at compile time.`,
            `Overriding: same signature in a subclass, resolved at runtime based on the actual object type.`,
            `@Override catches accidental overloads caused by a mismatched signature — always use it.`,
            `Static methods, private methods, and fields are NOT polymorphic — they are resolved by the reference's declared type, not the object's actual type.`,
          ],
        },
        {
          heading: `Abstraction: Abstract Classes vs. Interfaces`,
          body: `An abstract class can hold both fully implemented methods and abstract (unimplemented) ones, can declare fields with any access modifier, and is extended by exactly one subclass at a time — it models an "is-a" relationship where subclasses share substantial common implementation. An interface (in modern Java) can hold abstract methods, default methods with a body, static methods, and constants (implicitly public static final), and a class can implement any number of interfaces — it models a "can-do" capability contract rather than an inheritance hierarchy. The practical rule interviewers look for: use an abstract class when subclasses share meaningful state and implementation; use an interface when unrelated classes need to guarantee the same capability.`,
        },
        {
          heading: `Static vs. Instance Members`,
          body: `A static field or method belongs to the class itself, shared by every instance and accessible without creating an object (ClassName.member); an instance field or method belongs to a specific object, and each object gets its own copy of instance fields. Static methods cannot access instance (non-static) members directly, because there's no implicit this — there might be zero, one, or a thousand instances in existence when a static method runs. A common beginner mistake is marking a method static purely to "call it without new," without considering whether it logically needs per-object state, leading to designs that can't be polymorphic since static methods aren't overridden, only hidden.`,
        },
        {
          heading: `The equals(), hashCode(), and toString() Contract`,
          body: `By default, Object.equals() compares references (identical to ==) and Object.hashCode() derives from the object's memory address, which means two logically "equal" objects (two Point objects both at (1,2)) are not equal by default and won't behave correctly as HashMap keys or HashSet elements. The contract requires: if two objects are equal via .equals(), they MUST return the same hashCode() — violating this silently breaks hash-based collections, because an object can be inserted into a HashSet and then become "unfindable" by an equal object with a different hash. IDEs and modern Java (records, Lombok) can generate a correct equals/hashCode pair automatically, and when writing it by hand, always override both together, never just one.`,
          bullets: [
            `Override equals() and hashCode() together, always — never just one.`,
            `Two equal objects (per .equals()) must return the same hashCode(); the reverse isn't required (hash collisions between unequal objects are fine).`,
            `toString() should return a human-readable summary for debugging/logging — the default Object.toString() prints an unhelpful class name + hash code.`,
            `Java 16+ records auto-generate correct equals/hashCode/toString from the record's components.`,
          ],
        },
      ],
      commonPitfalls: [
        `Overriding equals() without overriding hashCode(), silently breaking HashMap/HashSet lookups for that type.`,
        `Forgetting @Override and accidentally overloading instead of overriding due to a mismatched parameter type or a typo in the method name.`,
        `Assuming static methods are polymorphic — they are resolved by the reference's declared type at compile time, not the runtime object type ("method hiding," not overriding).`,
        `Making every field public "to keep it simple," defeating encapsulation and removing the ability to validate or change internal representation later.`,
        `Calling super(...) after other statements in a subclass constructor — it must be the very first statement, or the compiler rejects it.`,
        `Choosing an abstract class when an interface would allow implementing multiple contracts, unnecessarily locking a class into a single-inheritance chain.`,
        `Relying on the default toString() output in production logs, getting an uninformative ClassName@hexHash string instead of meaningful data.`,
      ],
      keyTakeaways: [
        `Encapsulation: keep fields private, expose behavior through methods so internal representation can change safely.`,
        `Inheritance is single for classes (extends one class) but multiple for interfaces (implements many).`,
        `Overloading is resolved at compile time by parameter list; overriding is resolved at runtime by the object's actual class.`,
        `Abstract classes share implementation across a family of related types; interfaces define a capability contract across unrelated types.`,
        `Static members belong to the class and cannot access instance state directly — they are not polymorphic.`,
        `Always override equals() and hashCode() together, or neither — breaking the contract corrupts hash-based collections silently.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Classes and Objects`, url: `https://docs.oracle.com/javase/tutorial/java/javaOO/classes.html` },
        { label: `Oracle Java Tutorials — Interfaces and Inheritance`, url: `https://docs.oracle.com/javase/tutorial/java/IandI/index.html` },
        { label: `GeeksforGeeks — equals() and hashCode() in Java`, url: `https://www.geeksforgeeks.org/java/equals-hashcode-methods-java/` },
      ],
    },
    {
      moduleTitle: `Java Fundamentals`,
      subModuleTitle: `Arrays & strings`,
      overview: `Arrays and Strings are the two data structures every Java developer touches on day one, and getting their mechanics precisely right — fixed size, default values, reference semantics, and String's immutability — matters both for writing correct code and for the DSA modules ahead, which build directly on top of them. This guide covers how Java arrays are allocated and initialized (including multi-dimensional arrays, which are really arrays of arrays), the Arrays utility class, the core String API (substring, split, indexOf, and the ever-confusing == versus .equals()), and StringBuilder as the mutable alternative used whenever a string is built incrementally. Unlike the DSA "Arrays & strings" submodule, which focuses on algorithmic techniques applied to arrays and strings, this submodule focuses purely on Java language mechanics — the syntax and semantics you need before any algorithm can be written correctly.`,
      sections: [
        {
          heading: `Array Declaration, Fixed Size, and Default Values`,
          body: `A Java array is a fixed-size, homogeneous sequence of elements allocated on the heap; once created with new int[10], its length can never change — "resizing" an array in Java always means allocating a brand-new array and copying elements into it, which is exactly what ArrayList does internally. Arrays are zero-indexed, and accessing an index outside [0, length) throws an ArrayIndexOutOfBoundsException at runtime rather than silently corrupting memory (unlike C). When an array is created without explicit values, every element is set to that type's default: 0 for numeric types, false for boolean, '\\u0000' for char, and null for any reference/object type — reading an uninitialized reference-type element gives null, not a runtime error, until you try to call a method on it.`,
          code: {
            language: `java`,
            code: `int[] scores = new int[5];          // all elements default to 0
String[] names = new String[3];     // all elements default to null

int[] grades = {85, 90, 78};        // array literal, length fixed at 3
System.out.println(scores.length);  // 5 -- 'length' is a field, not a method

// Multi-dimensional array: really an array of arrays
int[][] grid = new int[3][4];       // 3 rows, each a length-4 int[]
grid[1][2] = 7;`,
          },
        },
        {
          heading: `Arrays Are Reference Types with Reference Semantics`,
          body: `Even an array of primitives is itself a reference type — the array variable holds a reference to a heap-allocated block, not the elements themselves. This means passing an array to a method passes a copy of the reference, not a copy of the data: modifications the method makes to array elements are visible to the caller after the method returns, unlike passing a primitive int (which is passed by value and cannot be modified by the callee). Assigning one array variable to another (int[] b = a;) makes both variables point at the identical array; mutating through b is visible through a as well, since there is only one underlying array object.`,
        },
        {
          heading: `The Arrays Utility Class`,
          body: `java.util.Arrays provides static helper methods that operate on arrays without requiring manual loops for common operations: sorting, searching, filling, comparing, and converting to a readable string. Arrays.toString() is essential for debugging — printing an array directly with System.out.println(arr) prints its unhelpful hash-based reference string ([I@1b6d3586) rather than its contents, a mistake nearly every Java beginner makes at least once.`,
          bullets: [
            `Arrays.sort(arr) — sorts in place, ascending (Dual-Pivot Quicksort for primitives, O(n log n) average).`,
            `Arrays.binarySearch(arr, key) — requires the array to already be sorted; returns the index or a negative insertion point.`,
            `Arrays.fill(arr, value) — sets every element to the given value.`,
            `Arrays.equals(a, b) — compares contents element-by-element (unlike a == b, which compares references).`,
            `Arrays.toString(arr) / Arrays.deepToString(arr) — human-readable representation for 1D and nested arrays respectively.`,
          ],
        },
        {
          heading: `String Immutability in Practice`,
          body: `Every String method that appears to modify a string — substring(), replace(), toUpperCase(), trim(), concat() — actually allocates and returns a new String object, leaving the original untouched. A classic beginner bug is calling str.trim(); and expecting str itself to change, when the correct usage is str = str.trim();, reassigning the variable to the newly returned object. This immutability makes String inherently thread-safe and cacheable, but it means any code that builds up a string across many iterations — even something as simple as joining words in a loop — should use StringBuilder instead of += to avoid allocating a new String object on every single iteration.`,
          code: {
            language: `java`,
            code: `StringBuilder sb = new StringBuilder();
for (String word : words) {
    sb.append(word).append(" ");   // mutates the SAME buffer, no new object per iteration
}
String result = sb.toString().trim();`,
          },
        },
        {
          heading: `Core String Methods Every Interview Expects`,
          body: `A handful of String methods appear constantly in interview code and are worth knowing cold, including their exact boundary behavior: substring(begin, end) takes a start index inclusive and an end index exclusive, so "hello".substring(1, 3) returns "el", not "ell". charAt(index) throws StringIndexOutOfBoundsException past the string's length. split(regex) treats its argument as a regular expression, not a literal string, which surprises candidates who split on "." expecting a literal dot (it must be escaped as "\\\\." since a bare dot means "any character" in regex).`,
          bullets: [
            `charAt(i) — returns the char at index i; throws if out of bounds.`,
            `substring(begin, end) — begin inclusive, end exclusive; substring(begin) goes to the end of the string.`,
            `indexOf(str) — first occurrence index, or -1 if not found.`,
            `split(regex) — splits on a REGULAR EXPRESSION, not a literal; special regex characters (. * + |) must be escaped.`,
            `toCharArray() — converts a String to a char[], often the first step in string-manipulation algorithms.`,
          ],
        },
        {
          heading: `Comparing Strings Correctly`,
          body: `As with boxed wrapper types, == on String compares references, and because of the string pool, two literals can appear equal by == while two runtime-constructed strings with identical content will not be — the only reliable way to compare String content is .equals() (case-sensitive) or .equalsIgnoreCase() (case-insensitive). For ordering comparisons (e.g. sorting), .compareTo() returns a negative, zero, or positive int based on lexicographic (dictionary, case-sensitive) order, following the same contract as Comparable.compareTo() used throughout the Collections framework.`,
        },
      ],
      commonPitfalls: [
        `Printing an array directly with System.out.println(arr) and getting an unreadable [I@1b6d3586 instead of its contents — use Arrays.toString(arr).`,
        `Comparing Strings with == instead of .equals(), which works "by accident" for pooled literals but fails for strings built at runtime (e.g. from user input or concatenation).`,
        `Calling str.trim() or str.replace(...) and expecting the original variable to change in place, forgetting Strings are immutable and the result must be reassigned.`,
        `Using str.split(".") expecting a literal dot, when split() treats its argument as a regex and "." matches any character.`,
        `Building a large string with += inside a loop instead of StringBuilder, causing O(n²) time due to repeated full-string copies.`,
        `Confusing substring(begin, end)'s exclusive end index, off-by-one errors are extremely common here.`,
        `Assuming an array can be resized — attempting arr.length = 10 or similar, when arrays are permanently fixed-size once created.`,
      ],
      keyTakeaways: [
        `Java arrays are fixed-size, zero-indexed, and default-initialized (0/false/null); "resizing" always means allocating a new array.`,
        `Arrays are reference types — passing one to a method shares the same underlying data, unlike passing a primitive.`,
        `Every String "mutation" method returns a new object — Strings themselves never change after creation.`,
        `Use StringBuilder for repeated concatenation to avoid O(n²) behavior from repeated immutable-string copies.`,
        `Always compare String content with .equals(), never == — pooling makes == unreliable for anything but literals.`,
        `substring(begin, end) is begin-inclusive, end-exclusive — a frequent off-by-one trap.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Arrays`, url: `https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html` },
        { label: `Oracle Java SE Docs — String (java.lang.String)`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html` },
        { label: `Oracle Java SE Docs — StringBuilder`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/StringBuilder.html` },
      ],
    },
    {
      moduleTitle: `Java Fundamentals`,
      subModuleTitle: `Exception handling`,
      overview: `Robust Java programs anticipate failure — a missing file, a null reference, a division by zero — and exception handling is the language's structured mechanism for detecting, propagating, and recovering from these failures without crashing the whole program or leaving resources in a corrupted state. This guide covers Java's exception class hierarchy and the checked-versus-unchecked distinction that the compiler actively enforces, the mechanics of try-catch-finally including multi-catch blocks, the modern try-with-resources statement that guarantees resources are closed even when an exception is thrown, how to define and throw custom exceptions, and exception chaining for preserving root-cause information. Interviewers frequently probe this topic because sloppy exception handling — swallowing exceptions silently, catching Exception too broadly, or leaking resources — is exactly the kind of subtle bug that separates junior code from production-ready code.`,
      sections: [
        {
          heading: `The Exception Class Hierarchy`,
          body: `Every throwable in Java descends from Throwable, which splits into Error (serious JVM-level problems like OutOfMemoryError that applications generally shouldn't try to catch or recover from) and Exception (problems an application is expected to handle). Exception further splits into checked exceptions (subclasses of Exception but not RuntimeException, such as IOException and SQLException) and unchecked exceptions (subclasses of RuntimeException, such as NullPointerException and ArrayIndexOutOfBoundsException). This hierarchy is what the compiler inspects to decide whether it must force you to handle a given exception.`,
          bullets: [
            `Throwable → Error (JVM-level, generally not caught) and Exception (application-level).`,
            `Checked exceptions (IOException, SQLException) — must be caught or declared with throws, enforced at compile time.`,
            `Unchecked exceptions (RuntimeException and subclasses: NullPointerException, IllegalArgumentException, ArrayIndexOutOfBoundsException) — not compiler-enforced, usually signal programming bugs.`,
            `Checked exceptions represent recoverable external conditions; unchecked exceptions usually represent a bug that should be fixed, not caught defensively.`,
          ],
        },
        {
          heading: `try-catch-finally Mechanics`,
          body: `Code that might throw is wrapped in a try block; one or more catch blocks handle specific exception types, matched top to bottom (so a more specific exception type must be caught before a more general one, or the specific catch becomes unreachable and the compiler rejects it); a finally block runs unconditionally — whether the try succeeded, an exception was caught, or an exception propagated uncaught — making it the traditional place to release resources. A multi-catch block (catch (IOException | SQLException e)) lets one handler cover multiple unrelated exception types without duplicating the handling code, as long as the types don't share a subclass relationship.`,
          code: {
            language: `java`,
            code: `try {
    riskyOperation();
} catch (FileNotFoundException e) {
    System.err.println("File missing: " + e.getMessage());
} catch (IOException | SQLException e) {
    // multi-catch: handles two unrelated exception types identically
    System.err.println("I/O or DB failure: " + e.getMessage());
} finally {
    System.out.println("Runs no matter what happened above");
}`,
          },
        },
        {
          heading: `try-with-resources`,
          body: `Before Java 7, releasing a resource (a file stream, a database connection) safely required a finally block that itself could throw while closing, masking the original exception — a genuinely awkward and error-prone pattern. try-with-resources, introduced in Java 7, automatically closes any resource that implements AutoCloseable at the end of the try block, in reverse order of declaration, even if an exception is thrown — and it does so without any explicit finally block at all. Since Java 9, a resource declared as an effectively-final variable outside the try can be referenced directly inside the parentheses without re-declaring it.`,
          code: {
            language: `java`,
            code: `try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        process(line);
    }
} catch (IOException e) {
    System.err.println("Failed to read file: " + e.getMessage());
}
// reader.close() is called automatically here, even if an exception was thrown`,
          },
        },
        {
          heading: `throw vs. throws, and Custom Exceptions`,
          body: `throw is a statement that actually raises an exception instance at a specific point in code (throw new IllegalArgumentException("bad input")); throws is a method-signature declaration listing checked exceptions that method might propagate to its caller, forcing every caller to handle or re-declare them. Custom exceptions are ordinary classes that extend Exception (checked) or RuntimeException (unchecked), typically adding a constructor that forwards a message (and optionally a cause) to the superclass — this lets a domain express specific, meaningful failure types (InsufficientFundsException) instead of forcing every caller to parse a generic exception's message string to figure out what went wrong.`,
          code: {
            language: `java`,
            code: `public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public void withdraw(double amount) {
    if (amount > balance) {
        throw new InsufficientFundsException("Requested " + amount + " exceeds balance " + balance);
    }
    balance -= amount;
}`,
          },
        },
        {
          heading: `Exception Chaining and Preserving Root Cause`,
          body: `When catching one exception and throwing a different, higher-level one (common when translating a low-level SQLException into a domain-specific DataAccessException), it's essential to pass the original exception as the cause parameter rather than discarding it — otherwise the stack trace shown in logs points only at the translation code, hiding the actual root cause that triggered the failure. getCause() lets any later code (or a log viewer) walk back through the full chain of causation, which is often the only way to diagnose a failure that passed through several layers of a real application.`,
          code: {
            language: `java`,
            code: `try {
    executeQuery();
} catch (SQLException e) {
    throw new DataAccessException("Failed to load user", e); // e becomes the "cause"
}`,
          },
        },
        {
          heading: `finally, Return Values, and a Subtle Gotcha`,
          body: `A return statement inside a try or catch block does not exit the method immediately if a finally block is present — finally still runs first. More subtly, if finally itself contains a return statement, it silently overrides any return value or even any exception from the try/catch block, discarding them entirely with no warning — this is almost always unintentional and is flagged by every reputable linter, but it's a genuinely correct (if surprising) part of the language specification worth knowing for interview questions that test edge-case understanding.`,
        },
        {
          heading: `Best Practices: What Not To Do`,
          body: `The single worst exception-handling anti-pattern is the empty catch block — catch (Exception e) {} — which silently discards a failure with no log, no rethrow, and no trace of what happened, turning debugging into guesswork. A close second is catching the overly broad Exception (or worse, Throwable) type when a specific exception type was expected, which can accidentally swallow unrelated bugs (like a NullPointerException from a typo) alongside the exception you actually meant to handle. Production code should log the full exception (including stack trace) at the point of catching, or rethrow it wrapped with additional context, but never discard it silently.`,
        },
      ],
      commonPitfalls: [
        `Writing an empty catch block that silently swallows an exception, making failures invisible and debugging nearly impossible.`,
        `Catching the broad Exception type when a specific one was intended, accidentally masking unrelated bugs alongside the expected failure.`,
        `Forgetting that a return inside finally silently discards any exception or return value from the try/catch block.`,
        `Declaring throws Exception on a method signature as a lazy way to avoid the compiler's checked-exception enforcement, losing all type information for callers.`,
        `Catching an exception and rethrowing a new one without passing the original as the cause, losing the root-cause stack trace in logs.`,
        `Manually closing resources in a finally block instead of using try-with-resources, risking a resource leak if the close() call itself throws.`,
        `Using exceptions for ordinary control flow (e.g. throwing to break out of a loop) instead of a normal conditional, hurting both performance and readability.`,
      ],
      keyTakeaways: [
        `Checked exceptions are compiler-enforced and represent recoverable conditions; unchecked (RuntimeException) exceptions usually signal a programming bug.`,
        `finally always runs, whether or not an exception was thrown — the correct place for cleanup that isn't resource closing.`,
        `try-with-resources auto-closes any AutoCloseable resource, even on an exception, and should be preferred over manual finally-based closing.`,
        `throw raises an exception instance; throws declares that a method may propagate one — don't confuse the two keywords.`,
        `Always chain exceptions (pass the original as the cause) when translating one exception type into another, to preserve root-cause traceability.`,
        `An empty catch block is the single worst exception-handling anti-pattern — always log or rethrow, never silently discard.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Exceptions`, url: `https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html` },
        { label: `Oracle Java Tutorials — The try-with-resources Statement`, url: `https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html` },
        { label: `Baeldung — Exception Handling in Java`, url: `https://www.baeldung.com/java-exceptions` },
      ],
    },
    {
      moduleTitle: `Java Intermediate`,
      subModuleTitle: `Collections framework`,
      overview: `The Java Collections Framework is arguably the single most interview-tested topic in the entire Java curriculum, because knowing which collection to reach for — and why — signals real engineering judgment rather than memorized syntax. This guide covers the core hierarchy (List, Set, Queue, Map), the concrete implementations you'll use constantly (ArrayList, LinkedList, HashSet, TreeSet, LinkedHashSet, HashMap, TreeMap, LinkedHashMap) with their actual internal data structures and Big-O complexity for common operations, how HashMap resolves collisions and rehashes as it grows, the ConcurrentModificationException trap when mutating a collection while iterating it, and the Comparable/Comparator distinction for custom ordering. Every one of these details has appeared verbatim in real placement interview questions — "what's the time complexity of HashMap.get()" and "why does ArrayList insertion at the front cost O(n)" are asked constantly.`,
      sections: [
        {
          heading: `The Core Hierarchy: Collection vs. Map`,
          body: `The Collections Framework splits into two parallel hierarchies that do not share a common root: the Collection interface (extended by List, Set, and Queue) represents a group of individual elements, while Map represents key-value pairs and is deliberately not a Collection, because its fundamental operation (lookup by key) differs from iterating a flat sequence of elements. List preserves insertion order and allows duplicates and index-based access; Set enforces uniqueness (no duplicates, by equals()/hashCode()); Queue models FIFO (or priority-based) processing order. Every concrete class you'll use — ArrayList, HashSet, HashMap — implements one of these interfaces, and interview questions are almost always phrased in terms of the interface ("when would you use a Set over a List") rather than the concrete class.`,
        },
        {
          heading: `List Implementations: ArrayList vs. LinkedList`,
          body: `ArrayList is backed by a dynamically resized array: random access by index is O(1) since it's direct array indexing, but inserting or removing at the front or middle is O(n) because every subsequent element must shift. LinkedList is backed by a doubly-linked list of nodes: insertion/removal at a known position (via an iterator) is O(1) since it's just pointer relinking, but random access by index is O(n) because reaching index i requires walking i nodes from one end. In practice, ArrayList is the default choice for almost all use cases because modern CPU cache locality makes its array-based access faster in real-world benchmarks even for many "insert in the middle" workloads — LinkedList is rarely the right answer despite being the "textbook" choice for insertion-heavy code.`,
          bullets: [
            `ArrayList: O(1) get(index) and add-at-end (amortized), O(n) insert/remove at front or middle.`,
            `LinkedList: O(1) insert/remove given a node reference/iterator, O(n) get(index) (must traverse).`,
            `ArrayList's dynamic resize (grow() when full) copies all elements to a new, larger backing array — an O(n) operation, but amortized O(1) per add() over many calls.`,
            `Vector is a legacy synchronized alternative to ArrayList — effectively obsolete since Java 5's concurrent collections are faster.`,
          ],
        },
        {
          heading: `Set Implementations: HashSet, LinkedHashSet, TreeSet`,
          body: `HashSet stores elements in a hash table, giving O(1) average-case add/remove/contains but no guaranteed iteration order at all — two runs of the same program can even iterate in different orders. LinkedHashSet adds a doubly-linked list threading through the hash table entries to preserve insertion order at a modest memory and performance cost over HashSet. TreeSet is backed by a red-black tree (a self-balancing binary search tree), keeping elements in sorted order at all times, which costs O(log n) for add/remove/contains instead of HashSet's O(1) — you pay for ordering with logarithmic operations.`,
          bullets: [
            `HashSet: O(1) average add/remove/contains, no ordering guarantee — the default choice for pure uniqueness checks.`,
            `LinkedHashSet: O(1) like HashSet, but iterates in insertion order.`,
            `TreeSet: O(log n) operations, always iterates in sorted order (natural ordering or a supplied Comparator).`,
            `All Set implementations reject duplicates based on equals()/hashCode() (HashSet/LinkedHashSet) or compareTo() (TreeSet) — note TreeSet can treat two "equal by compareTo" but "unequal by equals" objects as duplicates.`,
          ],
        },
        {
          heading: `HashMap Internals: Buckets, Collisions, and Treeification`,
          body: `A HashMap stores entries in an array of buckets; a key's hashCode() is run through an internal hash-spreading function and reduced modulo the array length to pick a bucket index. Multiple keys landing in the same bucket (a collision) are historically stored as a linked list of entries within that bucket, giving O(1) average-case get()/put() but O(n) worst-case if many keys collide — since Java 8, a bucket that accumulates 8 or more colliding entries (with a table of at least 64 buckets) converts that bucket's list into a small red-black tree, bounding the worst case to O(log n) instead of O(n). The map automatically resizes (doubling the bucket array and rehashing every entry) once the number of entries exceeds capacity × loadFactor (default 0.75), an O(n) operation that happens rarely enough to keep put() amortized O(1).`,
          code: {
            language: `java`,
            code: `Map<String, Integer> wordCounts = new HashMap<>();
for (String word : words) {
    wordCounts.merge(word, 1, Integer::sum);   // increments count, or inserts 1 if absent
}
// get/put/containsKey are all O(1) average case`,
          },
        },
        {
          heading: `Map Ordering Variants: TreeMap and LinkedHashMap`,
          body: `TreeMap is HashMap's sorted counterpart — backed by a red-black tree, keeping keys in sorted order (natural or via a Comparator) at the cost of O(log n) instead of O(1) for get/put, and additionally offering navigation methods (firstKey(), floorKey(), ceilingEntry()) that a plain HashMap cannot provide. LinkedHashMap preserves insertion order (or, configured with accessOrder=true, least-recently-used order) with the same O(1) average performance as HashMap, and is the standard building block for implementing an LRU cache, since removeEldestEntry() can be overridden to automatically evict the oldest entry once a size threshold is crossed.`,
        },
        {
          heading: `Iteration, fail-fast Behavior, and ConcurrentModificationException`,
          body: `Java's standard collection iterators are fail-fast: they track a modCount on the underlying collection, and if the collection is structurally modified (elements added or removed, not merely have their values changed) by any means other than the iterator's own remove() method while iteration is in progress, the very next call to next() throws ConcurrentModificationException. This is a deliberate safety mechanism, not a bug — removing an element directly from a List inside a for-each loop over that same list is one of the most common runtime exceptions new Java developers encounter, and the fix is to use the Iterator's own remove() method, or collect items to remove into a separate list and remove them afterward, or use removeIf().`,
          code: {
            language: `java`,
            code: `List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5));

// WRONG -- throws ConcurrentModificationException
// for (int n : nums) { if (n % 2 == 0) nums.remove(Integer.valueOf(n)); }

// CORRECT -- Iterator's own remove()
Iterator<Integer> it = nums.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove();
}

// CORRECT and idiomatic -- removeIf()
nums.removeIf(n -> n % 2 == 0);`,
          },
        },
        {
          heading: `Comparable vs. Comparator for Custom Ordering`,
          body: `Comparable is implemented by the class itself (public class Employee implements Comparable<Employee>), defining that type's single "natural ordering" via compareTo(); it's used automatically by Collections.sort(), TreeSet, and TreeMap when no other ordering is specified. Comparator is a separate object that defines an ordering externally to the class (useful when you don't own the class's source, or need multiple different orderings), passed explicitly to sort() or a TreeSet/TreeMap constructor — modern Java's Comparator.comparing() and thenComparing() let you build multi-field comparators fluently without writing a full compareTo() method by hand.`,
          code: {
            language: `java`,
            code: `// Comparable: one natural ordering, defined inside the class
public class Employee implements Comparable<Employee> {
    public int compareTo(Employee other) {
        return Double.compare(this.salary, other.salary);
    }
}

// Comparator: external, supports multiple orderings, composable
employees.sort(Comparator.comparing(Employee::getLastName)
                          .thenComparing(Employee::getFirstName));`,
          },
        },
      ],
      commonPitfalls: [
        `Removing an element from a List/Set directly inside a for-each loop over it, triggering a ConcurrentModificationException — use Iterator.remove() or removeIf() instead.`,
        `Choosing LinkedList "because insertion should be O(1)" without accounting for its O(n) random access, when ArrayList is faster in most real workloads.`,
        `Assuming HashMap/HashSet iteration order is meaningful or stable — it is unspecified and can change between JVM versions or even between runs.`,
        `Using a mutable object as a HashMap key or HashSet element, then mutating it after insertion — this can make the entry permanently unfindable since its hash bucket no longer matches its current state.`,
        `Overriding equals() without hashCode() (or vice versa) on a class used as a HashMap key, silently breaking lookups.`,
        `Expecting TreeSet/TreeMap to use equals() for duplicate detection — they actually use compareTo()/Comparator, which can disagree with equals() if not implemented consistently.`,
        `Forgetting that HashMap's default load factor (0.75) triggers a full O(n) rehash on resize — pre-sizing a HashMap's initial capacity when the final size is roughly known avoids repeated rehashing.`,
      ],
      keyTakeaways: [
        `ArrayList: O(1) indexed access, O(n) insert/remove in the middle; LinkedList: the reverse — O(1) insert/remove at a known node, O(n) indexed access.`,
        `HashMap/HashSet: O(1) average case, no ordering guarantee; TreeMap/TreeSet: O(log n), always sorted; LinkedHashMap/LinkedHashSet: O(1), insertion order preserved.`,
        `HashMap resolves collisions with a linked list per bucket (treeified into a red-black tree past 8 collisions in one bucket since Java 8) and resizes at 75% load factor.`,
        `Never structurally modify a collection while iterating it with a for-each loop — use Iterator.remove() or removeIf() to avoid ConcurrentModificationException.`,
        `Comparable defines one natural ordering inside the class; Comparator defines external, composable, and multiple orderings.`,
        `LinkedHashMap with accessOrder=true and an overridden removeEldestEntry() is the standard way to implement an LRU cache in plain Java.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — The Collections Framework`, url: `https://docs.oracle.com/javase/tutorial/collections/index.html` },
        { label: `Oracle Java SE Docs — HashMap`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html` },
        { label: `GeeksforGeeks — Internal Working of HashMap in Java`, url: `https://www.geeksforgeeks.org/java/internal-working-of-hashmap-java/` },
      ],
    },
    {
      moduleTitle: `Java Intermediate`,
      subModuleTitle: `Generics`,
      overview: `Generics let classes, interfaces, and methods operate on types specified by the caller at compile time, eliminating the unsafe, error-prone casting that pre-Java-5 code required whenever a collection held Object references. This guide covers why generics exist (type safety plus elimination of casts), how to write your own generic classes and methods, bounded type parameters that restrict what a type argument can be, the wildcard system (? extends, ? super) and the PECS mnemonic that governs when to use each, and type erasure — the compiler mechanism that implements generics but also explains several of their more surprising limitations. Generics questions in interviews often center on wildcards, since ? extends and ? super are genuinely confusing without a clear mental model, and this guide gives you that model.`,
      sections: [
        {
          heading: `Why Generics Exist: Type Safety Without Casts`,
          body: `Before generics (pre-Java 5), a collection like ArrayList held Object references only, meaning every element retrieved required an explicit downcast, and a mismatched cast (adding a String to a list you intended for Integers) would compile fine and only fail with a ClassCastException at runtime, often far from the actual bug. Generics move that type check to compile time: List<String> can only ever hold Strings, the compiler rejects an attempt to add an Integer at the call site, and no cast is needed when reading elements back out — the compiler inserts the cast for you invisibly, guaranteed safe because it already verified the type.`,
        },
        {
          heading: `Writing a Generic Class`,
          body: `A generic class declares one or more type parameters in angle brackets after the class name (commonly single uppercase letters like T for "Type," E for "Element," K/V for "Key/Value") which then act as placeholder types usable anywhere inside the class body — fields, method parameters, return types. The type argument is supplied by the caller when instantiating the class (Box<String> box = new Box<>();), and from that point forward the compiler enforces that only Strings can go in or come out of that specific box instance.`,
          code: {
            language: `java`,
            code: `public class Box<T> {
    private T contents;

    public void set(T contents) { this.contents = contents; }
    public T get() { return contents; }
}

Box<String> stringBox = new Box<>();
stringBox.set("hello");
String value = stringBox.get();   // no cast needed -- compiler already knows it's a String
// stringBox.set(42);             // compile error -- caught before runtime`,
          },
        },
        {
          heading: `Generic Methods and Bounded Type Parameters`,
          body: `A single method can be generic even inside a non-generic class, by declaring its own type parameter before the return type (public static <T> T firstElement(List<T> list)). Bounded type parameters restrict what concrete types are legal arguments using extends (which, for generics, means "extends or implements") — <T extends Comparable<T>> restricts T to types that can be compared to themselves, which is exactly what's needed to write a generic max() function that calls compareTo() on the elements.`,
          code: {
            language: `java`,
            code: `public static <T extends Comparable<T>> T max(List<T> list) {
    T best = list.get(0);
    for (T item : list) {
        if (item.compareTo(best) > 0) best = item;
    }
    return best;
}
// works for List<Integer>, List<String>, or any Comparable type`,
          },
        },
        {
          heading: `Wildcards: ? extends and ? super`,
          body: `A wildcard represents an unknown type argument when you don't need to name it, used to write methods that accept a family of generic types rather than one exact instantiation. List<? extends Number> can refer to a List<Integer>, List<Double>, or List<Number> — you can safely read elements out as Number, but you cannot add anything to it (except null), because the compiler can't guarantee which specific subtype is actually backing the list at runtime. List<? super Integer> can refer to a List<Integer>, List<Number>, or List<Object> — you can safely add Integers into it, but reading elements out only guarantees an Object, since the actual list could be storing a wider type.`,
          bullets: [
            `? extends T ("upper bounded") — safe to READ as T, unsafe to WRITE (except null). Use for producers.`,
            `? super T ("lower bounded") — safe to WRITE T (or its subtypes), reads only guarantee Object. Use for consumers.`,
            `PECS mnemonic: "Producer Extends, Consumer Super" — if a parameter produces T values you'll read, use extends; if it consumes T values you'll write, use super.`,
            `A plain, unbounded List<?> supports neither adding (except null) nor any typed reading beyond Object.`,
          ],
        },
        {
          heading: `PECS in Practice: Copying Between Collections`,
          body: `The classic real-world PECS example is a copy method: the source list is a producer (you read T out of it, so it should be List<? extends T>) and the destination list is a consumer (you write T into it, so it should be List<? super T>). This lets the method correctly accept copy(List<Integer> source, List<Number> dest) as well as copy(List<Integer> source, List<Object> dest), which a naively-typed copy(List<T> source, List<T> dest) signature would incorrectly reject.`,
          code: {
            language: `java`,
            code: `public static <T> void copy(List<? extends T> source, List<? super T> dest) {
    for (T item : source) {
        dest.add(item);
    }
}
// works for copy(List<Integer>, List<Number>) and copy(List<Integer>, List<Object>)`,
          },
        },
        {
          heading: `Type Erasure and Its Consequences`,
          body: `The JVM has no concept of generics at runtime — the compiler "erases" all generic type information after compile-time checking, replacing type parameters with their bound (Object if unbounded) and inserting the necessary casts, so that a List<String> and a List<Integer> are, at the bytecode level, both simply List. This is why you cannot create an array of a generic type (new T[10] is illegal), cannot use instanceof with a parameterized type (obj instanceof List<String> is illegal — only obj instanceof List<?> compiles), and cannot overload two methods that would erase to the identical signature (void process(List<String> list) and void process(List<Integer> list) in the same class is a compile error, since both erase to process(List)).`,
        },
      ],
      commonPitfalls: [
        `Trying to call list.add(...) on a List<? extends T> reference and being confused by the compile error — extends wildcards are read-only by design.`,
        `Writing new T[10] inside a generic class and hitting a compile error, not realizing type erasure removes T entirely at runtime, so the JVM has no idea what array type to allocate.`,
        `Attempting obj instanceof List<String> and getting a compile error — only the unbounded obj instanceof List<?> is legal due to erasure.`,
        `Confusing which wildcard to use — forgetting PECS (Producer Extends, Consumer Super) and defaulting to plain T everywhere, then hitting unnecessary compile errors on valid call sites.`,
        `Assuming two overloaded methods differing only in generic type parameter (List<String> vs List<Integer>) are legal overloads — they erase to the same signature and won't compile.`,
        `Using a raw type (List instead of List<T>) to "avoid generics complexity," losing all compile-time type checking and reintroducing the ClassCastException risk generics were built to prevent.`,
      ],
      keyTakeaways: [
        `Generics move type-checking from runtime (ClassCastException) to compile time, eliminating manual casts in the process.`,
        `Bounded type parameters (<T extends Comparable<T>>) restrict which types a generic method or class accepts, enabling operations like compareTo() to be called safely.`,
        `PECS: use ? extends T for a producer you only read from, ? super T for a consumer you only write to.`,
        `Type erasure means generic type information disappears at runtime — no generic arrays, no instanceof with a parameterized type, no overloads that erase identically.`,
        `Never use raw types (List instead of List<T>) — doing so discards all of generics' compile-time safety.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Generics`, url: `https://docs.oracle.com/javase/tutorial/java/generics/index.html` },
        { label: `Oracle Java Tutorials — Wildcards`, url: `https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html` },
        { label: `Baeldung — Java Generics`, url: `https://www.baeldung.com/java-generics` },
      ],
    },
    {
      moduleTitle: `Java Intermediate`,
      subModuleTitle: `Multithreading basics`,
      overview: `Multithreading lets a Java program execute multiple sequences of instructions concurrently, sharing the same process memory — essential for responsive applications and for making full use of multi-core hardware, but also the source of some of the hardest bugs in software engineering, because concurrent code can behave differently (or incorrectly) depending on scheduling timing that's invisible in the source code. This guide covers the two ways to create a thread (extending Thread versus implementing Runnable, and why the latter is preferred), the thread lifecycle, the synchronized keyword and Java's intrinsic per-object lock, the wait/notify coordination mechanism, race conditions and why they happen, the volatile keyword's visibility guarantee, and a first look at the Executor framework as the modern alternative to managing raw Thread objects by hand.`,
      sections: [
        {
          heading: `Creating Threads: extends Thread vs. implements Runnable`,
          body: `A thread of execution can be created by extending Thread and overriding its run() method, or by implementing the Runnable functional interface and passing an instance to a Thread constructor. implements Runnable is preferred almost universally, because Java supports only single inheritance — extending Thread burns your one available superclass slot, whereas implementing Runnable leaves the class free to extend something else, and it also cleanly separates "the task to run" (Runnable) from "the mechanism that runs it" (Thread), which matters once you move to thread pools that don't use raw Thread objects directly at all.`,
          code: {
            language: `java`,
            code: `// Preferred: implements Runnable
Runnable task = () -> System.out.println("Running on: " + Thread.currentThread().getName());
Thread t = new Thread(task);
t.start();   // NOT t.run() -- calling run() directly executes on the current thread, no new thread created`,
          },
        },
        {
          heading: `The Thread Lifecycle`,
          body: `A Thread moves through a well-defined set of states, queryable via getState(): NEW (created but start() not yet called), RUNNABLE (executing or eligible to be scheduled by the OS — Java doesn't distinguish "running" from "ready to run" as separate states), BLOCKED (waiting to acquire a lock held by another thread), WAITING / TIMED_WAITING (paused indefinitely or for a bounded time via wait(), join(), or sleep()), and TERMINATED (run() has completed, permanently — a terminated thread can never be restarted; calling start() twice on the same Thread object throws IllegalStateException).`,
          bullets: [
            `NEW — created, start() not yet called.`,
            `RUNNABLE — executing or eligible for CPU scheduling.`,
            `BLOCKED — waiting to acquire an object's intrinsic lock.`,
            `WAITING / TIMED_WAITING — paused via wait(), join(), or sleep(), until notified or the timeout elapses.`,
            `TERMINATED — run() has finished; permanent, cannot be restarted.`,
          ],
        },
        {
          heading: `Race Conditions: Why Shared Mutable State Is Dangerous`,
          body: `A race condition occurs when two or more threads access shared mutable state concurrently, and the outcome depends on the unpredictable timing of their execution — the classic example is count++ on a shared field, which looks atomic but is actually three separate steps (read, increment, write) that can interleave between threads, silently losing updates. With two threads each incrementing a shared counter one million times, the final value is almost never two million without synchronization, because both threads can read the same stale value before either writes back its incremented result.`,
          code: {
            language: `java`,
            code: `class Counter {
    private int count = 0;
    public void increment() { count++; }   // NOT atomic: read, add 1, write -- 3 steps
    public int get() { return count; }
}
// Two threads calling increment() 1,000,000 times each often finish
// with a total LESS than 2,000,000 due to lost updates`,
          },
        },
        {
          heading: `synchronized: Java's Intrinsic Lock`,
          body: `The synchronized keyword ensures only one thread at a time can execute a given block of code guarded by the same lock object — every Java object has an intrinsic lock (monitor) built in, and synchronized acquires that lock on entry and releases it on exit (even if an exception is thrown), making the guarded section atomic with respect to other threads trying to enter a section synchronized on the same object. A synchronized instance method locks on this; a synchronized static method locks on the class object (ClassName.class) — these are different locks, so a synchronized static method and a synchronized instance method never block each other.`,
          code: {
            language: `java`,
            code: `class Counter {
    private int count = 0;
    public synchronized void increment() {   // acquires 'this' lock before running
        count++;
    }
    public synchronized int get() {
        return count;
    }
}
// Now two threads calling increment() 1,000,000 times each reliably total 2,000,000`,
          },
        },
        {
          heading: `wait(), notify(), and notifyAll()`,
          body: `wait(), notify(), and notifyAll() are methods on Object (not Thread) used for thread coordination and must be called from within a synchronized block holding the same lock the thread will wait/notify on, or an IllegalMonitorStateException is thrown. wait() releases the lock and suspends the calling thread until another thread calls notify() (wakes one arbitrary waiting thread) or notifyAll() (wakes all waiting threads) on the same object; the classic producer-consumer pattern uses this to make a consumer thread wait when a shared queue is empty and a producer thread notify it once an item is added. Because a woken thread doesn't necessarily get to run immediately, wait() should always be called inside a while loop re-checking the condition, not a single if — a pattern known as guarding against "spurious wakeups."`,
        },
        {
          heading: `volatile: A Visibility, Not Atomicity, Guarantee`,
          body: `The volatile keyword guarantees that reads and writes to a field go directly to main memory rather than being cached in a CPU register or a per-thread cache, so every thread always sees the most recently written value — this solves visibility problems (a flag set by one thread not being seen by another) but does NOT make compound operations like count++ atomic, since volatile provides no mutual exclusion at all. volatile is the right tool for a simple flag one thread sets and others poll (e.g. a shutdown signal), but the wrong tool for anything involving a read-modify-write sequence, which still needs synchronized or an Atomic class.`,
        },
        {
          heading: `A First Look at the Executor Framework`,
          body: `Manually creating and managing raw Thread objects doesn't scale — threads are expensive to create, and an application that spins up a new Thread per task can exhaust system resources under load. The Executor framework (java.util.concurrent) decouples task submission from thread management: ExecutorService manages a reusable pool of worker threads, and submit(Runnable) or submit(Callable) hands it a task to run on whichever pooled thread becomes available, amortizing thread-creation cost across many tasks. This is covered in full depth in the Advanced Concurrency submodule, but it's worth knowing from the start that production Java code almost never creates raw Thread objects directly — it goes through an ExecutorService.`,
          code: {
            language: `java`,
            code: `ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> System.out.println("Task running on a pooled thread"));
pool.shutdown();   // stop accepting new tasks, let submitted ones finish`,
          },
        },
      ],
      commonPitfalls: [
        `Calling thread.run() directly instead of thread.start() — this executes the code synchronously on the current thread, never actually starting a new thread.`,
        `Treating count++ as atomic and skipping synchronization, silently losing updates under concurrent access (a classic race condition).`,
        `Calling wait()/notify() outside a synchronized block on the same lock object, throwing IllegalMonitorStateException.`,
        `Using volatile to try to make a read-modify-write operation (like an increment) thread-safe — it only guarantees visibility, not atomicity.`,
        `Checking a wait() condition with if instead of a while loop, missing the possibility of a spurious wakeup where the condition isn't actually true yet.`,
        `Synchronizing on different lock objects (e.g. one method locks on this, another on a private field) when both are meant to protect the same shared state, providing no real mutual exclusion.`,
        `Creating a new raw Thread per task in a hot path instead of using a pooled ExecutorService, exhausting system resources under load.`,
      ],
      keyTakeaways: [
        `Prefer implements Runnable over extends Thread — it avoids burning Java's single-inheritance slot and separates the task from the execution mechanism.`,
        `A race condition arises when unsynchronized threads read/modify/write shared state — even a simple count++ is not atomic.`,
        `synchronized provides both mutual exclusion (only one thread in the block at a time) and visibility (changes are flushed to main memory on unlock).`,
        `volatile guarantees visibility only, never atomicity — it cannot replace synchronized for compound operations.`,
        `wait()/notify()/notifyAll() require holding the object's lock and should always re-check their condition in a while loop, not an if.`,
        `Production code manages threads through an ExecutorService thread pool rather than creating raw Thread objects directly.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Concurrency`, url: `https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html` },
        { label: `Oracle Java Tutorials — Guarded Blocks (wait/notify)`, url: `https://docs.oracle.com/javase/tutorial/essential/concurrency/guardmeth.html` },
        { label: `Baeldung — Guide to the volatile Keyword`, url: `https://www.baeldung.com/java-volatile` },
      ],
    },
    {
      moduleTitle: `Java Intermediate`,
      subModuleTitle: `File I/O`,
      overview: `Reading and writing files is a practical, everyday skill tested in both coding rounds (parsing input files) and system-design discussions (log files, config loading), and Java offers two overlapping APIs for it: the original java.io streams-and-readers model, and the more modern, more convenient java.nio.file package introduced in Java 7. This guide covers both — FileReader/BufferedReader for text input, FileWriter/BufferedWriter for text output, the try-with-resources pattern that makes file handling exception-safe, the modern Path/Files utility class that replaces most manual stream plumbing with one-line calls, basic object serialization via the Serializable interface, and the IOException hierarchy you must handle correctly. Interviewers commonly ask candidates to read a file line by line and process it — knowing the idiomatic, resource-safe way to do this is a baseline expectation.`,
      sections: [
        {
          heading: `Reading Text Files: FileReader and BufferedReader`,
          body: `FileReader reads a file character by character, which is technically correct but extremely slow for anything beyond a trivial file because each read may involve a system call; BufferedReader wraps any Reader and adds an internal buffer, batching reads into larger chunks and adding the crucial readLine() method that FileReader alone doesn't provide. The idiomatic pattern wraps a FileReader in a BufferedReader and reads line by line in a while loop, checking for null (readLine() returns null at end-of-file, not an exception) as the loop's termination condition.`,
          code: {
            language: `java`,
            code: `try (BufferedReader reader = new BufferedReader(new FileReader("input.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.err.println("Failed to read file: " + e.getMessage());
}`,
          },
        },
        {
          heading: `Writing Text Files: FileWriter and BufferedWriter`,
          body: `Writing mirrors reading: FileWriter writes characters directly to a file (recreating it by default, or appending if constructed with the append=true flag), and BufferedWriter wraps it to batch writes for performance. Unlike println(), BufferedWriter's newLine() method writes the platform-specific line separator (\\r\\n on Windows, \\n on Unix) rather than hardcoding one, which matters for files meant to be read correctly across operating systems.`,
          code: {
            language: `java`,
            code: `try (BufferedWriter writer = new BufferedWriter(new FileWriter("output.txt", true))) {
    // true = append mode, don't overwrite existing content
    writer.write("New log entry");
    writer.newLine();   // platform-correct line separator
} catch (IOException e) {
    System.err.println("Failed to write file: " + e.getMessage());
}`,
          },
        },
        {
          heading: `try-with-resources Is Mandatory, Not Optional, for File I/O`,
          body: `Every file-handling example above uses try-with-resources, and this is not stylistic preference — file handles are a genuinely limited operating-system resource, and a program that opens files without reliably closing them will eventually exhaust the OS's file descriptor limit and start failing to open new files, a bug that's notoriously hard to diagnose because it only manifests after many operations have already succeeded. try-with-resources guarantees close() is called even when readLine() or write() throws partway through, which a naive try/catch without finally-based closing does not.`,
        },
        {
          heading: `The Modern Approach: java.nio.file.Path and Files`,
          body: `Since Java 7, the java.nio.file package offers a higher-level, more convenient API: Path represents a file-system location (replacing the older, less capable java.io.File), and the Files utility class provides static methods for nearly every common file operation in a single call — reading an entire small file into a String or a List<String> of lines, writing a String to a file, checking existence, copying, deleting, and walking directory trees — without manually managing a Reader/Writer at all for simple cases.`,
          code: {
            language: `java`,
            code: `Path path = Path.of("input.txt");

List<String> lines = Files.readAllLines(path);          // whole file, one call
String content = Files.readString(path);                 // Java 11+, whole file as a String

Files.writeString(Path.of("output.txt"), "Hello, file!"); // Java 11+, one call to write

boolean exists = Files.exists(path);
Files.copy(path, Path.of("backup.txt"));`,
          },
        },
        {
          heading: `Streaming Large Files Without Loading Everything Into Memory`,
          body: `Files.readAllLines() and Files.readString() load the entire file into memory at once, which is fine for small config or input files but dangerous for large files (multi-gigabyte logs) where it can exhaust heap memory. For large files, Files.lines(path) returns a lazily-evaluated Stream<String> that reads and processes one line at a time without materializing the whole file in memory — but critically, that stream must be closed (via try-with-resources) because, unlike most Stream sources, it holds an open file handle underneath.`,
          code: {
            language: `java`,
            code: `try (Stream<String> lines = Files.lines(Path.of("huge-log.txt"))) {
    long errorCount = lines.filter(line -> line.contains("ERROR")).count();
    System.out.println("Errors: " + errorCount);
} catch (IOException e) {
    System.err.println("Failed to process file: " + e.getMessage());
}`,
          },
        },
        {
          heading: `Basic Object Serialization`,
          body: `A class that implements the marker interface Serializable (no methods to implement — it simply signals intent to the JVM) can have its entire object graph written to a byte stream via ObjectOutputStream.writeObject() and reconstructed later via ObjectInputStream.readObject(), commonly used for simple persistence or caching. Every non-transient field must itself be Serializable (or primitive) or serialization throws at runtime; marking a field transient excludes it deliberately (common for passwords, caches, or non-serializable fields like a Thread or a database Connection). A serialVersionUID field should be declared explicitly on every Serializable class — without it, the JVM auto-generates one from the class's structure, and any later change to the class can silently break deserialization of previously-saved objects with an InvalidClassException.`,
        },
        {
          heading: `The IOException Hierarchy and Handling It Correctly`,
          body: `IOException is a checked exception, and its common subclasses carry more specific meaning worth catching separately when the handling differs: FileNotFoundException (the file doesn't exist, or can't be opened for the requested access), EOFException (unexpected end of stream during a structured read, distinct from readLine()'s null-return convention), and UncheckedIOException (a wrapper used inside Stream pipelines, like Files.lines(), where checked exceptions can't cross a functional interface's throws-free method signature). Since FileNotFoundException extends IOException, it must be caught before a broader catch (IOException e) block, or the compiler flags the more specific catch as unreachable.`,
        },
      ],
      commonPitfalls: [
        `Opening a FileReader/FileWriter without try-with-resources, leaking file handles that eventually exhaust the OS's file descriptor limit.`,
        `Using Files.readAllLines() or readString() on a very large file, loading the entire contents into memory and risking an OutOfMemoryError — use Files.lines() (streamed) instead.`,
        `Forgetting Files.lines() returns a Stream that itself holds an open file handle and must be closed with try-with-resources, unlike most other Stream sources.`,
        `Checking readLine()'s return for an exception instead of null — end-of-file is signaled by a null return, not an exception.`,
        `Catching IOException before the more specific FileNotFoundException in the same try block, which the compiler rejects as unreachable code.`,
        `Marking a field holding a non-serializable resource (a Thread, a database Connection, a Socket) as part of a Serializable class without declaring it transient, causing serialization to throw at runtime.`,
        `Omitting an explicit serialVersionUID, letting the JVM auto-generate one that changes whenever the class's structure changes, silently breaking deserialization of old saved data.`,
      ],
      keyTakeaways: [
        `Always wrap file streams in try-with-resources — file handles are a limited OS resource and must be reliably closed even when an exception occurs.`,
        `BufferedReader/BufferedWriter add line-based methods and batch I/O for performance over raw FileReader/FileWriter.`,
        `The modern java.nio.file.Files utility class replaces most manual stream plumbing with single-call methods (readAllLines, readString, writeString, copy).`,
        `Use Files.lines() (streamed, lazy) instead of Files.readAllLines() (loads everything) for large files, and remember it needs to be closed too.`,
        `Serializable is a marker interface; every non-transient field must also be Serializable, and an explicit serialVersionUID guards against silent deserialization breakage.`,
        `readLine() signals end-of-file with a null return, not an exception — check for null, don't wrap it in a try/catch expecting an error.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Basic I/O`, url: `https://docs.oracle.com/javase/tutorial/essential/io/index.html` },
        { label: `Oracle Java SE Docs — java.nio.file.Files`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/file/Files.html` },
        { label: `Baeldung — Reading a File in Java`, url: `https://www.baeldung.com/reading-file-in-java` },
      ],
    },
    {
      moduleTitle: `Java Intermediate`,
      subModuleTitle: `JDBC basics`,
      overview: `JDBC (Java Database Connectivity) is the standard API Java uses to connect to and interact with relational databases, and understanding its core objects — Driver, Connection, Statement/PreparedStatement, and ResultSet — is essential both for interviews and for any real backend work, since even ORM frameworks like Hibernate or Spring Data ultimately compile down to JDBC calls underneath. This guide covers how a JDBC connection is established, why PreparedStatement must be used instead of Statement for any query involving user input (SQL injection prevention, not just convenience), how to iterate a ResultSet correctly, resource management for connections and statements via try-with-resources, and the fundamentals of manual transaction control with commit/rollback. This is foundational knowledge for the capstone application later in the course, which will very likely need to persist data to a real database.`,
      sections: [
        {
          heading: `JDBC Architecture: Driver, Connection, Statement, ResultSet`,
          body: `A JDBC Driver is a database-specific implementation (loaded automatically via Java's ServiceLoader mechanism since JDBC 4.0) that translates the standard JDBC API calls into that specific database's wire protocol — this is what lets application code stay nearly identical whether it's talking to PostgreSQL, MySQL, or Oracle, with only the connection URL and driver dependency changing. A Connection represents a single session with the database; a Statement (or its safer subtype, PreparedStatement) represents a SQL command sent over that connection; a ResultSet represents the tabular data returned by a query, which must be read while the connection remains open.`,
        },
        {
          heading: `Establishing a Connection`,
          body: `DriverManager.getConnection(url, username, password) opens a Connection given a JDBC URL that encodes the database type, host, port, and database name (e.g. jdbc:postgresql://localhost:5432/mydb) — the driver is picked automatically based on the URL's prefix, as long as the corresponding driver JAR is on the classpath. Connections are relatively expensive to establish (network handshake, authentication) so production applications virtually never call DriverManager.getConnection() per request — they draw connections from a pool (covered below), but the underlying API is identical either way.`,
          code: {
            language: `java`,
            code: `String url = "jdbc:postgresql://localhost:5432/company_db";
try (Connection conn = DriverManager.getConnection(url, "app_user", "secret")) {
    // use the connection
} catch (SQLException e) {
    System.err.println("Connection failed: " + e.getMessage());
}`,
          },
        },
        {
          heading: `PreparedStatement vs. Statement: SQL Injection Prevention`,
          body: `Statement executes a raw SQL string as-is, which means building a query by concatenating user input directly into the SQL text ("SELECT * FROM users WHERE name = '" + userInput + "'") lets an attacker supply input like ' OR '1'='1 to alter the query's logic entirely — this is SQL injection, one of the most common and most damaging web application vulnerabilities. PreparedStatement pre-compiles the SQL with ? placeholders for parameters, and values are bound separately via typed setter methods (setString, setInt); the database driver ensures bound values are always treated as literal data, never as executable SQL syntax, which eliminates injection for parameterized values entirely. PreparedStatement also improves performance for repeated queries, since the database can cache the compiled query plan.`,
          code: {
            language: `java`,
            code: `// VULNERABLE -- never do this with user input
String bad = "SELECT * FROM users WHERE email = '" + userInput + "'";

// SAFE -- parameters are bound, never interpreted as SQL
String sql = "SELECT id, name, email FROM users WHERE email = ?";
try (PreparedStatement stmt = conn.prepareStatement(sql)) {
    stmt.setString(1, userInput);   // 1-indexed, not 0-indexed
    try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getInt("id") + ": " + rs.getString("name"));
        }
    }
}`,
          },
        },
        {
          heading: `Iterating a ResultSet Correctly`,
          body: `ResultSet.next() advances the cursor to the next row and returns false once there are no more rows, so the standard iteration pattern is a while (rs.next()) loop — calling a getter (getString, getInt) before the first next() call, or after next() has returned false, throws a SQLException because the cursor isn't positioned on a valid row. Columns can be retrieved by 1-indexed position (rs.getString(1)) or by column name (rs.getString("email")); using column names is generally preferred for readability and resilience to a query's column order changing, at a very small performance cost from the name-to-index lookup.`,
        },
        {
          heading: `Resource Management: try-with-resources for JDBC`,
          body: `Connection, Statement/PreparedStatement, and ResultSet all implement AutoCloseable, and all three should be wrapped in try-with-resources (nested, since a PreparedStatement is created from a Connection and a ResultSet from a Statement) to guarantee they're released even when an exception occurs mid-query — leaked database connections are a classic production incident, since connection pools have a finite size and a leak eventually exhausts it, causing every subsequent request to hang waiting for a connection that never becomes available.`,
        },
        {
          heading: `Transactions: commit, rollback, and autocommit`,
          body: `By default, a JDBC Connection runs in autocommit mode, where every individual statement is committed to the database immediately as its own transaction — fine for single, independent statements, but wrong whenever multiple statements must succeed or fail together as one atomic unit (like transferring money: debit one account, credit another). Calling conn.setAutoCommit(false) starts manual transaction control: subsequent statements are staged but not permanent until conn.commit() is called explicitly, and if any statement fails partway through, conn.rollback() undoes every staged change back to the transaction's start, preventing a half-completed operation from corrupting data.`,
          code: {
            language: `java`,
            code: `try (Connection conn = DriverManager.getConnection(url, user, pass)) {
    conn.setAutoCommit(false);
    try {
        debit(conn, fromAccountId, amount);
        credit(conn, toAccountId, amount);
        conn.commit();          // both succeed -- make permanent
    } catch (SQLException e) {
        conn.rollback();        // either failed -- undo both
        throw e;
    }
}`,
          },
        },
        {
          heading: `Connection Pooling: Why Raw DriverManager Isn't Used in Production`,
          body: `Opening a fresh physical connection per request is expensive (TCP handshake, authentication, session setup) and doesn't scale, so production applications use a connection pool (HikariCP is the modern default, especially in Spring Boot) that maintains a set of already-open connections and hands them out on request, returning them to the pool (not actually closing the physical connection) when the application code calls close(). This means the application code's usage pattern — open with try-with-resources, use, close — stays identical whether connections come from DriverManager directly or from a pool; only the configuration changes, which is one of the reasons JDBC's basic API is worth learning even though production code rarely calls DriverManager.getConnection() directly.`,
        },
      ],
      commonPitfalls: [
        `Building SQL by string concatenation with user input instead of using PreparedStatement with bound parameters, opening the application to SQL injection.`,
        `Forgetting PreparedStatement parameters are 1-indexed, not 0-indexed, causing an off-by-one binding error.`,
        `Calling a ResultSet getter before the first rs.next() (or after it returns false), throwing a SQLException for an invalid cursor position.`,
        `Not wrapping Connection/Statement/ResultSet in try-with-resources, leaking connections that eventually exhaust a connection pool under load.`,
        `Leaving autocommit on for a multi-statement operation that must be atomic, risking a half-completed update if a later statement fails.`,
        `Forgetting to call conn.rollback() in the catch block of a manual transaction, leaving a failed transaction's partial changes staged indefinitely.`,
        `Calling DriverManager.getConnection() directly in production request-handling code instead of drawing from a connection pool, incurring a full connection setup cost on every request.`,
      ],
      keyTakeaways: [
        `Always use PreparedStatement with bound parameters for any query involving external input — string-concatenated SQL is a direct SQL injection vulnerability.`,
        `ResultSet.next() must be called before reading any column, and iteration is a standard while (rs.next()) loop.`,
        `Connection, Statement, and ResultSet are all AutoCloseable — wrap them in (nested) try-with-resources to avoid leaking database resources.`,
        `Disable autocommit and use explicit commit()/rollback() whenever multiple statements must succeed or fail together as one atomic transaction.`,
        `Production applications draw connections from a pool (e.g. HikariCP) rather than opening a fresh DriverManager connection per request, but the application-level JDBC API usage is identical either way.`,
      ],
      links: [
        { label: `Oracle JDBC Basics Tutorial`, url: `https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html` },
        { label: `Oracle Java SE Docs — PreparedStatement`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html` },
        { label: `OWASP — SQL Injection Prevention Cheat Sheet`, url: `https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html` },
      ],
    },
    {
      moduleTitle: `Java Advanced`,
      subModuleTitle: `Design patterns`,
      overview: `Design patterns are named, reusable solutions to recurring object-oriented design problems, and knowing them gives you a shared vocabulary with interviewers and teammates — saying "I'd use a Strategy here" communicates an entire structural approach in three words. This guide covers five of the patterns most frequently asked about and most genuinely useful in real Java codebases: Singleton (exactly one instance, with a careful look at thread-safe implementations), Factory (centralizing object creation logic), Builder (constructing complex objects step by step, avoiding telescoping constructors), Observer (one-to-many event notification), and Strategy (swapping an algorithm's implementation at runtime). Each is shown with working Java code and, just as importantly, a candid discussion of when NOT to reach for it — interviewers increasingly value candidates who recognize when a pattern would be over-engineering for the problem at hand.`,
      sections: [
        {
          heading: `Singleton: Exactly One Instance`,
          body: `Singleton guarantees a class has exactly one instance for the lifetime of the application and provides a single global access point to it — commonly used for configuration objects, logging, or a connection pool manager. The classic implementation problem is thread safety: a naive lazy-initialization check (if (instance == null) instance = new Singleton();) can race, with two threads both seeing null and both creating an instance. The enum-based singleton is widely considered the cleanest, most robust approach in Java, since the JVM guarantees enum instance creation is inherently thread-safe and serialization-safe with zero extra code.`,
          code: {
            language: `java`,
            code: `// Enum singleton -- thread-safe, serialization-safe, by construction
public enum ConfigManager {
    INSTANCE;

    private final Map<String, String> settings = new HashMap<>();

    public String get(String key) { return settings.get(key); }
}
// Usage: ConfigManager.INSTANCE.get("db.url")

// Double-checked locking, the classic alternative when a class (not enum) is required
public class LazySingleton {
    private static volatile LazySingleton instance;   // volatile is essential here

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {          // check again inside the lock
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}`,
          },
        },
        {
          heading: `Factory: Centralizing Object Creation`,
          body: `The Factory pattern moves the logic for deciding which concrete class to instantiate into a dedicated method or class, so calling code depends only on an interface or abstract type and never directly names a concrete implementation with new. This decouples client code from concrete classes — adding a new subtype later means changing only the factory, not every call site that creates one — and is especially valuable when construction requires conditional logic based on input (e.g. choosing a PaymentProcessor implementation based on a payment method string).`,
          code: {
            language: `java`,
            code: `interface Notification { void send(String message); }
class EmailNotification implements Notification { public void send(String m) { /* ... */ } }
class SmsNotification implements Notification { public void send(String m) { /* ... */ } }

class NotificationFactory {
    public static Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SmsNotification();
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}
// Caller never names EmailNotification or SmsNotification directly
Notification n = NotificationFactory.create("email");`,
          },
        },
        {
          heading: `Builder: Avoiding Telescoping Constructors`,
          body: `When a class has many optional fields, providing every combination as an overloaded constructor ("telescoping constructors") becomes unreadable and error-prone — callers can't tell which positional argument means what, and adding one more optional field multiplies the overload count. The Builder pattern instead uses a separate builder object with fluent, named setter-style methods returning this, culminating in a build() call that validates and constructs the final immutable object — Java's own StringBuilder and the widely-used Lombok @Builder annotation both embody this exact pattern.`,
          code: {
            language: `java`,
            code: `public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;

    private HttpRequest(Builder b) {
        this.url = b.url; this.method = b.method; this.headers = b.headers;
    }

    public static class Builder {
        private String url;
        private String method = "GET";
        private Map<String, String> headers = new HashMap<>();

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}

HttpRequest req = new HttpRequest.Builder()
    .url("https://api.example.com")
    .method("POST")
    .header("Content-Type", "application/json")
    .build();`,
          },
        },
        {
          heading: `Observer: One-to-Many Event Notification`,
          body: `The Observer pattern lets a "subject" object maintain a list of dependent "observer" objects and automatically notify all of them whenever its state changes, without the subject needing to know anything concrete about what each observer does with that notification — this is the foundation of GUI event listeners, pub/sub messaging systems, and reactive programming frameworks. The subject exposes subscribe()/unsubscribe() methods and an internal notify mechanism; observers implement a common interface (often just a single update() method or, in modern Java, a functional interface like Consumer<T>) so the subject can iterate and call each one without a type-specific switch.`,
          code: {
            language: `java`,
            code: `interface OrderObserver { void onOrderPlaced(Order order); }

class OrderService {
    private final List<OrderObserver> observers = new ArrayList<>();

    public void subscribe(OrderObserver o) { observers.add(o); }

    public void placeOrder(Order order) {
        // ... persist order ...
        for (OrderObserver o : observers) o.onOrderPlaced(order);  // notify all
    }
}
// Independent observers: email confirmation, inventory update, analytics -- all decoupled`,
          },
        },
        {
          heading: `Strategy: Swapping Algorithms at Runtime`,
          body: `The Strategy pattern extracts an algorithm's variation into an interface, letting the concrete implementation be selected and swapped at runtime rather than hard-coded with a chain of if/else or switch statements scattered throughout the codebase. A common real-world example is a checkout system supporting multiple discount strategies (percentage off, flat amount off, buy-one-get-one) — each implements a shared DiscountStrategy interface, and the checkout code calls strategy.apply(cart) without caring which concrete strategy is currently plugged in. In modern Java, when a strategy is a single method, a lambda expression passed as a functional interface often replaces a full class hierarchy entirely.`,
          code: {
            language: `java`,
            code: `interface DiscountStrategy { double apply(double total); }

// Modern Java: lambdas as strategies, no separate classes needed
DiscountStrategy tenPercentOff = total -> total * 0.9;
DiscountStrategy flatFiveOff = total -> Math.max(0, total - 5.0);

double finalPrice = tenPercentOff.apply(cartTotal);   // strategy selected at runtime`,
          },
        },
        {
          heading: `Knowing When NOT to Use a Pattern`,
          body: `Every one of these patterns adds a layer of indirection, which is a real cost in complexity and readability if the flexibility it buys is never actually needed — a Factory for a class with exactly one concrete implementation, or a Strategy interface with only one strategy ever written, is pure ceremony with no benefit. Interviewers increasingly probe for this judgment directly ("would you use a design pattern here?") because over-application of patterns ("pattern fever") is a real, common mistake among developers who've just learned them; the right answer is usually "not yet — introduce the abstraction when a second variant actually shows up, not preemptively."`,
        },
      ],
      commonPitfalls: [
        `Implementing a lazy Singleton without synchronization (or without volatile in double-checked locking), allowing two threads to race and create two separate instances.`,
        `Reaching for a Factory, Strategy, or Builder for a class with no real variation or optional-field complexity, adding indirection with no actual benefit ("pattern fever").`,
        `Forgetting volatile on a double-checked-locking Singleton's instance field, which can expose a partially-constructed object to another thread due to instruction reordering.`,
        `Building a class with 6+ constructor parameters instead of switching to a Builder once telescoping constructors become unreadable.`,
        `Letting an Observer's notify loop throw an unhandled exception from one observer, silently preventing every subsequent observer in the list from being notified.`,
        `Confusing Strategy (swap an algorithm) with Factory (choose which object to construct) — they solve different problems and are often mistakenly used interchangeably in interview answers.`,
      ],
      keyTakeaways: [
        `Enum-based Singleton is the simplest thread-safe and serialization-safe way to guarantee exactly one instance in Java.`,
        `Factory centralizes "which concrete class to instantiate" logic so client code depends only on an interface.`,
        `Builder replaces telescoping constructors with fluent, named, step-by-step construction for classes with many optional fields.`,
        `Observer lets a subject notify many decoupled listeners of a state change without knowing what each one does with it.`,
        `Strategy extracts a swappable algorithm behind an interface — in modern Java, a single-method strategy is often just a lambda.`,
        `Every pattern adds indirection — apply it when real variation exists or is clearly imminent, not preemptively.`,
      ],
      links: [
        { label: `Refactoring Guru — Design Patterns`, url: `https://refactoring.guru/design-patterns` },
        { label: `Baeldung — Singleton in Java`, url: `https://www.baeldung.com/java-singleton` },
        { label: `Baeldung — Builder Pattern in Java`, url: `https://www.baeldung.com/creational-design-patterns#builder` },
      ],
    },
    {
      moduleTitle: `Java Advanced`,
      subModuleTitle: `Streams & lambdas`,
      overview: `Lambdas and the Stream API, both introduced in Java 8, brought functional-style programming to Java, letting collection processing be expressed as a declarative pipeline of transformations rather than imperative loops with manual accumulator variables. This guide covers functional interfaces and lambda syntax, how a Stream pipeline is structured (source, intermediate operations, terminal operation), the core operations map/filter/reduce, the Collectors utility class for gathering stream results back into collections or summary values, method references as a shorthand for simple lambdas, Optional as a null-safety wrapper, and the crucial fact that streams are lazily evaluated — intermediate operations do nothing until a terminal operation triggers the entire pipeline. This is one of the most heavily used features in modern, idiomatic Java code and comes up constantly in both interviews and the capstone project.`,
      sections: [
        {
          heading: `Functional Interfaces and Lambda Syntax`,
          body: `A functional interface is any interface with exactly one abstract method (it may have any number of default or static methods), and Java allows a lambda expression to be used anywhere a functional interface is expected, treating the lambda's parameter list and body as an inline implementation of that single method. java.util.function provides the common general-purpose functional interfaces so you rarely need to declare your own: Function<T,R> (takes a T, returns an R), Predicate<T> (takes a T, returns boolean), Consumer<T> (takes a T, returns nothing), and Supplier<T> (takes nothing, returns a T).`,
          code: {
            language: `java`,
            code: `Function<Integer, Integer> square = x -> x * x;
Predicate<String> isBlank = s -> s == null || s.trim().isEmpty();
Consumer<String> printer = s -> System.out.println(s);
Supplier<List<String>> newList = ArrayList::new;

System.out.println(square.apply(5));        // 25
System.out.println(isBlank.test("  "));     // true`,
          },
        },
        {
          heading: `Anatomy of a Stream Pipeline`,
          body: `A Stream pipeline has three parts: a source (a collection's .stream() method, Arrays.stream(), Stream.of(), or a generator), zero or more intermediate operations (map, filter, sorted, distinct — each returns a new Stream, enabling chaining), and exactly one terminal operation (collect, forEach, reduce, count — which actually triggers execution and produces a result or side effect). Streams are single-use: once a terminal operation runs, that Stream object is consumed and calling any method on it again throws IllegalStateException — a new pipeline must be built from the source again if you need to process it a second time.`,
          code: {
            language: `java`,
            code: `List<String> names = List.of("Alice", "bob", "Charlie", "dave");

List<String> result = names.stream()
    .filter(name -> name.length() > 3)     // intermediate
    .map(String::toUpperCase)              // intermediate
    .sorted()                               // intermediate
    .collect(Collectors.toList());          // terminal -- triggers execution

// result: [ALICE, CHARLIE, DAVE]`,
          },
        },
        {
          heading: `map, filter, and reduce`,
          body: `map() transforms each element into a different value (1-to-1), producing a stream of the same length but potentially a different type. filter() keeps only elements matching a Predicate, producing a stream of the same type but potentially fewer elements. reduce() combines all elements into a single accumulated result using a BinaryOperator — the three-argument overload additionally takes an identity value as the starting point, which also makes it safe on an empty stream (returning the identity itself rather than throwing).`,
          code: {
            language: `java`,
            code: `List<Integer> nums = List.of(1, 2, 3, 4, 5);

int sumOfSquaresOfEvens = nums.stream()
    .filter(n -> n % 2 == 0)      // keep 2, 4
    .map(n -> n * n)               // 4, 16
    .reduce(0, Integer::sum);      // 0 + 4 + 16 = 20`,
          },
        },
        {
          heading: `Collectors: Gathering Results`,
          body: `The Collectors utility class provides ready-made terminal collection strategies for the collect() operation, covering the vast majority of what you'd otherwise write manually with a loop and an accumulator. Collectors.groupingBy() is especially powerful and frequently tested — it partitions a stream into a Map keyed by a classifier function, optionally combined with a downstream collector to aggregate each group (count, sum, or a nested list).`,
          bullets: [
            `Collectors.toList() / toSet() — collect into a List or Set.`,
            `Collectors.joining(", ") — concatenate a Stream<String> into one delimited String.`,
            `Collectors.groupingBy(classifier) — partition into a Map<K, List<T>> keyed by the classifier's result.`,
            `Collectors.groupingBy(classifier, Collectors.counting()) — group and count members per group in one pass.`,
            `Collectors.toMap(keyFn, valueFn) — build a Map directly from stream elements.`,
          ],
          code: {
            language: `java`,
            code: `Map<String, List<Employee>> byDepartment = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));

Map<String, Long> countByDepartment = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));`,
          },
        },
        {
          heading: `Method References`,
          body: `A method reference is shorthand syntax for a lambda that does nothing but call one existing method, using :: instead of writing an explicit parameter list and arrow — it's purely syntactic sugar, but it's the idiomatic style and improves readability once you recognize the pattern. There are four forms: a static method (Integer::parseInt), an instance method on a particular object (someList::add), an instance method on an arbitrary object of a particular type determined by the stream's element (String::toUpperCase, where the element itself becomes the receiver), and a constructor reference (ArrayList::new).`,
          code: {
            language: `java`,
            code: `names.stream().map(String::toUpperCase);        // instead of s -> s.toUpperCase()
strings.stream().map(Integer::parseInt);          // instead of s -> Integer.parseInt(s)
names.forEach(System.out::println);               // instead of s -> System.out.println(s)
Supplier<List<String>> factory = ArrayList::new;   // constructor reference`,
          },
        },
        {
          heading: `Optional: Explicit Absence Instead of null`,
          body: `Optional<T> is a container that either holds a non-null value or is empty, used primarily as a method return type to make "this might not have a value" explicit in the type signature, forcing callers to consciously handle absence instead of risking a NullPointerException from an unchecked null. Idiomatic use favors orElse()/orElseGet()/orElseThrow() and map()/ifPresent() over calling .get() directly (which throws if empty and defeats the entire purpose) or, worse, calling .isPresent() followed by .get() — a pattern barely better than a null check.`,
          code: {
            language: `java`,
            code: `Optional<Employee> found = employees.stream()
    .filter(e -> e.getId() == targetId)
    .findFirst();

String name = found.map(Employee::getName).orElse("Unknown");
// or, to fail loudly instead of silently defaulting:
Employee emp = found.orElseThrow(() -> new NoSuchElementException("Employee not found"));`,
          },
        },
        {
          heading: `Laziness and Short-Circuiting`,
          body: `Intermediate operations are lazy — writing stream.filter(...).map(...) builds a pipeline description but executes nothing until a terminal operation is invoked, at which point elements flow through the entire pipeline one at a time rather than each operation fully completing before the next begins. This laziness enables short-circuiting: a terminal operation like findFirst() or anyMatch() can stop processing as soon as it has its answer, without the source needing to produce every remaining element — which is exactly why an infinite stream (Stream.iterate(0, n -> n + 1)) can be used safely as long as a short-circuiting terminal operation like limit() or findFirst() eventually bounds it.`,
        },
      ],
      commonPitfalls: [
        `Calling a terminal operation twice on the same Stream object, throwing IllegalStateException because streams are single-use.`,
        `Using stream.get() on an Optional without checking presence first, reintroducing the exact "might throw" problem Optional was designed to make explicit and avoidable.`,
        `Forgetting reduce()'s two-argument overload (no identity) throws on an empty stream — use the three-argument overload with an identity value, or reduce() returning Optional<T>, when the stream might be empty.`,
        `Writing a stateful lambda inside map()/filter() that mutates external shared state, breaking the functional-purity assumption streams (especially parallel streams) rely on.`,
        `Overusing parallelStream() on a small collection or an I/O-bound operation, where thread-pool coordination overhead outweighs any parallelism benefit.`,
        `Chaining excessive intermediate operations that could be simplified into a single collect(Collectors.groupingBy(...)) call, hand-writing logic the standard library already provides.`,
        `Forgetting that Optional itself should never be used as a field type or a method parameter type — it's designed specifically for return types.`,
      ],
      keyTakeaways: [
        `A functional interface has exactly one abstract method — lambdas are shorthand implementations of that method, usable anywhere the interface is expected.`,
        `A Stream pipeline is source → intermediate operations (lazy) → one terminal operation (triggers execution); streams are single-use.`,
        `map transforms 1-to-1, filter selects a subset, reduce combines everything into one value — the three core building blocks of any pipeline.`,
        `Collectors.groupingBy() is the idiomatic replacement for manually building a Map<K, List<V>> with a loop.`,
        `Method references (::) are shorthand for lambdas that call a single existing method — prefer them for readability once the pattern is recognized.`,
        `Optional makes potential absence explicit in a return type — use orElse/map/ifPresent, and avoid calling .get() without first checking presence.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Lambda Expressions`, url: `https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html` },
        { label: `Oracle Java SE Docs — Stream (java.util.stream)`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html` },
        { label: `Baeldung — Guide to Java 8's Collectors`, url: `https://www.baeldung.com/java-8-collectors` },
      ],
    },
    {
      moduleTitle: `Java Advanced`,
      subModuleTitle: `Advanced concurrency`,
      overview: `Beyond the basics of Thread and synchronized, java.util.concurrent provides a rich toolkit of higher-level building blocks that make concurrent code both easier to write correctly and more scalable — this is the toolkit real production Java systems actually use. This guide covers the Executor framework and thread pools in depth, Future and the more powerful CompletableFuture for composing asynchronous operations without callback nesting, concurrent collections (ConcurrentHashMap, CopyOnWriteArrayList) that are safe under concurrent access without external synchronization, explicit locks (ReentrantLock) and atomic variables (AtomicInteger) as alternatives to synchronized, coordination utilities (CountDownLatch, CyclicBarrier), and a concrete look at how deadlocks happen and how to prevent them. This is dense, interview-relevant material — expect questions on the difference between synchronized and ReentrantLock, and on how to compose multiple async operations with CompletableFuture.`,
      sections: [
        {
          heading: `Thread Pools and the Executor Framework`,
          body: `Executors provides factory methods for common thread pool configurations: newFixedThreadPool(n) keeps exactly n threads alive, queuing excess tasks; newCachedThreadPool() creates threads on demand and reuses idle ones, growing unbounded under sustained load (risky for unbounded workloads); newSingleThreadExecutor() serializes all tasks through one thread, guaranteeing sequential execution. submit() returns a Future representing the pending result, while execute() (inherited from Executor) is fire-and-forget with no result tracking. Always call shutdown() (graceful, finishes queued tasks) or shutdownNow() (attempts to cancel in-flight tasks) when a pool is no longer needed — an ExecutorService that's never shut down keeps its threads alive and can prevent the JVM from exiting.`,
          code: {
            language: `java`,
            code: `ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> future = pool.submit(() -> {
    Thread.sleep(100);
    return 42;
});
Integer result = future.get();   // blocks until the task completes
pool.shutdown();`,
          },
        },
        {
          heading: `CompletableFuture: Composing Async Operations`,
          body: `Future only supports blocking get() to retrieve a result — it has no way to chain a follow-up action or combine multiple futures without manually blocking each one. CompletableFuture (Java 8+) solves this by supporting non-blocking composition: thenApply() transforms a result once available, thenCompose() chains a dependent async operation (flattening nested futures, analogous to flatMap), and thenCombine() merges two independent futures' results once both complete. This eliminates deeply nested callback code while still running work asynchronously on a thread pool (the common ForkJoinPool.commonPool() by default, or a custom Executor passed explicitly).`,
          code: {
            language: `java`,
            code: `CompletableFuture<Integer> fetchUserAge = CompletableFuture.supplyAsync(() -> fetchAge(userId));

CompletableFuture<String> greeting = fetchUserAge
    .thenApply(age -> age >= 18 ? "adult" : "minor")
    .thenCompose(category -> fetchGreetingFor(category));   // chains another async call

greeting.thenAccept(System.out::println);   // non-blocking callback on completion`,
          },
        },
        {
          heading: `Concurrent Collections`,
          body: `ConcurrentHashMap provides thread-safe get/put without locking the entire map for every operation — it internally partitions locking at a fine-grained level (historically per-segment, now per-bucket since Java 8), so multiple threads can read and write different keys simultaneously without blocking each other, making it dramatically faster under contention than a manually synchronized HashMap or the legacy Hashtable. CopyOnWriteArrayList is optimized for read-heavy, write-rare scenarios: every mutation (add/remove) copies the entire underlying array, making writes expensive but reads (including iteration) require no locking at all and are never affected by concurrent modification — ideal for something like a list of event listeners that's iterated constantly but modified rarely.`,
          bullets: [
            `ConcurrentHashMap — fine-grained locking, high-throughput reads and writes; never throws ConcurrentModificationException during iteration.`,
            `CopyOnWriteArrayList — read operations are lock-free and always safe; writes are O(n) due to full-array copying — use only when reads vastly outnumber writes.`,
            `Both are found in java.util.concurrent, distinct from the plain (unsynchronized) java.util collections.`,
          ],
        },
        {
          heading: `ReentrantLock and Atomic Variables`,
          body: `ReentrantLock offers everything synchronized does, plus features synchronized cannot express: tryLock() (attempt to acquire without blocking indefinitely, optionally with a timeout), interruptible lock acquisition, and fairness ordering (constructing with new ReentrantLock(true) grants the lock to the longest-waiting thread first, reducing thread starvation). Unlike synchronized, a ReentrantLock must be released manually in a finally block — forgetting to unlock() leaves the lock permanently held, a bug synchronized's automatic release makes structurally impossible. Atomic classes (AtomicInteger, AtomicLong, AtomicReference) provide lock-free, hardware-level compare-and-swap operations for single-variable updates like counters, avoiding synchronization overhead entirely for the common case of one shared numeric field.`,
          code: {
            language: `java`,
            code: `private final ReentrantLock lock = new ReentrantLock();

public void criticalSection() {
    lock.lock();
    try {
        // protected code
    } finally {
        lock.unlock();   // MUST be in finally, or a lock leaks on exception
    }
}

// Atomic alternative to synchronized for a simple counter
private final AtomicInteger counter = new AtomicInteger(0);
public void increment() { counter.incrementAndGet(); }   // lock-free, thread-safe`,
          },
        },
        {
          heading: `Coordination Utilities: CountDownLatch and CyclicBarrier`,
          body: `CountDownLatch lets one or more threads wait until a set of operations happening in other threads completes: initialized with a count, each worker calls countDown() when finished, and any thread calling await() blocks until the count reaches zero — commonly used to wait for several parallel initialization tasks to finish before proceeding, and it's single-use (cannot be reset once it reaches zero). CyclicBarrier is similar but reusable and inverted in purpose: it makes a fixed number of threads all wait for each other at a common point before any of them proceeds, useful for phased, lock-step parallel algorithms where every worker must finish phase N before any worker starts phase N+1.`,
        },
        {
          heading: `Deadlocks: How They Happen and How to Avoid Them`,
          body: `A deadlock occurs when two or more threads each hold a lock the other needs and neither can proceed — the classic case is Thread A locking resource 1 then waiting for resource 2, while Thread B simultaneously locks resource 2 then waits for resource 1, so both threads block forever with no way out. The standard prevention strategy is lock ordering: always acquire multiple locks in the same globally consistent order across every code path that needs more than one, which makes the circular-wait condition required for deadlock structurally impossible. tryLock() with a timeout (available on ReentrantLock but not synchronized) offers a second mitigation — a thread that can't acquire a lock within a bounded time can back off and retry instead of blocking forever.`,
          code: {
            language: `java`,
            code: `// Deadlock risk: inconsistent lock ordering between two methods
void transferAB() { synchronized (lockA) { synchronized (lockB) { /* ... */ } } }
void transferBA() { synchronized (lockB) { synchronized (lockA) { /* ... */ } } } // WRONG order

// Fix: always acquire in the same global order (e.g. by object identity hash)
void transfer(Object first, Object second) {
    synchronized (first) {
        synchronized (second) { /* ... */ }
    }
}`,
          },
        },
      ],
      commonPitfalls: [
        `Never calling shutdown() on an ExecutorService, keeping its threads alive indefinitely and preventing clean JVM shutdown.`,
        `Calling future.get() with no timeout, blocking forever if the submitted task hangs — prefer get(timeout, unit) in production code.`,
        `Acquiring locks in inconsistent order across different methods, creating a classic circular-wait deadlock under concurrent access.`,
        `Forgetting to release a ReentrantLock in a finally block, permanently leaking the lock if an exception occurs in the critical section.`,
        `Using CopyOnWriteArrayList for a write-heavy workload, incurring an O(n) full-array copy on every single mutation.`,
        `Reusing a CountDownLatch after it reaches zero, not realizing it's single-use — CyclicBarrier is the reusable equivalent.`,
        `Mixing raw synchronized blocks and ReentrantLock on what's meant to be the same critical section, providing no actual mutual exclusion since they're different locking mechanisms.`,
      ],
      keyTakeaways: [
        `Prefer a pooled ExecutorService over raw Thread objects, and always shut it down when finished.`,
        `CompletableFuture supports non-blocking composition (thenApply/thenCompose/thenCombine) where a plain Future only supports blocking get().`,
        `ConcurrentHashMap and CopyOnWriteArrayList provide thread safety without external synchronization, each optimized for a different read/write balance.`,
        `ReentrantLock adds tryLock, timeouts, and fairness over synchronized, but requires manual unlock() in a finally block.`,
        `Atomic classes (AtomicInteger, etc.) give lock-free thread safety for single-variable updates via compare-and-swap.`,
        `Deadlocks require a circular wait between locks — consistent lock ordering across the entire codebase prevents it structurally.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — High Level Concurrency Objects`, url: `https://docs.oracle.com/javase/tutorial/essential/concurrency/highlevel.html` },
        { label: `Oracle Java SE Docs — CompletableFuture`, url: `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CompletableFuture.html` },
        { label: `Baeldung — Guide to java.util.concurrent.Locks`, url: `https://www.baeldung.com/java-concurrent-locks` },
      ],
    },
    {
      moduleTitle: `Java Advanced`,
      subModuleTitle: `Building a capstone application`,
      overview: `The capstone application is where every topic from Java Fundamentals through Advanced Concurrency comes together into one coherent project — a working piece of software you can walk an interviewer through, rather than isolated syntax knowledge. This guide covers how to plan and structure a capstone (a layered console or small web application, such as an inventory manager, a library system, or a task tracker backed by a real database), how to combine collections, generics, streams, JDBC, and concurrency deliberately rather than superficially, project organization with Maven or Gradle, the basics of writing JUnit tests for your core logic, sensible logging and error handling at the application level, and — critically for placement purposes — how to present the finished project confidently in an interview setting.`,
      sections: [
        {
          heading: `Choosing and Scoping a Capstone Project`,
          body: `A good capstone project is small enough to finish in the available time but rich enough to exercise most of the course's topics meaningfully — a CRUD-heavy domain (library system, inventory tracker, employee management, order processing) naturally exercises collections, JDBC persistence, and OOP design without requiring exotic algorithms. Scope it explicitly before writing code: list the core entities (e.g. Book, Member, Loan), the operations each supports, and one or two "stretch" features (like a report generated via streams, or a background task using the Executor framework) that demonstrate advanced material without becoming the whole project's focus.`,
        },
        {
          heading: `Layered Architecture Applied to a Java Application`,
          body: `The same layered separation used in web backends applies directly to a standalone Java application: a data-access layer (JDBC repositories, one per entity, isolating all SQL) sits beneath a service layer (business rules — checking a book is actually available before creating a Loan), which is used by a presentation layer (a console menu, a REST controller, or a simple GUI). Keeping these layers strictly separated — the service layer never constructs SQL directly, the presentation layer never touches a Connection — is exactly what makes the project explainable in an interview: you can describe each layer's responsibility in one sentence.`,
          code: {
            language: `java`,
            code: `// Repository layer -- the only place SQL lives
public class BookRepository {
    public Optional<Book> findById(Connection conn, int id) throws SQLException { /* ... */ }
    public void save(Connection conn, Book book) throws SQLException { /* ... */ }
}

// Service layer -- business rules, no SQL
public class LoanService {
    private final BookRepository books;
    private final LoanRepository loans;

    public Loan checkOut(int bookId, int memberId) {
        Book book = books.findById(...).orElseThrow(() -> new NoSuchElementException("Book not found"));
        if (!book.isAvailable()) throw new IllegalStateException("Book already checked out");
        // ... create and persist a Loan ...
    }
}`,
          },
        },
        {
          heading: `Combining Collections, Generics, and Streams for Real Logic`,
          body: `The strongest capstone projects use these tools purposefully, not decoratively: a generic Repository<T, ID> interface (implemented per entity) demonstrates real generics usage rather than a textbook Box<T> example; a report method that groups loans by member and counts them via Collectors.groupingBy() demonstrates practical stream usage over a hand-written loop with a HashMap accumulator; a TreeMap keeping overdue loans sorted by due date demonstrates a deliberate collection choice justified by a real requirement (needing sorted iteration) rather than an arbitrary one.`,
          code: {
            language: `java`,
            code: `public interface Repository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    T save(T entity);
    void deleteById(ID id);
}
// BookRepository implements Repository<Book, Integer> -- generics doing real work

Map<Member, Long> overdueCountByMember = loans.stream()
    .filter(Loan::isOverdue)
    .collect(Collectors.groupingBy(Loan::getMember, Collectors.counting()));`,
          },
        },
        {
          heading: `Project Structure with Maven or Gradle`,
          body: `A capstone should use a standard build tool rather than manually compiling .java files — Maven (declarative XML, pom.xml, convention-heavy) or Gradle (Groovy/Kotlin DSL, build.gradle, more flexible) both manage dependencies (a JDBC driver, JUnit, a logging library) and enforce the standard source layout (src/main/java, src/test/java) that every Java tool and IDE expects. This matters for interviews specifically because "how do you manage dependencies and build this project" is a fair follow-up question, and a project with a proper pom.xml/build.gradle signals professional practice over a copy-pasted script.`,
        },
        {
          heading: `Testing Core Logic with JUnit`,
          body: `The service layer — business rules with no direct database or I/O dependency — is exactly what unit tests should target first, since it can be tested in isolation without a real database connection (using a mock or in-memory implementation of the repository interfaces). A JUnit 5 test method is annotated @Test, uses assertEquals/assertThrows/assertTrue from org.junit.jupiter.api.Assertions to verify behavior, and each test should cover one specific behavior or edge case (checking out an already-checked-out book should throw, not silently succeed) rather than one giant test exercising the whole workflow at once.`,
          code: {
            language: `java`,
            code: `@Test
void checkOutThrowsWhenBookUnavailable() {
    Book book = new Book(1, "Effective Java", false);  // not available
    when(bookRepository.findById(1)).thenReturn(Optional.of(book));

    assertThrows(IllegalStateException.class, () -> loanService.checkOut(1, memberId));
}`,
          },
        },
        {
          heading: `Logging and Application-Level Error Handling`,
          body: `A capstone should use a real logging framework (SLF4J with Logback, the de facto Java standard) instead of System.out.println() for anything beyond quick debugging — proper logging carries severity levels (DEBUG, INFO, WARN, ERROR), timestamps, and can be redirected to a file, all of which println() cannot do. At the presentation layer, catch domain exceptions thrown by the service layer (NoSuchElementException, IllegalStateException, or custom exceptions like BookUnavailableException) and translate them into a clear user-facing message, rather than letting a raw stack trace print to the console or crash the application.`,
        },
        {
          heading: `Presenting the Capstone in an Interview`,
          body: `When asked to walk through your capstone, lead with the problem it solves and its layered structure in 30 seconds before diving into any code, then be ready to justify specific decisions: why this collection type here, why this design pattern there, what you'd change with more time. Interviewers are often more interested in your reasoning and awareness of trade-offs than in the project's polish — being able to say "I used a HashMap here for O(1) lookup, but if I needed sorted iteration I'd switch to a TreeMap" demonstrates exactly the depth this program is built to develop, and is far more valuable than a feature-complete project you can't explain.`,
        },
      ],
      commonPitfalls: [
        `Scoping the capstone too large to finish, leaving core features half-built instead of a smaller project that's fully working and well-tested.`,
        `Mixing SQL directly into the service or presentation layer instead of keeping it isolated in a repository layer, making the project harder to explain and to test.`,
        `Using generics, streams, or design patterns superficially just to "check a box" rather than because they solve a real problem in the project.`,
        `Skipping tests entirely, then being unable to answer "how did you verify this works?" beyond "I ran it manually."`,
        `Using System.out.println() for all output instead of a real logging framework, losing severity levels and making production-style debugging impossible.`,
        `Catching exceptions in the presentation layer without translating them into a useful message, letting a raw stack trace confuse the end user.`,
        `Being unable to justify a specific technical decision (why this collection, why this pattern) when asked in an interview, revealing the choice was arbitrary rather than deliberate.`,
      ],
      keyTakeaways: [
        `Scope the capstone to finish completely and be well-tested, rather than attempting every feature and finishing none of them.`,
        `Apply the same layered architecture (repository / service / presentation) used in production backends, keeping SQL isolated from business logic.`,
        `Use generics, collections, and streams because they solve a real problem in your project — be ready to justify every specific choice.`,
        `A standard build tool (Maven or Gradle) and a proper src/main/src/test layout signal professional practice to an interviewer.`,
        `Unit-test the service layer in isolation using mocked repositories — this is the layer most worth testing first.`,
        `When presenting the project, lead with the problem and structure, then be ready to explain and justify specific technical trade-offs.`,
      ],
      links: [
        { label: `Oracle Java Tutorials — Trail: Learning the Java Language`, url: `https://docs.oracle.com/javase/tutorial/java/index.html` },
        { label: `JUnit 5 User Guide`, url: `https://junit.org/junit5/docs/current/user-guide/` },
        { label: `Maven — Getting Started Guide`, url: `https://maven.apache.org/guides/getting-started/index.html` },
      ],
    },
    {
      moduleTitle: `DSA Fundamentals`,
      subModuleTitle: `Arrays & strings`,
      overview: `Array and string problems dominate the early rounds of technical interviews because they require no special data structure knowledge to get started, yet they reward genuinely different algorithmic thinking than the brute-force nested loop most candidates reach for first. This submodule focuses purely on algorithmic technique — unlike the Java Fundamentals "Arrays & strings" submodule, which covered Java's array/String syntax and mechanics, this one assumes that mechanics and teaches the patterns that turn an O(n²) brute-force scan into an O(n) or O(n log n) solution: the two-pointer technique, the sliding window technique, prefix sums, and in-place array manipulation. Each pattern is demonstrated with a full worked Java example and an explicit statement of its time and space complexity, because stating complexity correctly and unprompted is exactly what separates a strong interview answer from an average one.`,
      sections: [
        {
          heading: `The Two-Pointer Technique`,
          body: `Two-pointer problems maintain two indices into the same array (or string) that move toward each other or in the same direction based on a comparison, replacing what would otherwise be an O(n²) pair-checking loop with a single O(n) pass. It's the standard approach for problems on a sorted array where you need to find a pair, triple, or subrange satisfying some condition — the classic example is finding two numbers in a sorted array that sum to a target: start one pointer at each end, and move the low pointer up if the current sum is too small, or the high pointer down if it's too large, since moving in the "wrong" direction could never help.`,
          code: {
            language: `java`,
            code: `// Two Sum on a SORTED array -- two-pointer, O(n) time, O(1) space
public static int[] twoSumSorted(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return new int[]{left, right};
        if (sum < target) left++;   // need a bigger sum -- move low pointer up
        else right--;               // need a smaller sum -- move high pointer down
    }
    return new int[]{-1, -1};       // no pair found
}
// Time: O(n) -- each pointer moves at most n times total
// Space: O(1) -- no extra data structure`,
          },
        },
        {
          heading: `Sliding Window: Fixed and Variable Size`,
          body: `Sliding window problems maintain a contiguous subrange (the "window") over an array or string and slide it forward one element at a time, updating a running aggregate incrementally instead of recomputing it from scratch for every possible window — this turns an O(n·k) brute force (recomputing each window of size k from zero) into O(n). A fixed-size window (find the maximum sum of any k consecutive elements) adds the new element entering the window and subtracts the one leaving it on each step. A variable-size window (find the smallest subarray with sum ≥ target) expands the right edge until a condition is met, then contracts the left edge while the condition still holds, tracking the best window seen.`,
          code: {
            language: `java`,
            code: `// Maximum sum of any window of size k -- fixed-size sliding window, O(n)
public static int maxSumWindow(int[] arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];   // sum the first window
    int maxSum = windowSum;

    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];   // add new element, remove the one leaving the window
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
// Time: O(n) -- each element is added and removed from the window exactly once
// Space: O(1)`,
          },
        },
        {
          heading: `Prefix Sums for Fast Range Queries`,
          body: `A prefix sum array precomputes, for each index i, the sum of all elements from the start of the array up to i — once built (a single O(n) pass), the sum of any arbitrary range [i, j] can be answered in O(1) as prefix[j] - prefix[i-1], instead of re-summing that range in O(n) every time it's queried. This pattern is essential whenever a problem asks for many range-sum queries over the same static array — the naive approach of summing each range on demand is O(n) per query and O(n·q) overall for q queries, while prefix sums reduce total query time to O(q) after one O(n) preprocessing pass.`,
          code: {
            language: `java`,
            code: `// Build once: O(n). Answer each range-sum query in O(1) after that.
public static int[] buildPrefixSums(int[] arr) {
    int[] prefix = new int[arr.length + 1];   // prefix[0] = 0 by convention
    for (int i = 0; i < arr.length; i++) {
        prefix[i + 1] = prefix[i] + arr[i];
    }
    return prefix;
}

public static int rangeSum(int[] prefix, int left, int right) {   // inclusive [left, right]
    return prefix[right + 1] - prefix[left];
}`,
          },
        },
        {
          heading: `In-Place Array Manipulation`,
          body: `Many array problems ask for a transformation "in-place," meaning without allocating a second array proportional to the input size, which forces O(1) extra space rather than the O(n) an obvious second-array approach would use. Common in-place techniques include reversing a subrange by swapping from both ends inward, partitioning elements around a pivot (as in quicksort's partition step or the Dutch national flag problem), and the "write pointer" pattern for removing elements in-place — a slow pointer tracks where the next kept element should be written, while a fast pointer scans the whole array, so unwanted elements are simply never copied forward.`,
          code: {
            language: `java`,
            code: `// Remove all occurrences of 'target' in-place, return new logical length
public static int removeInPlace(int[] arr, int target) {
    int writeIndex = 0;                       // slow pointer: next position to write a kept element
    for (int readIndex = 0; readIndex < arr.length; readIndex++) {   // fast pointer: scans everything
        if (arr[readIndex] != target) {
            arr[writeIndex] = arr[readIndex];
            writeIndex++;
        }
    }
    return writeIndex;   // elements [0, writeIndex) are the result
}
// Time: O(n), Space: O(1) -- no second array allocated`,
          },
        },
        {
          heading: `String-Specific Techniques: Palindromes and Anagrams`,
          body: `Palindrome checks are a direct application of the two-pointer technique on a String or char[]: compare characters from both ends moving inward, and any mismatch proves it's not a palindrome, short-circuiting immediately rather than always doing a full pass. Anagram checks (do two strings contain exactly the same characters, possibly reordered?) are most efficiently solved with a frequency-count array or HashMap rather than sorting both strings — sorting costs O(n log n), while counting character frequencies costs O(n), a meaningful complexity improvement interviewers specifically look for.`,
          code: {
            language: `java`,
            code: `// Anagram check via frequency counting -- O(n) instead of O(n log n) via sorting
public static boolean isAnagram(String a, String b) {
    if (a.length() != b.length()) return false;
    int[] counts = new int[26];                // assumes lowercase a-z
    for (char c : a.toCharArray()) counts[c - 'a']++;
    for (char c : b.toCharArray()) counts[c - 'a']--;
    for (int count : counts) {
        if (count != 0) return false;
    }
    return true;
}
// Time: O(n), Space: O(1) -- the counts array is fixed size (26), independent of input length`,
          },
        },
      ],
      commonPitfalls: [
        `Defaulting to nested loops (O(n²)) for pair-sum or subarray problems without first checking whether two-pointer or sliding window reduces it to O(n).`,
        `Applying two-pointer to an unsorted array expecting sorted-array behavior — two-pointer's directional logic only works correctly once the array is sorted (or the problem doesn't require order).`,
        `Recomputing a sliding window's sum from scratch on every shift instead of incrementally adding the entering element and subtracting the leaving one.`,
        `Off-by-one errors in prefix sum ranges — forgetting prefix[0] = 0 as a sentinel, or mixing up inclusive vs. exclusive range boundaries.`,
        `Allocating a second array for an "in-place" transformation, missing the O(1) extra-space requirement the problem is actually testing.`,
        `Sorting both strings to check for an anagram (O(n log n)) instead of frequency counting (O(n)), missing an easy complexity improvement.`,
        `Not stating time and space complexity out loud after presenting a solution — interviewers expect this proactively, not only when asked.`,
      ],
      keyTakeaways: [
        `Two-pointer converts many O(n²) pair/range problems on sorted data into O(n) by moving two indices based on a comparison.`,
        `Sliding window converts O(n·k) windowed-aggregate problems into O(n) by updating the aggregate incrementally instead of recomputing it.`,
        `Prefix sums answer arbitrary range-sum queries in O(1) each after one O(n) preprocessing pass — essential when many queries hit the same static array.`,
        `In-place techniques (swap-from-ends, read/write pointers) achieve O(1) extra space instead of allocating a second array.`,
        `Frequency counting beats sorting for anagram-style comparisons — O(n) vs. O(n log n).`,
        `Always state time and space complexity explicitly after presenting a solution — it's an expected part of the answer, not an optional add-on.`,
      ],
      links: [
        { label: `GeeksforGeeks — Two Pointer Technique`, url: `https://www.geeksforgeeks.org/dsa/two-pointers-technique/` },
        { label: `GeeksforGeeks — Window Sliding Technique`, url: `https://www.geeksforgeeks.org/dsa/window-sliding-technique/` },
        { label: `GeeksforGeeks — Prefix Sum Array`, url: `https://www.geeksforgeeks.org/dsa/prefix-sum-array-implementation-applications-competitive-programming/` },
      ],
    },
    {
      moduleTitle: `DSA Fundamentals`,
      subModuleTitle: `Linked lists`,
      overview: `A linked list is a linear data structure where each element (node) holds its data plus a reference to the next node, trading array's O(1) random access for O(1) insertion and deletion at any known position — a fundamental structural trade-off interviewers expect you to articulate clearly. This guide covers building a singly linked list from scratch, traversal, insertion, and deletion, the classic iterative in-place reversal algorithm, Floyd's cycle-detection algorithm (the "tortoise and hare"), a brief look at doubly and circular linked lists, and the broader family of fast/slow pointer techniques that linked-list problems rely on constantly. Linked list manipulation is one of the most reliable indicators interviewers use to assess pointer-handling discipline, since a single misplaced reference update can silently corrupt the entire list or create an infinite loop.`,
      sections: [
        {
          heading: `Node Structure and Basic Traversal`,
          body: `A singly linked list node holds a value and a reference to the next node (null for the last node), and the list itself typically only needs to track a reference to the head node — every other node is reached by following next references one at a time. Traversal is always O(n), since there is no way to "skip ahead" in a linked list the way array indexing allows; this is the fundamental trade-off versus an array, and it's why algorithms on linked lists lean heavily on maintaining multiple pointers (current, previous, fast, slow) rather than indexing.`,
          code: {
            language: `java`,
            code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

// Traversal: O(n) time, O(1) space
public static void printList(ListNode head) {
    ListNode current = head;
    while (current != null) {
        System.out.print(current.val + " -> ");
        current = current.next;
    }
    System.out.println("null");
}`,
          },
        },
        {
          heading: `Insertion and Deletion`,
          body: `Inserting at the head is O(1) — create a new node whose next points at the current head, then update the list's head reference to the new node. Inserting after a given node (with a reference already in hand) is also O(1) — relink two next pointers. Inserting at an arbitrary position by index, or at the tail without a maintained tail pointer, requires first traversing to find that position, making it O(n) overall even though the actual insertion step is O(1) — this is the nuance interviewers probe when asking "what's the complexity of linked list insertion," since the honest answer is "O(1) if you already have the position, O(n) if you have to find it first."`,
          code: {
            language: `java`,
            code: `// Delete the node with a given value -- O(n) (must find it), O(1) extra space
public static ListNode deleteValue(ListNode head, int value) {
    ListNode dummy = new ListNode(0);   // dummy node simplifies head-deletion edge case
    dummy.next = head;
    ListNode prev = dummy;

    while (prev.next != null) {
        if (prev.next.val == value) {
            prev.next = prev.next.next;   // unlink the matching node
            break;
        }
        prev = prev.next;
    }
    return dummy.next;
}`,
          },
        },
        {
          heading: `Reversing a Linked List Iteratively`,
          body: `Reversing a singly linked list in-place is one of the most commonly asked linked-list problems, and the standard iterative solution walks the list once, re-pointing each node's next to its predecessor instead of its successor, using three tracked pointers (previous, current, next) to avoid losing the rest of the list once a link is rewritten. It runs in O(n) time with O(1) extra space, versus a recursive version which is also O(n) time but O(n) space due to the call stack — this space difference is worth stating explicitly if asked to compare the two approaches.`,
          code: {
            language: `java`,
            code: `// Iterative reversal -- O(n) time, O(1) space
public static ListNode reverse(ListNode head) {
    ListNode previous = null;
    ListNode current = head;

    while (current != null) {
        ListNode next = current.next;   // save the rest of the list before overwriting the link
        current.next = previous;         // reverse this node's pointer
        previous = current;              // advance previous
        current = next;                  // advance current
    }
    return previous;   // previous is now the new head
}`,
          },
        },
        {
          heading: `Floyd's Cycle Detection (Fast/Slow Pointers)`,
          body: `Detecting whether a linked list contains a cycle without extra memory is solved elegantly by Floyd's algorithm: two pointers start at the head, one (slow) advancing one node per step and the other (fast) advancing two nodes per step — if there is no cycle, fast reaches null and the algorithm terminates; if there is a cycle, fast will eventually "lap" slow and the two pointers will point at the identical node, proving a cycle exists. This is provably correct because the gap between fast and slow shrinks by exactly one node per iteration once both are inside the cycle, guaranteeing they meet within at most the cycle's length in iterations.`,
          code: {
            language: `java`,
            code: `// Floyd's cycle detection -- O(n) time, O(1) space (vs O(n) space for a HashSet-based approach)
public static boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;          // moves 1 step
        fast = fast.next.next;     // moves 2 steps
        if (slow == fast) return true;   // they met -- a cycle exists
    }
    return false;   // fast reached the end -- no cycle
}`,
          },
        },
        {
          heading: `Doubly and Circular Linked Lists`,
          body: `A doubly linked list adds a prev reference alongside next on every node, enabling O(1) backward traversal and O(1) deletion of a known node without needing a separate reference to its predecessor (unlike a singly linked list, where deleting a node requires already having a reference to the node before it) — the trade-off is extra memory per node and more pointer updates to keep consistent on every mutation. A circular linked list has its last node's next point back to the head instead of null, useful for round-robin scheduling or any repeating-cycle use case, but it requires careful termination logic in traversal (checking against the starting node, not against null) to avoid an infinite loop.`,
        },
        {
          heading: `The Fast/Slow Pointer Pattern Beyond Cycle Detection`,
          body: `The same two-speed pointer idea that detects cycles also solves several other classic linked-list problems in a single pass with O(1) extra space: finding the middle node (when fast reaches the end, slow is exactly at the midpoint, since it has traveled half as far), and finding the nth node from the end (advance one pointer n steps first, then move both pointers together — when the lead pointer reaches the end, the trailing pointer is exactly n nodes from the end). Recognizing "this needs two pointers moving at different rates" is one of the highest-leverage pattern-recognition skills for linked-list interview questions.`,
        },
      ],
      commonPitfalls: [
        `Losing the rest of the list by overwriting current.next before saving a reference to it, breaking the reversal algorithm's ability to continue traversing.`,
        `Forgetting to update the head reference after inserting or deleting at the front of the list, leaving the caller with a stale head pointer.`,
        `Assuming linked list insertion/deletion is always O(1) without accounting for the O(n) traversal needed to reach an arbitrary position first.`,
        `Using a HashSet to detect cycles (O(n) space) when Floyd's algorithm solves it in O(1) space — a common missed optimization.`,
        `Off-by-one errors in the "nth node from the end" two-pointer pattern — miscounting how many steps to advance the lead pointer before starting to move both.`,
        `Not handling the empty list (head == null) or single-node list as edge cases, causing a NullPointerException in traversal logic.`,
        `Forgetting to null-terminate the new tail after reversal, if the original head (now the new tail) still points at the old second node.`,
      ],
      keyTakeaways: [
        `Linked lists trade O(1) random access (which arrays have) for O(1) insertion/deletion at a known position — traversal to find that position is still O(n).`,
        `Iterative reversal uses three pointers (previous, current, next) and runs in O(n) time, O(1) space — strictly better space complexity than a recursive version.`,
        `Floyd's cycle detection (fast/slow pointers) finds a cycle in O(n) time and O(1) space, beating a HashSet-based approach's O(n) space.`,
        `The fast/slow pointer pattern also finds the middle node and the nth-from-end node in a single pass with O(1) extra space.`,
        `A dummy/sentinel node before the head simplifies edge cases (deleting the head itself) in insertion/deletion code.`,
        `Doubly linked lists trade extra per-node memory for O(1) backward traversal and simpler deletion given only the node itself.`,
      ],
      links: [
        { label: `GeeksforGeeks — Linked List Data Structure`, url: `https://www.geeksforgeeks.org/dsa/linked-list-data-structure/` },
        { label: `GeeksforGeeks — Detect Loop in a Linked List (Floyd's Algorithm)`, url: `https://www.geeksforgeeks.org/dsa/detect-loop-in-a-linked-list/` },
        { label: `GeeksforGeeks — Reverse a Linked List`, url: `https://www.geeksforgeeks.org/dsa/reverse-a-linked-list/` },
      ],
    },
    {
      moduleTitle: `DSA Fundamentals`,
      subModuleTitle: `Stacks & queues`,
      overview: `Stacks and queues are the two simplest yet most broadly applicable abstract data types in DSA — a stack's Last-In-First-Out (LIFO) discipline underlies function call stacks, undo functionality, and expression parsing, while a queue's First-In-First-Out (FIFO) discipline underlies task scheduling and breadth-first traversal. This guide covers both structures' array and linked-list implementations, Java's idiomatic Deque-based usage for both (rather than the legacy, semi-deprecated Stack class), the classic balanced-parentheses and expression-evaluation applications, the monotonic stack technique for a whole family of "next greater/smaller element" problems, circular queues, and a first look at the priority queue (heap) as a specialized queue variant. These structures reappear constantly as building blocks inside larger algorithms — BFS uses a queue, DFS (iterative) uses a stack — so fluency here pays off throughout the rest of the DSA curriculum.`,
      sections: [
        {
          heading: `Stack: LIFO and Its Implementations`,
          body: `A stack supports push (add to the top), pop (remove and return the top), and peek (view the top without removing) — all in O(1), whether backed by a dynamic array (pushing/popping at the end, which ArrayList already supports efficiently) or a singly linked list (pushing/popping at the head). Java's legacy Stack class extends Vector and is synchronized (with unnecessary locking overhead for single-threaded use) — the idiomatic modern choice is Deque<T> (specifically ArrayDeque), used as a stack via push()/pop()/peek(), which is unsynchronized and faster for typical single-threaded algorithmic code.`,
          code: {
            language: `java`,
            code: `Deque<Integer> stack = new ArrayDeque<>();   // idiomatic Java stack -- NOT java.util.Stack
stack.push(1);
stack.push(2);
stack.push(3);
System.out.println(stack.pop());    // 3 -- last in, first out
System.out.println(stack.peek());   // 2 -- top, without removing`,
          },
        },
        {
          heading: `Queue: FIFO and Its Implementations`,
          body: `A queue supports enqueue (add to the back) and dequeue (remove from the front), both O(1) when properly implemented — an array-backed queue needs to be circular (wrapping the front/back indices) to achieve O(1) dequeue, since naively shifting every remaining element forward after removing from the front would cost O(n). Java's Queue interface, implemented by LinkedList or ArrayDeque, provides offer() (enqueue) and poll() (dequeue) with O(1) amortized performance — ArrayDeque is generally preferred over LinkedList here too, for the same cache-locality reasons it's preferred as a List implementation.`,
          code: {
            language: `java`,
            code: `Queue<Integer> queue = new ArrayDeque<>();   // idiomatic Java queue
queue.offer(1);
queue.offer(2);
queue.offer(3);
System.out.println(queue.poll());   // 1 -- first in, first out
System.out.println(queue.peek());   // 2 -- front, without removing`,
          },
        },
        {
          heading: `Application: Balanced Parentheses`,
          body: `Checking whether a string's brackets are balanced and correctly nested is the canonical stack application: scan left to right, push every opening bracket onto the stack, and on every closing bracket, pop the stack and confirm it matches — a mismatch, or an attempt to pop an empty stack, immediately proves the string is unbalanced, and a non-empty stack at the end (unclosed openers) also proves it's unbalanced. This works because a stack's LIFO order exactly mirrors the nesting rule that the most recently opened bracket must be the next one closed.`,
          code: {
            language: `java`,
            code: `// Balanced parentheses check -- O(n) time, O(n) space (worst case, all openers)
public static boolean isBalanced(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');

    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (pairs.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                return false;   // mismatched or nothing to match against
            }
        }
    }
    return stack.isEmpty();   // true only if every opener was matched
}`,
          },
        },
        {
          heading: `The Monotonic Stack Technique`,
          body: `A monotonic stack maintains its elements in strictly increasing or decreasing order at all times, popping elements that violate that order as each new element is processed — this pattern solves the entire family of "next greater element" / "next smaller element" problems in O(n) total time, versus an O(n²) brute force that checks every pair. Each array element is pushed onto the stack exactly once and popped at most once across the whole algorithm, which is why the total work is O(n) despite the nested-looking while loop inside the for loop — this amortized-cost argument is worth stating explicitly, since it looks like O(n²) at first glance.`,
          code: {
            language: `java`,
            code: `// Next Greater Element for every array position -- O(n) time via monotonic stack
public static int[] nextGreaterElement(int[] arr) {
    int[] result = new int[arr.length];
    Arrays.fill(result, -1);
    Deque<Integer> stack = new ArrayDeque<>();   // stores INDICES, kept in decreasing value order

    for (int i = 0; i < arr.length; i++) {
        while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
            result[stack.pop()] = arr[i];   // arr[i] is the "next greater" for this popped index
        }
        stack.push(i);
    }
    return result;
}
// Time: O(n) -- each index is pushed once and popped at most once (amortized)
// Space: O(n) -- worst case, the stack holds every index`,
          },
        },
        {
          heading: `Circular Queues`,
          body: `An array-backed queue that simply advances a front index on dequeue eventually "leaks" usable space at the front of the array even though logically empty slots exist — a circular queue fixes this by wrapping both front and rear indices around modulo the array's capacity, reusing freed space instead of ever needing to shift elements or grow the array unnecessarily. Correctly distinguishing a full circular queue from an empty one (both can leave front == rear) typically requires either tracking a separate size counter or deliberately leaving one array slot always unused as a sentinel — a detail worth knowing if asked to implement one from scratch rather than relying on Java's ArrayDeque.`,
        },
        {
          heading: `Priority Queue: A Specialized Queue Ordered by Priority`,
          body: `A priority queue dequeues not by arrival order but by priority — the smallest (or largest, with a custom Comparator) element is always removed first, regardless of insertion order — and Java's PriorityQueue is backed internally by a binary heap, giving O(log n) for offer() and poll(), and O(1) for peek(). This is a specialized enough and important enough structure that it's covered in full depth alongside heaps in the DSA Advanced module's Trees & Graphs and Sorting submodules, but it's worth introducing here as conceptually "a queue where priority replaces arrival order" — the same enqueue/dequeue mental model, with a different ordering rule underneath.`,
          code: {
            language: `java`,
            code: `PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // smallest element polls first
minHeap.offer(5);
minHeap.offer(1);
minHeap.offer(3);
System.out.println(minHeap.poll());   // 1 -- smallest, not first-inserted
// PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());`,
          },
        },
      ],
      commonPitfalls: [
        `Using java.util.Stack instead of Deque/ArrayDeque — Stack is a legacy synchronized class with unnecessary locking overhead for typical single-threaded algorithmic code.`,
        `Implementing a queue with a plain array and naively shifting elements after every dequeue, turning an O(1) operation into O(n) — a circular buffer avoids this.`,
        `Forgetting to check for an empty stack before popping in a balanced-parentheses check, throwing a NoSuchElementException instead of correctly returning "unbalanced."`,
        `Believing the nested while loop inside a monotonic stack algorithm makes it O(n²) — each element is pushed and popped at most once total, making it O(n) amortized.`,
        `Confusing a full vs. empty circular queue when both can produce front == rear — forgetting to track size explicitly or reserve a sentinel slot.`,
        `Assuming PriorityQueue.poll() returns elements in insertion order — it returns the smallest (or comparator-defined highest-priority) element regardless of when it was added.`,
        `Using a plain Queue when what's actually needed is priority-based ordering, missing that PriorityQueue exists specifically for that case.`,
      ],
      keyTakeaways: [
        `Stack: LIFO, push/pop/peek all O(1); Queue: FIFO, enqueue/dequeue O(1) with a properly circular or linked implementation.`,
        `Use Deque/ArrayDeque for both stacks and queues in Java — not the legacy synchronized Stack class.`,
        `Balanced-parentheses checking is the canonical stack application — LIFO order exactly mirrors bracket nesting rules.`,
        `A monotonic stack solves "next greater/smaller element" problems in O(n) amortized time, since each element is pushed and popped at most once.`,
        `A circular queue reuses freed array space via modulo-wrapped indices instead of shifting elements or growing unnecessarily.`,
        `PriorityQueue (a binary heap) dequeues by priority, not arrival order — O(log n) insert/remove, O(1) peek.`,
      ],
      links: [
        { label: `GeeksforGeeks — Stack Data Structure`, url: `https://www.geeksforgeeks.org/dsa/stack-data-structure/` },
        { label: `GeeksforGeeks — Queue Data Structure`, url: `https://www.geeksforgeeks.org/dsa/queue-data-structure/` },
        { label: `GeeksforGeeks — Next Greater Element (Monotonic Stack)`, url: `https://www.geeksforgeeks.org/dsa/next-greater-element/` },
      ],
    },
    {
      moduleTitle: `DSA Fundamentals`,
      subModuleTitle: `Recursion`,
      overview: `Recursion — a function that calls itself to solve smaller instances of the same problem — is the conceptual foundation for tree/graph traversal, divide-and-conquer sorting, dynamic programming, and backtracking, making it one of the highest-leverage topics in the entire DSA curriculum. This guide covers the two non-negotiable components every correct recursive function needs (a base case and a recursive case that provably moves toward it), how the call stack physically represents recursion in memory, the practical trade-offs between recursion and iteration, the classic factorial and Fibonacci examples (the latter used specifically to illustrate exponential blowup and the fix via memoization), why Java does not optimize tail recursion the way some other languages do, and a first conceptual look at backtracking as recursion with explicit choice-and-undo. Nearly every advanced topic later in this course — trees, graphs, DP, backtracking — is recursion applied to a specific problem shape, so mastering the mental model here compounds enormously.`,
      sections: [
        {
          heading: `The Two Required Parts: Base Case and Recursive Case`,
          body: `Every correct recursive function needs a base case (a condition simple enough to answer directly, with no further recursive call) and a recursive case (which reduces the problem to a smaller instance of itself and combines that smaller result into the current answer). Omitting the base case entirely, or writing a recursive case that doesn't provably shrink toward it, causes infinite recursion — since each call consumes stack memory, this manifests as a StackOverflowError rather than an infinite loop's CPU spin, which is one of the most distinctive and telling runtime errors in recursive code.`,
          code: {
            language: `java`,
            code: `public static int factorial(int n) {
    if (n <= 1) return 1;              // base case -- stops the recursion
    return n * factorial(n - 1);        // recursive case -- shrinks toward the base case
}
// factorial(5) = 5 * factorial(4) = 5 * (4 * factorial(3)) = ... = 120
// Time: O(n), Space: O(n) -- n stack frames are alive simultaneously at the deepest point`,
          },
        },
        {
          heading: `Visualizing the Call Stack`,
          body: `Each recursive call pushes a new stack frame holding that call's parameters and local variables, and the frame is only popped (removed) once that call returns — this means all n frames for factorial(n) exist simultaneously in memory at the deepest point of recursion, right before the base case is hit and the unwinding (returning) phase begins. Visualizing this two-phase structure — a "winding" phase where calls stack up, then an "unwinding" phase where each call's pending multiplication/combination actually executes as control returns back up the stack — is the single most useful mental model for tracing through and debugging any recursive function by hand.`,
        },
        {
          heading: `Recursion vs. Iteration: Trade-offs`,
          body: `Any recursive algorithm can, in principle, be rewritten iteratively using an explicit stack data structure to manage state manually instead of relying on the call stack — but the recursive version is frequently far more readable for problems whose structure is naturally recursive (tree traversal, divide-and-conquer), while the iterative version avoids the O(depth) call-stack space overhead and the risk of a StackOverflowError on very deep recursion (Java's default stack size typically supports on the order of 10,000-15,000 simple frames before overflowing, though this varies by JVM and settings). The practical guidance: prefer recursion when it substantially clarifies the solution and the expected depth is bounded and modest; prefer iteration when depth could be large or unbounded, or when the recursive structure adds no real clarity.`,
        },
        {
          heading: `Fibonacci: Naive Recursion and Exponential Blowup`,
          body: `The naive recursive Fibonacci implementation is the textbook example of recursion done inefficiently: fib(n) calls fib(n-1) and fib(n-2), but because those two calls' subtrees overlap heavily (fib(n-2) is recomputed independently inside both fib(n-1)'s subtree and directly), the total number of calls grows exponentially, O(2^n), recomputing the exact same subproblems an exponentially growing number of times. This inefficiency isn't a flaw of recursion itself but of not caching (memoizing) results for subproblems already solved — adding a simple cache reduces it to O(n) time, foreshadowing the entire dynamic-programming module ahead.`,
          code: {
            language: `java`,
            code: `// Naive: O(2^n) time -- fib(2) alone is recomputed thousands of times for even moderate n
public static long fibNaive(int n) {
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// Memoized: O(n) time, O(n) space -- each subproblem computed exactly once
public static long fibMemo(int n, Map<Integer, Long> cache) {
    if (n <= 1) return n;
    if (cache.containsKey(n)) return cache.get(n);   // already solved -- reuse it
    long result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
    cache.put(n, result);
    return result;
}`,
          },
        },
        {
          heading: `Tail Recursion — and Why It Doesn't Help in Java`,
          body: `A tail-recursive function's recursive call is the very last action it performs, with no pending work (like the multiplication in factorial) left to do after the call returns — in languages with tail-call optimization, the compiler/runtime can reuse the current stack frame for the recursive call instead of pushing a new one, turning the recursion into constant stack space, effectively as efficient as a loop. The Java Virtual Machine, notably, does NOT perform tail-call optimization (even for a function rewritten in tail-recursive style), so a tail-recursive Java function still consumes O(depth) stack space and can still StackOverflowError on deep input — for genuinely deep recursion in Java, either convert to an explicit iterative loop or use an explicit stack-based simulation.`,
        },
        {
          heading: `Backtracking: Recursion with Explicit Choice and Undo`,
          body: `Backtracking is recursion applied to problems that explore a decision tree of choices — at each recursive call, try a choice, recurse into the consequences of that choice, and if it doesn't lead to a valid solution, undo the choice (backtrack) and try the next one. The recursive case doesn't just shrink toward a base case; it also mutates and restores shared state (adding an element to a "current path," then removing it after the recursive call returns) — this "do, recurse, undo" rhythm is the hallmark of every backtracking solution, from generating permutations to solving a Sudoku board, and it's covered in depth as an application of trees/graphs and DP-adjacent thinking in the DSA Advanced module.`,
          code: {
            language: `java`,
            code: `// Generate all subsets of a set -- classic backtracking skeleton
public static void subsets(int[] nums, int index, List<Integer> current, List<List<Integer>> result) {
    if (index == nums.length) {
        result.add(new ArrayList<>(current));   // base case -- record this complete choice
        return;
    }
    current.add(nums[index]);                   // choose: include nums[index]
    subsets(nums, index + 1, current, result);
    current.remove(current.size() - 1);          // un-choose: backtrack before trying "exclude"
    subsets(nums, index + 1, current, result);   // choose: exclude nums[index]
}
// Time: O(2^n) -- 2^n possible subsets, each built in O(n), so O(n * 2^n) overall`,
          },
        },
      ],
      commonPitfalls: [
        `Forgetting the base case entirely, or writing a recursive case that doesn't provably shrink toward it, causing a StackOverflowError.`,
        `Assuming Java optimizes tail recursion the way some functional languages do — it does not, and deep tail-recursive calls still risk overflowing the stack.`,
        `Writing naive recursive Fibonacci (or similar overlapping-subproblem recursion) without memoization and being surprised by exponential O(2^n) runtime on modest inputs.`,
        `Forgetting to "undo" a choice (backtrack) after a recursive call in a backtracking solution, leaving shared mutable state corrupted for subsequent branches.`,
        `Choosing recursion for a problem with potentially very deep or unbounded depth, when an iterative approach with an explicit stack would avoid the overflow risk entirely.`,
        `Mutating a shared collection passed by reference across recursive calls without adding a defensive copy at the point results are actually recorded (as in the subset-generation example).`,
        `Miscounting the space complexity of a recursive algorithm — forgetting that O(depth) stack frames are alive simultaneously counts as real space, not "free."`,
      ],
      keyTakeaways: [
        `Every recursive function needs a base case and a recursive case that provably moves toward it — omitting either risks infinite recursion and a StackOverflowError.`,
        `The call stack visualizes recursion as a "winding" phase (calls stacking up) followed by an "unwinding" phase (pending work executing as control returns).`,
        `Naive recursive Fibonacci is O(2^n) due to massively overlapping subproblems; memoization reduces it to O(n) — this is dynamic programming's core idea in miniature.`,
        `Java does not optimize tail recursion — a tail-recursive function still uses O(depth) stack space and can still overflow.`,
        `Backtracking is recursion structured as "choose, recurse, undo" — the undo step is what makes it correctly explore every branch of the decision tree.`,
        `A recursive algorithm's space complexity includes its call-stack depth, not just any explicit data structures it allocates.`,
      ],
      links: [
        { label: `GeeksforGeeks — Recursion in Java`, url: `https://www.geeksforgeeks.org/java/recursion-in-java/` },
        { label: `GeeksforGeeks — Recursive Fibonacci and Memoization`, url: `https://www.geeksforgeeks.org/dsa/program-for-nth-fibonacci-number/` },
        { label: `GeeksforGeeks — Backtracking Algorithms`, url: `https://www.geeksforgeeks.org/dsa/backtracking-algorithms/` },
      ],
    },
    {
      moduleTitle: `DSA Fundamentals`,
      subModuleTitle: `Time/space complexity`,
      overview: `Big-O notation is the common language interviewers use to evaluate whether a solution is actually good, independent of the specific programming language or hardware it runs on — and being unable to state your own solution's complexity correctly, unprompted, is one of the fastest ways to lose credibility in a technical interview even when the code itself works. This guide covers Big-O, Big-Theta, and Big-Omega formally but briefly, the common complexity classes ranked from best to worst with concrete examples of each, how to analyze nested loops and recursive functions (including recurrence relations) to derive their complexity, the distinction between auxiliary space and total space (and why recursive call-stack depth counts as real space), amortized analysis using ArrayList's dynamic resizing as the running example, and a practical reference table mapping common Java operations to their actual complexity.`,
      sections: [
        {
          heading: `Big-O, Big-Theta, and Big-Omega`,
          body: `Big-O (O) describes an upper bound on growth rate — "this algorithm never does worse than this" — and is what's almost universally meant in casual interview conversation when someone says "the complexity is O(n)." Big-Omega (Ω) describes a lower bound — the best case, or a guarantee the algorithm can't do better than. Big-Theta (Θ) describes a tight bound where the upper and lower bounds match, meaning the algorithm's growth rate is precisely characterized, not just bounded from one side. In practice, most interview conversations use "Big-O" loosely to mean the tight bound (Θ) of the typical or worst case, and that casual usage is fine as long as you understand what the more precise notation actually distinguishes if asked directly.`,
        },
        {
          heading: `Common Complexity Classes, Ranked`,
          body: `Recognizing which complexity class a piece of code falls into at a glance — from the structure of its loops and recursive calls, without needing to trace through execution — is a core interview skill, and the classes below are worth memorizing in order alongside a canonical example of each.`,
          bullets: [
            `O(1) constant — array index access, HashMap get/put (average case).`,
            `O(log n) logarithmic — binary search, balanced binary search tree operations.`,
            `O(n) linear — a single pass through an array, linear search.`,
            `O(n log n) linearithmic — efficient comparison-based sorting (mergesort, heapsort, Java's Arrays.sort for objects).`,
            `O(n²) quadratic — nested loops over the same input, naive pair-checking, bubble/insertion/selection sort.`,
            `O(2^n) exponential — naive recursive Fibonacci, generating all subsets of a set.`,
            `O(n!) factorial — generating all permutations of a set, brute-force traveling salesman.`,
          ],
        },
        {
          heading: `Analyzing Loops and Nested Loops`,
          body: `A single loop that runs n times, doing O(1) work per iteration, is O(n) overall — the complexity is the iteration count times the per-iteration cost. Two independent (sequential, not nested) loops each running n times is still O(n) + O(n) = O(2n), which simplifies to O(n), since Big-O drops constant multipliers. Two nested loops, where the inner loop runs n times for each of the outer loop's n iterations, is O(n) × O(n) = O(n²) — the multiplication (not addition) is the key insight, and it generalizes directly: k levels of nesting, each running n times, gives O(n^k).`,
          code: {
            language: `java`,
            code: `// O(n) -- single pass
for (int i = 0; i < n; i++) { /* O(1) work */ }

// O(n) -- two SEQUENTIAL loops, not nested: O(n) + O(n) = O(2n) = O(n)
for (int i = 0; i < n; i++) { /* ... */ }
for (int j = 0; j < n; j++) { /* ... */ }

// O(n^2) -- NESTED: inner loop runs n times for EACH of the outer loop's n iterations
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) { /* O(1) work */ }
}`,
          },
        },
        {
          heading: `Analyzing Recursive Complexity with Recurrence Relations`,
          body: `A recursive function's time complexity is expressed as a recurrence relation — an equation defining the cost of solving a problem of size n in terms of the cost of solving smaller subproblems, plus the work done to combine them. factorial(n) calls itself once on a problem of size n-1 with O(1) extra work, giving T(n) = T(n-1) + O(1), which resolves to O(n). Binary search calls itself once on a problem of HALF the size with O(1) extra work, giving T(n) = T(n/2) + O(1), which resolves to O(log n) — the halving is exactly why binary search is logarithmic. A classic divide-and-conquer sort like mergesort calls itself TWICE on half-sized problems, plus O(n) work to merge the results, giving T(n) = 2T(n/2) + O(n), which resolves to O(n log n) via the Master Theorem.`,
        },
        {
          heading: `Auxiliary Space vs. Total Space, and Recursive Stack Space`,
          body: `Space complexity has two components worth distinguishing precisely: input space (memory the input itself already occupies, usually not counted) and auxiliary space (extra memory the algorithm allocates beyond the input — new arrays, hash maps, or recursive call-stack frames). A recursive function's auxiliary space includes its maximum call-stack depth, since every active call's frame occupies real memory simultaneously — naive recursive factorial(n) is O(n) auxiliary space from n stack frames, even though it allocates no explicit data structure at all, a point candidates frequently miss when asked for space complexity.`,
        },
        {
          heading: `Amortized Analysis: ArrayList's Dynamic Resizing`,
          body: `Amortized analysis answers "what's the average cost per operation across a long sequence of operations," even when individual operations vary wildly in cost — the canonical example is ArrayList.add(), which is usually O(1) (there's room in the backing array) but occasionally O(n) (the backing array is full and must be reallocated to a larger size, with every existing element copied over). Because array doubling means the expensive O(n) resize happens exponentially less often as the list grows, the total cost of n additions sums to O(n), making the amortized cost per add() exactly O(1) — this is why "ArrayList.add() is O(1)" is the standard, correct answer despite individual worst-case calls being O(n).`,
        },
        {
          heading: `A Practical Complexity Reference Table`,
          body: `Interviewers expect instant recall of these specific numbers for Java's standard library types, since misstating one (like claiming ArrayList.contains() is O(1)) is a red flag that undermines confidence in every other claim you make about a solution's efficiency.`,
          bullets: [
            `ArrayList: get(i) O(1), add(end) O(1) amortized, add(index)/remove(index) O(n), contains() O(n).`,
            `LinkedList: get(i) O(n), add/remove at a known node O(1), contains() O(n).`,
            `HashMap/HashSet: get/put/contains O(1) average, O(n) worst case (before Java 8 treeification), O(log n) worst case since Java 8.`,
            `TreeMap/TreeSet: get/put/contains O(log n), always — no average/worst-case distinction due to the underlying balanced tree.`,
            `Arrays.sort(): O(n log n) for objects (a stable, TimSort-derived algorithm); Dual-Pivot Quicksort O(n log n) average for primitives.`,
            `Arrays.binarySearch(): O(log n), but only valid on an already-sorted array.`,
          ],
        },
      ],
      commonPitfalls: [
        `Stating a nested loop's complexity as O(n) instead of O(n²) by forgetting that nested (not sequential) loops multiply, not add.`,
        `Forgetting that a recursive function's call-stack depth counts as auxiliary space, understating an algorithm's actual space complexity.`,
        `Claiming ArrayList.add() is "always O(1)" without the word "amortized," missing the occasional O(n) resize cost that the amortized analysis accounts for.`,
        `Claiming HashMap operations are "always O(1)" without qualifying "average case" — worst case is O(log n) since Java 8's treeification (or O(n) before it).`,
        `Confusing O(n log n) and O(n²) when quickly assessing a nested-loop-plus-sort solution, especially under interview time pressure.`,
        `Assuming Big-O captures real-world performance directly — an O(n) algorithm with a large constant factor can be slower in practice than an O(n log n) algorithm with a small one, for realistic input sizes.`,
        `Not simplifying complexity expressions — writing O(2n + 3) instead of the simplified O(n), which is what interviewers expect as the final answer.`,
      ],
      keyTakeaways: [
        `Big-O is an upper bound, Big-Omega a lower bound, Big-Theta a tight bound — casual interview usage of "Big-O" usually means the tight bound of the typical/worst case.`,
        `Sequential loops add their complexities (O(n) + O(n) = O(n)); nested loops multiply them (O(n) × O(n) = O(n²)).`,
        `A recursive function's complexity is found by writing its recurrence relation — T(n) = T(n/2) + O(1) gives O(log n); T(n) = 2T(n/2) + O(n) gives O(n log n).`,
        `Auxiliary space includes recursive call-stack depth, not just explicitly allocated data structures.`,
        `Amortized analysis explains why ArrayList.add() is correctly described as O(1) despite occasional O(n) resize operations.`,
        `Memorize the standard Java collection complexity table (ArrayList, LinkedList, HashMap, TreeMap) cold — it's assumed baseline knowledge in interviews.`,
      ],
      links: [
        { label: `GeeksforGeeks — Analysis of Algorithms (Big-O, Big-Omega, Big-Theta)`, url: `https://www.geeksforgeeks.org/dsa/analysis-of-algorithms/` },
        { label: `GeeksforGeeks — Time Complexity of Java Collections`, url: `https://www.geeksforgeeks.org/java/time-complexities-of-different-data-structures-in-java/` },
        { label: `GeeksforGeeks — Amortized Analysis`, url: `https://www.geeksforgeeks.org/dsa/amortized-analysis-introduction/` },
      ],
    },
    {
      moduleTitle: `DSA Advanced`,
      subModuleTitle: `Trees & graphs`,
      overview: `Trees and graphs generalize the linear structures covered so far into branching and networked relationships, and traversing them correctly — knowing precisely when to reach for BFS versus DFS, and being able to implement both from memory — is one of the most frequently tested skills in placement interviews, since a huge share of "real" interview problems (file systems, social networks, dependency graphs, org charts) are trees or graphs in disguise. This guide covers binary tree structure and all four traversal orders, binary search tree (BST) properties and operations, a brief look at self-balancing trees, the two standard graph representations (adjacency list versus adjacency matrix) and when each is preferable, BFS and DFS on graphs with full Java implementations, and the classic applications — shortest path in an unweighted graph via BFS, and cycle detection — that come up constantly as standalone interview questions.`,
      sections: [
        {
          heading: `Binary Tree Structure and Traversal Orders`,
          body: `A binary tree node holds a value plus references to at most two children (left and right); traversal visits every node exactly once but in an order that depends on when a node is "visited" relative to its children. Inorder (left, node, right) visits a BST's nodes in sorted order — a uniquely important property. Preorder (node, left, right) visits the root first, useful for copying/serializing a tree's structure. Postorder (left, right, node) visits children before the parent, useful when children must be fully processed before the parent (like computing subtree sizes, or safely deleting a tree bottom-up). Level-order (breadth-first, level by level) uses a queue rather than the recursive call stack the other three implicitly rely on.`,
          code: {
            language: `java`,
            code: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public static void inorder(TreeNode node, List<Integer> result) {
    if (node == null) return;          // base case
    inorder(node.left, result);
    result.add(node.val);              // visit AFTER left, BEFORE right
    inorder(node.right, result);
}
// For a valid BST, inorder traversal always produces sorted output -- O(n) time, O(h) space (h = height)`,
          },
        },
        {
          heading: `Binary Search Tree (BST) Properties and Operations`,
          body: `A BST maintains the invariant that every node's left subtree contains only smaller values and its right subtree contains only larger values, recursively, at every level — this property is what makes search, insertion, and deletion all achievable in O(h) time, where h is the tree's height, by discarding half the remaining search space at each step (analogous to binary search on a sorted array). Critically, h equals O(log n) only for a balanced tree; a degenerate BST built by inserting already-sorted data collapses into a linked list, making h = O(n) and every operation O(n) — this degenerate case is exactly why self-balancing trees exist.`,
          code: {
            language: `java`,
            code: `// BST search -- O(h) time, O(1) space (iterative)
public static boolean search(TreeNode root, int target) {
    TreeNode current = root;
    while (current != null) {
        if (current.val == target) return true;
        current = target < current.val ? current.left : current.right;   // discard half the tree each step
    }
    return false;
}`,
          },
        },
        {
          heading: `Self-Balancing Trees (Brief)`,
          body: `An AVL tree keeps every node's left and right subtree heights within 1 of each other, rebalancing via rotations after every insertion/deletion to guarantee O(log n) height at all times, making it slightly more rigidly balanced (and therefore faster for lookups) than a Red-Black tree, which allows more slack in exchange for cheaper rebalancing on writes. You are not expected to implement either from scratch in most interviews, but you should know they exist, why they exist (to prevent the degenerate O(n)-height case), and that Java's TreeMap/TreeSet are themselves backed by a Red-Black tree internally — which is exactly why they guarantee O(log n) operations regardless of insertion order.`,
        },
        {
          heading: `Graph Representations: Adjacency List vs. Adjacency Matrix`,
          body: `An adjacency list stores, for each vertex, a list of its directly connected neighbors — space-efficient at O(V + E) for a graph with V vertices and E edges, and efficient for iterating a vertex's neighbors (exactly its degree), making it the default choice for most graph problems, especially sparse graphs. An adjacency matrix stores a V×V grid where matrix[i][j] indicates whether an edge exists between vertex i and j — O(V²) space regardless of how many edges actually exist, but O(1) to check whether a specific edge exists, which an adjacency list can only answer in O(degree) time. The practical rule: use adjacency list for sparse graphs and most traversal-based problems; use adjacency matrix when frequent O(1) edge-existence checks matter more than memory, or the graph is dense (E close to V²).`,
          code: {
            language: `java`,
            code: `// Adjacency list -- the default choice for most problems
Map<Integer, List<Integer>> graph = new HashMap<>();
graph.computeIfAbsent(0, k -> new ArrayList<>()).add(1);   // edge 0 -> 1
graph.computeIfAbsent(0, k -> new ArrayList<>()).add(2);   // edge 0 -> 2`,
          },
        },
        {
          heading: `BFS: Level-by-Level Traversal`,
          body: `Breadth-first search explores a graph level by level, visiting all neighbors of the current node before moving to any of their neighbors, implemented with a queue and a visited set to avoid revisiting nodes (essential in graphs, which — unlike trees — can contain cycles). BFS is the standard algorithm for finding the shortest path in an unweighted graph, because the first time BFS reaches a given node is guaranteed to be via a shortest possible path from the source, a guarantee DFS does not provide.`,
          code: {
            language: `java`,
            code: `// BFS -- O(V + E) time, O(V) space
public static List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
    List<Integer> order = new ArrayList<>();
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new ArrayDeque<>();

    queue.offer(start);
    visited.add(start);

    while (!queue.isEmpty()) {
        int node = queue.poll();
        order.add(node);
        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);   // mark visited AT ENQUEUE time, not at dequeue time
                queue.offer(neighbor);
            }
        }
    }
    return order;
}`,
          },
        },
        {
          heading: `DFS: Depth-First Exploration`,
          body: `Depth-first search explores as far as possible down one path before backtracking, implemented either recursively (using the call stack implicitly) or iteratively with an explicit stack — both visit the same set of nodes overall but in a different order than BFS. DFS is preferred for problems about a path's existence or structure (does a path exist at all, topological sorting, detecting a cycle, exploring all of a connected component) rather than shortest-path problems, where BFS's level-by-level guarantee is what's actually needed.`,
          code: {
            language: `java`,
            code: `// DFS (recursive) -- O(V + E) time, O(V) space (including call stack)
public static void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited, List<Integer> order) {
    if (visited.contains(node)) return;
    visited.add(node);
    order.add(node);
    for (int neighbor : graph.getOrDefault(node, List.of())) {
        dfs(graph, neighbor, visited, order);
    }
}`,
          },
        },
        {
          heading: `Cycle Detection in a Graph`,
          body: `Detecting a cycle in an undirected graph via DFS checks, for each visited neighbor, whether it's the node's immediate parent (which is expected and not a cycle) or some other already-visited node (which IS a cycle, since reaching an already-visited non-parent node means there are two distinct paths to it). Detecting a cycle in a directed graph is different and requires tracking nodes currently "in progress" on the current DFS path (not just visited overall) — reaching a node that's in-progress on the current path (not merely visited previously via a different path) is what actually proves a directed cycle, since visiting an already-fully-processed node elsewhere in the graph is completely normal in a DAG.`,
        },
      ],
      commonPitfalls: [
        `Using DFS to find a shortest path in an unweighted graph — only BFS guarantees the first-reached path is shortest; DFS gives no such guarantee.`,
        `Forgetting the visited set in a graph traversal (fine to omit in a tree, which has no cycles), causing infinite loops on a graph that contains a cycle.`,
        `Marking a node visited at dequeue time instead of enqueue time in BFS, which can enqueue the same node multiple times before it's first processed.`,
        `Assuming BST operations are O(log n) unconditionally, forgetting a degenerate (unbalanced) BST built from sorted input collapses to O(n) height.`,
        `Confusing undirected-graph cycle detection (check for a non-parent visited neighbor) with directed-graph cycle detection (check for a node currently in-progress on the DFS path).`,
        `Choosing an adjacency matrix for a large, sparse graph, wasting O(V²) space when an adjacency list would use only O(V + E).`,
        `Forgetting that a recursive DFS's space complexity includes call-stack depth (up to O(V) in the worst case, e.g. a long path), not just the explicit visited set.`,
      ],
      keyTakeaways: [
        `Inorder traversal of a BST produces sorted output — a uniquely useful property among the four traversal orders.`,
        `BST search/insert/delete are O(h); h is O(log n) only when the tree is balanced — a degenerate BST from sorted input is O(n) height.`,
        `Adjacency list (O(V+E) space) suits sparse graphs and most traversal problems; adjacency matrix (O(V²) space, O(1) edge lookup) suits dense graphs or frequent edge-existence checks.`,
        `BFS guarantees the shortest path in an unweighted graph; DFS does not — pick the traversal based on what the problem actually needs.`,
        `Both BFS and DFS run in O(V + E) time; always track visited nodes explicitly in a graph to avoid infinite loops from cycles.`,
        `Directed-graph cycle detection needs an "in current path" marker distinct from a general "visited" marker; undirected-graph cycle detection just needs to exclude the immediate parent.`,
      ],
      links: [
        { label: `GeeksforGeeks — Tree Traversals (Inorder, Preorder, Postorder)`, url: `https://www.geeksforgeeks.org/dsa/tree-traversals-inorder-preorder-and-postorder/` },
        { label: `GeeksforGeeks — BFS vs DFS`, url: `https://www.geeksforgeeks.org/dsa/bfs-vs-dfs-for-binary-tree/` },
        { label: `GeeksforGeeks — Detect Cycle in a Graph`, url: `https://www.geeksforgeeks.org/dsa/detect-cycle-in-a-graph/` },
      ],
    },
    {
      moduleTitle: `DSA Advanced`,
      subModuleTitle: `Dynamic programming`,
      overview: `Dynamic programming (DP) systematically solves problems that exhibit overlapping subproblems (the same smaller problem is solved repeatedly) and optimal substructure (an optimal solution can be built from optimal solutions to its subproblems) by solving each distinct subproblem exactly once and reusing the result, turning what would otherwise be exponential brute-force recursion into polynomial time. This guide covers the two implementation styles — memoization (top-down, recursion plus a cache) and tabulation (bottom-up, filling a table iteratively) — through classic 1D examples (Fibonacci, climbing stairs) and classic 2D examples (0/1 knapsack, longest common subsequence), a general framework for identifying a DP state and its transition, and space-optimization techniques that reduce a DP table's memory footprint once you notice each state only depends on a limited window of previous states. DP is consistently ranked among the hardest interview topics, precisely because the hard part is recognizing the state and transition, not writing the loop once you have them.`,
      sections: [
        {
          heading: `Overlapping Subproblems and Optimal Substructure`,
          body: `A problem has overlapping subproblems if a naive recursive solution solves the identical smaller subproblem many times — naive Fibonacci recomputes fib(2) thousands of times for even moderate n, which is the direct signal that caching would help. A problem has optimal substructure if its optimal solution can be constructed directly from optimal solutions to its subproblems — the shortest path from A to C through B is the shortest path A-to-B plus the shortest path B-to-C, with no need to consider non-optimal sub-paths. Both properties together are DP's precondition: without overlapping subproblems, there's nothing to cache and gain from; without optimal substructure, combining subproblem answers wouldn't produce a correct overall answer.`,
        },
        {
          heading: `Memoization: Top-Down DP`,
          body: `Memoization keeps the natural recursive structure of the brute-force solution but adds a cache (an array or HashMap keyed by the subproblem's parameters), checking the cache before doing any recursive work and storing the result before returning — this is usually the easiest DP style to derive, since you start from a correct (if slow) recursive brute force and add exactly one change: cache-check-then-store. Its main costs relative to tabulation are the overhead of recursive calls and, for deep recursion, call-stack space that a purely iterative tabulation approach avoids entirely.`,
          code: {
            language: `java`,
            code: `// Climbing Stairs: how many distinct ways to climb n stairs, taking 1 or 2 steps at a time
// Memoized (top-down) -- O(n) time, O(n) space (cache + call stack)
public static int climbStairs(int n, Map<Integer, Integer> cache) {
    if (n <= 2) return n;   // base cases: 1 way for 1 stair, 2 ways for 2 stairs
    if (cache.containsKey(n)) return cache.get(n);
    int ways = climbStairs(n - 1, cache) + climbStairs(n - 2, cache);
    cache.put(n, ways);
    return ways;
}`,
          },
        },
        {
          heading: `Tabulation: Bottom-Up DP`,
          body: `Tabulation builds a table iteratively from the smallest base-case subproblems up to the final answer, with no recursion at all — each table entry is computed once, directly from already-filled earlier entries, guaranteeing every subproblem is solved in a fixed, predictable order with no call-stack overhead. This style is typically the same time complexity as its memoized counterpart, but strictly better space complexity when recursion depth would otherwise be significant, and it's usually preferred in production and competitive settings for that reason, even though memoization is often easier to derive first.`,
          code: {
            language: `java`,
            code: `// Climbing Stairs -- Tabulated (bottom-up) -- O(n) time, O(n) space
public static int climbStairsTabulated(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[1] = 1;
    dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];   // this state depends only on the previous two
    }
    return dp[n];
}`,
          },
        },
        {
          heading: `Classic 2D DP: 0/1 Knapsack`,
          body: `The 0/1 knapsack problem asks: given items each with a weight and value, and a knapsack with a maximum weight capacity, which subset of items (each either fully included or fully excluded — no fractional items, hence "0/1") maximizes total value without exceeding capacity? The DP state dp[i][w] represents "the maximum value achievable using only the first i items with capacity w," and its transition considers two choices for item i: exclude it (dp[i-1][w]) or include it if it fits (its value plus dp[i-1][w - weight[i]]) — taking the better of the two.`,
          code: {
            language: `java`,
            code: `// 0/1 Knapsack -- O(n * capacity) time and space
public static int knapsack(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[][] dp = new int[n + 1][capacity + 1];   // dp[i][w] = max value using first i items, capacity w

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            dp[i][w] = dp[i - 1][w];                                  // choice 1: exclude item i
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i][w],
                    values[i - 1] + dp[i - 1][w - weights[i - 1]]);   // choice 2: include item i
            }
        }
    }
    return dp[n][capacity];
}`,
          },
        },
        {
          heading: `Classic 2D DP: Longest Common Subsequence (LCS)`,
          body: `LCS asks for the length of the longest sequence of characters that appears (in order, not necessarily contiguously) in both of two given strings — used directly in diff tools and version control merge algorithms. The state dp[i][j] represents "the LCS length of the first i characters of string A and the first j characters of string B," and the transition is: if the current characters match, extend the diagonal LCS by one (dp[i-1][j-1] + 1); if they don't match, take the best of skipping a character from either string (max(dp[i-1][j], dp[i][j-1])).`,
          code: {
            language: `java`,
            code: `// Longest Common Subsequence -- O(m * n) time and space
public static int lcs(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;             // characters match -- extend diagonally
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);   // skip a character from either string
            }
        }
    }
    return dp[m][n];
}`,
          },
        },
        {
          heading: `A General Framework for Identifying State and Transition`,
          body: `Approaching an unfamiliar DP problem systematically means answering three questions in order: what does a state represent (usually one or two indices/parameters that fully describe a subproblem, like "first i items with capacity w"), what are the base cases (the smallest states, answerable directly with no further breakdown), and what is the transition (how does a state's answer derive from smaller/previous states — usually a small number of explicit choices, each evaluated and the best one kept). Writing this out explicitly in words before writing any code is the single highest-leverage habit for DP interview problems, since a correct state definition makes the code almost mechanical, while a wrong one makes debugging nearly impossible.`,
        },
        {
          heading: `Space Optimization: Rolling Arrays`,
          body: `Many 2D DP solutions only ever read from the immediately previous row (or a small fixed window of previous rows/columns) to compute the current one — knapsack's dp[i][w] only depends on row i-1, and LCS's dp[i][j] only depends on row i-1 and the current row's already-computed dp[i][j-1]. Recognizing this lets you collapse a 2D table into one or two 1D arrays (a "rolling array"), reducing space from O(n·m) to O(m), which is both a genuine performance improvement and a common interview follow-up question ("can you reduce the space complexity?") once a correct 2D solution is presented.`,
        },
      ],
      commonPitfalls: [
        `Jumping straight to code without first writing out the DP state and transition in words, leading to a table whose indices don't actually correspond to a well-defined subproblem.`,
        `Confusing 0/1 knapsack (each item used at most once) with the unbounded knapsack variant (items can be reused), applying the wrong transition and iteration order.`,
        `Off-by-one errors between a DP table's 1-indexed convention (common for cleanly handling the "zero items/characters" base case) and 0-indexed input arrays/strings.`,
        `Missing that a correct memoized (top-down) solution and its tabulated (bottom-up) equivalent should have the same time complexity — if they differ, one of the two has a bug.`,
        `Not attempting the space-optimization follow-up (rolling arrays) when explicitly asked, despite the 2D solution only ever needing the previous row.`,
        `Applying a greedy approach to a problem that actually requires DP (like 0/1 knapsack, where greedy-by-value-density fails once items can't be fractionally split) — see the Greedy Algorithms submodule for exactly when greedy breaks down.`,
        `Forgetting to initialize base cases in a tabulated solution correctly, producing subtly wrong results for small inputs even though the general transition logic is correct.`,
      ],
      keyTakeaways: [
        `DP applies when a problem has both overlapping subproblems (naive recursion repeats work) and optimal substructure (optimal answers compose from optimal subanswers).`,
        `Memoization (top-down) adds a cache to a natural recursive solution; tabulation (bottom-up) fills a table iteratively — same time complexity, tabulation usually better space.`,
        `Always define the DP state and transition explicitly in words before coding — this is the actual hard part of a DP problem, not the loop itself.`,
        `0/1 Knapsack and Longest Common Subsequence are the two most important 2D DP patterns to know cold — many other problems are variations on them.`,
        `A DP state that only depends on the previous row (or a small window) can be space-optimized from O(n·m) to O(m) with a rolling array.`,
        `Greedy algorithms can fail where DP succeeds — knapsack is the textbook example of a problem greedy alone cannot solve correctly.`,
      ],
      links: [
        { label: `GeeksforGeeks — Dynamic Programming`, url: `https://www.geeksforgeeks.org/dsa/dynamic-programming/` },
        { label: `GeeksforGeeks — 0/1 Knapsack Problem`, url: `https://www.geeksforgeeks.org/dsa/0-1-knapsack-problem-dp-10/` },
        { label: `GeeksforGeeks — Longest Common Subsequence`, url: `https://www.geeksforgeeks.org/dsa/longest-common-subsequence-dp-4/` },
      ],
    },
    {
      moduleTitle: `DSA Advanced`,
      subModuleTitle: `Greedy algorithms`,
      overview: `A greedy algorithm builds a solution incrementally by always making the choice that looks best right now, without reconsidering that choice later — and the entire skill of this topic is knowing precisely which problems this locally-optimal strategy actually solves correctly versus which ones it silently gets wrong. This guide covers the two properties (greedy choice property and optimal substructure) that must both hold for a greedy algorithm to be provably correct, worked examples of activity selection (interval scheduling) and coin change (with an explicit warning about when the greedy coin-change approach fails), a brief introduction to Huffman coding as a real-world greedy application, the exchange-argument technique for informally justifying why a greedy choice is safe, and a direct comparison against dynamic programming — since confusing when to reach for greedy versus DP is one of the most common conceptual errors at this level.`,
      sections: [
        {
          heading: `The Greedy Choice Property and Optimal Substructure`,
          body: `A problem is solvable by a greedy algorithm only if it has the greedy choice property — a globally optimal solution can always be reached by making a locally optimal (greedy) choice first, without ever needing to reconsider or undo that choice later — combined with optimal substructure, the same requirement DP relies on. The greedy choice property is the stricter, more fragile requirement: many problems have optimal substructure (DP works) but lack the greedy choice property (a locally best choice can lead to a globally worse outcome), which is exactly why DP is a strictly more general technique than greedy, and why greedy should be viewed as an optimization available only when you can specifically justify it, not a default first approach.`,
        },
        {
          heading: `Worked Example: Activity Selection (Interval Scheduling)`,
          body: `Given a set of activities, each with a start and end time, and a single resource that can only do one activity at a time, activity selection asks for the maximum number of non-overlapping activities that can be scheduled. The greedy strategy — sort activities by end time, then repeatedly pick the next activity whose start time is not earlier than the previously selected activity's end time — is provably optimal: choosing the activity that finishes earliest always leaves the maximum possible remaining time for scheduling further activities, which is the exchange-argument intuition for why this greedy choice never costs you anything compared to any other valid first choice.`,
          code: {
            language: `java`,
            code: `// Activity Selection -- greedy by earliest finish time -- O(n log n) time (dominated by the sort)
public static int maxActivities(int[][] activities) {   // each row: {start, end}
    Arrays.sort(activities, (a, b) -> a[1] - b[1]);      // sort by END time
    int count = 1;
    int lastEnd = activities[0][1];

    for (int i = 1; i < activities.length; i++) {
        if (activities[i][0] >= lastEnd) {   // this activity starts after (or when) the last one ended
            count++;
            lastEnd = activities[i][1];
        }
    }
    return count;
}
// Time: O(n log n) -- sorting dominates; Space: O(1) extra (ignoring the sort's own space)`,
          },
        },
        {
          heading: `Worked Example: Coin Change — Where Greedy Works, and Where It Fails`,
          body: `The greedy coin-change strategy — always take the largest denomination coin that doesn't exceed the remaining amount — correctly produces the minimum number of coins for "canonical" coin systems like US currency (1, 5, 10, 25), but it FAILS for arbitrary denominations: with coins {1, 3, 4}, greedy makes change for 6 as 4+1+1 (three coins), while the actual optimal answer is 3+3 (two coins). This single counterexample is exactly why interviewers ask about coin change specifically — it's the clearest, most memorable demonstration that greedy is not universally correct, and that the correct general-purpose solution for arbitrary denominations is dynamic programming, not greedy.`,
          code: {
            language: `java`,
            code: `// Greedy coin change -- WORKS for canonical systems, WRONG for arbitrary denominations
public static int greedyCoinCount(int[] denominations, int amount) {   // denominations sorted descending
    int count = 0;
    for (int coin : denominations) {
        count += amount / coin;
        amount %= coin;
    }
    return amount == 0 ? count : -1;
}
// greedyCoinCount({4, 3, 1}, 6) -- gives 4+1+1 = 3 coins, but 3+3 = 2 coins is optimal.
// Correct general solution: dynamic programming (see the Dynamic Programming submodule).`,
          },
        },
        {
          heading: `Huffman Coding: A Real-World Greedy Application`,
          body: `Huffman coding builds an optimal prefix-free binary encoding for a set of characters based on their frequencies, by repeatedly taking the two least-frequent remaining nodes from a priority queue (min-heap) and merging them into a new combined node, until only one node — the encoding tree's root — remains. This greedy strategy is provably optimal (it minimizes the total encoded length) and is a real, still-used building block inside compression formats like ZIP and JPEG, making it one of the few classroom greedy algorithms with immediate, direct industrial relevance rather than being purely a teaching example.`,
        },
        {
          heading: `The Exchange Argument: Informally Justifying a Greedy Choice`,
          body: `An exchange argument is the standard technique for informally proving a greedy strategy correct: assume some optimal solution doesn't make the greedy choice, then show that "exchanging" that solution's first choice for the greedy choice produces another solution that's at least as good — since this can be repeated for every deviation from greedy, an optimal solution matching greedy's choices must exist. For activity selection, the exchange argument is: if an optimal schedule's first activity doesn't finish earliest, swap it for the one that does — this swap can only free up more time for the remaining schedule, never less, so the swapped schedule is still optimal. Being able to sketch this kind of argument, even informally, is what separates "I think greedy works here" from "I can show greedy works here" in an interview setting.`,
        },
        {
          heading: `Greedy vs. Dynamic Programming: When to Reach for Which`,
          body: `Both techniques build a solution from smaller subproblems, but greedy commits to one choice per step and never revisits it, while DP considers all valid choices at each step and remembers the best outcome for every possible subproblem state, which is strictly more powerful but also strictly more expensive. The practical decision process: try to find and justify a greedy strategy first (often via an exchange argument or a clear intuitive reason a locally best choice can't hurt); if you can construct a counterexample where the greedy choice leads to a suboptimal overall result (as coin change with denominations {1,3,4} demonstrates), that's proof greedy doesn't apply and you need DP instead.`,
        },
      ],
      commonPitfalls: [
        `Assuming greedy works for coin change with arbitrary denominations — it only works for canonical coin systems; the general problem requires DP.`,
        `Applying a greedy strategy without being able to justify why the locally optimal choice can never lead to a worse global outcome (no exchange-argument reasoning).`,
        `Confusing "has optimal substructure" (necessary for both greedy and DP) with "has the greedy choice property" (necessary for greedy specifically, and much rarer).`,
        `Sorting activities by start time instead of end time for activity selection — sorting by start time does not produce the correct greedy strategy.`,
        `Assuming a greedy algorithm that works on a small example generalizes correctly, without testing a potential adversarial counterexample.`,
        `Reaching for greedy as a default "simpler" first attempt on a problem that's actually 0/1 knapsack or a DP variant, wasting time before realizing greedy fails on it.`,
      ],
      keyTakeaways: [
        `Greedy requires both optimal substructure AND the greedy choice property — the second is the stricter, rarer requirement that makes greedy inapplicable to many problems DP can still solve.`,
        `Activity selection's greedy strategy is sort by earliest finish time, then pick every activity that doesn't conflict with the last one picked — provably optimal via an exchange argument.`,
        `Coin change is the canonical counterexample showing greedy can fail — {1,3,4} making change for 6 is the standard illustration.`,
        `Huffman coding is a real-world, still-used greedy algorithm underlying common compression formats.`,
        `An exchange argument justifies a greedy choice by showing any optimal solution can be transformed to include that choice without getting worse.`,
        `When in doubt, try to construct a counterexample to a proposed greedy strategy before committing to it — finding one means you need DP instead.`,
      ],
      links: [
        { label: `GeeksforGeeks — Greedy Algorithms`, url: `https://www.geeksforgeeks.org/dsa/greedy-algorithms/` },
        { label: `GeeksforGeeks — Activity Selection Problem`, url: `https://www.geeksforgeeks.org/dsa/activity-selection-problem-greedy-algo-1/` },
        { label: `GeeksforGeeks — Huffman Coding`, url: `https://www.geeksforgeeks.org/dsa/huffman-coding-greedy-algo-3/` },
      ],
    },
    {
      moduleTitle: `DSA Advanced`,
      subModuleTitle: `Sorting/searching at scale`,
      overview: `Sorting and searching are the most fundamental operations in computer science, and while calling Arrays.sort() is one line of code, understanding what happens underneath — which algorithm runs, why, and what its actual guarantees are — is essential both for interview questions and for reasoning about performance at real scale. This guide covers the two dominant comparison-based sorting algorithms (quicksort and mergesort) with their complexity and stability trade-offs, exactly which algorithm Java's Arrays.sort() and Collections.sort() actually run for primitives versus objects, binary search and its common variants (lower bound, upper bound), practical guidance on choosing a sort at scale including a brief note on external sorting for data too large to fit in memory, and the rotated-sorted-array problem as a staple binary-search variant interviewers return to constantly.`,
      sections: [
        {
          heading: `Quicksort: Partition-Based, In-Place, Usually Fastest in Practice`,
          body: `Quicksort picks a pivot element, partitions the array so everything smaller than the pivot comes before it and everything larger comes after (the pivot ends up in its final sorted position after partitioning), then recursively sorts the two partitions. Average case is O(n log n) with excellent constant factors and in-place O(log n) auxiliary space (just the recursive call stack), but worst case is O(n²) when partitioning is consistently unbalanced — classically triggered by an already-sorted array with a naive "always pick the first element" pivot strategy, which is exactly why production implementations use randomized or median-of-three pivot selection to make the worst case practically unreachable.`,
          code: {
            language: `java`,
            code: `// Quicksort -- average O(n log n), worst case O(n^2), O(log n) auxiliary space (in-place)
public static void quicksort(int[] arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quicksort(arr, low, pivotIndex - 1);
        quicksort(arr, pivotIndex + 1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];             // choosing the last element as pivot (simple, not worst-case-safe)
    int i = low - 1;                    // boundary of the "smaller than pivot" region
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
    }
    int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;   // place pivot in final position
    return i + 1;
}`,
          },
        },
        {
          heading: `Mergesort: Divide-and-Conquer, Stable, Guaranteed O(n log n)`,
          body: `Mergesort recursively splits the array in half until subarrays of size 1 remain (trivially sorted), then merges sorted subarrays back together in linear time per merge step — this gives a guaranteed O(n log n) in every case, including worst case, unlike quicksort's O(n²) worst case. The trade-off is O(n) auxiliary space for the merge step's temporary array, versus quicksort's O(log n), and mergesort's real-world constant factors are typically somewhat worse than quicksort's despite the same asymptotic complexity. Mergesort is also stable — equal elements retain their original relative order — a property quicksort's typical in-place partitioning does not guarantee, and stability matters whenever sorting by one key should preserve a previous sort by another key.`,
        },
        {
          heading: `What Java's Arrays.sort() Actually Runs`,
          body: `Java's Arrays.sort() uses different algorithms depending on the element type, a detail interviewers specifically like to probe: for arrays of primitives (int[], double[], etc.), it uses a Dual-Pivot Quicksort, chosen for its excellent average-case performance and in-place operation, accepting that primitives have no notion of "identity" so stability is irrelevant. For arrays of objects (or any List via Collections.sort()), it uses a variant of TimSort (a hybrid of merge sort and insertion sort, originally developed for Python), chosen specifically because it's stable — object sorts frequently need to preserve relative order of equal elements — and TimSort is also adaptive, running faster than O(n log n) on data that's already partially sorted, a common real-world pattern.`,
          bullets: [
            `Arrays.sort(int[]) / other primitive arrays — Dual-Pivot Quicksort, O(n log n) average, not stable (irrelevant for primitives).`,
            `Arrays.sort(Object[]) / Collections.sort(List<T>) — TimSort, O(n log n) worst case, stable, adaptive on nearly-sorted input.`,
            `Stability matters whenever a later sort must preserve an earlier sort's relative ordering of equal keys (e.g. sort by last name, then by department, expecting last-name order preserved within each department).`,
          ],
        },
        {
          heading: `Binary Search and Its Variants`,
          body: `Binary search finds a target in a sorted array in O(log n) by repeatedly halving the search space, comparing the target against the middle element and discarding the half that can't contain it. Beyond simple existence checking, the lower bound variant finds the first index where a value ≥ target could be inserted while keeping the array sorted (the leftmost valid insertion point), and the upper bound variant finds the first index where a value > target could be inserted (the rightmost valid insertion point) — together, upperBound - lowerBound gives the count of elements equal to target in O(log n), without a linear scan.`,
          code: {
            language: `java`,
            code: `// Lower bound: first index where arr[index] >= target -- O(log n)
public static int lowerBound(int[] arr, int target) {
    int low = 0, high = arr.length;   // note: high starts at length, not length - 1
    while (low < high) {
        int mid = low + (high - low) / 2;   // avoids integer overflow vs. (low + high) / 2
        if (arr[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}`,
          },
        },
        {
          heading: `Searching a Rotated Sorted Array`,
          body: `A sorted array rotated at an unknown pivot (e.g. [4,5,6,7,0,1,2]) still supports O(log n) search, but the standard binary search comparison isn't directly enough — at each step, at least one of the two halves (left of mid, or right of mid) is guaranteed to still be normally sorted, so the algorithm first determines which half is sorted (by comparing the endpoints), then checks whether the target falls within that sorted half's range to decide which side to recurse into, falling back to the other half otherwise. This is one of the most commonly repeated "sorted array with a twist" interview questions precisely because it tests whether you can adapt binary search's invariant rather than just recite the textbook version.`,
          code: {
            language: `java`,
            code: `// Search in a rotated sorted array -- O(log n)
public static int searchRotated(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;

        if (arr[low] <= arr[mid]) {                    // left half [low..mid] is normally sorted
            if (arr[low] <= target && target < arr[mid]) high = mid - 1;
            else low = mid + 1;
        } else {                                        // right half [mid..high] is normally sorted
            if (arr[mid] < target && target <= arr[high]) low = mid + 1;
            else high = mid - 1;
        }
    }
    return -1;
}`,
          },
        },
        {
          heading: `Sorting "At Scale": A Brief Note on External Sorting`,
          body: `When data to be sorted is too large to fit in main memory — a common "at scale" scenario — external sorting (typically external mergesort) processes it in chunks: read a chunk that fits in memory, sort it in-place with a standard in-memory algorithm, write the sorted chunk back to disk, and once all chunks are sorted, merge them together using a k-way merge (often backed by a priority queue holding one element from each chunk at a time) that reads only small buffered portions of each sorted chunk at once. This is conceptually the same divide-and-conquer idea as mergesort, just with "divide" driven by memory constraints rather than a fixed recursive halving — worth knowing the name and general shape of this technique even if you're not expected to implement it in a typical interview.`,
        },
      ],
      commonPitfalls: [
        `Assuming Arrays.sort() always uses the same algorithm regardless of type — it's Dual-Pivot Quicksort for primitives but TimSort for objects, and the distinction matters for stability.`,
        `Using an in-place quicksort when stability is actually required (equal elements must preserve relative order), when mergesort or TimSort should be used instead.`,
        `Applying plain binary search directly to a rotated sorted array without first determining which half is still normally sorted at each step.`,
        `Computing mid as (low + high) / 2 instead of low + (high - low) / 2, risking integer overflow on very large arrays.`,
        `Confusing lower bound and upper bound semantics, off-by-one on which index each actually returns.`,
        `Forgetting binary search requires the array to already be sorted — running it on unsorted data silently produces an incorrect (and not even consistently wrong) result.`,
        `Not knowing quicksort's worst case (O(n²), triggered by consistently unbalanced partitioning) when asked to compare it against mergesort's guaranteed O(n log n).`,
      ],
      keyTakeaways: [
        `Quicksort: O(n log n) average, O(n²) worst case, O(log n) space, in-place, not stable — typically fastest in practice.`,
        `Mergesort: O(n log n) guaranteed in every case, O(n) space, stable — the safer choice when worst-case guarantees or stability matter.`,
        `Java uses Dual-Pivot Quicksort for primitive arrays and a stable, adaptive TimSort for object arrays and Collections.sort() — know which runs where.`,
        `Binary search variants (lower bound, upper bound) locate insertion points, not just existence, and together give an O(log n) count of equal elements.`,
        `A rotated sorted array is still searchable in O(log n) by determining which half remains normally sorted at each step.`,
        `External sorting (chunk, sort, k-way merge) extends the mergesort idea to data too large to fit in memory.`,
      ],
      links: [
        { label: `GeeksforGeeks — Sorting Algorithms`, url: `https://www.geeksforgeeks.org/dsa/sorting-algorithms/` },
        { label: `GeeksforGeeks — Search in Rotated Sorted Array`, url: `https://www.geeksforgeeks.org/dsa/search-an-element-in-a-sorted-and-pivoted-array/` },
        { label: `Baeldung — Java's Arrays.sort() and TimSort`, url: `https://www.baeldung.com/java-arrays-sort` },
      ],
    },
    {
      moduleTitle: `DSA Advanced`,
      subModuleTitle: `Mock coding tests`,
      overview: `Everything covered so far in the DSA modules is raw technique — this submodule is about performance under interview conditions, where a correct algorithm poorly communicated, or a good idea poorly time-managed, can score worse than a mediocre solution presented well. This guide covers the standard structured approach top interview coaches and companies expect (clarify, examples, brute force, optimize, code, test), concrete time-management strategies for a typical 30-45 minute coding round, how to think aloud effectively without narrating every keystroke, the common question patterns seen across LeetCode-style platforms and what signals they usually test for, a disciplined approach to testing your own code against edge cases before declaring it done, and how to structure a post-interview practice loop that actually improves performance over time rather than just accumulating solved-problem count.`,
      sections: [
        {
          heading: `The Standard Structured Approach`,
          body: `A strong interview answer follows a recognizable arc that interviewers are trained to look for and reward, precisely because it demonstrates process, not just a correct final answer arrived at by luck or memorization: clarify the problem (restate it, ask about edge cases and constraints), work through one or two concrete examples by hand, state a brute-force solution and its complexity even if you already see a better one, propose and justify an optimization, write the code, then test it against your own examples. Skipping straight to "optimal" code without narrating this arc denies the interviewer the signal they're actually there to collect — they're evaluating your process as much as your answer.`,
        },
        {
          heading: `Clarifying Questions Before Writing Any Code`,
          body: `A surprising fraction of interview problems are deliberately underspecified, and asking the right clarifying questions before coding is itself part of the evaluation — it signals you won't silently make risky assumptions in a real engineering setting either. Worth asking explicitly: can the input be empty or null? Are there duplicate values, and if so, how should they be handled? What's the expected scale of input size (this affects whether O(n²) is even acceptable)? Should the solution modify the input in place or return a new structure? Getting these answered up front avoids building a solution to the wrong problem and having to restart under time pressure.`,
        },
        {
          heading: `Brute Force First, Then Optimize — Out Loud`,
          body: `Stating a correct brute-force solution and its complexity before attempting to optimize serves two purposes: it guarantees you have a fallback if the optimization doesn't pan out in time, and it gives the interviewer a concrete baseline to measure your optimization against, making the improvement legible rather than assumed. When proposing an optimization, name the specific technique driving it explicitly ("this looks like it wants a sliding window because we're computing a running aggregate over a contiguous subrange") — naming the pattern demonstrates recognition, not just a lucky guess, and is a strong signal in itself.`,
        },
        {
          heading: `Time Management in a 30-45 Minute Round`,
          body: `A rough allocation that works well for a typical single-question round: 3-5 minutes clarifying and working examples, 5-10 minutes discussing approach and complexity before any code, 15-20 minutes writing code, and 5-10 minutes testing and refining — leaving a buffer is more valuable than rushing to "finish" code that hasn't been tested. If you're significantly behind this pacing partway through (still debating approach at the 20-minute mark), it's better to explicitly say so and commit to the best approach discussed so far than to silently keep exploring and run out of time with nothing coded at all.`,
        },
        {
          heading: `Thinking Aloud Without Over-Narrating`,
          body: `Interviewers need to hear your reasoning to evaluate it, but narrating literally every line as you type it ("now I'm creating a variable called i and setting it to zero") is noise that obscures the actual decision-making they're listening for. The useful level of narration is decisions and reasoning, not mechanics: state what data structure you're choosing and why, flag a tricky edge case before you handle it, and briefly explain any non-obvious line, but let straightforward, self-explanatory code be typed largely in silence — silence while typing familiar code is completely normal and expected, not a red flag.`,
        },
        {
          heading: `Common Question Patterns on LeetCode-Style Platforms`,
          body: `Most interview questions, despite superficially different phrasing, are drawn from a fairly small set of recognizable patterns covered across this course's DSA modules — recognizing which pattern a new problem matches is often 80% of the work. Two Sum-style problems signal hash map lookup or two-pointer (depending on whether the input is sorted); "smallest/largest window satisfying a condition" signals sliding window; "next greater/smaller element" signals a monotonic stack; problems about counting paths or ways signals DP; problems about connected components or reachability signal BFS/DFS; problems about scheduling or intervals often signal greedy (with a DP fallback if greedy provably fails).`,
        },
        {
          heading: `Testing Your Own Code Before Declaring It Done`,
          body: `Never declare a solution finished immediately after writing the last line — dry-run it against the example from the problem statement first, then deliberately test edge cases: an empty input, a single-element input, all-duplicate values, and the smallest/largest values the constraints allow. This step is exactly what separates candidates who write code that merely compiles from those who write code that's actually correct, and interviewers explicitly notice (positively) when a candidate proactively tests their own solution without being prompted to.`,
          code: {
            language: `java`,
            code: `// After writing a solution, deliberately walk through edge cases before saying "done":
// - Empty input: what does the function do with an empty array/string?
// - Single element: does a two-pointer loop's "left < right" condition correctly skip work?
// - All duplicates: does a "distinct" assumption anywhere silently break?
// - Boundary values: smallest/largest per the stated constraints`,
          },
        },
        {
          heading: `A Practice Loop That Actually Improves Performance`,
          body: `Solving a large raw count of problems is far less effective than a deliberate loop: attempt a problem under realistic time pressure, and if stuck past a reasonable point, look at the pattern (not the full solution) and retry; after solving (with or without help), explicitly note which pattern it was and why you did or didn't recognize it quickly; periodically revisit problems from a pattern category you previously struggled with to confirm recognition has actually improved, not just memorized a specific problem's exact solution. Tracking patterns rather than problem counts is what transfers to genuinely novel questions in a real interview, where the exact problem you practiced almost never appears verbatim.`,
        },
      ],
      commonPitfalls: [
        `Jumping straight into coding without clarifying ambiguous requirements, then having to backtrack and restart once a wrong assumption surfaces mid-solution.`,
        `Skipping the brute-force statement entirely and jumping to a half-formed "optimal" idea, leaving no fallback and no baseline for the interviewer to measure improvement against.`,
        `Narrating every keystroke instead of key decisions, burying the reasoning the interviewer actually needs to hear under mechanical noise.`,
        `Declaring a solution "done" immediately after it compiles, without dry-running it against the example or testing edge cases.`,
        `Losing track of time by over-exploring multiple approaches without committing, running out of time with no working code at all.`,
        `Memorizing specific problems' exact solutions instead of the underlying pattern, then failing to recognize the same pattern in a differently-worded but structurally identical new problem.`,
        `Going silent for long stretches without any communication, leaving the interviewer unable to assess reasoning even if the final code turns out correct.`,
      ],
      keyTakeaways: [
        `Follow the structured arc: clarify, examples, brute force with stated complexity, optimize, code, test — skipping stages costs more than it saves.`,
        `Ask clarifying questions before coding — underspecified problems are often deliberate, and asking signals sound engineering judgment.`,
        `Name the pattern you're applying explicitly ("this is a sliding window because...") — recognition, stated out loud, is itself a strong signal.`,
        `Budget time explicitly across a round (clarify, discuss, code, test) and communicate if you're falling behind rather than silently running out the clock.`,
        `Always test your own code against the given example plus edge cases (empty, single-element, duplicates, boundary values) before calling it done.`,
        `Practice by pattern recognition, not raw problem count — the goal is transferring technique to novel problems, not memorizing specific solutions.`,
      ],
      links: [
        { label: `GeeksforGeeks — How to Prepare for Coding Interviews`, url: `https://www.geeksforgeeks.org/dsa/how-to-prepare-for-coding-interviews/` },
        { label: `GeeksforGeeks — Must-Do Coding Interview Question Patterns`, url: `https://www.geeksforgeeks.org/dsa/must-do-coding-questions-for-companies-like-amazon-microsoft-adobe/` },
        { label: `LeetCode — Explore Cards (Pattern-Organized Practice)`, url: `https://leetcode.com/explore/` },
      ],
    },
  ],
};

export default data;
