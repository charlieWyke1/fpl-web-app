import { createContext, useContext, useState } from "react";

const AllClubContext = createContext();

export const AllClubProvider = ({ children }) => {
    // saves all the USERS who are same club as our admin
  const [allUsers, setAllUsers] = useState([]);

  return (
    <AllClubContext.Provider value={{ allUsers, setAllUsers }}>
      {children}
    </AllClubContext.Provider>
  );
};

export const useAllClub = () => useContext(AllClubContext);
