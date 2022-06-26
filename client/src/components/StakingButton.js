import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'
import {
    getCurrentWalletConnected,
  } from "../utils/interact";
import "./EnterButtonV2.css";
import ball from "../tennis-ball.svg";
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactDOM from "react";

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

const useStyles = makeStyles({
    root: {
        alignItems: "center",
        border: 0,
        borderRadius: "16px",
        boxShadow: "rgb(14 14 44 / 40%) 0px -1px 0px 0px inset",
        display: "inline-flex",
        fontSize: "16px",
        fontWeight: 600,
        justifyContent: "center",
        letterSpacing: "0.03em",
        lineHeight: 1,
        opacity: 1,
        outline: "0px",
        height: "48px",
        padding: "0px 24px",
        backgroundColor: "rgb(31, 199, 212)",
        color: "white",
        maxWidthidth: "280px",

        '&:hover': {
            backgroundColor: "rgba(31, 199, 212, 0.6)",
        }
    },
    disabled: {
        backgroundColor: "rgba(31, 199, 212, 0.4)",
    },
    
  });


export default function EnterButtonV2() {

    const [state, setState] = useState({});

    const classes = useStyles();


    const [contract, setContract] = useState();
    const [provider, setProvider] = useState();

    const [totalStakeBalance, setTotalStakeBalance] = useState();
    const [stakeAmount, setStakeAmount] = useState();

    const [loading, setLoading] = useState(false);


    useEffect(async () => {

        const contract = await loadContract("80001", "Staking");
        setContract(contract);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);


        const chain = 'POLYGON';
        const address = '0xABD132d82Ca6Eca3573D5671af12587cd74744D1';
        const contractAddress = '0x639cB7b21ee2161DF9c882483C9D55c90c20Ca3e';
        const resp = await fetch(
        `https://api-eu1.tatum.io/v3/blockchain/token/balance/${chain}/${contractAddress}/${address}`,
        {
            method: 'GET',
            headers: {
            'x-testnet-type': 'polygon-mumbai',
            'x-api-key': 'c06722f0-7db9-4bfc-8464-3c97d1954e50'
            }
        }
        );

        const data = await resp.text();

        const totalStakeBalance = data.balance
        setTotalStakeBalance(totalStakeBalance);

        addContractListner();

    }, []);

    const handleStaking = async () => {
        const { address, status } = await getCurrentWalletConnected();
        console.log(address);
        const signer = provider.getSigner();
        const contract_rw = contract.connect(signer);

        const numbers = Object.values(state);
        setLoading(true);
        const tx = await contract_rw.stake(stakeAmount);
        setLoading(false);
    };


    async function addContractListner(){
        const contract = await loadContract("80001", "Staking");
        contract.on("fundsStaked", async (amount, event) => {
            const totalStakeBalance = await contract.communityPool();
            setTotalStakeBalance(totalStakeBalance.toNumber());
        })
    }

    const handleChange = event => {
        const result = event.target.value.replace(/\D/g, '');
    
        setStakeAmount(result);
      };

    return(
        <div>
            <div>
                <div style={{
                        textAlign: "center",
                        marginBottom: "10px",
                        fontSize: "20px"}}>
                    <h2> 
                        Total Staked : 
                    </h2>
                    <h2>
                        {totalStakeBalance}
                    </h2>
                </div>
            </div>
            <input
                type="text"
                placeholder="Set your Stake!"
                value={stakeAmount}
                onChange={handleChange}
            />
            <div className="buy-button-container">
                <Button 
                    onClick={handleStaking}
                    classes={{
                        root: classes.root,
                        disabled: classes.disabled,
                    }}
                >
                    Stake Now!
                </Button>
                <div style={{marginLeft: 10}}>
                    {
                        loading ? <CircularProgress /> : null
                    }
                </div>
            </div>
        </div>
    );
} 