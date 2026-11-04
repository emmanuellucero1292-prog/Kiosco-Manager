import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [section, setSection] = useState("Bebidas");
  const [search, setSearch] = useState("");

  return (
    <AppContext.Provider value={{ section, setSection, search, setSearch }}>
      {children}
    </AppContext.Provider>
  );
};
