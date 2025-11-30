# Database Migrations

## How to Run Migrations

### Option 1: Using MySQL Command Line

```bash
mysql -h 31.97.116.89 -P 5444 -u mysql -p LankaAid < migrations/2025-11-29-donation-tracking-system.sql
```

When prompted, enter your database password: `rxKXgIImsj91XtDSH3oI6gOHDcMn534AcfcoIWIZ7K8ErCMGguwKB5k4XRjwM9lx`

### Option 2: Using phpMyAdmin or Database GUI

1. Open your database management tool (phpMyAdmin, MySQL Workbench, DBeaver, etc.)
2. Connect to your database:
   - Host: `31.97.116.89`
   - Port: `5444`
   - User: `mysql`
   - Password: `rxKXgIImsj91XtDSH3oI6gOHDcMn534AcfcoIWIZ7K8ErCMGguwKB5k4XRjwM9lx`
   - Database: `LankaAid`
3. Open the SQL query window
4. Copy and paste the entire content of `2025-11-29-donation-tracking-system.sql`
5. Execute the SQL

### Option 3: Copy-Paste Individual Queries

If you prefer to run queries one by one, copy each section from the migration file and execute them in order.

## What This Migration Does

### Donations Table
- Adds `donor_phone` column for contact information (visible only to post owner)
- Adds `item_description` column for detailed donation info
- Adds `status` enum column for tracking donation lifecycle (pledged, in_transit, delivered, fulfilled)
- Adds `fulfilled_at` timestamp for when donation was confirmed as received
- Adds index on `status` for faster filtering

### Donation Images Table (New)
- Creates new table to store proof-of-donation photos
- Links to donations via `donation_id` foreign key
- Supports multiple images per donation with display order
- Cascading delete when donation is removed

## After Migration

1. Verify the changes by running the verification queries at the bottom of the migration file
2. Redeploy your application on Coolify
3. The backend should start successfully
4. Test the new donation tracking features

## Rollback (If Needed)

If you need to undo these changes:

```sql
-- Remove new columns from donations
ALTER TABLE donations
  DROP COLUMN fulfilled_at,
  DROP COLUMN status,
  DROP COLUMN item_description,
  DROP COLUMN donor_phone,
  DROP INDEX idx_donations_status;

-- Drop donation_images table
DROP TABLE IF EXISTS donation_images;
```
