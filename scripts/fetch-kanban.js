import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, '.env');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'kanban.json');

const PROJECT_ID = 'PVT_kwHOCBWhV84BRkIB';

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  const entries = raw.split(/\r?\n/);
  const env = {};

  for (const line of entries) {
    if (!line || line.trim().startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, '');
    env[key] = value;
  }

  return env;
}

function getFieldValue(fieldValues, fieldName) {
  if (!Array.isArray(fieldValues)) return null;
  for (const node of fieldValues) {
    if (!node || node.__typename !== 'ProjectV2ItemFieldSingleSelectValue') continue;
    if (node.field?.name === fieldName) {
      return node.name || null;
    }
  }
  return null;
}

async function fetchKanbanData(token) {
  const query = `
    query ProjectItems($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              id
              updatedAt
              content {
                __typename
                ... on Issue { title updatedAt }
                ... on PullRequest { title updatedAt }
                ... on DraftIssue { title updatedAt }
              }
              fieldValues(first: 20) {
                nodes {
                  __typename
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { projectId: PROJECT_ID } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((err) => err.message).join('\n'));
  }

  return payload.data?.node?.items?.nodes ?? [];
}

async function main() {
  const env = parseEnvFile(ENV_PATH);
  const token = env.VITE_GITHUB_TOKEN;

  if (!token) {
    throw new Error('Missing VITE_GITHUB_TOKEN in .env');
  }
  if (PROJECT_ID === 'REPLACE_WITH_PROJECT_V2_NODE_ID') {
    throw new Error('Set PROJECT_ID in scripts/fetch-kanban.js');
  }

  const items = await fetchKanbanData(token);

  const mapped = items.map((item) => {
    const title = item.content?.title || 'Untitled';
    const updatedAt = item.content?.updatedAt || item.updatedAt || null;
    const fieldValues = item.fieldValues?.nodes || [];
    const status = getFieldValue(fieldValues, 'Status') || 'Unknown';
    const track = getFieldValue(fieldValues, 'Track') || 'Unknown';

    return {
      id: item.id,
      title,
      status,
      track,
      updatedAt,
    };
  });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mapped, null, 2), 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

