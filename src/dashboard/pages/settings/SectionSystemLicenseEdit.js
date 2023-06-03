import React, {useEffect, useState} from 'react'
import {Paper, Snackbar, TextField} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation, useLazyQuery, useQuery} from '@apollo/client';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import {useHistory} from "react-router-dom";

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

const UPDATE_SYSTEM_SETTINGS = gql `
mutation ($name: String!, $value: String!) {
    update_settings(where: {name: {_eq: $name}}, _set: {value: $value})
    {
        affected_rows
    }
}
`;

const INSERT_SYSTEM_SETTINGS = gql`
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

const QUERY_SYSTEM_LICENSE = gql`
query {
  action_mgmt_license_info {
    result
  }
}
`;

const DELETE_EXPIRATION_PAM = gql`
mutation MyMutation {
    delete_settings(where: {type: {_eq: "system"}, name: {_eq: "expiryDateByFeatureEX"}}) {
      affected_rows
    }
}  
`;

const LICENSE_KEY = gql`
query MyQuery {
    settings(where: {name: {_eq: "licenseKey"}}) {
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

const SectionSystemLicenseEdit = () => {

    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const [licenseKey, setLicenseKey] = React.useState('');
    const handleChangeLicenseKey = e => {
        setLicenseKey(e.target.value);
    }
    const [insertSystemSetting,] = useMutation(INSERT_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [updateSystemSetting,] = useMutation(UPDATE_SYSTEM_SETTINGS);
    const history = useHistory();

    const [queryLicenseInfo, {data: licenseInfoData}] = useLazyQuery(QUERY_SYSTEM_LICENSE);
    const {loading, error, data, refetch} = useQuery(LICENSE_KEY, {variables: {}, notifyOnNetworkStatusChange: true});

    const [ previousLicenseKey, setPreviousLicenseKey ] = React.useState(null);
    const [ licenseKeyRepetitive, setLicenseKeyRepetitive ] = React.useState(false);
    
    const [deleteExpirationPAM,] = useMutation(DELETE_EXPIRATION_PAM);

    useEffect( () => {
        if(data){
            setPreviousLicenseKey(data?.settings[0]?.value)
        }
    },[data]);

    useEffect( async () => {

        if(licenseInfoData?.action_mgmt_license_info?.result?.isLicenseValid){
            if(!licenseKeyRepetitive){

                let features = licenseInfoData?.action_mgmt_license_info?.result?.features;
                if(!features?.includes('ex')){
                    const mutationResult = await deleteExpirationPAM();
                }else{

                    let expiryDay = licenseInfoData?.action_mgmt_license_info?.result?.expiryDateByFeatureEX;
                    if(!expiryDay) expiryDay = 2;
                    let expiryDateByFeatureEX = new Date().getTime() + ( parseInt(expiryDay) * 3600 * 24 * 1000);
                    expiryDateByFeatureEX = expiryDateByFeatureEX.toString()

                    const mutationResult = await setSystemSetting({
                        variables: {
                            name: 'expiryDateByFeatureEX',
                            value: expiryDateByFeatureEX,
                        }
                    });
                }
            }

            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
                history.goBack();
            }, 1500);
        }
        
    },[licenseInfoData]);

    const handleFormSubmitLicenseKey = async licenseKey => {

        if (!licenseKey) {
            return;
        }
        setInProgress(true);

        if(licenseKey == previousLicenseKey) setLicenseKeyRepetitive(true);
        else setLicenseKeyRepetitive(false);
        
        try {

            if(data?.settings[0]?.value){
                const mutationResult = await insertSystemSetting({
                    variables: {
                        name: 'licenseKey',
                        value: licenseKey,
                    }
                });
            }else{
                const mutationResult = await updateSystemSetting({
                    variables: {
                        name: 'licenseKey',
                        value: licenseKey,
                    }
                });
            }
            
            queryLicenseInfo();
            
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    return (
    <Paper className={classes.paper}>
        <TopToolbar toolbarTitle="System License Renew"
                    toolbarIcon={<AssignmentTurnedInIcon style={{margin: '-4px 8px'}}/>}
                    backLinkUrl={'/dashboard/settings'} />

        <div className={classes.root}>
            <form className={classes.form} noValidate autoComplete="off">
                <TextField id="license-key" label="License Key" type="text" variant="outlined" fullWidth
                           onChange={handleChangeLicenseKey} name="licenseKey"
                           value={licenseKey}
                           autoFocus={true}/>
                <BottomToolbar onClickDone={() => handleFormSubmitLicenseKey(licenseKey)}
                               inProgress={inProgress}
                               backLinkUrl={'/dashboard/settings'} />
            </form>
        </div>
        <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
    </Paper>
    )
}

export default SectionSystemLicenseEdit
