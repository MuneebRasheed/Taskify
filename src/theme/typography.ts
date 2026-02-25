/**
 * Font family names to use with fontFamily in styles.
 */

export const fontFamilies = {
  // Poppins
  poppins: 'Poppins_400Regular',
  poppinsMedium: 'Poppins_500Medium',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsBold: 'Poppins_700Bold',
  // Inter
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  // Urbanist – all styles
  urbanistThin: 'Urbanist_100Thin',
  urbanistExtraLight: 'Urbanist_200ExtraLight',
  urbanistLight: 'Urbanist_300Light',
  urbanist: 'Urbanist_400Regular',
  urbanistMedium: 'Urbanist_500Medium',
  urbanistSemiBold: 'Urbanist_600SemiBold',
  urbanistBold: 'Urbanist_700Bold',
  urbanistExtraBold: 'Urbanist_800ExtraBold',
  urbanistBlack: 'Urbanist_900Black',
  urbanistThinItalic: 'Urbanist_100Thin_Italic',
  urbanistExtraLightItalic: 'Urbanist_200ExtraLight_Italic',
  urbanistLightItalic: 'Urbanist_300Light_Italic',
  urbanistItalic: 'Urbanist_400Regular_Italic',
  urbanistMediumItalic: 'Urbanist_500Medium_Italic',
  urbanistSemiBoldItalic: 'Urbanist_600SemiBold_Italic',
  urbanistBoldItalic: 'Urbanist_700Bold_Italic',
  urbanistExtraBoldItalic: 'Urbanist_800ExtraBold_Italic',
  urbanistBlackItalic: 'Urbanist_900Black_Italic',
} as const;

export type FontFamily = (typeof fontFamilies)[keyof typeof fontFamilies];
