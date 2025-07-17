import { useState } from "react";

export const usePopupOpen = () => {

    const [openPopup, setOpenPopup] = useState(false);

    const hangeStatePopUp = (value: boolean) => {
        setOpenPopup(value);
    }

    return {
        openPopup,
        hangeStatePopUp
    }

}