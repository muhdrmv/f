import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {
    Grid,
    Paper,
    Snackbar,
    TextField,
    MenuItem
} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {useHistory, useParams} from "react-router-dom";
import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from '../../shared-components/BottomToolbar';
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
    },

}));


const INSERT_NOTIFICATION = gql`
mutation (
  $subject: String!, 
  $message: String!, 
  $creator: uuid!,
  $users: [notification_user_insert_input!]!  
  $priority: String!
) {
 insert_notifications (objects: {
    subject: $subject, 
    message: $message,
    notification_users: {data: $users},
    creator: $creator,
    priority: $priority
  }) {
    returning {
      id
    }
  }
}
`;


const QUERY_USERS_CONNECTIONS_USER_GROUPS_CONNECTION_GROUPS = gql`
query {
  users {
    id
    username
  }
  connections {
    id
    name
  }
  user_groups {
    id
    name
  }
  connection_groups {
    id
    name
  }
}
`;

const AddNotification = ({insertMode = false, licenseInfo, loggedInUser}) => {

    const classes = useStyles();
    const {id} = useParams();
    const history = useHistory();

    const [inProgress, setInProgress] = useState(false);
    const [items, setItems] = useState({
        users: [],
        userGroups: [],
    });
    const [formState, setFormState] = useState({
        subject: '',
        message: '',
        users: [],
        userGroups: [],
        priority: "low"
    });
    const [validationErrorState, setValidationErrorState] = useState({
        subject: false,
        message: false,
    });
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });

    const handleQueryCompletedGroups = data => {
        const users = data.users.map(i => ({id: i.id, title: i.username}));
        const userGroups = data.user_groups.map(i => ({id: i.id, title: i.name}));
        setItems({users, userGroups});
    };

    useQuery(QUERY_USERS_CONNECTIONS_USER_GROUPS_CONNECTION_GROUPS, {
        onCompleted: handleQueryCompletedGroups,
    });

    const [insertNotification,] = useMutation(INSERT_NOTIFICATION);

    const handleChangeSubject = (e) => {
        setFormState(s => ({...s, subject: e.target.value}));
        setValidationErrorState(s => ({...s, subject: false}));
    }

    const handleChangeMessage = (e) => {
        setFormState(s => ({...s, message: e.target.value}));
        setValidationErrorState(s => ({...s, message: false}));
    }

    const handleChangePriority = (e) => {
        console.log(e.target.value);
        setFormState(s => ({...s, priority: e.target.value}));
    }

    const handleChangeTagsUsers = (e, v) => {
        const users = v.map(i => i.id);
        setFormState(s => ({...s, users}));
    };
    const handleChangeTagsUserGroups = (e, v) => {
        const userGroups = v.map(i => i.id);
        setFormState(s => ({...s, userGroups}));
    };
    
    const handleFormSubmit = async e => {

        if (formState.subject.trim() === '') {
            setValidationErrorState(s => ({...s, subject: true}));
            return;
        }
        if (formState.message.trim() === '') {
            setValidationErrorState(s => ({...s, message: true}));
            return;
        }

        const subject = formState.subject;
        const message = formState.message;
        const priority = formState.priority;
        const users = formState.users.map(i => ({user_id: i}));
        const userGroups = formState.userGroups.map(i => ({notification_id: id, user_group_id: i}));
        const creator = loggedInUser?.id //"00000000-0000-0000-0000-a956ffb470a8"  ;

        // setInProgress(true);
        let mutationResult;
        try {
           
            mutationResult = await insertNotification({
                variables: {
                    subject,
                    message,
                    users,
                    creator,
                    priority
                }
            });
           
            // console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
            history.push(history?.location?.state?.backUrl ?? "/dashboard/notifications");
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    
    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={"New Notification"}  toolbarIcon={<NotificationsIcon style={{margin: '-4px 8px'}}/>}
                            backLinkUrl={history?.location?.state?.backUrl ?? "/dashboard/notifications"}
                            onClickDone={handleFormSubmit} inProgress={inProgress}/>

                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>

                        <Grid container spacing={3}>

                            <Grid dir="rtl" item md={6}>
                                <TextField id="subject" label="Subject" variant="standard"
                                    onChange={handleChangeSubject} 
                                    fullWidth
                                    value={formState.name} error={validationErrorState.name}
                                    required
                                />
                            </Grid>
                            <Grid item md={6}>
                                <TextField id="priority" label="Priority" variant="outlined"
                                            onChange={handleChangePriority} fullWidth
                                            value={formState.name} error={validationErrorState.name}
                                            required
                                            select
                                            defaultValue='low'
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid  dir="rtl" align="center" item md={12} >
                                <TextField id="name"  label="Message" variant="filled"                                           
                                           multiline
                                           onChange={handleChangeMessage} fullWidth
                                           value={formState.name} error={validationErrorState.name}
                                           required/>
                            </Grid>

                            <Grid item sm={6}>
                                <CheckboxesTags id="users" label="Users" placeholder="Username" fullWidth
                                                items={items.users} selectedIds={formState.users}
                                                onChange={handleChangeTagsUsers}/>
                            </Grid>

                        </Grid>

                        <BottomToolbar backLinkUrl="/dashboard/notifications" onClickDone={handleFormSubmit}
                                       inProgress={inProgress}/>

                    </form>
                </div>
            </Paper>

            <Snackbar
                open={snackbarState.isOpen}
                // onClose={handleSnackbarClose}
                // TransitionComponent={(<Slide direction="up" />)}
                message={snackbarState.message}
                // key={SlideTransition.name}
            />
        </div>
    )
}

export default AddNotification

