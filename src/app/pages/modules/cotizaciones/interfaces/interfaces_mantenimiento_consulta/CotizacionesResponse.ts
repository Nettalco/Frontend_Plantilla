import { MessageResponse } from "../../../../../core/interfaces/message.interfaces";

export interface CotizacionesResponse extends MessageResponse {
  data:         Cotizacion[];
}
export interface Cotizacion {
  TABRVCLIE:         string;
  TCODITEMP:         string;
  TCODIESTICLIE:     string;
  TNUMEVERSCLIE:     string;
  TCODIESTINETT:     string;
  TNUMEVERSESTINETT: string;
  TCODITELA:         string;
  TDESCTELA:         string;
  TTIPOCOTI:         string;
  TCODICOTI:         number;
  TCANTPRENPROY:     number | null;
  TPORCGASTCOMIAGEN: number;
  TFECHCREA:         Date;
  TFECHCALC:         Date;
  TCOSTPOND:         number;
  TPRECCOTI:         number;
  TMKUPOBJE:         number | null;
  TESTACOTI:         string;
}
