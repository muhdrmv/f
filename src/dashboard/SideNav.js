import React from 'react'
import Divider from '@material-ui/core/Divider';
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
import {Link, useLocation} from 'react-router-dom';
import {blue} from '@material-ui/core/colors'
import AssignmentIcon from "@material-ui/icons/Assignment";
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import VisibilityIcon from '@material-ui/icons/Visibility';
import NotificationsIcon from '@material-ui/icons/NotificationsActive';	
import MessageIcon from '@material-ui/icons/Message';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/client';
import { useEffect } from 'react';
import AssessmentIcon from '@material-ui/icons/Assessment';

const QUERY_ROLE_OF_TICKET_MANAGEMENT = gql`
query MyQuery {
  settings(where: {name: {_eq: "roleOfTicketsManagement"}}) {
    value
  }
}
`;

const SideNav = ({loggedInUser}) => {
    console.log(loggedInUser);

    const location = useLocation();
    const { data } = useQuery( QUERY_ROLE_OF_TICKET_MANAGEMENT, {variables: {}, notifyOnNetworkStatusChange: true});
    const [ roleOfTicketsManagement, setRoleOfTicketsManagement ] = React.useState(['administrator']);

    useEffect( () => {
        if(data)
            setRoleOfTicketsManagement( v => [...v, data?.settings?.[0]?.value] );
    },[data]);

    
    return (
        <>
            <Divider/>
            <div>
                <ListItem button component={Link} to="/dashboard"
                          style={{backgroundColor: (location.pathname === '/dashboard') ? blue[50] : ''}}>
                    <ListItemIcon>
                        <PlayArrowRoundedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Dashboard"/>
                </ListItem>

                { ['administrator', 'moderator', 'supervisor', 'auditor'].includes(loggedInUser.role) &&
                    <>
                    <ListItem button component={Link} to="/dashboard/users"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/users') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <PersonIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Users"/>
                    </ListItem>
                
                    <ListItem button component={Link} to="/dashboard/user-groups"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/user-groups') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <PeopleIcon/>
                        </ListItemIcon>
                        <ListItemText primary="User Groups"/>
                    </ListItem>

                    <ListItem button component={Link} to="/dashboard/connections"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/connections') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <DnsIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Connections"/>
                    </ListItem>

                    <ListItem button component={Link} to="/dashboard/connection-groups"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/connection-groups') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <StorageIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Connection Groups"/>
                    </ListItem>

                    <ListItem button component={Link} to="/dashboard/access-rules"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/access-rules') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <VpnKeyIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Access Rules"/>
                    </ListItem>

                    <ListItem button component={Link} to="/dashboard/notifications" 	
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/notifications') ? blue[50] : ''}}>	
                        <ListItemIcon>	
                            <NotificationsIcon />	
                        </ListItemIcon>	
                        <ListItemText primary="Notifications"/>	
                    </ListItem>

                    </>
                }

                { roleOfTicketsManagement.includes(loggedInUser.role) &&
                    <ListItem button component={Link} to="/dashboard/tickets" 	
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/tickets') ? blue[50] : ''}}>	
                        <ListItemIcon>	
                            <MessageIcon />	
                        </ListItemIcon>	
                        <ListItemText primary="Tickets"/>	
                    </ListItem>
                }   

            </div>
            <Divider/>
            <div>

                { ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <>
                    <ListItem button component={Link} to="/dashboard/network-tools"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/network-tools') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <DeviceHubIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Network Tools"/>
                    </ListItem>
                    </>
                }

                { ['sessionMonitoring'].includes(loggedInUser.role) &&
                    <>
                    <ListItem button component={Link} to="/dashboard/live-sessions"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/live-sessions') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <PlayCircleOutlineRoundedIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Live Sessions"/>
                    </ListItem>
                    </>
                }
                { ['administrator', 'auditor'].includes(loggedInUser.role) &&
                    <>
                    <ListItem button component={Link} to="/dashboard/live-sessions"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/live-sessions') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <PlayCircleOutlineRoundedIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Live Sessions"/>
                    </ListItem>
                    <ListItem button component={Link} to="/dashboard/sessions-history"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/sessions-history') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <HistoryIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Sessions History"/>
                    </ListItem>
                    </>
                }

                {['administrator', 'moderator', 'auditor'].includes(loggedInUser.role) &&
                    <ListItem button component={Link} to="/dashboard/logs"
                              style={{backgroundColor: location.pathname.startsWith('/dashboard/logs') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <AssignmentIcon/>
                        </ListItemIcon>
                        <ListItemText primary="System Logs"/>
                    </ListItem>
                }

                {['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <ListItem button component={Link} to="/dashboard/user-behavior-analytics"
                              style={{backgroundColor: location.pathname.startsWith('/dashboard/user-behavior-analytics') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary="UBA"/>
                    </ListItem>
                }

                { ['administrator', 'moderator'].includes(loggedInUser.role) &&
                    <>
                    <ListItem button component={Link} to="/dashboard/settings"
                            style={{backgroundColor: location.pathname.startsWith('/dashboard/settings') ? blue[50] : ''}}>
                        <ListItemIcon>
                            <SettingsRoundedIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Settings"/>
                    </ListItem>
                    </>
                }

            </div>
        </>
    )
}

export default SideNav
