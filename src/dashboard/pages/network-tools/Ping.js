import {Grid, Paper, TextField, Box, Button} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import RoomIcon from '@material-ui/icons/Room';
import {gql, useMutation} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import DnsIcon from '@material-ui/icons/Dns';

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },
    paperNetworkTools: {
        width: '100%',
        minHeight: "50vh",
        backgroundColor: "#E8E8E8",
    },
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        }
    },
    icon: {
        fontSize: '32px !important',
        marginBottom: theme.spacing.unit
    },
    loading: {
        color: 'gray', 
        textAlign: 'center', 
        paddingTop: '50px'
    }
}));

const ACTION_PING = gql`
    mutation ( $ipNumber: String! ){
        action_ping (ip: $ipNumber) {
            result
        }
    }
`;

const Ping = () => {

    const [submitPing,] = useMutation(ACTION_PING);
    const [ pingError, setpingError ] = React.useState(false);
    const [ ipNumber, setIpNumber ] = React.useState("");
    const [ loading, setLoading ] = React.useState(false);
    const [ res, setRes ] = React.useState({
        host: '',
        output: '',
        alive: '',
        time: ''
    });

    const handleOnChangeInput = (ipNumber) => {

        if(ipNumber.length == 0) setpingError(false);
        setIpNumber(ipNumber);

        let obj = {
            host: '',
            output: '',
            alive: '',
            time: ''
        }
        setRes(obj);
    }

    const checkIpNumberValidity = (ipNumber) => {

        let ipNumberValidity = ipNumber.split('.');
        if( ipNumberValidity.length < 4 || ipNumberValidity[ipNumberValidity.length - 1] == '' ) return false;

        return true;
    }

    const handleSubmitPing = async () => {

        handleOnChangeInput(ipNumber);

        if( !checkIpNumberValidity(ipNumber) ){
            setpingError(true)
            return;
        }

        setpingError(false);
        setLoading(true);

        try {
            const mutationResult = await submitPing({
                variables: {
                    ipNumber: ipNumber
                }
            });
            let results = mutationResult?.data?.action_ping?.result;
            let output = {
                host: results?.host,
                output: results?.output,
                alive: `${results?.alive}`,
                time: results?.time,
            }

            setLoading(false);
            setRes(output)
        } catch (e) {
            console.log(e.message);
        }
    }

    const classes = useStyles();

    const PingResults = (res) => {
        return (
            <ul style={{ listStyleType: 'none', padding: '50px 10px', fontSize: 'smaller', fontFamily: 'sans-serif'}}>
                <li><b>IP :</b> {res?.host}</li> 
                <li><b>Alive :</b> {res?.alive}</li> 
                <li><b>Output :</b> {res?.output}</li>
                <li><b>Time :</b> {res?.time}</li>
            </ul>
        )
    }
    
    return (
        <div className={classes.root} style={{width: '100%'}}>
             <Paper className={classes.paper}>
                 <TopToolbar toolbarTitle="Ping" toolbarIcon={<DnsIcon style={{margin: '-4px 8px'}}/>} backLinkUrl={'/dashboard/network-tools'} />
                 <Grid container>
                    <Grid item md={12} sm={12} xs={6} style={{ padding:'40px'}} >
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <TextField 
                                label="Ping example:192.168.1.1" 
                                type="text"
                                size="small"
                                fullWidth
                                variant="outlined"
                                error={pingError}
                                InputProps={{readOnly: false}} 
                                onChange={
                                    (event)=>{ handleOnChangeInput(event.target.value)  }
                                }
                            /> 
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                className={classes.button}
                                startIcon={<RoomIcon/>}
                                style={{margin: "0 0 18px 0"}}
                                onClick={handleSubmitPing}
                            >
                                Ping
                            </Button>
                        </div>
                        <Paper className={classes.paperNetworkTools}>
                            {res.host && PingResults(res) }
                            {loading && <h4  className={classes.loading} >Waiting...</h4> }
                        </Paper>
                    </Grid>
                 </Grid>
             </Paper>
        </div>
    )
}

export default Ping;