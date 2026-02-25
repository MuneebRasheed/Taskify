import * as React from "react"
import Svg, { Path, Mask, G } from "react-native-svg"

function EmailIcon(props) {
  return (
    <Svg
      width={18}
      height={17}
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.98 9.554a2.535 2.535 0 01-1.577-.552L3.665 5.988a.626.626 0 01.784-.973l3.734 3.01c.47.372 1.13.372 1.603-.003l3.697-3.005a.624.624 0 11.789.97l-3.704 3.01a2.549 2.549 0 01-1.587.557z"
        fill="#212121"
      />
      <Mask
        id="a"
        style={{
          maskType: "luminance"
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={18}
        height={17}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0h17.917v16.25H0V0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.866 15h8.183c.002-.002.008 0 .014 0 .95 0 1.794-.34 2.44-.986.751-.747 1.164-1.821 1.164-3.024V5.267c0-2.328-1.522-4.017-3.618-4.017H4.868c-2.096 0-3.618 1.69-3.618 4.017v5.723c0 1.203.413 2.277 1.163 3.024.647.646 1.491.986 2.441.986h.012zm-.014 1.25c-1.286 0-2.435-.467-3.321-1.35C.543 13.915 0 12.527 0 10.99V5.267C0 2.264 2.092 0 4.867 0h8.182c2.775 0 4.868 2.264 4.868 5.267v5.723c0 1.537-.544 2.925-1.531 3.91-.886.883-2.035 1.35-3.323 1.35H4.852z"
          fill="#212121"
        />
      </G>
    </Svg>
  )
}

export default EmailIcon
