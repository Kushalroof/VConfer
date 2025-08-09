import axios from "axios";
import { createContext, useState } from "react";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users"
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({});

  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === 201) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === 200) {
        localStorage.setItem("token", request.data.token);
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const getHistoryOfUser = async()=>{
    try{
      let request = await client.get("/getAllActivity",{
        params:{
          token: localStorage.getItem("token")
        }
      });
      return request.data;
    }catch(err){
        throw(err);
    }
  }

  const addToUserHistory = async(meetingCode) => {
    try{
      let request = await client.post("/addToActivity", {
        token:localStorage.getItem("token"),
        meeting_code: meetingCode
      });
      return request.data.status; 
    }catch(e){
      throw e;
    }
  }


  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handleLogin
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};
