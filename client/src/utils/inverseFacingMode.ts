import { FacingModes, type FacingMode } from "@/types/media";

function inverseFacingMode(value: FacingMode): FacingMode {
  return value === FacingModes.USER
    ? FacingModes.ENVIRONMENT
    : FacingModes.USER;
}

export default inverseFacingMode;
