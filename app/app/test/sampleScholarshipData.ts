/**
 * Sample scholarship data for testing purposes
 * This represents the expected output from the AI extraction API
 */

import { ScholarshipData } from '../components/ScholarshipBlock'
import { EssayData } from '../components/EssayBlock'

export const sampleScholarship: ScholarshipData = {
  id: 'scholarship-test-1',
  title: 'TD Scholarships for Community Leadership',
  description:
    'Description of Scholarship. Lorem ipsum dolor sit amet consectetur. Viverra adipiscing duis in malesuada elementum dignissim elit. Felis dictumst aliquet vitae elit et aliquam. Rutrum pellentesque tristique mattis duis et nisi facilisis luctus. Imperdiet scelerisque erat ultricies nisl luctus justo. Justo non fames at faucibus aliquam sodales. Odio id lorem arcu viverra. Luctus sed suscipit sed feugiat suspendisse ut penatibus. Malesuada sagittis fames nunc dui phasellus mauris nibh dis.',
  prompt:
    'Description of Prompt. Lorem ipsum dolor sit amet consectetur. Viverra adipiscing duis in malesuada elementum dignissim elit.',
}

export const sampleScholarship2: ScholarshipData = {
  id: 'scholarship-test-2',
  title: 'Future Leaders in Technology Scholarship',
  description:
    'This scholarship is awarded to students who demonstrate exceptional innovation and technical skills. Candidates should show a track record of building projects, learning from failure, and making real-world impact through technology.',
  prompt:
    'Describe a technical project you have built and how it has impacted your community or solved a real problem.',
}

export const sampleEssay: EssayData = {
  id: 'essay-test-1',
  scholarshipId: 'scholarship-test-1',
  content: '',
  maxWordCount: 500,
}

export const sampleGeneratedEssay: EssayData = {
  id: 'essay-test-2',
  scholarshipId: 'scholarship-test-2',
  content: `Growing up in a small town with limited resources, I discovered early on that technology could be a great equalizer. When our local library announced budget cuts that would eliminate their after-school tutoring program, I saw an opportunity to make a difference.

At sixteen, I developed "StudyBuddy," a peer-to-peer tutoring platform that connected high school students with younger learners in our community. What started as a simple web application built with React and Node.js evolved into a comprehensive learning management system used by over 200 students.

The project taught me invaluable lessons about failure and iteration. My first version crashed constantly under multiple users—a humbling reminder that real-world applications face challenges never encountered in tutorials. I spent weeks debugging, learning about database optimization, and implementing proper error handling.

The impact exceeded my expectations. Test scores improved by an average of 15% among participating elementary students, and several high school volunteers discovered their passion for teaching. More importantly, StudyBuddy created a culture of mutual support that persisted even after I graduated.

This experience solidified my commitment to using technology for social good and taught me that the most meaningful innovations come from deeply understanding community needs.`,
  maxWordCount: 300,
}

export const sampleApiResponse = {
  success: true,
  data: {
    ScholarshipName: 'TD Scholarships for Community Leadership',
    ScholarshipDescription:
      'This prestigious scholarship recognizes students who have demonstrated outstanding community leadership. Award amount: $10,000. Eligibility: Canadian citizens or permanent residents enrolled in post-secondary education. Deadline: March 15, 2025.',
    EssayPrompt:
      'Describe a community initiative you have led and its lasting impact on the people it served.',
  },
}
