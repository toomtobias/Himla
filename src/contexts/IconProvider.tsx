import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type IconStyle = "lucide" | "meteocons";

interface IconContextType {
  iconStyle: IconStyle;
  toggleIconStyle: () => void;
}

const IconContext = createContext<IconContextType>({
  iconStyle: "lucide",
  toggleIconStyle: () => {},
});

const STORAGE_KEY = "himla-icon-style";

export function IconProvider({ children }: { children: ReactNode }) {
  const [iconStyle, setIconStyle] = useState<IconStyle>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "meteocons" ? "meteocons" : "lucide";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, iconStyle);
  }, [iconStyle]);

  const toggleIconStyle = () =>
    setIconStyle((s) => (s === "lucide" ? "meteocons" : "lucide"));

  return (
    <IconContext.Provider value={{ iconStyle, toggleIconStyle }}>
      {children}
    </IconContext.Provider>
  );
}

export const useIconStyle = () => useContext(IconContext);
