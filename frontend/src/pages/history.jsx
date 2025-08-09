import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../contexts/authContext";
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import withAuth from '../utils/withAuth';

function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };
        fetchHistory();
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <div
            style={{
                maxWidth: "100vw",
                margin: "0 auto",
                padding: "1rem",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundImage:"url('/Background.jpeg')",
                backgroundSize: "cover", 
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    flexShrink: 0
                }}
            >
                <HomeIcon
                    style={{ marginRight: '0.5rem' , fontSize:"32px", color:"#710105"}}
                    onClick={() => routeTo("/home")}
                />
                <p style={{ margin: 0, fontWeight: "bold", fontSize:"32px", color:"#710105" }}>History</p>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingRight: "0.5rem",
                    maxWidth:"20rem"
                }}
            >
                {meetings.length > 0 ? (
                    meetings.map((e, i) => (
                        <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography sx={{ color: 'black', mb: 1.5 }}>
                                    Code: {e.meetingCode} <br />
                                    Date: {formatDate(e.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        No meeting history found.
                    </Typography>
                )}
            </div>
        </div>
    );
}

export default withAuth(History);
