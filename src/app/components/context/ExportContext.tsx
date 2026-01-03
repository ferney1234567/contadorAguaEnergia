"use client";
import { createContext, useContext, useState } from "react";

const ExportContext = createContext<any>(null);

export const ExportProvider = ({ children }: any) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [aguaData, setAguaData] = useState([]);
  const [energiaData, setEnergiaData] = useState([]);

  return (
    <ExportContext.Provider
      value={{
        dashboardData,
        setDashboardData,
        aguaData,
        setAguaData,
        energiaData,
        setEnergiaData,
      }}
    >
      {children}
    </ExportContext.Provider>
  );
};

export const useExportData = () => useContext(ExportContext);
