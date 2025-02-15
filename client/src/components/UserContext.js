import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  return (
    <UserContext.Provider value={{ email, setEmail, isAdmin, setIsAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
