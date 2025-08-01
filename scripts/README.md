# Test Data Seeding

This directory contains scripts to safely add and remove test data from your production database.

## 🔒 Safety Features

- **Tenant Isolation**: All test data is scoped to your specific tenant_id
- **Clear Prefixes**: Test data is marked with `[TEST]` prefixes for easy identification
- **Easy Cleanup**: One command to remove all test data
- **No Real Data Impact**: Your actual production data remains untouched

## 📦 What Gets Created

The seeding script creates realistic manufacturing test data:

- **3 Test Customers** with Canadian addresses
- **5 Work Centers** including CNC mills, lathes, welding, and assembly
- **5 Manufacturing Jobs** in different stages (pending, in_progress, completed, shipped)
- **Job Operations** with realistic machining sequences
- **Scheduled Operations** for testing the scheduler page

## 🚀 Usage

### Add Test Data
```bash
npm run seed-test-data
```

### Remove Test Data
```bash
npm run cleanup-test-data
```

## 🎯 Perfect for Testing

This test data is ideal for:
- Testing the UX flow simplifications
- Demonstrating the manufacturing workflow
- Testing mobile responsiveness on various screen sizes
- Validating search and filtering functionality
- Testing the scheduler with realistic data

## 🛡️ Data Safety

- All test customers start with `[TEST]` 
- All test jobs start with `TEST-`
- All test work centers include `[TEST]` in the name
- Your real production data is never modified
- Cleanup removes only test data, leaving your real data intact

## 🔧 Troubleshooting

If the script fails, it's likely due to:
1. Missing environment variables (check `.env.local`)
2. Database schema differences (check `/database` folder for latest schema)
3. Network connectivity to Supabase

The script will provide clear error messages to help diagnose issues.