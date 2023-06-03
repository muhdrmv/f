import React, {useEffect, useRef, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {FormControl, Grid, MenuItem, Paper, Snackbar, TextField} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {useHistory, useParams} from "react-router-dom";
import {gql, useApolloClient, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from '../../shared-components/BottomToolbar';
import ConnectionOptions from "../connections/ConnectionOptions";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import ConnectionCredentials from "./ConnectionCredentials";

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

const QUERY_CONNECTION = gql`
query ($id: uuid!) {
  connections_by_pk(id: $id){
    id
    name
    protocol
    hostname
    meta
    connection_group_connections {
        connection_group_id
    }
  }
}
`;

const INSERT_CONNECTION = gql`
mutation ($name: String!, $protocol: String!, $hostname: String!, $meta: jsonb!, $connection_groups: [connection_group_connection_insert_input!]!) {
  insert_connections(objects: {
      name: $name, 
      protocol: $protocol, 
      hostname: $hostname, 
      meta: $meta,
      connection_group_connections: {data: $connection_groups},
    }) {
    returning {
      id
    }
  }
}
`;

const UPDATE_CONNECTION = gql`
mutation ($name: String!, $protocol: String!, $hostname: String!, $meta: jsonb!, $connection_groups: [connection_group_connection_insert_input!]!, $id: uuid!) {
  update_connections_by_pk(pk_columns: {id: $id}, _set: {
      name: $name, 
      protocol: $protocol, 
      hostname: $hostname, 
      meta: $meta,
    }) {
    id
  }
  delete_connection_group_connection (where: {connection_id: {_eq: $id}}) {
    affected_rows
  }
  insert_connection_group_connection (objects: $connection_groups) {
    affected_rows
  }
}
`;

const QUERY_CONNECTION_GROUPS = gql`
query {
  connection_groups {
    id
    name
  }
}
`;

const ACTION_AUTH_ENCRYPT = gql`
query ($string: String!) {
  action_auth_encrypt(string: $string) {
    result
  }
}
`;

const ConnectionEdit = ({insertMode = false, licenseInfo}) => {
    const classes = useStyles();

    const features = licenseInfo?.action_mgmt_license_info?.result?.features;
    const hasFeatureTtransparentMode = features?.includes('trs');

    const [inProgress, setInProgress] = useState(false);
    const [tags, setTags] = useState([]);
    const [items, setItems] = useState([]);
    const [formState, setFormState] = useState({
        name: '',
        protocol: 'rdp',
        hostname: '',
        meta: {
            port: '',
            isDisabled: false,

            security: 'nla',
            ignoreCert: true,
            enableFontSmoothing: false,
            promptCredentials: false,
            remoteAppProgram: '',
            remoteAppParameters: '',
            remoteAppPath: '',

            credentialsType: 'none',
            credentialsUsername: '',
            credentialsPassword: '',
            credentialsKey: '',
        },
    });
    const cred = useRef({});
    const [validationErrorState, setValidationErrorState] = useState({
        name: false,
        hostname: false,
    });
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });
    const {id} = useParams();

    const handleQueryCompletedGroups = data => {
        const checkboxItems = data.connection_groups.map(i => ({id: i.id, title: i.name}));
        setItems(checkboxItems);
    };

    useQuery(QUERY_CONNECTION_GROUPS, {
        onCompleted: handleQueryCompletedGroups,
    });

    const [queryData, {data}] = useLazyQuery(QUERY_CONNECTION, {
        variables: {id: id},
    });

    useEffect(() => {
        if (!insertMode) {
            queryData();
        }
    }, []);

    useEffect(() => {
        if (data) {
            const conn = data.connections_by_pk;
            const userGroupIds = conn.connection_group_connections.map(i => i.connection_group_id);
            setTags(userGroupIds);
            setFormState(s => ({
                ...s,
                name: conn.name,
                protocol: conn.protocol,
                hostname: conn.hostname,
                meta: {...s.meta, ...conn.meta, credentialsKey: '', credentialsUsername: '', credentialsPassword: ''},
            }));
            cred.current = {...conn.meta};
            setInProgress(false);
        } else {
            !insertMode && setInProgress(true);
        }
    }, [data]);

    const [insertConnection,] = useMutation(INSERT_CONNECTION);
    const [updateConnection,] = useMutation(UPDATE_CONNECTION);

    const gqlClient = useApolloClient();
    const encryptString = async string => {
        const result = await gqlClient.query({query: ACTION_AUTH_ENCRYPT, variables: {string}});
        return result?.data?.action_auth_encrypt?.result;
    }

    const handleChangeName = (e) => {
        setFormState(s => ({...s, name: e.target.value}));
        setValidationErrorState(s => ({...s, name: false}));
    }

    const handleChangeHostname = (e) => {
        setFormState(s => ({...s, hostname: e.target.value}));
        setValidationErrorState(s => ({...s, hostname: false}));
    }

    const handleChangePort = (e) => {
        setFormState(s => ({...s,
            meta: {...s.meta, port: e.target.value}
        }));
    }

    const handleChangeTags = (e, v) => {
        const selectedIds = v.map(i => i.id);
        setTags(selectedIds);
    };

    const handleChangeProtocol = (e) => {
        setFormState(s => ({...s, protocol: e.target.value}));
    }

    const handleChangeMeta = (e) => {
        const name = e.target.name;
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        setFormState(s => ({
            ...s,
            meta: {...s.meta, [name]: value}
        }));
    };

    const history = useHistory();

    const handleFormSubmit = async e => {

        if (formState.name.trim() === '') {
            setValidationErrorState(s => ({...s, name: true}));
            return;
        }

        if (formState.hostname.trim() === '') {
            setValidationErrorState(s => ({...s, hostname: true}));
            return;
        }

        const connectionGroups = tags.map(i => ({connection_id: id, connection_group_id: i}));
        setInProgress(true);
        let meta = {...formState.meta};

        if (meta.credentialsType === 'none') {
            meta = {...meta, credentialsKey: '', credentialsUsername: '', credentialsPassword: ''};
        }
        if (meta.credentialsType === 'usernamePassword') {
            // keep credentials unchanged if fields are blank
            if (meta.credentialsUsername === '' && meta.credentialsPassword === '') {
                const credentialsUsername = cred.current?.credentialsUsername;
                const credentialsPassword = cred.current?.credentialsPassword;
                meta = {...meta, credentialsKey: '', credentialsUsername, credentialsPassword};
            } else {
                const credentialsUsername = await encryptString(meta.credentialsUsername);
                const credentialsPassword = await encryptString(meta.credentialsPassword);
                meta = {...meta, credentialsKey: '', credentialsUsername, credentialsPassword};
            }
        }
        if (meta.credentialsType === 'key') {
            // keep credentials unchanged if fields are blank
            if (meta.credentialsKey === '') {
                const credentialsKey = cred.current?.credentialsKey;
                meta = {...meta, credentialsKey, credentialsUsername: '', credentialsPassword: ''};
            } else {
                const credentialsKey = await encryptString(meta.credentialsKey);
                meta = {...meta, credentialsKey, credentialsUsername: '', credentialsPassword: ''};
            }
        }
        setInProgress(false);

        let mutationResult;
        try {
            if (insertMode)
                mutationResult = await insertConnection({
                    variables: {
                        name: formState.name,
                        protocol: formState.protocol,
                        hostname: formState.hostname,
                        meta: meta,
                        connection_groups: connectionGroups,
                    }
                });
            else
                mutationResult = await updateConnection({
                    variables: {
                        name: formState.name,
                        protocol: formState.protocol,
                        hostname: formState.hostname,
                        meta: meta,
                        connection_groups: connectionGroups,
                        id: id
                    }
                });

            console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
            history.push('/dashboard/connections');
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };



    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={(insertMode ? "Add" : "Edit") + " Connection"}
                            backLinkUrl="/dashboard/connections"
                            onClickDone={handleFormSubmit} inProgress={inProgress}/>

                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>

                        <Grid container spacing={2}>

                            <Grid item xs={6}>
                                <TextField id="name" label="Name" variant="outlined"
                                           onChange={handleChangeName} fullWidth
                                           value={formState.name} error={validationErrorState.name} required/>
                            </Grid>

                            <Grid item xs={6}>
                                <CheckboxesTags id="connectiongroups" label="Connection Groups" placeholder="Group Name"
                                                items={items}
                                                fullWidth selectedIds={tags} onChange={handleChangeTags}/>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    id="protocol"
                                    select
                                    label="Protocol"
                                    value={formState.protocol}
                                    onChange={handleChangeProtocol}
                                    variant="outlined"
                                    fullWidth>
                                    <MenuItem key='rdp' value='rdp'>
                                        RDP
                                    </MenuItem>
                                    <MenuItem key='ssh' value='ssh'>
                                        SSH
                                    </MenuItem>
                                    <MenuItem key='vnc' value='vnc'>
                                        VNC
                                    </MenuItem>
                                    <MenuItem key='telnet' value='telnet'>
                                        TELNET
                                    </MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField id="hostname" label="Hostname" variant="outlined" fullWidth required
                                           onChange={handleChangeHostname} value={formState.hostname}
                                           error={validationErrorState.hostname}/>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField id="port" label="Port Number" variant="outlined" fullWidth
                                           onChange={handleChangePort} value={formState.meta.port}/>
                            </Grid>

                            {(formState.protocol === "rdp") && <>
                                <Grid item xs={12}>
                                    <ConnectionOptions onChange={handleChangeMeta} {...formState.meta} hasFeatureTtransparentMode={hasFeatureTtransparentMode} />
                                </Grid>
                            </>}

                            <Grid item xs={12}>
                                <ConnectionCredentials onChange={handleChangeMeta} {...formState.meta} protocol={formState.protocol} hasFeatureTtransparentMode={hasFeatureTtransparentMode} />
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl component="fieldset">
                                    {/* <FormLabel component="legend">Record session</FormLabel> */}
                                    <FormGroup style={{padding: "1em 2em"}}>
                                        <FormControlLabel
                                            control={<Switch checked={formState.meta.isDisabled} onChange={handleChangeMeta} name="isDisabled"/>}
                                            label="Connection is disabled"
                                        />
                                    </FormGroup>
                                </FormControl>
                            </Grid>

                        </Grid>


                        <BottomToolbar backLinkUrl="/dashboard/connections" onClickDone={handleFormSubmit}
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

export default ConnectionEdit
