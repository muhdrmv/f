import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import {Grid, Paper} from "@material-ui/core";
import {DataUsage} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import TopToolbar from "../../shared-components/TopToolbar";
import React from "react";
import SettingsMenuIcon from "./SettingsMenuIcon";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import BusinessIcon from "@material-ui/icons/Business";
import LockIcon from "@material-ui/icons/Lock";
import AssignmentIcon from "@material-ui/icons/Assignment";
import AssessmentIcon from "@material-ui/icons/Assessment";
import SettingsIcon from "@material-ui/icons/Settings";
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DnsIcon from '@material-ui/icons/Dns';

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    }
}));

const SettingsMenu = ({hasFeatures, hamFeatures, transparentFeature}) => {
    const classes = useStyles();
    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Settings" toolbarIcon={<SettingsIcon style={{margin: '-4px 8px'}}/>}/>
            <Grid container>
                <SettingsMenuIcon label='System License'        href='system-license'      icon={AssignmentTurnedInIcon} />
                <SettingsMenuIcon label='Storage Management'    href='storage-management'  icon={DataUsage} />
                <SettingsMenuIcon label='Authentication'        href='authentication'      icon={FingerprintIcon} />
                <SettingsMenuIcon label='Export and Import'     href='export-import'       icon={ImportExportIcon} />
                <SettingsMenuIcon label='Custom Branding'       href='custom-branding'     icon={BusinessIcon} />
                <SettingsMenuIcon label='HTTPS Configuration'   href='https-configuration' icon={LockIcon} />
                <SettingsMenuIcon label='Syslog Server'         href='syslog-server'       icon={AssignmentIcon} />
                <SettingsMenuIcon label='System Reports'        href='system-reports'      icon={AssessmentIcon} />
                <SettingsMenuIcon label='Server Time'           href='server-time'         icon={AccessTimeIcon} />
                <SettingsMenuIcon label='DNS'                   href='set-dns'             icon={DnsIcon} />
                {
                    (hasFeatures || hamFeatures) && 
                    <SettingsMenuIcon label='High Availability' href='high-availability'   icon={AddToQueueIcon} />
                }
                {
                    transparentFeature && 
                    <SettingsMenuIcon label='Transparent Mode' href='transparent'   icon={VisibilityIcon} />
                }

            </Grid>
        </Paper>
    )
}

export default SettingsMenu;