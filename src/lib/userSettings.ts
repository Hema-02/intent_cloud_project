import { supabase } from './supabase'

export interface UserSettings {
  profile?: {
    name?: string
    email?: string
    timezone?: string
    language?: string
  }
  notifications?: {
    emailAlerts?: boolean
    smsAlerts?: boolean
    pushNotifications?: boolean
    weeklyReports?: boolean
    budgetAlerts?: boolean
    securityAlerts?: boolean
  }
  security?: {
    twoFactorAuth?: boolean
    sessionTimeout?: string
    passwordExpiry?: string
    loginNotifications?: boolean
  }
  appearance?: {
    theme?: string
    compactMode?: boolean
    showAnimations?: boolean
    defaultView?: string
  }
  integrations?: {
    slack?: boolean
    teams?: boolean
    webhook?: string
    apiAccess?: boolean
  }
}

/**
 * Save user settings to Supabase
 * @param settings - The settings object to save
 * @returns Promise with success message or throws error
 */
export async function saveUserSettings(settings: UserSettings): Promise<string> {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('No authenticated user found. Please log in first.')
    }

    // Upsert the settings into the user_settings table
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        settings: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      throw new Error(`Failed to save settings: ${error.message}`)
    }

    return 'Settings saved successfully!'
    
  } catch (error) {
    console.error('Error saving user settings:', error)
    throw error
  }
}

/**
 * Fetch user settings from Supabase
 * @returns Promise with user settings or null if not found
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('No authenticated user found. Please log in first.')
    }

    // Fetch the settings from the user_settings table
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to fetch settings: ${error.message}`)
    }

    return data?.settings || null
    
  } catch (error) {
    console.error('Error fetching user settings:', error)
    throw error
  }
}

/**
 * Delete user settings from Supabase
 * @returns Promise with success message or throws error
 */
export async function deleteUserSettings(): Promise<string> {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('No authenticated user found. Please log in first.')
    }

    // Delete the settings from the user_settings table
    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete settings: ${error.message}`)
    }

    return 'Settings deleted successfully!'
    
  } catch (error) {
    console.error('Error deleting user settings:', error)
    throw error
  }
}