import React, {useEffect, useState, useRef} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Grid, Paper, Typography, Chip, TextField, Tooltip, IconButton, Button, Input, MenuItem,FormControl,Dialog,DialogTitle,DialogContent,InputLabel,DialogActions,Select} from '@material-ui/core';
import {useParams,useHistory} from "react-router-dom";
import {gql, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import 'date-fns';
import {changeTimeZone} from "../../../utilities/Utils";
import SendIcon from '@material-ui/icons/Send';
import RefreshIcon from "@material-ui/icons/Refresh";

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
    users_style: {
        justifyContent: "left",
        alignItems: "center",
        display: "flex"
    },
    admin_style: {
        justifyContent: "right",
        alignItems: "center",
        display: "flex"
    },
    ticketDetails: {
        marginLeft: '20px',
        textAlign: 'left',
    },
    gridMessage: {
        minHeight:'100px', 
        justifyContent:'center',
        alignItems:'center',
        display:'flex',
        flexDirection: 'column'
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    
}));

const QUERY_TICKET_BY_PK = gql`
query ($id: uuid!) {
    tickets_by_pk(id: $id) {
        id
        status
        applicant_id
        applicant_posittion
        created_at
        subject
        priority
        applicant_user {
            username
        }
        messages (
            order_by: {created_at: asc}
        ) {
            replyer_message
            replyer_position
            created_at
            replyer_user {
              username
            }
        }
    }
}
`;

const INSERT_NEW_MESSAGE = gql`
mutation (
    $ticket_id: uuid!,
    $replyer_position: String!,
    $replyer_message: String!,
    $replyer_id: uuid!
) {
    insert_ticket_messages(
        objects: {
            ticket_id: $ticket_id, 
            replyer_position: $replyer_position, 
            replyer_message: $replyer_message, 
            replyer_id: $replyer_id
        }
    ) {
      affected_rows
    }
  }
  
`;

const INSERT_NEW_NOTIFICATION = gql`
mutation (
  $subject: String!, 
  $message: String!, 
  $creator: uuid!,
  $users: [notification_user_insert_input!]!  
  $priority: String!
  $meta: jsonb
) {
 insert_notifications (objects: {
    subject: $subject, 
    message: $message,
    notification_users: {data: $users},
    creator: $creator,
    priority: $priority,
    meta: $meta
  }) {
    returning {
      id
    }
  }
}
`;

const UPDATE_TICKET_STATUS = gql`
mutation ($ticket_id: uuid!, $status: String!) {
    update_tickets(where: {id: {_eq: $ticket_id}}, _set: {status: $status}) {
        affected_rows
    }
}
`;


