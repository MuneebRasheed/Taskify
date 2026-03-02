import * as React from "react"
import Svg, { Path } from "react-native-svg"

function AddIcon(props) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M17.5 10a.624.624 0 01-.625.625h-6.25v6.25a.624.624 0 11-1.25 0v-6.25h-6.25a.625.625 0 110-1.25h6.25v-6.25a.625.625 0 011.25 0v6.25h6.25A.625.625 0 0117.5 10z"
        fill="#7C1C76"
      />
    </Svg>
  )
}

export default AddIcon
