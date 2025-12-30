import { createContext, useContext, useState } from "react";

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  // club data storage - starting players, squad size, numbdef, numbGk, numbMid, numbFwd
  const [clubData, setClubData] = useState({});

  return (
    <ClubContext.Provider value={{ clubData, setClubData }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
