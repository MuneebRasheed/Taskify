import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Xtwitter(props: { width?: number; height?: number; color?: string }) {
  const { width = 24, height = 24, color = '#7C1C76' } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.7512 3H20.818L14.1179 10.6577L22 21.0782H15.8275L10.9936 14.7582L5.46266 21.0782H2.39401L9.56038 12.8874L2 3H8.32735L12.6967 8.77667L17.7512 3ZM16.6748 19.2425H18.3742L7.4049 4.73921H5.58133L16.6748 19.2425Z"
        fill={color}
      />
    </Svg>
  );
}

export default Xtwitter;
