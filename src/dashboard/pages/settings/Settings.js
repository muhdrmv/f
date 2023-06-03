import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import SectionExportAndImport from './SectionExportAndImport';
import SectionCustomBranding from './SectionCustomBranding';
import SectionExternalAuthentication from './SectionExternalAuthentication';
import SectionSystemLicense from './SectionSystemLicense';
import SectionHttps from "./SectionHttps";
import SectionSyslog from "./SectionSyslog";
import SectionStorage from "./SectionStorage";
import SectionCharts from "./SectionCharts";
import SettingsMenu from "./SettingsMenu";
import {Route, Switch} from "react-router-dom"
import SectionSystemLicenseEdit from "./SectionSystemLicenseEdit";
import SectionSystemLicenseChallenge from "./SectionSystemLicenseChallenge";
import SectionHighAvailabilityMaster from "./SectionHighAvailabilityMaster";
import SectionHighAvailabilitySlave from "./SectionHighAvailabilitySlave";
import SectionTransparent from "./SectionTransparent";
import SectionServerTime from './SectionServerTime';
import SectionDNS from './SectionDNS';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        }
    }
}));
 
const Settings = ({licenseInfo, loggedInUser}) => {
    const classes = useStyles();
    const features = licenseInfo?.action_mgmt_license_info?.result?.features ;
    const hamFeatures = features?.includes?.('ham') ;
    const hasFeatures = features?.includes?.('has') ;
    const transparentFeature = features?.includes?.('trs') ;
    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Switch>
                <Route exact path="/dashboard/settings">
                    <SettingsMenu hasFeatures={hasFeatures} hamFeatures={hamFeatures} transparentFeature={transparentFeature} /> 
                </Route>
                <Route exact path="/dashboard/settings/system-license" component={SectionSystemLicense} />
                <Route exact path="/dashboard/settings/system-license/edit" component={SectionSystemLicenseEdit} />
                <Route exact path="/dashboard/settings/system-license/challenge" component={SectionSystemLicenseChallenge} />
                <Route exact path="/dashboard/settings/storage-management" component={SectionStorage} />
                <Route exact path="/dashboard/settings/authentication" component={SectionExternalAuthentication} />
                <Route exact path="/dashboard/settings/export-import" render={() => <SectionExportAndImport loggedInUser={loggedInUser} />} />
                <Route exact path="/dashboard/settings/custom-branding" component={SectionCustomBranding} />
                <Route exact path="/dashboard/settings/https-configuration" component={SectionHttps} />
                <Route exact path="/dashboard/settings/syslog-server" component={SectionSyslog} />
                <Route exact path="/dashboard/settings/system-reports" component={SectionCharts} />
                <Route exact path="/dashboard/settings/server-time" render={() => <SectionServerTime loggedInUser={loggedInUser} />} />
                <Route exact path="/dashboard/settings/set-dns" render={() => <SectionDNS loggedInUser={loggedInUser} />} />
                <Route exact path="/dashboard/settings/high-availability" >
                    {
                        hamFeatures && 
                        <SectionHighAvailabilityMaster />
                    }
                    {
                        hasFeatures && 
                        <SectionHighAvailabilitySlave />
                    }
                </Route>
                <Route exact path="/dashboard/settings/transparent" >
                    {
                        transparentFeature && 
                        <SectionTransparent />
                    } 
                </Route>

            </Switch>
        </div>
    )
}

export default Settings;