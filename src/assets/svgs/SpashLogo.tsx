import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { palette } from '../../../utils/colors';

export type SpashLogoProps = {
  fill?: string;
  color?: string;
  width?: number;
  height?: number;
};

function SpashLogo(props: SpashLogoProps) {
  const { fill, color, width = 160, height = 160, ...rest } = props;
  const fillColor = fill ?? color ?? palette.primary;
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 160 160"
      fill="none"
      {...rest}
    >
      <Path d="M90.068 70.49c5.329 5.33 5.329 13.97 0 19.299-5.33 5.329-13.97 5.329-19.298 0-5.33-5.329-5.33-13.97 0-19.298 5.329-5.33 13.969-5.33 19.298 0zM47.054 66.631c-4.264-4.263-4.264-11.175 0-15.438L87.58 10.667c8.526 8.526 8.526 22.35 0 30.877L62.492 66.63c-4.263 4.263-11.175 4.263-15.438 0zM72.42 149.334c-8.526-8.527-8.526-22.351 0-30.877l25.088-25.088c4.263-4.263 11.175-4.263 15.438 0 4.263 4.264 4.263 11.176 0 15.439L72.42 149.334zM93.369 47.333c4.263-4.263 11.175-4.263 15.438 0l40.526 40.526c-8.526 8.526-22.35 8.526-30.877 0L93.369 62.772c-4.263-4.264-4.263-11.175 0-15.439zM10.667 72.7c8.526-8.526 22.35-8.526 30.877 0L66.63 97.787c4.263 4.264 4.263 11.176 0 15.439s-11.175 4.263-15.438 0L10.666 72.7z" fill={fillColor} />
    </Svg>
  );
}

export default SpashLogo;
