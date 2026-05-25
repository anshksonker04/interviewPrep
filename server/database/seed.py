import sys
import os
import datetime

# Add the parent directory to Python path to ensure module resolution works
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server.app import create_app
from server.database.db import db
from server.models import User, Quiz, Question, Attempt

def seed_database():
    app = create_app()
    with app.app_context():
        print("Initializing database...")
        db.drop_all()
        db.create_all()
        print("Database schemas created.")

        print("Seeding users...")
        # Create Default Admin
        admin = User(name="Prep Admin", email="admin@prep.com", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)

        # Create Default Student
        student = User(name="Alex Student", email="student@prep.com", role="student")
        student.set_password("student123")
        db.session.add(student)
        
        # Flush to get IDs
        db.session.commit()
        print(f"Users seeded: Admin (admin@prep.com) and Student (student@prep.com).")

        # Quizzes and Questions mapping
        quizzes_data = [
            {
                "title": "DBMS Core & SQL Fundamentals",
                "topic": "DBMS",
                "difficulty": "Easy",
                "questions": [
                    {
                        "question": "Which of the following SQL constraints ensures that all values in a column are unique and not null?",
                        "option_a": "UNIQUE KEY",
                        "option_b": "PRIMARY KEY",
                        "option_c": "FOREIGN KEY",
                        "option_d": "CHECK",
                        "correct_answer": "B",
                        "explanation": "A PRIMARY KEY constraint uniquely identifies each record in a database table. It must contain unique values and cannot contain NULL values."
                    },
                    {
                        "question": "Which normal form deals with removing multi-valued dependencies?",
                        "option_a": "1NF",
                        "option_b": "2NF",
                        "option_c": "3NF",
                        "option_d": "4NF",
                        "correct_answer": "D",
                        "explanation": "4NF (Fourth Normal Form) requires that there are no non-trivial multi-valued dependencies of attribute sets on anything other than a candidate key."
                    },
                    {
                        "question": "What is the correct order of execution of clauses in a SQL SELECT statement?",
                        "option_a": "SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY",
                        "option_b": "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY",
                        "option_c": "FROM, GROUP BY, HAVING, WHERE, SELECT, ORDER BY",
                        "option_d": "SELECT, WHERE, FROM, GROUP BY, HAVING, ORDER BY",
                        "correct_answer": "B",
                        "explanation": "SQL query execution begins at FROM, applies WHERE filtering, groups rows with GROUP BY, filters groups with HAVING, projects columns with SELECT, and sorts using ORDER BY."
                    }
                ]
            },
            {
                "title": "Operating Systems & Memory Management",
                "topic": "Operating Systems",
                "difficulty": "Medium",
                "questions": [
                    {
                        "question": "What is the main purpose of virtual memory?",
                        "option_a": "To speed up CPU clock cycles.",
                        "option_b": "To enable execution of programs larger than the physical RAM.",
                        "option_c": "To back up system directories dynamically.",
                        "option_d": "To encrypt active background processes.",
                        "correct_answer": "B",
                        "explanation": "Virtual memory maps virtual addresses used by a program into physical addresses in computer memory, allowing programs larger than RAM to execute by swapping blocks (pages) to secondary storage."
                    },
                    {
                        "question": "Which of the following conditions is NOT required for a deadlock to occur?",
                        "option_a": "Mutual Exclusion",
                        "option_b": "Hold and Wait",
                        "option_c": "Preemption",
                        "option_d": "Circular Wait",
                        "correct_answer": "C",
                        "explanation": "Deadlock conditions are: Mutual Exclusion, Hold & Wait, No Preemption (meaning processes cannot be preempted), and Circular Wait. Thus, 'Preemption' (having preemption) prevents deadlocks."
                    },
                    {
                        "question": "In which scheduling algorithm is starvation a potential drawback?",
                        "option_a": "First-Come First-Served (FCFS)",
                        "option_b": "Round Robin (RR)",
                        "option_c": "Shortest Job First (SJF) / Priority Scheduling",
                        "option_d": "FIFO",
                        "correct_answer": "C",
                        "explanation": "Priority and SJF scheduling algorithms can suffer from starvation where low-priority or long processes wait indefinitely while high-priority or short jobs keep arriving."
                    }
                ]
            },
            {
                "title": "Computer Networks & TCP/IP Protocol Suit",
                "topic": "Computer Networks",
                "difficulty": "Hard",
                "questions": [
                    {
                        "question": "Which layer of the OSI model is responsible for reliable node-to-node delivery and flow control?",
                        "option_a": "Network Layer",
                        "option_b": "Data Link Layer",
                        "option_c": "Transport Layer",
                        "option_d": "Physical Layer",
                        "correct_answer": "B",
                        "explanation": "The Data Link layer is responsible for node-to-node (hop-to-hop) frame delivery, error control, flow control, and access control. The Transport layer is responsible for end-to-end (process-to-process) delivery."
                    },
                    {
                        "question": "What is the size of an IPv6 address in bits?",
                        "option_a": "32 bits",
                        "option_b": "64 bits",
                        "option_c": "128 bits",
                        "option_d": "256 bits",
                        "correct_answer": "C",
                        "explanation": "IPv6 addresses are 128-bit identifiers for interfaces on individual nodes, typically represented in 8 groups of 4 hexadecimal digits separated by colons."
                    },
                    {
                        "question": "In networking, what is the primary role of the ARP protocol?",
                        "option_a": "Translate domain names to IP addresses.",
                        "option_b": "Map an IP address to a physical MAC address.",
                        "option_c": "Provide dynamic IP assignments to clients.",
                        "option_d": "Establish 3-way TCP handshakes.",
                        "correct_answer": "B",
                        "explanation": "ARP (Address Resolution Protocol) maps dynamic IP addresses (Network Layer) to fixed physical MAC hardware addresses (Data Link Layer) on a local area network."
                    }
                ]
            },
            {
                "title": "Object-Oriented Programming (OOP) Principles",
                "topic": "OOPs",
                "difficulty": "Easy",
                "questions": [
                    {
                        "question": "Which OOP concept represents the ability to present a single interface for multiple forms or types?",
                        "option_a": "Abstraction",
                        "option_b": "Encapsulation",
                        "option_c": "Polymorphism",
                        "option_d": "Inheritance",
                        "correct_answer": "C",
                        "explanation": "Polymorphism (meaning 'many forms') allows subclasses to provide specific implementations of methods defined in their superclasses, executing the appropriate override based on the runtime type."
                    },
                    {
                        "question": "What does encapsulation accomplish?",
                        "option_a": "Hiding internal data details and restricting direct access.",
                        "option_b": "Enabling a class to inherit members from another class.",
                        "option_c": "Compiling source files into virtual machine bytecodes.",
                        "option_d": "Overloading operators with custom user-defined logic.",
                        "correct_answer": "A",
                        "explanation": "Encapsulation binds data variables and the methods that operate on them together within a single class unit, hiding implementation details and enforcing access controls (public/private)."
                    }
                ]
            },
            {
                "title": "DSA: Core Data Structures & Time Complexity",
                "topic": "DSA",
                "difficulty": "Hard",
                "questions": [
                    {
                        "question": "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (BST)?",
                        "option_a": "O(1)",
                        "option_b": "O(log N)",
                        "option_c": "O(N)",
                        "option_d": "O(N log N)",
                        "correct_answer": "B",
                        "explanation": "In a balanced BST, the height is constrained to log(N). Since search complexity is proportional to height, both average and worst-case searches are completed in O(log N) operations."
                    },
                    {
                        "question": "Which data structure follows the Last-In First-Out (LIFO) access strategy?",
                        "option_a": "Queue",
                        "option_b": "Stack",
                        "option_c": "Linked List",
                        "option_d": "Binary Tree",
                        "correct_answer": "B",
                        "explanation": "A Stack inserts and removes items from the same end, resulting in the most recently inserted item being processed first (Last-In, First-Out)."
                    },
                    {
                        "question": "Which sorting algorithm has a guaranteed worst-case time complexity of O(N log N)?",
                        "option_a": "Bubble Sort",
                        "option_b": "Quick Sort",
                        "option_c": "Merge Sort",
                        "option_d": "Insertion Sort",
                        "correct_answer": "C",
                        "explanation": "Merge Sort is a divide-and-conquer algorithm that guarantees a time complexity of O(N log N) in best, average, and worst cases. Quick Sort can degrade to O(N^2) in worst-case layouts."
                    }
                ]
            },
            {
                "title": "Quantitative & Verbal Aptitude",
                "topic": "Aptitude",
                "difficulty": "Medium",
                "questions": [
                    {
                        "question": "A can complete a piece of work in 10 days, and B can complete the same work in 15 days. Working together, how many days will they take?",
                        "option_a": "5 days",
                        "option_b": "6 days",
                        "option_c": "8 days",
                        "option_d": "12 days",
                        "correct_answer": "B",
                        "explanation": "A's rate = 1/10 per day. B's rate = 1/15 per day. Joint rate = 1/10 + 1/15 = 5/30 = 1/6. Therefore, together they take 1 / (1/6) = 6 days."
                    },
                    {
                        "question": "A train 120m long passes a telegraph post in 6 seconds. What is the speed of the train in kilometers per hour?",
                        "option_a": "54 km/h",
                        "option_b": "72 km/h",
                        "option_c": "60 km/h",
                        "option_d": "80 km/h",
                        "correct_answer": "B",
                        "explanation": "Speed = Distance / Time = 120m / 6s = 20 m/s. Converting to km/h: 20 * (18 / 5) = 72 km/h."
                    }
                ]
            },
            {
                "title": "Java Programming Fundamentals",
                "topic": "Java",
                "difficulty": "Medium",
                "questions": [
                    {
                        "question": "Which component of Java is responsible for converting bytecode into machine-executable machine instructions?",
                        "option_a": "JDK",
                        "option_b": "JRE",
                        "option_c": "JVM",
                        "option_d": "Javac Compiler",
                        "correct_answer": "C",
                        "explanation": "The JVM (Java Virtual Machine) loads bytecodes, compiles/interprets it, and runs the corresponding instructions on hardware processors."
                    },
                    {
                        "question": "What is the default value of a local variable in Java?",
                        "option_a": "0",
                        "option_b": "null",
                        "option_c": "Depends on the type",
                        "option_d": "No default value (Causes compilation error if accessed uninitialized)",
                        "correct_answer": "D",
                        "explanation": "Local variables in Java are declared on the stack and must be explicitly initialized before use; they do not have default values, and accessing them uninitialized triggers compile-time errors."
                    }
                ]
            },
            {
                "title": "Python Core and Advanced Concepts",
                "topic": "Python",
                "difficulty": "Easy",
                "questions": [
                    {
                        "question": "Which of the following data types in Python is immutable?",
                        "option_a": "List",
                        "option_b": "Dictionary",
                        "option_c": "Tuple",
                        "option_d": "Set",
                        "correct_answer": "C",
                        "explanation": "Tuples are immutable sequence types in Python; once created, their values and lengths cannot be modified or re-allocated."
                    },
                    {
                        "question": "What does a decorator do in Python?",
                        "option_a": "Removes unused dynamic imports.",
                        "option_b": "Wraps a function or class to extend or alter its runtime behavior.",
                        "option_c": "Compiles script syntax into standard C library templates.",
                        "option_d": "Converts dictionaries into JSON files.",
                        "correct_answer": "B",
                        "explanation": "A decorator takes a callable object as an argument, performs some wrapping, and returns a modified callable wrapper, injecting aspects dynamically."
                    }
                ]
            }
        ]

        print("Seeding quizzes and questions...")
        seeded_quizzes = []
        for q_data in quizzes_data:
            # Procedurally generate additional questions to ensure each quiz has 40 questions
            existing_count = len(q_data["questions"])
            for i in range(existing_count + 1, 41):
                q_data["questions"].append({
                    "question": f"Practice question {i} for {q_data['topic']}. Which of the following is the most accurate statement regarding this concept?",
                    "option_a": f"Option A - Standard {q_data['topic']} implementation detail",
                    "option_b": f"Option B - Common {q_data['topic']} misconception",
                    "option_c": f"Option C - Alternative {q_data['topic']} concept",
                    "option_d": f"Option D - Unrelated {q_data['topic']} principle",
                    "correct_answer": "A",
                    "explanation": f"This is an auto-generated explanation for practice question {i} in the {q_data['topic']} module. In a real scenario, this would explain why Option A is the correct implementation detail."
                })

            quiz = Quiz(
                title=q_data["title"],
                topic=q_data["topic"],
                difficulty=q_data["difficulty"]
            )
            db.session.add(quiz)
            db.session.flush() # Populate quiz ID for questions referencing it
            seeded_quizzes.append(quiz)
            
            for q_item in q_data["questions"]:
                q_obj = Question(
                    quiz_id=quiz.id,
                    question=q_item["question"],
                    option_a=q_item["option_a"],
                    option_b=q_item["option_b"],
                    option_c=q_item["option_c"],
                    option_d=q_item["option_d"],
                    correct_answer=q_item["correct_answer"],
                    explanation=q_item["explanation"]
                )
                db.session.add(q_obj)

        # Flush to DB
        db.session.commit()
        print(f"Successfully seeded {len(seeded_quizzes)} quizzes.")

        print("Seeding baseline history attempts for Student Alex...")
        # Add 3 historical attempts spread over the last 2 days to create streak/performance trends
        now = datetime.datetime.utcnow()
        day_ago = now - datetime.timedelta(days=1)
        two_days_ago = now - datetime.timedelta(days=2)

        # 1. DBMS quiz attempt - 2 days ago
        dbms_quiz = Quiz.query.filter_by(topic="DBMS").first()
        if dbms_quiz:
            attempt1 = Attempt(
                user_id=student.id,
                quiz_id=dbms_quiz.id,
                score=2,
                total_questions=3,
                accuracy=(2/3)*100,
                time_taken=120, # 2 minutes
                attempted_at=two_days_ago
            )
            db.session.add(attempt1)

        # 2. OOPs quiz attempt - 1 day ago
        oops_quiz = Quiz.query.filter_by(topic="OOPs").first()
        if oops_quiz:
            attempt2 = Attempt(
                user_id=student.id,
                quiz_id=oops_quiz.id,
                score=2,
                total_questions=2,
                accuracy=100.0,
                time_taken=45, # 45 seconds
                attempted_at=day_ago
            )
            db.session.add(attempt2)

        # 3. OS quiz attempt - Today
        os_quiz = Quiz.query.filter_by(topic="Operating Systems").first()
        if os_quiz:
            attempt3 = Attempt(
                user_id=student.id,
                quiz_id=os_quiz.id,
                score=2,
                total_questions=3,
                accuracy=(2/3)*100,
                time_taken=180, # 3 minutes
                attempted_at=now
            )
            db.session.add(attempt3)

        db.session.commit()
        print("Historical attempts seeded successfully.")
        print("Database seeding completed.")

if __name__ == '__main__':
    seed_database()
