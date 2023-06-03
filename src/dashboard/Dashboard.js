import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  AppBar,
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Drawer,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from '@material-ui/core';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import PersonIcon from '@material-ui/icons/Person';

import MainDashboard from './pages/main-dashboard/MainDashboard';
import {Route, Switch, useHistory,useLocation } from "react-router-dom";
import SideNav from './SideNav';

import Users from './pages/users/Users';
import UserEdit from './pages/users-edit/UserEdit';
import UserGroups from './pages/user-groups/UserGroups';
import UserGroupEdit from "./pages/user-groups-edit/UserGroupEdit";

import Connections from './pages/connections/Connections';
import ConnectionEdit from './pages/connections-edit/ConnectionEdit';
import ConnectionGroups from './pages/connection-groups/ConnectionGroups';
import ConnectionGroupEdit from "./pages/connection-groups-edit/ConnectionGroupEdit";

import AccessRules from "./pages/access-rules/AccessRules";
import AccessRuleEdit from "./pages/access-rules-edit/AccessRuleEdit";
import Sessions from "./pages/sessions/Sessions";

import ChangePassword from "./pages/change-password/ChangePassword";
import Settings from './pages/settings/Settings';
import LiveSessions from "./pages/sessions-live/LiveSessions";
import gql from 'graphql-tag';
import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import LockedUsers from "./pages/users-locked/LockedUsers";
import Logs from "./pages/logs/Logs";
import UserView from "./pages/users-edit/UserView";
import UserAccessRules from "./pages/users-edit/UserAccessRules";
import ConnectionAccessRules from "./pages/connections-edit/ConnectionAccessRules";
import SessionsSearch from "./pages/sessions-search/SessionsSearch";
import InactivityTimoutBeat from "./shared-components/InactivityTimoutBeat";
import SessionView from "./pages/sessions/SessionView";
import DashboardAlert from "./DashboardAlert";
import SessionsPlayer from "./pages/sessions-player/SessionsPlayer";

import NetworkTools from "./pages/network-tools/NetworkTools";
import Ping from './pages/network-tools/Ping';
import TraceRoute from './pages/network-tools/TraceRoute';
import Netstat from './pages/network-tools/Netstat';

import NotificationsAdmin from "./pages/notification/NotificationsAdmin";	
import NotificationsUsers from "./pages/notification/NotificationsUsers";	
import AddNotification from "./pages/notification/AddNotification";	
import ViewNotificationUsers from "./pages/notification/ViewNotificationUsers";
import ViewNotificationAdmin from "./pages/notification/ViewNotificationAdmin";
import NotificationMenu from './pages/notification/NotificationMenu';	

import TicketChats from './pages/tickets/TicketChats';
import Tickets from './pages/tickets/Tickets';

import SessionTransparentView from './pages/sessions/SessionTransparentView';

import UBA from './pages/user-behavior-analytics';

const ACTION_AUTH_SIGN_OUT = gql`
mutation {
  action_auth_sign_out {
    success
  }
}
`;

const QUERY_SYSTEM_LICENSE = gql`
query {
  action_mgmt_license_info {
    result
  }
}
`;

const QUERY_LAST_TIME_VIEWED = gql`	
query Query($user_id: uuid!) {	
  view_notifications(	
    where: {	
      user_id: {_eq: $user_id}	
    }, 	
    order_by: {viewed_at: desc},	
    limit: 1	
  ){	
    viewed_at	
    user_id	
    id	
  }	
}	
`;	

const QUERY_USER_NOTIFICATIONS = gql`	
  query Query( $viewed_at: timestamptz!, $user_id: uuid! ) {	
    notifications(	
      where: {	
        created_at: {_gt: $viewed_at},	
        _or: [
            {creator: {_eq: $user_id}}, 
            {notification_users: {user_id: {_eq: $user_id}}}
        ]
      }, 	
      order_by: {created_at: desc},	
    ){	
      created_at	
      creator	
      id	
      subject	
      message	
      priority	
    }	
  }	
`;	

const QUERY_ADMIN_NOTIFICATIONS = gql`	
  query Query( $viewed_at: timestamptz!) {	
    notifications(	
      where: {	
        created_at: {_gt: $viewed_at},	
      }, 	
      order_by: {created_at: desc},	
    ){	
      created_at	
      creator	
      id	
      subject	
      message	
      priority	
    }	
  }	
`;

