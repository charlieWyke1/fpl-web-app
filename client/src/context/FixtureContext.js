import { createContext, useContext, useState } from "react";

const FixtureContext = createContext();

export const FixtureProvider = ({ children }) => {
  // stores all the fixtures for the clubs of our admin / logged in user
  const [fixtures, setFixtures] = useState({});

  return (
    <FixtureContext.Provider value={{ fixtures, setFixtures }}>
      {children}
    </FixtureContext.Provider>
  );
};

export const useFixture = () => useContext(FixtureContext);
