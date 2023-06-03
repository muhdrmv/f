import React, {useEffect, useState} from 'react'
import {
    Menu,
    MenuItem,
    Typography,
    Badge,
    IconButton
} from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/NotificationsActive';
import {useHistory} from "react-router-dom";
import {gql, useMutation} from '@apollo/client';


const ACTION_VIEW_NOTIFICATION = gql`
    mutation ( $user_id: uuid! ){
        insert_view_notifications(objects: {user_id: $user_id}) {
            returning {
                user_id
                id
                viewed_at
            }
        }
    }
`;

const NotificationMenu = ({ notifications , countNotifications, user_id, setNotificationsCount }) => {

    const [insertNotificationView,] = useMutation(ACTION_VIEW_NOTIFICATION);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClickNotifications = async (event) => {

        setAnchorEl(event.currentTarget);

        if( countNotifications > 0 ){

            let mutationResult;

            try {
                mutationResult = await insertNotificationView({
                    variables: {
                        user_id
                    }
                });
            } catch (e) {
                console.log(e)
                alert('Notification view failed');
            }

            let last_view = mutationResult?.data?.insert_view_notifications?.returning[0]?.viewed_at;

            if(last_view){
                setNotificationsCount(0);
            }
        }
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const history = useHistory();

    const handleClickAllNotifications = () => {
        history.push('/dashboard/notifications/');
        setAnchorEl(null)
    }

    return (
        <>
            <IconButton color="inherit" onClick={handleClickNotifications} aria-controls="simple-menu" aria-haspopup="true">
                <Badge badgeContent={countNotifications} color="secondary" >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                style={{width: '350px', marginTop: '30px'}}
            >

                {
                   notifications && notifications.map( (n) => (
                        <MenuItem>
                            <Typography variant="inherit">{n?.subject}: {n.message}</Typography>
                        </MenuItem>
                    ))
                }

                <MenuItem>
                    <Typography onClick={handleClickAllNotifications} style={{color: 'gray', fontSize: 'small'}}>All Notifications</Typography>
                </MenuItem>
                
            </Menu>
        </>
    )
}

export default NotificationMenu;

