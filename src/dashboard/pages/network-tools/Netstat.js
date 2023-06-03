import {Grid, Paper, TextField, Box, Button} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import RoomIcon from '@material-ui/icons/Room';
import {gql, useMutation} from '@apollo/client';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import TopToolbar from '../../shared-components/TopToolbar';

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

const ACTION_NETSTAT = gql`
    mutation MyMutation {
        action_netstat {
            ipAddress
            netstatResult
        }
    }  
`;

const Netstat = () => {

    const [submitNetstat,] = useMutation(ACTION_NETSTAT);
    const [ netstatError, setnetstatError ] = React.useState(false);
    const [ loading, setLoading ] = React.useState(false);
    const [ipAddress, setIpAddress] = React.useState('');
    const [netstatResult, setNetstatResult] = React.useState(null);
    

    const handlesubmitNetstat = async () => {

        setIpAddress('');
        setNetstatResult(null)
        setnetstatError(false);
        setLoading(true);

        try {
            const mutationResult = await submitNetstat();
            let results = mutationResult?.data?.action_netstat;

            setIpAddress(results?.ipAddress)
            setNetstatResult(results?.netstatResult)
            setLoading(false);
        } catch (e) {
            console.log(e.message);
        }
    }

    const classes = useStyles();
    
    return (
        <div className={classes.root} style={{width: '100%'}}>
             <Paper className={classes.paper}>
                 <TopToolbar toolbarTitle="Netstat" toolbarIcon={<SettingsEthernetIcon style={{margin: '-4px 8px'}}/>} backLinkUrl={'/dashboard/network-tools'} />
                 <Grid container>
                    <Grid item md={12} sm={6} xs={6} style={{ padding:'40px'}} >
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                className={classes.button}
                                startIcon={<RoomIcon/>}
                                style={{margin: "0 0 5px 0"}}
                                onClick={handlesubmitNetstat}
                            >
                                Netstat
                            </Button>
                        </div>
                        <Paper style={{padding: '10px'}} className={classes.paperNetworkTools}>
                            <h4>{ ipAddress.length > 0 && 'Your IP Address is :' + ipAddress}</h4>

                            <p style={{whiteSpace: 'pre-wrap'}}>{netstatResult && netstatResult}</p>

                            {loading && <h4  className={classes.loading} >Waiting...</h4> }
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    )
}

export default Netstat;