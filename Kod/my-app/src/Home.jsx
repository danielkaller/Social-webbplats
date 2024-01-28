import React, { useEffect, useState } from 'react';
import Page from './Page';
import './App.css';
import { io } from 'socket.io-client';

const Home = ({ token }) => {
    const [socket, setSocket] = useState(false);
    const [realTimeMessages, setRealTimeMessages] = useState([])

    useEffect(() => {
        if (!token) return;
        console.log("SOCKET", token)
        const socket = io('http://localhost:4000', {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'Authorization': `Bearer ${token}`
                    },
                },
            },
        });
        socket.on('connect', () => {
            console.log("connected")
            setSocket(socket)
        })
    }, [token])


    useEffect(() => {
        if (!socket) return;
        socket.on("messages", (newMessage) => {
            console.log("IO", newMessage)
            console.log("Previous", realTimeMessages)
            setRealTimeMessages(msgs => [newMessage, ...msgs,]);
        })
        return () => {
            socket.disconnect();
        }
    }, [socket])

    return (
        <>
            <Page realTimeMessages={realTimeMessages} token={token}></Page>
        </>
    );
}

export default Home;