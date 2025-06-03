import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Avatar,
  Button,
  Box,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  views: number;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    subscribers: number;
  };
  comments: {
    _id: string;
    text: string;
    user: {
      _id: string;
      username: string;
      avatar: string;
    };
    createdAt: string;
  }[];
}

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axiosInstance.get<Video>(`/api/videos/${id}`);
        setVideo(response.data);
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  const handleComment = async () => {
    try {
      const response = await axiosInstance.post<Comment[]>(
        `/api/videos/${id}/comments`,
        { text: comment }
      );
      setVideo((prev) => prev ? { ...prev, comments: response.data } : null);
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!video) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box
          component="video"
          src={video.videoUrl}
          controls
          sx={{ width: '100%', bgcolor: 'black' }}
        />
        <Typography variant="h5">
          {video.title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<ThumbUpIcon />}>
              {video.likes.length}
            </Button>
            <Button startIcon={<ThumbDownIcon />}>
              {video.dislikes.length}
            </Button>
            <Button startIcon={<ShareIcon />}>Share</Button>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            src={video.user.avatar}
            alt={video.user.username}
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography variant="subtitle1">{video.user.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              {video.user.subscribers} subscribers
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {video.description}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Typography variant="h6">
          {video.comments.length} Comments
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleComment}
            disabled={!comment.trim()}
          >
            Comment
          </Button>
        </Box>
        <List>
          {video.comments.map((comment) => (
            <ListItem key={comment._id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  src={comment.user.avatar}
                  alt={comment.user.username}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {comment.user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
                secondary={comment.text}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default VideoPage; 