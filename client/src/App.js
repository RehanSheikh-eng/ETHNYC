import React from "react"
import './App.css'
import LotteryAppBar from "./components/LotteryAppBar"
import StakingButton from "./components/StakingButton"
export default function App() {

    return(
        <div>
            <nav>
                <LotteryAppBar></LotteryAppBar>
            </nav>
            <div>
                <div>
                    <div className="main_page">
                        <div className="call_to_action_text">
                            <h2> Save the World and Earn rewards!</h2>
                        </div>
                        <div>
                        <StakingButton></StakingButton>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="lottery-hub-main-page">
                    
                </div>
            </div>
        </div>
    )

}