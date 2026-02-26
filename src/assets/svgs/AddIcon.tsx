import * as React from "react"
import Svg, { Path } from "react-native-svg"

function AddIcon(props) {
  return (
    <Svg
      width={15}
      height={15}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M15 7.5a.625.625 0 01-.625.625h-6.25v6.25a.625.625 0 11-1.25 0v-6.25H.625a.625.625 0 010-1.25h6.25V.625a.625.625 0 011.25 0v6.25h6.25A.625.625 0 0115 7.5z"
        fill="#FE7A36"
      />
    </Svg>
  )
}

export default AddIcon
