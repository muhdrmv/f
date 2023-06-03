import React, {useEffect, useState} from 'react'
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import {TextField} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {useHistory, useParams} from "react-router-dom";
import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import Snackbar from '@material-ui/core/Snackbar';
import BottomToolbar from '../../shared-components/BottomToolbar';

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

const QUERY_CONNECTION_GROUP = gql`
query ($id: uuid!) {
  connection_groups_by_pk(id: $id){
    id
    name
    description
    connection_group_connections {
        connection_id
    }
  }
}
`;

const INSERT_CONNECTION_GROUP = gql`
mutation ($name: String!, $description: String!, $connections: [connection_group_connection_insert_input!]!) {
  insert_connection_groups(objects: {
      name: $name, 
      description: $description, 
      connection_group_connections: {data: $connections},
    }) {
    returning {
      id
    }
  }
}
`;

const UPDATE_CONNECTION_GROUP = gql`
mutation ($name: String!, $description: String!, $connections: [connection_group_connection_insert_input!]!, $id: uuid!) {
  update_connection_groups_by_pk(pk_columns: {id: $id}, _set: {
      name: $name, 
      description: $description,
    }) {
    id
  }
  delete_connection_group_connection (where: {connection_group_id: {_eq: $id}}) {
    affected_rows
  }
  insert_connection_group_connection (objects: $connections) {
    affected_rows
  }
}
`;

const GET_CONNECTIONS = gql`
query {
  connections {
    id
    name
  }
}
`;

const ConnectionGroupEdit = ({insertMode = false}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [items, setItems] = useState([]);
    const [validationError, setValidationError] = useState(false);
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });
    const {id} = useParams();

    const handleQueryCompletedConnections = data => {
        const checkboxItems = data.connections.map(connection => ({id: connection.id, title: connection.name}));
        setItems(checkboxItems);
    };

    const [queryData, { data }] = useLazyQuery(QUERY_CONNECTION_GROUP, {
        variables: {id: id},
    });

    useEffect(() => {
        if (!insertMode) {
            queryData();
        }
    }, []);

    useEffect(()=>{
        if (data) {
            const connectionGroup = data.connection_groups_by_pk;
            setName(connectionGroup.name);
            setDescription(connectionGroup.description);
            const connectionIds = connectionGroup.connection_group_connections.map( i => i.connection_id );
            setTags(connectionIds);
            setInProgress(false);
        } else {
            !insertMode && setInProgress(true);
        }
    }, [data]);

    
    useQuery(GET_CONNECTIONS, {
        onCompleted: handleQueryCompletedConnections,
    });

    const [insertConnectionGroup,] = useMutation(INSERT_CONNECTION_GROUP);
    const [updateConnectionGroup,] = useMutation(UPDATE_CONNECTION_GROUP);

    const handleChangeName = (e) => {
        setName(e.target.value);
        setValidationError(false);
    }

    const handleChangeDescription = (e) => {
        setDescription(e.target.value);
    }

    const handleChangeTags = (e, v) => {
        console.log(v);
        const selectedIds = v.map(i=>i.id);
        setTags(selectedIds);
    };

    const history = useHistory();

    const handleFormSubmit = async e => {

        if (name.trim() === '') {
            setValidationError(true);
            return;
        }

        setInProgress(true);
        let mutationResult;
        const connectionIds = tags.map( i => ({connection_id: i, connection_group_id: id}) );
        try {
            if (insertMode)
                mutationResult = await insertConnectionGroup({variables: {name: name, description: description, connections: connectionIds}});
            else
                mutationResult = await updateConnectionGroup({variables: {name: name, description: description, connections: connectionIds, id:id}});

            console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(()=>{
                setSnackbarState( s => ({...s, isOpen: false}) );
            }, 1000);
            history.push('/dashboard/connection-groups');
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };


    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={ (insertMode ? "Add" : "Edit") + " Connection Group" } backLinkUrl="/dashboard/connection-groups"
                    onClickDone={handleFormSubmit} inProgress={inProgress} />

                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>

                        <TextField id="name" label="Group Name" variant="outlined" onChange={handleChangeName} fullWidth 
                                value={name}  error={validationError} required />

                        <TextField id="description" label="Description" variant="outlined" fullWidth 
                                onChange={handleChangeDescription}
                                value={description}/>

                        <CheckboxesTags id="connections" label="Connections" placeholder="Connectionname" items={items} fullWidth 
                                        selectedIds={tags} onChange={handleChangeTags} />

                        
                        <BottomToolbar backLinkUrl="/dashboard/connection-groups" onClickDone={handleFormSubmit} inProgress={inProgress} />

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

export default ConnectionGroupEdit
