/**
 * Dark mode aware style utilities
 * Provides conditional classes based on dark mode state
 */

export const darkModeClasses = {
  // Backgrounds
  card: (isDarkMode: boolean) =>
    isDarkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200',

  surface: (isDarkMode: boolean) =>
    isDarkMode
      ? 'bg-gray-700'
      : 'bg-gray-50',

  panel: (isDarkMode: boolean) =>
    isDarkMode
      ? 'bg-gray-750'
      : 'bg-white',

  input: (isDarkMode: boolean) =>
    isDarkMode
      ? 'bg-gray-700 text-white border-gray-600'
      : 'bg-white text-gray-900 border-gray-300',

  button: (isDarkMode: boolean) =>
    isDarkMode
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',

  textPrimary: (isDarkMode: boolean) =>
    isDarkMode
      ? 'text-gray-100'
      : 'text-gray-900',

  textSecondary: (isDarkMode: boolean) =>
    isDarkMode
      ? 'text-gray-400'
      : 'text-gray-600',

  border: (isDarkMode: boolean) =>
    isDarkMode
      ? 'border-gray-700'
      : 'border-gray-200',

  divider: (isDarkMode: boolean) =>
    isDarkMode
      ? 'border-gray-600'
      : 'border-gray-300',

  hover: (isDarkMode: boolean) =>
    isDarkMode
      ? 'hover:bg-gray-700'
      : 'hover:bg-gray-100',

  highlight: (isDarkMode: boolean) =>
    isDarkMode
      ? 'bg-yellow-900/30 border-yellow-700'
      : 'bg-yellow-50 border-yellow-200',

  shadow: (isDarkMode: boolean) =>
    isDarkMode
      ? 'shadow-lg shadow-black/30'
      : 'shadow-lg shadow-gray-200',
}
