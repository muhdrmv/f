import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import uuid from 'react-uuid'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {useHistory, useParams} from "react-router-dom";
import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from '../../shared-components/BottomToolbar';
import AccessRuleOptions from "./AccessRuleOptions";
import LimitConfig from './timeConstrain/LimitConfig'; // Marvi
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Switch,FormLabel,FormControl,FormGroup,FormControlLabel} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import {Alert} from "@material-ui/lab";

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

const QUERY_ACCESS_RULE = gql`
query ($id: uuid!) {
  access_rules_by_pk(id: $id){
    id
    name
    meta
    access_rule_users {
      user_id
    }
    access_rule_user_groups {
      user_group_id
    }
    access_rule_connections {
      connection_id
    }
    access_rule_connection_groups {
      connection_group_id
    }
  }
}
`;

const INSERT_ACCESS_RULE = gql`
mutation (
  $name: String!, 
  $meta: jsonb!, 
  $users: [access_rule_user_insert_input!]!  
  $connections: [access_rule_connection_insert_input!]!, 
  $userGroups: [access_rule_user_group_insert_input!]!, 
  $connectionGroups: [access_rule_connection_group_insert_input!]!, 
) {
  insert_access_rules(objects: {
    name: $name, 
    meta: $meta,
    access_rule_users: {data: $users},
    access_rule_connections: {data: $connections}, 
    access_rule_user_groups: {data: $userGroups}, 
    access_rule_connection_groups: {data: $connectionGroups}, 
  }) {
    returning {
      id
    }
  }
}
`;

const UPDATE_ACCESS_RULE = gql`
mutation (
  $name: String!, 
  $meta: jsonb!, 
  $users: [access_rule_user_insert_input!]!  
  $connections: [access_rule_connection_insert_input!]!, 
  $userGroups: [access_rule_user_group_insert_input!]!, 
  $connectionGroups: [access_rule_connection_group_insert_input!]!, 
  $id: uuid!,
) {
  update_access_rules_by_pk(pk_columns: {id: $id}, _set: {
    name: $name, 
    meta: $meta,
  }) {
    id
  }
  
  delete_access_rule_user (where: {access_rule_id: {_eq: $id}}) {
    affected_rows
  }
  delete_access_rule_connection (where: {access_rule_id: {_eq: $id}}) {
    affected_rows
  }
  delete_access_rule_user_group (where: {access_rule_id: {_eq: $id}}) {
    affected_rows
  }
  delete_access_rule_connection_group (where: {access_rule_id: {_eq: $id}}) {
    affected_rows
  }
  
  insert_access_rule_user(objects: $users) {
    affected_rows
  }  
  insert_access_rule_connection(objects: $connections) {
    affected_rows
  }
  insert_access_rule_user_group(objects: $userGroups) {
    affected_rows
  }  
  insert_access_rule_connection_group(objects: $connectionGroups) {
    affected_rows
  }
}
`;

const QUERY_USERS_CONNECTIONS_USER_GROUPS_CONNECTION_GROUPS = gql`
query {
  users {
    id
    username
  }
  connections {
    id
    name
  }
  user_groups {
    id
    name
  }
  connection_groups {
    id
    name
  }
}
`;

const TRANSPARENT_QUERY_USERS_CONNECTIONS_USER_GROUPS_CONNECTION_GROUPS = gql`
query {
  users {
    id
    username
  }
  connections (where: {protocol: {_eq: "rdp"}}){
    id
    name
  }
  user_groups {
    id
    name
  }
  connection_groups(where: {connection_group_connections: {connection: {protocol: {_eq: "rdp"}}}}){
    id
    name
  }
}
`;

