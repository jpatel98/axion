import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please refresh the page.' }, { status: 404 })
    }

    // Get settings for the tenant
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no settings exist, return default values
    if (!settings) {
      return NextResponse.json({
        companyName: '',
        contactEmail: '',
        phone: '',
        address: '',
        emailNotifications: true,
        jobCompletionNotifications: true,
        inventoryAlerts: true,
        quoteReminders: true,
        currency: 'CAD',
        timezone: 'America/Toronto',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-CA'
      })
    }

    // Transform database format to frontend format
    return NextResponse.json({
      companyName: settings.company_name || '',
      contactEmail: settings.contact_email || '',
      phone: settings.phone || '',
      address: settings.address || '',
      emailNotifications: settings.email_notifications,
      jobCompletionNotifications: settings.job_completion_notifications,
      inventoryAlerts: settings.inventory_alerts,
      quoteReminders: settings.quote_reminders,
      currency: settings.currency,
      timezone: settings.timezone,
      dateFormat: settings.date_format,
      numberFormat: settings.number_format
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please refresh the page.' }, { status: 404 })
    }

    const body = await request.json()

    // Transform frontend format to database format
    const settingsData = {
      tenant_id: user.tenant_id,
      company_name: body.companyName,
      contact_email: body.contactEmail,
      phone: body.phone,
      address: body.address,
      email_notifications: body.emailNotifications,
      job_completion_notifications: body.jobCompletionNotifications,
      inventory_alerts: body.inventoryAlerts,
      quote_reminders: body.quoteReminders,
      currency: body.currency,
      timezone: body.timezone,
      date_format: body.dateFormat,
      number_format: body.numberFormat
    }

    // Use upsert to insert or update
    const { data, error } = await supabase
      .from('settings')
      .upsert(settingsData, { 
        onConflict: 'tenant_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Settings upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Settings saved successfully',
      data 
    })

  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}