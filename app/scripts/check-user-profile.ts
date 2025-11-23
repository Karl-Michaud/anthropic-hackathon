import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserProfile() {
  try {
    // Get all users with their profile status
    const users = await prisma.whiteboardData.findMany({
      select: {
        userId: true,
        isFirstTimeUser: true,
        userProfile: true,
        updatedAt: true,
      },
    })

    console.log('📊 User Profile Status:')
    console.log('='.repeat(80))

    if (users.length === 0) {
      console.log('No users found in database.')
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.userId}`)
      console.log(`   First Time User: ${user.isFirstTimeUser}`)
      console.log(`   Has Profile: ${user.userProfile ? 'Yes' : 'No'}`)
      console.log(`   Last Updated: ${user.updatedAt}`)

      // Flag inconsistencies
      if (user.userProfile && user.isFirstTimeUser) {
        console.log('   ⚠️  INCONSISTENT: Has profile but marked as first-time user!')
      }
    })

    console.log('\n' + '='.repeat(80))

    // Fix inconsistencies
    const inconsistentUsers = users.filter(u => u.userProfile && u.isFirstTimeUser)
    if (inconsistentUsers.length > 0) {
      console.log(`\n🔧 Found ${inconsistentUsers.length} inconsistent user(s)`)
      console.log('Run "npm run fix-user-profiles" to fix them.')
    } else {
      console.log('\n✅ All user profiles are consistent!')
    }
  } catch (error) {
    console.error('Error checking user profiles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserProfile()
