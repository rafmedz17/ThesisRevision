const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'thesis_archive',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to database');

  // First, check current table structure
  connection.query('DESCRIBE thesis', (err, results) => {
    if (err) {
      console.error('❌ Error checking table structure:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log('\nCurrent thesis table structure:');
    console.table(results.map(field => ({
      Field: field.Field,
      Type: field.Type,
      Null: field.Null,
      Key: field.Key,
      Default: field.Default
    })));

    // Check if migration is needed
    const hasSubmittedBy = results.some(field => field.Field === 'submittedBy');
    const hasCreatedAt = results.some(field => field.Field === 'createdAt');
    const hasUpdatedAt = results.some(field => field.Field === 'updatedAt');

    if (hasSubmittedBy && hasCreatedAt && hasUpdatedAt) {
      console.log('\n✓ Migration already applied - all columns exist');
      connection.end();
      return;
    }

    console.log('\n⚠️  Migration needed - missing columns detected');
    console.log('Running migration...\n');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../database/migrations/001_add_submitted_by.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    connection.query(migrationSQL, (err, results) => {
      if (err) {
        console.error('❌ Migration failed:', err.message);
        connection.end();
        process.exit(1);
      }

      console.log('✓ Migration executed successfully');

      // Verify migration
      connection.query('DESCRIBE thesis', (err, results) => {
        if (err) {
          console.error('❌ Error verifying migration:', err.message);
          connection.end();
          process.exit(1);
        }

        console.log('\nUpdated thesis table structure:');
        console.table(results.map(field => ({
          Field: field.Field,
          Type: field.Type,
          Null: field.Null,
          Key: field.Key,
          Default: field.Default
        })));

        console.log('\n✓ Migration completed successfully!');
        connection.end();
      });
    });
  });
});