const TicketChats = ({loggedInUser}) => {

    const classes = useStyles();
    const {id} = useParams();

    const [ inProgress, setInProgress ] = useState(false);
    const [ chatMessages, setChatMessages ] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [status, setStatus] = React.useState('');

    const {loading, error, data, refetch} = useQuery( QUERY_TICKET_BY_PK, {variables: {id}, notifyOnNetworkStatusChange: true});
    const [insertNewMessage,] = useMutation(INSERT_NEW_MESSAGE);
    const [insertNewNotification,] = useMutation(INSERT_NEW_NOTIFICATION);
    const [updatetTicketStatus,] = useMutation(UPDATE_TICKET_STATUS);

    const [formState, setFormState] = useState({
        replyer_id: loggedInUser?.id,
        replyer_message: '',
        replyer_position: loggedInUser?.role,
        ticket_id : id
    });
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });
    const handleChangeMessage = (e) => {
        setFormState(s => ({...s, replyer_message: e.target.value}));
    }
    const handleClickRefresh = () => {
        refetch();
    }

    const handleChangeStatus = (event) => {
        setStatus(event.target.value);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    }

    const handleSubmitStatus= async () => {
        setOpen(false);
        
        let mutationResult;
        try {
            mutationResult = await updatetTicketStatus({
                variables: {
                    ticket_id: id,
                    status: status,
                }
            });
            // console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);

            refetch();

        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
    };
    
    const createNewNotification = async () => {

        let link = '/dashboard/tickets/' + id + '/view';
        let mutationResult;
        try {
            mutationResult = await insertNewNotification({
                variables: {
                    subject: 'Ticket Answered',
                    message: formState?.replyer_message,
                    users: [{user_id: chatMessages?.applicant_id}],
                    creator: loggedInUser?.id,
                    priority: chatMessages?.priority,
                    meta: {link}
                }
            });
            // console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
    }

    useEffect( () => {
        if(data)    
            try {
                setChatMessages(data?.tickets_by_pk);

                setTimeout((a) => {
                    let temp = document.getElementById('messagesRow');
                    temp.scrollTo({ top: 30000000, behavior: 'smooth' });
                }, 500);

            } catch (error) {
                console.log(error);
            }
    }, [data]);

    useEffect(() => {
        setInterval(() => {
            refetch();
        }, 15000);
    }, []);

    const handleFormSubmit = async e => {

        const { replyer_id, replyer_message, replyer_position, ticket_id } = formState;

        if (formState.replyer_message.trim() === '') {
            alert('Write More characters on message box');
            return;
        }
        if(!replyer_id || !replyer_message || !replyer_position || !ticket_id ){
            alert('Data Not Found');
            return;
        }
        // setInProgress(true);
        let mutationResult;
        try {
            mutationResult = await insertNewMessage({
                variables: {
                    replyer_id, 
                    replyer_message, 
                    replyer_position, 
                    ticket_id
                }
            });
           
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);

            refetch(); //rerender to show last message
            setFormState(s => ({...s, replyer_message: ''})); // Clear TextFeild after sent
            createNewNotification();

        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    const ExtraIcons = () => (
        <>
            <Tooltip title="Refresh">
                <IconButton aria-label="refresh" onClick={handleClickRefresh}>
                    <RefreshIcon/>
                </IconButton>
            </Tooltip>
        </>
    );
   
    
    return (
        <div className={classes.root} style={{width: '100%'}}>

            {<Paper style={{minHeight: '80vh'}}>

                <TopToolbar
                    extraIcons={ExtraIcons}
                    toolbarTitle={"Ticket :  #" + chatMessages?.id } 
                    backLinkUrl="/dashboard/tickets"
                    inProgress={inProgress}
                />
  
                <Chip
                    className={classes.ticketDetails}
                    label={"Created At : " + changeTimeZone(chatMessages?.created_at)}
                    color="primary"
                />

                <Chip
                    className={classes.ticketDetails}
                    label={"Ticket Status : " + chatMessages?.status}
                    color="primary"
                />

                <Chip
                    className={classes.ticketDetails}
                    label={"Subject : " + chatMessages?.subject}
                    color="primary"
                />

                <Chip
                    className={classes.ticketDetails}
                    label={"User : " + chatMessages?.applicant_user?.[0]?.username}
                    color="primary"
                />
                
                <Button onClick={handleClickOpen}>Change The Status</Button>

                <Dialog open={open} onClose={handleClose}>

                <DialogTitle>You Can Change The Ticket Status: </DialogTitle>
                    <DialogContent>
                        <form className={classes.container}>
                            <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="demo-dialog-native">Status</InputLabel>
                            <Select
                                native
                                value={status}
                                onChange={handleChangeStatus}
                                input={<Input id="demo-dialog-native" />}
                            >
                                <option value='open'>Open</option>
                                <option value='waiting'>Waiting</option>
                                <option value='closed'>Closed</option>
                            </Select>
                            </FormControl>
                        </form>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitStatus} color="primary">
                        Ok
                    </Button>
                    </DialogActions>
                </Dialog>

                <div id='messagesRow' className={classes.root} style={{backgroundColor:'#F1F1F1' ,padding: "20px", margin:'10px 0px', overflow: 'scroll', height: '60vh'}}>

                    {
                        chatMessages?.messages && chatMessages?.messages.map( (m) => (
                            <Grid 
                                container 
                                className={
                                    m?.replyer_position == 'user' ? classes.users_style : classes.admin_style
                                }
                            >
                                <Grid item xs={6} style={{display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center',justifyContent: 'right'}}>
                                    
                                    <Chip
                                        label={m?.replyer_user?.username}
                                        className={ 
                                            m?.replyer_position == 'user' ? classes.usernameChipUser : null
                                        }
                                        style={{
                                            backgroundColor:'#393E46',
                                            color: 'whitesmoke',
                                            fontWeight: '900',
                                            width: '30%',
                                            margin: '10px 0px -25px 0px',
                                            zIndex: '20'
                                        }}
                                    />

                                    <Paper className={classes.gridMessage} style={{backgroundColor:'#CFD2CF', margin: '10px 0px', width: '100%' }}>
                                        
                                        <Typography
                                            style={{
                                                fontSize: 'medium',
                                                minWidth: '70%',
                                                margin: '30px 0px 10px 0px',
                                                textAlign: 'center',
                                                backgroundColor: '#EEEEEE',
                                                borderRadius: '10px'
                                            }}
                                        >
                                            {m?.replyer_message}
                                        </Typography>

                                        <Typography>
                                            <h5>{changeTimeZone(m?.created_at)}</h5>
                                        </Typography>
                                        
                                    </Paper>

                                </Grid>
                            </Grid>
                        ))
                    }

                </div>
                <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>

                    <TextField dir="rtl" variant="filled"  
                        style={{whiteSpace: "pre-line", backgroundColor: '#F1F1F1', margin: '30px auto', width: '100%'}}                                        
                        multiline
                        rows={3}
                        required 
                        value={formState?.replyer_message}
                        onChange={handleChangeMessage}
                        InputProps={{endAdornment: <IconButton onClick={handleFormSubmit} > <SendIcon /></IconButton>}}
                        placeholder='Write Your Messages'
                    />
                </form>

            </Paper>}

        </div>
    )
}

export default TicketChats;
