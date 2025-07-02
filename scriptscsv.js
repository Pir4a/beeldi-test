const fs = require('fs');
const { parse } = require('csv-parse');
const { Client } = require('pg');

const client = new Client({
  // your connection config
  user: 'steph',
  host: 'localhost',
  database: 'BEELDI_TEST_DB',
  password: 'MDPTEST',
  port: 5432,
});

// Simple fake UUID generator (not RFC4122 compliant, but unique enough for dev)
function fakeUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
          'INSERT INTO equipment_types (name, level, parent_id, uuid) VALUES ($1, $2, $3, $4) RETURNING id',
          [name, level, parentId, fakeUUID()]
        );
        typeMap.set(key, res.rows[0].id);
      }
      parentId = typeMap.get(key);
    }
  }

  await client.end();
  console.log('Import complete!');
}

// Script to delete all equipment_types rows without a uuid
async function cleanupEquipmentTypesWithoutUUID() {
  await client.connect();
  const res = await client.query("DELETE FROM equipment_types WHERE ID IS NULL");
  console.log(`Deleted ${res.rowCount} equipment_types without uuid.`);
  await client.end();
}

// Run cleanup if 'cleanup' argument is provided
if (process.argv[2] === 'cleanup') {
  cleanupEquipmentTypesWithoutUUID().catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
