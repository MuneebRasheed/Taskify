import * as React from 'react';
import Svg, { Path, G, Mask } from 'react-native-svg';

function ActivitySetting(props: { width?: number; height?: number; color?: string }) {
  const { width = 24, height = 24, color = '#212121' } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.21629 16.0031C7.05629 16.0031 6.89529 15.9521 6.75929 15.8481C6.43129 15.5951 6.36929 15.1241 6.62229 14.7961L9.61529 10.9061C9.73729 10.7471 9.91829 10.6441 10.1163 10.6191C10.3183 10.5931 10.5163 10.6491 10.6733 10.7741L13.4933 12.9891L15.9603 9.80611C16.2143 9.47711 16.6843 9.41611 17.0123 9.67211C17.3403 9.92611 17.4003 10.3971 17.1463 10.7241L14.2163 14.5041C14.0943 14.6621 13.9143 14.7651 13.7163 14.7891C13.5163 14.8161 13.3183 14.7581 13.1603 14.6351L10.3423 12.4211L7.81129 15.7101C7.66329 15.9021 7.44129 16.0031 7.21629 16.0031Z"
        fill={color}
      />
      <Mask
        id="mask0_activity"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={17}
        y={2}
        width={6}
        height={6}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.2953 2H22.6393V7.3449H17.2953V2Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask0_activity)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.9673 3.5C19.3213 3.5 18.7953 4.025 18.7953 4.672C18.7953 5.318 19.3213 5.845 19.9673 5.845C20.6133 5.845 21.1393 5.318 21.1393 4.672C21.1393 4.025 20.6133 3.5 19.9673 3.5ZM19.9673 7.345C18.4943 7.345 17.2953 6.146 17.2953 4.672C17.2953 3.198 18.4943 2 19.9673 2C21.4413 2 22.6393 3.198 22.6393 4.672C22.6393 6.146 21.4413 7.345 19.9673 7.345Z"
          fill={color}
        />
      </G>
      <Mask
        id="mask1_activity"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={2}
        y={2}
        width={20}
        height={21}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 2.8418H21.8619V22.7028H2V2.8418Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask1_activity)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.2329 22.7028H7.62891C4.26191 22.7028 1.99991 20.3378 1.99991 16.8178V8.7358C1.99991 5.2108 4.26191 2.8418 7.62891 2.8418H14.8969C15.3109 2.8418 15.6469 3.1778 15.6469 3.5918C15.6469 4.0058 15.3109 4.3418 14.8969 4.3418H7.62891C5.12091 4.3418 3.49991 6.0658 3.49991 8.7358V16.8178C3.49991 19.5228 5.08191 21.2028 7.62891 21.2028H16.2329C18.7409 21.2028 20.3619 19.4818 20.3619 16.8178V9.7788C20.3619 9.3648 20.6979 9.0288 21.1119 9.0288C21.5259 9.0288 21.8619 9.3648 21.8619 9.7788V16.8178C21.8619 20.3378 19.5999 22.7028 16.2329 22.7028Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

export default ActivitySetting;
