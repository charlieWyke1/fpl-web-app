import { createContext, useContext, useState } from "react";

const CurrentTeamContext = createContext();

export const CurrentTeamProvider = ({ children }) => {
  // will store our users currentgw team
  const [currentTeam, setCurrentTeam] = useState([]);

  return (
    <CurrentTeamContext.Provider value={{ currentTeam, setCurrentTeam }}>
      {children}
    </CurrentTeamContext.Provider>
  );
};

export const useCurrentTeam = () => useContext(CurrentTeamContext);
