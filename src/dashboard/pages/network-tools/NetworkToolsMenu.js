import {Grid, Paper} from "@material-ui/core";
import {DataUsage} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import TopToolbar from "../../shared-components/TopToolbar";
import React from "react";
import NetworkToolsMenuIcon from "./NetworkToolsMenuIcon";
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import DnsIcon from '@material-ui/icons/Dns';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import StorageIcon from '@material-ui/icons/Storage';

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    }
}));

const NetworkToolsMenu = () => {
    const classes = useStyles();
    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Network Tools" toolbarIcon={<DeviceHubIcon style={{margin: '-4px 8px'}}/>}/>
            <Grid container>
                <NetworkToolsMenuIcon label='Ping'        href='ping'      icon={DnsIcon} />
                <NetworkToolsMenuIcon label='Traceroute'    href='traceroute'  icon={WifiTetheringIcon} />
                {/* <NetworkToolsMenuIcon label='Netstat'        href='netstat'      icon={SettingsEthernetIcon} />
                <NetworkToolsMenuIcon label='Network Scan'     href='network-scan'       icon={StorageIcon} /> */}
            </Grid>
        </Paper>
    )
}

export default NetworkToolsMenu;