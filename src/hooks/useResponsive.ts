import { useWindowDimensions } from 'react-native';

import { layout } from '@/theme/tokens';

/**
 * Mobile-first responsive helpers. The design targets Android phones between
 * 360dp and 430dp; `isCompact` only adjusts density below that range.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < layout.compactBreakpoint;

  return {
    width,
    height,
    isCompact,
    isShort: height < 700,
    screenPadding: isCompact
      ? layout.paddingCompact
      : layout.paddingRegular,
  };
}
