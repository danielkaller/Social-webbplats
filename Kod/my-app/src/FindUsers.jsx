import React, { useEffect, useState } from "react";

const FindUsers = ({ token }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [usernames, setUsernames] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        fetchFriends();
    }, [token]);

    const fetchFriends = () => {
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
            })
            .catch(error => {
                console.error(error);
            });
    }

    const search = (searchQuery) => {
        const url = `http://localhost:3000/api/users/?username=${searchQuery}`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setUsernames(data);
            })
            .catch(error => {
                console.error(error);
            });
    }

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
                    // Fetch the updated friends list after adding a friend
                    fetchFriends();
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    return (
        <div className="d-flex justify-content-center">
            <div style={{ width: '50%' }}>
                <h1>Find other users!</h1>
                <p>Enter a username to find users:</p>
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search users by username"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => search(searchQuery)}
                    >
                        Search
                    </button>
                </div>
                <div className="mt-4">
                    <h2>Found Users:</h2>
                    {usernames.map((username, index) => (
                        <div
                            key={index}
                            className="d-flex justify-content-between align-items-center mb-2 p-2 border border-2"
                            style={{ height: '50px' }}
                        >
                            <span>{username}</span>
                            {!friends.includes(username)&& (
                                <button
                                    onClick={() => addFriend(username)}
                                    className="btn btn-primary"
                                >
                                    Add Friend
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FindUsers;