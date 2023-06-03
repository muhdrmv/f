import {Grid, Paper, TextField, Box, Button} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import PublicIcon from '@material-ui/icons/Public';
import {gql, useMutation} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';

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
    result: {
        listStyleType: 'none', 
        padding: '50px 10px', 
        fontSize: 'small', 
        fontFamily: 'sans-serif'
    },
    loading: {
        color: 'gray', 
        textAlign: 'center', 
        paddingTop: '50px'
    },
    errorMessage: {
        color: 'gray', 
        textAlign: 'center', 
        paddingTop: '50px'
    }
}));

const ACTION_TRACEROUTE = gql`
    mutation ( $ipNumber: String! ){
        action_traceroute (ip: $ipNumber) {
            hops
        }
    }
`;

const TraceRoute = () => {

    const [submitTraceroute,] = useMutation(ACTION_TRACEROUTE);
    const [ TracerouteError, setTracerouteError ] = React.useState(false);
    const [ ipNumber, setIpNumber ] = React.useState("");
    const [ loading, setLoading ] = React.useState(false);
    const [ res, setRes ] = React.useState([]);
    const [ errorMessage, setErrorMessage ] = React.useState('');
    const classes = useStyles();

    const handleOnChangeInput = (ipNumber) => {

        if(ipNumber.length == 0) setTracerouteError(false);
        setIpNumber(ipNumber);
        setRes([]);
        setErrorMessage('');
    }

    const checkIpNumberValidity = (ipNumber) => {

        let ipNumberValidity = ipNumber.split('.');
        if( ipNumberValidity.length != 4 || ipNumberValidity[ipNumberValidity.length - 1] == '' ) return false;

        for(let i=0 ; i < ipNumberValidity.length ; i++){
            if( ipNumberValidity[i].indexOf(' ') !== -1 ) return false;
        }
        return true;
    }

    const handleSubmitTraceroute = async () => {

        handleOnChangeInput(ipNumber);

        if( !checkIpNumberValidity(ipNumber) ){
            setTracerouteError(true)
            return;
        }

        setTracerouteError(false);
        setLoading(true); 

        try {
            const mutationResult = await submitTraceroute({
                variables: {
                    ipNumber: ipNumber
                }
            });

            let results = mutationResult?.data?.action_traceroute?.hops;
            setErrorMessage('')
            setLoading(false);
            setRes(results)
        } catch (e) {
            console.log(e.message);
            setLoading(false);
            setErrorMessage(e.message)
        }
    }


    const TracerouteResults = (res) => {
        let str = ''; 
        res.map( (hop)=>{
            if(hop?.ip){
                str += `<p><b>${hop?.ip} => </b>${hop?.rtt1} </p>`
            }else{
                str += `<p><b>False</b></p>`
            }
        })
        return str;
    }
    
    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>
                <TopToolbar toolbarTitle="Traceroute" toolbarIcon={<WifiTetheringIcon style={{margin: '-4px 8px'}}/>} backLinkUrl={'/dashboard/network-tools'} />
                <Grid container>
                    <Grid item md={12} sm={12} xs={6} style={{ padding:'40px'}} >
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <TextField 
                                label="Traceroute example:192.168.1.1" 
                                type="text"
                                size="small"
                                fullWidth
                                variant="outlined"
                                error={TracerouteError}
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
                                startIcon={<PublicIcon/>}
                                style={{margin: "0 0 18px 0"}}
                                onClick={handleSubmitTraceroute}
                            >
                                Traceroute
                            </Button>
                        </div>
                        <Paper className={classes.paperNetworkTools}>
                            { res && <div className={classes.result} dangerouslySetInnerHTML={{__html:TracerouteResults(res)}}></div>}
                            { loading && <h4 className={classes.loading} >Waiting...</h4> }
                            { errorMessage && <h4 className={classes.errorMessage} >{errorMessage}</h4> }
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    )
}

export default TraceRoute;