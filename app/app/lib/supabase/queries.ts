import { createClient } from '@/app/utils/supabase/client'

export interface WhiteboardData {
  cells: unknown[]
  scholarships: unknown[]
  essays: unknown[]
  jsonOutputs: unknown[]
  blockPositions: unknown[]
}

export interface WhiteboardDatabaseRow {
  id: string
  user_id: string
  cells: unknown[]
  scholarships: unknown[]
  essays: unknown[]
  json_outputs: unknown[]
  block_positions: unknown[]
  is_first_time_user: boolean
  created_at: string
  updated_at: string
}

/**
 * Get whiteboard data for a user
 * Returns null if no data exists yet
 */
export async function getWhiteboardData(
  userId: string,
): Promise<WhiteboardDatabaseRow | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('whiteboard_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no row exists yet, return null (not an error)
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching whiteboard data:', error)
    throw error
  }

  return data
}

/**
 * Save whiteboard data for a user
 * Creates new row if doesn't exist, updates if it does
 */
export async function saveWhiteboardData(
  userId: string,
  whiteboardData: WhiteboardData,
): Promise<void> {
  const supabase = createClient()

  console.log('Attempting to save data for user:', userId)
  console.log('Whiteboard data:', {
    cellsCount: whiteboardData.cells.length,
    scholarshipsCount: whiteboardData.scholarships.length,
    essaysCount: whiteboardData.essays.length,
  })

  const dataToSave = {
    user_id: userId,
    cells: whiteboardData.cells,
    scholarships: whiteboardData.scholarships,
    essays: whiteboardData.essays,
    json_outputs: whiteboardData.jsonOutputs,
    block_positions: whiteboardData.blockPositions,
    updated_at: new Date().toISOString(),
  }

  // Try to update first
  const {
    data: updateData,
    error: updateError,
    count,
  } = await supabase
    .from('whiteboard_data')
    .update(dataToSave)
    .eq('user_id', userId)
    .select()

  console.log('Update result:', { updateData, updateError, count })

  // If update failed or no rows affected, try insert
  if (updateError || !updateData || updateData.length === 0) {
    console.log('No rows updated, attempting insert')
    const { data: insertData, error: insertError } = await supabase
      .from('whiteboard_data')
      .insert(dataToSave)
      .select()

    console.log('Insert result:', { insertData, insertError })

    if (insertError) {
      console.error('Error saving whiteboard data:', insertError)
      console.error('Full error object keys:', Object.keys(insertError))
      console.error('Error stringified:', JSON.stringify(insertError, null, 2))
      throw new Error(
        `Failed to save whiteboard data: ${insertError.message || 'Unknown error'}`,
      )
    }
  }
}

/**
 * Mark user as returning (no longer first-time user)
 */
export async function markUserAsReturning(userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('whiteboard_data')
    .update({ is_first_time_user: false })
    .eq('user_id', userId)

  if (error) {
    console.error('Error marking user as returning:', error)
    // Don't throw - this is not critical
  }
}
