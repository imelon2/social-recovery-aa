import {
  Chip,
  TextField,
} from "@mui/material";
import { shortAddress } from "../libs/utils";
import { IAddressComponentProps } from "../libs/types";
import "./AddressComponent.css";
import { useEffect } from "react";


function AddressComponent({ props }: { props: IAddressComponentProps[] }) {

  const handleCopy = async (address:string) => {
    try {
      await navigator.clipboard.writeText(address);
    //   alert("주소가 복사되었습니다!");
    } catch (err) {
      alert("복사에 실패했습니다.");
    }
  };
  return (
    <>
      {props.map((prop) => {
        return (
          <>
            <div className="address-container" key={prop.tag}>
              <div className="address-chip">
                <Chip label={prop.tag} variant="outlined" />
              </div>
              <TextField
                id="standard-basic"
                label="address"
                value={shortAddress(prop.address)}
                variant="standard"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                onClick={async () =>
                  await handleCopy(prop.address)
                }
              />
              <TextField
                id="standard-basic"
                label="ETH"
                value={prop.balance}
                variant="standard"
                color="info"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
            </div>
          </>
        );
      })}
    </>
  );
}

export default AddressComponent;
