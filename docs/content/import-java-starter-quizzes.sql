-- QuizNova Java starter library: 6 quizzes / 36 questions.
-- Imports content only. Does not create accounts, passwords or sample attempts.
-- Re-running the unchanged import does not duplicate quizzes.
BEGIN;
DO $quiznova$
DECLARE owner_id BIGINT; quiz_id BIGINT;
BEGIN
  PERFORM id FROM system_settings WHERE id=1 FOR UPDATE;
  SELECT id INTO owner_id FROM app_users WHERE role='ADMIN' AND active=TRUE ORDER BY id LIMIT 1;
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Create an administrator before importing quizzes'; END IF;
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE review_note='QuizNova Java starter library v1 / 1') THEN
    INSERT INTO quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,review_note,created_at)
    VALUES('Java foundations','A good foundation changes everything. Test your instincts on types, operators, strings, and the JVM.','Core Java','Beginner',10,owner_id,'APPROVED','QuizNova Java starter library v1 / 1',(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT) RETURNING id INTO quiz_id;
    INSERT INTO questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation) VALUES
      (quiz_id,0,'Which component executes Java bytecode?','JDK compiler','JVM','Text editor','Source loader',1,'The Java Virtual Machine executes bytecode. javac compiles source into bytecode.'),
      (quiz_id,1,'What is the default value of an instance variable of type boolean?','true','null','false','undefined',2,'A boolean instance field defaults to false. Local variables must be initialized before use.'),
      (quiz_id,2,'Which keyword prevents a variable from being reassigned?','static','private','final','abstract',2,'A final variable can be assigned only once. A referenced object may still be mutable.'),
      (quiz_id,3,'What does System.out.println(5 / 2) print?','2.5','2','3','Compilation error',1,'Both operands are integers, so integer division discards the fractional part.'),
      (quiz_id,4,'Which method compares the contents of two strings?','==','compareReference()','equals()','same()',2,'String.equals compares character content. == checks whether references point to the same object.'),
      (quiz_id,5,'Which is a valid Java entry point?','public void main()','public static void main(String[] args)','static int start(String args)','private static main()',1,'The standard Java 17 entry point is public static void main(String[] args).');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE review_note='QuizNova Java starter library v1 / 2') THEN
    INSERT INTO quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,review_note,created_at)
    VALUES('Think in objects','Go beyond syntax. Explore inheritance, polymorphism, encapsulation, and the choices behind good Java design.','Object-oriented programming','Intermediate',15,owner_id,'APPROVED','QuizNova Java starter library v1 / 2',(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT) RETURNING id INTO quiz_id;
    INSERT INTO questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation) VALUES
      (quiz_id,0,'Which principle hides internal state behind a public interface?','Inheritance','Encapsulation','Recursion','Compilation',1,'Encapsulation keeps implementation details and state behind a controlled interface.'),
      (quiz_id,1,'Which keyword calls a superclass constructor?','this','parent','super','extends',2,'super(...) invokes a constructor of the direct superclass.'),
      (quiz_id,2,'Method overriding is resolved primarily at which stage?','Compile time only','Runtime','Installation','Source formatting',1,'For instance methods, runtime dispatch chooses the implementation based on the object''s actual class.'),
      (quiz_id,3,'Can a Java class extend more than one class directly?','Yes, always','Only abstract classes','Only final classes','No',3,'Java classes have single class inheritance but may implement multiple interfaces.'),
      (quiz_id,4,'Which modifier prevents a class from being subclassed?','static','protected','final','transient',2,'A final class cannot be extended.'),
      (quiz_id,5,'An abstract class can contain which of these?','Only abstract methods','Only static fields','Both concrete and abstract methods','No constructors',2,'Abstract classes can define state, constructors, concrete methods, and abstract methods.');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE review_note='QuizNova Java starter library v1 / 3') THEN
    INSERT INTO quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,review_note,created_at)
    VALUES('Collections, decoded','Choose the right collection for the job. Lists, sets, maps, equality, and a few surprises along the way.','Collections','Intermediate',12,owner_id,'APPROVED','QuizNova Java starter library v1 / 3',(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT) RETURNING id INTO quiz_id;
    INSERT INTO questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation) VALUES
      (quiz_id,0,'Which collection guarantees unique elements?','List','Set','Queue','Array',1,'Set models a collection without duplicate elements according to its equality rules.'),
      (quiz_id,1,'Which Map preserves insertion order by default?','HashMap','TreeMap','LinkedHashMap','IdentityHashMap',2,'LinkedHashMap maintains insertion order by default, or access order when explicitly configured.'),
      (quiz_id,2,'Average get-by-index time complexity for ArrayList is?','O(1)','O(n)','O(log n)','O(nÂ²)',0,'ArrayList uses a backing array and supports constant-time indexed access.'),
      (quiz_id,3,'What must be consistent with equals() for hash collections?','toString()','hashCode()','clone()','finalize()',1,'Equal objects must have the same hash code for hash-based collections to behave correctly.'),
      (quiz_id,4,'Which collection orders elements using natural ordering by default?','HashSet','LinkedHashSet','TreeSet','ArrayDeque',2,'TreeSet uses natural ordering unless a Comparator is supplied.'),
      (quiz_id,5,'Which queue operation returns null if the queue is empty?','remove()','element()','poll()','get()',2,'poll() returns null for an empty queue; remove() throws NoSuchElementException.');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE review_note='QuizNova Java starter library v1 / 4') THEN
    INSERT INTO quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,review_note,created_at)
    VALUES('Handle the unexpected','Write resilient Java. Practice exception flow, resource management, and choosing the right recovery strategy.','Exception handling','Beginner',10,owner_id,'APPROVED','QuizNova Java starter library v1 / 4',(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT) RETURNING id INTO quiz_id;
    INSERT INTO questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation) VALUES
      (quiz_id,0,'Which block is intended for cleanup after a try block?','catch','finally','throw','extends',1,'finally normally runs after try/catch, making it useful for cleanup. JVM termination can prevent it.'),
      (quiz_id,1,'Which is a checked exception?','NullPointerException','IllegalArgumentException','IOException','ArithmeticException',2,'IOException is checked and must be caught or declared.'),
      (quiz_id,2,'Which interface enables try-with-resources?','Runnable','Serializable','AutoCloseable','Comparable',2,'Resources in try-with-resources implement AutoCloseable so close() is called automatically.'),
      (quiz_id,3,'Which keyword explicitly raises an exception?','throws','throw','catch','raise',1,'throw raises an exception instance. throws declares exceptions in a method signature.'),
      (quiz_id,4,'What is the superclass of all exceptions and errors?','ObjectException','RuntimeException','Throwable','Exception',2,'Throwable is the common superclass of Exception and Error.'),
      (quiz_id,5,'How should multiple catch blocks be ordered?','General before specific','Specific before general','Alphabetically','Order never matters',1,'More specific exceptions must come before broader catches to avoid unreachable catch blocks.');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE review_note='QuizNova Java starter library v1 / 5') THEN
    INSERT INTO quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,review_note,created_at)
    VALUES('Streams & lambdas','Find your flow with functional interfaces, stream pipelines, transformations, and lazy evaluation.','Streams & lambdas','Advanced',20,owner_id,'APPROVED','QuizNova Java starter library v1 / 5',(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT) RETURNING id INTO quiz_id;
    INSERT INTO questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation) VALUES
      (quiz_id,0,'Which stream operation is terminal?','filter()','map()','count()','peek()',2,'count() produces a result and terminates the stream pipeline.'),
      (quiz_id,1,'A functional interface has how many abstract methods?','Zero','Exactly one','Exactly two','Any number',1,'A functional interface has one abstract method, excluding qualifying Object methods. Default and static methods are allowed.'),
      (quiz_id,2,'Which operation transforms each stream element?','filter()','map()','sorted()','distinct()',1,'map() transforms elements; filter() selects elements based on a predicate.'),
      (quiz_id,3,'What happens if you reuse a stream after a terminal operation?','It restarts','It returns cached results','It may throw IllegalStateException','It becomes parallel',2,'Streams are single-use. A detected reuse after consumption throws IllegalStateException.'),
      (quiz_id,4,'Which operation flattens nested streams?','map()','flatMap()','reduce()','limit()',1,'flatMap() maps each element to a stream and flattens the resulting streams.'),
      (quiz_id,5,'When are intermediate stream operations generally executed?','Immediately when declared','When a terminal operation runs','At compilation','Before the source is created',1,'Intermediate operations are lazy; terminal operations trigger processing.');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE review_note='QuizNova Java starter library v1 / 6') THEN
    INSERT INTO quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,review_note,created_at)
    VALUES('Concurrency workshop','Threads, shared state, and execution. Put your understanding of concurrent Java to the test.','Concurrency','Advanced',20,owner_id,'APPROVED','QuizNova Java starter library v1 / 6',(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT) RETURNING id INTO quiz_id;
    INSERT INTO questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation) VALUES
      (quiz_id,0,'Which method starts a new thread of execution?','run()','start()','executeNow()','launch()',1,'Thread.start() starts a new thread that calls run(). Calling run() directly stays on the current thread.'),
      (quiz_id,1,'What does synchronized primarily provide?','Guaranteed fairness','Mutual exclusion and visibility','Immutable objects','Automatic parallelism',1,'Synchronized blocks provide mutual exclusion and establish memory visibility through monitor happens-before rules.'),
      (quiz_id,2,'Which class supports atomic integer increments?','Integer','AtomicInteger','BigInteger','MutableInt',1,'AtomicInteger supports operations like incrementAndGet() with atomic semantics.'),
      (quiz_id,3,'Which service manages pools of worker threads?','StreamService','ExecutorService','ThreadManager','ClassLoader',1,'ExecutorService manages task execution and lifecycle, often through a thread pool.'),
      (quiz_id,4,'Does volatile make count++ atomic?','Yes','Only with two threads','No','Only on long values',2,'Volatile provides visibility and ordering. count++ is a read-modify-write operation and is not made atomic.'),
      (quiz_id,5,'What does Future.get() do before the result is ready?','Returns null immediately','Blocks until completion or failure','Cancels the task','Starts a new task',1,'Future.get() waits for task completion and returns its result or throws an exception.');
  END IF;
END; $quiznova$;
COMMIT;
SELECT q.title,q.status,q.duration_minutes,COUNT(p.id) AS questions FROM quizzes q JOIN questions p ON p.quiz_id=q.id WHERE q.review_note LIKE 'QuizNova Java starter library v1 / %' GROUP BY q.id,q.title,q.status,q.duration_minutes ORDER BY q.id;
