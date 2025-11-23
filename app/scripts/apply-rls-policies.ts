import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyRLSPolicies() {
  console.log('Applying RLS policies...')

  try {
    // Enable RLS on whiteboard_data
    await prisma.$executeRawUnsafe(`
      ALTER TABLE whiteboard_data ENABLE ROW LEVEL SECURITY;
    `)
    console.log('✓ Enabled RLS on whiteboard_data')

    // Drop existing policies if they exist
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can read their own whiteboard data" ON whiteboard_data',
      'DROP POLICY IF EXISTS "Users can insert their own whiteboard data" ON whiteboard_data',
      'DROP POLICY IF EXISTS "Users can update their own whiteboard data" ON whiteboard_data',
      'DROP POLICY IF EXISTS "Users can delete their own whiteboard data" ON whiteboard_data',
    ]

    for (const sql of dropPolicies) {
      await prisma.$executeRawUnsafe(sql)
    }
    console.log('✓ Dropped existing policies')

    // Create RLS policies
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can read their own whiteboard data"
        ON whiteboard_data FOR SELECT
        USING (auth.uid() = user_id);
    `)
    console.log('✓ Created SELECT policy')

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can insert their own whiteboard data"
        ON whiteboard_data FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `)
    console.log('✓ Created INSERT policy')

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can update their own whiteboard data"
        ON whiteboard_data FOR UPDATE
        USING (auth.uid() = user_id);
    `)
    console.log('✓ Created UPDATE policy')

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can delete their own whiteboard data"
        ON whiteboard_data FOR DELETE
        USING (auth.uid() = user_id);
    `)
    console.log('✓ Created DELETE policy')

    // Add indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_whiteboard_data_user_id ON whiteboard_data(user_id);
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_scholarships_user_id ON scholarships(user_id);
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_prompt_personalities_user_id ON prompt_personalities(user_id);
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_prompt_priorities_user_id ON prompt_priorities(user_id);
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_prompt_values_user_id ON prompt_values(user_id);
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_prompt_weights_user_id ON prompt_weights(user_id);
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
    `)
    console.log('✓ Created indexes')

    console.log('\n✅ All RLS policies and indexes applied successfully!')
  } catch (error) {
    console.error('Error applying RLS policies:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyRLSPolicies()
