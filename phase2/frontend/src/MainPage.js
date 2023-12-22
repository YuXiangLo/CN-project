import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CommentBoard from './CommentBoard';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

function MainPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);


  useEffect(() => {
    const userData = Cookies.get('userToken');
    if (userData) {
      setData(userData);
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!data) {
    return <div>Loading...</div>;
  }


  return (
    <Box>
      <Container>
        {/* Additional content such as a Typography header can be placed here if needed */}
        <CommentBoard user={data} />
      </Container>
    </Box>
  );}

export default MainPage;

