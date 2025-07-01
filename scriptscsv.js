const fs = require('fs');
const { parse } = require('csv-parse');
const { Client } = require('pg');

const client = new Client({
  // your connection config
  user: 'steph',
  host: 'localhost',
  database: 'BEELDI_TEST_DB',
  password: 'groscaca',
  port: 5432,
});

async function main() {
  await client.connect();

  // To avoid duplicates, keep a map: { level, name, parentId } => id
  const typeMap = new Map();

  const parser = fs.createReadStream('generic_equipments.csv').pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    let parentId = null;

    for (let level = 1; level <= 4; level++) {
      const colName = ['Domaine', 'Type', 'Catégorie', 'Sous-catégorie'][level - 1];
      const name = row[colName]?.trim();
      if (!name) break;

      // Unique key for this type at this level and parent
      const key = `${level}:${name}:${parentId || ''}`;
      if (!typeMap.has(key)) {
        // Insert into DB
        const res = await client.query(
          'INSERT INTO equipment_types (name, level, parent_id) VALUES ($1, $2, $3) RETURNING id',
          [name, level, parentId]
        );
        typeMap.set(key, res.rows[0].id);
      }
      parentId = typeMap.get(key);
    }
  }

  await client.end();
  console.log('Import complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});