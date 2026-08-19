const path = require('path');
const Database = require('better-sqlite3');

const dataDirectory = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
const database = new Database(path.join(dataDirectory, 'database.sqlite'));

const stateNames = {
  AL: ['USA', 'Alabama'], AK: ['USA', 'Alaska'], AZ: ['USA', 'Arizona'], AR: ['USA', 'Arkansas'],
  CA: ['USA', 'California'], CO: ['USA', 'Colorado'], CT: ['USA', 'Connecticut'], DE: ['USA', 'Delaware'],
  FL: ['USA', 'Florida'], GA: ['USA', 'Georgia'], HI: ['USA', 'Hawaii'], ID: ['USA', 'Idaho'],
  IL: ['USA', 'Illinois'], IN: ['USA', 'Indiana'], IA: ['USA', 'Iowa'], KS: ['USA', 'Kansas'],
  KY: ['USA', 'Kentucky'], LA: ['USA', 'Louisiana'], ME: ['USA', 'Maine'], MD: ['USA', 'Maryland'],
  MA: ['USA', 'Massachusetts'], MI: ['USA', 'Michigan'], MN: ['USA', 'Minnesota'], MS: ['USA', 'Mississippi'],
  MO: ['USA', 'Missouri'], MT: ['USA', 'Montana'], NE: ['USA', 'Nebraska'], NV: ['USA', 'Nevada'],
  NH: ['USA', 'New Hampshire'], NJ: ['USA', 'New Jersey'], NM: ['USA', 'New Mexico'], NY: ['USA', 'New York'],
  NC: ['USA', 'North Carolina'], ND: ['USA', 'North Dakota'], OH: ['USA', 'Ohio'], OK: ['USA', 'Oklahoma'],
  OR: ['USA', 'Oregon'], PA: ['USA', 'Pennsylvania'], RI: ['USA', 'Rhode Island'], SC: ['USA', 'South Carolina'],
  SD: ['USA', 'South Dakota'], TN: ['USA', 'Tennessee'], TX: ['USA', 'Texas'], UT: ['USA', 'Utah'],
  VT: ['USA', 'Vermont'], VA: ['USA', 'Virginia'], WA: ['USA', 'Washington'], WV: ['USA', 'West Virginia'],
  WI: ['USA', 'Wisconsin'], WY: ['USA', 'Wyoming'], DC: ['USA', 'District of Columbia'],
  AB: ['Canada', 'Alberta'], BC: ['Canada', 'British Columbia'], MB: ['Canada', 'Manitoba'],
  NB: ['Canada', 'New Brunswick'], NL: ['Canada', 'Newfoundland and Labrador'], NS: ['Canada', 'Nova Scotia'],
  NT: ['Canada', 'Northwest Territories'], NU: ['Canada', 'Nunavut'], ON: ['Canada', 'Ontario'],
  PE: ['Canada', 'Prince Edward Island'], QC: ['Canada', 'Quebec'], SK: ['Canada', 'Saskatchewan'], YT: ['Canada', 'Yukon'],
};

function classifyAddress(address) {
  const value = String(address || '').trim();
  const suffix = value.match(/(?:^|[\s,])([A-Z]{2})\s*$/i);
  if (!suffix) return null;
  const location = stateNames[suffix[1].toUpperCase()];
  return location ? { country: location[0], state: location[1] } : null;
}

try {
  const columns = database.prepare('PRAGMA table_info(pantries)').all().map(column => column.name);
  if (!columns.includes('country')) database.exec('ALTER TABLE pantries ADD COLUMN country TEXT');
  if (!columns.includes('state')) database.exec('ALTER TABLE pantries ADD COLUMN state TEXT');

  const rows = database.prepare('SELECT id, address, country, state FROM pantries WHERE country IS NULL OR country = ?').all('');
  const update = database.prepare('UPDATE pantries SET country = ?, state = ? WHERE id = ?');
  const classify = database.transaction(() => {
    let classified = 0;
    for (const row of rows) {
      const location = classifyAddress(row.address);
      if (!location) continue;
      update.run(location.country, location.state, row.id);
      classified += 1;
    }
    return classified;
  });

  const classified = classify();
  const unresolved = database.prepare("SELECT COUNT(*) AS count FROM pantries WHERE country IS NULL OR country = ''").get().count;
  console.log(`Pantry location backfill: classified ${classified}; unresolved ${unresolved}`);
} finally {
  database.close();
}
