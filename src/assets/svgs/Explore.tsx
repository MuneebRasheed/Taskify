import * as React from "react"
import Svg, { Path, Mask, G } from "react-native-svg"

function ExploreIcon(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.211 11.212l-1.047 3.347 3.346-1.048 1.048-3.347-3.347 1.048zm-2.19 5.24a.75.75 0 01-.716-.973l1.592-5.089a.746.746 0 01.491-.492l5.09-1.593a.748.748 0 01.94.939l-1.593 5.089a.75.75 0 01-.492.492l-5.089 1.593a.757.757 0 01-.224.034z"
        fill="#9E9E9E"
      />
      <Mask
        id="a"
        style={{
          maskType: "luminance"
        }}
        maskUnits="userSpaceOnUse"
        x={2}
        y={2}
        width={21}
        height={21}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 2h20.722v20.722H2V2z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.36 3.5c-4.885 0-8.86 3.976-8.86 8.861 0 4.886 3.975 8.861 8.86 8.861 4.887 0 8.862-3.975 8.862-8.861 0-4.885-3.975-8.861-8.861-8.861zm0 19.222C6.649 22.722 2 18.074 2 12.361 2 6.648 6.648 2 12.36 2c5.714 0 10.362 4.648 10.362 10.361 0 5.713-4.648 10.361-10.361 10.361z"
          fill="#9E9E9E"
        />
      </G>
    </Svg>
  )
}

export default ExploreIcon
