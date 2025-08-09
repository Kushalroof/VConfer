import IconButton from "@mui/material/IconButton";
import React, { useContext, useState } from "react";
import HistoryIcon from '@mui/icons-material/History';
import { AuthContext } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import withAuth from '../utils/withAuth';

function HomeComponent(){
    
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundImage: "url('/Background.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                    maxWidth: "400px",
                    width: "100%",
                    textAlign: "center"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem"
                    }}
                >
                    <h2 style={{ margin: 0 , color:"#800000", fontSize:"32px"}}>VConfer</h2>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => navigate("/history")}>
                            <HistoryIcon />
                        </IconButton>
                        <p
                            onClick={() => navigate("/history")}
                            style={{
                                cursor: "pointer",
                                margin: "0 1rem 0 0"
                            }}
                        >
                            History
                        </p>
                        
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Enter meeting code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "0.8rem",
                        marginBottom: "1rem",
                        border: "none",
                        borderBottom: "2px solid #800000",
                        outline: "none",
                        background: "transparent",
                        fontSize: "1rem"
                    }}
                />

                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/auth");
                    }}
                >
                Logout
                </Button>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <Button
                    variant="contained"
                    onClick={handleJoinVideoCall}
                    style={{
                        backgroundColor: "#800000",
                        color: "white",
                        padding: "0.6rem 1.5rem",
                        fontWeight: "bold",
                        borderRadius: "6px"
                    }}
                >
                    Join
                </Button>  
                
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);
