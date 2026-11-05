import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "programming",
  submodules: [
    // ───────────────────────────── Java Programming ─────────────────────────────
    {
      moduleTitle: "Java Programming",
      subModuleTitle: "Core Java syntax & OOP",
      overview:
        "Java is a statically-typed, object-oriented language that compiles to platform-independent bytecode run by the Java Virtual Machine, and nearly every enterprise backend, Android app, and large-scale system you'll touch in a placement-ready career rests on the mechanics covered here. This sub-module builds Java from the ground up: how a source file becomes a running program, the primitive type system and operators, modern control-flow syntax including switch expressions, and the four pillars of object-oriented programming — encapsulation, inheritance, polymorphism, and abstraction — each demonstrated with real, compilable code. Getting these fundamentals genuinely solid matters because every later topic (collections, exceptions, concurrency) is really just OOP applied to a specific problem, and most 'confusing' Java bugs trace back to a shaky grasp of one of these basics rather than anything exotic.",
      sections: [
        {
          heading: "Program Structure, Compilation, and the JVM",
          body:
            "A Java program starts as one or more .java source files, each typically containing one public class whose name must exactly match the filename (Hello.java must contain public class Hello). The javac compiler translates this source into platform-independent .class bytecode, which the Java Virtual Machine (JVM) then interprets or JIT-compiles into native instructions at runtime — this is what 'write once, run anywhere' actually means: the same bytecode runs unmodified on any machine with a compatible JVM. Execution always begins at the public static void main(String[] args) method, which the JVM looks for by exact signature. Classes are organized into packages (declared with a package statement at the top of the file) mirroring the folder structure, and import statements bring other packages' classes into scope.",
          bullets: [
            "The public class name and the .java filename must match character-for-character, including case.",
            "main's signature is fixed: public static void main(String[] args) — the JVM won't find any other signature.",
            "Bytecode portability is why a .class file compiled on Windows runs unmodified on Linux or macOS.",
          ],
          code: {
            language: "java",
            code: `package com.example.intro;

public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
// Compile:  javac Hello.java   -> produces Hello.class
// Run:      java com.example.intro.Hello`,
          },
        },
        {
          heading: "Variables, Primitive Types, and Operators",
          body:
            "Java has exactly eight primitive types — byte, short, int, long, float, double, char, and boolean — each with a fixed size and a default value, which is why a declared-but-unassigned instance field of type int defaults to 0 rather than causing an error. Everything else (String, arrays, your own classes) is a reference type, stored as a pointer to heap-allocated data rather than the value itself. Arithmetic, relational, logical, and the ternary (?:) operators behave largely like other C-family languages, but integer division truncates toward zero silently — 7 / 2 evaluates to 3, not 3.5 — which is one of the first surprises most learners hit. Widening casts (int to double) happen automatically; narrowing casts (double to int) require an explicit cast and truncate the decimal portion rather than rounding.",
          bullets: [
            "int / int always produces an int, truncating any remainder — cast at least one operand to double to get a fractional result.",
            "char arithmetic (e.g., 'a' + 1) promotes to int automatically, so the result is 98, not 'b'.",
            "Primitive variables hold their value directly; reference variables hold a pointer to an object on the heap.",
          ],
          code: {
            language: "java",
            code: `int total = 7;
int count = 2;
System.out.println(total / count);           // 3 — integer division truncates
System.out.println((double) total / count);  // 3.5 — cast forces floating-point division

char letter = 'a';
int shifted = letter + 1;                     // 98, promoted to int
System.out.println((char) shifted);           // 'b' — must cast back explicitly`,
          },
        },
        {
          heading: "Control Flow: Conditionals, Loops, and Modern switch",
          body:
            "if/else if/else chains and the classic C-style switch (which falls through between cases without an explicit break) work as in most languages, but Java 14 standardized a far safer switch expression syntax using arrows (case X -> result) that doesn't fall through, can directly return a value, and supports yield for multi-statement branches. Loop constructs cover for, while, do-while (which guarantees at least one execution of the body), and the enhanced for-each loop for iterating arrays and collections without manual indexing. break and continue can be combined with labels to control outer loops from inside nested ones, which is occasionally the cleanest way to exit a doubly-nested search loop.",
          bullets: [
            "Classic switch falls through to the next case without an explicit break — a frequent source of bugs when a case is added later.",
            "Switch expressions (case X -> ...) are safer by default and can be assigned directly to a variable.",
            "do-while always executes its body at least once, even if the condition is false from the start.",
          ],
          code: {
            language: "java",
            code: `int day = 3;

// Modern switch expression — no fallthrough, returns a value directly
String dayName = switch (day) {
    case 1, 7 -> "Weekend";
    case 2, 3, 4, 5, 6 -> "Weekday";
    default -> "Invalid day";
};
System.out.println(dayName); // "Weekday"`,
          },
        },
        {
          heading: "Classes, Objects, and Constructors",
          body:
            "A class is a blueprint describing the fields (state) and methods (behavior) an object will have; an object is a concrete instance created with the new keyword, which allocates memory on the heap and returns a reference to it. Constructors initialize a new object's state and share the class's name with no return type; a class can have multiple constructors with different parameter lists (constructor overloading), and one constructor can delegate to another in the same class using this(...) as its first statement. If no constructor is written at all, Java silently provides a no-argument default constructor — but that disappears the moment you write any constructor yourself, a detail that trips up many learners who then can't call new MyClass() anymore.",
          code: {
            language: "java",
            code: `public class Person {
    private final String name;
    private int age;

    public Person(String name) {
        this(name, 0); // delegate to the other constructor
    }

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String describe() {
        return name + " is " + age + " years old";
    }
}

Person p = new Person("Asha", 22);
System.out.println(p.describe());`,
          },
        },
        {
          heading: "Encapsulation and Access Modifiers",
          body:
            "Encapsulation means hiding an object's internal state behind a controlled interface — fields are declared private and exposed only through public getter and setter methods, which lets a class validate or transform data on the way in and change its internal representation later without breaking any code that uses it. Java has four access levels: private (visible only within the same class), default/package-private (no modifier — visible within the same package), protected (visible within the package plus subclasses elsewhere), and public (visible everywhere). A setter that validates its input — rejecting a negative age, for instance — is the entire practical point of encapsulation: without it, any code anywhere could silently put an object into an invalid state.",
          bullets: [
            "Default (no modifier) access is package-private, not 'private by default' as some learners assume.",
            "A setter is a natural place to enforce invariants (e.g., throwing an exception on a negative age) that a public field could never enforce.",
          ],
          code: {
            language: "java",
            code: `public class BankAccount {
    private double balance;

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit must be positive");
        }
        balance += amount;
    }

    public double getBalance() {
        return balance;
    }
}`,
          },
        },
        {
          heading: "Inheritance: extends, super, and the Object Class",
          body:
            "A class inherits fields and methods from a single parent using extends — Java deliberately disallows multiple class inheritance to avoid the ambiguity it creates, a limitation interfaces exist partly to work around. The super keyword calls the parent's constructor (super(...), which must be the first statement if used) or invokes an overridden parent method explicitly (super.methodName()). Every class implicitly extends Object if no other parent is specified, which is why every object automatically has toString(), equals(), and hashCode() methods available — ones that are usually worth overriding, since the inherited defaults compare by memory reference and print an unhelpful class-name-plus-hashcode string.",
          code: {
            language: "java",
            code: `public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public String speak() { return name + " makes a sound"; }
}

public class Dog extends Animal {
    public Dog(String name) { super(name); }

    @Override
    public String speak() {
        return super.speak() + " — specifically, a bark!";
    }
}

Animal a = new Dog("Rex");
System.out.println(a.speak()); // "Rex makes a sound — specifically, a bark!"`,
          },
        },
        {
          heading: "Polymorphism: Overriding vs Overloading",
          body:
            "Overloading is compile-time polymorphism: multiple methods share a name but differ in parameter list (type, count, or order), and the compiler picks the matching version based on the arguments at the call site. Overriding is runtime polymorphism: a subclass redefines a method with the exact same signature it inherited, and which version actually runs is decided at runtime based on the object's real (dynamic) type, not the type of the reference variable pointing to it — this is why an Animal-typed reference holding a Dog object calls Dog's overridden method, not Animal's. The @Override annotation doesn't change behavior but makes the compiler verify you actually matched a real parent method, catching signature typos that would otherwise silently create an unrelated overload instead of an override.",
          bullets: [
            "Overloading is resolved at compile time from the argument types; overriding is resolved at runtime from the object's actual class.",
            "Always add @Override on an intended override — the compiler will error if the signature doesn't actually match a parent method.",
          ],
        },
        {
          heading: "Abstraction: Abstract Classes vs Interfaces",
          body:
            "Abstraction means defining what an object can do without necessarily specifying every detail of how. An abstract class (marked abstract, cannot be instantiated directly) can mix fully-implemented methods with abstract ones that subclasses must fill in, and can hold shared state — but a class can extend only one abstract class. An interface declares a contract of methods any implementing class must provide, and since Java 8 can also include default methods (with a body, inherited unless overridden) and static methods — crucially, a class can implement any number of interfaces, which is how Java approximates multiple inheritance of behavior. The practical rule: reach for an abstract class when subclasses share common state and implementation; reach for an interface when you're defining a capability unrelated classes can all plug into.",
          code: {
            language: "java",
            code: `interface Drawable {
    void draw(); // abstract by default
    default String describe() { return "A drawable shape"; } // Java 8+
}

abstract class Shape implements Drawable {
    protected String color;
    Shape(String color) { this.color = color; }
    abstract double area(); // subclasses must implement
}

class Circle extends Shape {
    double radius;
    Circle(String color, double radius) { super(color); this.radius = radius; }
    @Override double area() { return Math.PI * radius * radius; }
    @Override public void draw() { System.out.println(color + " circle, area=" + area()); }
}`,
          },
        },
      ],
      commonPitfalls: [
        "Forgetting that the public class name must exactly match the .java filename, including case, which fails compilation.",
        "Expecting int / int to produce a decimal result — it truncates, so at least one operand must be cast to double first.",
        "Confusing overloading (same name, different parameters, resolved at compile time) with overriding (same signature, resolved at runtime by actual object type).",
        "Writing a custom constructor and then being surprised new MyClass() no longer compiles — the implicit no-arg constructor disappears once any constructor is defined.",
        "Forgetting super() must be the first statement in a subclass constructor, or omitting it when the parent has no no-arg constructor.",
        "Making fields public instead of private with validating getters/setters, defeating encapsulation and allowing invalid object state.",
        "Attempting to instantiate an abstract class or interface directly with new instead of a concrete implementing subclass.",
        "Comparing objects with == instead of .equals(), which checks reference identity rather than logical equality unless equals() is overridden.",
      ],
      keyTakeaways: [
        "javac compiles to portable bytecode; the JVM is what makes 'write once, run anywhere' true.",
        "Integer division truncates toward zero — cast to double explicitly whenever a fractional result is needed.",
        "Switch expressions (case X -> ...) avoid the fallthrough bugs of classic switch statements and can return a value directly.",
        "Overloading is resolved at compile time from parameter types; overriding is resolved at runtime from the object's actual class.",
        "A class extends at most one class but can implement any number of interfaces — use abstract classes for shared state, interfaces for shared capability contracts.",
        "Override equals(), hashCode(), and toString() deliberately — the inherited Object defaults compare by reference and rarely print anything useful.",
      ],
      links: [
        { label: "Oracle — The Java Tutorials: Classes and Objects", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/index.html" },
        { label: "Oracle — Language Basics", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/index.html" },
        { label: "Oracle JDK 17 — Switch Expressions", url: "https://docs.oracle.com/en/java/javase/17/language/switch-expressions.html" },
      ],
    },
    {
      moduleTitle: "Java Programming",
      subModuleTitle: "Collections framework",
      overview:
        "Almost no real Java program manages data with plain arrays — the Collections Framework's Lists, Sets, Maps, and Queues are the actual day-to-day data structures used for everything from caching to request handling, and knowing which implementation to reach for (and why) is a constant, practical decision rather than academic trivia. This sub-module walks through the core interface hierarchy, compares the standard List, Set, and Map implementations by their underlying data structure and performance characteristics, covers safe iteration (including the fail-fast ConcurrentModificationException every Java developer eventually hits), sorting with Comparable and Comparator, and closes with generics and a first taste of the Streams API, since modern Java code almost never processes a collection with a raw for-loop anymore.",
      sections: [
        {
          heading: "The Collection Hierarchy: List, Set, Map, and Queue",
          body:
            "The java.util.Collection interface is the root of List, Set, and Queue — each representing a group of elements, but with different rules: List preserves insertion order and allows duplicates, Set enforces uniqueness, and Queue models a processing order (typically FIFO). Map is deliberately not a Collection at all; it's a separate hierarchy of key-value pairs, since a Map's fundamental operation (lookup by key) doesn't fit the 'collection of elements' abstraction the others share. The utility class Collections (plural, with a capital C and a trailing 's') provides static helper methods like sort, reverse, and unmodifiableList — a frequent source of confusion is mixing up this utility class with the Collection interface it operates on.",
          bullets: [
            "Collection (interface, singular) vs Collections (utility class, plural, static helper methods) — easy to confuse by name alone.",
            "Map is not a Collection — it has its own separate interface hierarchy because key-based lookup doesn't fit the Collection contract.",
          ],
        },
        {
          heading: "ArrayList vs LinkedList",
          body:
            "ArrayList is backed by a resizable internal array, giving O(1) index-based access (get(i)) but O(n) insertion or removal in the middle, since every following element must shift. LinkedList is a doubly-linked list of nodes, giving O(1) insertion/removal at either end but O(n) access by index, since reaching element i requires walking the chain from one end. In practice, ArrayList is the default choice for nearly all use cases because random access and iteration dominate real workloads, while LinkedList is reserved for scenarios with genuinely frequent insertions/removals at the ends, such as implementing a Deque-style structure.",
          code: {
            language: "java",
            code: `List<String> names = new ArrayList<>();
names.add("Asha");
names.add("Raj");
names.add(0, "Priya"); // O(n) — shifts "Asha" and "Raj" right

List<String> queue = new LinkedList<>();
queue.add("first");
((LinkedList<String>) queue).addFirst("even-earlier"); // O(1) on LinkedList`,
          },
        },
        {
          heading: "Set Implementations: HashSet, LinkedHashSet, TreeSet",
          body:
            "HashSet stores elements in a hash table, giving O(1) average-case add/contains/remove but no guaranteed iteration order. LinkedHashSet adds a linked list alongside the hash table purely to preserve insertion order during iteration, at a small memory cost. TreeSet stores elements in a red-black tree, keeping them continuously sorted (via Comparable or a supplied Comparator) at O(log n) per operation, and additionally implements NavigableSet methods like higher(), lower(), and first() for range-style queries. Choosing between them is purely about what ordering guarantee (if any) the problem actually needs.",
          code: {
            language: "java",
            code: `Set<String> unordered = new HashSet<>(List.of("c", "a", "b"));
Set<String> insertionOrder = new LinkedHashSet<>(List.of("c", "a", "b"));
Set<String> sorted = new TreeSet<>(List.of("c", "a", "b"));

System.out.println(insertionOrder); // [c, a, b]
System.out.println(sorted);         // [a, b, c]`,
          },
        },
        {
          heading: "Map Implementations: HashMap, LinkedHashMap, TreeMap",
          body:
            "The Map family mirrors the Set family's tradeoffs, since Java's HashSet is actually implemented internally using a HashMap with dummy values. HashMap allows exactly one null key and any number of null values, with O(1) average get/put but unspecified iteration order; LinkedHashMap preserves insertion order; TreeMap keeps keys continuously sorted. Beyond basic get/put, modern Map methods like computeIfAbsent, merge, and getOrDefault eliminate a lot of the manual 'check if key exists, then put' boilerplate that used to be ubiquitous in older Java code.",
          code: {
            language: "java",
            code: `Map<String, Integer> wordCounts = new HashMap<>();
String[] words = {"cat", "dog", "cat", "bird", "dog", "cat"};

for (String w : words) {
    wordCounts.merge(w, 1, Integer::sum); // adds 1, or inserts 1 if absent
}
System.out.println(wordCounts); // {bird=1, cat=3, dog=2} (order not guaranteed)`,
          },
        },
        {
          heading: "Iterating Safely: Iterator and ConcurrentModificationException",
          body:
            "Standard collection iterators are fail-fast: if a collection is structurally modified (an element added or removed) while a for-each loop or explicit Iterator is mid-traversal — by any means other than the iterator's own remove() — the next call to next() throws a ConcurrentModificationException rather than silently producing wrong results. The correct way to remove elements while iterating is either Iterator.remove() directly, or the simpler Collection.removeIf(predicate) introduced in Java 8, both of which update the collection's internal state consistently.",
          code: {
            language: "java",
            code: `List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));

// WRONG — throws ConcurrentModificationException
// for (Integer n : nums) { if (n % 2 == 0) nums.remove(n); }

// CORRECT — removeIf handles the bookkeeping safely
nums.removeIf(n -> n % 2 == 0);
System.out.println(nums); // [1, 3, 5]`,
          },
        },
        {
          heading: "Sorting with Comparable and Comparator",
          body:
            "A class implements Comparable<T> and its compareTo(T other) method to define a single natural ordering intrinsic to the class itself (e.g., sorting Employee by ID). A Comparator<T> is a separate object defining an ordering externally — useful when you need multiple different orderings of the same type, or want to sort a class you don't own. The Comparator interface's static and default methods (comparing, thenComparing, reversed) let you build multi-key sort logic declaratively instead of writing a long if/else compareTo body by hand.",
          code: {
            language: "java",
            code: `record Employee(String name, int age, double salary) {}

List<Employee> employees = new ArrayList<>(List.of(
    new Employee("Asha", 29, 75000),
    new Employee("Raj", 29, 68000),
    new Employee("Priya", 34, 82000)
));

employees.sort(
    Comparator.comparingInt(Employee::age)
        .thenComparing(Comparator.comparingDouble(Employee::salary).reversed())
);`,
          },
        },
        {
          heading: "Generics and Type Safety",
          body:
            "Generics let a collection declare the type of element it holds at compile time — List<String> can only ever hold Strings, and the compiler rejects any attempt to add something else, catching a whole category of bugs that used to surface only as a ClassCastException at runtime in pre-generics Java. The diamond operator (<>) lets the compiler infer the type argument on the right side from context, avoiding redundant repetition. Wildcard bounds (? extends Number for read-only producer parameters, ? super Integer for write-only consumer parameters) show up in method signatures that need to accept a range of related generic types flexibly, though for most day-to-day application code, simple concrete type parameters cover the vast majority of cases.",
          code: {
            language: "java",
            code: `List<String> names = new ArrayList<>(); // diamond infers <String> from the left side
names.add("Asha");
// names.add(42); // compile error — type safety enforced before runtime`,
          },
        },
        {
          heading: "A First Look at the Streams API",
          body:
            "Streams (java.util.stream) let you express a pipeline of operations over a collection's elements — filter, map, sorted, collect — declaratively, without writing manual loops and temporary accumulator variables. A stream itself holds no data and can only be consumed once; it describes a computation that executes when a terminal operation like collect() or forEach() is called. Streams complement the Collections Framework rather than replacing it: you typically start from a List or Set, process it as a stream, and collect the result back into a new collection.",
          code: {
            language: "java",
            code: `List<String> names = List.of("Asha", "Raj", "Priya", "Bob");

List<String> longUppercaseNames = names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .collect(java.util.stream.Collectors.toList());

System.out.println(longUppercaseNames); // [ASHA, PRIYA]`,
          },
        },
      ],
      commonPitfalls: [
        "Using ArrayList when the workload needs frequent insertion/removal at the front or middle, repeatedly paying the O(n) shift cost.",
        "Modifying a List, Set, or Map with the collection's own add/remove methods while iterating it with a for-each loop, triggering ConcurrentModificationException instead of using removeIf or Iterator.remove().",
        "Overriding equals() on a class without also overriding hashCode(), causing duplicate 'equal' entries in a HashSet or failed lookups in a HashMap.",
        "Relying on HashMap's iteration order being consistent or meaningful — it's unspecified and can change between JDK versions; use LinkedHashMap when order matters.",
        "Confusing the Collection interface with the Collections utility class by name alone.",
        "Writing a custom compareTo() or Comparator that isn't consistent with equals(), causing a TreeSet/TreeMap to silently treat distinct-by-equals elements as duplicates.",
        "Forgetting that a Stream can only be consumed once — reusing the same stream variable for a second terminal operation throws IllegalStateException.",
      ],
      keyTakeaways: [
        "List preserves order and duplicates, Set enforces uniqueness, Map stores key-value pairs — pick based on which contract the problem actually needs.",
        "ArrayList: fast random access, slow middle insert/remove. LinkedList: fast insert/remove at the ends, slow random access.",
        "Always override equals() and hashCode() together for any class used in a HashSet or as a HashMap key.",
        "Use Iterator.remove() or Collection.removeIf() to remove elements during iteration — never the collection's own remove() inside a for-each loop.",
        "Comparable defines one natural ordering on the class itself; Comparator defines external, swappable orderings — chain with thenComparing for multi-key sorts.",
        "Generics catch type mismatches at compile time instead of surfacing as a ClassCastException at runtime.",
      ],
      links: [
        { label: "Oracle — The Java Tutorials: Collections", url: "https://docs.oracle.com/javase/tutorial/collections/index.html" },
        { label: "Oracle Java 17 API — Collection Interface", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Collection.html" },
        { label: "Baeldung — Guide to Java 8's Collectors", url: "https://www.baeldung.com/java-8-collectors" },
      ],
    },
    {
      moduleTitle: "Java Programming",
      subModuleTitle: "Exception handling & I/O",
      overview:
        "Real programs fail in predictable ways — a file might not exist, a network call might time out, a user might type text where a number was expected — and Java's exception-handling model forces you to decide, at compile time for checked exceptions, how each of those failures gets handled rather than letting them crash the program unceremoniously. This sub-module covers the checked-vs-unchecked exception split and why it exists, try/catch/finally mechanics including the much safer try-with-resources syntax, writing custom exceptions, preserving the original cause when wrapping one exception in another, and modern file I/O with java.nio.file alongside the classic Scanner and buffered-stream APIs — closing with the resource-management discipline that separates production-quality Java from code that merely happens to work in a demo.",
      sections: [
        {
          heading: "Checked vs Unchecked Exceptions",
          body:
            "Every exception in Java descends from Throwable, which splits into Error (serious JVM-level problems like OutOfMemoryError that applications generally shouldn't try to catch) and Exception. Exception itself splits further: checked exceptions (any subclass of Exception that isn't a RuntimeException, like IOException) must be either caught or declared in a method's throws clause — the compiler enforces this — because they represent recoverable conditions external to the program's own logic, like a missing file. Unchecked exceptions (RuntimeException and its subclasses, like NullPointerException or IllegalArgumentException) represent programming errors and are not compiler-enforced, since requiring every method to declare every possible NullPointerException would make the type system unusable.",
          bullets: [
            "Checked exceptions model recoverable, expected failure conditions (file not found, network timeout) — the compiler forces you to acknowledge them.",
            "Unchecked exceptions (RuntimeException and subclasses) typically signal a bug in the code itself, not an expected external condition.",
          ],
        },
        {
          heading: "try/catch/finally and try-with-resources",
          body:
            "Code that might throw goes in a try block; one or more catch blocks handle specific exception types (ordered from most specific to most general, since Java checks them top-to-bottom); an optional finally block always executes, whether or not an exception occurred, making it the traditional place for cleanup. Since Java 7, try-with-resources automatically closes any resource implementing AutoCloseable at the end of the block — in the reverse order resources were opened — eliminating the manual finally-block close() calls that were historically a huge source of resource leaks and nested-try ugliness. Multi-catch (catch (IOException | SQLException e)) handles several exception types identically in one block without duplicating code.",
          code: {
            language: "java",
            code: `import java.io.*;

public void readFirstLine(String path) {
    try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
        System.out.println(reader.readLine());
    } catch (FileNotFoundException e) {
        System.err.println("File not found: " + path);
    } catch (IOException e) {
        System.err.println("Error reading file: " + e.getMessage());
    }
    // reader.close() is called automatically, even if an exception was thrown
}`,
          },
        },
        {
          heading: "Creating and Using Custom Exceptions",
          body:
            "Defining your own exception class — by extending Exception for a checked exception or RuntimeException for an unchecked one — lets you represent domain-specific failure conditions (InsufficientFundsException, InvalidOrderException) far more clearly than throwing a generic RuntimeException with a string message. The custom class should call one of the parent's constructors via super(...) to preserve the message (and optionally the cause) that the rest of the exception-handling machinery relies on. The choice between checked and unchecked for your own exception follows the same logic as the built-in ones: checked if callers can reasonably be expected to recover, unchecked if it represents a programming mistake they should fix rather than handle.",
          code: {
            language: "java",
            code: `public class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public void withdraw(double amount, double balance) throws InsufficientFundsException {
    if (amount > balance) {
        throw new InsufficientFundsException("Requested " + amount + " exceeds balance " + balance);
    }
}`,
          },
        },
        {
          heading: "Exception Chaining and Preserving the Cause",
          body:
            "When catching a low-level exception and throwing a more meaningful higher-level one, passing the original exception as the cause argument (new ServiceException(\"Failed to load config\", originalException)) preserves the full original stack trace inside the new exception's getCause(). Discarding the original exception and throwing a brand-new one with only a string message destroys the debugging trail that points to exactly where and why the failure actually originated — in production code this difference can turn a five-minute fix into an hours-long investigation.",
          code: {
            language: "java",
            code: `try {
    loadConfigFile();
} catch (IOException e) {
    throw new RuntimeException("Could not start application", e); // cause preserved
}`,
          },
        },
        {
          heading: "Modern File I/O with java.nio.file",
          body:
            "The NIO.2 API (java.nio.file), introduced in Java 7, is the preferred way to work with files in new code, favored over the legacy java.io.File class for its clearer exceptions and richer feature set. A Path represents a file or directory location (platform-independent, built with Path.of(...) or Paths.get(...)), and the Files utility class provides static methods like Files.readString, Files.writeString, Files.exists, and Files.createDirectories that cover the vast majority of everyday file operations in one line each, without manually managing streams for simple cases.",
          code: {
            language: "java",
            code: `import java.nio.file.*;
import java.io.IOException;

Path logPath = Path.of("logs", "output.txt");

try {
    Files.writeString(logPath, "Application started\\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    String contents = Files.readString(logPath);
    System.out.println(contents);
} catch (IOException e) {
    System.err.println("File operation failed: " + e.getMessage());
}`,
          },
        },
        {
          heading: "Buffered Streams and Scanner for Text Processing",
          body:
            "Raw byte streams (InputStream/OutputStream) and character streams (Reader/Writer) perform a system call for every single read or write, which is slow when done one byte or character at a time. Wrapping them in BufferedReader/BufferedWriter batches reads and writes into larger chunks internally, dramatically reducing the number of actual I/O operations for line-by-line or chunked text processing. Scanner, by contrast, is built for tokenizing input into typed values (nextInt(), nextDouble(), next() for a whitespace-delimited word) and is the standard tool for reading structured console input, though it's not the fastest choice for parsing huge files line-by-line — that's BufferedReader's job.",
          code: {
            language: "java",
            code: `import java.util.Scanner;

Scanner scanner = new Scanner(System.in);
System.out.print("Enter your age: ");
int age = scanner.nextInt(); // throws InputMismatchException on non-numeric input
System.out.println("You are " + age + " years old.");`,
          },
        },
        {
          heading: "Best Practices: Resource Management and Not Swallowing Exceptions",
          body:
            "Every resource that implements AutoCloseable — files, sockets, database connections — should be opened inside a try-with-resources statement so it's guaranteed to close even if an exception is thrown mid-operation; manual finally-block closing is still legal but far more error-prone (the close() call itself can throw, and nested resources multiply the boilerplate quickly). An empty catch block — catch (Exception e) {} — is one of the most damaging anti-patterns in Java code, because it silently discards evidence of a real failure; at minimum, log the exception, and prefer catching the most specific exception type the code can actually recover from rather than a blanket Exception or Throwable.",
        },
      ],
      commonPitfalls: [
        "Catching the broad Exception (or even Throwable) type instead of the specific exception that can actually occur, hiding unrelated bugs.",
        "Forgetting that checked exceptions must be caught or declared with throws in the method signature — the compiler enforces this for Exception subclasses that aren't RuntimeException.",
        "Manually closing resources in a finally block instead of using try-with-resources, risking a leaked resource if an earlier line throws before the close() call.",
        "Throwing a brand-new exception from inside a catch block without passing the original exception as the cause, losing the real stack trace.",
        "Using Files.readAllLines or readString on an enormous file, loading the entire contents into memory at once instead of streaming it.",
        "Leaving an empty catch block that silently swallows an exception instead of logging it or handling it meaningfully.",
        "Mixing up Scanner's nextInt()/nextLine() calls, since nextInt() leaves the trailing newline in the buffer for the next nextLine() to pick up unexpectedly.",
      ],
      keyTakeaways: [
        "Checked exceptions (compiler-enforced) model recoverable external conditions; unchecked exceptions (RuntimeException) model programming errors.",
        "try-with-resources auto-closes any AutoCloseable resource, even on an exception, and should be preferred over manual finally-block cleanup.",
        "Always pass the original exception as the cause when wrapping it in a new one, to preserve the real stack trace.",
        "java.nio.file (Path + Files) is the modern, preferred file I/O API over the legacy java.io.File for most new code.",
        "BufferedReader/BufferedWriter reduce the number of actual I/O system calls; Scanner is for tokenizing typed input, not raw performance.",
        "Never leave a catch block empty — at minimum, log the exception so failures aren't silently discarded.",
      ],
      links: [
        { label: "Oracle — The Java Tutorials: Exceptions", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html" },
        { label: "Oracle — The Java Tutorials: Basic I/O (NIO.2)", url: "https://docs.oracle.com/javase/tutorial/essential/io/index.html" },
        { label: "Baeldung — Java try-with-resources", url: "https://www.baeldung.com/java-try-with-resources" },
      ],
    },
    {
      moduleTitle: "Java Programming",
      subModuleTitle: "Multithreading basics",
      overview:
        "Modern hardware has multiple CPU cores, and taking advantage of them means running independent pieces of work concurrently rather than one instruction at a time — but concurrency also introduces an entirely new category of bugs (race conditions, deadlocks) that don't exist in single-threaded code and can be maddeningly hard to reproduce. This sub-module starts from the basics of what a thread is and how to create one, builds a hands-on understanding of race conditions by deliberately triggering one, then fixes it with the synchronized keyword, and moves up to the higher-level, safer tools most production code actually uses day to day — ExecutorService thread pools and the atomic classes — closing with a brief, practical introduction to deadlock so you can recognize and avoid the classic circular-wait pattern.",
      sections: [
        {
          heading: "Processes, Threads, and Why Concurrency Matters",
          body:
            "A process is an independent running program with its own isolated memory space; a thread is a lightweight unit of execution within a process that shares that process's memory with every other thread in it — which is exactly what makes threads fast to create and communicate between, and exactly what makes shared mutable state dangerous. Every Java program already runs on at least one thread (the 'main' thread), and multithreading means launching additional threads that run concurrently, letting a program do productive work (handling another request, running a background computation) while one thread waits on something slow like disk or network I/O.",
        },
        {
          heading: "Creating Threads: extends Thread vs implements Runnable",
          body:
            "A thread's task can be defined by extending Thread and overriding its run() method, or — the generally preferred approach — by implementing the Runnable functional interface and passing an instance to a plain new Thread(runnable). Implementing Runnable is preferred because Java only allows single inheritance: extending Thread uses up your one available superclass slot, while implementing Runnable leaves that slot free and also lets the same task be reused with other concurrency tools (like an ExecutorService) that expect a Runnable rather than a Thread subclass.",
          code: {
            language: "java",
            code: `Runnable task = () -> {
    System.out.println("Running on: " + Thread.currentThread().getName());
};

Thread t = new Thread(task, "worker-1");
t.start(); // starts a new thread — NOT t.run(), which would run synchronously`,
          },
        },
        {
          heading: "Thread Lifecycle and Core Methods",
          body:
            "Calling start() transitions a thread from NEW to RUNNABLE and schedules it to actually execute concurrently — calling run() directly instead executes the code synchronously on the calling thread, with no concurrency at all, which is one of the very first mistakes almost every learner makes. Thread.sleep(ms) pauses the current thread for at least the given duration without consuming CPU; join() blocks the calling thread until the target thread finishes, which is essential when the rest of the program depends on a background thread's result being ready. Both sleep() and join() can throw the checked InterruptedException, which should be handled deliberately rather than swallowed silently.",
          code: {
            language: "java",
            code: `Thread worker = new Thread(() -> {
    try {
        Thread.sleep(1000);
        System.out.println("Worker finished");
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt(); // restore the interrupt status
    }
});

worker.start();
worker.join(); // main thread waits here until worker finishes
System.out.println("Main thread continues after worker");`,
          },
        },
        {
          heading: "Race Conditions and Shared Mutable State",
          body:
            "A race condition occurs when two or more threads read and write shared mutable state without coordination, and the final result depends on the unpredictable timing of their interleaving. Incrementing a shared counter looks like one operation in source code, but is actually three separate steps at the machine level — read the value, add one, write it back — and if two threads each read the same value before either writes back, one increment is silently lost. This is exactly why a seemingly simple counter incremented concurrently by multiple threads often ends up lower than expected, and why the bug may not even reproduce reliably in testing.",
          code: {
            language: "java",
            code: `class Counter {
    private int count = 0;
    public void increment() { count++; } // NOT atomic: read, add, write
    public int getCount() { return count; }
}

// With 1000 threads each calling increment() once, the final count
// is frequently LESS than 1000 due to lost updates from interleaving.`,
          },
        },
        {
          heading: "The synchronized Keyword and Intrinsic Locks",
          body:
            "Marking a method or block synchronized ensures only one thread at a time can execute that code while holding the associated object's intrinsic lock — any other thread attempting to enter must wait until the lock is released. Applied consistently to every method that reads or writes the same shared state, this eliminates the interleaving that causes race conditions, at the cost of serializing access (which is a deliberate performance tradeoff for correctness). A common and subtle mistake is synchronizing on different lock objects in different methods that touch the same shared state — since locks only provide mutual exclusion against other threads trying to acquire that exact same lock object, mismatched locks provide no real protection at all.",
          code: {
            language: "java",
            code: `class Counter {
    private int count = 0;
    public synchronized void increment() { count++; } // now atomic w.r.t. other synchronized calls
    public synchronized int getCount() { return count; }
}`,
          },
        },
        {
          heading: "Higher-Level Concurrency: ExecutorService and Thread Pools",
          body:
            "Creating a brand-new Thread for every single task is wasteful — thread creation and teardown carry real overhead, and an unbounded number of threads can exhaust system resources. The java.util.concurrent.ExecutorService abstracts task execution behind a managed pool of reusable worker threads: you submit Runnable or Callable tasks, and the pool handles scheduling them across its fixed set of threads, reusing them rather than constantly creating new ones. This is the standard, production-grade way to run concurrent work in Java, and it must be explicitly shut down (shutdown() or shutdownNow()) when no longer needed, or its threads will keep the JVM from exiting.",
          code: {
            language: "java",
            code: `import java.util.concurrent.*;

ExecutorService pool = Executors.newFixedThreadPool(4);

for (int i = 0; i < 10; i++) {
    int taskId = i;
    pool.submit(() -> System.out.println("Task " + taskId + " on " + Thread.currentThread().getName()));
}

pool.shutdown(); // stop accepting new tasks; lets submitted ones finish first`,
          },
        },
        {
          heading: "volatile and the Atomic Classes",
          body:
            "The volatile keyword guarantees that reads and writes to a field go directly to main memory rather than being cached per-thread, so every thread always sees the most recently written value — but it only guarantees visibility, not atomicity, so volatile int count; count++; is still unsafe for concurrent increments since the increment itself remains three separate steps. The java.util.concurrent.atomic package (AtomicInteger, AtomicLong, AtomicReference) provides genuinely atomic compound operations like incrementAndGet() using efficient lock-free hardware instructions, making it the right tool for simple shared counters without the overhead of a full synchronized block.",
          code: {
            language: "java",
            code: `import java.util.concurrent.atomic.AtomicInteger;

AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet(); // atomic — safe to call from many threads concurrently
System.out.println(counter.get());`,
          },
        },
        {
          heading: "Avoiding Deadlock: A Brief Introduction",
          body:
            "Deadlock happens when two or more threads each hold a lock the other needs and neither will ever release its own — a circular wait with no possible resolution, freezing the affected threads permanently. The classic case is two threads locking the same two resources in opposite order (thread A locks resource 1 then waits for resource 2, while thread B has already locked resource 2 and is waiting for resource 1). The most reliable prevention is a simple discipline: always acquire multiple locks in a single, consistent, agreed-upon order throughout the entire codebase, which makes the circular-wait pattern structurally impossible.",
        },
      ],
      commonPitfalls: [
        "Calling thread.run() directly instead of thread.start(), which executes the code synchronously on the calling thread with no actual concurrency.",
        "Forgetting to synchronize access to shared mutable state accessed by multiple threads, producing race conditions that may pass in testing and fail unpredictably in production.",
        "Synchronizing on different lock objects in different methods that touch the same shared data, providing no real mutual exclusion at all.",
        "Assuming volatile alone makes a compound operation like count++ thread-safe — it only guarantees visibility, not atomicity.",
        "Creating a new Thread for every task instead of reusing a pooled ExecutorService, incurring unnecessary creation overhead at scale.",
        "Forgetting to call shutdown() on an ExecutorService, leaving its pool threads alive and preventing the JVM from exiting cleanly.",
        "Swallowing InterruptedException silently instead of restoring the interrupt status or propagating it, which can hide a legitimate cancellation request.",
      ],
      keyTakeaways: [
        "Threads within the same process share memory — that's what makes them fast but also what makes shared mutable state dangerous.",
        "Always call start(), never run() directly, to actually run code on a separate thread.",
        "A race condition arises when multiple threads read-modify-write shared state without coordination — synchronized (or an atomic class) fixes it.",
        "synchronized only protects against other threads trying to acquire that exact same lock object — mismatched locks provide no protection.",
        "Prefer a managed ExecutorService thread pool over manually creating threads for every task.",
        "volatile guarantees visibility across threads, not atomicity — use the java.util.concurrent.atomic classes for safe compound operations like increments.",
        "Prevent deadlock by always acquiring multiple locks in the same, consistent order everywhere in the codebase.",
      ],
      links: [
        { label: "Oracle — The Java Tutorials: Concurrency", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html" },
        { label: "Oracle Java 17 API — java.util.concurrent", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/package-summary.html" },
        { label: "Baeldung — Guide to the Java ExecutorService", url: "https://www.baeldung.com/java-executor-service-tutorial" },
      ],
    },
    {
      moduleTitle: "Java Programming",
      subModuleTitle: "Building a capstone console app",
      overview:
        "This capstone sub-module pulls together everything from core syntax and OOP through collections, exceptions, and file I/O into one coherent, buildable artifact: a complete, menu-driven console application. Rather than introducing new language features, the focus here is the engineering judgment that separates a toy script from a maintainable small program — how to split responsibilities across classes, where to put validation, how to persist state between runs, and how to organize files into packages as a project grows past a single class. The running example throughout is a simple Task Tracker, but every technique (domain modeling, an interactive menu loop, file-based persistence, layered error handling, and packaging into a runnable JAR) transfers directly to any console application you build afterward.",
      sections: [
        {
          heading: "Scoping the App and Designing the Domain Model",
          body:
            "Before writing any code, a capstone project benefits from five minutes spent naming its core entities and their responsibilities: a Task Tracker needs a Task (the data), a TaskManager (the behavior — add, complete, remove, list), and a thin Main/UI layer (reads input, prints output, delegates everything else). This separation — keeping the 'what the data is' distinct from 'what operations are allowed on it' distinct from 'how the user interacts with it' — is the single-responsibility principle applied practically, and it's what makes a 200-line console app extendable later instead of one tangled main() method that's painful to modify safely.",
        },
        {
          heading: "Modeling Domain Objects with Classes and Records",
          body:
            "Java 17's record keyword is a perfect fit for simple, immutable data carriers — record Task(int id, String title, boolean done) generates a constructor, getters, equals(), hashCode(), and toString() automatically, eliminating the boilerplate a traditional class would need for pure data. Behavior-heavy, mutable objects like the TaskManager that owns the collection of tasks and coordinates operations on them are better written as a regular class, since records are designed to be immutable value types, not stateful service objects.",
          code: {
            language: "java",
            code: `public record Task(int id, String title, boolean done) {
    public Task markDone() {
        return new Task(id, title, true); // records are immutable — return a new copy
    }
}`,
          },
        },
        {
          heading: "Building the Interactive Menu Loop with Scanner",
          body:
            "The classic console-app shape is a while(true) loop that prints a menu, reads the user's choice with Scanner, dispatches to the matching method via a switch, and loops back — exiting only when the user explicitly selects a quit option. Validating the raw input before trusting it (catching a non-numeric menu choice, re-prompting instead of crashing) belongs in this loop, kept separate from the TaskManager's own business logic, so the core logic stays usable even if the UI layer is later swapped for something other than a console.",
          code: {
            language: "java",
            code: `Scanner scanner = new Scanner(System.in);
boolean running = true;

while (running) {
    System.out.println("1) Add task  2) List tasks  3) Complete task  4) Quit");
    String choice = scanner.nextLine().trim();

    switch (choice) {
        case "1" -> addTaskFlow(scanner);
        case "2" -> taskManager.listTasks();
        case "3" -> completeTaskFlow(scanner);
        case "4" -> running = false;
        default -> System.out.println("Invalid choice, try again.");
    }
}`,
          },
        },
        {
          heading: "Storing and Retrieving Data with Collections",
          body:
            "The TaskManager owns a private backing collection — typically a Map<Integer, Task> keyed by task ID for O(1) lookup, update, and removal by ID, or a simple List<Task> if sequential scanning is acceptable for the app's expected scale — and exposes only well-named methods (addTask, completeTask, removeTask, listTasks) rather than the raw collection itself. Keeping the collection private and mutating it only through these methods means every rule about valid state (an ID must be unique, a completed task can't be 'un-added') is enforced in exactly one place.",
          code: {
            language: "java",
            code: `public class TaskManager {
    private final Map<Integer, Task> tasks = new LinkedHashMap<>();
    private int nextId = 1;

    public Task addTask(String title) {
        Task task = new Task(nextId++, title, false);
        tasks.put(task.id(), task);
        return task;
    }

    public void completeTask(int id) {
        Task existing = tasks.get(id);
        if (existing == null) throw new NoSuchElementException("No task with id " + id);
        tasks.put(id, existing.markDone());
    }
}`,
          },
        },
        {
          heading: "Persisting State to a File Between Runs",
          body:
            "Without persistence, every task entered disappears the moment the program exits — a simple fix is writing each task as one line of a delimited text file (id,title,done) on every change or on exit, and reading that file back into the TaskManager's collection on startup before the menu loop begins. Using java.nio.file.Files with try-with-resources keeps the save/load logic short and leak-free, and isolating this logic into its own method (or even its own small class) keeps the TaskManager's core logic independent of exactly how persistence is implemented.",
          code: {
            language: "java",
            code: `public void saveToFile(Path path) throws IOException {
    List<String> lines = tasks.values().stream()
        .map(t -> t.id() + "," + t.title() + "," + t.done())
        .toList();
    Files.write(path, lines);
}

public void loadFromFile(Path path) throws IOException {
    if (!Files.exists(path)) return;
    for (String line : Files.readAllLines(path)) {
        String[] parts = line.split(",", 3);
        Task task = new Task(Integer.parseInt(parts[0]), parts[1], Boolean.parseBoolean(parts[2]));
        tasks.put(task.id(), task);
        nextId = Math.max(nextId, task.id() + 1);
    }
}`,
          },
        },
        {
          heading: "Validating Input and Handling Errors Gracefully",
          body:
            "User input is the single most unreliable input source in the whole program — a menu choice, a task ID, or a title might be malformed, empty, or simply wrong — so every point where raw text is converted to a number or looked up by ID needs a deliberate catch for NumberFormatException or a custom exception like TaskNotFoundException, with a clear message printed back to the user rather than an uncaught stack trace. The guiding principle: the menu loop should never crash from bad input; at worst, it should print an error and re-prompt.",
          code: {
            language: "java",
            code: `try {
    int id = Integer.parseInt(scanner.nextLine().trim());
    taskManager.completeTask(id);
    System.out.println("Marked task " + id + " as done.");
} catch (NumberFormatException e) {
    System.out.println("Please enter a valid numeric task ID.");
} catch (NoSuchElementException e) {
    System.out.println(e.getMessage());
}`,
          },
        },
        {
          heading: "Organizing Code into Packages",
          body:
            "Once the project grows past a handful of classes, grouping them into packages by role — model (Task), service (TaskManager), and app or ui (Main, the menu loop) — keeps related files together and makes the project's structure legible at a glance, the same way the earlier sub-modules' class designs separated data from behavior from presentation. Each package maps to a real folder on disk matching its dotted name (com.example.tasktracker.model lives in com/example/tasktracker/model/), and Main stays the single, thin entry point that wires the other layers together rather than containing business logic itself.",
        },
        {
          heading: "Compiling, Packaging, and Running the Finished App",
          body:
            "For a multi-file project, javac compiles every .java file at once (javac com/example/tasktracker/**/*.java, or more simply via a build tool), and java runs it by fully-qualified main class name. To distribute the finished app as a single runnable file, jar cfe app.jar com.example.tasktracker.Main -C out . packages the compiled classes into a JAR with a manifest pointing at the main class, runnable afterward with java -jar app.jar. For anything beyond a single capstone exercise, reaching for a real build tool (Maven or Gradle) to manage compilation, dependencies, and packaging is the practical next step once manual javac/jar commands become tedious.",
        },
      ],
      commonPitfalls: [
        "Putting all logic directly inside main() instead of separating it into model and service classes, making the program hard to extend or reason about.",
        "Not validating Scanner input before converting it, letting an uncaught NumberFormatException crash the whole menu loop on one bad keystroke.",
        "Forgetting to actually call the save-to-file logic before the program exits, silently losing all data entered during that run.",
        "Hardcoding an absolute, machine-specific file path for persistence instead of a relative path or a path built from a configurable constant.",
        "Exposing the TaskManager's backing collection directly instead of through methods, letting calling code bypass validation and put it into an inconsistent state.",
        "Wrapping the entire menu loop in one broad catch (Exception e) instead of handling specific, expected failure cases with clear, distinct messages.",
        "Forgetting to update the 'next ID' counter correctly after reloading persisted tasks, causing newly added tasks to collide with existing IDs.",
      ],
      keyTakeaways: [
        "Split the project into clear layers — domain data (Task), business logic (TaskManager), and the console UI loop — rather than one large main() method.",
        "Java 17 records are well suited to small, immutable data carriers; keep mutable, behavior-heavy logic in regular classes.",
        "Keep a service class's backing collection private and only mutate it through well-named public methods that enforce its own invariants.",
        "Persist state explicitly with java.nio.file on every meaningful change (or on exit) and reload it on startup, or data vanishes between runs.",
        "Validate every piece of raw user input at the boundary, and handle expected failure cases (bad ID, missing file) with specific, readable messages instead of a blanket catch.",
        "Organize files into packages by role (model/service/app) as soon as the project outgrows a single file, and package the finished result into a runnable JAR.",
      ],
      links: [
        { label: "Oracle — The Java Tutorials: Packages", url: "https://docs.oracle.com/javase/tutorial/java/package/index.html" },
        { label: "Oracle — Record Classes (JEP 395)", url: "https://docs.oracle.com/en/java/javase/17/language/records.html" },
        { label: "Baeldung — Creating a Java JAR File with Maven", url: "https://www.baeldung.com/java-create-jar" },
      ],
    },

    // ───────────────────────────── JavaScript Programming ─────────────────────────────
    {
      moduleTitle: "JavaScript Programming",
      subModuleTitle: "JS fundamentals & ES6+ syntax",
      overview:
        "JavaScript is the one language that runs natively in every browser and, via Node.js, on servers and command lines too — which means its syntax is worth learning precisely rather than by vague analogy to other languages, since a surprising number of its behaviors (type coercion, loose equality, var's scoping) differ from what experience in other C-family languages would predict. This sub-module covers modern (ES6 and later) JavaScript as it's actually written today: block-scoped variables, the primitive type system and coercion rules, template literals, destructuring, spread/rest syntax, default parameters, ES modules, and the newer optional chaining and nullish coalescing operators — building the vocabulary every later topic (functions, async code, the DOM) is written in.",
      sections: [
        {
          heading: "Variables and Block Scope: let, const, var",
          body:
            "var is function-scoped (or global-scoped if declared outside any function) and hoisted with its declaration initialized to undefined, meaning it's technically accessible — though unassigned — before its declaration line runs; this produces confusing bugs especially inside loops with asynchronous callbacks. let and const are block-scoped, confined to the nearest enclosing {}, and live in a temporal dead zone from the top of their block until their declaration line, so accessing them early throws a clear ReferenceError instead of silently returning undefined. const prevents the variable binding from being reassigned, but does not freeze the value itself — a const array or object can still have its contents mutated.",
          code: {
            language: "javascript",
            code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // logs 3, 3, 3 — one shared \`i\`
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0); // logs 0, 1, 2 — a fresh \`j\` per iteration
}

const config = { retries: 3 };
config.retries = 5; // legal — mutating the object, not reassigning \`config\``,
          },
        },
        {
          heading: "Primitive Types, typeof, and Type Coercion",
          body:
            "JavaScript has seven primitive types — string, number, boolean, undefined, null, symbol, and bigint — plus object, which arrays, functions, and dates are all specialized forms of. typeof reports a value's type at runtime but has two long-standing quirks worth memorizing: typeof null returns 'object' (a bug preserved for backward compatibility since the language's earliest versions) and typeof on an array also returns 'object' — use Array.isArray() to actually distinguish an array. The loose equality operator == coerces operands to a common type before comparing, producing famously surprising results ('' == 0 is true); the strict equality operator === compares both type and value with no coercion at all, and should be the default choice in virtually all modern code.",
          bullets: [
            "Falsy values: false, 0, -0, '', null, undefined, NaN. Everything else — including '0' and [] — is truthy.",
            "NaN is the only value never equal to itself, even to another NaN — use Number.isNaN(x), never x === NaN.",
          ],
          code: {
            language: "javascript",
            code: `console.log(typeof null);           // "object" (long-standing quirk)
console.log(Array.isArray([1, 2]));  // true — the correct way to check for an array
console.log('' == 0);                // true  — loose equality coerces
console.log('' === 0);               // false — strict equality does not`,
          },
        },
        {
          heading: "Template Literals and Modern String Methods",
          body:
            "Template literals, written with backticks instead of quotes, support embedded expressions via ${...} interpolation and genuine multi-line strings without the \\n and string-concatenation gymnastics older quoted strings required. Beyond interpolation, modern String methods cover most everyday text tasks directly: includes() for substring checks, startsWith()/endsWith(), padStart()/padEnd() for fixed-width formatting, trim() (plus trimStart()/trimEnd()), and replaceAll() for replacing every occurrence of a substring or pattern without needing a global regular expression flag.",
          code: {
            language: "javascript",
            code: `const name = "Asha";
const score = 92;
const message = \`Hello \${name}, your score is \${score}/100.
Keep it up!\`; // genuine multi-line string, no \\n needed

console.log("file.TXT".endsWith(".txt".toUpperCase())); // true
console.log("5".padStart(3, "0"));                       // "005"`,
          },
        },
        {
          heading: "Destructuring Arrays and Objects",
          body:
            "Destructuring unpacks values from arrays or properties from objects directly into named variables in a single expression, instead of accessing each one individually by index or key. Array destructuring matches by position (const [first, second] = arr), while object destructuring matches by property name (const { name, age } = user) and can rename a variable on the fly ({ name: userName }). Destructuring also works directly in function parameter lists, which is an extremely common pattern for functions that accept a single options object.",
          code: {
            language: "javascript",
            code: `const point = [10, 20];
const [x, y] = point;

const user = { name: "Raj", age: 31, city: "Pune" };
const { name, age: userAge, country = "India" } = user; // rename + default value

function createUser({ name, age = 18 }) {
  return { name, age };
}
console.log(createUser({ name: "Priya" })); // { name: "Priya", age: 18 }`,
          },
        },
        {
          heading: "Spread and Rest Operators",
          body:
            "The same ... syntax serves two opposite roles depending on context. As spread, it expands an array or object's elements/properties in place — copying an array into a new one, merging objects, or passing an array's elements as individual function arguments. As rest, it collects any remaining arguments or array/object entries into a single new array or object, commonly used to gather a variable number of function arguments or to split a few known object properties away from 'everything else'. Crucially, spread only performs a shallow copy — nested objects or arrays inside the copy still point at the same nested references as the original.",
          code: {
            language: "javascript",
            code: `const base = { theme: "dark", fontSize: 14 };
const override = { ...base, fontSize: 16 }; // spread: shallow copy + override

function sum(...numbers) { // rest: gathers all args into an array
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

const { fontSize, ...restSettings } = override; // rest in destructuring
console.log(restSettings); // { theme: "dark" }`,
          },
        },
        {
          heading: "Default Parameters and Enhanced Object Literals",
          body:
            "Function parameters can declare a default value (function greet(name = 'Guest')) that's used only when the argument is omitted or explicitly undefined — not when it's null or any other falsy value, a distinction worth remembering. Object literals support several shorthand conveniences: property shorthand ({ name } instead of { name: name } when the variable name matches the key), method shorthand ({ greet() {...} } instead of { greet: function() {...} }), and computed property names ({ [dynamicKey]: value }) for building a key from a runtime expression.",
          code: {
            language: "javascript",
            code: `function greet(name = "Guest") {
  return \`Hello, \${name}!\`;
}
console.log(greet());        // "Hello, Guest!"
console.log(greet(undefined)); // "Hello, Guest!" — default still applies
console.log(greet(null));    // "Hello, null!" — null does NOT trigger the default

const id = "score";
const stats = {
  id,                       // property shorthand
  [id + "_max"]: 100,       // computed property name
  describe() { return \`Tracking \${this.id}\`; }, // method shorthand
};`,
          },
        },
        {
          heading: "ES Modules: import and export",
          body:
            "ES Modules let a file explicitly declare what it exposes to other files with export (either named exports, any number per file, or a single default export) and what it pulls in from elsewhere with import. Each module has its own top-level scope — a variable declared in one file is never implicitly global to another, which was a real problem with plain <script> tags before modules existed. In the browser, a module is loaded with <script type=\"module\" src=\"app.js\">; in Node.js, the same import/export syntax works in .mjs files or any file when the project's package.json sets \"type\": \"module\".",
          code: {
            language: "javascript",
            code: `// mathUtils.js
export const PI = 3.14159;
export function square(n) { return n * n; }
export default function cube(n) { return n ** 3; }

// app.js
import cube, { PI, square } from "./mathUtils.js";
console.log(square(4), cube(2), PI); // 16 8 3.14159`,
          },
        },
        {
          heading: "Optional Chaining and Nullish Coalescing",
          body:
            "Optional chaining (?.) short-circuits to undefined instead of throwing when accessing a property on something that might be null or undefined — user?.address?.city returns undefined safely at any missing link in the chain rather than crashing with 'cannot read property of undefined'. A matching ?.() syntax calls a function only if it exists. The nullish coalescing operator (??) supplies a default only when the left side is specifically null or undefined — unlike ||, which falls back on every falsy value, incorrectly overriding legitimate values like 0, '', or false.",
          bullets: [
            "user?.profile?.bio ?? 'No bio provided' safely handles a missing profile AND distinguishes an intentionally empty bio from a missing one if written carefully.",
            "count || 10 wrongly replaces a real count of 0 with 10; count ?? 10 correctly keeps 0 and only replaces null/undefined.",
          ],
          code: {
            language: "javascript",
            code: `const user = { profile: null };
console.log(user.profile?.bio);         // undefined — no crash
console.log(user.profile?.bio ?? "No bio provided"); // "No bio provided"

const settings = { volume: 0 };
console.log(settings.volume || 50);  // 50 — WRONG, 0 is valid but falsy
console.log(settings.volume ?? 50);  // 0  — correct, only null/undefined fall back`,
          },
        },
      ],
      commonPitfalls: [
        "Using var out of habit, letting a variable leak out of an if/for block's scope unexpectedly since var ignores block boundaries.",
        "Confusing ?? (only replaces null/undefined) with || (replaces every falsy value), accidentally overriding a legitimate 0, '', or false default.",
        "Assuming destructuring a missing property throws an error — it silently yields undefined, which can mask a typo in the property name.",
        "Expecting the spread operator to deep-clone a nested object or array — it only performs a shallow copy, so nested references are still shared.",
        "Mixing default and named exports inconsistently across files, leading to import syntax that differs confusingly from file to file.",
        "Forgetting the matching ?.() call syntax when optional-chaining a function that might not exist, instead of just ?. on the property access.",
        "Passing null to a parameter with a default value, expecting the default to kick in — defaults only apply to undefined, not null.",
      ],
      keyTakeaways: [
        "Prefer const by default, let only when a variable will be reassigned, and avoid var entirely in new code.",
        "=== (and ??) avoid the surprising coercion that == and || silently perform.",
        "Destructuring, spread, and rest all share the ... /pattern-matching syntax family but solve different problems — unpacking, expanding, and collecting, respectively.",
        "Default parameters trigger only on undefined, never on null or other falsy values.",
        "ES Modules give each file its own scope — nothing is implicitly global the way old-style <script> tags were.",
        "Optional chaining (?.) prevents crashes on missing nested properties; nullish coalescing (??) supplies defaults only for null/undefined.",
      ],
      links: [
        { label: "MDN — JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
        { label: "MDN — Destructuring assignment", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment" },
        { label: "javascript.info — The Modern JavaScript Tutorial", url: "https://javascript.info/" },
      ],
    },
    {
      moduleTitle: "JavaScript Programming",
      subModuleTitle: "Functions, closures & scope",
      overview:
        "Functions are the central unit of reuse and abstraction in JavaScript, but understanding them deeply means going beyond 'how to write one' into how scope is actually resolved, how a function 'remembers' the variables around it after its outer context has finished (closures), and how the notoriously confusing this keyword gets its value in four genuinely different ways depending on how a function is called. This sub-module builds that depth: the practical differences between declarations, expressions, and arrow functions; lexical scoping and the scope chain; closures as the mechanism behind private state and memoization; this-binding rules and the call/apply/bind trio that control them explicitly; higher-order functions like map/filter/reduce; and the historical IIFE/module pattern that closures made possible before ES modules existed.",
      sections: [
        {
          heading: "Function Declarations, Expressions, and Arrow Functions",
          body:
            "A function declaration (function greet() {}) is fully hoisted — both its name and its body are available anywhere in the enclosing scope, even before the line it's written on. A function expression (const greet = function() {}) is only partially hoisted: the variable declaration is hoisted, but the function assignment is not, so calling it before that line throws. Arrow functions (const greet = () => {}) are always expressions, are more concise for short bodies, have no arguments object of their own, cannot be used as constructors with new, and — most significantly — do not have their own this, instead inheriting it lexically from whatever scope they were defined in.",
          code: {
            language: "javascript",
            code: `sayHi(); // works — function declarations are fully hoisted
function sayHi() { console.log("Hi!"); }

// sayBye(); // TypeError: sayBye is not a function (hoisted as undefined, not yet assigned)
const sayBye = function () { console.log("Bye!"); };`,
          },
        },
        {
          heading: "Lexical Scope and the Scope Chain",
          body:
            "JavaScript resolves a variable reference by lexical scope: the engine looks for the variable in the current function's scope, and if not found there, walks outward through each enclosing function's scope, and finally the global scope — this ordered sequence of nested scopes is the scope chain. 'Lexical' means this nesting is determined by where functions are physically written in the source code, not by which function happens to call which at runtime, which is why an inner function always has access to its outer function's variables regardless of when or from where it's eventually invoked.",
          code: {
            language: "javascript",
            code: `function outer() {
  const outerVar = "I'm from outer";
  function inner() {
    console.log(outerVar); // found by walking up the scope chain
  }
  inner();
}
outer(); // "I'm from outer"`,
          },
        },
        {
          heading: "Closures in Depth: Private State and Factories",
          body:
            "A closure is what results when an inner function is returned (or otherwise escapes) from its outer function while retaining a live reference to that outer function's variables — those variables continue to exist in memory for as long as the closure itself exists, even though the outer function has already finished running. This is the mechanism behind private state in JavaScript (a variable only accessible through functions that close over it, with no other way to reach it directly) and memoization (caching an expensive computation's result inside a closure between calls). Each call to a factory function that returns a closure creates its own, completely independent set of captured variables.",
          code: {
            language: "javascript",
            code: `function createCounter() {
  let count = 0; // private — unreachable except through the returned functions
  return {
    increment: () => ++count,
    reset: () => { count = 0; },
    getValue: () => count,
  };
}

const counterA = createCounter();
const counterB = createCounter();
counterA.increment();
counterA.increment();
console.log(counterA.getValue(), counterB.getValue()); // 2 0 — fully independent`,
          },
        },
        {
          heading: "Understanding this: Four Binding Rules",
          body:
            "this is determined by how a function is called, not where it's defined — with four main rules. Default binding: a plain function call (greet()) has this as undefined in strict mode (or the global object otherwise). Implicit binding: calling a function as a method (obj.greet()) sets this to obj. Explicit binding: call(), apply(), or bind() set this directly, overriding the other rules. New binding: calling a function with new creates a brand-new object and sets this to it. Arrow functions follow none of these — they capture this lexically from their enclosing scope at the moment they're defined, which is exactly why they're the standard choice for callbacks that need to keep referring to an outer this.",
          code: {
            language: "javascript",
            code: `const obj = {
  name: "Widget",
  logRegular: function () {
    setTimeout(function () {
      console.log(this?.name); // undefined — plain function loses \`this\`
    }, 0);
  },
  logArrow: function () {
    setTimeout(() => {
      console.log(this.name); // "Widget" — arrow inherits \`this\` from logArrow
    }, 0);
  },
};`,
          },
        },
        {
          heading: "call, apply, and bind",
          body:
            "call(thisArg, arg1, arg2, ...) and apply(thisArg, argsArray) both invoke a function immediately with an explicitly chosen this, differing only in how they accept arguments — individually versus as an array. bind(thisArg, ...) does not invoke the function at all; instead it returns a brand-new function permanently bound to the given this (and optionally some leading arguments pre-filled), which is especially useful for passing an object's method as a callback elsewhere without losing its intended this.",
          code: {
            language: "javascript",
            code: `function introduce(greeting) {
  return \`\${greeting}, I'm \${this.name}\`;
}

const person = { name: "Maya" };
console.log(introduce.call(person, "Hi"));   // "Hi, I'm Maya"
console.log(introduce.apply(person, ["Hey"])); // "Hey, I'm Maya"

const boundIntroduce = introduce.bind(person);
console.log(boundIntroduce("Hello")); // "Hello, I'm Maya" — \`this\` locked in permanently`,
          },
        },
        {
          heading: "Higher-Order Functions: map, filter, and reduce",
          body:
            "A higher-order function either accepts a function as an argument, returns a function, or both — map(), filter(), and reduce() are the three most-used examples, all accepting a callback and all returning a new array (map/filter) or a single accumulated value (reduce) without mutating the original array. map() transforms every element 1-to-1; filter() keeps only elements the callback returns true for; reduce() folds the whole array down to one value by repeatedly combining an accumulator with each element, starting from a supplied initial value.",
          code: {
            language: "javascript",
            code: `const orders = [
  { item: "Pen", qty: 3, price: 10 },
  { item: "Notebook", qty: 2, price: 50 },
  { item: "Eraser", qty: 5, price: 5 },
];

const totals = orders.map((o) => o.qty * o.price);        // [30, 100, 25]
const expensive = orders.filter((o) => o.price > 20);      // [{ item: "Notebook", ... }]
const grandTotal = orders.reduce((sum, o) => sum + o.qty * o.price, 0); // 155`,
          },
        },
        {
          heading: "IIFEs and the Classic Module Pattern",
          body:
            "An Immediately Invoked Function Expression — (function () { ... })() — defines and calls a function in one statement, creating a private scope that executes once and disappears, which was the standard pre-ES6 way to avoid leaking variables into the global scope when ES modules didn't yet exist. The 'module pattern' built on top of this: an IIFE that declares private variables internally and returns an object exposing only the methods meant to be public, directly mirroring what the factory-function closures shown earlier achieve — understanding this older pattern makes it clear that ES modules formalized a capability closures already provided, rather than inventing something entirely new.",
          code: {
            language: "javascript",
            code: `const calculator = (function () {
  let total = 0; // private, inaccessible from outside the IIFE
  return {
    add: (n) => (total += n),
    getTotal: () => total,
  };
})(); // invoked immediately

calculator.add(5);
console.log(calculator.getTotal()); // 5`,
          },
        },
        {
          heading: "Currying and Partial Application",
          body:
            "Currying transforms a function that takes multiple arguments into a sequence of functions that each take one argument, returning the next function in the chain until all arguments have been supplied — add(1)(2)(3) instead of add(1, 2, 3). Partial application is the related, slightly looser idea of pre-filling some of a function's arguments (often via bind()) to produce a more specific function for reuse later. Both techniques lean entirely on closures: each returned inner function closes over the arguments already supplied by the outer calls.",
          code: {
            language: "javascript",
            code: `const add = (a) => (b) => (c) => a + b + c;
console.log(add(1)(2)(3)); // 6

const addFive = add(5); // partially applied — \`a\` is locked in as 5
console.log(addFive(10)(20)); // 35`,
          },
        },
      ],
      commonPitfalls: [
        "Using a regular function as an object method's callback and being surprised that `this` is no longer the object inside the callback.",
        "Expecting an arrow function used directly as an object's method to have `this` bound to that object — it inherits `this` from the surrounding scope instead.",
        "Assuming all calls to a closure-returning factory function share the same captured state — each call creates an entirely independent set of variables.",
        "Relying on the `arguments` object inside an arrow function — arrow functions have no `arguments` of their own; it resolves to the enclosing function's.",
        "Calling bind() repeatedly inside a loop or on every render instead of once, creating a new bound function reference each time unnecessarily.",
        "Calling reduce() on a possibly-empty array without supplying an initial value, causing a runtime TypeError.",
        "Confusing call/apply (invoke immediately) with bind (returns a new function to invoke later) and using the wrong one for the situation.",
      ],
      keyTakeaways: [
        "Function declarations are fully hoisted; function expressions and arrow functions are not usable before their assignment line runs.",
        "Scope is lexical — determined by where code is written, not by which function calls which at runtime.",
        "A closure lets an inner function keep access to its outer function's variables long after the outer function has returned — this is the basis of private state and memoization.",
        "this is set by how a function is called (default, implicit, explicit, or new binding); arrow functions opt out entirely and inherit this lexically.",
        "call/apply invoke immediately with a chosen this; bind returns a new function permanently bound to a chosen this for later use.",
        "map/filter/reduce are the core higher-order array functions — map transforms, filter selects, reduce accumulates.",
      ],
      links: [
        { label: "MDN — Closures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures" },
        { label: "MDN — this", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this" },
        { label: "javascript.info — Function binding", url: "https://javascript.info/bind" },
      ],
    },
    {
      moduleTitle: "JavaScript Programming",
      subModuleTitle: "DOM manipulation & events",
      overview:
        "JavaScript's most visible job in the browser is reading and changing what's actually on screen, and it does this through the Document Object Model (DOM) — a live, tree-shaped, in-memory representation of every element on a page that JavaScript can query and mutate directly. This sub-module covers the DOM as part of the language's practical toolkit: how the tree is structured, selecting and traversing elements, safely creating and modifying content, styling through classes, and the event system (listeners, the event object, and bubbling) that lets a page respond to user interaction. The emphasis here is on getting the core browser APIs right as a language feature, independent of any framework, since this is the exact layer every framework's rendering eventually compiles down to.",
      sections: [
        {
          heading: "What Is the DOM? Nodes, Elements, and the Document Tree",
          body:
            "When a browser loads an HTML page, it parses the markup into a tree of Node objects — Element nodes for tags, Text nodes for raw text content, Comment nodes for HTML comments — with the single document object as the tree's root. JavaScript doesn't just read this tree once; it's a live, mutable structure, which means changing it through JavaScript immediately and visibly updates what the user sees, with no separate 're-render' step required. Every element node also exposes useful metadata directly, like tagName, id, and classList, without needing to re-parse any HTML string.",
        },
        {
          heading: "Selecting Elements with querySelector and querySelectorAll",
          body:
            "document.querySelector(selector) returns the first element matching any valid CSS selector, or null if nothing matches — that null case must always be checked before calling a method on the result, or the code throws. document.querySelectorAll(selector) returns every match as a static NodeList (a snapshot, not a live view), which supports .forEach() directly for iterating over all matches. These two methods, using ordinary CSS selector syntax, have effectively replaced the older getElementById/getElementsByClassName/getElementsByTagName for most new code, since one consistent selector syntax covers every case those older, narrower methods split apart.",
          code: {
            language: "javascript",
            code: `const title = document.querySelector("#page-title");
if (title) {
  title.textContent = "Welcome back!";
}

const allButtons = document.querySelectorAll(".btn");
allButtons.forEach((btn) => btn.classList.add("ready"));`,
          },
        },
        {
          heading: "Reading and Changing Content Safely",
          body:
            "textContent reads or writes an element's content as plain text — it's always safe, since any string assigned to it is treated as literal text, never parsed as markup. innerHTML instead parses an assigned string as HTML and rebuilds the element's children from it, which is powerful for inserting structured markup but dangerous the moment any part of that string could come from untrusted input, since an embedded <script> or event-handler attribute could then execute arbitrary code (a cross-site scripting vulnerability). As a rule: use textContent whenever you're only inserting text, and reserve innerHTML for trusted, developer-controlled markup.",
          code: {
            language: "javascript",
            code: `const userBio = "<img src=x onerror=alert('hacked')>";
const bioEl = document.querySelector("#bio");

bioEl.textContent = userBio; // SAFE — rendered as literal visible text, not executed
// bioEl.innerHTML = userBio; // DANGEROUS if userBio is untrusted user input`,
          },
        },
        {
          heading: "Creating and Removing Elements",
          body:
            "document.createElement(tagName) builds a brand-new, detached element that exists only in memory until it's inserted into the tree with appendChild(), append(), prepend(), or insertBefore(). Removing an element from the page is done with element.remove() directly on the node itself (a more recent, simpler API than the older parent.removeChild(element) pattern, though both still work). Building several new elements inside a DocumentFragment before appending them all in one operation avoids triggering a separate visual update for every single insertion when adding many elements at once.",
          code: {
            language: "javascript",
            code: `const list = document.querySelector("#fruit-list");
const fruits = ["Apple", "Mango", "Banana"];

const fragment = document.createDocumentFragment();
fruits.forEach((fruit) => {
  const li = document.createElement("li");
  li.textContent = fruit;
  fragment.appendChild(li);
});
list.appendChild(fragment); // one single DOM update for all three items`,
          },
        },
        {
          heading: "Styling via classList and the style Property",
          body:
            "classList (.add(), .remove(), .toggle(), .contains()) is the preferred way to change an element's appearance, since it works together with CSS rules already defined in a stylesheet rather than hardcoding visual values directly in JavaScript. The style property sets inline CSS directly on an element (element.style.display = 'none') and is appropriate specifically for values computed at runtime that genuinely can't be expressed as a predefined, toggleable class, such as a dynamically calculated pixel offset.",
          code: {
            language: "javascript",
            code: `const panel = document.querySelector("#panel");

panel.classList.toggle("open"); // flips current state, doesn't force a fixed outcome
console.log(panel.classList.contains("open")); // true or false, depending on prior state`,
          },
        },
        {
          heading: "Handling Events with addEventListener",
          body:
            "element.addEventListener(type, handler) attaches a listener function to run when the given event fires, and — unlike the older element.onclick = handler pattern, which allows only one handler per element and silently overwrites any previous one — addEventListener allows any number of independent listeners on the same element and event type. The handler function receives an event object with useful properties: event.target (the exact element the event originated on) and methods like event.preventDefault() (cancels a default browser action, like a form's full-page submission or a link's navigation).",
          code: {
            language: "javascript",
            code: `const form = document.querySelector("#login-form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the default full-page reload on submit
  const formData = new FormData(form);
  console.log(Object.fromEntries(formData));
});`,
          },
        },
        {
          heading: "Event Bubbling and Simple Delegation",
          body:
            "Most DOM events bubble: after firing on the exact element the interaction happened on, the same event fires again on each ancestor element, all the way up to document. This makes event delegation possible — instead of attaching one listener to every item inside a list (wasteful, and automatically broken for any item added to the list later), attach a single listener to a stable parent container and inspect event.target inside it to figure out which specific child was actually clicked. closest(selector) is the standard tool for finding the nearest matching ancestor (including the element itself) from inside a delegated handler.",
          code: {
            language: "javascript",
            code: `const list = document.querySelector("#todo-list");

list.addEventListener("click", (event) => {
  const item = event.target.closest("li"); // works for existing AND future <li> elements
  if (!item) return;
  item.classList.toggle("done");
});`,
          },
        },
        {
          heading: "Working with Forms and Basic Validation",
          body:
            "Built-in HTML validation attributes (required, minlength, pattern, type=\"email\") catch many common input errors automatically, before JavaScript even runs, and checkValidity() can be called on a form element to check this programmatically. For validation logic HTML attributes can't express — comparing two password fields, checking a value against data fetched from a server — JavaScript reads each field's .value, runs the custom check in the submit handler, and calls event.preventDefault() to block submission until the problem is fixed, typically alongside setting a visible error message element's text for the user.",
          code: {
            language: "javascript",
            code: `form.addEventListener("submit", (event) => {
  const password = form.querySelector("#password").value;
  const confirm = form.querySelector("#confirm-password").value;

  if (password !== confirm) {
    event.preventDefault();
    document.querySelector("#error").textContent = "Passwords do not match.";
  }
});`,
          },
        },
      ],
      commonPitfalls: [
        "Calling a method directly on the result of querySelector without checking for null first, crashing when the selector matches nothing on the page.",
        "Setting innerHTML with any string that includes user-provided content, opening a cross-site scripting (XSS) vulnerability instead of using textContent.",
        "Forgetting event.preventDefault() in a form submit handler, causing an unwanted full-page reload that discards any custom validation logic.",
        "Attaching an individual event listener to every item in a dynamic list instead of using delegation, so items added later never receive the handler.",
        "Using element.onclick = handler, which silently overwrites any previously assigned handler instead of adding an additional one like addEventListener does.",
        "Assuming classList.toggle() always adds a class — it flips the current state, which surprises code that expected a guaranteed, fixed outcome.",
        "Treating querySelectorAll's NodeList as fully array-like for every array method — it supports forEach() but not map()/filter() directly without converting it first with Array.from().",
      ],
      keyTakeaways: [
        "The DOM is a live, mutable tree of nodes — changing it through JavaScript immediately updates what's rendered on screen.",
        "querySelector/querySelectorAll with ordinary CSS selectors should be the default way to find elements in new code.",
        "textContent is always safe for inserting text; innerHTML is only safe with fully trusted, developer-controlled markup.",
        "addEventListener supports multiple independent listeners per element and event type; onclick = handler allows only one and overwrites silently.",
        "Event bubbling is what makes delegation possible — one listener on a stable parent can handle clicks on children that don't exist yet.",
        "Built-in HTML validation attributes handle many basic cases; JavaScript fills in whatever validation logic those attributes can't express.",
      ],
      links: [
        { label: "MDN — Introduction to the DOM", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction" },
        { label: "MDN — EventTarget.addEventListener()", url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" },
        { label: "MDN — Element: closest() method", url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/closest" },
      ],
    },
    {
      moduleTitle: "JavaScript Programming",
      subModuleTitle: "Asynchronous JS — promises & async/await",
      overview:
        "JavaScript runs on a single thread, yet web pages constantly wait on things that take real time — a network request, a timer, a file read — without ever freezing the page, and understanding exactly how that's possible (the event loop, task queues) is what separates a developer who can write async code from one who can actually debug it when it misbehaves. This sub-module traces the evolution from raw callbacks through Promises to async/await, covering Promise states and chaining, the four Promise combinators and when each is the right tool, proper error handling with try/catch around awaited code, and the subtle but important distinction between timers and microtasks that explains why asynchronous code doesn't always run in the order a beginner expects.",
      sections: [
        {
          heading: "Why JavaScript Is Single-Threaded: the Event Loop",
          body:
            "JavaScript executes all synchronous code on one single call stack, one operation at a time — there's no true parallel execution of JS code within a single context. Asynchronous operations (timers, network requests, file reads) are handed off to the browser or Node.js runtime itself, which performs the actual waiting outside of JavaScript entirely and queues a callback to run once the result is ready. The event loop is the mechanism that continuously checks whether the call stack is empty, and if so, pulls the next queued callback off a task queue and runs it — which is exactly why asynchronous code never blocks the page from responding to other things in the meantime.",
          code: {
            language: "javascript",
            code: `console.log("1: synchronous");
setTimeout(() => console.log("3: after the timer callback"), 0);
console.log("2: also synchronous");
// Output order: 1, 2, 3 — the timer callback waits for ALL synchronous code to finish first,
// even with a 0ms delay, because it's queued, not run immediately.`,
          },
        },
        {
          heading: "Callbacks and Callback Hell",
          body:
            "The original asynchronous pattern in JavaScript was passing a callback function to be invoked once an operation finished. Chaining multiple dependent asynchronous steps this way nests callback inside callback inside callback — colloquially 'callback hell' — producing code that drifts rightward with every added step and makes consistent error handling awkward, since each nested callback needs its own separate error-handling branch rather than one shared path.",
          code: {
            language: "javascript",
            code: `getUser(id, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      console.log(details); // three levels deep, and growing with every new step
    });
  });
});`,
          },
        },
        {
          heading: "Promises: Pending, Fulfilled, Rejected",
          body:
            "A Promise represents a value that will exist at some point in the future, always in exactly one of three states: pending (not yet settled), fulfilled (completed successfully, with a resulting value), or rejected (failed, with a reason). Once a Promise settles — fulfilled or rejected — it stays in that state permanently; it can never flip back to pending or switch between fulfilled and rejected. Promises are constructed with new Promise((resolve, reject) => {...}), though in practice most code consumes Promises returned by existing APIs (like fetch) rather than constructing new ones directly.",
          code: {
            language: "javascript",
            code: `function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demo() {
  console.log("waiting...");
  await delay(1000);
  console.log("done waiting"); // runs ~1 second later
}
demo();`,
          },
        },
        {
          heading: "Chaining with .then, .catch, and .finally",
          body:
            ".then(onFulfilled) attaches a callback to run once a Promise fulfills, and itself returns a new Promise — which is what makes chaining multiple sequential async steps possible without nesting, as long as each .then() returns either a plain value or another Promise for the next .then() to receive. .catch(onRejected) handles a rejection anywhere earlier in the chain, and .finally() runs regardless of outcome, commonly used for cleanup like hiding a loading indicator.",
          code: {
            language: "javascript",
            code: `fetchUser(id)
  .then((user) => fetchOrders(user.id)) // returning a Promise keeps the chain flat
  .then((orders) => renderOrders(orders))
  .catch((err) => console.error("Failed to load orders:", err))
  .finally(() => hideLoadingSpinner());`,
          },
        },
        {
          heading: "Promise Combinators: all, allSettled, race, any",
          body:
            "Promise.all([...]) runs multiple Promises concurrently and resolves with an array of all their results once every one succeeds — but rejects immediately as soon as any single one fails, discarding the others' results. Promise.allSettled([...]) never rejects; it always resolves with a {status, value|reason} object per input Promise, which is the right choice when you need every result regardless of individual failures. Promise.race([...]) settles as soon as the first Promise settles, whichever way. Promise.any([...]) resolves as soon as the first Promise fulfills, only rejecting if every single one rejects.",
          code: {
            language: "javascript",
            code: `const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(999), // suppose this one fails
]);

results.forEach((r) => {
  if (r.status === "fulfilled") console.log("Got:", r.value);
  else console.warn("Failed:", r.reason);
});`,
          },
        },
        {
          heading: "async/await Syntax",
          body:
            "async/await is syntax built on top of Promises that lets asynchronous code read top-to-bottom like ordinary synchronous code. A function marked async always returns a Promise, even if its body returns a plain value directly (which gets automatically wrapped). Inside an async function, await pauses only that function's execution until the awaited Promise settles, without blocking the rest of the program or the browser's main thread — other code elsewhere keeps running normally while the await is pending.",
          code: {
            language: "javascript",
            code: `async function loadUserOrders(id) {
  const user = await fetchUser(id);
  const orders = await fetchOrders(user.id);
  return orders;
}
// loadUserOrders(1) still returns a Promise — call it with await or .then()`,
          },
        },
        {
          heading: "Error Handling in Async Code",
          body:
            "Inside an async function, wrapping await calls in a standard try/catch block catches a rejected Promise exactly like a thrown synchronous error — this is the main practical advantage async/await has over chained .then()/.catch() once several sequential steps are involved. An async function that throws (or awaits a rejected Promise) without any surrounding try/catch produces a rejected Promise itself, which must be handled by whoever calls it; an uncaught rejection anywhere in the chain surfaces as an 'unhandled promise rejection' warning or error.",
          code: {
            language: "javascript",
            code: `async function loadUserOrders(id) {
  try {
    const user = await fetchUser(id);
    const orders = await fetchOrders(user.id);
    return orders;
  } catch (err) {
    console.error("Failed to load orders:", err.message);
    return []; // fallback instead of letting the rejection propagate unhandled
  }
}`,
          },
        },
        {
          heading: "Timers: setTimeout, setInterval, and Clearing Them",
          body:
            "setTimeout(callback, delay) schedules a callback to run once after at least the given delay in milliseconds (the delay is a minimum, not a guarantee, since the callback still has to wait its turn in the queue behind any currently running synchronous code). setInterval(callback, delay) repeats the callback indefinitely at that interval until explicitly stopped. Both return an ID that clearTimeout(id) or clearInterval(id) uses to cancel the scheduled or repeating callback — forgetting to clear an interval that's no longer needed is a common source of lingering background work and memory leaks in long-running pages.",
          code: {
            language: "javascript",
            code: `const intervalId = setInterval(() => console.log("tick"), 1000);

setTimeout(() => {
  clearInterval(intervalId); // stop the repeating tick after 5 seconds
  console.log("stopped");
}, 5000);`,
          },
        },
      ],
      commonPitfalls: [
        "Assuming setTimeout(fn, 0) runs immediately — it still waits for all currently running synchronous code to finish first, because it's queued, not executed inline.",
        "Forgetting to return a Promise from inside a .then() callback, breaking the chain so the next .then() runs before the inner asynchronous work actually finishes.",
        "Forgetting await before a Promise-returning call, ending up with the Promise object itself instead of its resolved value.",
        "Awaiting calls inside a loop sequentially when they're actually independent and could run concurrently with Promise.all for much better performance.",
        "Using Promise.all when one failing request shouldn't cancel the others — Promise.allSettled is almost always the better fit for that case.",
        "Leaving an async function's rejected Promise completely unhandled by neither try/catch-ing it nor attaching a .catch() where it's called.",
        "Forgetting to clearInterval() a repeating timer that's no longer needed, leaving it running indefinitely in the background.",
      ],
      keyTakeaways: [
        "JavaScript runs on a single thread; the event loop lets async work happen without blocking by queuing callbacks to run once the call stack is clear.",
        "A Promise settles exactly once, into either fulfilled or rejected, and can never change state again afterward.",
        "Always return a Promise (or value) from inside a .then() to keep a chain correctly sequenced.",
        "Promise.all fails fast on the first rejection; Promise.allSettled always resolves with every individual result or failure.",
        "async/await is syntax sugar over Promises — an async function always returns a Promise, and await only pauses that function, not the whole program.",
        "Wrap awaited calls in try/catch to handle rejections the same way you'd handle any other thrown error.",
      ],
      links: [
        { label: "MDN — Using Promises", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises" },
        { label: "MDN — async function", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function" },
        { label: "javascript.info — Event loop: microtasks and macrotasks", url: "https://javascript.info/event-loop" },
      ],
    },
    {
      moduleTitle: "JavaScript Programming",
      subModuleTitle: "Working with APIs & JSON",
      overview:
        "Nearly every modern application talks to a server at some point, and JSON (JavaScript Object Notation) is the universal data format that exchange happens in — a lightweight, language-agnostic text format that happens to map directly onto JavaScript's own object and array literal syntax. This sub-module covers JSON itself and its conversion methods, then walks through the Fetch API end to end: making GET requests, the easy-to-miss detail that fetch does not reject on HTTP error statuses, sending data with POST/PUT, setting the right headers, shaping the response data you receive, and cancelling an in-flight request with AbortController — the complete, practical toolkit for a JavaScript program (browser or Node) to consume any REST API correctly.",
      sections: [
        {
          heading: "What Is JSON and Why APIs Use It",
          body:
            "JSON is a plain-text data format — objects as key-value pairs in curly braces, arrays in square brackets, and only a handful of value types (string, number, boolean, null, object, array) — deliberately simpler than a full JavaScript object literal, which is why JSON keys must always be double-quoted strings and JSON cannot contain functions, undefined, or comments. Its appeal as an API exchange format is its combination of being genuinely human-readable and natively parseable in virtually every programming language, not just JavaScript, making it the de facto standard for REST APIs across the entire industry.",
          code: {
            language: "javascript",
            code: `// Valid JSON (as a string, exactly as it travels over the network):
// { "name": "Asha", "active": true, "tags": ["admin", "beta"] }

// This is NOT valid JSON (unquoted key, trailing comma, a function):
// { name: "Asha", greet: function() {}, }`,
          },
        },
        {
          heading: "JSON.stringify and JSON.parse",
          body:
            "JSON.stringify(value) converts a JavaScript value into its JSON text representation — the form actually sent over the network in a request body. JSON.parse(text) does the reverse, converting a JSON string back into a real JavaScript object or array you can work with directly. Both operations only round-trip the types JSON actually supports: functions and undefined properties are silently dropped by stringify, and Date objects get converted to plain ISO strings (and stay strings after parsing — they don't automatically become Date objects again).",
          code: {
            language: "javascript",
            code: `const user = { name: "Raj", age: 28, login: () => {}, lastSeen: undefined };
const json = JSON.stringify(user);
console.log(json); // '{"name":"Raj","age":28}' — login and lastSeen were silently dropped

const parsed = JSON.parse(json);
console.log(parsed.age); // 28 — now a real JS object again`,
          },
        },
        {
          heading: "Fetching Data with the Fetch API",
          body:
            "fetch(url) sends an HTTP GET request by default and returns a Promise that resolves with a Response object representing the server's reply. The response body isn't parsed automatically — calling response.json() (or .text(), or .blob()) returns its own separate Promise that must also be awaited before you get the actual parsed data. This two-step shape (await the fetch, then await the body-parsing method) is the standard pattern for essentially every fetch call.",
          code: {
            language: "javascript",
            code: `async function getUser(id) {
  const response = await fetch(\`https://api.example.com/users/\${id}\`);
  const user = await response.json(); // parsing the body is ALSO async
  return user;
}`,
          },
        },
        {
          heading: "Checking response.ok and Handling HTTP Errors",
          body:
            "fetch's returned Promise only rejects on genuine network-level failures — DNS failure, no connection, a CORS block — never because the server responded with an error status like 404 or 500; as far as fetch itself is concerned, any response from the server at all counts as success. This means response.ok (true only for status codes in the 200-299 range) or response.status must be checked explicitly inside the then/await code; skipping that check means a server's 404 error page gets silently treated as if it were valid data.",
          code: {
            language: "javascript",
            code: `async function getUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error(\`Request failed with status \${response.status}\`);
  }
  return response.json();
}`,
          },
        },
        {
          heading: "Sending Data: POST and PUT Requests",
          body:
            "fetch's default method is GET; sending data requires an options object as the second argument specifying method: 'POST' (or 'PUT' for a full update, 'PATCH' for a partial one) plus a body containing the payload. The body must be a string (or other supported type like FormData) — a plain JavaScript object passed directly as the body is not automatically converted, so JSON.stringify() must be called on it explicitly before sending.",
          code: {
            language: "javascript",
            code: `async function createUser(newUser) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser), // must stringify — fetch won't do it for you
  });
  if (!response.ok) throw new Error(\`Create failed: \${response.status}\`);
  return response.json();
}`,
          },
        },
        {
          heading: "Headers and Content-Type",
          body:
            "HTTP headers carry metadata about a request or response separately from the actual body content. The Content-Type request header tells the server how to interpret the body you're sending — application/json for a JSON payload — and omitting it (or sending it incorrectly) can cause a server to misinterpret or outright reject an otherwise well-formed request body. Response headers can be read from fetch's Response object via response.headers.get('header-name'), useful for things like reading a server-provided pagination total or rate-limit count.",
          code: {
            language: "javascript",
            code: `const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${token}\`,
  },
  body: JSON.stringify({ name: "Priya" }),
});
console.log(response.headers.get("X-Total-Count"));`,
          },
        },
        {
          heading: "Shaping and Validating the Response You Receive",
          body:
            "Real APIs rarely return data in exactly the shape your UI or logic wants directly — destructuring the parsed response immediately after awaiting it (const { data, meta } = await response.json()) keeps the rest of the code working with only the fields it actually needs. Since the server's response is inherently untrusted input from the program's own perspective, checking that expected fields actually exist (and are the expected type) before using them — rather than assuming the shape is always exactly as documented — prevents a malformed or unexpected response from causing confusing downstream errors.",
          code: {
            language: "javascript",
            code: `async function getActiveUserNames() {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error(\`Status \${response.status}\`);

  const { data } = await response.json();
  if (!Array.isArray(data)) throw new Error("Unexpected response shape");

  return data.filter((u) => u.active).map((u) => u.name);
}`,
          },
        },
        {
          heading: "Cancelling Requests with AbortController",
          body:
            "A fetch request left running after the code that triggered it no longer cares about the result — a user typed a newer search query, or navigated away — wastes bandwidth and risks a stale response overwriting fresher data if it resolves after a newer request. AbortController creates a signal that can be passed to fetch's options and triggered later via controller.abort(), which causes the in-flight fetch Promise to reject with an AbortError — a rejection that should typically be recognized and ignored, since it's an intentional cancellation rather than a genuine failure.",
          code: {
            language: "javascript",
            code: `let controller;

async function search(query) {
  controller?.abort(); // cancel any still-running previous search
  controller = new AbortController();

  try {
    const response = await fetch(\`/api/search?q=\${query}\`, { signal: controller.signal });
    return response.json();
  } catch (err) {
    if (err.name === "AbortError") return; // expected — a newer search superseded this one
    throw err;
  }
}`,
          },
        },
      ],
      commonPitfalls: [
        "Assuming fetch rejects on a 404 or 500 response — it only rejects on network-level failures, so response.ok must always be checked explicitly.",
        "Forgetting that response.json() itself returns a Promise and must be awaited before the parsed data is usable.",
        "Passing a plain JavaScript object directly as a fetch body instead of running it through JSON.stringify() first.",
        "Sending a POST/PUT request without setting the Content-Type: application/json header, risking the server misinterpreting or rejecting the payload.",
        "Calling JSON.parse() on a value that isn't a valid JSON string (or is already a parsed object) without catching the resulting SyntaxError.",
        "Trusting an API response's shape blindly without checking that expected fields actually exist before accessing them.",
        "Leaving a slow, now-irrelevant fetch request running instead of cancelling it with AbortController when newer input has superseded it.",
      ],
      keyTakeaways: [
        "JSON only supports strings, numbers, booleans, null, objects, and arrays — functions and undefined are silently dropped by JSON.stringify.",
        "fetch only rejects on network failures; always check response.ok (or response.status) to catch HTTP-level errors like 404 or 500.",
        "Parsing a fetch response body (response.json()) is itself asynchronous and must be awaited separately from the fetch call.",
        "A request body must be a string — call JSON.stringify() on any object before sending it, and set the Content-Type header to match.",
        "Validate the shape of data you receive from an API rather than assuming it always matches the documentation exactly.",
        "AbortController cancels an in-flight fetch cleanly, which is the right tool whenever a newer request supersedes an older, still-pending one.",
      ],
      links: [
        { label: "MDN — Using the Fetch API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" },
        { label: "MDN — JSON", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON" },
        { label: "MDN — AbortController", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController" },
      ],
    },
  ],
};

export default data;
