import { COLORS as DEFAULT_COLORS } from '../colors'

export const COLORS = {
  ...DEFAULT_COLORS,
  testnet: '#004a67',
  testnetLight: '#ffffff',
} satisfies { [colorName: string]: string }
