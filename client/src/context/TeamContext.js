import { createContext, useContext, useState } from "react";

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  // gets the team of the user who has loged in
  const [team, setTeam] = useState("");

  return (
    <TeamContext.Provider value={{ team, setTeam }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
