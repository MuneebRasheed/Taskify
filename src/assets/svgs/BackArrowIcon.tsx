import * as React from "react"
import Svg, { Path } from "react-native-svg"

function BackArrowIcon(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M23.334 14.32c0 .442-.33.808-.757.866l-.119.008h-17.5a.875.875 0 01-.118-1.742l.118-.008h17.5c.484 0 .876.392.876.875z"
        fill="#212121"
      />
      <Path
        d="M12.633 20.728a.875.875 0 01-1.136 1.325l-.098-.085L4.34 14.94a.875.875 0 01-.085-1.142l.085-.098L11.4 6.671a.875.875 0 011.32 1.142l-.085.098-6.436 6.41 6.435 6.407z"
        fill="#212121"
      />
    </Svg>
  )
}

export default BackArrowIcon
