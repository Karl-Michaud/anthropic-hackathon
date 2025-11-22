'use client'

import { useDarkMode } from '@/app/context/DarkModeContext'
import {
  colors,
  colorsDark,
  components,
  componentsDark,
} from '@/app/styles/design-system'

export function useTheme() {
  const { isDarkMode } = useDarkMode()

  return {
    isDarkMode,
    colors: isDarkMode ? colorsDark : colors,
    components: isDarkMode ? componentsDark : components,
  }
}
