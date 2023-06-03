// import {Grid, Paper, TextField, Box, Button} from "@material-ui/core";
// import {makeStyles} from "@material-ui/core/styles";
// import TopToolbar from "../../shared-components/TopToolbar";
// import React from "react";
// import TraceRoute from './TraceRoute.js';
// import Ping from './Ping';
// import DeviceHubIcon from '@material-ui/icons/DeviceHub';
// import Netstat from "./Netstat";

// const useStyles = makeStyles((theme) => ({
//     paper: {
//         width: '100%',
//         marginBottom: theme.spacing(1),
//     },
//     paperNetworkTools: {
//         width: '100%',
//         marginBottom: theme.spacing(1),
//         minHeight: "50vh",
//         backgroundColor: "#E8E8E8",
//     },
//     root: {
//         '& .MuiTextField-root': {
//             marginTop: theme.spacing(2),
//             marginBottom: theme.spacing(2),
//         }
//     },
//     icon: {
//         fontSize: '32px !important',
//         marginBottom: theme.spacing.unit
//     }
// }));
 
// const NetworkTools = () => {
//     const classes = useStyles();

//     return (
//         <div className={classes.root} style={{width: '100%'}}>
//             <Paper className={classes.paper}>
//                 <TopToolbar toolbarTitle="Network Tools" toolbarIcon={<DeviceHubIcon style={{margin: '-4px 8px'}}/>}/>
//                 <Grid container>
//                     {<Ping />}
//                     {<TraceRoute />}
//                     {<Netstat />}
//                 </Grid>
//             </Paper>
//         </div>
//     )
// }

// export default NetworkTools;

import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Route, Switch} from "react-router-dom"
import NetworkToolsMenu from './NetworkToolsMenu';
import Ping from "./Ping";
import TraceRoute from "./TraceRoute";
import Netstat from './Netstat';
import NetworkScan from './NetworkScan';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        }
    }
}));
 
const NetworkTools = () => {
    const classes = useStyles();

    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Switch>
                <Route exact path="/dashboard/network-tools" component={NetworkToolsMenu} />
                <Route exact path="/dashboard/network-tools/ping" component={Ping} />
                <Route exact path="/dashboard/network-tools/traceroute" component={Ping} />
                <Route exact path="/dashboard/network-tools/netstat" component={TraceRoute} />
                <Route exact path="/dashboard/network-tools/network-scan" component={NetworkScan} />
            </Switch>
        </div>
    )
}

export default NetworkTools;