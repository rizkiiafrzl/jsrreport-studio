/*
  Import all JSON datasets into PostgreSQL as JSONB.
  - Scans data-final/ and jsreport-data/template excel/Data/(any)/dataJson.json
  - Creates table json_imports if missing
  - Stores each item as one row with metadata
*/
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function readEnv(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (!val) throw new Error(`Missing env ${name}`);
  return val;
}

function isLikelyArray(value) {
  return Array.isArray(value);
}

function toItems(json) {
  if (isLikelyArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && Array.isArray(json.rows)) return json.rows;
  return [json];
}

function deriveDatasetCode(filePath) {
  const base = path.basename(filePath);
  const code = base.split(' ')[0].replace(/\W+/g, '');
  return code || 'UNKNOWN';
}

async function ensureTable(client) {
  await client.query(`
    create table if not exists json_imports (
      id bigserial primary key,
      dataset_code text not null,
      source_file text not null,
      imported_at timestamptz not null default now(),
      payload jsonb not null
    );
  `);
  await client.query('create index if not exists idx_json_imports_dataset_code on json_imports(dataset_code);');
  await client.query('create index if not exists idx_json_imports_payload_gin on json_imports using gin(payload);');
}

function findJsonFiles() {
  const targets = [];
  const dataFinal = path.join(process.cwd(), 'data-final');
  if (fs.existsSync(dataFinal)) {
    for (const name of fs.readdirSync(dataFinal)) {
      if (name.toLowerCase().endsWith('.json')) targets.push(path.join(dataFinal, name));
    }
  }
  const jsrDataRoot = path.join(process.cwd(), 'jsreport-data', 'template excel', 'Data');
  if (fs.existsSync(jsrDataRoot)) {
    const stack = [jsrDataRoot];
    while (stack.length) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) stack.push(full);
        else if (entry === 'dataJson.json') targets.push(full);
      }
    }
  }
  return targets;
}

async function run() {
  let client;
  if (process.env.DATABASE_URL) {
    client = new Client({ connectionString: process.env.DATABASE_URL });
  } else {
    // Support PG* or fallback to POSTGRES_*
    const host = process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost';
    const port = Number(process.env.PGPORT || process.env.POSTGRES_PORT || '5432');
    const user = process.env.PGUSER || process.env.POSTGRES_USER || 'postgres';
    const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '';
    const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'postgres';
    client = new Client({ host, port, user, password, database });
  }
  await client.connect();
  await ensureTable(client);

  const files = findJsonFiles();
  if (files.length === 0) {
    console.log('No JSON files found.');
    await client.end();
    return;
  }
  console.log(`Found ${files.length} JSON file(s).`);

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    let json;
    try { json = JSON.parse(raw); } catch (e) {
      console.error(`Skip invalid JSON: ${file}`);
      continue;
    }
    const items = toItems(json);
    const datasetCode = deriveDatasetCode(file);
    console.log(`Importing ${items.length} item(s) from ${path.relative(process.cwd(), file)} as ${datasetCode}`);

    // batch insert in chunks
    const chunkSize = 1000;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const values = chunk.map((_, idx) => `($1, $2, $${idx + 3})`).join(',');
      const params = [datasetCode, path.relative(process.cwd(), file), ...chunk.map((it) => JSON.stringify(it))];
      await client.query(`
        insert into json_imports (dataset_code, source_file, payload)
        values ${values}
      `, params);
      console.log(`  inserted ${Math.min(i + chunkSize, items.length)}/${items.length}`);
    }
  }

  await client.end();
  console.log('Done.');
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}


