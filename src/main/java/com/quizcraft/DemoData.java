package com.quizcraft;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(0)
public class DemoData implements CommandLineRunner {
  private final JdbcTemplate db;
  private final JdbcStore s;
  private final PasswordEncoder encoder;

  @Value("${quizcraft.seed-demo:true}")
  boolean seed;

  @Value("${quizcraft.demo-password}")
  String password;

  public DemoData(JdbcTemplate db, JdbcStore s, PasswordEncoder encoder) {
    this.db = db;
    this.s = s;
    this.encoder = encoder;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (db.queryForObject("SELECT COUNT(*) FROM system_settings", Integer.class) == 0)
      db.update("INSERT INTO system_settings VALUES(1,'QuizNova',60,15,3,FALSE)");
    db.update(
        "UPDATE system_settings SET site_name='QuizNova' WHERE id=1 AND site_name='Quizcraft'");
    if (!seed || db.queryForObject("SELECT COUNT(*) FROM app_users", Integer.class) > 0) return;
    long now = System.currentTimeMillis();
    String hash = encoder.encode(password);
    long admin = addUser("Alex Morgan", "admin@quizcraft.dev", "ADMIN", hash, now);
    long creator = addUser("Maya Chen", "creator@quizcraft.dev", "CREATOR", hash, now);
    long creator2 = addUser("Rohan Mehta", "rohan@quizcraft.dev", "CREATOR", hash, now);
    long participant =
        addUser("Jordan Ellis", "participant@quizcraft.dev", "PARTICIPANT", hash, now);
    long priya = addUser("Priya Sharma", "priya@quizcraft.dev", "PARTICIPANT", hash, now);
    long sam = addUser("Sam Rivera", "sam@quizcraft.dev", "PARTICIPANT", hash, now);
    long aisha = addUser("Aisha Khan", "aisha@quizcraft.dev", "PARTICIPANT", hash, now);
    List<Long> quizzes = new ArrayList<>();
    quizzes.add(
        addQuiz(
            creator,
            "Java foundations",
            "A good foundation changes everything. Test your instincts on types, operators,"
                + " strings, and the JVM.",
            "Core Java",
            "Beginner",
            10,
            "APPROVED",
            now - 86400000L * 12,
            new String[][] {
              {
                "Which component executes Java bytecode?",
                "JDK compiler",
                "JVM",
                "Text editor",
                "Source loader",
                "1",
                "The Java Virtual Machine executes bytecode. javac compiles source into bytecode."
              },
              {
                "What is the default value of an instance variable of type boolean?",
                "true",
                "null",
                "false",
                "undefined",
                "2",
                "A boolean instance field defaults to false. Local variables must be initialized"
                    + " before use."
              },
              {
                "Which keyword prevents a variable from being reassigned?",
                "static",
                "private",
                "final",
                "abstract",
                "2",
                "A final variable can be assigned only once. A referenced object may still be"
                    + " mutable."
              },
              {
                "What does System.out.println(5 / 2) print?",
                "2.5",
                "2",
                "3",
                "Compilation error",
                "1",
                "Both operands are integers, so integer division discards the fractional part."
              },
              {
                "Which method compares the contents of two strings?",
                "==",
                "compareReference()",
                "equals()",
                "same()",
                "2",
                "String.equals compares character content. == checks whether references point to"
                    + " the same object."
              },
              {
                "Which is a valid Java entry point?",
                "public void main()",
                "public static void main(String[] args)",
                "static int start(String args)",
                "private static main()",
                "1",
                "The standard Java 17 entry point is public static void main(String[] args)."
              }
            }));
    quizzes.add(
        addQuiz(
            creator,
            "Think in objects",
            "Go beyond syntax. Explore inheritance, polymorphism, encapsulation, and the choices"
                + " behind good Java design.",
            "Object-oriented programming",
            "Intermediate",
            15,
            "APPROVED",
            now - 86400000L * 10,
            new String[][] {
              {
                "Which principle hides internal state behind a public interface?",
                "Inheritance",
                "Encapsulation",
                "Recursion",
                "Compilation",
                "1",
                "Encapsulation keeps implementation details and state behind a controlled"
                    + " interface."
              },
              {
                "Which keyword calls a superclass constructor?",
                "this",
                "parent",
                "super",
                "extends",
                "2",
                "super(...) invokes a constructor of the direct superclass."
              },
              {
                "Method overriding is resolved primarily at which stage?",
                "Compile time only",
                "Runtime",
                "Installation",
                "Source formatting",
                "1",
                "For instance methods, runtime dispatch chooses the implementation based on the"
                    + " object's actual class."
              },
              {
                "Can a Java class extend more than one class directly?",
                "Yes, always",
                "Only abstract classes",
                "Only final classes",
                "No",
                "3",
                "Java classes have single class inheritance but may implement multiple interfaces."
              },
              {
                "Which modifier prevents a class from being subclassed?",
                "static",
                "protected",
                "final",
                "transient",
                "2",
                "A final class cannot be extended."
              },
              {
                "An abstract class can contain which of these?",
                "Only abstract methods",
                "Only static fields",
                "Both concrete and abstract methods",
                "No constructors",
                "2",
                "Abstract classes can define state, constructors, concrete methods, and abstract"
                    + " methods."
              }
            }));
    quizzes.add(
        addQuiz(
            creator2,
            "Collections, decoded",
            "Choose the right collection for the job. Lists, sets, maps, equality, and a few"
                + " surprises along the way.",
            "Collections",
            "Intermediate",
            12,
            "APPROVED",
            now - 86400000L * 8,
            new String[][] {
              {
                "Which collection guarantees unique elements?",
                "List",
                "Set",
                "Queue",
                "Array",
                "1",
                "Set models a collection without duplicate elements according to its equality"
                    + " rules."
              },
              {
                "Which Map preserves insertion order by default?",
                "HashMap",
                "TreeMap",
                "LinkedHashMap",
                "IdentityHashMap",
                "2",
                "LinkedHashMap maintains insertion order by default, or access order when"
                    + " explicitly configured."
              },
              {
                "Average get-by-index time complexity for ArrayList is?",
                "O(1)",
                "O(n)",
                "O(log n)",
                "O(n²)",
                "0",
                "ArrayList uses a backing array and supports constant-time indexed access."
              },
              {
                "What must be consistent with equals() for hash collections?",
                "toString()",
                "hashCode()",
                "clone()",
                "finalize()",
                "1",
                "Equal objects must have the same hash code for hash-based collections to behave"
                    + " correctly."
              },
              {
                "Which collection orders elements using natural ordering by default?",
                "HashSet",
                "LinkedHashSet",
                "TreeSet",
                "ArrayDeque",
                "2",
                "TreeSet uses natural ordering unless a Comparator is supplied."
              },
              {
                "Which queue operation returns null if the queue is empty?",
                "remove()",
                "element()",
                "poll()",
                "get()",
                "2",
                "poll() returns null for an empty queue; remove() throws NoSuchElementException."
              }
            }));
    quizzes.add(
        addQuiz(
            creator,
            "Handle the unexpected",
            "Write resilient Java. Practice exception flow, resource management, and choosing the"
                + " right recovery strategy.",
            "Exception handling",
            "Beginner",
            10,
            "APPROVED",
            now - 86400000L * 6,
            new String[][] {
              {
                "Which block is intended for cleanup after a try block?",
                "catch",
                "finally",
                "throw",
                "extends",
                "1",
                "finally normally runs after try/catch, making it useful for cleanup. JVM"
                    + " termination can prevent it."
              },
              {
                "Which is a checked exception?",
                "NullPointerException",
                "IllegalArgumentException",
                "IOException",
                "ArithmeticException",
                "2",
                "IOException is checked and must be caught or declared."
              },
              {
                "Which interface enables try-with-resources?",
                "Runnable",
                "Serializable",
                "AutoCloseable",
                "Comparable",
                "2",
                "Resources in try-with-resources implement AutoCloseable so close() is called"
                    + " automatically."
              },
              {
                "Which keyword explicitly raises an exception?",
                "throws",
                "throw",
                "catch",
                "raise",
                "1",
                "throw raises an exception instance. throws declares exceptions in a method"
                    + " signature."
              },
              {
                "What is the superclass of all exceptions and errors?",
                "ObjectException",
                "RuntimeException",
                "Throwable",
                "Exception",
                "2",
                "Throwable is the common superclass of Exception and Error."
              },
              {
                "How should multiple catch blocks be ordered?",
                "General before specific",
                "Specific before general",
                "Alphabetically",
                "Order never matters",
                "1",
                "More specific exceptions must come before broader catches to avoid unreachable"
                    + " catch blocks."
              }
            }));
    quizzes.add(
        addQuiz(
            creator2,
            "Streams & lambdas",
            "Find your flow with functional interfaces, stream pipelines, transformations, and lazy"
                + " evaluation.",
            "Streams & lambdas",
            "Advanced",
            20,
            "APPROVED",
            now - 86400000L * 4,
            new String[][] {
              {
                "Which stream operation is terminal?",
                "filter()",
                "map()",
                "count()",
                "peek()",
                "2",
                "count() produces a result and terminates the stream pipeline."
              },
              {
                "A functional interface has how many abstract methods?",
                "Zero",
                "Exactly one",
                "Exactly two",
                "Any number",
                "1",
                "A functional interface has one abstract method, excluding qualifying Object"
                    + " methods. Default and static methods are allowed."
              },
              {
                "Which operation transforms each stream element?",
                "filter()",
                "map()",
                "sorted()",
                "distinct()",
                "1",
                "map() transforms elements; filter() selects elements based on a predicate."
              },
              {
                "What happens if you reuse a stream after a terminal operation?",
                "It restarts",
                "It returns cached results",
                "It may throw IllegalStateException",
                "It becomes parallel",
                "2",
                "Streams are single-use. A detected reuse after consumption throws"
                    + " IllegalStateException."
              },
              {
                "Which operation flattens nested streams?",
                "map()",
                "flatMap()",
                "reduce()",
                "limit()",
                "1",
                "flatMap() maps each element to a stream and flattens the resulting streams."
              },
              {
                "When are intermediate stream operations generally executed?",
                "Immediately when declared",
                "When a terminal operation runs",
                "At compilation",
                "Before the source is created",
                "1",
                "Intermediate operations are lazy; terminal operations trigger processing."
              }
            }));
    quizzes.add(
        addQuiz(
            creator,
            "Concurrency workshop",
            "Threads, shared state, and execution. Put your understanding of concurrent Java to the"
                + " test.",
            "Concurrency",
            "Advanced",
            20,
            "APPROVED",
            now - 86400000L * 2,
            new String[][] {
              {
                "Which method starts a new thread of execution?",
                "run()",
                "start()",
                "executeNow()",
                "launch()",
                "1",
                "Thread.start() starts a new thread that calls run(). Calling run() directly stays"
                    + " on the current thread."
              },
              {
                "What does synchronized primarily provide?",
                "Guaranteed fairness",
                "Mutual exclusion and visibility",
                "Immutable objects",
                "Automatic parallelism",
                "1",
                "Synchronized blocks provide mutual exclusion and establish memory visibility"
                    + " through monitor happens-before rules."
              },
              {
                "Which class supports atomic integer increments?",
                "Integer",
                "AtomicInteger",
                "BigInteger",
                "MutableInt",
                "1",
                "AtomicInteger supports operations like incrementAndGet() with atomic semantics."
              },
              {
                "Which service manages pools of worker threads?",
                "StreamService",
                "ExecutorService",
                "ThreadManager",
                "ClassLoader",
                "1",
                "ExecutorService manages task execution and lifecycle, often through a thread pool."
              },
              {
                "Does volatile make count++ atomic?",
                "Yes",
                "Only with two threads",
                "No",
                "Only on long values",
                "2",
                "Volatile provides visibility and ordering. count++ is a read-modify-write"
                    + " operation and is not made atomic."
              },
              {
                "What does Future.get() do before the result is ready?",
                "Returns null immediately",
                "Blocks until completion or failure",
                "Cancels the task",
                "Starts a new task",
                "1",
                "Future.get() waits for task completion and returns its result or throws an"
                    + " exception."
              }
            }));
    addQuiz(
        creator,
        "Generics in practice",
        "A practical review of type parameters, bounds, and reusable APIs.",
        "Generics",
        "Intermediate",
        15,
        "PENDING",
        now - 86400000L,
        new String[][] {
          {
            "What does List<? extends Number> represent?",
            "A list of Object",
            "A list of an unknown subtype of Number",
            "A list of Number's parent types",
            "A raw list",
            "1",
            "An extends wildcard is useful when reading values as Number from a list of an unknown"
                + " Number subtype."
          },
          {
            "What does type erasure do?",
            "Deletes every generic class",
            "Replaces type parameters with bounds during compilation",
            "Runs generics at runtime",
            "Disables type checking",
            "1",
            "Java implements generics largely through compile-time checks and type erasure."
          }
        });
    addQuiz(
        creator,
        "JVM under the hood",
        "A deeper dive into memory, class loading, and garbage collection.",
        "JVM internals",
        "Advanced",
        20,
        "DRAFT",
        now,
        new String[][] {
          {
            "Where are most Java objects allocated?",
            "Thread stack",
            "Heap",
            "CPU register only",
            "Source file",
            "1",
            "Objects are conceptually allocated on the heap, although JVM optimizations can"
                + " eliminate allocations."
          }
        });
    long[] people = {participant, priya, sam, aisha};
    int[][] scores = {{4, 5, 3}, {6, 5, 6}, {4, 4, 5}, {5, 6, 4}};
    for (int p = 0; p < people.length; p++)
      for (int i = 0; i < 3; i++)
        seedAttempt(
            people[p], quizzes.get(i), scores[p][i], now - 86400000L * (8 - i * 2) + p * 300000);
    db.update(
        "INSERT INTO messages(sender_id,recipient_id,body,created_at) VALUES(?,?,?,?)",
        creator,
        participant,
        "Welcome to Quizcraft! Your Java foundations are coming along. Try the exception handling"
            + " quiz next, and send me a note if anything feels unclear.",
        now - 3600000);
    db.update(
        "INSERT INTO messages(sender_id,recipient_id,body,created_at) VALUES(?,?,?,?)",
        participant,
        creator,
        "Thanks, Maya! I'd love a little more practice with interfaces and abstract classes.",
        now - 1800000);
    db.update(
        "INSERT INTO reminders(user_id,quiz_id,remind_at,created_at) VALUES(?,?,?,?)",
        participant,
        quizzes.get(3),
        now + 86400000,
        now);
  }

