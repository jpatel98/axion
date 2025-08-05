const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function checkDateSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Check jobs table due_date column
    const { data: jobsSchema, error: jobsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'jobs')
      .eq('column_name', 'due_date')

    if (jobsError) {
      console.error('Error checking jobs table:', jobsError)
      return
    }

    // Check quotes table due_date column
    const { data: quotesSchema, error: quotesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'quotes')
      .eq('column_name', 'due_date')

    if (quotesError) {
      console.error('Error checking quotes table:', quotesError)
      return
    }

    console.log('Current schema:')
    console.log('Jobs table due_date:', jobsSchema[0]?.data_type || 'NOT FOUND')
    console.log('Quotes table due_date:', quotesSchema[0]?.data_type || 'NOT FOUND')

    if (jobsSchema[0]?.data_type === 'text' && quotesSchema[0]?.data_type === 'text') {
      console.log('✅ Timezone fix migration has been applied')
    } else {
      console.log('❌ Timezone fix migration needs to be applied')
      console.log('Run: psql -d your_database -f database/fix-date-timezone-issue.sql')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkDateSchema() 