import { createContext, useContext, useState } from "react";

const AllTeamContext = createContext();

export const AllTeamProvider = ({ children }) => {
  // will store all the teams from different gameweeks for our user
  const [allTeam, setAllTeam] = useState([]);

  return (
    <AllTeamContext.Provider value={{ allTeam, setAllTeam }}>
      {children}
    </AllTeamContext.Provider>
  );
};

export const useAllTeam = () => useContext(AllTeamContext);
