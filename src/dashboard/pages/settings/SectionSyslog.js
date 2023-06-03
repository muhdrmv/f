import React, {useState} from 'react'
import {FormLabel, Grid, MenuItem, Paper, Snackbar, TextField} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import AssignmentIcon from "@material-ui/icons/Assignment";


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
  settings (where: {_and: [
    {type: {_eq: "system"}},
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

const SectionSyslog = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const [formState, setFormState] = React.useState({
        syslogProtocol: 'udp',
        syslogAddress: '',
        syslogPort: '',
    });
    const [formStateFT, setFormStateFT] = React.useState({
        syslogProtocol: null,
        syslogAddress: null,
        syslogPort: null,
    });
    const [validationErrorState, setValidationErrorState] = React.useState({
        syslogAddress: false,
        syslogPort: false,
    });

    const {loading, error, data, refetch} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [updateSystemSetting,] = useMutation(UPDATE_SYSTEM_SETTINGS);

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);
        const syslogAddress = settings['syslogAddress'] ?? '';
        const syslogPort = settings['syslogPort'] ?? '';
        const syslogProtocol = settings['syslogProtocol'] ?? 'udp';
        setFormState(s => ({...s, syslogAddress, syslogPort, syslogProtocol}))
        setFormStateFT(s => ({...s, syslogAddress: settings['syslogAddress'] ?? null, syslogPort: settings['syslogPort'] ?? null, syslogProtocol: settings['syslogProtocol'] ?? null}));
    }, [data]);

    const handleChangeField = e => {
        const name = e.target.name;
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        setFormState(s => ({
            ...s, [name]: value
        }));
        const setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
        setValidationErrorState(s => {
            setAll(s, false);
            return s;
        });
    };

    const handleFormSubmitExternalAuthentication = async e => {
        setInProgress(true);

        try {
            if(formState?.syslogProtocol !== '' && !formStateFT?.syslogProtocol){
                await setSystemSetting({
                    variables: {
                        name: 'syslogProtocol',
                        value: formState.syslogProtocol,
                    }
                });
                setFormStateFT(s => ({...s, syslogProtocol: formState.syslogProtocol}));
            }
            if(formState?.syslogAddress !== '' && !formStateFT?.syslogAddress){
                await setSystemSetting({
                    variables: {
                        name: 'syslogAddress',
                        value: formState.syslogAddress,
                    }
                });
                setFormStateFT(s => ({...s, syslogAddress: formState.syslogAddress}));
            }
            if(formState?.syslogPort !== '' && !formStateFT?.syslogPort){
                await setSystemSetting({
                    variables: {
                        name: 'syslogPort',
                        value: formState.syslogPort,
                    }
                });
                setFormStateFT(s => ({...s, syslogPort: formState.syslogPort}));
            }

            if(formState?.syslogProtocol !== formStateFT?.syslogProtocol && formStateFT?.syslogProtocol){
                await updateSystemSetting({
                    variables: {
                        name: 'syslogProtocol',
                        value: formState.syslogProtocol,
                    }
                });
                setFormStateFT(s => ({...s, syslogProtocol: formState.syslogProtocol}));
            }
            if(formState?.syslogAddress !== formStateFT?.syslogAddress && formStateFT?.syslogAddress){
                await updateSystemSetting({
                    variables: {
                        name: 'syslogAddress',
                        value: formState.syslogAddress,
                    }
                });
                setFormStateFT(s => ({...s, syslogAddress: formState.syslogAddress}));
            }
            if(formState?.syslogPort !== formStateFT?.syslogPort && formStateFT?.syslogPort){
                await updateSystemSetting({
                    variables: {
                        name: 'syslogPort',
                        value: formState.syslogPort,
                    }
                });
                setFormStateFT(s => ({...s, syslogPort: formState.syslogPort}));
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
            <TopToolbar toolbarTitle="Syslog Server Configuration"
                        toolbarIcon={<AssignmentIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off"
                      onSubmit={handleFormSubmitExternalAuthentication}>

                    <FormLabel component="legend">
                        System logs will be forwarded to syslog server if address and port provided.
                    </FormLabel>
                    <br />
                    <Grid container spacing={3}>

                        <Grid item xs={4}>
                            <TextField
                                select
                                label="Protocol"
                                name="syslogProtocol"
                                value={formState.syslogProtocol}
                                onChange={handleChangeField}
                                helperText="Transport protocol (UDP/TCP)"
                                variant="outlined"
                                fullWidth>
                                <MenuItem key='udp' value='udp'>
                                    UDP
                                </MenuItem>
                                <MenuItem key='tcp' value='tcp'>
                                    TCP
                                </MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={4}>
                            <TextField label="Server address" type="text"
                                       variant="outlined" fullWidth
                                       onChange={handleChangeField}
                                       name="syslogAddress"
                                       value={formState.syslogAddress}
                                       error={validationErrorState.syslogAddress}
                                       helperText="Example: 192.168.1.10" />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField label="Server port" type="text"
                                       variant="outlined" fullWidth
                                       onChange={handleChangeField}
                                       name="syslogPort"
                                       value={formState.syslogPort}
                                       error={validationErrorState.syslogPort}
                                       helperText="Example: 514" />
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

export default SectionSyslog
