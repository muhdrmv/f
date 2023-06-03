import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import {gql, useMutation, useLazyQuery} from '@apollo/client';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { Grid, Paper, Snackbar, TextField } from '@material-ui/core';
import BottomToolbar from './BottomToolbar';
import useFrontLogs from '../logs/FrontLogs';


const SET_REQUEST_TO_CHANGE_TIME_SERVER = gql`
mutation ($date: String!) {
    action_set_time_server(date: $date) {
      result
      time
    }
}
`;

const REQUEST_TO_TIME_SERVER = gql`
mutation{
    action_say_time_server{
        result
        time
    }
}
`;

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

const SectionServerTime = ({loggedInUser}) => {

    const frontLogs = useFrontLogs();
    const [snackbarState,setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(true);
    const classes = useStyles();
    const [formState, setFormState] = React.useState({
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: ''
    });
    const [formStateFT, setFormStateFT] = React.useState({
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: ''
    });

    const [sayTimeServer,] = useMutation(REQUEST_TO_TIME_SERVER);
    const [doChangeTimeServer,] = useMutation(SET_REQUEST_TO_CHANGE_TIME_SERVER);

    let handleOnChangeTimeSerever = e =>{

        let name = e.target.name;
        let value = e.target.value;

        if(name == 'year' ) {
            if (value == '' || value < 2000) value = 2000;
            setFormState(s => ({...s, [name]: value}));
        }
        if(name == 'month' ) {
            if (value == '' || value < 1) value = 1;
            else if(value > 12) value = 12;
            setFormState(s => ({...s, [name]: value}));
        }
        if(name == 'day' ) {
            if (value == '' || value < 1) value = 1;
            else if(value > 31) value = 31;
            setFormState(s => ({...s, [name]: value}));
        }
        if(name == 'hour' ) {
            if (value == '' || value < 0) value = 0;
            else if(value > 23) value = 23;
            setFormState(s => ({...s, [name]: value}));
        }
        if(name == 'minute' ) {
            if (value == '' || value < 1) value = 1;
            else if(value > 59) value = 59;
            setFormState(s => ({...s, [name]: value}));
        }
    }

    let setFormStateAfterData = async (dateString) => {

        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month is zero-based, so add 1
        const day = date.getDate();
        let hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        setFormState(s => ({...s, year}));
        setFormState(s => ({...s, month}));
        setFormState(s => ({...s, day}));
        setFormState(s => ({...s, hour}));
        setFormState(s => ({...s, minute}));
    }

    useEffect( async() => {

        try {
            let mutationResult = await sayTimeServer();

            if(mutationResult?.data?.action_say_time_server?.result){

                let dateString = mutationResult?.data?.action_say_time_server?.time.trim();
                await setFormStateAfterData(dateString);
                
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Month is zero-based, so add 1
                const day = date.getDate();
                let hour = date.getUTCHours();
                const minute = date.getUTCMinutes();
                setFormStateFT(s => ({...s, year}));
                setFormStateFT(s => ({...s, month}));
                setFormStateFT(s => ({...s, day}));
                setFormStateFT(s => ({...s, hour}));
                setFormStateFT(s => ({...s, minute}));
                setInProgress(false);

            }else if(!mutationResult?.data?.action_say_time_server?.result){
                alert(mutationResult?.time);
                setInProgress(false);
            }
        } catch (e) {
            console.log(e)
            alert(e);
            setInProgress(false);
        }
    },[]);

    const handleFormSubmitServerTime = async () => {

        if(formState.year == '') {
            alert('Field " Year " is empty');
            return;
        }
        if(formState.month == '') {
            alert('Field " Month " is empty');
            return;
        }
        if(formState.day == '') {
            alert('Field " Day " is empty');
            return;
        }
        if(formState.hour == '') {
            alert('Field " Hour " is empty');
            return;
        }
        if(formState.minute == '') {
            alert('Field " Minute " is empty');
            return;
        }

        let date = `${formState.year}-${formState.month}-${formState.day} ${formState.hour}:${formState.minute}:00`;
        setInProgress(true);

        try {
            let mutationResult = await doChangeTimeServer ({
                variables: {
                    date
                }
            });

            if(mutationResult?.data?.action_set_time_server?.result){
                
                let dateString = mutationResult?.data?.action_set_time_server?.time.trim();
                await setFormStateAfterData(dateString);

                let newTime = `${formState.year}-${formState.month}-${formState.day} ${formState.hour}:${formState.minute}:00`;
                let oldTime = `${formStateFT.year}-${formStateFT.month}-${formStateFT.day} ${formStateFT.hour}:${formStateFT.minute}:00`;

                await frontLogs('Time Server Changed', `Time Server changed to ${newTime}`, {"new": newTime}, {"old":oldTime}, loggedInUser?.id, loggedInUser?.username);
                
                setInProgress(false);
                setSnackbarState({message: 'Successful. Server reboot is required.', isOpen: true})
                setTimeout(() => {
                    setSnackbarState(s => ({...s, isOpen: false}));
                }, 1000);

            }else if(!mutationResult?.data?.action_say_time_server?.result){
                alert(mutationResult?.time);
                setInProgress(false);
            }
        } catch (e) {
            console.log(e)
            alert(e);
            setInProgress(false);
        }
    }

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Server Time"
                        toolbarIcon={<AccessTimeIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'}/>

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off" >
                    <Grid container spacing={3}>
                        <Grid item md={2}>
                            <TextField label="Year" type="number" InputProps={{ inputProps: { min: 2000, max: 2040 } }}
                                variant="outlined" fullWidth name="year"
                                value={formState.year} onChange={handleOnChangeTimeSerever}
                                helperText="Example: 2023"/>
                        </Grid>
                        <Grid item md={2}>
                            <TextField label="Month" type="number" InputProps={{ inputProps: { min: 1, max: 12 } }}
                                variant="outlined" fullWidth  name="month"
                                value={formState.month} onChange={handleOnChangeTimeSerever}
                                helperText="Example: 1-12"/>
                        </Grid>
                        <Grid item md={2}>
                            <TextField label="Day" type="number" InputProps={{ inputProps: { min: 1, max: 31 } }}
                                variant="outlined" fullWidth  name="day"
                                value={formState.day} onChange={handleOnChangeTimeSerever}
                                helperText="Example: 1-31"/>
                        </Grid>

                        <Grid item md={2}></Grid>

                        <Grid item md={2}>
                            <TextField label="Hour"
                                variant="outlined" fullWidth  name="hour"  type="number" InputProps={{ inputProps: { min: 0, max: 23 } }}
                                value={formState.hour} onChange={handleOnChangeTimeSerever}
                                helperText="Example: 0-23"/>
                        </Grid>
                        <Grid item md={2}>
                            <TextField label="Minute" type="number" InputProps={{ inputProps: { min: 1, max: 59 } }}
                                variant="outlined" fullWidth name="minute"
                                value={formState.minute} onChange={handleOnChangeTimeSerever}
                                helperText="Example: 0-59"/>
                        </Grid>
                    </Grid>
                    <Grid item md={12}>
                        <h4>* The server time must be UTC, and if the time is changed incorrectly, the time of all events will be recorded incorrectly, and the time changer is responsible for that. After changing the time, you must reboot the server once.</h4>
                    </Grid>
                    <BottomToolbar onClickDone={handleFormSubmitServerTime}
                                   inProgress={inProgress}/>
                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionServerTime