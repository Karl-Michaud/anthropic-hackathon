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

After the user creates a draft via the draft button in the scholarship information block, there will be aspects of the essay that needs further elaboration. We will use Claude for Socratic method of questioning to dynamically ask the user for more information. Basically, suppose there are three parts of the essay that needs elaboration (maybe it's a paragraph, or just a sentence), those three parts will be highlighted (in different colours). And by clicking on each highlighted section, a panel would appear with the extra questions that the model would like to ask to user. The user can submit these responses for the model to update the essay accordingly. Also, remember that the essay text area is editable, so if the user modifies anything at all, the whole process starts from the beginning, which includes regenerating the Socratic questions and highlighted sections.

Currently, we have a component for the essay draft, but it doesn't have highlighting features or anything like that. We don't have components for the panels that contain the Socratic questioning. So, create it so that it contains a title (the general theme of what that highlighted section is about), and a bunch of questions and corresponding textboxes for the user to respond with. After the user is done, they can press submit and the process starts again from generating the draft. We should have roughly 2-5, depending on the essay length. The colors for the highlights should be vibrant and different from the background. The panel should appear to the right on click, and when the user clicks anywhere that's not any of the highlights, the socratic panel closes. Only one socratic panel should be displayed at a time.
