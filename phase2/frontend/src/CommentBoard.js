import React, { useState, useEffect, useContext } from 'react';
import SearchContext from './SearchContext';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

function CommentBoard({ user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { searchTerm } = useContext(SearchContext)

  useEffect(() => {
    fetch('http://localhost:4000/comments')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Assuming the server returns JSON
      })
      .then(data => {
		const formattedComments = data.map(comment => `${comment['User']}: ${comment['text']}`);
		setComments(formattedComments);
      })
      .catch(error => {
        console.error('Error fetching comments:', error);
      });
  }, []);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const submitComment = () => {
    if (newComment.trim() !== '') {
      // Prepare the URL and the JSON data for the POST request
      const url = 'http://localhost:4000/comments'; // Update with your actual API endpoint
      const jsonData = { User: user, text: newComment };
  
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
      })
      .then(response => response.text())
      .then(data => {
        if (data === 'Success') { // Assuming the backend responds with a JSON object that includes a 'success' field
          setComments([...comments, `${user}: ${newComment}`]);
          setNewComment('');
        } else {
          // Handle the case where the backend indicates the comment wasn't saved
          console.error('Failed to post comment:', data.message);
        }
      })
      .catch((error) => {
        // Handle any network errors
        console.error('Error:', error);
      });
    }
  };
  const highlightText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} style={{ color: 'black', textDecoration: 'underline', backgroundColor: 'yellow' }}>{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <>
      <style>
        {`
          .comment-text {
            font-size: 1rem;
            background: linear-gradient(to left, violet, indigo, blue, green, red);
            -webkit-background-clip: text;
            color: transparent;
            display: inline;
          }

          .comment {
            border-bottom: 2px dotted black;
            padding-bottom: 10px;
            margin-bottom: 10px;
            position: relative;
          }

          .comment::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to left, violet, indigo, blue, green, orange, red);
            border-radius: 2px;
          }
        `}
      </style>
	  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card style={{ margin: '20px', padding: '20px' , width: '30vw' }}>
          <CardContent>
            <Typography variant="h5" component="h2" style={{ marginBottom: '20px', fontFamily: "'Roboto', sans-serif" }}>
              Comments
            </Typography>
            {comments.map((comment, index) => (
              <Typography key={index} component="p" className="comment" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <span className="comment-text">{searchTerm ? highlightText(comment, searchTerm) : comment}</span>
              </Typography>
            ))}
            <TextField
              label="Write a comment..."
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={handleCommentChange}
              style={{ marginBottom: '20px', fontFamily: "'Roboto', sans-serif" }}
            />
            <Button variant="contained" color="primary" onClick={submitComment} style={{ fontFamily: "'Roboto', sans-serif" }}>
              Post Comment
            </Button>
          </CardContent>
        </Card>
	  </div>
    </>
  );
}

export default CommentBoard;