const QUERY_ROLE_OF_TICKET_MANAGEMENT = gql`
query MyQuery {
  settings(where: {name: {_eq: "roleOfTicketsManagement"}}) {
    value
  }
}
`;

function Copyright() {
  return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="https://rajaco.com/" target={'_blank'}>
          Raja IT
        </Link>{' '}
        {new Date().getFullYear()}
        <i> - v1.32.3 </i>
      </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
    textAlign: 'left',
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}));

export default function Dashboard({loggedInUser, setLoggedInUser, intendedUrl, refetchAuthStatus}) {
  
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();	
  const openWindows = useRef([]);

  const [open, setOpen] = React.useState(true);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [anchorElProfileButton, setAnchorElProfileButton] = React.useState(null);
  const lastWindowActivityAt = useRef(new Date());
  const [ queryVars, setQueryVars] = React.useState({user_id: loggedInUser.id});	
  const [ notificationsCount, setNotificationsCount ] = React.useState(0);
  const [ finalNotifData, setFinalNotifData ] = React.useState([]);
  const [ roleOfTicketsManagement, setRoleOfTicketsManagement ] = React.useState(['administrator']);

  const [doSignOut,] = useMutation(ACTION_AUTH_SIGN_OUT);
  const [ QueryRoleOfTicketsManagement, {data: QueryRoleOfTicketsManagementResult} ] = useLazyQuery(QUERY_ROLE_OF_TICKET_MANAGEMENT);
  const [ queryLicenseInfo, {data: licenseInfoData}] = useLazyQuery(QUERY_SYSTEM_LICENSE);
  const [ lastTimeViewQuery, {data: lastTimeViewResult } ] = useLazyQuery( QUERY_LAST_TIME_VIEWED, {variables: {user_id: loggedInUser?.id}}); 
  const [userNotifications, {data: userNotificationsResult}] = useLazyQuery(QUERY_USER_NOTIFICATIONS, {	variables: queryVars });	
  const [adminNotifications, {data: adminNotificationsResult}] = useLazyQuery(QUERY_ADMIN_NOTIFICATIONS, { variables: queryVars });

  useEffect( () => {
    if(QueryRoleOfTicketsManagementResult)
      setRoleOfTicketsManagement( v => [...v, QueryRoleOfTicketsManagementResult?.settings?.[0]?.value] );
  },[QueryRoleOfTicketsManagementResult]);

  useEffect(() => {
    lastTimeViewQuery()
  }, [location]);	

  useEffect(() => {	
    if(lastTimeViewResult){	

      let viewed_at = null;

      if(lastTimeViewResult && lastTimeViewResult?.view_notifications?.length > 0) viewed_at = lastTimeViewResult?.view_notifications[0]?.viewed_at;	
      else viewed_at = "1970-01-01T06:37:57.079147+00:00";

      if(loggedInUser?.role == "administrator"){
        setQueryVars({viewed_at})	
        adminNotifications()
      }else{
        setQueryVars({user_id: loggedInUser.id, viewed_at: viewed_at})	
        userNotifications();
      }
    }	
  }, [lastTimeViewResult]);
  
  useEffect( ()=>{	
    if(userNotificationsResult?.notifications){	
      setNotificationsCount(userNotificationsResult?.notifications?.length);	
      setFinalNotifData(userNotificationsResult?.notifications)
    }else if(adminNotificationsResult?.notifications){
      setNotificationsCount(adminNotificationsResult?.notifications?.length);
      setFinalNotifData(adminNotificationsResult?.notifications)
    }
  },[userNotificationsResult, adminNotificationsResult]);

  useEffect(() => {
    QueryRoleOfTicketsManagement(); // To show The Manager of Tickets on side nav and create route
    window.onbeforeunload = function () {
      closeOpenWindows();
    };
    if (loggedInUser.role === 'administrator') {
      queryLicenseInfo();
    }
  }, [])

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async e => {
    setBackdropOpen(true);
    closeOpenWindows();
    const result = await doSignOut();
    setBackdropOpen(false);
    setLoggedInUser(false);
    intendedUrl.current = '/dashboard';
    if (result.data.action_auth_sign_out.success)
      history.replace('/sign-in');
    refetchAuthStatus();
  }

  const handleLogoutInactivity = async e => {
    closeOpenWindows();
    setLoggedInUser(false);
    intendedUrl.current = '/dashboard';
    history.replace('/sign-in');
    refetchAuthStatus();
  }

  const closeOpenWindows = () => {
    for (const openWindow of openWindows.current) {
      openWindow?.close();
    }
  }

  const handleClickProfileButton = (event) => {
    setAnchorElProfileButton(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorElProfileButton(null);
  };

  const handleClickMyProfile = () => {
    history.push('/dashboard/my-profile');
    setAnchorElProfileButton(null);
  };

  const handleClickChangePassword = () => {
    history.push('/dashboard/change-password');
    setAnchorElProfileButton(null);
  };

  if (loggedInUser === false)
    history.replace('/sign-in');

  return (
      <div className={classes.root}>
        <InactivityTimoutBeat lastWindowActivityAt={lastWindowActivityAt} doLogout={handleLogoutInactivity}/>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
              Privileged Access Management
            </Typography>
            {/* <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton> */}

            <NotificationMenu 	
              notifications={finalNotifData}	
              countNotifications={notificationsCount}	
              user_id={loggedInUser.id}	
              setNotificationsCount={setNotificationsCount}	
            />

            <Tooltip title="Profile">
              <IconButton color="inherit" onClick={handleClickProfileButton}>
                <PersonIcon />
              </IconButton>
            </Tooltip>
            <Menu
                id="simple-menu"
                anchorEl={anchorElProfileButton}
                keepMounted
                open={Boolean(anchorElProfileButton)}
                onClose={handleCloseProfileMenu}
            >
              <MenuItem onClick={handleClickMyProfile}>
                {loggedInUser.username} (Profile Settings)
              </MenuItem>
            </Menu>
            <Tooltip title="Sign Out">
              <IconButton color="inherit" onClick={handleLogout}>
                <PowerSettingsNewIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
            }}
            open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>

          <SideNav loggedInUser={loggedInUser} />

        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>

              <DashboardAlert licenseInfo={licenseInfoData} />

              <Switch>

                <Route exact path="/dashboard">
                  { (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                      :
                      <MainDashboard loggedInUser={loggedInUser} openWindows={openWindows} lastWindowActivityAt={lastWindowActivityAt} />
                  }
                </Route>

                <Route exact path="/dashboard/user-groups">
                  {
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserGroups />
                  }
                </Route>
                <Route exact path="/dashboard/user-groups/add">
                  { 
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserGroupEdit insertMode />
                  }
                </Route>
                <Route exact path="/dashboard/user-groups/:id">
                  
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserGroupEdit />
                  }
                </Route>

                <Route exact path="/dashboard/users">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    
                    <Users loggedInUser={loggedInUser} />
                  }
                </Route>
                <Route exact path="/dashboard/users/add">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserEdit loggedInUser={loggedInUser}  insertMode />
                  }
                </Route>
                <Route exact path="/dashboard/users/:id">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserEdit loggedInUser={loggedInUser}  />
                  }
                </Route>
                <Route exact path="/dashboard/users/:id/view">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserView loggedInUser={loggedInUser}  />
                  }
                </Route>
                <Route exact path="/dashboard/users/:id/access-rules">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <UserAccessRules loggedInUser={loggedInUser}  />
                  }
                </Route>

                <Route exact path="/dashboard/users-locked">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <LockedUsers />
                  }
                </Route>

                <Route exact path="/dashboard/connection-groups">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <ConnectionGroups />
                  }
                </Route>
                <Route exact path="/dashboard/connection-groups/add">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <ConnectionGroupEdit insertMode />
                  }
                </Route>
                <Route exact path="/dashboard/connection-groups/:id">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <ConnectionGroupEdit />
                  }
                </Route>

                <Route exact path="/dashboard/connections">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <Connections />
                  }
                </Route>
                <Route exact path="/dashboard/connections/add">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <ConnectionEdit insertMode licenseInfo={licenseInfoData} />
                  }
                </Route>
                <Route exact path="/dashboard/connections/:id">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <ConnectionEdit licenseInfo={licenseInfoData} />
                  }
                </Route>
                <Route exact path="/dashboard/connections/:id/access-rules">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <ConnectionAccessRules />
                  }
                </Route>

                <Route exact path="/dashboard/access-rules">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <AccessRules />
                  }
                </Route>
                <Route exact path="/dashboard/access-rules/add">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <AccessRuleEdit licenseInfo={licenseInfoData} insertMode />
                  }
                </Route>
                <Route exact path="/dashboard/access-rules/:id">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <AccessRuleEdit licenseInfo={licenseInfoData} />
                  }
                </Route>


                <Route exact path="/dashboard/tickets/:id/view">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    roleOfTicketsManagement.includes(loggedInUser.role) &&
                    <TicketChats loggedInUser={loggedInUser} />
                  }
                </Route>

                <Route exact path="/dashboard/tickets">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    roleOfTicketsManagement.includes(loggedInUser.role) &&
                    <Tickets loggedInUser={loggedInUser} />
                  }
                </Route>

                {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator'].includes(loggedInUser.role) &&	
                    <Route exact path="/dashboard/notifications">	
                        <NotificationsAdmin 
                          licenseInfo={licenseInfoData} 
                          loggedInUser={loggedInUser} 
                          countNotifications={notificationsCount}	
                          setNotificationsCount={setNotificationsCount}	
                        />	
                    </Route>	
                }	
                
                {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&	
                    <Route exact path="/dashboard/notifications">	
                      <NotificationsUsers 
                        loggedInUser={loggedInUser} 
                        countNotifications={notificationsCount}	
                        setNotificationsCount={setNotificationsCount}	
                      />	
                    </Route>
                }

                {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator'].includes(loggedInUser.role) &&
                  <Route exact path="/dashboard/notifications/:id/view">	
                    <ViewNotificationAdmin loggedInUser={loggedInUser}  />	
                  </Route>	
                }

                {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&	
                  <Route exact path="/dashboard/notifications/:id/view">	
                    <ViewNotificationUsers loggedInUser={loggedInUser}  />	
                  </Route>	
                }

                <Route exact path="/dashboard/notifications/add">	
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&	
                    <AddNotification licenseInfo={licenseInfoData} loggedInUser={loggedInUser} />	
                  }	
                </Route>	
                
                <Route exact path="/dashboard/network-tools">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <NetworkTools />
                  }
                </Route>
                <Route exact path="/dashboard/network-tools/ping">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <Ping />
                  }
                </Route>
                <Route exact path="/dashboard/network-tools/traceroute">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <TraceRoute />
                  }
                </Route>
                <Route exact path="/dashboard/network-tools/netstat">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <Netstat />
                  }
                </Route>

                <Route exact path="/dashboard/network-tools/network-scan">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <NetworkTools />
                  }
                </Route>

                <Route exact path="/dashboard/live-sessions">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'auditor', 'sessionMonitoring'].includes(loggedInUser.role) &&
                    <LiveSessions/>
                  }
                </Route>

                <Route exact path="/dashboard/sessions-history">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'auditor'].includes(loggedInUser.role) &&
                    <Sessions/>
                  }
                </Route>
                <Route exact path="/dashboard/sessions-search">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'auditor'].includes(loggedInUser.role) &&
                    <SessionsSearch/>
                  }
                </Route>
                <Route exact path="/dashboard/sessions-player">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'auditor'].includes(loggedInUser.role) &&
                    <SessionsPlayer />
                  }
                </Route>
                <Route exact path="/dashboard/sessions-history/:id/view">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'auditor'].includes(loggedInUser.role) &&
                    <SessionView licenseInfo={licenseInfoData} />
                  }
                </Route>

                <Route exact path="/dashboard/sessions-history/:id/view-transparent">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'auditor'].includes(loggedInUser.role) &&
                    <SessionTransparentView licenseInfo={licenseInfoData} />
                  }
                </Route>

                <Route exact path="/dashboard/logs">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator', 'auditor'].includes(loggedInUser.role) &&
                    <Logs />
                  }
                </Route>

                <Route path="/dashboard/user-behavior-analytics">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <UBA licenseInfo={licenseInfoData} />
                  }
                </Route>
                
                <Route path="/dashboard/settings">
                  {  
                    (loggedInUser.meta?.authType === 'internal' && loggedInUser.meta?.mustChangePassword) ?
                      <ChangePassword />
                    :
                    ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <Settings licenseInfo={licenseInfoData} loggedInUser={loggedInUser} />
                  }
                </Route>


                <Route exact path="/dashboard/my-profile">
                  <ChangePassword loggedInUser={loggedInUser} />
                </Route>

                <Route exact path="/dashboard/change-password">
                  <ChangePassword loggedInUser={loggedInUser} />
                </Route>

              </Switch>
            </Grid>
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </main>
        <Backdrop className={classes.backdrop} open={backdropOpen}>
          <CircularProgress color="inherit" />
        </Backdrop>

      </div>
  );
}