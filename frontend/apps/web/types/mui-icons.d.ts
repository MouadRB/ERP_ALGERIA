declare module "@mui/icons-material/*" {
  import { type SvgIconProps } from "@mui/material/SvgIcon";

  const Component: (props: SvgIconProps) => JSX.Element;
  export default Component;
}
