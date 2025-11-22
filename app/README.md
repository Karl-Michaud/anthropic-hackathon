# Website

The user starts with a blank canvas.

When the user wants to start working on a scholarship, they will press the plus button in the left toolbar, which then prompts them to either upload a file or manually enter information about the scholarship, like the title, description, and prompts.

After the user is complete with that and presses submit, there will be a scholarship information block created on the canvas that displays the scholarship title, description, and prompts. The information about the scholarship is stored in the database accordingly. Then, the Claude API would be called with the scholarship information to generate hidden requirements, personality, values, priorities, criteria, and draft. The generated information would be stored accordingly as well in the database and then displayed in the scholarship information block in separate sections.

The scholarship information block has one button on the bottom: Generate. The analysis button, when clicked, creates another node with the generated essay (via Claude API as well). When the AI finishes generating, it will create another node that has an editable textarea that contains the essay draft.

I have already created all the data types (the interface files). Do not change it unless you absolutely have to. Just read them.

The requests.ts file and dbUtils is really the only source of truth when it comes to interacting with the Claude API and Supabase. Everything else that's unnecessary should be deleted and, if they are needed, integrated into those files instead.

Please review the existing codebase to look at what has already been done. However, change and add whatever you want to fulfill the criteria above. Add any loading elements as you wish. Delete any unnecessary components too.

Use camel case for file names and function names (and whatever all other names).

Delete any test pages afterwards.

Fix any errors and/or bugs and/or styling issues along the way as you wish. Do whatever you need to make this application conform to the instructions and workflow that I've described above.
