import * as React from 'react';
import Svg, { Path, G, Mask } from 'react-native-svg';

function LogoutIcon(props: { width?: number; height?: number; color?: string }) {
  const { width = 21, height = 20, color = '#A4299D' } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 21 20" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.319 20H4.433C1.989 20 0 18.011 0 15.565V4.436C0 1.99 1.989 0 4.433 0H9.308C11.754 0 13.744 1.99 13.744 4.436V5.368C13.744 5.782 13.408 6.118 12.994 6.118C12.58 6.118 12.244 5.782 12.244 5.368V4.436C12.244 2.816 10.927 1.5 9.308 1.5H4.433C2.816 1.5 1.5 2.816 1.5 4.436V15.565C1.5 17.184 2.816 18.5 4.433 18.5H9.319C10.931 18.5 12.244 17.188 12.244 15.576V14.633C12.244 14.219 12.58 13.883 12.994 13.883C13.408 13.883 13.744 14.219 13.744 14.633V15.576C13.744 18.016 11.758 20 9.319 20Z"
        fill={color}
      />
      <Mask
        id="mask0_logout"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={6}
        y={9}
        width={15}
        height={2}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.99579 9.25H20.5367V10.75H6.99579V9.25Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask0_logout)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.7868 10.75H7.74579C7.33179 10.75 6.99579 10.414 6.99579 10C6.99579 9.586 7.33179 9.25 7.74579 9.25H19.7868C20.2008 9.25 20.5368 9.586 20.5368 10C20.5368 10.414 20.2008 10.75 19.7868 10.75Z"
          fill={color}
        />
      </G>
      <Mask
        id="mask1_logout"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={16}
        y={6}
        width={5}
        height={8}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.1093 6.33496H20.5367V13.6657H16.1093V6.33496Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask1_logout)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.8591 13.6657C16.6671 13.6657 16.4741 13.5927 16.3281 13.4447C16.0361 13.1507 16.0371 12.6767 16.3301 12.3847L18.7241 9.99971L16.3301 7.61571C16.0371 7.32371 16.0351 6.84971 16.3281 6.55571C16.6201 6.26171 17.0941 6.26171 17.3881 6.55371L20.3161 9.46871C20.4581 9.60871 20.5371 9.80071 20.5371 9.99971C20.5371 10.1987 20.4581 10.3907 20.3161 10.5307L17.3881 13.4467C17.2421 13.5927 17.0501 13.6657 16.8591 13.6657Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

export default LogoutIcon;
