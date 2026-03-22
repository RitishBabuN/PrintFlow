import React, { createContext, useState, useContext } from 'react';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    const [lockedBalance, setLockedBalance] = useState(0);

    const updateBalances = (newBalance, newLocked) => {
        if (newBalance !== undefined) setBalance(newBalance);
        if (newLocked !== undefined) setLockedBalance(newLocked);
    };

    return (
        <WalletContext.Provider value={{ balance, lockedBalance, updateBalances }}>
            {children}
        </WalletContext.Provider>
    );
};
