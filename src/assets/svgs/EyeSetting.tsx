import * as React from 'react';
import Svg, { Path, G, Mask } from 'react-native-svg';

function EyeSetting(props: { width?: number; height?: number; color?: string }) {
  const { width = 24, height = 24, color = '#212121' } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9996 9.64062C10.6696 9.64062 9.58859 10.7226 9.58859 12.0526C9.58859 13.3816 10.6696 14.4626 11.9996 14.4626C13.3296 14.4626 14.4116 13.3816 14.4116 12.0526C14.4116 10.7226 13.3296 9.64062 11.9996 9.64062ZM11.9996 15.9626C9.84259 15.9626 8.08859 14.2086 8.08859 12.0526C8.08859 9.89562 9.84259 8.14062 11.9996 8.14062C14.1566 8.14062 15.9116 9.89562 15.9116 12.0526C15.9116 14.2086 14.1566 15.9626 11.9996 15.9626Z"
        fill={color}
      />
      <Mask
        id="mask0_eye"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={2}
        y={4}
        width={20}
        height={17}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.00015 4H22V20.105H2.00015V4Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask0_eye)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.5699 12.0527C5.4299 16.1617 8.5629 18.6047 11.9999 18.6057C15.4369 18.6047 18.5699 16.1617 20.4299 12.0527C18.5699 7.94475 15.4369 5.50175 11.9999 5.50075C8.5639 5.50175 5.4299 7.94475 3.5699 12.0527ZM12.0019 20.1057H11.9979H11.9969C7.8609 20.1027 4.1469 17.2038 2.0609 12.3488C1.9799 12.1597 1.9799 11.9458 2.0609 11.7568C4.1469 6.90275 7.8619 4.00375 11.9969 4.00075C11.9989 3.99975 11.9989 3.99975 11.9999 4.00075C12.0019 3.99975 12.0019 3.99975 12.0029 4.00075C16.1389 4.00375 19.8529 6.90275 21.9389 11.7568C22.0209 11.9458 22.0209 12.1597 21.9389 12.3488C19.8539 17.2038 16.1389 20.1027 12.0029 20.1057H12.0019Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

export default EyeSetting;
