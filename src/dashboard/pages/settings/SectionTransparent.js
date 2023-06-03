import React, {useEffect, useState} from 'react'
import {
    TextField,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    Paper,
    Snackbar,
    Switch,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import BottomToolbar from './BottomToolbar';
import VisibilityIcon from '@material-ui/icons/Visibility';

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

const SectionTransparent = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);

    const [formState, setFormState] = useState({
        transparentModeRDP: false,
        transparentIpAddress : ''
    });

    const {loading, error, data} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);

    const handleTransparentMode = (e) => {
        setFormState(s => ({...s, transparentModeRDP: e.target.checked}));
    }
    const handleChangeTransparentIp = (e) => {
        setFormState(s => ({...s, transparentIpAddress: e.target.value}));
    }

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);

        if(settings?.transparentModeRDP) {
            let mode = false;
            if(settings?.transparentModeRDP === "true") mode = true;
            setFormState(s => ({...s, transparentModeRDP: mode}));
        }
        if(settings?.transparentIpAddress){
            setFormState(s => ({...s, transparentIpAddress: settings?.transparentIpAddress}));
        }
    }, [data]);

    
    const handleFormSubmit = async e => {

        setInProgress(true);
        try {
            await setSystemSetting({
                variables: {
                    name: 'transparentModeRDP',
                    value: JSON.stringify(formState.transparentModeRDP),
                }
            });

            await setSystemSetting({
                variables: {
                    name: 'transparentIpAddress',
                    value: formState.transparentIpAddress,
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
            <TopToolbar toolbarTitle="Transparent Mode"
                        toolbarIcon={<VisibilityIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                        
                    <Grid container spacing={3}>
                        
                        <Grid item md={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Permission to use transparent mode</FormLabel>
                                <FormGroup style={{padding: "1em 2em"}}>
                                    <FormControlLabel
                                        control={<Switch 
                                        checked={formState.transparentModeRDP}
                                        onChange={handleTransparentMode} 
                                        name="haSyncActive"/>}
                                        label="Allows transparent mode to be used for RDP connections"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item lg={4}>
                                <TextField label="Transparent IP Address" type="text"
                                        variant="outlined" fullWidth
                                        onChange={handleChangeTransparentIp}
                                        value={formState?.transparentIpAddress}
                                        helperText="Example: http://192.168.1.10" 
                                    />
                        </Grid>
                        
                    </Grid>
                    <BottomToolbar onClickDone={handleFormSubmit}
                                   inProgress={inProgress}/>
                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionTransparent