import React, {useState} from 'react'
import {
    FormLabel,
    Grid,
    IconButton,
    Paper,
    Snackbar,
    TextField
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import uuid from 'react-uuid'

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

const SectionHighAvailabilityMaster = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);

    const {loading, error, data} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [ mySecret, setMySecret ] = React.useState('')

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);

        setMySecret(settings?.haMySecret);
    }, [data]);

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="High Availability (Master)"
                        toolbarIcon={<AddToQueueIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off" >
                        
                    <Grid container spacing={3}>
                        
                        <Grid item xs={10}>
                            <TextField label="Master Secret" type="pwd"
                                fullWidth
                                variant="outlined"
                                InputProps={{readOnly: true}} 
                                value={mySecret} />
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton style={{margin:'15px 0px'}} color="primary" 
                                onClick={ () => { 

                                    if ( window.confirm("Warning : \nRegenerating Secret Means That The Old Secret Will No longer Work \nAre You sure?") ) {
                                        const secret = uuid()+uuid();  
                                        setMySecret(secret);  
                                        setSystemSetting({
                                            variables: {
                                                name: 'haMySecret',
                                                value: secret,
                                            }
                                        });
                                    } 
                                }}>
                                    <AutorenewIcon margin='normal' />
                            </IconButton>
                        </Grid>
                        
                    </Grid>

                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionHighAvailabilityMaster
