const questionsData = {
  basic: {
    title: "Basic Computer and Web",
    colorClass: "section-basic",
    accentColor: "#06b6d4", // Cyan
    flashcards: [
      // Part 1: Q1
      {
        id: "basic_p1_1a",
        group: "Basic Concepts",
        q: "What is a CPU and what is its primary function?",
        a: "CPU (Central Processing Unit): The \"brain\" of the computer that performs calculations and executes instructions."
      },
      {
        id: "basic_p1_1b",
        group: "Basic Concepts",
        q: "State the main difference between RAM and ROM.",
        a: "RAM (Random Access Memory) is volatile (loses data when power is off) and is used for active tasks. ROM (Read-Only Memory) is non-volatile (keeps data) and stores permanent instructions like system boot-up."
      },
      {
        id: "basic_p1_1c",
        group: "Basic Concepts",
        q: "What is an Operating System (OS)?",
        a: "Operating System: Software that manages all computer hardware and software resources (e.g., Windows, macOS, Linux)."
      },
      {
        id: "basic_p1_1d",
        group: "Basic Concepts",
        q: "What is the purpose of an IP Address?",
        a: "IP Address: A unique numerical label assigned to a device on a network, used to identify it and allow communication."
      },
      // Part 1: Q2
      {
        id: "basic_p1_2a",
        group: "Web Browser Terms",
        q: "What is a web browser?",
        a: "Web Browser: A software application used to access, retrieve, and display information (like web pages) on the World Wide Web."
      },
      {
        id: "basic_p1_2b",
        group: "Web Browser Terms",
        q: "What is the purpose of the browser 'cache'?",
        a: "Cache: A temporary storage area that saves copies of web pages, images, and files to make the browser load them faster on future visits."
      },
      {
        id: "basic_p1_2c",
        group: "Web Browser Terms",
        q: "What does URL stand for?",
        a: "URL: Uniform Resource Locator (the address of a resource on the internet, e.g., https://www.google.com)."
      },
      {
        id: "basic_p1_2d",
        group: "Web Browser Terms",
        q: "What is a 'cookie' in the context of web browsing?",
        a: "Cookie: A small piece of data sent from a website and stored on the user's computer by the browser, used to remember information about the user (like login status or items in a cart)."
      },
      // Part 1: Q3
      {
        id: "basic_p1_3a",
        group: "HTML & CSS",
        q: "What does HTML stand for and what is its role?",
        a: "HTML (HyperText Markup Language): Used to structure the content of a web page (e.g., headings, paragraphs, links)."
      },
      {
        id: "basic_p1_3b",
        group: "HTML & CSS",
        q: "What does CSS stand for and what is its role?",
        a: "CSS (Cascading Style Sheets): Used to style the appearance and layout of a web page (e.g., colors, fonts, positioning)."
      },
      {
        id: "basic_p1_3c",
        group: "HTML & CSS",
        q: "Write a CSS rule to select an element with the ID header and set its background color to blue.",
        a: "#header { background-color: blue; }"
      },
      {
        id: "basic_p1_3d",
        group: "HTML & CSS",
        q: "Write the HTML tag used to create a hyperlink.",
        a: "The <a> tag (anchor tag)."
      },
      // Part 2: Explain Questions
      {
        id: "basic_p2_1",
        group: "Deep Dive Concepts",
        q: "Explain why an Operating System (OS) is essential for a modern computer.",
        a: "An Operating System acts as the primary manager for the computer's hardware and software. It is essential because it handles fundamental tasks like memory management, process scheduling, and file storage. It also provides a user interface (like a desktop or command line) so a human can interact with the machine, and it allows different applications (like a browser and a word processor) to run simultaneously without interfering with each other."
      },
      {
        id: "basic_p2_2",
        group: "Deep Dive Concepts",
        q: "Describe the relationship between HTML and CSS. Why is it considered good practice to keep them in separate files?",
        a: "HTML (HyperText Markup Language) provides the structure and content of a web page (e.g., the headings, paragraphs, and images). CSS (Cascading Style Sheets) provides the style and presentation (e.g., the colors, fonts, and layout). Keeping them separate (e.g., an .html file and a .css file) is good practice for \"Separation of Concerns.\" This makes the code cleaner, easier to maintain, and reusable. A single CSS file can style many HTML pages, ensuring a consistent look and feel across an entire website."
      },
      {
        id: "basic_p2_3",
        group: "Deep Dive Concepts",
        q: "Explain what a browser 'cache' is used for. Why might a user need to manually clear their cache?",
        a: "A browser cache is a temporary storage area on the user's computer. When you visit a website, the browser downloads elements like logos, images, and CSS files and saves them in the cache. On your next visit, the browser can load these files directly from the cache instead of re-downloading them, which makes the page load much faster. A user might need to clear their cache if a website has been updated, but the browser is still loading the old, cached version. Clearing it forces the browser to download the new files."
      },
      // Part 3: Short Q&A
      {
        id: "basic_p3_1",
        group: "Quick Q&A",
        q: "What is the difference between hardware and software?",
        a: "Hardware refers to the physical components of a computer (like the CPU, monitor, and keyboard). Software refers to the non-physical programs and instructions that run on the hardware (like the operating system or a web browser)."
      },
      {
        id: "basic_p3_2",
        group: "Quick Q&A",
        q: "What does RAM stand for, and what is its primary use?",
        a: "RAM stands for Random Access Memory. It is volatile (temporary) memory used by the computer to store data for actively running programs, allowing for fast access and multitasking."
      },
      {
        id: "basic_p3_3",
        group: "Quick Q&A",
        q: "What is the main purpose of a web browser?",
        a: "A web browser (like Chrome or Firefox) is a software application used to retrieve, present, and traverse information resources on the World Wide Web, primarily by interpreting HTML, CSS, and JavaScript."
      },
      {
        id: "basic_p3_4",
        group: "Quick Q&A",
        q: "What is the difference between an HTML id attribute and a class attribute?",
        a: "An id must be unique to a single element on a page (e.g., #header). A class can be applied to multiple elements to group them (e.g., .list-item)."
      },
      {
        id: "basic_p3_5",
        group: "Quick Q&A",
        q: "What is the HTML tag for creating a hyperlink, and what attribute defines its destination?",
        a: "The tag is <a> (anchor tag). The href attribute defines the destination URL."
      },
      {
        id: "basic_p3_6",
        group: "Quick Q&A",
        q: "What does CSS stand for, and what problem does it solve?",
        a: "CSS stands for Cascading Style Sheets. It solves the problem of presentation by separating the document's content (HTML) from its visual style (CSS), allowing for cleaner code and easier site-wide style changes."
      }
    ],
    trueFalse: [
      {
        id: "basic_tf_1",
        q: "RAM (Random Access Memory) is volatile, meaning it loses its data when the computer is turned off.",
        a: true,
        explanation: "Correct! RAM is temporary memory that is cleared once power is shut down."
      },
      {
        id: "basic_tf_2",
        q: "The CPU (Central Processing Unit) is responsible for storing files long-term.",
        a: false,
        explanation: "This is the job of a hard drive or SSD. The CPU is the processing unit, not long-term storage."
      },
      {
        id: "basic_tf_3",
        q: "HTML is a programming language used to create dynamic web applications.",
        a: false,
        explanation: "HTML is a markup language used to structure content, not a programming language."
      },
      {
        id: "basic_tf_4",
        q: "CSS (Cascading Style Sheets) is used to define the style and layout of an HTML document.",
        a: true,
        explanation: "Correct! CSS is dedicated to control styling, presentation, and responsiveness."
      },
      {
        id: "basic_tf_5",
        q: "In HTML, the id attribute can be used on multiple elements, but the class attribute must be unique to one element.",
        a: false,
        explanation: "It is the opposite: the id attribute must be unique to one element, while classes can be reused across many elements."
      },
      {
        id: "basic_tf_6",
        q: "A web browser's cache stores copies of web page elements to speed up loading times on future visits.",
        a: true,
        explanation: "Correct! Caching avoids downloading redundant static files again, improving speed."
      }
    ],
    fillBlanks: [
      {
        id: "basic_fb_1",
        text: "The physical components of a computer that you can touch, like the monitor and keyboard, are called {blank}.",
        a: "hardware"
      },
      {
        id: "basic_fb_2",
        text: "The {blank} (Central Processing Unit) is often called the \"brain\" of the computer.",
        a: "CPU"
      },
      {
        id: "basic_fb_3",
        text: "{blank} (Random Access Memory) is volatile memory used to store data for programs that are currently running.",
        a: "RAM"
      },
      {
        id: "basic_fb_4",
        text: "An {blank} (like Windows or macOS) manages all the computer's hardware and software.",
        a: "Operating System"
      },
      {
        id: "basic_fb_5",
        text: "A software application used to access and view websites on the internet is called a {blank}.",
        a: "browser"
      },
      {
        id: "basic_fb_6",
        text: "The unique address of a webpage, like https://www.google.com, is called a {blank} (Uniform Resource Locator).",
        a: "URL"
      },
      {
        id: "basic_fb_7",
        text: "{blank} stands for HyperText Markup Language and is used to create the structure of a web page.",
        a: "HTML"
      },
      {
        id: "basic_fb_8",
        text: "{blank} stands for Cascading Style Sheets and is used to control the visual presentation and layout of a web page.",
        a: "CSS"
      },
      {
        id: "basic_fb_9",
        text: "The HTML tag used to define the largest heading is <{blank}>.",
        a: "h1"
      },
      {
        id: "basic_fb_10",
        text: "The HTML tag used to create a hyperlink is <{blank}>, and its destination is set with the href attribute.",
        a: "a"
      },
      {
        id: "basic_fb_11",
        text: "To apply a style to one specific, unique element on a page, you would use the HTML {blank} attribute.",
        a: "id"
      },
      {
        id: "basic_fb_12",
        text: "To apply a style to multiple elements on a page, you would use the HTML {blank} attribute.",
        a: "class"
      }
    ]
  },
  c: {
    title: "C Programming",
    colorClass: "section-c",
    accentColor: "#8b5cf6", // Violet
    flashcards: [
      // Part 1: Q4
      {
        id: "c_p1_4a",
        group: "C Fundamentals",
        q: "What is the syntax to include a standard library header file like \"Standard Input/Output\"?",
        a: "#include <stdio.h>"
      },
      {
        id: "c_p1_4b",
        group: "C Fundamentals",
        q: "What is the purpose of the main() function in C?",
        a: "It is the entry point of the C program; execution begins from this function."
      },
      {
        id: "c_p1_4c",
        group: "C Fundamentals",
        q: "What punctuation mark is used to end most statements in C?",
        a: "The semicolon (;)."
      },
      {
        id: "c_p1_4d",
        group: "C Fundamentals",
        q: "What is the data type used to store a whole number (e.g., 5, -10)?",
        a: "int"
      },
      // Part 1: Q5
      {
        id: "c_p1_5a",
        group: "Variables & I/O",
        q: "Write the C syntax to declare an integer variable named count and initialize it to 0.",
        a: "int count = 0;"
      },
      {
        id: "c_p1_5b",
        group: "Variables & I/O",
        q: "Which function is used to print output to the console?",
        a: "printf()"
      },
      {
        id: "c_p1_5c",
        group: "Variables & I/O",
        q: "Which function is used to read formatted input from the console?",
        a: "scanf()"
      },
      {
        id: "c_p1_5d",
        group: "Variables & I/O",
        q: "What is the format specifier for printing an integer (int)?",
        a: "%d"
      },
      // Part 1: Q6
      {
        id: "c_p1_6a",
        group: "Control Structures",
        q: "What keyword is used for conditional execution (i.e., to check if a condition is true)?",
        a: "if"
      },
      {
        id: "c_p1_6b",
        group: "Control Structures",
        q: "What is the keyword for a loop that checks the condition before each iteration?",
        a: "while"
      },
      {
        id: "c_p1_6c",
        group: "Control Structures",
        q: "What is the keyword for a loop that executes at least once and checks the condition after the iteration?",
        a: "do (used as do...while)"
      },
      {
        id: "c_p1_6d",
        group: "Control Structures",
        q: "What keyword is used to define a constant (a variable that cannot be changed)?",
        a: "const"
      },
      // Part 2: Explain Questions
      {
        id: "c_p2_4",
        group: "Deep Dive Concepts",
        q: "Explain the purpose of a header file (like stdio.h) in C. Why not just write all the code, including functions like printf, in your main .c file?",
        a: "A header file (.h) contains function declarations, macros, and type definitions. When you #include <stdio.h>, you are telling the compiler, \"I intend to use functions declared in this file (like printf and scanf).\" This allows the compiler to check that you are using the functions correctly (e.g., correct number of arguments). The actual definition (the compiled code) for printf is linked later. This approach promotes modularity, reusability, and keeps your source code clean, as you don't have to redefine standard functions every time."
      },
      {
        id: "c_p2_5",
        group: "Deep Dive Concepts",
        q: "Compare and contrast a while loop and a do...while loop. In what situation would you specifically choose a do...while loop?",
        a: "Both while and do...while are loops that repeat a block of code as long as a condition is true. The key difference is when the condition is checked.\nA while loop is a \"pre-test\" loop. It checks the condition before running the loop body. If the condition is false the first time, the loop body will never execute.\nA do...while loop is a \"post-test\" loop. It runs the loop body first and then checks the condition. This guarantees the loop body will always execute at least one time. You would specifically use a do...while loop when you need an action to happen at least once, such as presenting a menu to a user and then asking if they want to repeat the action."
      },
      {
        id: "c_p2_6",
        group: "Deep Dive Concepts",
        q: "Explain the concept of \"scope\" in C, using the terms \"global variable\" and \"local variable.\"",
        a: "\"Scope\" refers to the region of a program where a variable can be seen and accessed. A local variable is declared inside a function (or code block like a loop). Its scope is limited to that function. It is created when the function starts and destroyed when the function ends. No other function can see or use it. A global variable is declared outside of all functions, usually at the top of the file. Its scope is the entire program, meaning any function can access and modify it."
      },
      // Part 3: Short Q&A
      {
        id: "c_p3_1",
        group: "Quick Q&A",
        q: "What character is used to terminate almost every statement in C?",
        a: "The semicolon (;)."
      },
      {
        id: "c_p3_2",
        group: "Quick Q&A",
        q: "What is the preprocessor directive used to include a standard library file like \"Standard Input/Output\"?",
        a: "#include <stdio.h>"
      },
      {
        id: "c_p3_3",
        group: "Quick Q&A",
        q: "What is the name of the function that serves as the entry point for every C program?",
        a: "The main() function."
      },
      {
        id: "c_p3_4",
        group: "Quick Q&A",
        q: "What function is used to read formatted input from the user (e.g., an integer)?",
        a: "The scanf() function (e.g., scanf(\"%d\", &variableName);)."
      },
      {
        id: "c_p3_5",
        group: "Quick Q&A",
        q: "What is the difference between the & and * operators in the context of pointers?",
        a: "& is the \"address-of\" operator (gets the memory address of a variable). * is the \"dereference\" operator (gets the value at a memory address)."
      },
      {
        id: "c_p3_6",
        group: "Quick Q&A",
        q: "What is the keyword used to define a variable that cannot be modified after it is initialized?",
        a: "const"
      }
    ],
    trueFalse: [
      {
        id: "c_tf_1",
        q: "Every C program must have a function named start().",
        a: false,
        explanation: "Every C program must have a function named main(), which serves as the entry point."
      },
      {
        id: "c_tf_2",
        q: "A semicolon (;) is used to end most statements in C.",
        a: true,
        explanation: "Correct! Statements are terminated with a semicolon in C."
      },
      {
        id: "c_tf_3",
        q: "The #include directive is used to define a new variable.",
        a: false,
        explanation: "#include is a preprocessor directive used to import header files and libraries, not define variables."
      },
      {
        id: "c_tf_4",
        q: "In C, int x = 10; and Int x = 10; are syntactically the same because C is not case-sensitive.",
        a: false,
        explanation: "C is highly case-sensitive. 'Int' with a capital 'I' is unrecognized and will cause a compiler error."
      },
      {
        id: "c_tf_5",
        q: "The printf() function is used to read formatted input from the user.",
        a: false,
        explanation: "printf() is used for output. The scanf() function is used to read formatted input."
      },
      {
        id: "c_tf_6",
        q: "The & operator is used to get the memory address of a variable.",
        a: true,
        explanation: "Correct! It is the address-of operator, yielding a pointer to that variable."
      }
    ],
    fillBlanks: [
      {
        id: "c_fb_1",
        text: "Every C program's execution begins at the {blank} function.",
        a: "main"
      },
      {
        id: "c_fb_2",
        text: "Almost every statement in C must end with a {blank}.",
        a: "semicolon"
      },
      {
        id: "c_fb_3",
        text: "The preprocessor directive #include <{blank}.h> is used to include the standard input-output library.",
        a: "stdio"
      },
      {
        id: "c_fb_4",
        text: "The {blank} function is used to print formatted text to the console.",
        a: "printf"
      },
      {
        id: "c_fb_5",
        text: "The {blank} function is used to read formatted input from the user.",
        a: "scanf"
      },
      {
        id: "c_fb_6",
        text: "The format specifier {blank} is used with printf() and scanf() for an integer (int).",
        a: "%d"
      },
      {
        id: "c_fb_7",
        text: "The {blank} operator is used to get the memory address of a variable.",
        a: "&"
      },
      {
        id: "c_fb_8",
        text: "A variable that stores a memory address is called a {blank}.",
        a: "pointer"
      },
      {
        id: "c_fb_9",
        text: "The keyword {blank} is used to define a variable whose value cannot be changed.",
        a: "const"
      },
      {
        id: "c_fb_10",
        text: "A while loop checks its condition {blank} (before/after) executing the loop's body.",
        a: "before"
      },
      {
        id: "c_fb_11",
        text: "A do...while loop is guaranteed to execute at least {blank} time(s).",
        a: "one"
      },
      {
        id: "c_fb_12",
        text: "A single-line comment in C starts with {blank}.",
        a: "//"
      }
    ]
  },
  python: {
    title: "Python Programming",
    colorClass: "section-python",
    accentColor: "#eab308", // Amber/Yellow
    flashcards: [
      // Part 1: Q7
      {
        id: "python_p1_7a",
        group: "Python Fundamentals",
        q: "Is Python generally considered a compiled or an interpreted language?",
        a: "Interpreted."
      },
      {
        id: "python_p1_7b",
        group: "Python Fundamentals",
        q: "What symbol is used to start a single-line comment in Python?",
        a: "The hash symbol (#)."
      },
      {
        id: "python_p1_7c",
        group: "Python Fundamentals",
        q: "Which keyword is used to define a function in Python?",
        a: "def"
      },
      {
        id: "python_p1_7d",
        group: "Python Fundamentals",
        q: "How do you print the text \"Hello\" to the console in Python?",
        a: "print(\"Hello\")"
      },
      // Part 1: Q8
      {
        id: "python_p1_8a",
        group: "Data Structures",
        q: "What is the primary difference between a List and a Tuple?",
        a: "A List is mutable (can be changed) and uses square brackets []. A Tuple is immutable (cannot be changed) and uses parentheses ()."
      },
      {
        id: "python_p1_8b",
        group: "Data Structures",
        q: "What data structure is used to store key-value pairs?",
        a: "A Dictionary."
      },
      {
        id: "python_p1_8c",
        group: "Data Structures",
        q: "What syntax is used to create an empty list?",
        a: "[] or list()"
      },
      {
        id: "python_p1_8d",
        group: "Data Structures",
        q: "How is a code block (like in a loop or function) defined in Python?",
        a: "Indentation."
      },
      // Part 1: Q9
      {
        id: "python_p1_9a",
        group: "Variables & Operators",
        q: "Do you need to declare a variable's data type before using it in Python? (Yes/No)",
        a: "No."
      },
      {
        id: "python_p1_9b",
        group: "Variables & Operators",
        q: "Write the syntax to assign the value 10 to a variable named x.",
        a: "x = 10"
      },
      {
        id: "python_p1_9c",
        group: "Variables & Operators",
        q: "What operator is used to check for equality (if two values are equal)?",
        a: "=="
      },
      {
        id: "python_p1_9d",
        group: "Variables & Operators",
        q: "What operator is used to get the remainder of a division (modulo)?",
        a: "The percent symbol (%)."
      },
      // Part 2: Explain Questions
      {
        id: "python_p2_7",
        group: "Deep Dive Concepts",
        q: "Python is often described as a \"dynamically-typed\" language. What does this mean, and how does it differ from a \"statically-typed\" language like C or Java?",
        a: "\"Dynamically-typed\" means that in Python, you do not have to declare a variable's data type. A variable (e.g., x) is just a name, and its type is determined at runtime based on the value assigned to it (e.g., x = 10 makes x an integer, and x = \"hello\" later makes the same variable a string). In a \"statically-typed\" language like C or Java, you must explicitly declare the variable's type (e.g., int x;) and it cannot be changed. This provides more type-safety at compile-time but is less flexible."
      },
      {
        id: "python_p2_8",
        group: "Deep Dive Concepts",
        q: "Explain the key difference between a Python List and a Tuple. Why would you ever choose to use a Tuple when a List seems more flexible?",
        a: "The key difference is mutability. A List (e.g., [1, 2, 3]) is mutable, meaning you can add, remove, or change elements after it's created. A Tuple (e.g., (1, 2, 3)) is immutable, meaning once it's created, it cannot be changed. You would choose a Tuple when you want to store data that should not be accidentally modified. Because they are immutable, Tuples are also \"hashable,\" which means they can be used as keys in a dictionary, whereas Lists cannot. They can also be slightly more memory-efficient."
      },
      {
        id: "python_p2_9",
        group: "Deep Dive Concepts",
        q: "Describe the importance of indentation in Python. How does this differ from how languages like C or Java define code blocks?",
        a: "In Python, indentation is not just for readability; it is a syntactic rule. It is used to define code blocks (e.g., the body of a function, a loop, or an if statement). The code that is indented under a statement is considered part of that block. In languages like C and Java, code blocks are defined explicitly using curly braces ({ ... }). Indentation in those languages is only for human readability and is ignored by the compiler."
      },
      // Part 3: Short Q&A
      {
        id: "python_p3_1",
        group: "Quick Q&A",
        q: "How does Python define a code block (e.g., the body of a loop or function)?",
        a: "Python uses indentation (consistent spaces or tabs) to define code blocks."
      },
      {
        id: "python_p3_2",
        group: "Quick Q&A",
        q: "What is the built-in function used to get the number of items in a list or string?",
        a: "The len() function (e.g., len(my_list))."
      },
      {
        id: "python_p3_3",
        group: "Quick Q&A",
        q: "What is the main difference between a Python List and a Tuple?",
        a: "A List is mutable (can be changed after creation) and uses square brackets []. A Tuple is immutable (cannot be changed) and uses parentheses ()."
      },
      {
        id: "python_p3_4",
        group: "Quick Q&A",
        q: "What data structure in Python is used to store data as key-value pairs?",
        a: "A Dictionary (e.g., {'name': 'Alice', 'age': 30})."
      },
      {
        id: "python_p3_5",
        group: "Quick Q&A",
        q: "What keyword is used to define a function in Python?",
        a: "The def keyword."
      },
      {
        id: "python_p3_6",
        group: "Quick Q&A",
        q: "How do you add a new item to the end of a list?",
        a: "By using the .append() method (e.g., my_list.append(new_item))."
      }
    ],
    trueFalse: [
      {
        id: "python_tf_1",
        q: "Python uses significant indentation (whitespace) to define code blocks.",
        a: true,
        explanation: "Correct! Indentation is syntax in Python and is mandatory to establish scope/blocks."
      },
      {
        id: "python_tf_2",
        q: "A Python List is immutable, meaning it cannot be changed after creation.",
        a: false,
        explanation: "Lists are mutable. You can add, remove, and change items dynamically. Tuples are immutable."
      },
      {
        id: "python_tf_3",
        q: "The def keyword is used to define a new variable in Python.",
        a: false,
        explanation: "The def keyword is used to define functions. Variables are defined simply by assigning them a value."
      },
      {
        id: "python_tf_4",
        q: "Python is a statically-typed language, meaning you must declare a variable's data type before assigning a value.",
        a: false,
        explanation: "Python is dynamically-typed. Variable types are inferred at runtime based on the assigned value."
      },
      {
        id: "python_tf_5",
        q: "A Python Dictionary stores data in ordered, indexed sequences.",
        a: false,
        explanation: "Dictionaries store data in unordered (or insertion-ordered in newer versions) key-value pairs, accessed by keys rather than indexes."
      },
      {
        id: "python_tf_6",
        q: "The # symbol is used to start a single-line comment in Python.",
        a: true,
        explanation: "Correct! The hash symbol starts a comment, causing the interpreter to ignore the rest of the line."
      }
    ],
    fillBlanks: [
      {
        id: "python_fb_1",
        text: "Python uses {blank} to define code blocks, rather than curly braces or keywords.",
        a: "indentation"
      },
      {
        id: "python_fb_2",
        text: "A single-line comment in Python starts with the {blank} symbol.",
        a: "#"
      },
      {
        id: "python_fb_3",
        text: "The {blank} keyword is used to define a new function.",
        a: "def"
      },
      {
        id: "python_fb_4",
        text: "The built-in {blank}() function is used to display output on the console.",
        a: "print"
      },
      {
        id: "python_fb_5",
        text: "A {blank} is a mutable (changeable) ordered collection, created with square brackets [].",
        a: "list"
      },
      {
        id: "python_fb_6",
        text: "A {blank} is an immutable (unchangeable) ordered collection, created with parentheses ().",
        a: "tuple"
      },
      {
        id: "python_fb_7",
        text: "A {blank} is an unordered collection of key-value pairs, created with curly braces {}.",
        a: "dictionary"
      },
      {
        id: "python_fb_8",
        text: "To add a new item to the end of a list, you use the list's {blank}() method.",
        a: "append"
      },
      {
        id: "python_fb_9",
        text: "Python is a {blank}-typed language, meaning you do not need to declare a variable's data type.",
        a: "dynamically"
      },
      {
        id: "python_fb_10",
        text: "The {blank}() function is used to get the number of items in a list or the length of a string.",
        a: "len"
      },
      {
        id: "python_fb_11",
        text: "The {blank} operator is used to check for value equality.",
        a: "=="
      },
      {
        id: "python_fb_12",
        text: "The for loop in Python is used to {blank} over a sequence (like a list or string).",
        a: "iterate"
      }
    ]
  },
  sql: {
    title: "SQL Database Programming",
    colorClass: "section-sql",
    accentColor: "#10b981", // Emerald
    flashcards: [
      // Part 1: Q10
      {
        id: "sql_p1_10a",
        group: "SQL Fundamentals",
        q: "What does SQL stand for and what is its primary purpose?",
        a: "SQL stands for Structured Query Language. Its primary purpose is to store, manipulate, and retrieve data in a relational database."
      },
      {
        id: "sql_p1_10b",
        group: "SQL Fundamentals",
        q: "What is a Database Management System (DBMS)?",
        a: "A Database Management System (DBMS) is software used to manage databases, allowing users to store, retrieve, and update information (e.g., MySQL, PostgreSQL, SQLite)."
      },
      {
        id: "sql_p1_10c",
        group: "SQL Fundamentals",
        q: "What is the difference between a database and a table?",
        a: "A database is a container that holds a collection of data tables and other related objects. A table is a structured set of data within the database consisting of vertical columns and horizontal rows."
      },
      {
        id: "sql_p1_10d",
        group: "SQL Fundamentals",
        q: "What keyword is used to retrieve data from a table?",
        a: "SELECT"
      },
      // Part 1: Q11
      {
        id: "sql_p1_11a",
        group: "Keys & Commands",
        q: "What is a Primary Key?",
        a: "Primary Key: A column (or set of columns) that uniquely identifies each row in a table. It cannot contain NULL values and must be unique."
      },
      {
        id: "sql_p1_11b",
        group: "Keys & Commands",
        q: "What is a Foreign Key?",
        a: "Foreign Key: A column (or set of columns) in one table that refers to the Primary Key in another table, establishing a link/relationship between them."
      },
      {
        id: "sql_p1_11c",
        group: "Keys & Commands",
        q: "What SQL command/keyword is used to add new rows to a table?",
        a: "INSERT (specifically INSERT INTO)"
      },
      {
        id: "sql_p1_11d",
        group: "Keys & Commands",
        q: "What SQL command/keyword is used to remove rows from a table?",
        a: "DELETE (specifically DELETE FROM)"
      },
      // Part 1: Q12
      {
        id: "sql_p1_12a",
        group: "Syntax & Queries",
        q: "How do you select all columns from a table named employees?",
        a: "SELECT * FROM employees;"
      },
      {
        id: "sql_p1_12b",
        group: "Syntax & Queries",
        q: "Which clause is used to filter rows based on a specific condition?",
        a: "The WHERE clause."
      },
      {
        id: "sql_p1_12c",
        group: "Syntax & Queries",
        q: "What keyword is used to sort the result set of a query?",
        a: "ORDER BY"
      },
      {
        id: "sql_p1_12d",
        group: "Syntax & Queries",
        q: "What operator is used to search for a specified pattern in a column?",
        a: "The LIKE operator."
      },
      // Part 2: Explain Questions
      {
        id: "sql_p2_10",
        group: "Deep Dive Concepts",
        q: "Explain the concept of a \"Relational Database\" and how it organizes data. What is the standard language used to interact with it?",
        a: "A Relational Database organizes data into one or more tables (or \"relations\") of columns and rows, where each row represents a unique record and each column represents a data attribute. Tables can be linked-or related-based on common data. The standard language used to interact with a relational database is SQL (Structured Query Language), which allows users to query, update, and manage the data easily."
      },
      {
        id: "sql_p2_11",
        group: "Deep Dive Concepts",
        q: "Explain the difference between a \"Primary Key\" and a \"Foreign Key\" using a database relation analogy (e.g., Customers and Orders).",
        a: "A Primary Key is a unique identifier for a record in a table, ensuring no two rows are identical (e.g., CustomerID in a Customers table). A Foreign Key is a column in a table that references the Primary Key of another table to create a relationship (e.g., CustomerID in an Orders table). This link ensures referential integrity; for instance, you cannot place an order for a customer who doesn't exist in the Customers table."
      },
      {
        id: "sql_p2_12",
        group: "Deep Dive Concepts",
        q: "Compare and contrast the WHERE clause and the HAVING clause in SQL. In what specific situation must you use HAVING?",
        a: "Both clauses are used to filter data, but they operate at different stages. The WHERE clause is used to filter individual rows before any groupings are made (e.g., SELECT * FROM products WHERE price > 50). The HAVING clause is used to filter groups created by the GROUP BY clause (e.g., filtering grouped categories that have a count of items greater than 5: HAVING COUNT(*) > 5). You must use HAVING when filtering is based on an aggregate function like SUM, AVG, or COUNT."
      },
      // Part 3: Short Q&A
      {
        id: "sql_p3_1",
        group: "Quick Q&A",
        q: "What does SQL stand for, and what is its primary use?",
        a: "SQL stands for Structured Query Language. It is used to communicate with, manage, and manipulate relational databases."
      },
      {
        id: "sql_p3_2",
        group: "Quick Q&A",
        q: "What SQL command/keyword is used to retrieve data from a database?",
        a: "The SELECT command."
      },
      {
        id: "sql_p3_3",
        group: "Quick Q&A",
        q: "How do you write a single-line comment and a multi-line comment in standard SQL?",
        a: "A single-line comment starts with -- (two hyphens). A multi-line comment starts with /* and ends with */."
      },
      {
        id: "sql_p3_4",
        group: "Quick Q&A",
        q: "What is the difference between the SQL keywords DROP and TRUNCATE when deleting a table?",
        a: "DROP deletes the entire table structure along with all its data. TRUNCATE removes all the rows from a table but keeps the table structure intact for future use."
      },
      {
        id: "sql_p3_5",
        group: "Quick Q&A",
        q: "What keyword is used to combine rows from two or more tables based on a related column between them?",
        a: "The JOIN keyword (or INNER JOIN)."
      },
      {
        id: "sql_p3_6",
        group: "Quick Q&A",
        q: "What is the purpose of the GROUP BY clause in SQL?",
        a: "The GROUP BY clause groups rows that have the same values into summary rows, often used with aggregate functions (like COUNT, SUM, AVG) to group the result-set."
      }
    ],
    trueFalse: [
      {
        id: "sql_tf_1",
        q: "SQL is only used to retrieve data and cannot be used to delete or update data.",
        a: false,
        explanation: "SQL is complete database language that supports updating (UPDATE), inserting (INSERT), and deleting (DELETE) records in addition to retrieving them."
      },
      {
        id: "sql_tf_2",
        q: "A Primary Key column in a database table can contain duplicate values and NULL values.",
        a: false,
        explanation: "A Primary Key constraint strictly enforces unique, non-null values. It cannot contain duplicate or NULL values."
      },
      {
        id: "sql_tf_3",
        q: "The WHERE clause can be used to filter rows based on aggregate functions like SUM() or COUNT().",
        a: false,
        explanation: "Aggregate functions cannot be filtered using the WHERE clause. They must be filtered using the HAVING clause."
      },
      {
        id: "sql_tf_4",
        q: "An INNER JOIN returns only the rows that have matching values in both tables.",
        a: true,
        explanation: "Correct! INNER JOIN finds the intersection of the two tables based on the join predicate."
      },
      {
        id: "sql_tf_5",
        q: "In SQL, the INSERT INTO statement is used to add new records to a table.",
        a: true,
        explanation: "Correct! The INSERT INTO command is standard DML used to append new rows."
      },
      {
        id: "sql_tf_6",
        q: "The ORDER BY clause is used to sort the result-set in ascending or descending order.",
        a: true,
        explanation: "Correct! ORDER BY sorts query output, defaulting to ASC (ascending) and supporting DESC (descending)."
      }
    ],
    fillBlanks: [
      {
        id: "sql_fb_1",
        text: "SQL stands for {blank} Query Language.",
        a: "Structured"
      },
      {
        id: "sql_fb_2",
        text: "A {blank} database organizes data into tables of columns and rows.",
        a: "relational"
      },
      {
        id: "sql_fb_3",
        text: "The {blank} Key constraint uniquely identifies each record in a database table.",
        a: "Primary"
      },
      {
        id: "sql_fb_4",
        text: "A {blank} Key is a field in one table that refers to the Primary Key in another table.",
        a: "Foreign"
      },
      {
        id: "sql_fb_5",
        text: "The {blank} clause is used to filter records in a SELECT, UPDATE, or DELETE query.",
        a: "WHERE"
      },
      {
        id: "sql_fb_6",
        text: "To retrieve only distinct (non-duplicate) values, the SELECT {blank} statement is used.",
        a: "DISTINCT"
      },
      {
        id: "sql_fb_7",
        text: "The {blank} statement is used to add new rows of data into a table.",
        a: "INSERT"
      },
      {
        id: "sql_fb_8",
        text: "The {blank} statement is used to modify existing records in a table.",
        a: "UPDATE"
      },
      {
        id: "sql_fb_9",
        text: "To delete a table's structure completely from the database, you use the {blank} statement.",
        a: "DROP"
      },
      {
        id: "sql_fb_10",
        text: "The {blank} clause is used to sort the output of a query in ascending or descending order.",
        a: "ORDER BY"
      },
      {
        id: "sql_fb_11",
        text: "The {blank} operator is used in a WHERE clause to search for a specified pattern in a column.",
        a: "LIKE"
      },
      {
        id: "sql_fb_12",
        text: "To combine columns from multiple tables based on a related key, you use the {blank} keyword.",
        a: "JOIN"
      }
    ]
  }
};
