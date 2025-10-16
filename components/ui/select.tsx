import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface SelectContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  onValueChange?: (value: string) => void;
  value?: string;
  // Fix: Added children to context to make it accessible in SelectValue
  children?: React.ReactNode;
}

const SelectContext = createContext<SelectContextType | null>(null);

export const Select: React.FC<{ children: React.ReactNode; value?: string; onValueChange?: (value: string) => void; }> = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const selectContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectContainerRef.current && !selectContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fix: Pass children through context
  const contextValue = { isOpen, setIsOpen, selectedValue, setSelectedValue, onValueChange, value, children };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectContainerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => context?.setIsOpen(!context.isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-50 ${className}`}
    >
      {children}
       <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  );
};


// Fix: Re-implemented SelectValue to be type-safe and fix multiple errors.
export const SelectValue: React.FC = () => {
    const context = useContext(SelectContext);
    
    const content = React.Children.toArray(context?.children).find(
        (child) => React.isValidElement(child) && child.type === SelectContent
    );

    if (!React.isValidElement(content)) {
        return <span className="pointer-events-none">Selecione...</span>;
    }
    
    const selectedChild = React.Children.toArray(content.props.children).find(
        (child) => React.isValidElement(child) && child.props.value === context?.selectedValue
    );
    
    if (React.isValidElement(selectedChild)) {
        return <span className="pointer-events-none">{selectedChild.props.children}</span>;
    }

    return <span className="pointer-events-none">Selecione...</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context?.isOpen) return null;

  return (
    <div className={`absolute z-50 mt-1 w-full rounded-md border bg-white text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 ${className}`}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const context = useContext(SelectContext);

  const handleSelect = () => {
    context?.setSelectedValue(value);
    context?.onValueChange?.(value);
    context?.setIsOpen(false);
  };
  
  return (
    <div
      onClick={handleSelect}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 dark:focus:bg-gray-700 dark:hover:bg-gray-700 ${className}`}
    >
        {context?.selectedValue === value && <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"/></svg></span>}
      {children}
    </div>
  );
};