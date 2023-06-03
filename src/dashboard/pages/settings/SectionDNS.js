import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import {gql, useMutation} from '@apollo/client';
import DnsIcon from '@material-ui/icons/Dns';
import { Grid, Paper, Snackbar, TextField, Button } from '@material-ui/core';
import BottomToolbar from './BottomToolbar';
import useFrontLogs from '../logs/FrontLogs';

const GET_DNS_FROM_SERVER = gql`
mutation {
    action_dns_get {
        result
        DNS1
        DNS2
    }
}
`;

const REMOVE_DNS_FROM_SERVER = gql`
mutation {
    action_dns_remove {
        result
        DNS1
        DNS2
    }
}
`;

const SET_DNS_FROM_SERVER = gql`
mutation ($DNS1: String!, $DNS2: String!) {
    action_dns_set(DNS1: $DNS1, DNS2: $DNS2) {
        result
        DNS1
        DNS2
        msg
    }
}
`;

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(5),
        },
    },
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
        display: 'inline',
    },
    formFooter: {
        textAlign: 'right',
        padding: theme.spacing(1),
    },
}));

const SectionDNS = ({loggedInUser}) => {

    const frontLogs = useFrontLogs();
    const [snackbarState,setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(true);
    const classes = useStyles();
    const [formState, setFormState] = React.useState({
        DNS1: '',
        DNS2: ''
    });
    const [formStateFT, setFormStateFT] = React.useState({
        DNS1: '',
        DNS2: ''
    });

    const [setDNSToServer,] = useMutation(SET_DNS_FROM_SERVER);
    const [removeDNSFromServer,] = useMutation(REMOVE_DNS_FROM_SERVER);
    const [getDNSFromServer,] = useMutation(GET_DNS_FROM_SERVER);
    
    let setFormStateAfterData = async (DNS1, DNS2) => {

        setFormState(s => ({...s, DNS1}));
        setFormState(s => ({...s, DNS2}));
    }

    useEffect( async() => {
        try {

            let mutationResult = await getDNSFromServer();
            if(mutationResult?.data?.action_dns_get?.result){

                setFormStateFT(s => ({...s, DNS1: mutationResult?.data?.action_dns_get?.DNS1}));
                setFormStateFT(s => ({...s, DNS2: mutationResult?.data?.action_dns_get?.DNS2}));
                await setFormStateAfterData(mutationResult?.data?.action_dns_get?.DNS1, mutationResult?.data?.action_dns_get?.DNS2);
                setInProgress(false);

            }else if(!mutationResult?.data?.action_dns_get?.result){

                alert("There is an error to get DNS.");
                setInProgress(false)
            }
        } catch (error) {
            console.log(error);
            setInProgress(false)
        }
        
    },[]);

    const handleOnChangeDNS = e => {

        let name = e.target.name;
        let value = e.target.value;
        value = value.trim();
        setFormState(s => ({...s, [name]: value}));
    }

    const handleFormSubmitDNS = async () => {
        
        if(formState.DNS1 == '' && formState.DNS2 == ''){
            alert('You must enter at least one DNS!');
            return;
        }
        
        setInProgress(true);

        try {
            let mutationResult = await setDNSToServer({
                variables: {
                    DNS1: formState.DNS1,
                    DNS2: formState.DNS2
                }
            });

            if(mutationResult?.data?.action_dns_set?.result){

                await setFormStateAfterData(mutationResult?.data?.action_dns_set?.DNS1, mutationResult?.data?.action_dns_set?.DNS2);
                await frontLogs('The DNS Changed', `DNS1 changed : ${formState?.DNS1} \n DNS2 changed : ${formState?.DNS2}`, {"DNS1":formState?.DNS1, "DNS2":formState?.DNS2}, {"DNS1":formStateFT?.DNS1, "DNS2":formStateFT?.DNS2}, loggedInUser?.id, loggedInUser?.username);

                setSnackbarState({message: 'Successful', isOpen: true})
                setTimeout(() => {
                    setSnackbarState(s => ({...s, isOpen: false}));
                }, 1000);
                setInProgress(false)

            }else if(!mutationResult?.data?.action_dns_get?.result){

                alert(mutationResult?.data?.action_dns_set?.msg);
                setInProgress(false)
            }
        } catch (e) {
            console.log(e)
            alert(e);
            setInProgress(false)
        }
    }

    const onClickRemoveDNS = async () => {

        setInProgress(true);
        
        try {
            let mutationResult = await removeDNSFromServer();
            if(mutationResult?.data?.action_dns_remove?.result){

                await setFormStateAfterData('', '');
                await frontLogs('The DNS removed', `DNS1 changed : '' \n DNS2 changed : ''`, {"DNS1":formState?.DNS1, "DNS2":formState?.DNS2}, {"DNS1":formStateFT?.DNS1, "DNS2":formStateFT?.DNS2}, loggedInUser?.id, loggedInUser?.username);

                setSnackbarState({message: 'Successful: DNS Removed', isOpen: true})
                setInProgress(false);
                setTimeout(() => {
                    setSnackbarState(s => ({...s, isOpen: false}));
                }, 1000);

            }else{

                alert("There is an error to remove DNS.");
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
            <TopToolbar toolbarTitle="Set DNS"
                        toolbarIcon={<DnsIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'}/>

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off" >
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="DNS 1" type="text" value={formState.DNS1} 
                                variant="outlined" fullWidth name="DNS1" onChange={handleOnChangeDNS}
                                helperText="Example: 192.168.1.1"/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="DNS 2" type="text" value={formState.DNS2} 
                                variant="outlined" fullWidth name="DNS2" onChange={handleOnChangeDNS}
                                helperText="Example: 192.168.1.1"/>
                        </Grid>
                    </Grid>

                    <div className={classes.formFooter}>
                        <div className={classes.wrapper}>
                            <Button color="primary" onClick={onClickRemoveDNS} size="large">
                                Remove DNS
                            </Button>
                        </div>
                    </div>
                    <BottomToolbar onClickDone={handleFormSubmitDNS}
                                   inProgress={inProgress}/>
                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionDNS