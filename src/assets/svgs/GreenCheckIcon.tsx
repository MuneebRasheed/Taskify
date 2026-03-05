import * as React from "react"
import Svg, { Path } from "react-native-svg"

function GreenCheckIcon(props) {
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
        d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12z"
        fill="#12D18E"
      />
      <Path
        d="M16.898 9.773l-6 6a.562.562 0 01-.797 0l-2.625-2.625a.564.564 0 01.797-.797l2.227 2.227 5.602-5.6a.564.564 0 01.797.796l-.001-.001z"
        fill="#fff"
      />
    </Svg>
  )
}

export default GreenCheckIcon
