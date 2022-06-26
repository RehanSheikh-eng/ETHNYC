import React from "react"
import './App.css'
import LotteryAppBar from "./components/LotteryAppBar"
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
                            <h2> Get Your Tickets Now!</h2>
                        </div>
                        <div>
                        
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