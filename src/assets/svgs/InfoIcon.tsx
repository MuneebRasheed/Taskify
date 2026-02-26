import * as React from "react"
import Svg, { Mask, Path, G } from "react-native-svg"

function InfoIcon(props) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Mask
        id="a"
        style={{
          maskType: "luminance"
        }}
        maskUnits="userSpaceOnUse"
        x={1}
        y={1}
        width={18}
        height={18}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.667 1.667h16.666v16.666H1.667V1.667z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.387 2.917c-2.108 0-3.47 1.444-3.47 3.68v6.806c0 2.236 1.362 3.68 3.47 3.68h7.223c2.11 0 3.473-1.444 3.473-3.68V6.596c0-2.235-1.363-3.68-3.471-3.68H6.387zm7.223 15.416H6.387c-2.824 0-4.72-1.981-4.72-4.93V6.596c0-2.948 1.896-4.93 4.72-4.93h7.225c2.824 0 4.721 1.982 4.721 4.93v6.807c0 2.949-1.897 4.93-4.723 4.93z"
          fill="#757575"
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.995 13.958a.625.625 0 01-.625-.625V10a.625.625 0 011.25 0v3.333c0 .345-.28.625-.625.625M10 7.67a.836.836 0 01-.838-.833c0-.461.369-.834.829-.834h.008a.833.833 0 110 1.667"
        fill="#757575"
      />
    </Svg>
  )
}

export default InfoIcon
