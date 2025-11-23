# Socratic AI

> Tailor Your Scholarship Essays with Critical Thinkers.

## Table of Contents

-   [The Problem](#the-problem)
-   [Our Solution](#our-solution)
-   [Features](#features)
-   [How It Works](#how-it-works)
-   [Getting Started](#getting-started)
-   [Project Structure](#project-structure)
-   [The Research Behind It](#the-research-behind-it)
-   [Contributing](#contributing)
-   [Contributors](#contributors)
-   [Tech Stack](#tech-stack)
-   [License](#license)

------------------------------------------------------------------------

## The Problem {#the-problem}

Generic AI tools generate polished but ineffective scholarship essays because they don't understand that **each scholarship seeks specific types of students**. The Loran Award wants character and sustained service. Schulich Leaders seek STEM entrepreneurs. TD Scholarships fund community problem-solvers. Terry Fox Awards honor courage through adversity.

**The same student profile must be strategically reframed for each scholarship.** Generic AI doesn't catch this. We do.

------------------------------------------------------------------------

## Our Solution {#our-solution}

We use **Socratic questioning** to extract authentic stories and guide strategic positioning.

**Traditional AI**: "Here's a polished essay about your volunteer work." **Socratic AI**: "Tell me about a specific moment when you saw someone's life change. What did they say? Why did you keep coming back?"

Our AI acts like an expert scholarship coach that: 1. Decodes what each scholarship truly values (beyond stated requirements) 2. Asks targeted questions to extract your most compelling authentic stories 3. Guides strategic positioning for different scholarships 4. Maintains your voice while teaching effective storytelling

**Example**: Same student, different emphasis—ESL tutoring becomes "sustained service commitment" for Loran, "community problem-solving with measurable impact" for TD, and "humanitarian work despite adversity" for Terry Fox.

------------------------------------------------------------------------

## Features {#features}

### For Students Applying to Canadian Scholarships

-   **Scholarship Personality Decoder**: Understand what scholarships actually select for
-   **Socratic Interview Mode**: Answer targeted questions that extract your most compelling authentic stories
-   **Strategic Positioning Engine**: Get scholarship-specific guidance on which experiences to emphasize
-   **Language Alignment Coach**: Learn to mirror each scholarship's priority language while staying authentic
-   **Essay Framework Matching**: Match your stories to proven narrative frameworks (Transformation Arc, Community Connector, etc.)

### Built-In Intelligence

-   Analysis of 26+ major Canadian scholarships across 6 value archetypes
-   Regional competitiveness insights (Atlantic Canada vs Ontario applicant pools)
-   Winner profile patterns from 15+ scholarship recipients
-   Essay prompt templates covering 8 core categories

------------------------------------------------------------------------

## How It Works {#how-it-works}

### Step 1: Tell Us Your Story

Input your experiences, achievements, challenges, and goals once.

### Step 2: We Decode Scholarship Fit

Our AI analyzes which scholarships match your strengths and why.

### Step 3: Socratic Questioning

For each scholarship, we ask targeted questions: - "Describe a specific moment when..." - "What exactly did they say when..." - "How did that change your understanding of..."

### Step 4: Strategic Guidance

We suggest: - Which story to lead with for each scholarship - What language to mirror - How to frame the same experience differently - What your essay opening could focus on

### Step 5: You Write (With Feedback)

You write in your own voice. We provide: - "This scholarship values X but you've emphasized Y—consider rebalancing" - "This sentence is generic. Can you add a specific detail only you would know?" - "Strong! This demonstrates the 'sustained commitment' they seek"

------------------------------------------------------------------------

## Getting Started {#getting-started}

### Prerequisites

-   Node.js (v18+)
-   npm or yarn
-   Anthropic API key

### Installation

``` bash
# Clone the repository
git clone https://github.com/Karl-Michaud/anthropic-hackathon.git
cd anthropic-hackathon

# Navigate to app directory
cd app

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the `app` directory:

``` bash
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running the App

``` bash
# Build the application
npm run build

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

------------------------------------------------------------------------

## Project Structure {#project-structure}

```         
anthropic-hackathon/
├── app/                    # Main application code
│   ├── components/         # React components
│   ├── pages/             # Next.js pages
│   ├── api/               # API routes
│   └── lib/               # Utilities and helpers
├── docs/                  # Research and documentation
│   └── research/          # Scholarship intelligence research
└── README.md
```

------------------------------------------------------------------------

## The Research Behind It {#the-research-behind-it}

Our platform is built on comprehensive analysis:

### Scholarship Value Archetypes

1.  **Character Leaders** (Loran, Terry Fox): Integrity, sustained service, values-driven choices
2.  **STEM Entrepreneurs** (Schulich): Innovation, technical excellence, applied problem-solving
3.  **Community Change-Makers** (TD): Problem identification, measurable impact, inclusive solutions
4.  **Adversity Transcenders** (Terry Fox): Resilience, courage revealed through challenges
5.  **Global Leaders** (Pearson International): Cross-cultural perspective, international impact
6.  **Academic Specialists** (Vanier, NSERC): Research potential, field-specific excellence

### Key Insights

-   **Depth beats breadth**: Winners average 2-4 sustained commitments vs. 15-20 scattered activities
-   **Specificity wins**: Essays with concrete details (names, dialogue, numbers) succeed at dramatically higher rates
-   **Strategic reframing is authentic**: Same experiences, different emphasis = alignment with scholarship mission
-   **Hidden criteria select winners**: Explicit criteria screen applicants; implicit priorities choose recipients

See `/docs/research/` for full analysis.

------------------------------------------------------------------------

## Contributing {#contributing}

We welcome contributions! Whether you're adding scholarship intelligence, improving the Socratic questioning, or enhancing UX.

### Contribution Workflow

**Important**: Never push directly to `main`!

1.  **Pull latest changes**

    ``` bash
    git checkout main
    git pull origin main
    ```

2.  **Create a new branch**

    ``` bash
    git checkout -b feature/your-feature-name
    ```

3.  **Make your changes**

    -   Write clean, documented code
    -   Test thoroughly
    -   Follow existing code style

4.  **Commit and push**

    ``` bash
    git add .
    git commit -m "feat: describe your changes"
    git push origin feature/your-feature-name
    ```

5.  **Create a Pull Request**

    -   Go to GitHub and create a PR from your branch to `main`
    -   Describe your changes clearly
    -   Request review from maintainers

6.  **Address review feedback**

    -   Make requested changes
    -   Push updates to your branch
    -   PR will auto-update

### Keeping Your Branch Updated

If your branch falls behind `main`:

``` bash
git config pull.rebase false
git pull origin main
```

Resolve any merge conflicts that arise.

------------------------------------------------------------------------

## Contributors {#contributors}

This project was built by a dedicated team passionate about making scholarships more accessible:

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/Karl-Michaud">
          <img src="https://github.com/Karl-Michaud.png" width="100px;" alt="Karl Michaud"/>
          <br />
          <sub><b>Karl Michaud</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/daviddimalanta">
          <img src="https://github.com/davidjamesdimalanta.png" width="100px;" alt="David Dimalanta"/>
          <br />
          <sub><b>David Dimalanta</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/KelvinPogo">
          <img src="https://github.com/KelvinPogo.png" width="100px;" alt="Kevin Pogoryelovskyy"/>
          <br />
          <sub><b>Kevin Pogoryelovskyy</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/ochisomonyekwere-ship-it">
          <img src="https://github.com/ochisomonyekwere-ship-it.png" width="100px;" alt="Chisom Onyekwere"/>
          <br />
          <sub><b>Chisom Onyekwere</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/leoduan0">
          <img src="https://github.com/leoduan0.png" width="100px;" alt="Leo Duan"/>
          <br />
          <sub><b>Leo Duan</b></sub>
        </a>
      </td>
    </tr>
  </table>
</div>

Want to contribute? See our [Contributing](#contributing) section!

------------------------------------------------------------------------

## Tech Stack {#tech-stack}

-   **Frontend**: React, Next.js, TypeScript
-   **AI Integration**: Anthropic Claude (Sonnet 4.5)
-   **Styling**: Tailwind CSS
-   **Deployment**: Vercel

------------------------------------------------------------------------

## License {#license}

MIT License - see LICENSE file for details

------------------------------------------------------------------------

## Questions or Feedback?

-   **Issues**: [GitHub Issues](https://github.com/Karl-Michaud/anthropic-hackathon/issues)
-   **Discussions**: [GitHub Discussions](https://github.com/Karl-Michaud/anthropic-hackathon/discussions)

------------------------------------------------------------------------

**Built for collaboration. Powered by intelligence. Designed to help students win scholarships they deserve.**