  private long addUser(String name, String email, String role, String hash, long now) {
    return s.insert(
        "INSERT INTO app_users(name,email,password_hash,role,active,created_at)"
            + " VALUES(?,?,?,?,TRUE,?)",
        name,
        email,
        hash,
        role,
        now);
  }

  private long addQuiz(
      long creator,
      String title,
      String description,
      String topic,
      String difficulty,
      int duration,
      String status,
      long created,
      String[][] questions) {
    long id =
        s.insert(
            "INSERT INTO"
                + " quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,created_at)"
                + " VALUES(?,?,?,?,?,?,?,?)",
            title,
            description,
            topic,
            difficulty,
            duration,
            creator,
            status,
            created);
    for (int i = 0; i < questions.length; i++) {
      var q = questions[i];
      db.update(
          "INSERT INTO"
              + " questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation)"
              + " VALUES(?,?,?,?,?,?,?,?,?)",
          id,
          i,
          q[0],
          q[1],
          q[2],
          q[3],
          q[4],
          Integer.parseInt(q[5]),
          q[6]);
    }
    return id;
  }

  private void seedAttempt(long user, long quiz, int score, long started) {
    var questions =
        s.rows("SELECT id,correct_index FROM questions WHERE quiz_id=? ORDER BY position", quiz);
    long id =
        s.insert(
            "INSERT INTO"
                + " attempts(quiz_id,participant_id,started_at,deadline_at,submitted_at,score,total,pass_percent)"
                + " VALUES(?,?,?,?,?,?,?,60)",
            quiz,
            user,
            started,
            started + 600000,
            started + 240000,
            score,
            questions.size());
    for (int i = 0; i < questions.size(); i++) {
      var q = questions.get(i);
      int correct = ((Number) q.get("correctIndex")).intValue();
      db.update(
          "INSERT INTO answers VALUES(?,?,?)",
          id,
          q.get("id"),
          i < score ? correct : (correct + 1) % 4);
    }
  }
}
