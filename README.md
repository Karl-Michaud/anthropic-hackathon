# anthropic-hackathon

## Insturctions on how to install repo locally:

```bash
git clone https://github.com/Karl-Michaud/anthropic-hackathon.git
cd anthropic-hackathon
```

## How to run app

Step 1: Install dependencies
```bash
cd anthropic-hackathon/app
npm install
```

Step 2: Run build
```
npm run build
```

Step 3: Run localhost server

```bash
npm run dev
```

Step 4: Open localhost on browser (Visit http://localhost:<port-number>)

## Insturctions on Environmental variables to be added!

## Contributions

> For safety, never push directly to main!

Step 1: pull to main latest changes \
Step 2: Create branch + navigate to branch (`git checkout -b <branch-name>` or alternatively `git branch <branch-name>` + `git checkout <branch-name>`) \
Step 3: Make changes. 
Step 4: use `git status` + `git add <file1> <file2> ...` + `git commit -m "message"` + `git push origin <branch-name>`


Note: if branch is not up to date, run:

```bash
git config pull.rebase false
git pull origin <upstream-branch-you-want-to-pull-from>
```

Fix any merge conflits that may occur.
