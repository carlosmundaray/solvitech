import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../utils/axios';

interface Video {
  _id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  createdAt: string;
  user: {
    username: string;
    avatar: string;
  };
}

const StyledRouterLink = styled(RouterLink)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
  '@media (min-width: 600px)': {
    width: 'calc(50% - 16px)',
  },
  '@media (min-width: 960px)': {
    width: 'calc(33.333% - 16px)',
  },
  '@media (min-width: 1280px)': {
    width: 'calc(25% - 16px)',
  },
});

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axiosInstance.get<Video[]>('/api/videos');
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 4,
        justifyContent: 'flex-start'
      }}>
        {videos.map((video) => (
          <StyledRouterLink to={`/video/${video._id}`} key={video._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                image={video.thumbnailUrl}
                alt={video.title}
                sx={{ height: 180 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Avatar
                    src={video.user.avatar}
                    alt={video.user.username}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" component="div" noWrap>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </StyledRouterLink>
        ))}
      </Box>
    </Container>
  );
};

export default Home; 