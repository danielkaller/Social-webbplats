import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Page from './Page';
import './App.css';

const UserPage = ({ token }) => {
    const { username } = useParams();

    return (
        <Page page={username} token={token}></Page>
    );
}

export default UserPage;