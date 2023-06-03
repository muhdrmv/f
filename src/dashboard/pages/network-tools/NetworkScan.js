import {Grid, Paper, TextField, FormLabel, FormControl, Button, Divider, Switch} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import RoomIcon from '@material-ui/icons/Room';
import {gql, useMutation} from '@apollo/client';
import StorageIcon from '@material-ui/icons/Storage';
import TopToolbar from '../../shared-components/TopToolbar';
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

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
        action_network_scan {
            networkScanResult
        }
    }  
`;

const NetworkScan = () => {

    const [submitNetworkScan,] = useMutation(ACTION_NETSTAT);
    const [ netWorkScanError, setNetworkScanError ] = React.useState(false);
    const [ loading, setLoading ] = React.useState(false);
    const [ networkScanResult, setNetworkScanResult] = React.useState(null);

    const handleSubmitNetworkScan = async () => {

        setNetworkScanResult(null);
        setNetworkScanError(false);
        setLoading(true);

        try {
            const mutationResult = await submitNetworkScan();
            let results = mutationResult?.data?.action_network_scan?.networkScanResult;

            setNetworkScanResult(results)
            setLoading(false);
        } catch (e) {
            console.log(e.message);
        }
    }

    const classes = useStyles();
    
    return (
        <div className={classes.root} style={{width: '100%'}}>
             <Paper className={classes.paper}>
                 <TopToolbar toolbarTitle="Network Scan" toolbarIcon={<StorageIcon style={{margin: '-4px 8px'}}/>} backLinkUrl={'/dashboard/network-tools'} />
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
                                onClick={handleSubmitNetworkScan}
                            >
                                Scan
                            </Button>
                        </div>
                        <Paper style={{padding: '10px'}} className={classes.paperNetworkTools}>

                            <p style={{whiteSpace: 'pre-wrap'}}>{networkScanResult && networkScanResult}</p>

                            {loading && <h4  className={classes.loading} >Waiting...</h4> }
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    )
}

export default NetworkScan;