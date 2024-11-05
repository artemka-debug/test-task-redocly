script({
  model: 'github:o1-preview',
  title: 'Spell checker',
  system: ['system', 'system.files', 'system.changelog'],
  temperature: 0.2,
});

const pathsToCheck = ['*.md', '*.mdx', '**/*.md', '**/*.mdx'];

// Get files from environment or modified files from Git if none provided
let files = await git.listFiles('staged', {
  paths: pathsToCheck,
});

if (!files.length) {
  files = await git.listFiles('modified-base', {
    paths: pathsToCheck,
  });
}

if (files.length === 0) {
  console.log('No files found to check');
  process.exit(0);
}

console.log('Checking files:', files);

def('FILES', files, { endsWith: ['.md', '.mdx'] });

$`Let's take a deep breadth and analyze the spelling and grammar of the content of FILES.
If you find a spelling or grammar mistake, fix it. Use CHANGELOG file format for small changes.
If you do not find any mistakes, do not change the content.

- only fix major errors
- use a technical documentation tone
- minimize changes; do NOT change the meaning of the content
- if the grammar is good enough, do NOT change it
- do NOT modify the frontmatter. THIS IS IMPORTANT.
- do NOT modify code regions. THIS IS IMPORTANT.
- do NOT fix \`code\` and \`\`\`code\`\`\` sections
- in .mdx files, do NOT fix inline typescript code
`;

defOutputProcessor(async (output) => {
  const { fileEdits } = output;

  const filesChanged = Object.keys(fileEdits).;

  for (const fileName in fileEdits) {
    const edits = fileEdits[fileName];

    const { before, after } = edits;

    if (before !== after) {
      console.log(output.text);
      process.exit(1);
    }
  }
});
