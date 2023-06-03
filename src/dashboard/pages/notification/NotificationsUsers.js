import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery,useLazyQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {changeTimeZone} from "../../../utilities/Utils";
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import CallMadeIcon from '@material-ui/icons/CallMade';
import NotificationsIcon from '@material-ui/icons/NotificationsActive';	


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
    med_priority: {
        backgroundColor: '#ffea0021'
   },
    high_priority: {
        backgroundColor: '#ff17171d'
    },
    low_priority: {
        backgroundColor: '#00ff1119'
    },
}));

const GET_USER_NOTIFICATIONS = gql`
query ($user_id: uuid!) {
    notifications(
        where: { 
            _or: [
                {notification_users: {user_id: {_eq: $user_id }}},
                {creator: {_eq: $user_id}}
            ]
        },   
        order_by: {created_at: desc}
    ) {
        created_at
        creator
        id
        message
        priority
        subject
        notification_creator {
            username
        }
    }
  }
`;

const GET_USERS_NOTIFICATIONS_FILTERED = gql`
query ($filter: String!, $user_id: uuid!) {
    notifications(
        order_by: {created_at: desc}, 
        where: {
            _or: [
                {message: {_ilike: $filter}}, 
                {subject: {_ilike: $filter}},
                {notification_creator: {username: {_ilike: $filter}}}
            ],
            _and: {
                _or :[
                    {notification_users: {user_id: {_eq: $user_id}}},
                    {creator: {_eq: $user_id}}
                ]
            }
        }
    ){
        created_at
        creator
        id
        message
        priority
        subject
        notification_creator {
            username
        }
    }
  }
`;

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

const headCells = [
    {id: 'display', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'sender', numeric: false, disablePadding: false, label: 'Sender'},
    {id: 'creator', numeric: false, disablePadding: false, label: 'Creator'},
    {id: 'subject', numeric: false, disablePadding: false, label: 'Subject'},
    {id: 'message', numeric: false, disablePadding: false, label: 'Message'},
    {id: 'priority', numeric: false, disablePadding: false, label: 'Priority'},
    {id: 'created_at', numeric: false, disablePadding: false, label: 'Created At'},
];

const NotificationsUsers = ({loggedInUser, countNotifications, setNotificationsCount}) => {

    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [insertNotificationView,] = useMutation(ACTION_VIEW_NOTIFICATION);
    const [queryVars, setQueryVars] = React.useState({user_id: loggedInUser?.id});
    const [query, setQuery] = useState(GET_USER_NOTIFICATIONS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [rows, setRows] = useState([]);

    useEffect( () => {
        const gotRows = data?.notifications ?? [];

        setRows(gotRows.map( v => ({
            id: v?.id,
            creator: v?.notification_creator[0]?.username ? v?.notification_creator?.[0]?.username : "System",
            sender_status: v?.creator==loggedInUser?.id ? "sender" : "receiver",
            subject: v?.subject,
            message: v?.message,
            priority: v?.priority,
            created_at: v?.created_at
        })));
    }, [data]);

    useEffect(() => {
        handleChangeFilterText()
    }, [showFilterPanel])

    useEffect( async () => {

        refetch();

        if( countNotifications > 0 ){
            let mutationResult;
            try {
                mutationResult = await insertNotificationView({
                    variables: {
                        user_id: loggedInUser.id
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
    }, [])

    const handleRefresh = () => {
        refetch();
    }

    const handleClickFilter = () => {
        setShowFilterPanel(f => !f);
    }

    const handleChangeFilterText = (e) => {
        if (showFilterPanel && e && e.target.value.trim() !== '') {
            enableFilterQuery('%' + e.target.value.trim() + '%');
        } else {
            disableFilterQuery();
        }
    }

    const enableFilterQuery = (filterText) => {
        setQuery(GET_USERS_NOTIFICATIONS_FILTERED);
        setQueryVars({filter: filterText, user_id: loggedInUser.id})
    }

    const disableFilterQuery = () => {
        setQuery(GET_USER_NOTIFICATIONS);
        setQueryVars({user_id: loggedInUser.id});
    }

    const history = useHistory();

    const handleDisplayClick = id => {
        history.push('/dashboard/notifications/' + id + '/view');
    }

    const [selectedItems, setSelectedItems] = useState([]);

    const handleClickDelete = (selected) => {
       alert("You are not able to delete notification")
    }

    const RowCells = ({row}) => {
        if(row?.priority == 'high'){
            return (
                <>
                    <TableCell className={classes.high_priority} align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.high_priority}>{row.sender_status=="sender" ? <CallMadeIcon /> : <CallReceivedIcon /> }</TableCell>
                    <TableCell className={classes.high_priority}>{row.creator}</TableCell>
                    <TableCell className={classes.high_priority}>{row.subject.substring(0,15)}</TableCell>
                    <TableCell className={classes.high_priority}>{row.message.substring(0,20)}</TableCell>
                    <TableCell className={classes.high_priority}>High</TableCell>
                    <TableCell className={classes.high_priority}>{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
        }else if(row?.priority == 'medium'){
            return (
                <>
                    <TableCell className={classes.med_priority} align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.med_priority}>{row.sender_status=="sender" ? <CallMadeIcon /> : <CallReceivedIcon /> }</TableCell>
                    <TableCell className={classes.med_priority}>{row.creator}</TableCell>
                    <TableCell className={classes.med_priority}>{row.subject.substring(0,15)}</TableCell>
                    <TableCell className={classes.med_priority}>{row.message.substring(0,20)}</TableCell>
                    <TableCell className={classes.med_priority}>Medium</TableCell>
                    <TableCell className={classes.med_priority}>{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
        }else{
            return (
                <>
                    <TableCell className={classes.low_priority} align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.low_priority}>{row.sender_status=="sender" ? <CallMadeIcon /> : <CallReceivedIcon /> }</TableCell>
                    <TableCell className={classes.low_priority}>{row.creator}</TableCell>
                    <TableCell className={classes.low_priority}>{row.subject.substring(0,15)}</TableCell>
                    <TableCell className={classes.low_priority}>{row.message.substring(0,20)}</TableCell>
                    <TableCell className={classes.low_priority}>Low</TableCell>
                    <TableCell className={classes.low_priority}>{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
        }
    }

    return (
        <div className={classes.root}>
            <EnhancedTable tableTitle="Notifications" rows={rows} showProgress={loading}
                            headCells={headCells} rowCells={RowCells}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            onClickDelete={handleClickDelete}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                            addLinkUrl="/dashboard/notifications/add"
                            toolbarIcon={<NotificationsIcon style={{margin: '-4px 8px'}}/>} />

            <AlertDialog isOpen={alertDialogOpen} itemsCount={selectedItems.length}/>
        </div>
    )
}

export default NotificationsUsers;
