import * as React from "react"
import Svg, { Path } from "react-native-svg"

function PasswordIcon(props) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.103 8.5a.625.625 0 01-.625-.625V6.086a3.17 3.17 0 00-3.168-3.168h-.013c-.844 0-1.635.325-2.233.918a3.14 3.14 0 00-.937 2.236v1.803a.625.625 0 01-1.25 0V6.086c.005-1.2.47-2.308 1.307-3.138.838-.83 1.945-1.311 3.129-1.28a4.422 4.422 0 014.415 4.418v1.79c0 .344-.28.624-.625.624z"
        fill="#212121"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.119 8.44a2.537 2.537 0 00-2.535 2.535v3.575a2.537 2.537 0 002.535 2.535h6.367a2.538 2.538 0 002.535-2.535v-3.575a2.538 2.538 0 00-2.535-2.535H7.118zm6.367 9.895H7.118a3.789 3.789 0 01-3.785-3.785v-3.575A3.789 3.789 0 017.119 7.19h6.368a3.789 3.789 0 013.785 3.785v3.575a3.789 3.789 0 01-3.785 3.785z"
        fill="#212121"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.302 14.313a.625.625 0 01-.625-.625v-1.851a.625.625 0 011.25 0v1.85c0 .346-.28.626-.625.626z"
        fill="#212121"
      />
    </Svg>
  )
}

export default PasswordIcon
