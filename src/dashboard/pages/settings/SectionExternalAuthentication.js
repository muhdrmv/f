import React, {useState} from 'react'
import {Divider, FormLabel, Grid, Paper, Snackbar, TextField} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

const SET_SYSTEM_SETTINGS = gql`
mutation ($name: String!, $value: String!) {
  insert_settings_one(object: {
      type: "system", 
      name: $name, 
      value: $value, 
  }) {
    id
  }
}
`;
const UPDATE_SYSTEM_SETTINGS = gql `
mutation ($name: String!, $value: String!) {
    update_settings(where: {name: {_eq: $name}}, _set: {value: $value})
    {
        affected_rows
    }
}
`;

const QUERY_SYSTEM_SETTINGS = gql`
query {
  settings (where: {_or: [
    {name: {_eq: "externalAuthenticationAddress"}}, 
    {name: {_eq: "externalAuthenticationDefaultDomain"}}, 
    {name: {_eq: "authenticationUnsuccessfulTiresToLockUser"}},
    {name: {_eq: "authenticationMinutesToKeepUserLocked"}},
    {name: {_eq: "authenticationMinutesOfInactivityToSignOut"}},
    {name: {_eq: "authenticationAllowUsersToEnable2FA"}},
  ]}) {
    name
    value
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
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },

}));

const SectionExternalAuthentication = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const [formState, setFormState] = React.useState({
        externalAuthenticationAddress: '',
        externalAuthenticationDefaultDomain: '',
        authenticationUnsuccessfulTiresToLockUser: '',
        authenticationMinutesToKeepUserLocked: '',
        authenticationMinutesOfInactivityToSignOut: '',
        authenticationAllowUsersToEnable2FA: false,
    });

    const [formStateFromDB, setFormStateFromDB] = React.useState({
        externalAuthenticationAddress: null,
        externalAuthenticationDefaultDomain: null,
        authenticationUnsuccessfulTiresToLockUser: null,
        authenticationMinutesToKeepUserLocked: null,
        authenticationMinutesOfInactivityToSignOut: null,
        authenticationAllowUsersToEnable2FA: null,
    });
    const [validationErrorState, setValidationErrorState] = React.useState({
        externalAuthenticationAddress: false,
        externalAuthenticationDefaultDomain: false,
        authenticationUnsuccessfulTiresToLockUser: false,
        authenticationMinutesToKeepUserLocked: false,
        authenticationMinutesOfInactivityToSignOut: false
    });

    const {loading, error, data} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [updateSystemSetting,] = useMutation(UPDATE_SYSTEM_SETTINGS);

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);
        setFormState(s => ({
            ...s, ...settings,
            authenticationAllowUsersToEnable2FA: settings.authenticationAllowUsersToEnable2FA === 'true',
        }));
        setFormStateFromDB(s => ({
            ...s, ...settings,
        }));
    }, [data]);

    const handleChangeField = e => {
        const name = e.target.name;
        let value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        if(name == 'authenticationUnsuccessfulTiresToLockUser' ) {
            if (value == '') value = 1;
            else if(value < 1) value = 1;
            else if(value > 10) value = 10;
        }

        if(name == 'authenticationMinutesToKeepUserLocked') {
            if (value == '') value = 1;
            else if(value < 1) value = 1;
            else if(value > 24*60) value = 24*60;
        }

        if(name == 'authenticationMinutesOfInactivityToSignOut') {
            if (value == '') value = 3;
            else if(value < 3) value = 3;
            else if(value > 120) value = 120;
        }
        setFormState(s => ({
            ...s, [name]: value
        }));
    };

    const handleFormSubmitExternalAuthentication = async e => {
        setInProgress(true);
        try {
            if( formState?.externalAuthenticationAddress !== '' && formState?.externalAuthenticationAddress !== formStateFromDB?.externalAuthenticationAddress  && !formStateFromDB?.externalAuthenticationAddress){
                await setSystemSetting({
                    variables: {
                        name: 'externalAuthenticationAddress',
                        value: formState.externalAuthenticationAddress,
                    }
                });
            }
            if( formState?.externalAuthenticationDefaultDomain !== '' && formState?.externalAuthenticationDefaultDomain !== formStateFromDB?.externalAuthenticationDefaultDomain  && !formStateFromDB?.externalAuthenticationDefaultDomain){
                await setSystemSetting({
                    variables: {
                        name: 'externalAuthenticationDefaultDomain',
                        value: formState.externalAuthenticationDefaultDomain,
                    }
                });
            }
            if( formState?.authenticationUnsuccessfulTiresToLockUser !== '' && formState?.authenticationUnsuccessfulTiresToLockUser !== formStateFromDB?.authenticationUnsuccessfulTiresToLockUser  && !formStateFromDB?.authenticationUnsuccessfulTiresToLockUser){
                await setSystemSetting({
                    variables: {
                        name: 'authenticationUnsuccessfulTiresToLockUser',
                        value: formState.authenticationUnsuccessfulTiresToLockUser.toString(),
                    }
                });
            }
            if( formState?.authenticationMinutesToKeepUserLocked !== '' && formState?.authenticationMinutesToKeepUserLocked !== formStateFromDB?.authenticationMinutesToKeepUserLocked  && !formStateFromDB?.authenticationMinutesToKeepUserLocked){
                await setSystemSetting({
                    variables: {
                        name: 'authenticationMinutesToKeepUserLocked',
                        value: formState.authenticationMinutesToKeepUserLocked.toString(),
                    }
                });
            }
            if( formState?.authenticationMinutesOfInactivityToSignOut !== '' && formState?.authenticationMinutesOfInactivityToSignOut !== formStateFromDB?.authenticationMinutesOfInactivityToSignOut  && !formStateFromDB?.authenticationMinutesOfInactivityToSignOut){
                await setSystemSetting({
                    variables: {
                        name: 'authenticationMinutesOfInactivityToSignOut',
                        value: formState.authenticationMinutesOfInactivityToSignOut.toString(),
                    }
                });
            }
            if( formState?.authenticationAllowUsersToEnable2FA  && formState?.authenticationAllowUsersToEnable2FA !== formStateFromDB?.authenticationAllowUsersToEnable2FA  && !formStateFromDB?.authenticationAllowUsersToEnable2FA){
                await setSystemSetting({
                    variables: {
                        name: 'authenticationAllowUsersToEnable2FA',
                        value: formState.authenticationAllowUsersToEnable2FA ? 'true' : 'false',
                    }
                });
            }
            
            // Edit bellow
            if( formState?.externalAuthenticationAddress !== formStateFromDB?.externalAuthenticationAddress  && formStateFromDB?.externalAuthenticationAddress){
                await updateSystemSetting({
                    variables: {
                        name: 'externalAuthenticationAddress',
                        value: formState.externalAuthenticationAddress,
                    }
                });
            }
            if( formState?.externalAuthenticationDefaultDomain !== formStateFromDB?.externalAuthenticationDefaultDomain  && formStateFromDB?.externalAuthenticationDefaultDomain){
                await updateSystemSetting({
                    variables: {
                        name: 'externalAuthenticationDefaultDomain',
                        value: formState.externalAuthenticationDefaultDomain,
                    }
                });
            }
            if( formState?.authenticationUnsuccessfulTiresToLockUser !== formStateFromDB?.authenticationUnsuccessfulTiresToLockUser  && formStateFromDB?.authenticationUnsuccessfulTiresToLockUser){
                await updateSystemSetting({
                    variables: {
                        name: 'authenticationUnsuccessfulTiresToLockUser',
                        value: formState.authenticationUnsuccessfulTiresToLockUser.toString(),
                    }
                });
            }
            if( formState?.authenticationMinutesToKeepUserLocked !== formStateFromDB?.authenticationMinutesToKeepUserLocked  && formStateFromDB?.authenticationMinutesToKeepUserLocked){
                await updateSystemSetting({
                    variables: {
                        name: 'authenticationMinutesToKeepUserLocked',
                        value: formState.authenticationMinutesToKeepUserLocked.toString(),
                    }
                });
            }
            if( formState?.authenticationMinutesOfInactivityToSignOut !== formStateFromDB?.authenticationMinutesOfInactivityToSignOut  && formStateFromDB?.authenticationMinutesOfInactivityToSignOut){
                await updateSystemSetting({
                    variables: {
                        name: 'authenticationMinutesOfInactivityToSignOut',
                        value: formState.authenticationMinutesOfInactivityToSignOut.toString(),
                    }
                });
            }
            if( formState?.authenticationAllowUsersToEnable2FA !== formStateFromDB?.authenticationAllowUsersToEnable2FA  && formStateFromDB?.authenticationAllowUsersToEnable2FA){
                await updateSystemSetting({
                    variables: {
                        name: 'authenticationAllowUsersToEnable2FA',
                        value: formState.authenticationAllowUsersToEnable2FA ? 'true' : 'false',
                    }
                });
            }
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Authentication"
                        toolbarIcon={<FingerprintIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off"
                      onSubmit={handleFormSubmitExternalAuthentication}>

                    <FormLabel component="legend">External authentication</FormLabel>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField id="external-auth-address" label="Active Directory / LDAP URL" type="text"
                                       variant="outlined" fullWidth
                                       onChange={handleChangeField} name="externalAuthenticationAddress"
                                       value={formState.externalAuthenticationAddress}
                                       error={validationErrorState.externalAuthenticationAddress}
                                       helperText="Example: LDAP://192.168.1.10/"/>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField id="external-auth-default-domain" label="Default domain" type="text"
                                       variant="outlined" fullWidth
                                       onChange={handleChangeField} name="externalAuthenticationDefaultDomain"
                                       value={formState.externalAuthenticationDefaultDomain}
                                       error={validationErrorState.externalAuthenticationDefaultDomain}
                                       helperText="Username will be transformed to username@domain. Example: company.local"/>
                        </Grid>
                    </Grid>

                    <Divider style={{margin: '2em'}} />
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormLabel component="legend">Security policy</FormLabel>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField id="authenticationUnsuccessfulTiresToLockUser" label="Unsuccessful tries to lock user"
                                       variant="outlined" fullWidth type="number" InputProps={{ inputProps: { min: 1, max: 10 } }}
                                       onChange={handleChangeField} name="authenticationUnsuccessfulTiresToLockUser"
                                       error={validationErrorState.authenticationUnsuccessfulTiresToLockUser}
                                       value={
                                        formState.authenticationUnsuccessfulTiresToLockUser === ""
                                        ? formState.authenticationUnsuccessfulTiresToLockUser
                                        : parseInt(formState.authenticationUnsuccessfulTiresToLockUser)
                                   } />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField id="authenticationMinutesToKeepUserLocked" label="Minutes to keep user locked"
                                       variant="outlined" fullWidth type="number" InputProps={{ inputProps: { min: 1, max: 24*60 } }}
                                       onChange={handleChangeField} name="authenticationMinutesToKeepUserLocked"
                                       error={validationErrorState.authenticationMinutesToKeepUserLocked}
                                       value={
                                            formState.authenticationMinutesToKeepUserLocked === ""
                                            ? formState.authenticationMinutesToKeepUserLocked
                                            : parseInt(formState.authenticationMinutesToKeepUserLocked)
                                       } />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField id="authenticationMinutesOfInactivityToSignOut" label="Minutes of inactivity to sign out" 
                                       variant="outlined" fullWidth type="number" InputProps={{ inputProps: { min: 3, max: 120 } }}
                                       onChange={handleChangeField} name="authenticationMinutesOfInactivityToSignOut"
                                       error={validationErrorState.authenticationMinutesOfInactivityToSignOut}
                                       value={
                                            formState.authenticationMinutesOfInactivityToSignOut === ""
                                            ? formState.authenticationMinutesOfInactivityToSignOut
                                            : parseInt(formState.authenticationMinutesOfInactivityToSignOut)
                                       } />
                        </Grid>

                        <Grid item xs={12}>
                            <FormGroup style={{padding: "1em 2em"}}>
                                <FormControlLabel
                                    control={<Switch checked={formState.authenticationAllowUsersToEnable2FA}  name="authenticationAllowUsersToEnable2FA"/>}
                                    label="Allow users to enable two factor authentication (2FA using authenticator apps)" onChange={handleChangeField}
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <BottomToolbar onClickDone={handleFormSubmitExternalAuthentication}
                                   inProgress={inProgress}/>
                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionExternalAuthentication
