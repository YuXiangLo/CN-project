import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { styled } from '@mui/system';

const StyledCard = styled(Card)({
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
	marginTop: '50px'
});

const StyledTypography = styled(Typography)({
    fontFamily: '"Arial", sans-serif',
    fontWeight: 'bold'
});

const StyledAudio = styled('audio')({
    width: '100%', // Ensure the audio player spans the full width of the card
    marginTop: '20px'
});

function MediaPlayer() {
    const navigate = useNavigate();
    useEffect(() => {
        const userData = Cookies.get('userToken');
        if (!userData) {
            navigate('/');
        }
    }, [navigate]);

    const [audioUrl, setAudioUrl] = useState('');

    useEffect(() => {
        fetch('http://localhost:4000/video/music.mp4')
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                setAudioUrl(url);
            })
            .catch(error => console.error('Error fetching audio:', error));
    }, []);

    return (
        <Container maxWidth="md" style={{ marginTop: '20px' }}>
            <StyledCard>
                <CardContent>
                    <StyledTypography gutterBottom variant="h5" component="div">
                        Audio Stream
                    </StyledTypography>
                    <StyledAudio
                        controls
                        src={audioUrl}
                    >
                        Your browser does not support the audio element.
                    </StyledAudio>
                </CardContent>
            </StyledCard>
        </Container>
    );
}

export default MediaPlayer;

