import React, { useState, useContext } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, InputBase, IconButton, Box, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SearchContext from './SearchContext';



const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const SearchBar = ({ data, handleLogout, navigate }) => {
	
  const { setSearchTerm } = useContext(SearchContext);
  const handleSearch = (event) => {
	setSearchTerm(event.target.value);
  }

  const handleHome = () => {
  	navigate('/main');
  }
  
  const handleVideo = () => {
  	navigate('/video');
  }

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#333333' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
			onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
		  <Menu
		    id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
		  >
	  		<MenuItem onClick={handleHome}>
              <HomeIcon sx={{ marginRight: 1 }} /> Home
            </MenuItem>
            <MenuItem onClick={handleVideo}>
              <OndemandVideoIcon sx={{ marginRight: 1 }} /> Videos
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToAppIcon sx={{ marginRight: 1 }} /> Logout
            </MenuItem>
            {/* Add more menu items here if needed */}
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
            Welcome <b style={{color: '#FFD1DC'}}>⭐️ {data}</b>
          </Typography>
          <Search sx={{ marginRight: '2rem' }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
              onChange={handleSearch}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default SearchBar;
