import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";


const useStyles = makeStyles({
    root: {
      padding: "7px 16px",
      backgroundColor: "white",
      float: "right",
      border: "2px solid #254cdd",
      borderRadius: "40px",
      color: "#254cdd",
      marginTop:" 0px",
      '&:hover': {
        background: "rgba(37,76,221,0.5)",
      },
    }
  
  });
  
export const providerOptions = {
   coinbasewallet: {
     package: CoinbaseWalletSDK, 
     options: {
       appName: "Web 3 Modal Demo",
       infuraId: process.env.INFURA_KEY 
     }
   },
   walletconnect: {
     package: WalletConnect, 
     options: {
       infuraId: process.env.INFURA_KEY 
     }
   }
};

const web3Modal = new Web3Modal({
    providerOptions // required
  });

const ConnectButton = () => {
    const [provider, setProvider] = useState();
    const [library, setLibrary] = useState();
    const [account, setAccount] = useState();
    const [network, setNetwork] = useState();
    const [chainId, setChainId] = useState();

    const classes = useStyles();

    useEffect(() => {
        if (provider?.on) {
          const handleAccountsChanged = (accounts) => {
            setAccount(accounts);
          };
      
          const handleChainChanged = (chainId) => {
            setChainId(chainId);
          };
      
          const handleDisconnect = () => {
            disconnect();
          };
      
          provider.on("accountsChanged", handleAccountsChanged);
          provider.on("chainChanged", handleChainChanged);
          provider.on("disconnect", handleDisconnect);
      
          return () => {
            if (provider.removeListener) {
              provider.removeListener("accountsChanged", handleAccountsChanged);
              provider.removeListener("chainChanged", handleChainChanged);
              provider.removeListener("disconnect", handleDisconnect);
            }
          };
        }
      }, [provider]);

    const connectWallet = async () => {
      try {
        const provider = await web3Modal.connect();
        const library = new ethers.providers.Web3Provider(provider);
        const accounts = await library.listAccounts();
        const network = await library.getNetwork();
        console.log(process.env)
        setProvider(provider);
        setLibrary(library);
        if (accounts) setAccount(accounts[0]);
        setNetwork(network);
      } catch (error) {
        console.error(error);
      }
    };
    
    const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
      };
    
    const refreshState = () => {
        setAccount();
        setChainId();
      };

    
    return (
      <div className="App">
        <Button classes={{root: classes.root}} onClick={connectWallet}>Connect Wallet</Button>
            <div>Connection Status: ${!!account}</div>
            <div>Wallet Address: ${account}</div>
            <div>      
                <button onClick={disconnect}>Disconnect</button>
            </div>
        </div>
    );
}

export default ConnectButton;