import React, {useState} from 'react'
import {
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    MenuItem,
    Paper,
    Snackbar,
    Switch,
    TextField
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import {changeTimeZone} from "../../../utilities/Utils";

const SET_SYSTEM_SETTINGS = gql`
mutation ($name: String!, $value: String!) {

  delete_settings (where: {_and: [
    {type: {_eq: "system"}},
    {name: {_eq: $name}}
  ]}) {
    affected_rows
  }  
  
  insert_settings_one(object: {
      type: "system", 
      name: $name, 
      value: $value, 
  }) {
    id
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

const SectionHighAvailabilitySlave = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const [formState, setFormState] = React.useState({
        haSyncActive: false,
        haMasterAddress: '',
        haMasterSecret: '',
        haSyncIntervalMinutes: '',
    });
    const [validationErrorState, setValidationErrorState] = React.useState({
        haMasterAddress: false,
        haMasterSecret: false,
        haSyncIntervalMinutes: false,
    });

    const {loading, error, data} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [ haLastSyncAt, setHaLastSyncAt ] = React.useState('');

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);

        try {
            let haLastSyncInt = parseInt(settings?.haLastSyncAt);
            haLastSyncInt = changeTimeZone(haLastSyncInt);
            setHaLastSyncAt(haLastSyncInt);
        } catch (error) {
            setHaLastSyncAt('Never');
        }

        setFormState(s => ({
            ...s, ...settings,
            haSyncActive: settings.haSyncActive === 'true',
        }));
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

    const handleFormSubmit = async e => {
        setInProgress(true);
        try {
            await setSystemSetting({
                variables: {
                    name: 'haSyncActive',
                    value: JSON.stringify(formState.haSyncActive),
                }
            });
            await setSystemSetting({
                variables: {
                    name: 'haMasterAddress',
                    value: formState.haMasterAddress,
                }
            });
            await setSystemSetting({
                variables: {
                    name: 'haMasterSecret',
                    value: formState.haMasterSecret,
                }
            });
            await setSystemSetting({
                variables: {
                    name: 'haSyncIntervalMinutes',
                    value: formState.haSyncIntervalMinutes,
                }
            });
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

    const intervalMinutes = [120, 240, 720, 1440, 2880 ];

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="High Availability (Slave)"
                        toolbarIcon={<AddToQueueIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off"
                      onSubmit={handleFormSubmit}>

                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField label="Master URL Address" type="text"
                                        variant="outlined" fullWidth
                                        onChange={handleChangeField} name="haMasterAddress"
                                        value={formState.haMasterAddress}
                                        error={validationErrorState.haMasterAddress}
                                        helperText="Example: http://192.168.1.10/data-service"/>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField label="Master Secret" type="pwd"
                                    variant="outlined" fullWidth
                                    
                                    onChange={handleChangeField} name="haMasterSecret"
                                    value={formState.haMasterSecret}
                                    error={validationErrorState.haMasterSecret} />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    variant='outlined' label='Sync Interval Minutes' margin="normal" align='left'
                                    value={formState.haSyncIntervalMinutes} 
                                    fullWidth
                                    select
                                    onChange={handleChangeField} name="haSyncIntervalMinutes"
                                    value={formState.haSyncIntervalMinutes}
                                    error={validationErrorState.haSyncIntervalMinutes}
                                >
                                    {
                                        intervalMinutes.map( t => {
                                            return( <MenuItem key={t} value={t.toString()}>{t} Minutes</MenuItem>)
                                        })
                                    }
                                </TextField>
                            </Grid>
                            
                            <Grid item md={6}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">High Availability Sync Activate</FormLabel>
                                    <FormGroup style={{padding: "1em 2em"}}>
                                        <FormControlLabel
                                            control={<Switch checked={formState.haSyncActive}
                                            onChange={handleChangeField} 
                                            name="haSyncActive"/>}
                                            label="Sync Activate"
                                        />
                                    </FormGroup>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider style={{margin: '2em'}} />
                        <p>
                            Last Sync At : <b>{haLastSyncAt}</b> 
                        </p>

                    <BottomToolbar onClickDone={handleFormSubmit}
                                   inProgress={inProgress}/>
                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionHighAvailabilitySlave
