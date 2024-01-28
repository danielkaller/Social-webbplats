import React, { useEffect, useState } from 'react';
import './App.css';

const Page = ({ page, realTimeMessages, token }) => {

    const [draftMessage, setDraftMessage] = useState([]);
    const [messages, setMessages] = useState([]);
    const [warningMsg, setWarningMsg] = useState();

    let pageUrl = "http://localhost:3000/api/messages";
    let nameOfPage = "Home";

    if (page) {
        pageUrl = `http://localhost:3000/api/messages/${page}`;
        nameOfPage = page;
    }

    // Function to fetch messages
    const fetchMessages = async () => {
        try {
            fetch(pageUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Bad response')
                    } else {

                        response.text().then(function (result) {
                            let data = JSON.parse(result);
                            setMessages(data.messages)

                        })
                    }
                })
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    useEffect(() => {
        console.log("Fetching Messages")
        if (token) {
            fetchMessages();
        }
    }, [token, pageUrl]);

    // Function to post a message
    const postMessage = () => {
        const date = new Date();
        const formatted = date.toISOString().split("T").join(" ").split("Z").join(" ")

        fetch(pageUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: draftMessage, time: formatted })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    setDraftMessage("");
                    setWarningMsg();
                    if (realTimeMessages === undefined) {
                        setMessages([data.message, ...messages])
                    }
                }
                if (data.status === 'failure') {
                    setWarningMsg('invalid message')
                }
            })
            .catch(error => {
                setWarningMsg(error.status);
            })
    }

    // Function to change read status of a message
    const markMessageRead = (message) => {
        const newReadStatus = !message.read; // Toggle the read status

        fetch('http://localhost:3000/api/messages/id/' + message._id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newReadStatus })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Bad response');
                }
                const updatedMessages = messages.map((msg) => {
                    if (msg._id === message._id) {
                        return { ...msg, read: newReadStatus }; // Update the read status
                    }
                    return msg;
                });
                setMessages(updatedMessages);
            })
            .catch(err => {
                console.error('Problem with FETCH: ', err);
            });
    }

    let messagesToRender = messages
    if (realTimeMessages) {
        messagesToRender = [...realTimeMessages, ...messagesToRender];
    }
    return (
        <>
            <h1>Page {nameOfPage}</h1>
            <div id="container" class="bg-light container mb-2 mt-2">
                <div id="input" class="border border-5 bg-light border-secondary p-2 mb-2 row g-0" style={{ height: '150px' }}>
                    <div id="text" class="col-sm-6 col-md-8">
                        <textarea onChange={e => setDraftMessage(e.target.value)} value={draftMessage} id="textBox" class="form-control h-100"></textarea>
                    </div>
                    <div title="post your message" id="buttonDiv" class="col">
                        <button onClick={postMessage} id="button" class="btn btn-secondary btn-lg h-100 w-100">Post</button>
                    </div>
                </div>
                {warningMsg && (
                    <p>{warningMsg}</p>
                )}
                {messagesToRender.map((message) => (

                    <div
                        key={message._id}
                        className={`border border-5 bg-light border-secondary p-2 mb-2 
                  ${message.read ? 'read-message' : 'unread-message'}`}>

                        <p class="fs-6"> {message.sender} </p>
                        <p class="fs-3">{message.message}</p>
                        <p class="fs-6">{message.time}</p>
                        <input type='checkbox' onChange={e => markMessageRead(message)} checked={message.read}></input>
                    </div>

                ))}
                <div id="parent"></div>
            </div>
        </>
    );
}

export default Page;