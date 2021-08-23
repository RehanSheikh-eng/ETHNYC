import { Button } from "@material-ui/core";
import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";
import { BigNumber, ethers } from 'ethers'
import { toUtf8CodePoints } from "ethers/lib/utils";
import "./LotteryHub.css";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import FastForwardIcon from '@material-ui/icons/FastForward';
import ball from "../tennis-ball.svg";

export default function LotteryHub(){

    const [state, setState] = useState({
        allLotteriesWinningNumbers: [],
    });

    const [provider, setProvider] = useState();
    const [loading, setLoading] = useState();
    const [lottery, setLottery] = useState();
    const [numTickets, setNumTickets] = useState();
    const [activeButton, setActiveButton] = useState("All History");
    const [searchLotteryId, setSearchLotteryId] = useState();
    const [currentLotteryId, setCurrentLotteryId] = useState();
    const [lotteryInfo, setLotteryInfo] = useState();
    const [drawTime, setDrawTime] = useState();
    const [winningNumbers, setWinningNumbers] = useState([]);
    const [rotation, setRotation] = useState([]);
    const [hueRotate, setHueRotate] = useState([]);
    const [lotterySize, setLotterySize] = useState();

    useEffect( async () => {

        const lottery = await loadContract("dev", "Lottery");
        setLottery(lottery);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const lotterySize = await lottery.sizeOfLottery();
        setLotterySize(lotterySize.toNumber());

        const currentLotteryId = await lottery.lottoId();
        setCurrentLotteryId(currentLotteryId.toNumber());

        setSearchLotteryId(currentLotteryId.toNumber() - 1);

        const rotation = [];
        for (let i = 0; i < lotterySize.toNumber(); i++) {
            let rot = Math.floor(Math.random()*15 + 7);
            rot *= Math.round(Math.random()) ? 1 : -1;
            rotation.push(rot);
        };
        setRotation(rotation);

        const hueRotate = []
        for (let i = 0; i < lotterySize.toNumber(); i++) {
            let numrots = 360/lotterySize.toNumber(); 
            let rot = numrots * i;
            hueRotate.push(rot);
        };
        setHueRotate(hueRotate);

        addLotteryContractListner();

    }, []);

    useEffect (() => {

        const handleDateChange = async (searchLotteryId) => {
            if (searchLotteryId === undefined){
                return
            }
            else{  
                const lottery = await loadContract("dev", "Lottery");
                const lotteryInfo = await lottery.getLotteryInfo(searchLotteryId);
                const unixTime = lotteryInfo[5];
                const unixTimeDateObj = new Date(unixTime.toNumber() * 1000);
                const unixTimeString = unixTimeDateObj.toUTCString();
                setDrawTime(unixTimeString);
                const winningNumbers = lotteryInfo[1];
                setWinningNumbers(winningNumbers.map((e)=>e.toNumber()))
            }

        };

        handleDateChange(searchLotteryId);
        

    }, [searchLotteryId]);

    const handleClaimPrize = async (lotteryId) => {
        const lottery = await loadContract("dev", "Lottery");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const lottery_rw = lottery.connect(signer);
        const tx = await lottery_rw.claimPrize(lotteryId);
        console.log(tx);
    };

    const handleClick = () => {
        if (activeButton === "All History"){
            setActiveButton("Your History");
        }
        else{
            setActiveButton("All History");
        }
    };

    const handleBack = async () => {
        setSearchLotteryId(searchLotteryId - 1);
    };

    const handleForward = async () => {
        setSearchLotteryId(searchLotteryId + 1);
    };

    const handleFastForward = async () => {
        setSearchLotteryId(currentLotteryId - 1);
    };

    const handleChange = async (e) => {
        if (currentLotteryId - 1  < e.target.value){
            setSearchLotteryId(currentLotteryId-1);
        }
        else{
            setSearchLotteryId(Number(e.target.value))
        }
    };

    async function addLotteryContractListner(){
        const lottery = await loadContract("dev", "Lottery");
        lottery.on("LotteryClose", async (lotteryId, winningNumbers, event) => {
            console.log(event);
            const lotteryobj = {
                lotteryId: lotteryId.toNumber(),
                winningNumbers: winningNumbers.map(e =>{
                    return e.toNumber()
                }),
            };
        })
        lottery.on("BuyTicket", async (buyer, value ,event) => {
            const numTickets = await lottery.getNumberOfTickets();
            setNumTickets(numTickets.toNumber());

        })
    }

    return(
        <div className="lottery-hub-content-container">
            <div className="lottery-hub-header-container">
                <h2 className="lottery-hub-header">
                    Finished Rounds:
                </h2>
            </div>
            <div className="button-container">
                    <button
                        className={activeButton === "All History" ? null : "button-off"} 
                        onClick={handleClick}
                    >
                            All History
                    </button>
                    <button
                        className={activeButton === "Your History" ? null : "button-off"}  
                        onClick={handleClick}
                    >
                            Your History
                    </button>
            </div>
            <div className="hub-container">
                <div className="hub-navigation-container">
                    <div className="hub-navigation-input-button-container">
                        <div className="hub-navigation-input-container">
                            <h2 className="hub-navigation-input-round">
                                Round :
                            </h2>
                            <input 
                                className="hub-navigation-input"
                                pattern="^[0-9]+$"
                                value={searchLotteryId}
                                name="lotteryId"
                                id="lotteryId"
                                onChange={handleChange}
                            >
                            </input>
                        </div>
                        <div style={{display: "flex", alignItems: "center",}}>
                            <div className="hub-navigation-button-icon">
                                <button onClick={handleBack}>
                                    <ArrowBackIcon></ArrowBackIcon>
                                </button>

                            </div>
                            <div className="hub-navigation-button-icon">
                                <button onClick={handleForward}>
                                    <ArrowForwardIcon></ArrowForwardIcon>
                                </button>
                            </div>
                            <div className="hub-navigation-button-icon">
                                <button onClick={handleFastForward}>
                                    <FastForwardIcon></FastForwardIcon>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style={{marginTop: 8}}>
                        <div className="hub-navigation-draw-time">
                            Drawn: {drawTime}
                        </div>
                    </div>
                </div>
                {
                    activeButton === "All History" ? 
                    
                        <div className="hub-winning-numbers-container">
                            <div style={{display: "flex", flexDirection: "column"}}>
                                <div style={{textAlign: "center", marginBottom: 10}}>
                                <h2 className="hub-winning-numbers-text">
                                        Winning Numbers :
                                    </h2> 
                                </div>
                                <div style={{display: "flex", justifyContent:"space-evenly"}}>
                                    {
                                        winningNumbers.map((e, key) => 
                                            <div className="circle">
                                                <img 
                                                    src={ball}
                                                    width="80px"
                                                    height="80px" 
                                                    style={{
                                                        position: "absolute",
                                                        zIndex: 2,
                                                        filter: `hue-rotate(${hueRotate[key]}deg)`,
                                                    }}
                                                    className="lottery-img"
                                                />
                                                <h2 
                                                    className="hub-winnning-numbers-inline-text"
                                                    style={{
                                                        transform: `rotate(${rotation[key]}deg)`,
                                                    }}>
                                                        {e}
                                                </h2>
                                            </div>)
                                    }

                                </div>

                        </div>
                    </div>
                    :
                    <div className="hub-winning-numbers-container">
                        <div style={{display: "flex", flexDirection: "column"}}>

                        </div>
                    </div>
                }




            
            </div>
        </div>
    );

}