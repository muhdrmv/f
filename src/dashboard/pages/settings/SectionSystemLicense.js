import React from 'react'
import {Button, Paper} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import {gql, useQuery} from '@apollo/client';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import LicenseOptions from "./SectionSystemLicenseOptions";
import {Link} from "react-router-dom";
import {Autorenew, Refresh} from "@material-ui/icons";

const QUERY_SYSTEM_LICENSE = gql`
query {
  action_mgmt_license_info {
    result
  }
}
`;

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },
}));

const SectionSystemLicense = () => {
    const classes = useStyles();
    const [formState, setFormState] = React.useState();

    const {data} = useQuery(QUERY_SYSTEM_LICENSE);

    React.useEffect(() => {
        console.log(data);
        const licenseInfo = data?.action_mgmt_license_info?.result;
        if (!licenseInfo) return;
        setFormState(s => ({...s, licenseInfo}))
        console.log('license', licenseInfo);
    }, [data]);

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="System License"
                        toolbarIcon={<AssignmentTurnedInIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'}/>

            <LicenseOptions formState={formState}/>

            <center>
                <Button variant="outlined"
                        component={Link} to="/dashboard/settings/system-license/edit"
                        color="primary"
                        size="medium"
                        startIcon={<Refresh/>}
                        style={{margin: 'auto', marginBottom: 20}}>
                    Renew license key
                </Button>
                &nbsp;
                &nbsp;

                {formState?.licenseInfo?.features?.includes('chn') &&
                    <Button disabled={(formState?.licenseInfo?.challengeRemainingDays > 5)}
                            component={Link} to="/dashboard/settings/system-license/challenge"
                            variant="outlined"
                            color="primary"
                            size="medium"
                            startIcon={<Autorenew/>}
                            style={{margin: 'auto', marginBottom: 20}} >
                        { (formState?.daysToChallenge > 5)
                            ?
                            <> Challenge is active ({formState?.licenseInfo?.challengeRemainingDays} days) </>
                            :
                            <> Request challenge code ({formState?.licenseInfo?.challengeRemainingDays} days) </>
                        }
                    </Button>
                }

            </center>

        </Paper>
    )
}

export default SectionSystemLicense