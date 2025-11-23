// Mock for @anthropic-ai/sdk to prevent it from running in browser/Storybook
class MockAnthropic {
  constructor() {
    this.messages = {
      create: async () => {
        throw new Error('Anthropic SDK cannot be used in browser/Storybook context');
      }
    };
  }
}

module.exports = MockAnthropic;
module.exports.default = MockAnthropic;
