import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PlayCircleOutlineRoundedIcon from '@material-ui/icons/PlayCircleOutlineRounded';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import DnsIcon from '@material-ui/icons/Dns';
import StorageIcon from '@material-ui/icons/Storage';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import HistoryIcon from '@material-ui/icons/History';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {Link} from 'react-router-dom';
import {blue} from '@material-ui/core/colors'

export const mainListItems = (
  <div>
    <ListItem button component={Link} to="/dashboard" style={{backgroundColor: blue[50]}}>
      <ListItemIcon>
        <PlayArrowRoundedIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>

    <ListItem button component={Link} to="/dashboard/users">
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="Users" />
    </ListItem>

    <ListItem button component={Link} to="/dashboard/user-groups">
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="User Groups" />
    </ListItem>

    <ListItem button component={Link} to="/dashboard/connections">
      <ListItemIcon>
        <DnsIcon />
      </ListItemIcon>
      <ListItemText primary="Connections" />
    </ListItem>

    <ListItem button component={Link} to="/dashboard/connection-groups">
      <ListItemIcon>
        <StorageIcon />
      </ListItemIcon>
      <ListItemText primary="Connection Groups" />
    </ListItem>

    <ListItem button component={Link} to="/dashboard/access-rules">
      <ListItemIcon>
        <VpnKeyIcon />
      </ListItemIcon>
      <ListItemText primary="Access Rules" />
    </ListItem>

  </div>
);

export const secondaryListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <PlayCircleOutlineRoundedIcon />
      </ListItemIcon>
      <ListItemText primary="Live Sessions" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Sessions History" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Logs" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <SettingsRoundedIcon />
      </ListItemIcon>
      <ListItemText primary="Settings" />
    </ListItem>  </div>
);
