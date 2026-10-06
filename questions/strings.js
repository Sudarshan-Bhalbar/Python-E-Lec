/* DevHub-style Strings practice bank. The tests are intentionally kept out of
   the rendered UI; only the public examples and learning material are shown. */
window.STRING_QUESTIONS = [
  {
    id: 'reverse-string', number: 'Q01', title: 'Reverse a String',
    description: 'Read one line of text and print it backwards.', difficulty: 'Beginner',
    tags: ['slicing', 'input', 'output'],
    starterCode: 'text = input()\n# Print text in reverse order\n',
    task: 'Ask for a line of text and print the characters from the last character to the first.',
    behavior: 'The output is the exact reverse of the input, including spaces and punctuation.',
    constraints: ['The input contains at least 1 character.', 'Use string operations; do not print a hard-coded answer.'],
    hints: ['Python slices can use a negative step.', 'The reverse slice is text[::-1].'],
    examples: [{ input: 'Python', output: 'nohtyP' }, { input: 'DevHub!', output: '!buHveD' }],
    tests: [{ input: ['Python'], output: 'nohtyP' }, { input: ['Hello, world!'], output: '!dlrow ,olleH' }, { input: ['level'], output: 'level' }]
  },
  {
    id: 'normalize-text', number: 'Q02', title: 'Normalize User Text',
    description: 'Clean a user-entered label so it is lowercase and has no outside spaces.', difficulty: 'Beginner',
    tags: ['strip', 'lower', 'input'],
    starterCode: 'label = input()\n# Clean the label and print it\n',
    task: 'Remove leading and trailing whitespace, convert the remaining text to lowercase, and print it.',
    behavior: 'Only outside whitespace is removed. Whitespace inside the label remains.',
    constraints: ['The input contains letters, spaces, digits, or underscores.', 'Print one normalized line.'],
    hints: ['strip() removes whitespace at both ends.', 'You can chain string methods: value.strip().lower().'],
    examples: [{ input: '  PyThOn_Coder  ', output: 'python_coder' }],
    tests: [{ input: ['  PyThOn_Coder  '], output: 'python_coder' }, { input: ['  Dev Hub  '], output: 'dev hub' }, { input: ['ALREADY_CLEAN'], output: 'already_clean' }]
  },
  {
    id: 'mask-card', number: 'Q03', title: 'Mask a Card Number',
    description: 'Show only the final four digits of a card number.', difficulty: 'Beginner',
    tags: ['len', 'slicing', 'repetition'],
    starterCode: 'card = input()\n# Print stars for every hidden digit, then the final four digits\n',
    task: 'Replace every digit except the last four with an asterisk and print the masked value.',
    behavior: 'A 16-digit card becomes twelve asterisks followed by its final four digits.',
    constraints: ['The input contains exactly 16 digits.', 'Do not print the original full number.'],
    hints: ['The last four characters are card[-4:].', 'The number of hidden characters is len(card) - 4.'],
    examples: [{ input: '1234567890123456', output: '************3456' }],
    tests: [{ input: ['1234567890123456'], output: '************3456' }, { input: ['9999000011112222'], output: '************2222' }]
  },
  {
    id: 'count-substring', number: 'Q04', title: 'Count a Substring',
    description: 'Count how many times a smaller piece of text occurs in a larger text.', difficulty: 'Beginner',
    tags: ['count', 'input', 'methods'],
    starterCode: 'text = input()\nneedle = input()\n# Print how many times needle occurs in text\n',
    task: 'Read the text and then the substring to search for. Print the non-overlapping occurrence count.',
    behavior: 'The answer is a number on its own line.',
    constraints: ['Both inputs are non-empty.', 'Matching is case-sensitive.'],
    hints: ['Strings have a count() method.', 'Call it on the larger text and pass the needle.'],
    examples: [{ input: 'banana\na', output: '3' }],
    tests: [{ input: ['banana', 'a'], output: '3' }, { input: ['Python Python', 'Python'], output: '2' }, { input: ['mississippi', 'ss'], output: '2' }]
  },
  {
    id: 'string-length', number: 'Q05', title: 'Find String Length',
    description: 'Print the number of characters in a line of text.', difficulty: 'Beginner',
    tags: ['len', 'input', 'output'], starterCode: 'text = input()\n# Print the number of characters\n',
    task: 'Read one line and print its length. Every space and punctuation mark counts as a character.',
    behavior: 'The output is one whole number.', constraints: ['The input contains at least 1 character.', 'Do not count characters manually.'],
    hints: ['Python provides len() for measuring text.', 'Pass the string variable to len() and print the result.'],
    examples: [{ input: 'Python', output: '6' }, { input: 'Dev Hub', output: '7' }],
    tests: [{ input: ['Python'], output: '6' }, { input: ['Dev Hub'], output: '7' }, { input: ['Hi!'], output: '3' }]
  },
  {
    id: 'string-uppercase', number: 'Q06', title: 'Make Text Uppercase',
    description: 'Convert a line of text to uppercase.', difficulty: 'Beginner', tags: ['upper', 'input', 'output'],
    starterCode: 'text = input()\n# Print the text in uppercase\n',
    task: 'Read the text and print an uppercase version of it.',
    behavior: 'Letters change case while spaces, digits, and punctuation stay in their positions.',
    constraints: ['The input contains letters, spaces, digits, or punctuation.', 'Print one line.'],
    hints: ['upper() returns an uppercase copy of a string.', 'Call the method on the text before printing it.'],
    examples: [{ input: 'Python 3', output: 'PYTHON 3' }],
    tests: [{ input: ['Python 3'], output: 'PYTHON 3' }, { input: ['devhub!'], output: 'DEVHUB!' }, { input: ['Already UPPER'], output: 'ALREADY UPPER' }]
  },
  {
    id: 'string-lowercase', number: 'Q07', title: 'Make Text Lowercase',
    description: 'Convert a line of text to lowercase.', difficulty: 'Beginner', tags: ['lower', 'input', 'output'],
    starterCode: 'text = input()\n# Print the text in lowercase\n',
    task: 'Read the text and print a lowercase version of it.',
    behavior: 'Letters change case while spaces, digits, and punctuation stay unchanged.',
    constraints: ['The input contains letters, spaces, digits, or punctuation.', 'Print one line.'],
    hints: ['lower() returns a lowercase copy of a string.', 'Call the method on the text before printing it.'],
    examples: [{ input: 'PyThOn 3', output: 'python 3' }],
    tests: [{ input: ['PyThOn 3'], output: 'python 3' }, { input: ['DEVHUB!'], output: 'devhub!' }, { input: ['already lower'], output: 'already lower' }]
  },
  {
    id: 'string-trim-spaces', number: 'Q08', title: 'Trim Outside Spaces',
    description: 'Remove whitespace only from the beginning and end of a line.', difficulty: 'Beginner', tags: ['strip', 'input', 'output'],
    starterCode: 'text = input()\n# Print the text without outside whitespace\n',
    task: 'Print the input after removing leading and trailing whitespace. Keep internal spaces exactly as they are.',
    behavior: 'Only the outside whitespace changes.', constraints: ['The input contains at least one non-space character.', 'Do not remove spaces between words.'],
    hints: ['strip() removes whitespace from both ends.', 'Use it on the original text before printing.'],
    examples: [{ input: '  Dev Hub  ', output: 'Dev Hub' }],
    tests: [{ input: ['  Dev Hub  '], output: 'Dev Hub' }, { input: ['Python'], output: 'Python' }, { input: ['   String   Practice   '], output: 'String   Practice' }]
  },
  {
    id: 'string-first-character', number: 'Q09', title: 'Print the First Character',
    description: 'Read a word and print its first character.', difficulty: 'Beginner', tags: ['indexing', 'input', 'output'],
    starterCode: 'word = input()\n# Print the first character\n',
    task: 'Print the character at the beginning of the input word.', behavior: 'The output is exactly one character.',
    constraints: ['The input is a non-empty word.', 'Use string indexing.'], hints: ['String positions start at zero.', 'The first character is word[0].'],
    examples: [{ input: 'Python', output: 'P' }], tests: [{ input: ['Python'], output: 'P' }, { input: ['devhub'], output: 'd' }, { input: ['7days'], output: '7' }]
  },
  {
    id: 'string-last-character', number: 'Q10', title: 'Print the Last Character',
    description: 'Read a word and print its final character.', difficulty: 'Beginner', tags: ['indexing', 'input', 'output'],
    starterCode: 'word = input()\n# Print the last character\n',
    task: 'Print the character at the end of the input word.', behavior: 'The output is exactly one character.',
    constraints: ['The input is a non-empty word.', 'Use a negative string index.'], hints: ['Negative indexes count from the end.', 'The last character is word[-1].'],
    examples: [{ input: 'Python', output: 'n' }], tests: [{ input: ['Python'], output: 'n' }, { input: ['devhub'], output: 'b' }, { input: ['7days'], output: 's' }]
  },
  {
    id: 'string-slice-middle', number: 'Q11', title: 'Remove the Ends',
    description: 'Print a string without its first and last characters.', difficulty: 'Beginner', tags: ['slicing', 'input', 'output'],
    starterCode: 'text = input()\n# Print everything except the first and last characters\n',
    task: 'Use a slice to print the characters between the first and last character.',
    behavior: 'The first and last characters are omitted; the order of the middle stays the same.',
    constraints: ['The input contains at least 3 characters.', 'Use one string slice.'], hints: ['A slice can start at index 1.', 'Use text[1:-1] to stop before the final character.'],
    examples: [{ input: 'Python', output: 'ytho' }], tests: [{ input: ['Python'], output: 'ytho' }, { input: ['abcde'], output: 'bcd' }, { input: ['!hello!'], output: 'hello' }]
  },
  {
    id: 'string-find-position', number: 'Q12', title: 'Find Text Position',
    description: 'Find the first position where a smaller string appears.', difficulty: 'Beginner', tags: ['find', 'input', 'output'],
    starterCode: 'text = input()\nneedle = input()\n# Print the first position of needle\n',
    task: 'Read the larger text and a guaranteed-to-exist piece of text, then print the first matching index.',
    behavior: 'The first character has index 0.', constraints: ['The needle occurs at least once.', 'Matching is case-sensitive.'],
    hints: ['find() returns the first matching position.', 'Call text.find(needle) and print its result.'],
    examples: [{ input: 'Python\nth', output: '2' }], tests: [{ input: ['Python', 'th'], output: '2' }, { input: ['banana', 'na'], output: '2' }, { input: ['devhub', 'd'], output: '0' }]
  },
  {
    id: 'extract-domain', number: 'Q13', title: 'Extract an Email Domain',
    description: 'Print the domain portion after the @ symbol in an email address.', difficulty: 'Intermediate', tags: ['find', 'slicing', 'strings'],
    starterCode: 'email = input()\n# Extract and print the part after @\n',
    task: 'Find the @ symbol and print everything after it.', behavior: 'For alex@example.com, the output is example.com.',
    constraints: ['The input contains exactly one @ symbol.', 'The output must not include @.'], hints: ['find("@") gives the position of the symbol.', 'Slice from one position after that index to the end.'],
    examples: [{ input: 'alex@example.com', output: 'example.com' }], tests: [{ input: ['alex@example.com'], output: 'example.com' }, { input: ['student@python.org'], output: 'python.org' }, { input: ['hello@devhub.in'], output: 'devhub.in' }]
  },
  {
    id: 'palindrome-check', number: 'Q14', title: 'Check for a Palindrome',
    description: 'Decide whether a word reads the same forwards and backwards.', difficulty: 'Intermediate', tags: ['slicing', 'lower', 'comparison'],
    starterCode: 'word = input()\n# Print True when word is a palindrome, otherwise False\n',
    task: 'Ignore letter case and print True if the input is a palindrome; otherwise print False.',
    behavior: 'The output is exactly True or False with a capital first letter.', constraints: ['The input is a single word.', 'Do not use a hard-coded list of answers.'],
    hints: ['Normalize the word before comparing.', 'Compare the word with word[::-1].'], examples: [{ input: 'Radar', output: 'True' }, { input: 'Python', output: 'False' }],
    tests: [{ input: ['Radar'], output: 'True' }, { input: ['Python'], output: 'False' }, { input: ['Level'], output: 'True' }]
  },
  {
    id: 'csv-join', number: 'Q15', title: 'Format CSV Values',
    description: 'Turn comma-separated values into a readable bar-separated line.', difficulty: 'Intermediate', tags: ['replace', 'input', 'output'],
    starterCode: 'csv_row = input()\n# Print the values separated by " | "\n',
    task: 'Replace every comma with space-bar-space and print the resulting line.',
    behavior: 'The order of values stays the same and no extra separator is added.', constraints: ['Values do not contain commas.', 'Use string replacement rather than splitting the input.'],
    hints: ['replace() can change every occurrence of one piece of text.', 'Replace "," with " | " in csv_row.'],
    examples: [{ input: 'Apples,Bananas,Mangoes', output: 'Apples | Bananas | Mangoes' }], tests: [{ input: ['Apples,Bananas,Mangoes'], output: 'Apples | Bananas | Mangoes' }, { input: ['Python,JavaScript,HTML'], output: 'Python | JavaScript | HTML' }, { input: ['one,two'], output: 'one | two' }]
  },
  {
    id: 'replace-spaces', number: 'Q16', title: 'Create a URL Slug',
    description: 'Convert a title into a lowercase slug by replacing spaces with hyphens.', difficulty: 'Intermediate', tags: ['strip', 'replace', 'lower'],
    starterCode: 'title = input()\n# Print a lowercase, hyphen-separated slug\n',
    task: 'Trim outside whitespace, make the title lowercase, and replace each ordinary space with a hyphen.',
    behavior: 'The result is a single lowercase line such as learn-python.', constraints: ['Words are separated by single spaces.', 'Keep punctuation inside the title unchanged.'],
    hints: ['Clean the ends first with strip().', 'replace(" ", "-") changes spaces everywhere.'], examples: [{ input: '  Learn Python  ', output: 'learn-python' }],
    tests: [{ input: ['  Learn Python  '], output: 'learn-python' }, { input: ['String Practice Lab'], output: 'string-practice-lab' }, { input: ['HELLO WORLD!'], output: 'hello-world!' }]
  },
  {
    id: 'string-format-name', number: 'Q17', title: 'Format a Full Name',
    description: 'Clean and format a first name and last name.', difficulty: 'Intermediate', tags: ['strip', 'title', 'input'],
    starterCode: 'first = input()\nlast = input()\n# Print the cleaned full name\n',
    task: 'Remove outside whitespace from both names, capitalize each word, and print them separated by one space.',
    behavior: 'The output uses title case with exactly one space between the two names.', constraints: ['Each input contains one name.', 'Do not print extra labels or punctuation.'],
    hints: ['Clean each input with strip().', 'title() changes the cleaned name to title case before concatenation.'], examples: [{ input: '  ada  \n  lovelace ', output: 'Ada Lovelace' }],
    tests: [{ input: ['  ada  ', '  lovelace '], output: 'Ada Lovelace' }, { input: ['grace', 'HOPPER'], output: 'Grace Hopper' }, { input: ['  alan', 'turing  '], output: 'Alan Turing' }]
  },
  {
    id: 'string-mask-middle', number: 'Q18', title: 'Mask the Middle Characters',
    description: 'Keep the first and last two characters of a code and hide its middle.', difficulty: 'Intermediate', tags: ['len', 'slicing', 'repetition'],
    starterCode: 'code = input()\n# Print the outside characters with a masked middle\n',
    task: 'Print the first two characters, one asterisk for each hidden middle character, and the last two characters.',
    behavior: 'An eight-character code becomes two visible characters, four asterisks, and two visible characters.', constraints: ['The input contains exactly 8 characters.', 'Do not print the hidden characters.'],
    hints: ['Use code[:2] and code[-2:] for the visible pieces.', 'The hidden count is len(code) - 4, so repeat "*" that many times.'], examples: [{ input: 'AB12CD34', output: 'AB****34' }],
    tests: [{ input: ['AB12CD34'], output: 'AB****34' }, { input: ['PYTHON99'], output: 'PY****99' }, { input: ['12345678'], output: '12****78' }]
  },
  {
    id: 'string-prefix-suffix', number: 'Q19', title: 'Inspect Prefix and Suffix',
    description: 'Check whether a text value begins and ends with the requested pieces.', difficulty: 'Intermediate', tags: ['startswith', 'endswith', 'comparison'],
    starterCode: 'text = input()\nprefix = input()\nsuffix = input()\n# Print True only when both pieces match\n',
    task: 'Print True when text starts with prefix and ends with suffix. Otherwise print False.',
    behavior: 'Both checks must be true for the output to be True.', constraints: ['All three inputs are non-empty.', 'Matching is case-sensitive.'],
    hints: ['startswith() checks the beginning of a string.', 'Combine text.startswith(prefix) and text.endswith(suffix).'], examples: [{ input: 'python.org\npy\norg', output: 'True' }],
    tests: [{ input: ['python.org', 'py', 'org'], output: 'True' }, { input: ['devhub.in', 'dev', 'com'], output: 'False' }, { input: ['learn-python', 'learn', 'python'], output: 'True' }]
  },
  {
    id: 'string-replace-word', number: 'Q20', title: 'Replace a Known Word',
    description: 'Update every occurrence of one known word in a sentence.', difficulty: 'Intermediate', tags: ['replace', 'input', 'strings'],
    starterCode: 'sentence = input()\nold_word = input()\nnew_word = input()\n# Print the updated sentence\n',
    task: 'Replace every occurrence of old_word with new_word and print the changed sentence.',
    behavior: 'The original spacing and the order of the other text remain unchanged.', constraints: ['The old word appears at least once.', 'Matching is case-sensitive.'],
    hints: ['Strings provide replace(old, new).', 'Call sentence.replace(old_word, new_word) once.'], examples: [{ input: 'I like tea.\ntea\ncoffee', output: 'I like coffee.' }],
    tests: [{ input: ['I like tea.', 'tea', 'coffee'], output: 'I like coffee.' }, { input: ['red red blue', 'red', 'green'], output: 'green green blue' }, { input: ['Python is fun', 'fun', 'powerful'], output: 'Python is powerful' }]
  },
  {
    id: 'string-count-vowels', number: 'Q21', title: 'Count Selected Letters',
    description: 'Count the lowercase vowels in a line of text.', difficulty: 'Intermediate', tags: ['lower', 'count', 'operators'],
    starterCode: 'text = input()\n# Print the total number of a, e, i, o, and u characters\n',
    task: 'Ignore letter case and print the total count of the five vowel letters.',
    behavior: 'Only a, e, i, o, and u are counted; spaces and other characters are ignored.', constraints: ['The input is one line of text.', 'Do not count the letters manually.'],
    hints: ['Use lower() once so uppercase vowels match too.', 'Add the results of lower_text.count("a"), count("e"), and the other vowels.'], examples: [{ input: 'Python Practice', output: '4' }],
    tests: [{ input: ['Python Practice'], output: '4' }, { input: ['AEIOU'], output: '5' }, { input: ['rhythms'], output: '0' }]
  },
  {
    id: 'string-email-user', number: 'Q22', title: 'Extract an Email Username',
    description: 'Print the part of an email address before the @ symbol.', difficulty: 'Intermediate', tags: ['find', 'slicing', 'input'],
    starterCode: 'email = input()\n# Extract and print the part before @\n',
    task: 'Find the @ symbol and print everything before it.', behavior: 'For alex@example.com, the output is alex.', constraints: ['The input contains exactly one @ symbol.', 'The output must not include @.'],
    hints: ['Find the position of @ first.', 'Use a slice from the beginning up to that position.'], examples: [{ input: 'alex@example.com', output: 'alex' }],
    tests: [{ input: ['alex@example.com'], output: 'alex' }, { input: ['student@python.org'], output: 'student' }, { input: ['hello@devhub.in'], output: 'hello' }]
  },
  {
    id: 'string-rebuild-date', number: 'Q23', title: 'Rebuild a Date',
    description: 'Change a date from year-month-day order to day/month/year order.', difficulty: 'Hard', tags: ['slicing', 'concatenation', 'input'],
    starterCode: 'date = input()\n# Print the date as DD/MM/YYYY\n',
    task: 'Rearrange the fixed positions in a YYYY-MM-DD date and print it as DD/MM/YYYY.',
    behavior: 'The two hyphens in the input become slashes in the output.', constraints: ['The input always has the form YYYY-MM-DD.', 'Use slices rather than converting the date to another data structure.'],
    hints: ['The year is date[:4], the month is date[5:7], and the day is date[8:].', 'Concatenate day, slash, month, slash, and year in that order.'], examples: [{ input: '2026-10-05', output: '05/10/2026' }],
    tests: [{ input: ['2026-10-05'], output: '05/10/2026' }, { input: ['1999-01-31'], output: '31/01/1999' }, { input: ['2030-12-08'], output: '08/12/2030' }]
  },
  {
    id: 'string-rotate-halves', number: 'Q24', title: 'Rotate the Two Halves',
    description: 'Move the first half of an even-length string to its end.', difficulty: 'Hard', tags: ['len', 'slicing', 'operators'],
    starterCode: 'text = input()\n# Print the second half followed by the first half\n',
    task: 'Split the string at its midpoint and print the second half followed by the first half.',
    behavior: 'The output contains the same characters in a rotated order.', constraints: ['The input length is even and at least 2.', 'Use the length to find the midpoint.'],
    hints: ['The midpoint is len(text) // 2.', 'Concatenate text[midpoint:] with text[:midpoint].'], examples: [{ input: 'abcdef', output: 'defabc' }],
    tests: [{ input: ['abcdef'], output: 'defabc' }, { input: ['12345678'], output: '56781234' }, { input: ['PYTHON'], output: 'HONPYT' }]
  },
  {
    id: 'string-clean-contact', number: 'Q25', title: 'Clean a Contact Number',
    description: 'Remove a country prefix, separators, and outside spaces from a contact number.', difficulty: 'Hard', tags: ['strip', 'replace', 'input'],
    starterCode: 'phone = input()\n# Print the ten local digits without separators\n',
    task: 'Trim the input, remove the +91- prefix, remove every remaining hyphen, and print the local number.',
    behavior: 'The output contains only the ten local digits.', constraints: ['The input starts with +91- and contains hyphens between digit groups.', 'The prefix and separators are always written exactly as described.'],
    hints: ['Start with phone.strip().', 'Chain replace("+91-", "") and replace("-", "") before printing.'], examples: [{ input: ' +91-987-654-3210 ', output: '9876543210' }],
    tests: [{ input: [' +91-987-654-3210 '], output: '9876543210' }, { input: ['+91-800-123-4567'], output: '8001234567' }, { input: ['  +91-111-222-3333'], output: '1112223333' }]
  },
  {
    id: 'string-extract-bracket-text', number: 'Q26', title: 'Extract Bracketed Text',
    description: 'Print the text located between the first square brackets.', difficulty: 'Hard', tags: ['find', 'slicing', 'input'],
    starterCode: 'record = input()\n# Print the text between [ and ]\n',
    task: 'Find the positions of [ and ] and print only the text between them.', behavior: 'The bracket characters are not included in the output.',
    constraints: ['The input contains one bracketed section.', 'Both brackets appear in the input in the correct order.'],
    hints: ['Store the positions returned by find("[") and find("]").', 'Slice from the opening position plus one up to the closing position.'], examples: [{ input: 'Order[PY-2048]', output: 'PY-2048' }],
    tests: [{ input: ['Order[PY-2048]'], output: 'PY-2048' }, { input: ['Status[READY]'], output: 'READY' }, { input: ['ID[42] saved'], output: '42' }]
  },
  {
    id: 'string-highlight-keyword', number: 'Q27', title: 'Highlight a Keyword',
    description: 'Surround every occurrence of a keyword with square brackets.', difficulty: 'Hard', tags: ['replace', 'input', 'output'],
    starterCode: 'text = input()\nkeyword = input()\n# Print each keyword occurrence in brackets\n',
    task: 'Replace every occurrence of keyword with [keyword] and print the changed text.', behavior: 'All matching occurrences are highlighted in their original order.',
    constraints: ['The keyword appears at least once.', 'Matching is case-sensitive.'],
    hints: ['Build the replacement text with "[" + keyword + "]".', 'Use text.replace(keyword, replacement) for every occurrence.'], examples: [{ input: 'Python makes Python fun\nPython', output: '[Python] makes [Python] fun' }],
    tests: [{ input: ['Python makes Python fun', 'Python'], output: '[Python] makes [Python] fun' }, { input: ['red blue red', 'red'], output: '[red] blue [red]' }, { input: ['Learn strings', 'strings'], output: 'Learn [strings]' }]
  },
  {
    id: 'string-format-phone', number: 'Q28', title: 'Format a Phone Number',
    description: 'Format ten digits as a readable phone number.', difficulty: 'Hard', tags: ['slicing', 'concatenation', 'input'],
    starterCode: 'phone = input()\n# Print the phone number as (123) 456-7890\n',
    task: 'Use slices to print the ten digits as (AAA) BBB-CCCC.', behavior: 'The output includes parentheses, one space, and one hyphen in the required positions.',
    constraints: ['The input contains exactly 10 digits.', 'Do not change the digit order.'], hints: ['The first three digits are phone[:3], then phone[3:6], then phone[6:].', 'Concatenate the punctuation around those three slices.'],
    examples: [{ input: '1234567890', output: '(123) 456-7890' }], tests: [{ input: ['1234567890'], output: '(123) 456-7890' }, { input: ['9876543210'], output: '(987) 654-3210' }, { input: ['8005551212'], output: '(800) 555-1212' }]
  },
  {
    id: 'string-redact-email', number: 'Q29', title: 'Redact an Email Username',
    description: 'Keep the first and last username characters while hiding the middle.', difficulty: 'Challenge', tags: ['find', 'slicing', 'concatenation'],
    starterCode: 'email = input()\n# Print a redacted username and the original domain\n',
    task: 'For an email address, print the first username character, three asterisks, the last username character, @, and the original domain.',
    behavior: 'For alex@example.com, the output is a***x@example.com.', constraints: ['The username contains at least two characters.', 'The input contains exactly one @ symbol.'],
    hints: ['Find @, then slice the username and domain separately.', 'Join email[:1], "***", email[at - 1:at], "@", and email[at + 1:].'], examples: [{ input: 'alex@example.com', output: 'a***x@example.com' }],
    tests: [{ input: ['alex@example.com'], output: 'a***x@example.com' }, { input: ['student@python.org'], output: 's***t@python.org' }, { input: ['devhub@dev.in'], output: 'd***b@dev.in' }]
  },
  {
    id: 'string-build-summary', number: 'Q30', title: 'Build a Summary Line',
    description: 'Combine cleaned and transformed text into one exact summary line.', difficulty: 'Challenge', tags: ['strip', 'title', 'upper', 'lower'],
    starterCode: 'title = input()\ncategory = input()\ncode = input()\n# Print: Title [category] #CODE\n',
    task: 'Clean the title and code, format the title in title case, format the category in lowercase, format the code in uppercase, and print one summary line.',
    behavior: 'The output format is Title [category] #CODE.', constraints: ['Each input is one line.', 'Keep the required brackets, hash, and single spaces exactly as shown.'],
    hints: ['Apply strip() before changing the case of each input.', 'Concatenate the transformed pieces with the required brackets, hash, and spaces.'], examples: [{ input: '  string practice  \n  PYTHON  \n  s30  ', output: 'String Practice [python] #S30' }],
    tests: [{ input: ['  string practice  ', '  PYTHON  ', '  s30  '], output: 'String Practice [python] #S30' }, { input: ['hello world', 'TEXT', 'abc9'], output: 'Hello World [text] #ABC9' }, { input: ['  devhub', 'Learning', 'q01  '], output: 'Devhub [learning] #Q01' }]
  }
];
