import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ActiveHome(props) {
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
        d="M14.908 16.885H9.093a.75.75 0 010-1.5h5.815a.75.75 0 010 1.5zM19.25 6.158c-.363-.32-.776-.682-1.268-1.137-.223-.18-.467-.386-.726-.604-1.46-1.231-3.46-2.917-5.283-2.917-1.802 0-3.673 1.592-5.176 2.871-.278.236-.538.458-.803.673-.466.432-.879.795-1.243 1.116-2.387 2.101-2.836 2.652-2.836 7.553C1.914 22.5 4.455 22.5 12 22.5c7.544 0 10.086 0 10.086-8.787 0-4.902-.449-5.453-2.837-7.555z"
        fill="#FE7A36"
      />
    </Svg>
  )
}

export default ActiveHome