const AccessRuleEdit = ({insertMode = false, licenseInfo}) => {

    // Marvi
    const [ dailyLimits, setDailyLimits ] = React.useState({
        data: []
    });
    
    const [ dateLimits, setDateLimits ] = React.useState({
        data: [
            {
                id: uuid(),
                startDate: null,
                finishDate: null,
                errorFrom: false,
                errorTo: false
            }
        ]
    });
    
    const [ maximumSessionDuration, setMaximumSessionDuration ] = React.useState('');
    // Marvi

    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);

    const [items, setItems] = useState({
        users: [],
        userGroups: [],
        connections: [],
        connectionGroups: [],
    });

    const [formState, setFormState] = useState({
        transparentMode: false,
        name: '',
        meta: {
            canUpload: false,
            canDownload: false,
            canCopy: false,
            canPaste: false,
            record: true,
            excludeKeystrokes: true,
            dateLimits: [],
            dailyLimits: [],
            maximumSessionDuration: ''
        },
        users: [],
        userGroups: [],
        connections: [],
        connectionGroups: [],
    });

    const [validationErrorState, setValidationErrorState] = useState({
        name: false,
        dateLimit: false,
        timeLimit: false
    });

    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });

    const {id} = useParams();

    const handleErrorDate = (err) => {
        setValidationErrorState(s => ({...s, dateLimit: err}));
    }

    const [transparentQueryGroup, TQGoutput] = useLazyQuery(TRANSPARENT_QUERY_USERS_CONNECTIONS_USER_GROUPS_CONNECTION_GROUPS);
    const [NoneTransparentQueryGroupNTQGoutput, NTQGoutput] = useLazyQuery(QUERY_USERS_CONNECTIONS_USER_GROUPS_CONNECTION_GROUPS);

    useEffect( () => {
        if(formState.transparentMode){
            transparentQueryGroup();
        }else{
            NoneTransparentQueryGroupNTQGoutput();
        }
    },[formState.transparentMode])

    useEffect( () => {
        if(TQGoutput?.data) handleQueryCompletedGroups(TQGoutput?.data)
    },[TQGoutput])

    useEffect( () => {
        if(NTQGoutput?.data) handleQueryCompletedGroups(NTQGoutput?.data)
    },[NTQGoutput])

    const handleQueryCompletedGroups = (data) => {
        
        const connections = data.connections.map(i => ({id: i.id, title: i.name}));
        const users = data.users.map(i => ({id: i.id, title: i.username}));
        const userGroups = data.user_groups.map(i => ({id: i.id, title: i.name}));
        const connectionGroups = data.connection_groups.map(i => ({id: i.id, title: i.name}));
        setItems({users, userGroups, connections, connectionGroups});
    };


    const [queryData, {data}] = useLazyQuery(QUERY_ACCESS_RULE, {
        variables: {id: id},
    });

    useEffect(() => {   
        if (!insertMode) {
            queryData();
        }
    }, [insertMode, queryData]);

    useEffect(() => {
        if (data) {
            const ar = data.access_rules_by_pk;
            const name = ar.name;
            const meta = ar.meta;
            const users = ar.access_rule_users.map(i => i.user_id);
            const userGroups = ar.access_rule_user_groups.map(i => i.user_group_id);
            const connections = ar.access_rule_connections.map(i => i.connection_id);
            const connectionGroups = ar.access_rule_connection_groups.map(i => i.connection_group_id);
            let transparentMode = meta?.transparentMode ? meta?.transparentMode : false
            setFormState({transparentMode, name, meta, users, userGroups, connections, connectionGroups});
            setInProgress(false);

            // Marvi
            if( meta?.dailyLimits?.length > 0 ){
                setDailyLimits( () => {
                    let newData = meta.dailyLimits;
                    let newState = {
                        data: newData
                    }
                    return newState
                })  
            }
            if( meta?.dateLimits?.length > 0 ){
                setDateLimits( () => {
                    let newData = meta.dateLimits;
                    let newState = {
                        data: newData
                    }
                    return newState
                })
            }
            if( meta.maximumSessionDuration !== '' ){
                setMaximumSessionDuration(meta.maximumSessionDuration)
            }
            //Marvi

        } else {
            !insertMode && setInProgress(true);
        }
        
    }, [data, insertMode]);


    const [insertAccessRule,] = useMutation(INSERT_ACCESS_RULE);
    const [updateAccessRule,] = useMutation(UPDATE_ACCESS_RULE);

    const handleTransparentMode = (e) => {
        if(insertMode) setFormState(s => ({...s, transparentMode: e.target.checked}));
        else alert("You cannot change the transparent mode when editing access rules") 
    }

    const handleChangeName = (e) => {
        setFormState(s => ({...s, name: e.target.value}));
        setValidationErrorState(s => ({...s, name: false}));
    }

    const handleChangeTagsUsers = (e, v) => {
        const users = v.map(i => i.id);
        setFormState(s => ({...s, users}));
    };
    const handleChangeTagsUserGroups = (e, v) => {
        const userGroups = v.map(i => i.id);
        setFormState(s => ({...s, userGroups}));
    };
    const handleChangeTagsConnections = (e, v) => {
        const connections = v.map(i => i.id);
        setFormState(s => ({...s, connections}));
    };
    const handleChangeTagsConnectionGroups = (e, v) => {
        const connectionGroups = v.map(i => i.id);
        setFormState(s => ({...s, connectionGroups}));
    };

    const handleChangeOptions = (e) => {
        setFormState(s => ({
            ...s,
            meta: {...s.meta, [e.target.name]: e.target.checked}
        }));
    };
    // Marvi
    const handleErrorTime = () => {
        let err = false;
        if(dailyLimits.data.length > 0){
            if( dailyLimits.data[dailyLimits.data.length - 1].day === '' ){
                err = true;
                setDailyLimits( (s) => {
                    s.data[s.data.length - 1].errorDay = true; 
                    let newObject = s.data;
                    let newState = {
                        data: newObject
                    }
                    return newState;
                })
            }
            if(dailyLimits.data[dailyLimits.data.length - 1].errorTime) err = true
        }
        return err;
    }
    // Marvi

    const history = useHistory();
    
    const handleFormSubmit = async e => {

        if (formState.name.trim() === '') {
            setValidationErrorState(s => ({...s, name: true}));
            return;
        }

        // Marvi
        if( validationErrorState.dateLimit ) return;

        let res = handleErrorTime()
        if(res) return;
        // Marvi

        const name = formState.name;
        const meta = formState.meta;
        const users = formState.users.map(i => ({access_rule_id: id, user_id: i}));
        const userGroups = formState.userGroups.map(i => ({access_rule_id: id, user_group_id: i}));
        const connections = formState.connections.map(i => ({access_rule_id: id, connection_id: i}));
        const connectionGroups = formState.connectionGroups.map(i => ({access_rule_id: id, connection_group_id: i}));

        // Marvi
        meta.dailyLimits = dailyLimits.data
        meta.dateLimits = dateLimits.data
        meta.maximumSessionDuration = maximumSessionDuration
        meta.transparentMode = formState.transparentMode
        // Marvi
        
        setInProgress(true);
        let mutationResult;
        try {
            if (insertMode)
                mutationResult = await insertAccessRule({
                    variables: {
                        name,
                        meta,
                        users,
                        userGroups,
                        connections,
                        connectionGroups,
                    }
                });
            else
                mutationResult = await updateAccessRule({
                    variables: {
                        name,
                        meta,
                        users,
                        userGroups,
                        connections,
                        connectionGroups,
                        id,
                    }
                });

            // console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
            history.push(history?.location?.state?.backUrl ?? "/dashboard/access-rules");
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    const features = licenseInfo?.action_mgmt_license_info?.result?.features;
    const hasFeatureTimeConstrains = features?.includes('tc');
    const hasFeatureTtransparentMode = features?.includes('trs');

    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={(insertMode ? "Add" : "Edit") + " Access Rule"}
                            backLinkUrl={history?.location?.state?.backUrl ?? "/dashboard/access-rules"}
                            onClickDone={handleFormSubmit} inProgress={inProgress}/>

                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>

                        <Grid container spacing={3}>
                            {
                                hasFeatureTtransparentMode &&
                                <>
                                    <Grid item md={12}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Transparent Mode</FormLabel>
                                            <FormGroup style={{padding: "1em 2em"}}>
                                                <FormControlLabel
                                                    control={<Switch checked={formState.transparentMode} onChange={handleTransparentMode} name="transparentMode"/>}
                                                    label="Connections are imported through transparent mode"
                                                />
                                            </FormGroup>
                                        </FormControl>
                                    </Grid> 

                                    <Divider />
                                </>
                            }

                            {
                                !hasFeatureTtransparentMode && !insertMode &&
                                <>
                                    <Grid item md={12}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Transparent Mode</FormLabel>
                                            <FormGroup style={{padding: "1em 2em"}}>
                                                <FormControlLabel
                                                    control={<Switch checked={formState.transparentMode} onChange={handleTransparentMode} name="transparentMode"/>}
                                                    label="Connections are imported through transparent mode"
                                                />
                                            </FormGroup>
                                        </FormControl>
                                    </Grid> 

                                    <Divider />
                                </>
                            }


                            <Grid item xs={8}>
                                <TextField id="name" label="Name" variant="outlined"
                                           onChange={handleChangeName} fullWidth
                                           value={formState.name} error={validationErrorState.name}
                                           required/>
                            </Grid>

                            <Grid item sm={6}>
                                <CheckboxesTags id="users" label="Users" placeholder="Username" fullWidth
                                                items={items.users} selectedIds={formState.users}
                                                onChange={handleChangeTagsUsers}/>
                            </Grid>

                            <Grid item sm={6}>
                                <CheckboxesTags id="connections" label="Connections" placeholder="Connection Name"
                                                fullWidth
                                                items={items.connections} selectedIds={formState.connections}
                                                onChange={handleChangeTagsConnections}/>
                            </Grid>

                            <Grid item sm={6}>
                                <CheckboxesTags id="user-groups" label="User Groups" placeholder="User Group Name"
                                                fullWidth
                                                items={items.userGroups} selectedIds={formState.userGroups}
                                                onChange={handleChangeTagsUserGroups}/>
                            </Grid>

                            <Grid item sm={6}>
                                <CheckboxesTags id="connection-groups" label="Connection Groups"
                                                placeholder="Connection Group Name" fullWidth
                                                items={items.connectionGroups} selectedIds={formState.connectionGroups}
                                                onChange={handleChangeTagsConnectionGroups}/>
                            </Grid>
                            {!formState.transparentMode &&
                                <Grid item xs={12}>
                                    <AccessRuleOptions 
                                                    transparentMode = {formState.transparentMode}
                                                    onChange={handleChangeOptions}
                                                    canUpload={formState.meta.canUpload}
                                                    canDownload={formState.meta.canDownload}
                                                    canCopy={formState.meta.canCopy}
                                                    canPaste={formState.meta.canPaste}
                                                        record={formState.meta.record}
                                                    excludeKeystrokes={formState.meta.excludeKeystrokes}/>
                                </Grid>
                            }
                            {/* Marvi */}
                            {hasFeatureTimeConstrains &&
                                <Grid item md={12} lg={12} sm={12}>
                                    <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                            >
                                            <Typography >Time Constraints</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <LimitConfig
                                                dailyLimits={dailyLimits}
                                                setDailyLimits={setDailyLimits}
                                                dateLimits={dateLimits}
                                                setDateLimits={setDateLimits}
                                                maximumSessionDuration={maximumSessionDuration}
                                                setMaximumSessionDuration={setMaximumSessionDuration}
                                                handleErrorDate={handleErrorDate}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            }
                            {/* Marvi */}

                        </Grid>

                        <BottomToolbar backLinkUrl="/dashboard/access-rules" onClickDone={handleFormSubmit}
                                       inProgress={inProgress}/>

                    </form>
                </div>
            </Paper>

            <Snackbar
                open={snackbarState.isOpen}
                // onClose={handleSnackbarClose}
                // TransitionComponent={(<Slide direction="up" />)}
                message={snackbarState.message}
                // key={SlideTransition.name}
            />
        </div>
    )
}

export default AccessRuleEdit

