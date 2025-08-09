import React from "react";
import "../App.css"
import { Link, useNavigate } from "react-router-dom";



export default function Landing(){
    let router = useNavigate();
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>VConfer</h2>
                    <p>Your Meeting. Your Mode. Your VConfer</p>
                </div>
                <div className="navList">
                    <p onClick={()=>{
                        router("/gsgsfavgd");
                    }}>Guest</p>
                    <p onClick={()=>{
                        router("/signup");
                    }}>Register</p>
                    <p onClick={()=>{
                        router("/auth");
                    }}>Login</p>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="aboutInfo">
                    <h2 className="aboutHeading">Where Conversations Come to Life</h2>
                    <p>VConfer is a sleek and user-friendly video conferencing interface built for teams and professionals. Featuring responsive modes, participant controls, real-time chat, and a clean layout, VConfer is designed to make virtual meetings smoother and more engaging.</p>
                    <Link to="/auth" className="getStartedBtn">Get Started</Link>
                </div>
                <div>
                    <img src="/VideoCall.png" alt="VideoCall" />
                </div>
            </div>

        </div>
    );
}