import {Button, Grid} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Alert} from "@material-ui/lab";

const DashboardAlert = ({licenseInfo}) => {

    const features = licenseInfo?.action_mgmt_license_info?.result?.features;
    const daysToChallenge = licenseInfo?.action_mgmt_license_info?.result?.challengeRemainingDays;

    const action = <>
        <Button color="inherit" variant="outlined" size="small" component={Link} to="/dashboard/settings/system-license/challenge">
            Go to challenge
        </Button>
    </>

    return <>
        { 
            features?.includes('chn') && daysToChallenge <= 5 && 
            <Grid item xs={12}>
                <Alert severity="warning" variant="filled" action={action}>
                    License challenge is required to keep system working in {daysToChallenge} days. &nbsp; &nbsp;
                </Alert>
            </Grid>
        }

        {
            features?.includes('has') && 
            <Grid item xs={12}>
                <Alert severity="info" variant="filled">
                    Your are using slave server (High Availability).
                </Alert>
            </Grid>
        }
    </>
}

export default DashboardAlert