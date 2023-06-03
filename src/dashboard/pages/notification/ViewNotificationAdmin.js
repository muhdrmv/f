import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Grid, Paper, Typography, Chip, Button} from '@material-ui/core';
import {useParams,useHistory, Link} from "react-router-dom";
import {gql, useLazyQuery, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import 'date-fns';
import {changeTimeZone} from "../../../utilities/Utils";
import NotificationsIcon from '@material-ui/icons/NotificationsActive';	


const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    },
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
        padding: "1px",
        paddingLeft: "10px",
        textAlign: "left",
        paddingBottom: "10px",
        minHeight: "50vh"
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
    typography: {
        textAlign: 'center'
    }
}));

const QUERY_USER = gql`
query ($id: uuid!) {
    notifications(
        where: 
            {id: {_eq: $id}}
    ) {
        creator
        message
        created_at
        priority
        subject
        meta
        notification_creator {
            username
        }
    }
}
`;

const QUERY_SENT_TO_USERS_BY_ADMIN = gql`
query ($notifId: uuid!) {
    notification_user(
        where:{ 
            notification_id: {_eq: $notifId},
        }
    ) {
      user {
        username
      }
    }
}
`;

const ViewNotificationAdmin = ({loggedInUser}) => {

    const history = useHistory();
    const classes = useStyles();
    const {id} = useParams();

    const [ notifyData, setNotifyData ] = React.useState({});
    const [ inProgress, setInProgress ] = useState(false);
    const [ sentToUsersResult, setSentToUsersResult ] = React.useState([]);

    const [ sentToUsersByAdminQuery, {data: sentToUsersByAdmin} ] = useLazyQuery(QUERY_SENT_TO_USERS_BY_ADMIN, { variables: {notifId: id}});
    const {loading, error, data, refetch} = useQuery(QUERY_USER, {variables: {id: id}, notifyOnNetworkStatusChange: true});

    
    useEffect( () => {
        if(data?.notifications?.[0]) {
            setNotifyData(data?.notifications?.[0]);
            sentToUsersByAdminQuery();
        }else{
            setInProgress(true);
        }
    }, [data]);

    useEffect( () => {
        if(sentToUsersByAdmin) setSentToUsersResult(sentToUsersByAdmin?.notification_user)
    },[sentToUsersByAdmin])

    return (
        <div className={classes.root} style={{width: '100%'}}>

            {<Paper 
                className={
                    classes.paper,
                    notifyData?.priority == 'low' ? classes.low_priority
                    :  notifyData?.priority == 'high' ? classes.high_priority
                    : notifyData?.priority == 'medium' ? classes.med_priority : {}
                }
            >

                <TopToolbar toolbarTitle={"Notification from " + notifyData?.notification_creator?.[0]?.username } 
                            backLinkUrl="/dashboard/notifications" toolbarIcon={<NotificationsIcon style={{margin: '-4px 8px'}}/>}
                            inProgress={inProgress}
                />

                <div className={classes.root} style={{padding: "20px"}}>

                    <Grid container spacing={3}
                        style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                        }
                    >

                        <Grid item xs={9}>
                            <Paper className={classes.paper}>
                            
                                <Grid container spacing={3}
                                    style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }
                                    }
                                >
                                    <Grid item xs={12}>
                                        <Typography className={classes.typography}>
                                            <h3>{notifyData?.subject}</h3>
                                            {changeTimeZone(notifyData?.created_at)}
                                        </Typography>

                                        <Typography className={classes.typography}>
                                            <p>{notifyData?.message}</p>
                                        </Typography>

                                    </Grid>

                                    {
                                        notifyData?.meta?.link &&
                                        <Button component={Link} color="inherit" variant="outlined" size="small" to={notifyData?.meta?.link}>
                                            Check This Notification
                                        </Button>
                                    }
                                </Grid>

                            </Paper>
                        </Grid>
                        {
                            sentToUsersResult.length > 0 &&
                            <Grid item xs={9}>
                                <Paper>
                                    <Grid container style={{padding:'10px'}}>
                                        <Grid item xs={12}>
                                            {
                                                sentToUsersResult.length > 0 &&
                                                <Typography className={classes.typography}>
                                                    <h4>This notification has been sent to the following users: </h4>
                                                </Typography>
                                            }

                                            {
                                                sentToUsersResult && sentToUsersResult.map( (v) => (
                                                    <Chip style={{margin: '2px'}}
                                                        label={v?.user?.username}
                                                        color="primary"
                                                    />
                                                ))
                                            }
                                            
                                        </Grid>

                                    </Grid>
                                </Paper>
                            </Grid>
                        }

                    </Grid>
                </div>
            </Paper>}

        </div>
    )
}

export default ViewNotificationAdmin;
