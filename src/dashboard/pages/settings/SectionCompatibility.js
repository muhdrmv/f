import React from 'react'
import {FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Paper, Switch} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';

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

const SectionCompatibility = ({setSnackbarState}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = React.useState(false);
    const [formState, setFormState] = React.useState({
        useLegacyTunnel: false,
    });

    const {loading, error, data, refetch} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);
        const useLegacyTunnel = (settings?.useLegacyTunnel === 'true');
        setFormState(s => ({...s, useLegacyTunnel}))
    }, [data]);

    const handleChange = (e) => {
        const name = e.target.name;
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        setFormState(s => ({
            ...s, [name]: value
        }));
    };

    const handleFormSubmit = async e => {
        setInProgress(true);
        const {
            useLegacyTunnel,
        } = formState;
        try {
            await setSystemSetting({
                variables: {
                    name: 'useLegacyTunnel',
                    value: useLegacyTunnel.toString(),
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

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Compatibility"
                        toolbarIcon={<SkipPreviousIcon style={{margin: '-4px 8px'}}/>}/>
            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off"
                      onSubmit={handleFormSubmit}>

                    <Grid container spacing={3}>

                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Legacy mode</FormLabel>
                                <FormGroup style={{padding: "1em 2em"}}>
                                    <FormControlLabel
                                        control={<Switch checked={formState.useLegacyTunnel} onChange={handleChange} name="useLegacyTunnel"/>}
                                        label="Use legacy tunnel bridge"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>


                    </Grid>

                    <BottomToolbar onClickDone={handleFormSubmit}
                                   inProgress={inProgress}/>

                </form>
            </div>
        </Paper>
    )
}

export default SectionCompatibility
