import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Page from './Page';

const MyPage = ({ token }) => {
    const [username, setUsername] = useState();
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    const fetchUserData = () => {
        fetch('http://localhost:3000/api/friends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setFriends(data.friends);
                setPendingRequests(data.pendingRequests);
            })
            .catch(error => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetch('http://localhost:3000/api/username', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const username = data.username;
                setUsername(username);
            })
            .catch(error => {
                console.error('Error:', error);
            });

        fetchUserData();
    }, [token]);

    const addFriend = (username) => {
        // Send a friend request
        fetch(`http://localhost:3000/api/friend-add?username=${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.friends) {

                    fetchUserData();
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8">
                    {username && <Page page={username} token={token} />}
                </div>
                <div className="col-md-4">
                    <h3>My Friends</h3>
                    <ul className="list-group">
                        {friends.map(friend => (
                            <li
                                key={friend}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <Link to={`/user/${friend}`}>{friend}</Link>
                                {/* You can add a link to the friend's page */}
                            </li>
                        ))}
                    </ul>
                    <h3 className="mt-4">Pending Friend Requests</h3>
                    <ul className="list-group">
                        {pendingRequests.map(request => (
                            <li
                                key={request}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                {request}
                                <button
                                    onClick={() => addFriend(request)}
                                    className="btn btn-primary"
                                >
                                    Accept
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default MyPage;