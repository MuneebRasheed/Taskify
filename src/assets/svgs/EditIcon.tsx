import * as React from "react"
import Svg, { Path, Mask, G } from "react-native-svg"

function EditIcon(props) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.563 16.455h-5.44a.563.563 0 010-1.125h5.44a.563.563 0 010 1.125z"
        fill="#212121"
      />
      <Mask
        id="a"
        style={{
          maskType: "luminance"
        }}
        maskUnits="userSpaceOnUse"
        x={1}
        y={2}
        width={14}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.5 2.25h12.886v14.205H1.5V2.25z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.833 3.762l-7.061 8.832a.66.66 0 00-.129.566l.511 2.164 2.28-.029a.711.711 0 00.55-.264c2.412-3.019 7.012-8.774 7.142-8.943.123-.2.171-.481.107-.753a1.058 1.058 0 00-.49-.665 244.788 244.788 0 01-1.355-1.049 1.123 1.123 0 00-1.555.141zM2.71 16.455a.563.563 0 01-.547-.433l-.615-2.603c-.126-.54 0-1.096.345-1.528l7.065-8.837.009-.01a2.253 2.253 0 013.12-.304l1.293 1.004c.456.272.812.757.947 1.332a2.147 2.147 0 01-.276 1.65c-.023.037-.043.069-7.19 9.009-.344.429-.86.678-1.414.685l-2.73.035H2.71z"
          fill="#212121"
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.168 8.764a.565.565 0 01-.343-.117l-4.09-3.14a.563.563 0 01.686-.892l4.09 3.14a.562.562 0 01-.343 1.009z"
        fill="#212121"
      />
    </Svg>
  )
}

export default EditIcon
