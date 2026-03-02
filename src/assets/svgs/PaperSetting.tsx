import * as React from 'react';
import Svg, { Path, G, Mask } from 'react-native-svg';

function PaperSetting(props: { width?: number; height?: number; color?: string }) {
  const { width = 24, height = 24, color = '#212121' } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Mask
        id="mask0_paper"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={3}
        y={2}
        width={18}
        height={20}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.00031 2.01172H20.053V21.8652H3.00031V2.01172Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask0_paper)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.57341 3.51172C5.91641 3.51172 4.54041 4.85372 4.50141 6.50872V17.2037C4.46441 18.9167 5.81441 20.3277 7.51041 20.3657H15.5744C17.2434 20.2967 18.5654 18.9097 18.5534 17.2097V8.33972L13.9184 3.51172H7.58541H7.57341ZM7.58541 21.8657H7.47641C4.95441 21.8087 2.94641 19.7107 3.00141 17.1877V6.49072C3.05941 4.00972 5.10841 2.01172 7.57141 2.01172H7.58841H14.2384C14.4424 2.01172 14.6374 2.09472 14.7794 2.24172L19.8444 7.51872C19.9784 7.65772 20.0534 7.84472 20.0534 8.03772V17.2037C20.0714 19.7127 18.1174 21.7627 15.6044 21.8647L7.58541 21.8657Z"
          fill={color}
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7887 16.1084H8.3887C7.9747 16.1084 7.6387 15.7724 7.6387 15.3584C7.6387 14.9444 7.9747 14.6084 8.3887 14.6084H13.7887C14.2027 14.6084 14.5387 14.9444 14.5387 15.3584C14.5387 15.7724 14.2027 16.1084 13.7887 16.1084Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.7438 12.3564H8.38782C7.97382 12.3564 7.63782 12.0204 7.63782 11.6064C7.63782 11.1924 7.97382 10.8564 8.38782 10.8564H11.7438C12.1578 10.8564 12.4938 11.1924 12.4938 11.6064C12.4938 12.0204 12.1578 12.3564 11.7438 12.3564Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.2985 8.984H16.5435C14.7135 8.979 13.2255 7.487 13.2255 5.659V2.75C13.2255 2.336 13.5615 2 13.9755 2C14.3895 2 14.7255 2.336 14.7255 2.75V5.659C14.7255 6.663 15.5425 7.481 16.5455 7.484H19.2985C19.7125 7.484 20.0485 7.82 20.0485 8.234C20.0485 8.648 19.7125 8.984 19.2985 8.984Z"
        fill={color}
      />
    </Svg>
  );
}

export default PaperSetting;
