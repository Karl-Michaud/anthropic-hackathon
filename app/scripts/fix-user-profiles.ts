import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUserProfiles() {
  try {
    // Find users with profiles but marked as first-time users
    const allUsers = await prisma.whiteboardData.findMany({
      where: {
        isFirstTimeUser: true,
      },
      select: {
        userId: true,
        userProfile: true,
      },
    })

    // Filter for users with profiles (JSON not null)
    const inconsistentUsers = allUsers.filter(u => u.userProfile !== null)

    console.log('🔧 Fixing User Profiles...')
    console.log('='.repeat(80))

    if (inconsistentUsers.length === 0) {
      console.log('✅ No inconsistencies found. All profiles are correct!')
      return
    }

    console.log(`Found ${inconsistentUsers.length} user(s) to fix:\n`)

    for (const user of inconsistentUsers) {
      console.log(`Fixing user: ${user.userId}`)

      await prisma.whiteboardData.update({
        where: { userId: user.userId },
        data: { isFirstTimeUser: false },
      })

      console.log(`✅ Updated ${user.userId} to isFirstTimeUser: false`)
    }

    console.log('\n' + '='.repeat(80))
    console.log(`✅ Successfully fixed ${inconsistentUsers.length} user profile(s)!`)
  } catch (error) {
    console.error('❌ Error fixing user profiles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserProfiles()
