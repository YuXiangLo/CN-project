import React, { useState, useEffect } from 'react';
import { Container, Card, CardMedia, Typography, CardContent } from '@mui/material';
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

const StyledCardMedia = styled(CardMedia)({
    overflow: 'hidden',
    height: '500px'
});

function VideoPlayer() {

	const navigate = useNavigate();
	useEffect(() => {
		const userData = Cookies.get('userToken');
		if (!userData) {
			navigate('/');
		}
	}, [navigate]);

    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        fetch('http://localhost:4000/video/music.mp4')
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                setVideoUrl(url);
            })
            .catch(error => console.error('Error fetching video:', error));
    }, []);

    return (
        <Container maxWidth="md" style={{ marginTop: '20px' }}>
            <StyledCard>
                <CardContent>
                    <StyledTypography gutterBottom variant="h5" component="div">
                        Video Stream
                    </StyledTypography>
                    <StyledCardMedia
                        component="video"
                        controls
                        image={videoUrl}
                        title="Video Stream"
                    />
                </CardContent>
            </StyledCard>
        </Container>
    );
}

export default VideoPlayer;

